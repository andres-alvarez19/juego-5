/**
 * AuthProvider - Manages authentication headers for API requests
 */
export class AuthProvider {
  private static instance: AuthProvider;
  private tokenKey = 'ufrogamelab_token';

  private constructor() {
    this.initFromUrl();
  }

  static getInstance(): AuthProvider {
    if (!AuthProvider.instance) {
      AuthProvider.instance = new AuthProvider();
    }
    return AuthProvider.instance;
  }

  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = this.getToken();
    
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get stored token from localStorage
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  /**
   * Store token in localStorage
   */
  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Remove token from localStorage
   */
  clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Initialize token from URL parameter (?token=...)
   */
  private initFromUrl(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');

      if (urlToken && urlToken.trim()) {
        this.setToken(urlToken.trim());
      }
    } catch (error) {
      console.error('Failed to initialize token from URL:', error);
    }
  }
}

export const authProvider = AuthProvider.getInstance();
