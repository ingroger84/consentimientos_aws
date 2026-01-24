import api from './api';

interface LoginResponse {
  access_token: string;
  user: any;
}

interface LogoutResponse {
  message: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse>;
  async login(data: { email: string; password: string }): Promise<LoginResponse>;
  async login(emailOrData: string | { email: string; password: string }, password?: string): Promise<LoginResponse> {
    let email: string;
    let pass: string;

    if (typeof emailOrData === 'string') {
      email = emailOrData;
      pass = password!;
    } else {
      email = emailOrData.email;
      pass = emailOrData.password;
    }

    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      password: pass,
    });
    return data;
  }

  async logout(): Promise<LogoutResponse> {
    const { data } = await api.post<LogoutResponse>('/auth/logout');
    return data;
  }

  async logoutAll(): Promise<{ message: string; count: number }> {
    const { data } = await api.post<{ message: string; count: number }>('/auth/logout-all');
    return data;
  }

  async validate(): Promise<any> {
    const { data } = await api.get('/auth/validate');
    return data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', {
      email,
    });
    return data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  }

  async magicLogin(token: string): Promise<LoginResponse> {
    const { data } = await api.get<LoginResponse>(`/auth/magic-login/${token}`);
    return data;
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
