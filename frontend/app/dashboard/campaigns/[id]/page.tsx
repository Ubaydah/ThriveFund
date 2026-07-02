import CampaignDetailClient from './client';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function CampaignDetailPage() {
  return <CampaignDetailClient />;
}
