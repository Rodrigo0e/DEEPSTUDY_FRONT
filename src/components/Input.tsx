import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * Componente Input
 * Campo de entrada reutilizável com label, validação e texto de ajuda
 * 
 * @param label - Texto do rótulo
 * @param error - Mensagem de erro (se houver)
 * @param helperText - Texto de ajuda (mostrado se sem erro)
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}) => {
  // Gera ID automático baseado no label se não fornecido
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.inputContainer}>
      <label
        htmlFor={inputId}
        className={styles.label}
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.error : ''} ${className || ''}`}
        {...props}
      />
      {/* Mostra erro ou texto de ajuda */}
      {error && <span className={styles.errorMessage}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};
