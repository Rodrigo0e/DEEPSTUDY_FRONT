import {
  CompleteReviewRequest,
  ReviewsResponse,
  ReviewResponse,
  ReviewMutationResponse
} from '../types/review';
import { parseErroServidor, tratarErroHttp } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'accessToken';

/**
 * Serviço de Revisões
 * Gerencia todas as requisições relacionadas a revisões
 */
class ReviewService {
  // Função auxiliar para pegar o token
  private getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  // Função auxiliar para construir os headers
  private getHeaders() {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Função auxiliar: fazer uma requisição GET
  private async fazerRequisicaoGET<T>(url: string): Promise<T> {
    const resposta = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const texto = await resposta.text();

    if (!resposta.ok) {
      if (texto) {
        const mensagem = parseErroServidor(texto);
        throw new Error(mensagem);
      }
      throw new Error(tratarErroHttp(resposta.status));
    }

    if (!texto) {
      return {} as T;
    }

    try {
      const resultado = JSON.parse(texto);
      return resultado;
    } catch {
      throw new Error(`Resposta JSON inválida: ${texto}`);
    }
  }

  // Função auxiliar: fazer uma requisição PATCH
  private async fazerRequisicaoPATCH<T>(url: string, dados: unknown): Promise<T> {
    const resposta = await fetch(`${API_URL}${url}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(dados),
    });

    const texto = await resposta.text();

    if (!resposta.ok) {
      if (texto) {
        const mensagem = parseErroServidor(texto);
        throw new Error(mensagem);
      }
      throw new Error(tratarErroHttp(resposta.status));
    }

    if (!texto) {
      return {} as T;
    }

    try {
      const resultado = JSON.parse(texto);
      return resultado;
    } catch {
      throw new Error(`Resposta JSON inválida: ${texto}`);
    }
  }

  // Função auxiliar: fazer uma requisição DELETE
  private async fazerRequisicaoDELETE<T>(url: string): Promise<T> {
    const resposta = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const texto = await resposta.text();

    if (!resposta.ok) {
      if (texto) {
        const mensagem = parseErroServidor(texto);
        throw new Error(mensagem);
      }
      throw new Error(tratarErroHttp(resposta.status));
    }

    if (!texto) {
      return {} as T;
    }

    try {
      const resultado = JSON.parse(texto);
      return resultado;
    } catch {
      throw new Error(`Resposta JSON inválida: ${texto}`);
    }
  }

  /**
   * GET /reviews
   * Obter todas as revisões do usuário
   */
  async getAllReviews(): Promise<ReviewsResponse> {
    return this.fazerRequisicaoGET<ReviewsResponse>('/reviews');
  }

  /**
   * GET /reviews/:id
   * Obter revisão por ID
   */
  async getReviewById(id: string): Promise<ReviewResponse> {
    return this.fazerRequisicaoGET<ReviewResponse>(`/reviews/${id}`);
  }

  /**
   * GET /sessions/:sessionId/reviews
   * Obter revisões de uma sessão específica
   */
  async getReviewsBySessionId(sessionId: string): Promise<ReviewsResponse> {
    return this.fazerRequisicaoGET<ReviewsResponse>(`/sessions/${sessionId}/reviews`);
  }

  /**
   * GET /reviews/today
   * Obter revisões de hoje
   */
  async getTodayReviews(): Promise<ReviewsResponse> {
    return this.fazerRequisicaoGET<ReviewsResponse>('/reviews/today');
  }

  /**
   * GET /reviews/pending
   * Obter revisões pendentes
   */
  async getPendingReviews(): Promise<ReviewsResponse> {
    return this.fazerRequisicaoGET<ReviewsResponse>('/reviews/pending');
  }

  /**
   * GET /reviews/completed
   * Obter revisões concluídas
   */
  async getCompletedReviews(): Promise<ReviewsResponse> {
    return this.fazerRequisicaoGET<ReviewsResponse>('/reviews/completed');
  }

  /**
   * GET /reviews/stats
   * Obter estatísticas de revisões
   */
  async getReviewStats() {
    return this.fazerRequisicaoGET('/reviews/stats');
  }

  /**
   * PATCH /reviews/:id
   * Marcar revisão como concluída
   */
  async completeReview(id: string, dados: CompleteReviewRequest): Promise<ReviewMutationResponse> {
    return this.fazerRequisicaoPATCH<ReviewMutationResponse>(`/reviews/${id}`, dados);
  }

  /**
   * DELETE /reviews/:id
   * Deletar revisão
   */
  async deleteReview(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    return this.fazerRequisicaoDELETE<{ sucesso: boolean; mensagem: string }>(`/reviews/${id}`);
  }
}

export default new ReviewService();
