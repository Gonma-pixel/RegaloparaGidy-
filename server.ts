import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface SavedDrawingRecord {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'drawings.json');
const DIST_DIR = path.join(__dirname, 'dist');

async function readDrawings(): Promise<SavedDrawingRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SavedDrawingRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeDrawings(items: SavedDrawingRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '16mb' }));

  app.get('/api/drawings', async (_req, res) => {
    const drawings = await readDrawings();
    res.json({ drawings });
  });

  app.get('/api/drawings/:id', async (req, res) => {
    const drawings = await readDrawings();
    const found = drawings.find((d) => d.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'Dibujo no encontrado' });
      return;
    }
    res.json({ drawing: found });
  });

  app.post('/api/drawings', async (req, res) => {
    const body = req.body as { dataUrl?: unknown; title?: unknown };
    const dataUrl = typeof body?.dataUrl === 'string' ? body.dataUrl : '';
    const title =
      typeof body?.title === 'string' && body.title.trim()
        ? body.title.trim().slice(0, 80)
        : 'Dibujo de nuestro lienzo mágico';

    if (!dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Formato de imagen inválido' });
      return;
    }

    const id = `dibujo-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    const record: SavedDrawingRecord = {
      id,
      title,
      dataUrl,
      createdAt: new Date().toISOString(),
    };

    const existing = await readDrawings();
    const updated = [record, ...existing].slice(0, 60);
    await writeDrawings(updated);

    res.status(201).json({ drawing: record });
  });

  app.delete('/api/drawings/:id', async (req, res) => {
    const existing = await readDrawings();
    const filtered = existing.filter((d) => d.id !== req.params.id);
    await writeDrawings(filtered);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(DIST_DIR));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

void startServer();
