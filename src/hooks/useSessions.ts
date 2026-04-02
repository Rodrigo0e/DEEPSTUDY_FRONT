import { useState } from 'react';
import sessionService from '../services/sessionService';
import { Session, CreateSessionRequest, UpdateSessionRequest } from '../types/session';
import { extrairMensagemErro } from '../utils/errorHandler';

/**
 * HOOK DE SESSÕES DE ESTUDO
 * Gerencia state de sessões (criar, listar, atualizar, deletar)
 */
export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregare todas as sessões
   */
  const carregarSessoes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await sessionService.getAllSessions();
      setSessions(resposta.dados);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obter sessão específica por ID
   */
  const obterSessao = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await sessionService.getSessionById(id);
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
   * Criar nova sessão
   */
  const criarSessao = async (dados: CreateSessionRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await sessionService.createSession(dados);
      setSessions([...sessions, resposta.dados]);
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
   * Atualizar sessão
   */
  const atualizarSessao = async (id: string, dados: UpdateSessionRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const resposta = await sessionService.updateSession(id, dados);
      setSessions(sessions.map(s => s.id === id ? resposta.dados : s));
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
   * Deletar sessão
   */
  const deletarSessao = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await sessionService.deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sessions,
    isLoading,
    error,
    carregarSessoes,
    obterSessao,
    criarSessao,
    atualizarSessao,
    deletarSessao
  };
};
