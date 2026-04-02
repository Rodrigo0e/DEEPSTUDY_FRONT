import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import styles from './Register.module.css';

// Regras de validação
const NOME_MINIMO = 3;
const SENHA_MINIMA = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

/**
 * Página de Registro
 * Formulário para novos usuários criarem uma conta
 */
export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  // Pega funções do hook de autenticação
  const { register, isLoading, error, limparErro } = useAuth();
  // Dados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  // Erros de validação
  const [erroNome, setErroNome] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroConfirmSenha, setErroConfirmSenha] = useState('');

  // Valida e registra novo usuário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    limparErro();

    // Limpa erros antigos
    setErroNome('');
    setErroEmail('');
    setErroSenha('');
    setErroConfirmSenha('');

    // Verifica nome
    if (!nome || nome.length < NOME_MINIMO) {
      setErroNome(`Mínimo ${NOME_MINIMO} caracteres`);
      return;
    }

    // Verifica email
    if (!email || !EMAIL_REGEX.test(email)) {
      setErroEmail('Email inválido');
      return;
    }

    // Verifica senha
    if (!senha || senha.length < SENHA_MINIMA) {
      setErroSenha(`Mínimo ${SENHA_MINIMA} caracteres`);
      return;
    }
    if (!SENHA_REGEX.test(senha)) {
      setErroSenha('Deve ter: maiúscula, minúscula e número');
      return;
    }

    // Verifica confirmação de senha
    if (!confirmSenha || senha !== confirmSenha) {
      setErroConfirmSenha('As senhas não conferem');
      return;
    }

    try {
      // Tenta registrar
      await register(email, nome, senha);

      // Se sucesso, limpa formulário
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmSenha('');

      // Chama callback
      onRegisterSuccess?.();
    } catch (err) {
      // Erro já está no estado 'error' do hook
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>DeepStudy</h1>
          <p className={styles.subtitle}>Crie sua conta para começar</p>
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
            label="Nome"
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erroNome) setErroNome('');
            }}
            placeholder="Seu nome completo"
            error={erroNome}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (erroEmail) setErroEmail('');
            }}
            placeholder="seu@email.com"
            error={erroEmail}
          />

          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              if (erroSenha) setErroSenha('');
            }}
            placeholder={`Mínimo ${SENHA_MINIMA} caracteres`}
            error={erroSenha}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmSenha}
            onChange={(e) => {
              setConfirmSenha(e.target.value);
              if (erroConfirmSenha) setErroConfirmSenha('');
            }}
            placeholder="Confirme sua senha"
            error={erroConfirmSenha}
          />

          <Button type="submit" isLoading={isLoading} style={{ width: '100%' }}>
            Criar Conta
          </Button>
        </form>

        {/* Link para login */}
        <div className={styles.loginLink}>
          <p>
            Já tem conta?{' '}
            <button
              onClick={onNavigateToLogin}
              className={styles.inlineLink}
              type="button"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
