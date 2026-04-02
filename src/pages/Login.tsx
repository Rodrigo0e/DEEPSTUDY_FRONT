import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import styles from './Login.module.css';

// Regras de validação
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MINIMA = 6;

interface LoginProps {
  onLoginSuccess?: () => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

/**
 * Página de Login
 * Formulário para usuários fazerem login com email e senha
 */
export const LoginPage: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  // Pega funções e estados do hook de autenticação
  const { login, isLoading, error, limparErro } = useAuth();

  // Dados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Erros de validação
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  // Valida e faz login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    limparErro();

    // Verifica email
    if (!email) {
      setErroEmail('Email é obrigatório');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErroEmail('Email inválido');
      return;
    }

    // Verifica senha
    if (!senha) {
      setErroSenha('Senha é obrigatória');
      return;
    }
    if (senha.length < SENHA_MINIMA) {
      setErroSenha(`Mínimo ${SENHA_MINIMA} caracteres`);
      return;
    }

    try {
      // Tenta fazer login
      await login(email, senha);
      
      // Se sucesso, limpa formulário
      setEmail('');
      setSenha('');
      
      // Chama callback
      onLoginSuccess?.();
    } catch (err) {
      // Erro já está no estado 'error' do hook
    }
  };

  // Atualiza email e remove erro
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (erroEmail) setErroEmail('');
  };

  // Atualiza senha e remove erro
  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
    if (erroSenha) setErroSenha('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>DeepStudy</h1>
          <p className={styles.subtitle}>Seu organizador de estudos inteligente</p>
        </div>

        {/* Mostra erro se houver */}
        {error && (
          <div className={styles.alertContainer}>
            <Alert type="error" message={error} onClose={limparErro} />
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="seu@email.com"
            error={erroEmail}
          />

          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={handleSenhaChange}
            placeholder="Sua senha"
            error={erroSenha}
          />

          <Button type="submit" isLoading={isLoading} style={{ width: '100%' }}>
            Entrar
          </Button>
        </form>

        {/* Links de ação */}
        <div className={styles.linksContainer}>
          <button
            onClick={onNavigateToForgotPassword}
            className={styles.linkButton}
            type="button"
          >
            Esqueceu sua senha?
          </button>

          <p className={styles.textWithLink}>
            Não tem conta?{' '}
            <button
              onClick={onNavigateToRegister}
              className={styles.inlineLink}
              type="button"
            >
              Crie uma agora
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
