import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Componente Button
 * Botão reutilizável com variantes de estilo e tamanho
 * 
 * @param variant - Estilo do botão: primary (azul), secondary (transparente), danger (vermelho)
 * @param size - Tamanho: sm (pequeno), md (médio), lg (grande)
 * @param isLoading - Mostra loading spinner e desabilita o botão
 * @param children - Conteúdo do botão
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={styles.spinner} />
          Carregando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
