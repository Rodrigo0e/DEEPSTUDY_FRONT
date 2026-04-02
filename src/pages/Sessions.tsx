import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSessions';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { CreateSessionRequest } from '../types/session';
import styles from './Sessions.module.css';

interface SessionsPageProps {
  onNavigateToReviews?: (sessionId: string) => void;
  onNavigateToLogin?: () => void;
}

/**
 * Página de Sessões de Estudo
 * Gerencia CRUD completo de sessões de estudo
 */
export const SessionsPage: React.FC<SessionsPageProps> = ({
  onNavigateToReviews,
  onNavigateToLogin,
}) => {
  const { isAuthenticated } = useAuthContext();
  const {
    sessions,
    isLoading,
    error,
    carregarSessoes,
    criarSessao,
    atualizarSessao,
    deletarSessao,
  } = useSessions();

  // Estados do formulário
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    assunto: '',
    topico: '',
    dificuldade_esperada: '5',
    dias_limite: '7',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Editor de dificuldade real
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDificuldade, setEditDificuldade] = useState('');
  const [editStatus, setEditStatus] = useState<'pendente' | 'concluído'>('pendente');

  // Carrega sessões ao montar e quando autenticação muda
  useEffect(() => {
    if (isAuthenticated) {
      carregarSessoes();
    } else {
      onNavigateToLogin?.();
    }
  }, [isAuthenticated]);

  // Valida formulário
  const validateForm = (): boolean => {
    const erros: Record<string, string> = {};

    if (!formData.assunto.trim()) {
      erros.assunto = 'Assunto é obrigatório';
    } else if (formData.assunto.length > 30) {
      erros.assunto = 'Assunto não pode ter mais de 30 caracteres';
    }
    if (!formData.topico.trim()) {
      erros.topico = 'Tópico é obrigatório';
    } else if (formData.topico.length > 30) {
      erros.topico = 'Tópico não pode ter mais de 30 caracteres';
    }
    const dif = Number(formData.dificuldade_esperada);
    if (isNaN(dif) || dif < 0 || dif > 10) {
      erros.dificuldade_esperada = 'Dificuldade deve estar entre 0 e 10';
    }
    const dias = Number(formData.dias_limite);
    if (dias < 1 || dias > 365) {
      erros.dias_limite = 'Dias limite deve estar entre 1 e 365';
    }

    setFormErrors(erros);
    return Object.keys(erros).length === 0;
  };

  // Cria nova sessão
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const dados: CreateSessionRequest = {
        assunto: formData.assunto.trim(),
        topico: formData.topico.trim(),
        dificuldade_esperada: Number(formData.dificuldade_esperada),
        dias_limite: Number(formData.dias_limite) || 7,
      };

      await criarSessao(dados);

      setFormData({
        assunto: '',
        topico: '',
        dificuldade_esperada: '5',
        dias_limite: '7',
      });
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar sessão');
    } finally {
      setFormLoading(false);
    }
  };

  // Atualiza sessão
  const handleUpdateSession = async (sessaoId: string) => {
    setFormError(null);

    try {
      await atualizarSessao(sessaoId, {
        status: editStatus,
        dificuldade_real: editDificuldade ? Number(editDificuldade) : undefined,
      });
      setEditingId(null);
      setEditDificuldade('');
      setEditStatus('pendente');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao atualizar sessão');
    }
  };

  // Deleta sessão
  const handleDeleteSession = async (sessaoId: string) => {
    if (!confirm('Tem certeza que quer deletar esta sessão?')) return;

    try {
      await deletarSessao(sessaoId);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao deletar sessão');
    }
  };

  // Mapa de status para nomes de classe CSS (sem acentos)
  const getStatusClassName = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pendente': 'pendente',
      'concluído': 'concluido',
    };
    return statusMap[status] || status;
  };

  if (!isAuthenticated) {
    return <div className={styles.container}>Redirecionando para login...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Minhas Sessões de Estudo</h1>
        <p className={styles.subtitle}>Organize suas sessões de estudo</p>
      </div>

      {/* Botão para criar nova sessão */}
      <button
        className={styles.btnNewSession}
        onClick={() => setShowForm(!showForm)}
        disabled={isLoading}
      >
        {showForm ? '✕ Cancelar' : '+ Nova Sessão'}
      </button>

      {/* Formulário de criação */}
      {showForm && (
        <form className={styles.formContainer} onSubmit={handleCreateSession}>
          <h2>Nova Sessão</h2>

          {formError && <Alert type="error" message={formError} />}

          <Input
            label="Assunto"
            placeholder="Ex: JavaScript Avançado"
            value={formData.assunto}
            maxLength={30}
            onChange={(e) => {
              setFormData({ ...formData, assunto: e.target.value });
              if (e.target.value.length === 30) {
                setFormErrors({ ...formErrors, assunto: 'Limite de caracteres atingido' });
              } else if (formErrors.assunto === 'Limite de caracteres atingido') {
                const novoErros = { ...formErrors };
                delete novoErros.assunto;
                setFormErrors(novoErros);
              }
            }}
            error={formErrors.assunto}
          />

          <Input
            label="Tópico"
            placeholder="Ex: Async/Await"
            value={formData.topico}
            maxLength={30}
            onChange={(e) => {
              setFormData({ ...formData, topico: e.target.value });
              if (e.target.value.length === 30) {
                setFormErrors({ ...formErrors, topico: 'Limite de caracteres atingido' });
              } else if (formErrors.topico === 'Limite de caracteres atingido') {
                const novoErros = { ...formErrors };
                delete novoErros.topico;
                setFormErrors(novoErros);
              }
            }}
            error={formErrors.topico}
          />

<div className={styles.row}>
            <div className={styles.col}>
              <label>Dificuldade Esperada (1-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.dificuldade_esperada}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dificuldade_esperada: e.target.value,
                  })
                }
                className={styles.range}
              />
              <span className={styles.rangeValue}>
                {formData.dificuldade_esperada}
              </span>
            </div>

            <div className={styles.col}>
              <Input
                label="Dias Limite para Revisar"
                type="number"
                placeholder="7"
                value={formData.dias_limite}
                min="1"
                max="365"
                maxLength={3}
                onChange={(e) =>
                  setFormData({ ...formData, dias_limite: e.target.value })
                }
                error={formErrors.dias_limite}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={formLoading || isLoading}
            isLoading={formLoading}
          >
            {formLoading ? 'Criando...' : 'Criar Sessão'}
          </Button>
        </form>
      )}

      {/* Mensagem de erro geral */}
      {error && <Alert type="error" message={error} />}

      {/* Loading */}
      {isLoading && <p className={styles.loading}>Carregando sessões...</p>}

      {/* Lista de sessões */}
      {!isLoading && sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma sessão criada ainda</p>
          <p>Clique em "+ Nova Sessão" para começar</p>
        </div>
      ) : (
        <>
          <h2 className={styles.sessionsListTitle}>Suas Sessões</h2>
          <div className={styles.sessionsList}>
            {sessions.map((sessao) => (
              <div key={sessao.id} className={styles.sessionCard}>
              <div className={styles.sessionHeader}>
                <div>
                  <h3 className={styles.sessionTitle}>{sessao.assunto}</h3>
                  <p className={styles.sessionSubtitle}>{sessao.topico}</p>
                </div>
                <span className={`${styles.status} ${styles[getStatusClassName(sessao.status)]}`}>
                  {sessao.status}
                </span>
              </div>

              <div className={styles.sessionInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Dificuldade Esperada:</span>
                  <span>{sessao.dificuldade_esperada}/10</span>
                </div>
                {sessao.dificuldade_real !== undefined && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Dificuldade Real:</span>
                    <span>{sessao.dificuldade_real}/10</span>
                  </div>
                )}
                {sessao.dias_limite !== undefined && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Dias Limite:</span>
                    <span>{sessao.dias_limite} dias</span>
                  </div>
                )}
              </div>

              {/* Editor de dificuldade */}
              {editingId === sessao.id ? (
                <div className={styles.editForm}>
                  <div className={styles.editRow}>
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(
                          e.target.value as 'pendente' | 'concluído'
                        )
                      }
                      className={styles.select}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="concluído">Concluído</option>
                    </select>
                  </div>

                  <div className={styles.editRow}>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Dificuldade Real (1-10)"
                      value={editDificuldade}
                      onChange={(e) => setEditDificuldade(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.editActions}>
                    <button
                      className={styles.btnSave}
                      onClick={() => handleUpdateSession(sessao.id)}
                    >
                      Salvar
                    </button>
                    <button
                      className={styles.btnCancel}
                      onClick={() => {
                        setEditingId(null);
                        setEditDificuldade('');
                        setEditStatus('pendente');
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.sessionActions}>
                  {sessao.status !== 'concluído' && (
                    <button
                      className={styles.btnEdit}
                      onClick={() => {
                        setEditingId(sessao.id);
                        setEditStatus(sessao.status);
                        setEditDificuldade(
                          sessao.dificuldade_real?.toString() || ''
                        );
                      }}
                    >
                      Editar
                    </button>
                  )}
                  {sessao.status === 'concluído' && (
                    <button
                      className={styles.btnReviews}
                      onClick={() => onNavigateToReviews?.(sessao.id)}
                    >
                      Ver Revisões
                    </button>
                  )}
                  <button
                    className={styles.btnDelete}
                    onClick={() => handleDeleteSession(sessao.id)}
                  >
                    Deletar
                  </button>
                </div>
              )}
            </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SessionsPage;
