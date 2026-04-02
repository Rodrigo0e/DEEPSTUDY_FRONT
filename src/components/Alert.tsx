import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

/**
 * Componente Alert
 * Exibe mensagens de alerta com diferentes tipos e estilos
 * 
 * @param type - Tipo do alerta: success (verde), error (vermelho), info (azul), warning (amarelo)
 * @param message - Texto da mensagem
 * @param onClose - Função chamada ao clicar no botão de fechar
 */
export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  // Ícones para cada tipo de alerta
  const iconContent = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠',
  };

  return (
    <div
      className={`${styles.alert} ${styles[type]}`}
      role="alert"
    >
      <span className={styles.icon}>{iconContent[type]}</span>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      {/* Botão de fechar opcional */}
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Fechar alerta"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};
