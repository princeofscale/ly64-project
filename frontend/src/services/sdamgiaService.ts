import api from './api';

export interface SdamgiaVariant {
  id: string;
  number: number;
  title: string;
  subject: string;
  examType: string;
}

export interface SdamgiaProblem {
  id: string;
  number: number;
  part: number;
  question: string;
  images: string[];
  audio?: string;
  answer: string;
  solution?: string;
  solutionImages?: string[];
  topic?: string;
  score?: number;
}

export interface SdamgiaVariantDetail {
  id: string;
  totalProblems: number;
  part1Count: number;
  part2Count: number;
  problems: SdamgiaProblem[];
}

export const sdamgiaService = {
  async getVariants(subject: string, grade: number): Promise<SdamgiaVariant[]> {
    const response = await api.get('/sdamgia/variants', {
      params: { subject, grade },
    });
    return response.data.data;
  },

  async getVariant(
    variantId: string,
    subject: string,
    examType: string,
    grade?: number
  ): Promise<SdamgiaVariantDetail> {
    const response = await api.get(`/sdamgia/variant/${variantId}`, {
      params: { subject, examType, grade },
    });
    return response.data.data;
  },
};
