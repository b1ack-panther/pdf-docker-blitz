import { AuthToken, LoginCredentials, User } from '@/types';

const STORAGE_KEY = 'skylark_auth_token';

// Mock authentication service
export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would call backend API
    if (credentials.username === 'admin' && credentials.password === 'password') {
      const token: AuthToken = {
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        user: {
          id: '1',
          username: credentials.username,
          email: 'admin@skylarklabs.ai',
          createdAt: new Date(),
        },
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
      return token;
    }
    
    throw new Error('Invalid credentials');
  }

  async register(credentials: LoginCredentials): Promise<AuthToken> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, this would make API call to /register endpoint
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // For now, simulate successful registration and auto-login
      const token: AuthToken = {
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        user: {
          id: Date.now().toString(),
          username: credentials.username,
          email: `${credentials.username}@skylarklabs.ai`,
          createdAt: new Date(),
        },
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
      return token;
    } catch (error) {
      // Fallback to mock registration if API is not available
      if (credentials.username && credentials.password) {
        const token: AuthToken = {
          token: 'mock-jwt-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          user: {
            id: Date.now().toString(),
            username: credentials.username,
            email: `${credentials.username}@skylarklabs.ai`,
            createdAt: new Date(),
          },
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
        return token;
      }
      
      throw new Error('Registration failed');
    }
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