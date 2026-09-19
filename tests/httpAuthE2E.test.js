import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import cors from 'cors';
import { db } from '../server/db/database.js';
import { register, login } from '../server/controllers/authController.js';

describe('HTTP Endpoints End-to-End Test (/api/auth/register & /api/auth/login)', () => {
  let server;
  let port;
  let baseUrl;

  beforeAll(async () => {
    await db.init();
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.post('/api/auth/register', register);
    app.post('/api/auth/login', login);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('1. Rejects invalid registration when name is missing', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: `invalid_name_${Date.now()}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.field).toBe('name');
    expect(data.message).toBe('Full Name cannot be empty.');
  });

  it('2. Rejects invalid registration when confirm password does not match', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: `mismatch_${Date.now()}@example.com`,
        password: 'Password123!',
        confirmPassword: 'DifferentPassword456!',
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.field).toBe('confirmPassword');
    expect(data.message).toBe('Confirm Password must match Password.');
  });

  it('3. Successfully registers a new user with valid fields', async () => {
    const testEmail = `e2e_user_${Date.now()}@example.com`;
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: testEmail,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Account created successfully! Please sign in.');
    expect(data.user.email).toBe(testEmail);
    expect(data.user.name).toBe('Jane Doe');
  });

  it('4. Detects existing user and prevents duplicate account creation', async () => {
    const testEmail = `dup_check_${Date.now()}@example.com`;
    // First registration
    const res1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'First User',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    expect(res1.status).toBe(201);

    // Second registration with identical email
    const res2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Attempt',
        email: testEmail,
        password: 'Password999!',
        confirmPassword: 'Password999!',
      }),
    });
    const data2 = await res2.json();
    expect(res2.status).toBe(409);
    expect(data2.success).toBe(false);
    expect(data2.code).toBe('USER_EXISTS');
    expect(data2.message).toBe('User already exists. Please sign in.');
  });

  it('5. Rejects sign-in with wrong password', async () => {
    const testEmail = `login_test_${Date.now()}@example.com`;
    // Register
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Login User',
        email: testEmail,
        password: 'CorrectPassword123!',
        confirmPassword: 'CorrectPassword123!',
      }),
    });

    // Try wrong password
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!',
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid email or password.');
  });

  it('6. Successfully signs in registered user with correct credentials and returns JWT session', async () => {
    const testEmail = `success_login_${Date.now()}@example.com`;
    // Register
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Successful Speaker',
        email: testEmail,
        password: 'CorrectPassword123!',
        confirmPassword: 'CorrectPassword123!',
      }),
    });

    // Sign in
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'CorrectPassword123!',
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Signed in successfully! Welcome back.');
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe(testEmail);
    expect(data.user.name).toBe('Successful Speaker');
    expect(data.user.password).toBeUndefined();
    expect(data.user.passwordHash).toBeUndefined();
  });
});
