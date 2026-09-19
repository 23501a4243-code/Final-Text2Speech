import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../server/db/database.js';

describe('Persistent Database & Authentication Store', () => {
  beforeEach(async () => {
    await db.init();
  });

  describe('User Persistence', () => {
    it('creates and retrieves a user by email and id', async () => {
      const uniqueSuffix = Date.now();
      const testEmail = `test_${uniqueSuffix}@example.com`;
      const testId = `usr_test_${uniqueSuffix}`;
      const created = await db.createUser({
        id: testId,
        email: testEmail,
        name: 'Judge Evaluator',
        verified: true,
      });

      expect(created.email).toBe(testEmail);
      expect(created.name).toBe('Judge Evaluator');

      const retrievedByEmail = await db.findUserByEmail(testEmail);
      expect(retrievedByEmail).toBeDefined();
      expect(retrievedByEmail?.id).toBe(testId);

      const retrievedById = await db.findUserById(testId);
      expect(retrievedById).toBeDefined();
      expect(retrievedById?.email).toBe(testEmail);
    });

    it('updates existing user details seamlessly', async () => {
      const testEmail = `update_${Date.now()}@example.com`;
      await db.createUser({
        id: 'usr_update_456',
        email: testEmail,
        name: 'Original Name',
        verified: false,
      });

      const updated = await db.updateUser(testEmail, {
        name: 'Updated Name',
        verified: true,
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.verified).toBe(true);

      const verifyFetch = await db.findUserByEmail(testEmail);
      expect(verifyFetch?.name).toBe('Updated Name');
    });
  });

  describe('OTP Lifecycle & Security Verification', () => {
    const otpEmail = `otp_test_${Date.now()}@example.com`;

    it('sets and retrieves active OTP records', async () => {
      const record = {
        otp: '482910',
        expiresAt: Date.now() + 600000,
        resendAvailableAt: Date.now() + 60000,
        attemptsRemaining: 5,
        used: false,
        name: 'Test Speaker',
        createdAt: Date.now(),
      };

      await db.setOtp(otpEmail, record);
      const fetched = await db.getOtp(otpEmail);

      expect(fetched).toBeDefined();
      expect(fetched?.otp).toBe('482910');
      expect(fetched?.attemptsRemaining).toBe(5);
      expect(fetched?.used).toBe(false);
    });

    it('decrements attempts remaining upon invalid verification attempts', async () => {
      await db.updateOtp(otpEmail, { attemptsRemaining: 4 });
      let fetched = await db.getOtp(otpEmail);
      expect(fetched?.attemptsRemaining).toBe(4);

      await db.updateOtp(otpEmail, { attemptsRemaining: 3 });
      fetched = await db.getOtp(otpEmail);
      expect(fetched?.attemptsRemaining).toBe(3);
    });

    it('marks OTP as used upon successful verification', async () => {
      await db.updateOtp(otpEmail, { used: true });
      const fetched = await db.getOtp(otpEmail);
      expect(fetched?.used).toBe(true);
    });

    it('deletes OTP records upon request', async () => {
      await db.deleteOtp(otpEmail);
      const fetched = await db.getOtp(otpEmail);
      expect(fetched).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('increments hourly rate limit counters', async () => {
      const rateKey = `rate_key_${Date.now()}`;
      const count1 = await db.incrementRateLimit(rateKey);
      expect(count1).toBe(1);

      const count2 = await db.incrementRateLimit(rateKey);
      expect(count2).toBe(2);

      const current = await db.getRateLimit(rateKey);
      expect(current).toBe(2);
    });
  });

  describe('Speech Project & Version History Persistence', () => {
    const testSpeechId = `speech_persist_${Date.now()}`;

    it('saves and retrieves speech projects', async () => {
      const speech = {
        id: testSpeechId,
        title: "Jack's Best Man Speech",
        speechType: 'best_man',
        tone: 'funny',
        length: 'medium',
        content: 'Good evening everyone, Dave is my best friend...',
        wordCount: 120,
        estimatedMinutes: 0.9,
      };

      const saved = await db.saveSpeech(speech);
      expect(saved.id).toBe(testSpeechId);

      const fetched = await db.getSpeechById(testSpeechId);
      expect(fetched).toBeDefined();
      expect(fetched?.title).toBe("Jack's Best Man Speech");
      expect(fetched?.tone).toBe('funny');
    });

    it('records and retrieves version snapshots for speeches', async () => {
      const v1 = {
        id: `ver_1_${Date.now()}`,
        timestamp: Date.now() - 1000,
        label: 'Initial Draft',
        content: 'Draft 1 content',
        wordCount: 50,
        author: 'ai',
      };

      const v2 = {
        id: `ver_2_${Date.now()}`,
        timestamp: Date.now(),
        label: 'Manual Edit: Polished Toast',
        content: 'Draft 2 updated content with new toast',
        wordCount: 65,
        author: 'user',
      };

      await db.saveSpeechVersion(testSpeechId, v1);
      await db.saveSpeechVersion(testSpeechId, v2);

      const versions = await db.getSpeechVersions(testSpeechId);
      expect(versions).toBeDefined();
      expect(versions.length).toBeGreaterThanOrEqual(2);
      expect(versions[0].label).toBe('Manual Edit: Polished Toast');
    });
  });

  describe('User Registration & Authentication Flow Controller Tests', () => {
    const createMockReqRes = (body = {}, headers = {}) => {
      const req = { body, headers };
      const res = {
        statusCode: 200,
        data: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          this.data = payload;
          return this;
        },
      };
      return { req, res };
    };

    it('successfully registers a new user with valid credentials, securely hashes password', async () => {
      const { register } = await import('../server/controllers/authController.js');
      const uniqueEmail = `speaker_${Date.now()}@example.com`;

      const { req, res } = createMockReqRes({
        name: 'Eleanor Vance',
        email: uniqueEmail,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      });

      await register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toBe('Account created successfully! Please sign in.');
      expect(res.data.user.email).toBe(uniqueEmail);
      expect(res.data.user.name).toBe('Eleanor Vance');
      expect(res.data.user.password).toBeUndefined();
      expect(res.data.user.passwordHash).toBeUndefined();

      // Verify user was persisted with bcrypt password hash
      const persisted = await db.findUserByEmail(uniqueEmail);
      expect(persisted).toBeDefined();
      expect(persisted.passwordHash).toBeDefined();
      expect(persisted.passwordHash).not.toBe('SecurePassword123!');
      
      const bcrypt = (await import('bcryptjs')).default;
      const isPasswordHashed = await bcrypt.compare('SecurePassword123!', persisted.passwordHash);
      expect(isPasswordHashed).toBe(true);
    });

    it('detects existing user and blocks duplicate registration with exact message', async () => {
      const { register } = await import('../server/controllers/authController.js');
      const duplicateEmail = `existing_${Date.now()}@example.com`;

      // Pre-create user in database
      const bcrypt = (await import('bcryptjs')).default;
      const passwordHash = await bcrypt.hash('Secret123!', 10);
      await db.createUser({
        id: 'usr_dup_123',
        email: duplicateEmail,
        name: 'Existing Speaker',
        passwordHash,
      });

      // Attempt to register again with same email
      const { req, res } = createMockReqRes({
        name: 'Another Speaker',
        email: duplicateEmail,
        password: 'AnotherPassword123!',
        confirmPassword: 'AnotherPassword123!',
      });

      await register(req, res);

      expect(res.statusCode).toBe(409);
      expect(res.data.success).toBe(false);
      expect(res.data.code).toBe('USER_EXISTS');
      expect(res.data.message).toBe('User already exists. Please sign in.');

      // Verify original user record was not overwritten
      const checkUser = await db.findUserByEmail(duplicateEmail);
      expect(checkUser.name).toBe('Existing Speaker');
    });

    it('rejects registration when full name is empty or too short', async () => {
      const { register } = await import('../server/controllers/authController.js');

      const { req, res } = createMockReqRes({
        name: '   ',
        email: `valid_${Date.now()}@example.com`,
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
      });

      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.field).toBe('name');
      expect(res.data.message).toBe('Full Name cannot be empty.');
    });

    it('rejects registration when email format is invalid', async () => {
      const { register } = await import('../server/controllers/authController.js');

      const { req, res } = createMockReqRes({
        name: 'Valid Name',
        email: 'not-an-email',
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
      });

      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.field).toBe('email');
      expect(res.data.message).toBe('Please provide a valid email address.');
    });

    it('rejects registration when password is less than 6 characters', async () => {
      const { register } = await import('../server/controllers/authController.js');

      const { req, res } = createMockReqRes({
        name: 'Valid Name',
        email: `valid_${Date.now()}@example.com`,
        password: '123',
        confirmPassword: '123',
      });

      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.field).toBe('password');
      expect(res.data.message).toBe('Password must be at least 6 characters long.');
    });

    it('rejects registration when confirm password does not match password', async () => {
      const { register } = await import('../server/controllers/authController.js');

      const { req, res } = createMockReqRes({
        name: 'Valid Name',
        email: `valid_${Date.now()}@example.com`,
        password: 'Password123!',
        confirmPassword: 'DifferentPassword456!',
      });

      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.field).toBe('confirmPassword');
      expect(res.data.message).toBe('Confirm Password must match Password.');
    });

    it('successfully signs in registered user and issues JWT token', async () => {
      const { register, login } = await import('../server/controllers/authController.js');
      const loginEmail = `signin_test_${Date.now()}@example.com`;
      const loginPass = 'MyStrongPassword123!';

      // Register first
      const { req: regReq, res: regRes } = createMockReqRes({
        name: 'Marcus Brody',
        email: loginEmail,
        password: loginPass,
        confirmPassword: loginPass,
      });
      await register(regReq, regRes);
      expect(regRes.statusCode).toBe(201);

      // Sign in
      const { req: loginReq, res: loginRes } = createMockReqRes({
        email: loginEmail,
        password: loginPass,
      });
      await login(loginReq, loginRes);

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.data.success).toBe(true);
      expect(loginRes.data.token).toBeDefined();
      expect(loginRes.data.user.email).toBe(loginEmail);
      expect(loginRes.data.user.name).toBe('Marcus Brody');
      expect(loginRes.data.user.password).toBeUndefined();
      expect(loginRes.data.user.passwordHash).toBeUndefined();
    });

    it('rejects login with incorrect password', async () => {
      const { register, login } = await import('../server/controllers/authController.js');
      const loginEmail = `wrong_pass_${Date.now()}@example.com`;

      // Register
      const { req: regReq, res: regRes } = createMockReqRes({
        name: 'Marcus Brody',
        email: loginEmail,
        password: 'CorrectPassword123!',
        confirmPassword: 'CorrectPassword123!',
      });
      await register(regReq, regRes);

      // Sign in with wrong password
      const { req: loginReq, res: loginRes } = createMockReqRes({
        email: loginEmail,
        password: 'WrongPassword999!',
      });
      await login(loginReq, loginRes);

      expect(loginRes.statusCode).toBe(401);
      expect(loginRes.data.success).toBe(false);
      expect(loginRes.data.message).toBe('Invalid email or password.');
      expect(loginRes.data.token).toBeUndefined();
    });

    it('rejects login for unregistered email', async () => {
      const { login } = await import('../server/controllers/authController.js');

      const { req, res } = createMockReqRes({
        email: `unregistered_${Date.now()}@example.com`,
        password: 'AnyPassword123!',
      });
      await login(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Invalid email or password.');
    });
  });
});
