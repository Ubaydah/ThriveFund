import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { goalsRouter } from './modules/goals/goals.routes';
import { virtualAccountsRouter } from './modules/virtual-accounts/virtual-accounts.routes';
import { transactionsRouter } from './modules/transactions/transactions.routes';
import { contributorsRouter } from './modules/contributors/contributors.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { communityRouter } from './modules/community/community.routes';
import { publicRouter } from './modules/public/public.routes';
import { contentRouter } from './modules/content/content.routes';
import { webhooksRouter } from './modules/webhooks/webhooks.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { healthRouter } from './modules/health/health.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

const API = '/api/v1';

app.use(`${API}/auth`, authRouter);
app.use(`${API}/users`, usersRouter);
app.use(`${API}/goals`, goalsRouter);
app.use(`${API}/virtual-accounts`, virtualAccountsRouter);
app.use(`${API}/transactions`, transactionsRouter);
app.use(`${API}/contributors`, contributorsRouter);
// analytics router handles both /dashboard/* and /analytics/*
app.use(`${API}/dashboard`, analyticsRouter);
app.use(`${API}/analytics`, analyticsRouter);
app.use(`${API}/notifications`, notificationsRouter);
app.use(`${API}/community-projects`, communityRouter);
app.use(`${API}/search`, communityRouter);
app.use(`${API}/public`, publicRouter);
app.use(`${API}/categories`, contentRouter);
app.use(`${API}/banks`, contentRouter);
app.use(`${API}/content`, contentRouter);
// webhooks live outside /api/v1 prefix
app.use('/api/webhooks', webhooksRouter);
app.use(`${API}/admin`, adminRouter);
app.use(`${API}/health`, healthRouter);
app.use('/health', healthRouter);

app.use(errorHandler);

export { app };
