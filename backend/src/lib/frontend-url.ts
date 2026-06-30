import { env } from '../config/env';

const frontendBaseUrl = () => env.FRONTEND_URL.replace(/\/+$/, '');

export function buildContributionUrl(slug: string) {
  return `${frontendBaseUrl()}/c/${encodeURIComponent(slug)}`;
}
