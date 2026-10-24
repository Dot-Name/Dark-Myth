import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

connectDB()
  .then(() => app.listen(env.PORT, () => console.log(JSON.stringify({ level: 'info', msg: `API listening on ${env.PORT}` }))))
  .catch((e) => {
    console.error('Failed to start server:', e.message);
    process.exit(1);
  });
