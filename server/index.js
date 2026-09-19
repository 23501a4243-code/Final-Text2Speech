import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/database.js';
import { 
  generateSpeech, 
  adjustTone, 
  adjustLength, 
  generateCueCards, 
  refineSection 
} from './controllers/speechController.js';
import {
  sendOtp,
  verifyOtp,
  getMe,
  logout,
  register,
  login,
} from './controllers/authController.js';
import {
  getSpeeches,
  getSpeech,
  saveSpeech,
  deleteSpeech,
  getVersions,
  createVersion,
} from './controllers/projectController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database on Startup
await db.init();

// Health Check
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiEngine: hasGemini ? 'gemini-2.5-flash' : hasOpenAI ? 'openai' : 'smart-local-engine',
    hasCustomKeysConfigured: hasGemini || hasOpenAI,
    databaseEngine: db.engine,
  });
});

// Speech AI Generation Endpoints
app.post('/api/generate-speech', generateSpeech);
app.post('/api/adjust-tone', adjustTone);
app.post('/api/adjust-length', adjustLength);
app.post('/api/generate-cue-cards', generateCueCards);
app.post('/api/refine-section', refineSection);

// Persistent Speech Project & Version History Endpoints
app.get('/api/speeches', getSpeeches);
app.get('/api/speeches/:id', getSpeech);
app.post('/api/speeches', saveSpeech);
app.delete('/api/speeches/:id', deleteSpeech);
app.get('/api/speeches/:id/versions', getVersions);
app.post('/api/speeches/:id/versions', createVersion);

// Authentication, Direct Registration & Real OTP Endpoints
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/send-otp', sendOtp);
app.post('/api/auth/verify-otp', verifyOtp);
app.get('/api/auth/me', getMe);
app.post('/api/auth/logout', logout);

app.listen(PORT, () => {
  const emailService = process.env.RESEND_API_KEY 
    ? 'Resend API' 
    : process.env.SENDGRID_API_KEY
    ? 'SendGrid API'
    : (process.env.SMTP_HOST && process.env.SMTP_USER)
    ? `SMTP (${process.env.SMTP_HOST})`
    : 'Ethereal Test Mailer (Add RESEND_API_KEY or SMTP to .env for custom domain)';

  console.log(`🎙️ ToastCraft AI Backend API Server running on port ${PORT}`);
  console.log(`⚡ AI Mode: ${process.env.GEMINI_API_KEY ? 'Google Gemini 2.5 Flash' : process.env.OPENAI_API_KEY ? 'OpenAI' : 'Smart Offline Fallback Engine Ready'}`);
  console.log(`🗄️ Database Engine: ${db.engine}`);
  console.log(`📧 Email Delivery Provider: ${emailService}`);
});
