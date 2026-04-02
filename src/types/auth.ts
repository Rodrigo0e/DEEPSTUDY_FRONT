/**
 * TIPOS DE AUTENTICAÇÃO
 * Define estruturas de dados usado em autenticação
 */

/**
 * Dados de um usuário logado
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

/**
 * Resposta do servidor após login/registro bem-sucedido
 * Vem direto do backend quando usuário faz login ou cria conta
 */
export interface AuthResponse {
  accessToken: string;      // Usado para fazer requisições autenticadas
  refreshToken?: string;    // Para renovar o acesso quando expirar
  user: User;               // Dados do usuário que fez login
}

/**
 * Dados que enviamos ao servidor para fazer login
 */
export interface LoginRequest extends Record<string, unknown> {
  email: string;
  password: string;
}

/**
 * Dados que enviamos ao servidor para criar uma conta
 */
export interface RegisterRequest extends Record<string, unknown> {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

/**
 * Dados para solicitar email de recuperação de senha
 */
export interface ForgotPasswordRequest extends Record<string, unknown> {
  email: string;
}

/**
 * Dados para redefinir a senha (recebido por email)
 */
export interface ResetPasswordRequest extends Record<string, unknown> {
  token: string;            // Token enviado por email
  newPassword: string;
  confirmPassword: string;
}
