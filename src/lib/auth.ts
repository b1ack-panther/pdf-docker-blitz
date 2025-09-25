import { AuthToken, LoginCredentials, User } from '@/types';

const STORAGE_KEY = 'skylark_auth_token';
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
  
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<{ token: string; user: User }>(response);
    
    const token: AuthToken = {
      token: result.token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      user: result.user,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
    return token;
  }

  async register(credentials: LoginCredentials): Promise<AuthToken> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const user = await this.handleResponse<User>(response);
    
    // After registration, automatically log in
    return this.login(credentials);
  }
  
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
  
  getCurrentToken(): AuthToken | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const token: AuthToken = JSON.parse(stored);
      if (new Date(token.expiresAt) < new Date()) {
        this.logout();
        return null;
      }
      return token;
    } catch {
      this.logout();
      return null;
    }
  }
  
  isAuthenticated(): boolean {
    return this.getCurrentToken() !== null;
  }
  
  getCurrentUser(): User | null {
    const token = this.getCurrentToken();
    return token?.user || null;
  }
}

export const authService = AuthService.getInstance();