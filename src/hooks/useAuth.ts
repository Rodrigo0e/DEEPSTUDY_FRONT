import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { extrairMensagemErro } from '../utils/errorHandler';
import { User, AuthResponse } from '../types/auth';

/**
 * HOOK DE AUTENTICAÇÃO - VERSÃO SIMPLES
 * 
 * Como funciona:
 * 1. useEffect recupera usuário salvo ao abrir
 * 2. Funções login/register chamam API e salvam dados locais
 * 3. Logout limpa tudo
 */
export const useAuth = () => {
  // ESTADOS
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // useEffect: Recupera usuário ao abrir a app
  // ============================================
  useEffect(() => {
    const usuarioSalvo = authService.getCurrentUser();
    
    if (usuarioSalvo) {
      setUser(JSON.parse(usuarioSalvo));
    }
  }, []); // Roda UMA VEZ ao abrir

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1️⃣ Envia dados para o servidor
      const resposta = await authService.login(email, senha) as AuthResponse;

      // 2️⃣ Recebeu sucesso! Salva os tokens
      authService.saveAuthData(resposta);

      // Atualiza estado - agora está logado
      setUser(resposta.user);

    } catch (err) {
      // Se deu erro, apenas mostra a mensagem (o backend cuida do rate limit)
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;

    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // REGISTRO
  // ============================================
  const register = async (email: string, nome: string, senha: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1️⃣ Envia dados para servidor
      const resposta = await authService.register(email, senha, nome) as AuthResponse;

      // 2️⃣ Salvou no banco! Agora salva tokens
      authService.saveAuthData(resposta);

      // Atualiza estado
      setUser(resposta.user);

    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;

    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = async () => {
    try {
      // Tenta fazer logout no servidor também
      await authService.logoutRemote();
    } catch (err) {
      // Falha silenciosa - continua mesmo assim
    }
    
    // Limpa dados locais mesmo se servidor falhar
    authService.logout();    // Limpa localStorage
    setUser(null);          // remove do estado
    setError(null);         // limpa erros
  };

  // ============================================
  // VERIFICAR TOKEN
  // ============================================
  const verificarToken = async () => {
    try {
      await authService.verifyToken();
      return true;
    } catch (err) {
      return false;
    }
  };

  // ============================================
  // RENOVAR TOKEN
  // ============================================
  const renovarToken = async () => {
    setIsLoading(true);

    try {
      const resposta = await authService.refreshToken() as AuthResponse;
      authService.saveAuthData(resposta);
      setUser(resposta.user);
      return true;
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // ESQUECEU SENHA
  // ============================================
  const esqueceuSenha = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RESETAR SENHA
  // ============================================
  const resetarSenha = async (token: string, novaSenha: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, novaSenha);
    } catch (err) {
      const mensagem = extrairMensagemErro(err);
      setError(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // LIMPAR ERRO
  // ============================================
  const limparErro = () => {
    setError(null);
  };

  // ============================================
  // RETORNA TUDO
  // ============================================
  return {
    user,                 // Dados do usuário ou null
    isLoading,            // true = processando
    error,                // Mensagem de erro ou null
    isAuthenticated: !!user,  // true = está logado

    login,
    register,
    logout,
    esqueceuSenha,
    resetarSenha,
    verificarToken,
    renovarToken,
    limparErro,
  };
};
