require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const analyzeRoutes = require('./routes/analyze');

const app = express();

// Render automatically provides PORT
const PORT = process.env.PORT || 3001;

// If deployed behind proxy (Render / Vercel)
app.set('trust proxy', 1);

/* ===============================
   MIDDLEWARE
================================= */

// CORS Configuration (Allow all for now)
app.use(
  cors({
    origin: '*', // Later you can restrict to your Vercel domain
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);

app.use(express.json());

/* ===============================
   MULTER CONFIGURATION
================================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== '.vcf') {
      return cb(new Error('Only .vcf files are allowed'), false);
    }

    cb(null, true);
  }
});

// Make upload accessible in routes
app.set('upload', upload);

/* ===============================
   ROUTES
================================= */

app.use('/api', analyzeRoutes);

// Health Check Route (Important for Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   GLOBAL ERROR HANDLER
================================= */

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size exceeds 5MB limit'
      });
    }

    return res.status(400).json({
      error: err.message
    });
  }

  if (err.message === 'Only .vcf files are allowed') {
    return res.status(400).json({
      error: err.message
    });
  }

  return res.status(500).json({
    error: 'Internal server error'
  });
});

/* ===============================
   SERVER START
================================= */

app.listen(PORT, () => {
  console.log(`🚀 PharmaGuard backend running on port ${PORT}`);
});

module.exports = app;