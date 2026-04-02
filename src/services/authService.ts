import { AuthResponse } from '../types/auth';
import { parseErroServidor, tratarErroHttp } from '../utils/errorHandler';

// URL da API - onde nosso servidor está rodando
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Nomes das chaves que salvamos no navegador
const TOKEN_STORAGE_KEY = 'accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const USER_STORAGE_KEY = 'user';

/**
 * Serviço de Autenticação
 * Cuida de todas as requisições relacionadas a login, registro, etc
 */
class AuthService {
  // Função auxiliar para pegar o token que salvou no navegador
  private getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  // Função auxiliar para construir os headers das requisições
  private getHeaders() {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Se tem token, adiciona no header para autenticação
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Função auxiliar: faz uma requisição POST
  private async fazerRequisicao<T>(url: string, dados: unknown): Promise<T> {
    // 1. Envia requisição para o servidor
    const resposta = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dados),
    });

    // 2. Lê a resposta como texto
    const texto = await resposta.text();

    // 3. Se HTTP status foi erro (400, 401, 404, 500...), lança erro
    if (!resposta.ok) {
      // Se tem texto, tenta pegar mensagem de erro JSON
      if (texto) {
        const mensagem = parseErroServidor(texto);
        throw new Error(mensagem);
      }
      // Fallback para status HTTP
      throw new Error(tratarErroHttp(resposta.status));
    }

    // 4. Se resposta está vazia, retorna objeto vazio (seu servidor não retorna dados)
    if (!texto) {
      return {} as T;
    }

    // 5. Transforma texto em objeto JSON
    try {
      const resultado = JSON.parse(texto);
      return resultado;
    } catch {
      throw new Error(`Resposta JSON inválida: ${texto}`);
    }
  }

  // Login com email e senha
  async login(email: string, senha: string) {
    return this.fazerRequisicao('/auth/login', {
      email,
      senha
    });
  }

  // Criar nova conta
  async register(email: string, senha: string, nome: string) {
    return this.fazerRequisicao('/auth/register', {
      email,
      senha,
      nome,
      confirmaSenha: senha
    });
  }

  // Solicitar email de recuperação de senha
  async forgotPassword(email: string) {
    return this.fazerRequisicao('/auth/forgot-password', { email });
  }

  // Redefinir senha com token
  async resetPassword(token: string, password: string) {
    return this.fazerRequisicao('/auth/reset-password', { 
      token,
      password
    });
  }

  // Renovar token de acesso
  async refreshToken() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    
    if (!refreshToken) {
      throw new Error('Sem refresh token');
    }

    return this.fazerRequisicao('/auth/refresh-token', { refreshToken });
  }

  // Fazer logout no servidor (limpa sessão do backend)
  async logoutRemote() {
    try {
      await this.fazerRequisicao('/auth/logout', {});
    } catch (err) {
      // Falha silenciosa - continua mesmo assim
    }
  }

  // Verificar se token é válido
  async verifyToken() {
    return this.fazerRequisicao('/auth/verify', {});
  }

  // Remove dados de autenticação do navegador  
  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  // Pega informações do usuário que foi salvo no navegador
  getCurrentUser() {
    return localStorage.getItem(USER_STORAGE_KEY);
  }

  // Salva tokens e dados do usuário no navegador para depois usar
  saveAuthData(dados: AuthResponse) {
    localStorage.setItem(TOKEN_STORAGE_KEY, dados.accessToken);
    
    if (dados.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, dados.refreshToken);
    }
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(dados.user));
  }
}

export default new AuthService();
