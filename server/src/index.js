import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3001;

async function start() {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (!isDemo) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection error (check IP whitelist):', err.message);
      console.warn('⚡ Temporarily running in Demo fallback mode so the app is accessible.');
      process.env.DEMO_MODE = 'true';
    }
  } else {
    console.log('⚡ Demo mode active — skipping database connection.');
  }

  app.listen(PORT, () => {
    const currentMode = process.env.DEMO_MODE === 'true' ? 'DEMO (fallback)' : 'PRODUCTION';
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Mode: ${currentMode}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
