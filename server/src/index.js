import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pip, projects, story, dreams } from './data.js';

import dns from 'node:dns';

dns.setServers(['10.228.50.137']);

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Requests from tools and server-to-server clients may not include Origin.
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(express.json({ limit: '20kb' }));
app.use('/api', rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

let mongoReady = false;
let entries = [];
let visits = 0;
let easterFound = 0;

const EntrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 30 },
  message: { type: String, required: true, trim: true, maxlength: 200 },
}, { timestamps: true });
const Entry = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
const CounterSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: Number, default: 0, min: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    database: mongoReady ? 'connected' : 'demo-memory',
    persistentStorage: mongoReady,
    time: new Date().toISOString(),
  });
});

app.get('/api/pip', (_req, res) => res.json(pip));
app.get('/api/projects', (_req, res) => res.json(projects));
app.get('/api/story', (_req, res) => res.json(story));
app.get('/api/dreams', (_req, res) => res.json(dreams));

app.get('/api/guestbook', async (_req, res, next) => {
  try {
    const result = mongoReady
      ? await Entry.find().sort({ createdAt: -1 }).limit(50).lean()
      : entries;
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/guestbook', rateLimit({ windowMs: 60_000, limit: 5 }), async (req, res, next) => {
  try {
    const parsed = z.object({
      name: z.string().trim().min(1).max(30),
      message: z.string().trim().min(1).max(200),
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Please add a name (max 30 characters) and message (max 200 characters).',
      });
    }

    if (mongoReady) {
      const doc = await Entry.create(parsed.data);
      return res.status(201).json(doc);
    }

    const item = { ...parsed.data, _id: randomUUID(), createdAt: new Date().toISOString() };
    entries = [item, ...entries].slice(0, 50);
    return res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

async function counterValue(key) {
  if (!mongoReady) return key === 'visits' ? visits : easterFound;
  const doc = await Counter.findOne({ key }).lean();
  return doc?.value || 0;
}

app.get('/api/visits', async (_req, res, next) => {
  try {
    res.json({ count: await counterValue('visits') });
  } catch (error) {
    next(error);
  }
});

app.post('/api/visits', async (_req, res, next) => {
  try {
    if (!mongoReady) {
      visits += 1;
      return res.json({ count: visits, persistent: false });
    }
    const counter = await Counter.findOneAndUpdate(
      { key: 'visits' },
      { $inc: { value: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return res.json({ count: counter.value, persistent: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/easter', async (_req, res, next) => {
  try {
    res.json({ found: await counterValue('easter') });
  } catch (error) {
    next(error);
  }
});

app.post('/api/easter', async (req, res, next) => {
  try {
    const parsed = z.object({ code: z.literal('nightcap') }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'That is not the secret.' });

    if (!mongoReady) {
      easterFound += 1;
      return res.json({ found: easterFound, persistent: false });
    }
    const counter = await Counter.findOneAndUpdate(
      { key: 'easter' },
      { $inc: { value: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return res.json({ found: counter.value, persistent: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/chat', rateLimit({
  windowMs: 60_000,
  limit: 10,
  message: { error: 'Pip needs a little rest. Try again in a minute.' },
}), async (req, res) => {
  const parsed = z.object({ message: z.string().trim().min(1).max(300) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Send a short message (max 300 characters).' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: '*yawn* My dream-radio is taking a tiny nap. Your message is safe here—come back soon, little star.' });
  }

  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: 'You are Pip, a sleepy, gentle skull baby and Junior Dream Engineer at Midnight Nursery. Be warm, cozy, playful, never scary. Answer in at most three short sentences. Do not claim to perform real-world actions.',
    });
    const result = await model.generateContent(parsed.data.message);
    return res.json({ reply: result.response.text() });
  } catch (error) {
    console.error('Chat provider request failed:', error?.message || 'Unknown error');
    return res.json({ reply: '*yawn* The dream-radio crackled for a moment. Please try asking me again, little star.' });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  // CORS rejection should not be reported as an internal server error.
  if (error?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'This website origin is not allowed.' });
  }
  console.error('API error:', error?.message || error);
  return res.status(500).json({ error: 'Something went wrong on Pip’s side. Please try again.' });
});

async function start() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8_000 });
      mongoReady = true;
      console.log('MongoDB connected; persistent storage enabled.');
    } catch (error) {
      mongoReady = false;
      console.error('MongoDB connection failed; starting in demo-memory mode:', error?.message || error);
    }
  } else {
    console.warn('MONGO_URI is not set. Guestbook and counters will use temporary in-memory storage.');
  }

  app.listen(PORT, () => console.log(`Pip API listening on port ${PORT}`));
}

start().catch((error) => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});
