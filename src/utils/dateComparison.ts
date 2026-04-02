/**
 * UTILITÁRIOS DE COMPARAÇÃO DE DATAS
 * Funções para comparar datas ignorando horário (apenas dia/mês/ano)
 */

/**
 * Converte uma data (string ou Date) para string no formato YYYY-MM-DD
 * @param date - Data como string (ISO) ou objeto Date
 * @returns String no formato YYYY-MM-DD
 */
export const toDateString = (date: string | Date): string => {
  let dateObj: Date;

  if (typeof date === 'string') {
    // Se for string ISO (ex: "2026-04-01T10:30:00"), pega apenas a parte da data
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Obtém a data de hoje no formato YYYY-MM-DD (hora local)
 * @returns String no formato YYYY-MM-DD
 */
export const getTodayString = (): string => {
  return toDateString(new Date());
};

/**
 * Verifica se uma data é igual a hoje (comparando apenas dia/mês/ano)
 * @param date - Data como string (ISO) ou objeto Date
 * @returns true se a data é hoje, false caso contrário
 */
export const isToday = (date: string | Date): boolean => {
  const dateString = toDateString(date);
  const todayString = getTodayString();
  return dateString === todayString;
};

/**
 * Verifica se uma data é hoje ou no futuro (comparando apenas dia/mês/ano)
 * @param date - Data como string (ISO) ou objeto Date
 * @returns true se a data é hoje ou depois, false caso contrário
 */
export const isTodayOrAfter = (date: string | Date): boolean => {
  const dateString = toDateString(date);
  const todayString = getTodayString();
  return dateString >= todayString;
};

/**
 * Verifica se uma data é hoje ou no passado (comparando apenas dia/mês/ano)
 * @param date - Data como string (ISO) ou objeto Date
 * @returns true se a data é hoje ou antes, false caso contrário
 */
export const isTodayOrBefore = (date: string | Date): boolean => {
  const dateString = toDateString(date);
  const todayString = getTodayString();
  return dateString <= todayString;
};
