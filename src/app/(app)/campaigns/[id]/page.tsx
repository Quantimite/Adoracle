import { CampaignManager } from '@/frontend/components/campaigns/CampaignManager';

export default function Page({ params }: { params: { id: string } }) {
  return <CampaignManager id={params.id} />;
}
