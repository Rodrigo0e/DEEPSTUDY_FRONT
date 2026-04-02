import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useReviews } from '../hooks/useReviews';
import { Alert } from '../components/Alert';
import { CompleteReviewRequest } from '../types/review';
import { isToday } from '../utils/dateComparison';
import styles from './Reviews.module.css';

interface ReviewsPageProps {
  sessionId?: string;
  onNavigateToSessions?: () => void;
  onNavigateToLogin?: () => void;
}

/**
 * Página de Revisões
 * Gerencia revisões de spaced repetition
 */
export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  sessionId,
  onNavigateToSessions,
  onNavigateToLogin,
}) => {
  const { isAuthenticated } = useAuthContext();
  const {
    reviews,
    sessionReviews,
    todayReviews,
    pendingReviews,
    completedReviews,
    isLoading,
    error,
    carregarRevisoes,
    carregarRevisoesDaSessao,
    carregarRevisoesPendentes,
    carregarRevisoesConcluidas,
    completarRevisao,
    deletarRevisao,
    carregarStats,
  } = useReviews();

  // Estados de filtragem
  const [filterTab, setFilterTab] = useState<'todas' | 'hoje' | 'pendentes' | 'concluidas'>('todas');
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Estados de edição de nível de lembrança
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRecallLevel, setEditRecallLevel] = useState('5');

  // Ref para rastrear se já carregou na inicialização
  const initializedRef = useRef(false);
  const lastSessionIdRef = useRef<string | undefined>(undefined);

  // Carrega dados ao montar/quando sessionId muda
  useEffect(() => {
    if (!isAuthenticated) {
      onNavigateToLogin?.();
      return;
    }

    // Se sessionId mudou de undefined para um valor, carrega revisões dessa sessão
    if (sessionId && lastSessionIdRef.current !== sessionId) {
      lastSessionIdRef.current = sessionId;
      carregarRevisoesDaSessao(sessionId);
    }
    // Se não há sessionId e ainda não inicializou, carrega todas as revisões
    else if (!sessionId && !initializedRef.current) {
      initializedRef.current = true;
      carregarRevisoes();
      carregarRevisoesPendentes();
      carregarRevisoesConcluidas();
      carregarStats();
    }
  }, [isAuthenticated, sessionId]);

  // Auto-fechar erro após 5 segundos
  useEffect(() => {
    if (completeError) {
      const timer = setTimeout(() => {
        setCompleteError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [completeError]);

  // Auto-fechar erro geral após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        // O erro vem do hook, não conseguimos limpar direto
        // Mas ao menos entendemos que é temporário
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Marca revisão como concluída
  const handleCompleteReview = async (reviewId: string) => {
    setCompleteError(null);
    setCompletingId(reviewId);

    try {
      const recallLevel = editRecallLevel
        ? Number(editRecallLevel)
        : 5;

      const dados: CompleteReviewRequest = {
        nivel_lembranca: recallLevel,
      };

      await completarRevisao(reviewId, dados);
      
      // Se estiver vendo revisões de uma sessão, recarregar seus dados
      if (sessionId) {
        await carregarRevisoesDaSessao(sessionId);
      }
      
      setEditingId(null);
      setEditRecallLevel('5');
    } catch (err) {
      setCompleteError(
        err instanceof Error ? err.message : 'Erro ao completar revisão'
      );
    } finally {
      setCompletingId(null);
    }
  };

  // Deleta revisão
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que quer deletar esta revisão?')) return;

    try {
      await deletarRevisao(reviewId);
      
      // Se estiver vendo revisões de uma sessão, recarregar seus dados
      if (sessionId) {
        await carregarRevisoesDaSessao(sessionId);
      }
    } catch (err) {
      setCompleteError(
        err instanceof Error ? err.message : 'Erro ao deletar revisão'
      );
    }
  };

  // Verifica se a data da revisão chegou
  const isReviewDateReached = (reviewDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reviewDateObj = new Date(reviewDate);
    reviewDateObj.setHours(0, 0, 0, 0);
    
    return reviewDateObj <= today;
  };

  // Agrupa revisões por sessão
  const groupReviewsBySession = (reviewsList: typeof reviews) => {
    const grouped: { [key: string]: { session: any; reviews: typeof reviews } } = {};
    
    reviewsList.forEach(review => {
      const sessionId = review.sessao_id;
      if (!grouped[sessionId]) {
        grouped[sessionId] = {
          session: review.sessao,
          reviews: []
        };
      }
      grouped[sessionId].reviews.push(review);
    });
    
    return Object.values(grouped);
  };

  
  const getDisplayReviews = () => {
    // Se houver um sessionId, mostrar apenas revisões dessa sessão (filtradas)
    if (sessionId) {
      switch (filterTab) {
        case 'hoje': {
          return sessionReviews.filter(r => isToday(r.data));
        }
        case 'pendentes': {
          return sessionReviews.filter(r => !r.concluido);
        }
        case 'concluidas':
          return sessionReviews.filter(r => r.concluido);
        default:
          return sessionReviews;
      }
    }
    
    // Se não houver sessionId, filtrar todas as revisões
    switch (filterTab) {
      case 'hoje':
        // Usa valor memoizado: filtra reviews já carregados onde data === hoje
        return todayReviews;
      case 'pendentes':
        // Mostra reviews retornados por pendingReviews (completed=false, date <= hoje)
        // Isso inclui revisões de hoje também!
        return pendingReviews;
      case 'concluidas':
        // Mostra reviews retornados por completedReviews (completed=true)
        return completedReviews;
      default:
        return reviews;
    }
  }

  // Função para contar revisões de sessão por tipo
  const getSessionReviewCounts = () => {
    // Conta revisões agendadas para HOJE (qualquer status) - usando função utilitária
    const todayCount = sessionReviews.filter(r => isToday(r.data)).length;
    
    const pendingCount = sessionReviews.filter(r => !r.concluido).length;
    const completedCount = sessionReviews.filter(r => r.concluido).length;
    
    return { todayCount, pendingCount, completedCount };
  };

  const displayReviews = getDisplayReviews();

  if (!isAuthenticated) {
    return <div className={styles.container}>Redirecionando para login...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {sessionId && (
          <button
            className={styles.btnBack}
            onClick={onNavigateToSessions}
          >
            ← Voltar à Sessão
          </button>
        )}
        <div>
          <h1 className={styles.title}>
            {sessionId ? 'Revisões da Sessão' : 'Minhas Revisões'}
          </h1>
          <p className={styles.subtitle}>
            {sessionId 
              ? 'Acompanhe o progresso desta sessão com spaced repetition'
              : 'Gerencie suas revisões com spaced repetition'
            }
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      {(sessionId ? sessionReviews.length > 0 : reviews.length > 0) && (
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>
              {sessionId ? sessionReviews.length : reviews.length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Hoje</span>
            <span className={styles.statValue}>
              {sessionId ? getSessionReviewCounts().todayCount : todayReviews.length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pendentes</span>
            <span className={styles.statValue}>
              {sessionId ? getSessionReviewCounts().pendingCount : pendingReviews.length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Concluídas</span>
            <span className={styles.statValue}>
              {sessionId ? getSessionReviewCounts().completedCount : completedReviews.length}
            </span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className={styles.filterTabs}>
          <button
            className={`${styles.tab} ${
              filterTab === 'todas' ? styles.active : ''
            }`}
            onClick={() => setFilterTab('todas')}
          >
            Todas ({sessionId ? sessionReviews.length : reviews.length})
          </button>
          <button
            className={`${styles.tab} ${filterTab === 'hoje' ? styles.active : ''}`}
            onClick={() => setFilterTab('hoje')}
          >
            Hoje ({sessionId ? getSessionReviewCounts().todayCount : todayReviews.length})
          </button>
          <button
            className={`${styles.tab} ${
              filterTab === 'pendentes' ? styles.active : ''
            }`}
            onClick={() => setFilterTab('pendentes')}
          >
            Pendentes ({sessionId ? getSessionReviewCounts().pendingCount : pendingReviews.length})
          </button>
          <button
            className={`${styles.tab} ${
              filterTab === 'concluidas' ? styles.active : ''
            }`}
            onClick={() => setFilterTab('concluidas')}
          >
            Concluídas ({sessionId ? getSessionReviewCounts().completedCount : completedReviews.length})
          </button>
        </div>

      {/* Mensagens de erro */}
      {error && <Alert type="error" message={error} />}
      {completeError && <Alert type="error" message={completeError} />}

      {/* Loading */}
      {isLoading && <p className={styles.loading}>Carregando revisões...</p>}

      {/* Lista vazia */}
      {!isLoading && displayReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            {sessionId
              ? filterTab === 'hoje'
                ? 'Nenhuma revisão para hoje nesta sessão'
                : filterTab === 'pendentes'
                  ? 'Nenhuma revisão pendente nesta sessão'
                  : filterTab === 'concluidas'
                    ? 'Nenhuma revisão concluída nesta sessão'
                    : 'Nenhuma revisão nesta sessão'
              : filterTab === 'hoje'
                ? 'Nenhuma revisão para hoje'
                : filterTab === 'pendentes'
                  ? 'Nenhuma revisão pendente'
                  : filterTab === 'concluidas'
                    ? 'Nenhuma revisão concluída'
                    : 'Nenhuma revisão criada ainda'}
          </p>
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {sessionId ? (
            // Quando é uma sessão específica, não agrupar por sessão
            displayReviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div>
                    <h3 className={styles.reviewTitle}>
                      {review.sessao?.subject || 'Revisão'}
                    </h3>
                    {review.sessao?.topic && (
                      <p className={styles.reviewSubtitle}>{review.sessao.topic}</p>
                    )}
                    <p className={styles.reviewDate}>
                      {new Date(review.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`${styles.completed} ${
                      review.concluido ? styles.done : styles.pending
                    }`}
                  >
                    {review.concluido ? 'Concluída' : 'Pendente'}
                  </span>
                </div>

                {/* Info Grid */}
                {!editingId && review.nivel_lembranca !== undefined && (
                  <div className={styles.reviewInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Dificuldade:</span>
                      <span>{review.nivel_lembranca}/10</span>
                    </div>
                  </div>
                )}

                {/* Espaçador */}
                {!editingId && review.concluido && review.concluido_em && (
                  <div style={{ height: '8px' }} />
                )}

                {/* Data de conclusão */}
                {!editingId && review.concluido && review.concluido_em && (
                  <div className={styles.reviewInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Concluída em:</span>
                      <span>{new Date(review.concluido_em).toLocaleDateString('pt-BR')} às {new Date(review.concluido_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )}

                {/* Ações */}
                {!editingId && (
                  <div className={styles.reviewActions}>
                    {!review.concluido && isReviewDateReached(review.data) && (
                      <button
                        className={styles.btnComplete}
                        onClick={() => {
                          setEditingId(review.id);
                          setEditRecallLevel('5');
                        }}
                      >
                        Completar
                      </button>
                    )}
                    {!review.concluido && (
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                )}

                {/* Editor de Nível de Lembrança */}
                {editingId === review.id && !review.concluido && (
                  <div className={styles.editForm}>
                    <div className={styles.editRow}>
                      <label>Nível de Lembrança (1-10)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={editRecallLevel}
                        onChange={(e) => setEditRecallLevel(e.target.value)}
                        className={styles.range}
                      />
                      <span className={styles.rangeValue}>{editRecallLevel}</span>
                    </div>

                    <div className={styles.editActions}>
                      <button
                        className={styles.btnSave}
                        onClick={() => handleCompleteReview(review.id)}
                        disabled={completingId !== null}
                      >
                        {completingId === review.id ? 'Salvando...' : 'Marcar Concluída'}
                      </button>
                      <button
                        className={styles.btnCancel}
                        onClick={() => {
                          setEditingId(null);
                          setEditRecallLevel('5');
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Quando vê todas as revisões, agrupar por sessão
            groupReviewsBySession(displayReviews).map((group) => (
              <div key={group.session?.id || 'unknown'} className={styles.reviewGroup}>
                {group.reviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div>
                        <h3 className={styles.reviewTitle}>
                          {review.sessao?.subject || 'Revisão'}
                        </h3>
                        {review.sessao?.topic && (
                          <p className={styles.reviewSubtitle}>{review.sessao.topic}</p>
                        )}
                        <p className={styles.reviewDate}>
                          {new Date(review.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span
                        className={`${styles.completed} ${
                          review.concluido ? styles.done : styles.pending
                        }`}
                      >
                        {review.concluido ? 'Concluída' : 'Pendente'}
                      </span>
                    </div>

                    {/* Info Grid */}
                    {!editingId && review.nivel_lembranca !== undefined && (
                      <div className={styles.reviewInfo}>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Dificuldade:</span>
                          <span>{review.nivel_lembranca}/10</span>
                        </div>
                      </div>
                    )}

                    {/* Espaçador */}
                    {!editingId && review.concluido && review.concluido_em && (
                      <div style={{ height: '8px' }} />
                    )}

                    {/* Data de conclusão */}
                    {!editingId && review.concluido && review.concluido_em && (
                      <div className={styles.reviewInfo}>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Concluída em:</span>
                          <span>{new Date(review.concluido_em).toLocaleDateString('pt-BR')} às {new Date(review.concluido_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    )}

                    {/* Editor de nível de lembrança */}
                    {editingId === review.id && !review.concluido ? (
                      <div className={styles.editForm}>
                        <div className={styles.editRow}>
                          <label>Nível de Lembrança (1-10)</label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={editRecallLevel}
                            onChange={(e) => setEditRecallLevel(e.target.value)}
                            className={styles.range}
                          />
                          <span className={styles.rangeValue}>{editRecallLevel}</span>
                        </div>

                        <div className={styles.editActions}>
                          <button
                            className={styles.btnSave}
                            onClick={() => handleCompleteReview(review.id)}
                            disabled={completingId !== null}
                          >
                            {completingId === review.id ? 'Salvando...' : 'Marcar Concluída'}
                          </button>
                          <button
                            className={styles.btnCancel}
                            onClick={() => {
                              setEditingId(null);
                              setEditRecallLevel('5');
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.reviewActions}>
                          {!review.concluido && isReviewDateReached(review.data) && (
                            <button
                              className={styles.btnComplete}
                              onClick={() => {
                                setEditingId(review.id);
                                setEditRecallLevel('5');
                              }}
                            >
                              Completar
                            </button>
                          )}
                          {!review.concluido && (
                            <button
                              className={styles.btnDelete}
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              Deletar
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
