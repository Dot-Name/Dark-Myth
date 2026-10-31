import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { promoteScheduled } from './services/blogService.js';

connectDB()
  .then(() => { promoteScheduled().catch((e) => console.error('Scheduled blog publishing failed:', e.message)); setInterval(() => promoteScheduled().catch((e) => console.error('Scheduled blog publishing failed:', e.message)), 60_000).unref(); app.listen(env.PORT, () => console.log(JSON.stringify({ level: 'info', msg: `API listening on ${env.PORT}` }))); })
  .catch((e) => {
    console.error('Failed to start server:', e.message);
    process.exit(1);
  });
