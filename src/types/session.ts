/**
 * TIPOS DE SESSÃO DE ESTUDO
 * Define estruturas de dados para sessões de estudo
 */

/**
 * Status possível de uma sessão
 */
export type SessionStatus = 'pendente' | 'concluído';

/**
 * Nível de dificuldade (1-10)
 */
export type DifficultyLevel = number; // 1-10

/**
 * Revisão dentro de uma sessão
 */
export interface Review {
  id: string;
  sessao_id: string;
  data: string; // Data da revisão (ISO format)
  concluido: boolean;
  nivel_lembranca: DifficultyLevel; // 1-10 (quanto o usuário se lembra)
  concluido_em?: string; // Data/hora em que foi concluída (ISO format)
  criado_em: string;
  atualizado_em: string;
}

/**
 * Sessão de estudo
 */
export interface Session {
  id: string;
  assunto: string; // Ex: "JavaScript Avançado"
  topico: string; // Ex: "Async/Await"
  dificuldade_esperada: DifficultyLevel; // 1-10
  dificuldade_real?: DifficultyLevel; // 1-10 (preenchido após estudo)
  dias_limite?: number; // Quantos dias até precisar revisar
  status: SessionStatus;
  criado_em: string;
  atualizado_em: string;
  revisoes?: Review[]; // Reviews relacionadas àesta sessão
}

/**
 * Dados enviados ao servidor para criar uma sessão
 */
export interface CreateSessionRequest extends Record<string, unknown> {
  assunto: string;
  topico: string;
  dificuldade_esperada: DifficultyLevel;
  dias_limite?: number;
}

/**
 * Dados para atualizar uma sessão
 */
export interface UpdateSessionRequest extends Record<string, unknown> {
  status?: SessionStatus;
  dificuldade_real?: DifficultyLevel;
}

/**
 * Resposta do servidor ao obter sessões
 */
export interface SessionsResponse {
  sucesso: boolean;
  dados: Session[];
  total: number;
}

/**
 * Resposta do servidor ao obter sessão individual
 */
export interface SessionResponse {
  sucesso: boolean;
  dados: Session;
}

/**
 * Resposta ao criar/atualizar sessão
 */
export interface SessionMutationResponse {
  sucesso: boolean;
  mensagem: string;
  dados: Session;
}
