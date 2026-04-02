/**
 * Tratamento Centralizado de Erros
 * Mapeia erros do servidor para mensagens amigáveis em português
 */

/**
 * Extrai mensagem de erro do servidor
 * Remove textos genéricos e pega só o essencial
 */
export function extrairMensagemErro(erro: unknown): string {
  // Se for um Error object
  if (erro instanceof Error) {
    const msg = erro.message;
    
    // Mapeia erros comuns do servidor
    const mapeamentos: Record<string, string> = {
      // Auth
      'Email ou senha inválidos': 'Email ou senha incorretos',
      'Este email já está registrado': 'Este email já está em uso',
      'Sem refresh token': 'Sessão expirada, faça login novamente',
      'Refresh token inválido': 'Sessão expirada, faça login novamente',
      'Refresh token não corresponde': 'Sessão expirada, faça login novamente',
      'Token de reset inválido': 'Link de recuperação inválido ou expirado',
      'Token de reset expirou': 'Link de recuperação expirado',
      
      // Sessions
      'Sessão não encontrada': 'Sessão não existe mais',
      'Você não tem acesso a esta sessão': 'Acesso negado',
      
      // Reviews
      'Revisão não encontrada': 'Revisão não existe mais',
      'Você não tem acesso a esta revisão': 'Acesso negado',
      
      // Generic
      'Não autorizado': 'Você não tem permissão',
      'Erro ao fetch': 'Problemas de conexão. Verifique sua internet',
      'Failed to fetch': 'Servidor indisponível. Tente novamente',
    };

    // Procura mapeamento exato
    for (const [chave, valor] of Object.entries(mapeamentos)) {
      if (msg.includes(chave)) {
        return valor;
      }
    }

    // Se não encontrou mapeamento, retorna mensagem original (mais limpa)
    // Remove prefixos genéricos como "Error: "
    return msg.replace(/^(Error:|Erro:)\s*/i, '').trim();
  }

  // Se for um objeto com propriedade message
  if (typeof erro === 'object' && erro !== null && 'message' in erro) {
    return String((erro as any).message);
  }

  // Se for uma string
  if (typeof erro === 'string') {
    return erro;
  }

  // Fallback
  return 'Ocorreu um erro. Tente novamente.';
}

/**
 * Parse de erro HTTP do servidor
 * Extrai a mensagem mais relevante da resposta JSON
 */
export function parseErroServidor(texto: string): string {
  try {
    const json = JSON.parse(texto);
    
    // Backend retorna:
    // { success: false, message: "..." } ou
    // { sucesso: false, mensagem: "..." } ou
    // { success: false, message: "...", errors: [...] }
    
    const mensagem = json.message || json.mensagem;
    const erros = json.errors || json.erros;
    
    if (erros && Array.isArray(erros) && erros.length > 0) {
      // Se tem array de erros, pega o primeiro
      return erros[0];
    }
    
    if (mensagem) {
      return mensagem;
    }
  } catch {
    // Se não conseguiu fazer parse, ignora
  }

  return 'Erro no servidor';
}

/**
 * Trata erros de fetch com status HTTP específico
 */
export function tratarErroHttp(status: number): string {
  const mapeamentos: Record<number, string> = {
    400: 'Dados inválidos. Verifique os campos.',
    401: 'Não autorizado. Faça login novamente.',
    403: 'Acesso negado.',
    404: 'Recurso não encontrado.',
    409: 'Conflito. Este item já existe.',
    429: 'Muitas tentativas. Aguarde alguns momentos.',
    500: 'Erro no servidor. Tente novamente mais tarde.',
    502: 'Servidor indisponível.',
    503: 'Serviço temporariamente indisponível.',
  };

  return mapeamentos[status] || `Erro ${status}. Tente novamente.`;
}

/**
 * Validação de erro customizado com mensagem amigável
 */
export class ErroPersonalizado extends Error {
  constructor(public mensagem: string, public statusCode?: number) {
    super(mensagem);
    this.name = 'ErroPersonalizado';
  }
}
