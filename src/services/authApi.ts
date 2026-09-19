export interface AuthUser {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  lastLoginAt?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
  expiresInMinutes?: number;
  email?: string;
  deliveryProvider?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
  attemptsRemaining?: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  field?: string;
  code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

const API_BASE = '/api';

export async function registerApi(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || 'Registration failed.');
    error.field = data.field;
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || 'Sign in failed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function sendOtpApi(payload: { email: string; password?: string; name?: string }): Promise<SendOtpResponse> {
  const response = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP.');
  }
  return data;
}

export async function verifyOtpApi(payload: { email: string; otp: string }): Promise<VerifyOtpResponse> {
  const response = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || 'Verification failed.');
    error.attemptsRemaining = data.attemptsRemaining;
    throw error;
  }
  return data;
}

export async function getMeApi(token: string): Promise<{ success: boolean; user: AuthUser }> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch session.');
  }
  return data;
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch (err) {
    console.warn('Logout request failed:', err);
  }
}
