/**
 * TIPOS DE REVISÃO
 * Define estruturas de dados para revisões (spaced repetition)
 */

/**
 * Nível de lembrança (1-10)
 */
export type RecallLevel = number; // 1-10

/**
 * Revisão de um tópico estudado
 */
export interface Review {
  id: string;
  sessao_id: string;
  sessao?: {
    id: string;
    subject: string;
    topic: string;
  };
  data: string; // Data agendada da revisão (ISO format)
  concluido: boolean;
  nivel_lembranca: RecallLevel; // 1-10 (quanto o usuário se lembra)
  concluido_em?: string; // Data/hora em que foi concluída (ISO format)
  criado_em: string;
  atualizado_em: string;
}

/**
 * Dados enviados ao servidor para marcar revisão como concluída
 */
export interface CompleteReviewRequest extends Record<string, unknown> {
  nivel_lembranca: RecallLevel; // 1-10
}

/**
 * Resposta do servidor ao obter revisões
 */
export interface ReviewsResponse {
  sucesso: boolean;
  dados: Review[];
  total: number;
  mensagem?: string;
}

/**
 * Resposta do servidor ao obter revisão individual
 */
export interface ReviewResponse {
  sucesso: boolean;
  dados: Review;
}

/**
 * Resposta ao atualizar revisão
 */
export interface ReviewMutationResponse {
  sucesso: boolean;
  mensagem: string;
  dados: Review;
}
