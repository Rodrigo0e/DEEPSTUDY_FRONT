import { useState, useMemo } from 'react';
import reviewService from '../services/reviewService';
import { Review, CompleteReviewRequest } from '../types/review';
import { extrairMensagemErro } from '../utils/errorHandler';
import { isToday } from '../utils/dateComparison';

/**
 * HOOK DE REVISÕES
 * Gerencia state de revisões (listar, completar, deletar, etc)
 * 
 * ARQUITETURA DE MÚLTIPLAS VISUALIZAÇÕES SEM DUPLICAÇÃO:
 * ====================================================
 * 
 * O mesmo Review pode aparecer em múltiplos arrays SEM duplicação:
 * 
 * reviewState = {
 *   reviews: [R1, R2, R3, R4],           // Todas
 *   pendingReviews: [R1, R2, R4],        // completed=false
 *   completedReviews: [R3]               // completed=true
 * }
 * 
 * NOVO: todayReviews é COMPUTED com useMemo:
 * - Filtra reviews.filter(r => isToday(r.data))
 * - Sem fazer requisição separada
 * - Atualiza automaticamente quando reviews muda
 * 
 * Exemplo: Review R1 = { id: "1", data: "2026-04-01", concluido: false }
 * - Aparece em reviews (todas)
 * - Aparece em pendingReviews (não concluída)
 * - Aparece em todayReviews computado (data === hoje)
 * - NÃO aparece em completedReviews (não concluída)
 * 
 * Resultado: Mesmo objeto em múltiplos filtros, permitindo visualização
 * sem nova requisição ou duplicação de dados.
 */

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [completedReviews, setCompletedReviews] = useState<Review[]>([]);
  const [sessionReviews, setSessionReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar todas as revisões
   */
  const carregarRevisoes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await reviewService.getAllReviews();
      setReviews(resposta.dados);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      setReviews([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * DADOS DERIVADOS COM MEMOIZAÇÃO: Revisões de hoje
   * 
   * Filtra a partir de reviews já carregados usando useMemo para performance.
   * Sem fazer requisição separada.
   * Atualiza automaticamente quando reviews muda.
   * 
   * Benefícios:
   * - Sem estado extra (reviews é a source of truth)
   * - Memoizado: recalcula apenas quando reviews muda
   * - Sem requisições desnecessárias
   * - Mesmo review pode aparecer em múltiplas abas
   */
  const todayReviews = useMemo(() => {
    return reviews.filter(r => isToday(r.data));
  }, [reviews]);

  /**
   * Carregar revisões pendentes
   */
  const carregarRevisoesPendentes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await reviewService.getPendingReviews();
      setPendingReviews(resposta.dados);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      setPendingReviews([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carregar revisões concluídas
   */
  const carregarRevisoesConcluidas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await reviewService.getCompletedReviews();
      setCompletedReviews(resposta.dados);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      setCompletedReviews([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obter revisão específica por ID
   */
  const obterRevisao = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await reviewService.getReviewById(id);
      return resposta.dados;
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Marcar revisão como concluída
   */
  const completarRevisao = async (id: string, dados: CompleteReviewRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await reviewService.completeReview(id, dados);
      
      // Recarregar todas as revisões para garantir dados atualizados
      const revisoes = await reviewService.getAllReviews();
      setReviews(revisoes.dados);
      
      // Recarregar revisões pendentes
      const pendentes = await reviewService.getPendingReviews();
      setPendingReviews(pendentes.dados);
      
      // Recarregar revisões concluídas
      const concluidas = await reviewService.getCompletedReviews();
      setCompletedReviews(concluidas.dados);
      
      return resposta.dados;
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletar revisão
   */
  const deletarRevisao = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await reviewService.deleteReview(id);
      
      // Recarregar todas as revisões para garantir dados atualizados
      const revisoes = await reviewService.getAllReviews();
      setReviews(revisoes.dados);
      
      // Recarregar revisões pendentes
      const pendentes = await reviewService.getPendingReviews();
      setPendingReviews(pendentes.dados);
      
      // Recarregar revisões concluídas
      const concluidas = await reviewService.getCompletedReviews();
      setCompletedReviews(concluidas.dados);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carregar estatísticas de revisões
   */
  const carregarStats = async () => {
    setError(null);

    try {
      const resposta = await reviewService.getReviewStats();
      setStats(resposta);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    }
  };

  /**
   * Carregar revisões de uma sessão específica
   */
  const carregarRevisoesDaSessao = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await reviewService.getReviewsBySessionId(sessionId);
      
      // Validação: Verificar que todas as revisões pertencem à sessão solicitada
      if (resposta.dados.length > 0) {
        const revisoesFora = resposta.dados.filter(r => r.sessao_id !== sessionId);
        if (revisoesFora.length > 0) {
          const erro = new Error(
            `API retornou ${revisoesFora.length} revisões que não pertencem à sessão ${sessionId}`
          );
          throw erro;
        }
      }
      
      setSessionReviews(resposta.dados);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      setSessionReviews([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reviews,
    todayReviews,  // ← Valor memoizado derivado de reviews
    pendingReviews,
    completedReviews,
    sessionReviews,
    stats,
    isLoading,
    error,
    carregarRevisoes,
    carregarRevisoesPendentes,
    carregarRevisoesConcluidas,
    carregarRevisoesDaSessao,
    obterRevisao,
    completarRevisao,
    deletarRevisao,
    carregarStats
  };
};
