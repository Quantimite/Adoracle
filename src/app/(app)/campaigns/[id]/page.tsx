import CampaignDetailView from '@/frontend/views/campaigns/CampaignDetailView';
import { CampaignManager } from '@/frontend/components/campaigns/CampaignManager';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Campaigns you created in Adoracle (database ids) use the manager; the sample campaigns keep the analytics detail view.
export default function Page({ params }: { params: { id: string } }) {
  return UUID.test(params.id) ? <CampaignManager id={params.id} /> : <CampaignDetailView />;
}
