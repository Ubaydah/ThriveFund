import { app } from './app';
import { env } from './config/env';
import { db } from './config/database';

async function bootstrap() {
  try {
    await db.query('SELECT 1');
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`ThriveFund API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap();
