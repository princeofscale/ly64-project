import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { HTTP_STATUS_CODES, NOT_FOUND_MESSAGES, CONTENT_TYPES } from '../constants/httpConstants';
import { logger } from '../utils/logger';

interface NotFoundJsonResponse {
  readonly success: false;
  readonly statusCode: number;
  readonly message: string;
  readonly path: string;
  readonly method: string;
  readonly timestamp: string;
  readonly suggestion: string;
}

class NotFoundHandler {
  private readonly htmlTemplatePath: string;
  private htmlTemplate: string | null = null;

  constructor() {
    this.htmlTemplatePath = path.join(__dirname, '..', 'views', '404.html');
    this.loadHtmlTemplate();
  }

  private loadHtmlTemplate(): void {
    try {
      if (fs.existsSync(this.htmlTemplatePath)) {
        this.htmlTemplate = fs.readFileSync(this.htmlTemplatePath, 'utf-8');
      }
    } catch (error) {
      logger.error('Failed to load 404 HTML template', { error });
    }
  }

  public handle(request: Request, response: Response): void {
    this.logNotFoundRequest(request);

    if (this.isApiRequest(request)) {
      this.sendJsonResponse(request, response);
    } else if (this.shouldSendHtml(request)) {
      this.sendHtmlResponse(response);
    } else {
      this.sendJsonResponse(request, response);
    }
  }

  private isApiRequest(request: Request): boolean {
    return request.path.startsWith('/api');
  }

  private shouldSendHtml(request: Request): boolean {
    const acceptHeader = request.get('Accept') || '';
    return acceptHeader.includes(CONTENT_TYPES.HTML);
  }

  private sendJsonResponse(request: Request, response: Response): void {
    const jsonResponse = this.createJsonResponse(request);
    response.status(HTTP_STATUS_CODES.NOT_FOUND).json(jsonResponse);
  }

  private sendHtmlResponse(response: Response): void {
    if (this.htmlTemplate) {
      response.status(HTTP_STATUS_CODES.NOT_FOUND).type(CONTENT_TYPES.HTML).send(this.htmlTemplate);
    } else {
      this.sendFallbackHtmlResponse(response);
    }
  }

  private sendFallbackHtmlResponse(response: Response): void {
    const fallbackHtml = this.createFallbackHtml();
    response.status(HTTP_STATUS_CODES.NOT_FOUND).type(CONTENT_TYPES.HTML).send(fallbackHtml);
  }

  private createJsonResponse(request: Request): NotFoundJsonResponse {
    return {
      success: false,
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: this.isApiRequest(request)
        ? NOT_FOUND_MESSAGES.API_ENDPOINT_NOT_FOUND
        : NOT_FOUND_MESSAGES.ROUTE_NOT_FOUND,
      path: request.path,
      method: request.method,
      timestamp: new Date().toISOString(),
      suggestion: NOT_FOUND_MESSAGES.SUGGESTION,
    };
  }

  private createFallbackHtml(): string {
    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Страница не найдена</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          h1 { font-size: 72px; color: #667eea; margin: 0; }
          p { font-size: 20px; color: #666; }
          a { color: #667eea; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>404</h1>
        <p>Страница не найдена</p>
        <a href="/">Вернуться на главную</a>
      </body>
      </html>
    `;
  }

  private logNotFoundRequest(request: Request): void {
    logger.warn('404 Not Found', {
      method: request.method,
      path: request.path,
      query: request.query,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }
}

const notFoundHandler = new NotFoundHandler();

export const handleNotFound = (request: Request, response: Response): void => {
  notFoundHandler.handle(request, response);
};

export default handleNotFound;
