import PublicCampaignClient from './client';

export function generateStaticParams() {
  return [{ slug: '_' }];
}

export default function PublicCampaignPage() {
  return <PublicCampaignClient />;
}
