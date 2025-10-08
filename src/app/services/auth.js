import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authService = {
  // Fazer login
  async login(email, senha) {
    try {
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ${response.status}: ${errorData || 'Credenciais inválidas'}`);
      }

      const data = await response.json();
      
      // Salvar token no cookie (expira em 7 dias)
      Cookies.set('token', data.token, { expires: 7 });
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Erro de conexão com o servidor');
    }
  },

  // Logout
  logout() {
    Cookies.remove('token');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    const token = Cookies.get('token');
    return !!token;
  },

  // Obter token
  getToken() {
    return Cookies.get('token');
  },

  // Fazer requisições autenticadas
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }
};