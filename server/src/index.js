import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3001;
const DEMO_MODE = process.env.DEMO_MODE === 'true';

async function start() {
  if (!DEMO_MODE) {
    await connectDB();
  } else {
    console.log('⚡ Demo mode active — skipping database connection.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Mode: ${DEMO_MODE ? 'DEMO (no real APIs)' : 'PRODUCTION'}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
