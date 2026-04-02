import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import styles from './ForgotPassword.module.css';

// Constantes de validação
const SENHA_MINIMA = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// Tipo para qual etapa do fluxo está ativa
type Etapa = 'email' | 'reset';

interface ForgotPasswordPageProps {
  onNavigateToLogin?: () => void;
}

/**
 * Página de Recuperar Senha
 * Fluxo de duas etapas: solicitar email -> redefinir senha
 */
export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
}) => {
  // Pega funções do hook de autenticação
  const { esqueceuSenha, resetarSenha, isLoading, error, limparErro } = useAuth();

  // Etapa atual do fluxo (email ou reset)
  const [etapa, setEtapa] = useState<Etapa>('email');

  // ========== Dados da etapa 1: Email ==========
  const [email, setEmail] = useState('');
  const [erroEmail, setErroEmail] = useState('');

  // ========== Dados da etapa 2: Redefinir Senha ==========
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroToken, setErroToken] = useState('');
  const [erroNovaSenha, setErroNovaSenha] = useState('');
  const [erroConfirmarSenha, setErroConfirmarSenha] = useState('');

  // Mensagem de sucesso
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // ========== Etapa 1: Enviar email de recuperação ==========
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    limparErro();

    // Valida email
    setErroEmail('');
    if (!email) {
      setErroEmail('Email é obrigatório');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErroEmail('Email inválido');
      return;
    }

    // Tenta enviar email de recuperação
    try {
      await esqueceuSenha(email);
      setMensagemSucesso('Email enviado! Verifique sua caixa de entrada.');
      setEmail('');
      
      // Espera 2 segundos e vai para próxima etapa
      setTimeout(() => {
        setEtapa('reset');
      }, 2000);
    } catch (err) {
      // Erro já aparece no estado 'error' do hook
    }
  };

  // ========== Etapa 2: Redefinir senha com token ==========
  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    limparErro();

    // Limpa erros antigos
    setErroToken('');
    setErroNovaSenha('');
    setErroConfirmarSenha('');

    // Valida token
    if (!token) {
      setErroToken('Token é obrigatório');
      return;
    }

    // Valida nova senha
    if (!novaSenha) {
      setErroNovaSenha('Senha é obrigatória');
      return;
    }
    if (novaSenha.length < SENHA_MINIMA) {
      setErroNovaSenha(`Senha deve ter pelo menos ${SENHA_MINIMA} caracteres`);
      return;
    }
    if (!SENHA_REGEX.test(novaSenha)) {
      setErroNovaSenha('Deve ter: maiúscula, minúscula e número');
      return;
    }

    // Valida confirmação de senha
    if (!confirmarSenha) {
      setErroConfirmarSenha('Confirmação é obrigatória');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroConfirmarSenha('As senhas não conferem');
      return;
    }

    // Tenta redefinir a senha
    try {
      await resetarSenha(token, novaSenha);
      setMensagemSucesso('Senha alterada com sucesso!');
      
      // Espera 2 segundos e volta para login
      setTimeout(() => {
        onNavigateToLogin?.();
      }, 2000);
    } catch (err) {
      // Erro já aparece no estado 'error' do hook
    }
  };

  // Volta para etapa 1
  const handleVoltarParaEmail = () => {
    setEtapa('email');
    setToken('');
    setNovaSenha('');
    setConfirmarSenha('');
    setErroToken('');
    setErroNovaSenha('');
    setErroConfirmarSenha('');
    setMensagemSucesso('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Botão voltar para login */}
        <button
          onClick={onNavigateToLogin}
          className={styles.backButton}
          type="button"
        >
          ← Voltar ao login
        </button>

        {/* Cabeçalho */}
        <div className={styles.header}>
          <h1 className={styles.title}>Recuperar Senha</h1>
          <p className={styles.subtitle}>
            {etapa === 'email'
              ? 'Digite seu email para receber as instruções'
              : 'Digite o token e sua nova senha'}
          </p>
        </div>

        {/* Mostra erro se houver */}
        {error && (
          <div className={styles.alertContainer}>
            <Alert type="error" message={error} onClose={limparErro} />
          </div>
        )}

        {/* Mostra sucesso se houver */}
        {mensagemSucesso && (
          <div className={styles.alertContainer}>
            <Alert type="success" message={mensagemSucesso} />
          </div>
        )}

        {/* ========== ETAPA 1: Email de Recuperação ========== */}
        {etapa === 'email' && (
          <form onSubmit={handleEmailSubmit} className={styles.form}>
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
              helperText="Enviaremos um email com instruções para recuperar sua senha"
            />

            <Button type="submit" isLoading={isLoading} style={{ width: '100%' }}>
              Enviar Email de Recuperação
            </Button>
          </form>
        )}

        {/* ========== ETAPA 2: Redefinir Senha ========== */}
        {etapa === 'reset' && (
          <form onSubmit={handleResetSubmit} className={styles.form}>
            <Input
              label="Token de Recuperação"
              type="text"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (erroToken) setErroToken('');
              }}
              placeholder="Cole o token do email"
              error={erroToken}
              helperText="Você recebeu este token por email"
            />

            <Input
              label="Nova Senha"
              type="password"
              value={novaSenha}
              onChange={(e) => {
                setNovaSenha(e.target.value);
                if (erroNovaSenha) setErroNovaSenha('');
              }}
              placeholder={`Mínimo ${SENHA_MINIMA} caracteres`}
              error={erroNovaSenha}
            />

            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => {
                setConfirmarSenha(e.target.value);
                if (erroConfirmarSenha) setErroConfirmarSenha('');
              }}
              placeholder="Confirme sua nova senha"
              error={erroConfirmarSenha}
            />

            {/* Botões: Voltar e Redefinir */}
            <div className={styles.buttonGroup}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleVoltarParaEmail}
              >
                Voltar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Redefinir Senha
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
