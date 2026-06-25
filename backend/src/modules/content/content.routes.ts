import { Router } from 'express';
import { contentController } from './content.controller';

export const contentRouter = Router();

// All public — no auth required
// Mounted at /categories, /banks, /content in app.ts
contentRouter.get('/', contentController.categories);           // GET /categories
contentRouter.get('/supported', contentController.banks);       // GET /banks/supported
contentRouter.get('/faqs', contentController.faqs);             // GET /content/faqs
