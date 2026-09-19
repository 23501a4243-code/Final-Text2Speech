import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and local persistence file path
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'toastcraft_db.json');

/**
 * ToastCraft AI Persistent Database Engine
 * 
 * Supports:
 * 1. PostgreSQL (via DATABASE_URL or POSTGRES_URL)
 * 2. MongoDB (via MONGODB_URI or MONGO_URI)
 * 3. Zero-Config Embedded Persistent JSON DB (Atomic disk-backed store for local/offline/demo uptime)
 */
class ToastCraftDatabase {
  constructor() {
    this.engine = 'embedded-persistent';
    this.isInitialized = false;
    this.pgPool = null;
    this.mongoClient = null;
    this.mongoDb = null;

    // In-memory cache backed by persistent file
    this.data = {
      users: {},
      otps: {},
      rateLimits: {},
      speeches: {},
      speechVersions: {},
    };

    this._saveTimeout = null;
  }

  /**
   * Initialize storage engine
   */
  async init() {
    if (this.isInitialized) return this;

    // Ensure data directory exists for embedded persistent storage
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.warn('Could not create data directory:', err.message);
      }
    }

    // 1. Try PostgreSQL if DATABASE_URL is configured
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      try {
        const { default: pg } = await import('pg');
        const { Pool } = pg;
        this.pgPool = new Pool({
          connectionString: connStr,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });

        // Test connection
        await this.pgPool.query('SELECT NOW()');
        await this._initPostgresTables();
        this.engine = 'postgresql';
        this.isInitialized = true;
        console.log('🗄️ Database: PostgreSQL Connected successfully');
        return this;
      } catch (err) {
        console.warn('⚠️ PostgreSQL connection failed, falling back to Embedded Persistent DB:', err.message);
      }
    }

    // 2. Try MongoDB if MONGODB_URI is configured
    if (process.env.MONGODB_URI || process.env.MONGO_URI) {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
      try {
        const { MongoClient } = await import('mongodb');
        this.mongoClient = new MongoClient(mongoUri);
        await this.mongoClient.connect();
        this.mongoDb = this.mongoClient.db(process.env.MONGO_DB_NAME || 'toastcraft');
        this.engine = 'mongodb';
        this.isInitialized = true;
        console.log('🗄️ Database: MongoDB Connected successfully');
        return this;
      } catch (err) {
        console.warn('⚠️ MongoDB connection failed, falling back to Embedded Persistent DB:', err.message);
      }
    }

    // 3. Fallback: Embedded Persistent JSON Database (Zero-Config)
    this._loadFromFile();
    this.engine = 'embedded-persistent';
    this.isInitialized = true;
    console.log(`🗄️ Database: Embedded Persistent Store Active (${DB_FILE})`);
    return this;
  }

  // ==========================================
  // Embedded File Persistence Helpers
  // ==========================================
  _loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          this.data = {
            users: parsed.users || {},
            otps: parsed.otps || {},
            rateLimits: parsed.rateLimits || {},
            speeches: parsed.speeches || {},
            speechVersions: parsed.speechVersions || {},
          };
        }
      }
    } catch (err) {
      console.warn('Error reading persistent db file, initializing fresh store:', err.message);
    }
  }

  _persistToFile() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed writing to persistent db file:', err.message);
    }
  }

  _scheduleSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => {
      this._persistToFile();
    }, 50);
  }

  // ==========================================
  // PostgreSQL Schema Setup
  // ==========================================
  async _initPostgresTables() {
    if (!this.pgPool) return;
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS otps (
        email VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(16) NOT NULL,
        expires_at BIGINT NOT NULL,
        resend_available_at BIGINT NOT NULL,
        attempts_remaining INT DEFAULT 5,
        used BOOLEAN DEFAULT FALSE,
        password_hash TEXT,
        name VARCHAR(255),
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rate_limits (
        key VARCHAR(255) PRIMARY KEY,
        count INT DEFAULT 1,
        updated_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS speeches (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        title TEXT NOT NULL,
        speech_type VARCHAR(64) NOT NULL,
        tone VARCHAR(32) NOT NULL,
        length VARCHAR(32) NOT NULL,
        content TEXT NOT NULL,
        answers JSONB,
        drafts JSONB,
        cue_cards JSONB,
        word_count INT,
        estimated_minutes NUMERIC,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS speech_versions (
        id VARCHAR(64) PRIMARY KEY,
        speech_id VARCHAR(64) REFERENCES speeches(id) ON DELETE CASCADE,
        timestamp BIGINT NOT NULL,
        label TEXT NOT NULL,
        content TEXT NOT NULL,
        word_count INT,
        tone VARCHAR(32),
        length VARCHAR(32),
        author VARCHAR(32) DEFAULT 'user',
        changes_summary TEXT
      );
    `;
    await this.pgPool.query(query);
  }

  // ==========================================
  // Users Repository
  // ==========================================
  async findUserByEmail(email) {
    if (!this.isInitialized) await this.init();
    const normalized = email.toLowerCase().trim();

    if (this.engine === 'postgresql') {
      const res = await this.pgPool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [normalized]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        passwordHash: r.password_hash,
        createdAt: r.created_at,
        lastLoginAt: r.last_login_at,
        verified: r.verified,
      };
    }

    if (this.engine === 'mongodb') {
      const doc = await this.mongoDb.collection('users').findOne({ email: normalized });
      return doc || null;
    }

    return this.data.users[normalized] || null;
  }

  async findUserById(id) {
    if (!this.isInitialized) await this.init();

    if (this.engine === 'postgresql') {
      const res = await this.pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        passwordHash: r.password_hash,
        createdAt: r.created_at,
        lastLoginAt: r.last_login_at,
        verified: r.verified,
      };
    }

    if (this.engine === 'mongodb') {
      const doc = await this.mongoDb.collection('users').findOne({ id });
      return doc || null;
    }

    return Object.values(this.data.users).find(u => u.id === id) || null;
  }

  async createUser(userData) {
    if (!this.isInitialized) await this.init();
    const normalized = userData.email.toLowerCase().trim();
    const user = {
      ...userData,
      email: normalized,
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLoginAt: userData.lastLoginAt || new Date().toISOString(),
      verified: userData.verified ?? true,
    };

    if (this.engine === 'postgresql') {
      await this.pgPool.query(
        `INSERT INTO users (id, email, name, password_hash, created_at, last_login_at, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
           last_login_at = EXCLUDED.last_login_at,
           verified = EXCLUDED.verified`,
        [user.id, user.email, user.name, user.passwordHash || null, user.createdAt, user.lastLoginAt, user.verified]
      );
      return user;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('users').updateOne(
        { email: normalized },
        { $set: user },
        { upsert: true }
      );
      return user;
    }

    this.data.users[normalized] = user;
    this._scheduleSave();
    return user;
  }

  async updateUser(email, updates) {
    if (!this.isInitialized) await this.init();
    const normalized = email.toLowerCase().trim();

    if (this.engine === 'postgresql') {
      const existing = await this.findUserByEmail(normalized);
      if (!existing) return null;
      const updated = { ...existing, ...updates };
      await this.pgPool.query(
        `UPDATE users SET name = $1, last_login_at = $2, verified = $3, password_hash = COALESCE($4, password_hash)
         WHERE email = $5`,
        [updated.name, updated.lastLoginAt, updated.verified, updates.passwordHash || null, normalized]
      );
      return updated;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('users').updateOne(
        { email: normalized },
        { $set: updates }
      );
      return await this.findUserByEmail(normalized);
    }

    if (!this.data.users[normalized]) return null;
    this.data.users[normalized] = {
      ...this.data.users[normalized],
      ...updates,
    };
    this._scheduleSave();
    return this.data.users[normalized];
  }

  // ==========================================
  // OTPs Repository
  // ==========================================
  async getOtp(email) {
    if (!this.isInitialized) await this.init();
    const normalized = email.toLowerCase().trim();

    if (this.engine === 'postgresql') {
      const res = await this.pgPool.query('SELECT * FROM otps WHERE email = $1 LIMIT 1', [normalized]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        email: r.email,
        otp: r.otp,
        expiresAt: Number(r.expires_at),
        resendAvailableAt: Number(r.resend_available_at),
        attemptsRemaining: r.attempts_remaining,
        used: r.used,
        passwordHash: r.password_hash,
        name: r.name,
        createdAt: Number(r.created_at),
      };
    }

    if (this.engine === 'mongodb') {
      return await this.mongoDb.collection('otps').findOne({ email: normalized });
    }

    return this.data.otps[normalized] || null;
  }

  async setOtp(email, record) {
    if (!this.isInitialized) await this.init();
    const normalized = email.toLowerCase().trim();
    const data = { ...record, email: normalized };

    if (this.engine === 'postgresql') {
      await this.pgPool.query(
        `INSERT INTO otps (email, otp, expires_at, resend_available_at, attempts_remaining, used, password_hash, name, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE SET
           otp = EXCLUDED.otp,
           expires_at = EXCLUDED.expires_at,
           resend_available_at = EXCLUDED.resend_available_at,
           attempts_remaining = EXCLUDED.attempts_remaining,
           used = EXCLUDED.used,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           created_at = EXCLUDED.created_at`,
        [
          normalized,
          data.otp,
          data.expiresAt,
          data.resendAvailableAt,
          data.attemptsRemaining,
          data.used,
          data.passwordHash || null,
          data.name || null,
          data.createdAt,
        ]
      );
      return data;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('otps').updateOne(
        { email: normalized },
        { $set: data },
        { upsert: true }
      );
      return data;
    }

    this.data.otps[normalized] = data;
    this._scheduleSave();
    return data;
  }

  async updateOtp(email, updates) {
    if (!this.isInitialized) await this.init();
    const normalized = email.toLowerCase().trim();

    if (this.engine === 'postgresql') {
      const current = await this.getOtp(normalized);
      if (!current) return null;
      const updated = { ...current, ...updates };
      await this.setOtp(normalized, updated);
      return updated;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('otps').updateOne(
        { email: normalized },
        { $set: updates }
      );
      return await this.getOtp(normalized);
    }

    if (!this.data.otps[normalized]) return null;
    this.data.otps[normalized] = {
      ...this.data.otps[normalized],
      ...updates,
    };
    this._scheduleSave();
    return this.data.otps[normalized];
  }

  async deleteOtp(email) {
    if (!this.isInitialized) await this.init();
    const normalized = email.toLowerCase().trim();

    if (this.engine === 'postgresql') {
      await this.pgPool.query('DELETE FROM otps WHERE email = $1', [normalized]);
      return true;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('otps').deleteOne({ email: normalized });
      return true;
    }

    delete this.data.otps[normalized];
    this._scheduleSave();
    return true;
  }

  async cleanupExpiredOtps(gracePeriodMs = 3600000) {
    if (!this.isInitialized) await this.init();
    const now = Date.now();

    if (this.engine === 'postgresql') {
      await this.pgPool.query('DELETE FROM otps WHERE expires_at < $1', [now - gracePeriodMs]);
      return;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('otps').deleteMany({ expiresAt: { $lt: now - gracePeriodMs } });
      return;
    }

    let modified = false;
    for (const [email, record] of Object.entries(this.data.otps)) {
      if (now > record.expiresAt + gracePeriodMs) {
        delete this.data.otps[email];
        modified = true;
      }
    }
    if (modified) this._scheduleSave();
  }

  // ==========================================
  // Rate Limits Repository
  // ==========================================
  async getRateLimit(key) {
    if (!this.isInitialized) await this.init();

    if (this.engine === 'postgresql') {
      const res = await this.pgPool.query('SELECT count FROM rate_limits WHERE key = $1', [key]);
      return res.rows.length > 0 ? res.rows[0].count : 0;
    }

    if (this.engine === 'mongodb') {
      const doc = await this.mongoDb.collection('rate_limits').findOne({ key });
      return doc ? doc.count : 0;
    }

    return this.data.rateLimits[key] || 0;
  }

  async incrementRateLimit(key) {
    if (!this.isInitialized) await this.init();

    if (this.engine === 'postgresql') {
      const res = await this.pgPool.query(
        `INSERT INTO rate_limits (key, count, updated_at)
         VALUES ($1, 1, $2)
         ON CONFLICT (key) DO UPDATE SET count = rate_limits.count + 1, updated_at = EXCLUDED.updated_at
         RETURNING count`,
        [key, Date.now()]
      );
      return res.rows[0].count;
    }

    if (this.engine === 'mongodb') {
      const res = await this.mongoDb.collection('rate_limits').findOneAndUpdate(
        { key },
        { $inc: { count: 1 }, $set: { updatedAt: Date.now() } },
        { upsert: true, returnDocument: 'after' }
      );
      return res?.count || 1;
    }

    const next = (this.data.rateLimits[key] || 0) + 1;
    this.data.rateLimits[key] = next;
    this._scheduleSave();
    return next;
  }

  // ==========================================
  // Speech Projects & Versions Repository
  // ==========================================
  async getSpeeches(userId = null) {
    if (!this.isInitialized) await this.init();

    if (this.engine === 'postgresql') {
      const res = userId 
        ? await this.pgPool.query('SELECT * FROM speeches WHERE user_id = $1 ORDER BY updated_at DESC', [userId])
        : await this.pgPool.query('SELECT * FROM speeches ORDER BY updated_at DESC');
      return res.rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        speechType: r.speech_type,
        tone: r.tone,
        length: r.length,
        content: r.content,
        answers: r.answers,
        drafts: r.drafts || [],
        cueCards: r.cue_cards || [],
        wordCount: r.word_count,
        estimatedMinutes: Number(r.estimated_minutes),
        createdAt: Number(r.created_at),
        updatedAt: Number(r.updated_at),
      }));
    }

    if (this.engine === 'mongodb') {
      const query = userId ? { userId } : {};
      return await this.mongoDb.collection('speeches').find(query).sort({ updatedAt: -1 }).toArray();
    }

    const all = Object.values(this.data.speeches);
    if (!userId) return all.sort((a, b) => b.updatedAt - a.updatedAt);
    return all.filter(s => s.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getSpeechById(id) {
    if (!this.isInitialized) await this.init();

    if (this.engine === 'postgresql') {
      const res = await this.pgPool.query('SELECT * FROM speeches WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        title: r.title,
        speechType: r.speech_type,
        tone: r.tone,
        length: r.length,
        content: r.content,
        answers: r.answers,
        drafts: r.drafts || [],
        cueCards: r.cue_cards || [],
        wordCount: r.word_count,
        estimatedMinutes: Number(r.estimated_minutes),
        createdAt: Number(r.created_at),
        updatedAt: Number(r.updated_at),
      };
    }

    if (this.engine === 'mongodb') {
      return await this.mongoDb.collection('speeches').findOne({ id });
    }

    return this.data.speeches[id] || null;
  }

  async saveSpeech(speech) {
    if (!this.isInitialized) await this.init();
    const now = Date.now();
    const item = {
      ...speech,
      id: speech.id || 'speech_' + Math.random().toString(36).substring(2, 9),
      createdAt: speech.createdAt || now,
      updatedAt: now,
    };

    if (this.engine === 'postgresql') {
      await this.pgPool.query(
        `INSERT INTO speeches (id, user_id, title, speech_type, tone, length, content, answers, drafts, cue_cards, word_count, estimated_minutes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           speech_type = EXCLUDED.speech_type,
           tone = EXCLUDED.tone,
           length = EXCLUDED.length,
           content = EXCLUDED.content,
           answers = EXCLUDED.answers,
           drafts = EXCLUDED.drafts,
           cue_cards = EXCLUDED.cue_cards,
           word_count = EXCLUDED.word_count,
           estimated_minutes = EXCLUDED.estimated_minutes,
           updated_at = EXCLUDED.updated_at`,
        [
          item.id,
          item.userId || null,
          item.title,
          item.speechType,
          item.tone,
          item.length,
          item.content,
          JSON.stringify(item.answers || {}),
          JSON.stringify(item.drafts || []),
          JSON.stringify(item.cueCards || []),
          item.wordCount || 0,
          item.estimatedMinutes || 0,
          item.createdAt,
          item.updatedAt,
        ]
      );
      return item;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('speeches').updateOne(
        { id: item.id },
        { $set: item },
        { upsert: true }
      );
      return item;
    }

    this.data.speeches[item.id] = item;
    this._scheduleSave();
    return item;
  }

  async deleteSpeech(id) {
    if (!this.isInitialized) await this.init();

    if (this.engine === 'postgresql') {
      await this.pgPool.query('DELETE FROM speeches WHERE id = $1', [id]);
      return true;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('speeches').deleteOne({ id });
      await this.mongoDb.collection('speech_versions').deleteMany({ speechId: id });
      return true;
    }

    delete this.data.speeches[id];
    delete this.data.speechVersions[id];
    this._scheduleSave();
    return true;
  }

  // Speech Versions (Manual Edits & Revisions)
  async getSpeechVersions(speechId) {
    if (!this.isInitialized) await this.init();

    if (this.engine === 'postgresql') {
      const res = await this.pgPool.query(
        'SELECT * FROM speech_versions WHERE speech_id = $1 ORDER BY timestamp DESC',
        [speechId]
      );
      return res.rows.map(r => ({
        id: r.id,
        speechId: r.speech_id,
        timestamp: Number(r.timestamp),
        label: r.label,
        content: r.content,
        wordCount: r.word_count,
        tone: r.tone,
        length: r.length,
        author: r.author,
        changesSummary: r.changes_summary,
      }));
    }

    if (this.engine === 'mongodb') {
      return await this.mongoDb.collection('speech_versions').find({ speechId }).sort({ timestamp: -1 }).toArray();
    }

    return (this.data.speechVersions[speechId] || []).slice().sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveSpeechVersion(speechId, version) {
    if (!this.isInitialized) await this.init();
    const item = {
      ...version,
      id: version.id || 'ver_' + Math.random().toString(36).substring(2, 9),
      speechId,
      timestamp: version.timestamp || Date.now(),
      author: version.author || 'user',
    };

    if (this.engine === 'postgresql') {
      await this.pgPool.query(
        `INSERT INTO speech_versions (id, speech_id, timestamp, label, content, word_count, tone, length, author, changes_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           label = EXCLUDED.label,
           content = EXCLUDED.content,
           changes_summary = EXCLUDED.changes_summary`,
        [
          item.id,
          speechId,
          item.timestamp,
          item.label,
          item.content,
          item.wordCount || 0,
          item.tone || null,
          item.length || null,
          item.author,
          item.changesSummary || null,
        ]
      );
      return item;
    }

    if (this.engine === 'mongodb') {
      await this.mongoDb.collection('speech_versions').updateOne(
        { id: item.id },
        { $set: item },
        { upsert: true }
      );
      return item;
    }

    if (!this.data.speechVersions[speechId]) {
      this.data.speechVersions[speechId] = [];
    }
    this.data.speechVersions[speechId].push(item);
    this._scheduleSave();
    return item;
  }
}

// Singleton database instance
export const db = new ToastCraftDatabase();
