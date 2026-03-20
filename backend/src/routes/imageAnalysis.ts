import Anthropic from '@anthropic-ai/sdk';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { authenticateToken } from '../middlewares/auth';
import { logger } from '../utils/logger';

import type { Request, Response } from 'express';

const router = Router();

function isAllowedImageHost(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.hostname === 'sdamgia.ru' || url.hostname.endsWith('.sdamgia.ru');
  } catch {
    return false;
  }
}

let anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

const imageAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Слишком много запросов, попробуйте позже' },
});

interface CoordinatePoint {
  label: string;
  value: number;
}

interface AnalysisResponse {
  success: boolean;
  points: CoordinatePoint[];
  range: [number, number];
  error?: string;
}

const analysisCache = new Map<string, { result: AnalysisResponse; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCachedResult(cacheKey: string): AnalysisResponse | null {
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }
  if (cached) {
    analysisCache.delete(cacheKey);
  }
  return null;
}

function setCachedResult(cacheKey: string, result: AnalysisResponse): void {
  if (analysisCache.size > 500) {
    const oldestKey = analysisCache.keys().next().value as string;
    analysisCache.delete(oldestKey);
  }
  analysisCache.set(cacheKey, { result, timestamp: Date.now() });
}

router.post(
  '/coordinate-points',
  authenticateToken,
  imageAnalysisLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageUrl, questionText } = req.body as {
        imageUrl?: string;
        questionText?: string;
      };

      if (!imageUrl || typeof imageUrl !== 'string') {
        res.status(400).json({
          success: false,
          points: [],
          range: [-5, 7],
          error: 'imageUrl is required',
        });
        return;
      }

      if (!isAllowedImageHost(imageUrl)) {
        res.status(400).json({
          success: false,
          points: [],
          range: [-5, 7],
          error: 'Only sdamgia.ru image URLs are allowed',
        });
        return;
      }

      const cacheKey = `${imageUrl}|${questionText || ''}`;
      const cached = getCachedResult(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const client = getAnthropicClient();
      if (!client) {
        logger.warn('ANTHROPIC_API_KEY not configured, returning empty result');
        const emptyResult: AnalysisResponse = {
          success: true,
          points: [],
          range: [-5, 7],
        };
        res.json(emptyResult);
        return;
      }

      const contextHint = questionText
        ? `\n\nДополнительный контекст из условия задачи:\n${questionText.replace(/<[^>]+>/g, ' ').substring(0, 500)}`
        : '';

      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl,
                },
              },
              {
                type: 'text',
                text: `Посмотри на это изображение координатной прямой из математической задачи.

Извлеки ВСЕ обозначенные точки на координатной прямой. Для каждой точки определи:
1. Букву/метку точки (например: A, B, C, D, M, N и т.д.)
2. Числовое значение координаты этой точки (определи по положению точки на прямой относительно делений)

Также определи диапазон числовой прямой (минимальное и максимальное значение делений).

ВАЖНО:
- Если точка стоит между двумя делениями, оцени значение пропорционально.
- Десятичные дроби записывай через точку (например: 2.5, -3.7)
- Если на изображении НЕТ координатной прямой или точек, верни пустой массив.
${contextHint}

Ответь ТОЛЬКО в формате JSON (без markdown, без пояснений):
{"points": [{"label": "A", "value": 2.5}, {"label": "B", "value": -1}], "range": [-5, 7]}`,
              },
            ],
          },
        ],
      });

      // Extract text response
      const textBlock = message.content.find((b) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        logger.error('No text response from Claude Vision');
        const emptyResult: AnalysisResponse = {
          success: true,
          points: [],
          range: [-5, 7],
        };
        res.json(emptyResult);
        return;
      }

      // Parse JSON from response
      let parsed: { points?: { label: string; value: number }[]; range?: [number, number] };
      try {
        // Extract JSON from potential markdown code block
        const jsonStr = textBlock.text.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(jsonStr);
      } catch (parseErr) {
        logger.error('Failed to parse Claude Vision response:', textBlock.text);
        const emptyResult: AnalysisResponse = {
          success: true,
          points: [],
          range: [-5, 7],
        };
        res.json(emptyResult);
        return;
      }

      // Validate and sanitize the response
      const points: CoordinatePoint[] = [];
      if (Array.isArray(parsed.points)) {
        for (const pt of parsed.points) {
          if (
            pt &&
            typeof pt.label === 'string' &&
            pt.label.length > 0 &&
            typeof pt.value === 'number' &&
            isFinite(pt.value)
          ) {
            points.push({
              label: pt.label.toUpperCase().trim(),
              value: Math.round(pt.value * 100) / 100, // Round to 2 decimals
            });
          }
        }
      }

      let range: [number, number] = [-5, 7];
      if (
        Array.isArray(parsed.range) &&
        parsed.range.length === 2 &&
        typeof parsed.range[0] === 'number' &&
        typeof parsed.range[1] === 'number' &&
        isFinite(parsed.range[0]) &&
        isFinite(parsed.range[1])
      ) {
        range = [parsed.range[0], parsed.range[1]];
      }

      // Ensure all points are within range (expand if needed)
      for (const pt of points) {
        if (pt.value < range[0]) range[0] = Math.floor(pt.value) - 1;
        if (pt.value > range[1]) range[1] = Math.ceil(pt.value) + 1;
      }

      const result: AnalysisResponse = {
        success: true,
        points,
        range,
      };

      setCachedResult(cacheKey, result);
      res.json(result);
    } catch (error) {
      logger.error('Image analysis error:', error);
      res.status(500).json({
        success: false,
        points: [],
        range: [-5, 7],
        error: 'Ошибка анализа изображения',
      });
    }
  }
);

export default router;
