import express from 'express';
import path from 'path';
import { apiRouter } from './routes/api';
import { renderBlade, bladeMiddleware } from './utils/bladeEngine';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, Images)
app.use(express.static(path.join(process.cwd(), 'public')));

// Register Blade Template Middleware
app.use(bladeMiddleware());

// API Routes
app.use('/api', apiRouter);

// Main UI Chat Interface Route (Blade View)
app.get('/', (req, res) => {
  try {
    const html = renderBlade('chat', {
      title: 'Bayyinah - AI Agent Pengetahuan Islam & RAG Engine'
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error rendering Blade view:', error);
    res.status(500).send('Error rendering view');
  }
});

// Baca Quran UI Route
app.get('/baca-quran', (req, res) => {
  try {
    const html = renderBlade('quran', {
      title: 'Baca Al-Qur\'an - Bayyinah AI'
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error rendering Blade view:', error);
    res.status(500).send('Error rendering view');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
