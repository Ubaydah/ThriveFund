import type { Request, Response, NextFunction } from 'express';
import { ok } from '../../lib/response';

const CATEGORIES = [
  { slug: 'community_project', label: 'Community Project' },
  { slug: 'wedding',           label: 'Wedding' },
  { slug: 'religious',         label: 'Religious' },
  { slug: 'education',         label: 'Education' },
  { slug: 'business',          label: 'Business' },
  { slug: 'personal',          label: 'Personal' },
];

const BANKS = [
  { code: 'first_bank', name: 'First Bank' },
  { code: 'gtbank',     name: 'GTBank' },
  { code: 'zenith',     name: 'Zenith Bank' },
  { code: 'uba',        name: 'UBA' },
  { code: 'access',     name: 'Access Bank' },
];

const FAQS = [
  { question: 'What is ThriveFund?',              answer: 'A platform for goal-based savings and group contributions using dedicated virtual accounts.' },
  { question: 'Which banks are supported?',        answer: 'First Bank, GTBank, Zenith Bank, UBA, and Access Bank.' },
  { question: 'How does a virtual account work?', answer: 'Each goal gets a unique bank account number. Any transfer to that number is automatically matched to your goal.' },
  { question: 'Is my money safe?',                answer: 'All payments are processed by Nomba, a CBN-licensed payment provider.' },
];

export const contentController = {
  categories(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, CATEGORIES); } catch (err) { next(err); }
  },

  banks(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, BANKS); } catch (err) { next(err); }
  },

  faqs(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, FAQS); } catch (err) { next(err); }
  },
};
