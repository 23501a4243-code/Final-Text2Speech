import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'toastcraft_super_secret_jwt_key_2026_dev_mode';

function extractUserIdFromReq(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.id || null;
    }
  } catch {
    // Non-blocking for offline/guest mode
  }
  return null;
}

/**
 * GET /api/speeches
 * Get all saved speeches for the user or session
 */
export async function getSpeeches(req, res) {
  try {
    const userId = extractUserIdFromReq(req);
    const speeches = await db.getSpeeches(userId);
    res.json({ success: true, speeches });
  } catch (error) {
    console.error('getSpeeches error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/speeches/:id
 * Get a specific speech by ID
 */
export async function getSpeech(req, res) {
  try {
    const { id } = req.params;
    const speech = await db.getSpeechById(id);
    if (!speech) {
      return res.status(404).json({ success: false, error: 'Speech not found' });
    }
    const versions = await db.getSpeechVersions(id);
    res.json({ success: true, speech: { ...speech, versions } });
  } catch (error) {
    console.error('getSpeech error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/speeches
 * Save or update a speech project in the persistent database
 */
export async function saveSpeech(req, res) {
  try {
    const speechData = req.body;
    if (!speechData || !speechData.title || !speechData.content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const userId = extractUserIdFromReq(req) || speechData.userId || null;
    const saved = await db.saveSpeech({
      ...speechData,
      userId,
    });

    // If initial version is supplied or versions array exists, ensure recorded
    if (speechData.initialVersion) {
      await db.saveSpeechVersion(saved.id, {
        ...speechData.initialVersion,
        speechId: saved.id,
      });
    }

    res.json({ success: true, speech: saved });
  } catch (error) {
    console.error('saveSpeech error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/speeches/:id
 * Delete a speech and its version history
 */
export async function deleteSpeech(req, res) {
  try {
    const { id } = req.params;
    await db.deleteSpeech(id);
    res.json({ success: true, message: 'Speech deleted successfully' });
  } catch (error) {
    console.error('deleteSpeech error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/speeches/:id/versions
 * Get all version snapshots for a speech
 */
export async function getVersions(req, res) {
  try {
    const { id } = req.params;
    const versions = await db.getSpeechVersions(id);
    res.json({ success: true, versions });
  } catch (error) {
    console.error('getVersions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/speeches/:id/versions
 * Save a new version snapshot for a speech (manual edits, AI rewrites, or milestones)
 */
export async function createVersion(req, res) {
  try {
    const { id } = req.params;
    const versionData = req.body;

    if (!versionData || !versionData.content) {
      return res.status(400).json({ success: false, error: 'Version content is required' });
    }

    const words = versionData.content.trim().split(/\s+/).filter(w => w.length > 0);
    const version = await db.saveSpeechVersion(id, {
      ...versionData,
      speechId: id,
      wordCount: versionData.wordCount || words.length,
      timestamp: versionData.timestamp || Date.now(),
      label: versionData.label || 'Manual Edit',
      author: versionData.author || 'user',
    });

    res.json({ success: true, version });
  } catch (error) {
    console.error('createVersion error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
