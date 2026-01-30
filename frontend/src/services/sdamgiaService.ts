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
  question: string;
  answer: string;
  solution?: string;
  topic?: string;
}

export interface SdamgiaVariantDetail {
  id: string;
  problems: SdamgiaProblem[];
}

export const sdamgiaService = {
  /**
   * Получить список вариантов для предмета и класса
   */
  async getVariants(subject: string, grade: number): Promise<SdamgiaVariant[]> {
    const response = await api.get('/sdamgia/variants', {
      params: { subject, grade },
    });
    return response.data.data;
  },

  /**
   * Получить конкретный вариант с заданиями
   */
  async getVariant(
    variantId: string,
    subject: string,
    examType: string
  ): Promise<SdamgiaVariantDetail> {
    const response = await api.get(`/sdamgia/variant/${variantId}`, {
      params: { subject, examType },
    });
    return response.data.data;
  },
};
