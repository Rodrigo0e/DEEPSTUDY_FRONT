import {
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionsResponse,
  SessionResponse,
  SessionMutationResponse
} from '../types/session';
import { parseErroServidor, tratarErroHttp } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'accessToken';

/**
 * Serviço de Sessões de Estudo
 * Gerencia todas as requisições relacionadas a sessões
 */
class SessionService {
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

  // Função auxiliar: fazer uma requisição POST
  private async fazerRequisicaoPOST<T>(url: string, dados: unknown): Promise<T> {
    const resposta = await fetch(`${API_URL}${url}`, {
      method: 'POST',
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
   * GET /sessions
   * Obter todas as sessões do usuário
   */
  async getAllSessions(): Promise<SessionsResponse> {
    return this.fazerRequisicaoGET<SessionsResponse>('/sessions');
  }

  /**
   * GET /sessions/:id
   * Obter sessão por ID
   */
  async getSessionById(id: string): Promise<SessionResponse> {
    return this.fazerRequisicaoGET<SessionResponse>(`/sessions/${id}`);
  }

  /**
   * POST /sessions
   * Criar nova sessão
   */
  async createSession(dados: CreateSessionRequest): Promise<SessionMutationResponse> {
    return this.fazerRequisicaoPOST<SessionMutationResponse>('/sessions', dados);
  }

  /**
   * PATCH /sessions/:id
   * Atualizar sessão (status e/ou dificuldade_real)
   */
  async updateSession(id: string, dados: UpdateSessionRequest): Promise<SessionMutationResponse> {
    return this.fazerRequisicaoPATCH<SessionMutationResponse>(`/sessions/${id}`, dados);
  }

  /**
   * DELETE /sessions/:id
   * Deletar sessão
   */
  async deleteSession(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    return this.fazerRequisicaoDELETE<{ sucesso: boolean; mensagem: string }>(`/sessions/${id}`);
  }

  /**
   * GET /sessions/:id/reviews
   * Obter revisões de uma sessão
   */
  async getSessionReviews(id: string) {
    return this.fazerRequisicaoGET(`/sessions/${id}/reviews`);
  }
}

export default new SessionService();
