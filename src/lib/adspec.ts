// src/lib/adspec.ts
// What each ad manager actually asks for, so ONE setup can be translated into every platform.
// Hierarchy per platform (researched):
//   Meta      Campaign > Ad set > Ad            (6 ODAX objectives, Advantage+ campaign budget)
//   TikTok    Campaign > Ad group > Ad          (Manual or Smart+; objective, budget at campaign or ad group)
//   Google    Campaign > Ad group / Asset group > Ad / Asset   (Search, Performance Max, Demand Gen, Shopping...)
//   YouTube   Google Ads Video campaign > Ad group > Ad  (Shorts, in-stream, in-feed)
//   LinkedIn  Campaign group > Campaign > Ad    (objective + audience live at campaign level)

export type PlatformId = 'META' | 'TIKTOK' | 'GOOGLE' | 'YOUTUBE' | 'LINKEDIN';
export type ProviderKeyLite = 'meta' | 'google' | 'tiktok' | 'linkedin';
export type UniversalObjective = 'AWARENESS' | 'TRAFFIC' | 'ENGAGEMENT' | 'LEADS' | 'SALES' | 'APP';

export const ALL_PLATFORMS: PlatformId[] = ['META', 'TIKTOK', 'GOOGLE', 'YOUTUBE', 'LINKEDIN'];

export const OBJECTIVES: { id: UniversalObjective; label: string; desc: string }[] = [
  { id: 'AWARENESS', label: 'Awareness', desc: 'Show your brand to as many relevant people as possible' },
  { id: 'TRAFFIC', label: 'Traffic', desc: 'Send people to your website, app or profile' },
  { id: 'ENGAGEMENT', label: 'Engagement', desc: 'Get views, likes, comments, messages and follows' },
  { id: 'LEADS', label: 'Leads', desc: 'Collect sign-ups, enquiries and calls' },
  { id: 'SALES', label: 'Sales', desc: 'Drive purchases and conversions on your website or store' },
  { id: 'APP', label: 'App promotion', desc: 'Get installs and in-app actions' },
];

export interface Option {
  id: string;
  label: string;
  hint?: string;
}

export interface PlatformSpec {
  id: PlatformId;
  name: string;
  short: string;
  color: string;
  connectKey: ProviderKeyLite;
  managerName: string;
  /** Names of the 3 levels, in order */
  levels: [string, string, string];
  levelHelp: [string, string, string];
  objectiveMap: Record<UniversalObjective, string | null>;
  campaignTypes: Option[];
  conversionLocations: Option[];
  bidStrategies: Option[];
  placements: Option[];
  formats: Option[];
  ctas: string[];
  limits: { headline: number; primary: number; description: number };
  minDailyBudgetHint: string;
  specialCategories: string[];
  identityLabel: string;
  breakdowns: string[];
  adSetPlans: { single: string[]; test: string[] };
  /** Does the platform let you set the budget at the campaign level? */
  campaignBudget: boolean;
}

const COMMON_CTAS = ['Learn more', 'Shop now', 'Sign up', 'Get offer', 'Contact us', 'Book now', 'Download'];

export const SPECS: Record<PlatformId, PlatformSpec> = {
  META: {
    id: 'META',
    name: 'Meta (Facebook & Instagram)',
    short: 'Meta',
    color: '#0866FF',
    connectKey: 'meta',
    managerName: 'Meta Ads Manager',
    levels: ['Campaign', 'Ad set', 'Ad'],
    levelHelp: [
      'Objective, buying type, special ad category and (optionally) Advantage+ campaign budget',
      'Audience, placements, budget & schedule, optimization goal, bid strategy',
      'Identity (Page + Instagram), format, media, text, CTA, destination, tracking',
    ],
    objectiveMap: {
      AWARENESS: 'OUTCOME_AWARENESS',
      TRAFFIC: 'OUTCOME_TRAFFIC',
      ENGAGEMENT: 'OUTCOME_ENGAGEMENT',
      LEADS: 'OUTCOME_LEADS',
      SALES: 'OUTCOME_SALES',
      APP: 'OUTCOME_APP_PROMOTION',
    },
    campaignTypes: [
      { id: 'advantage', label: 'Advantage+ campaign', hint: 'Meta automates audience, placements & budget' },
      { id: 'manual', label: 'Manual campaign', hint: 'You control audience, placements & bids' },
    ],
    conversionLocations: [
      { id: 'website', label: 'Website' },
      { id: 'app', label: 'App' },
      { id: 'messaging', label: 'Messenger / Instagram / WhatsApp' },
      { id: 'instant_forms', label: 'Instant forms' },
      { id: 'calls', label: 'Calls' },
    ],
    bidStrategies: [
      { id: 'lowest_cost', label: 'Highest volume (lowest cost)' },
      { id: 'cost_cap', label: 'Cost per result goal (cost cap)' },
      { id: 'bid_cap', label: 'Bid cap' },
      { id: 'roas_goal', label: 'ROAS goal' },
    ],
    placements: [
      { id: 'fb_feed', label: 'Facebook Feed' },
      { id: 'fb_reels', label: 'Facebook Reels' },
      { id: 'fb_stories', label: 'Facebook Stories' },
      { id: 'ig_feed', label: 'Instagram Feed' },
      { id: 'ig_reels', label: 'Instagram Reels' },
      { id: 'ig_stories', label: 'Instagram Stories' },
      { id: 'ig_explore', label: 'Instagram Explore' },
      { id: 'messenger', label: 'Messenger' },
      { id: 'audience_network', label: 'Audience Network' },
    ],
    formats: [
      { id: 'single_image', label: 'Single image' },
      { id: 'single_video', label: 'Single video' },
      { id: 'carousel', label: 'Carousel' },
      { id: 'collection', label: 'Collection' },
      { id: 'catalog', label: 'Catalog (Dynamic product ads)' },
    ],
    ctas: [...COMMON_CTAS, 'Send message', 'Watch more'],
    limits: { headline: 40, primary: 125, description: 30 },
    minDailyBudgetHint: 'about $1/day per ad set (higher for faster learning)',
    specialCategories: ['None', 'Credit', 'Employment', 'Housing', 'Social issues, elections or politics'],
    identityLabel: 'Facebook Page + Instagram account',
    breakdowns: ['Age', 'Gender', 'Placement', 'Device', 'Region', 'Day of week'],
    adSetPlans: {
      single: ['Broad (Advantage+ audience)'],
      test: ['Broad (Advantage+ audience)', 'Interest stack', 'Lookalike 1–3%'],
    },
    campaignBudget: true,
  },
  TIKTOK: {
    id: 'TIKTOK',
    name: 'TikTok Ads',
    short: 'TikTok',
    color: '#111111',
    connectKey: 'tiktok',
    managerName: 'TikTok Ads Manager',
    levels: ['Campaign', 'Ad group', 'Ad'],
    levelHelp: [
      'Objective, campaign type (Manual / Smart+ / Search) and campaign budget',
      'Placements, targeting (automatic or custom), budget & schedule, optimization, bidding',
      'Identity, video / image, text, CTA, landing page, tracking',
    ],
    objectiveMap: {
      AWARENESS: 'REACH',
      TRAFFIC: 'TRAFFIC',
      ENGAGEMENT: 'VIDEO_VIEWS',
      LEADS: 'LEAD_GENERATION',
      SALES: 'SALES (Website conversions)',
      APP: 'APP_PROMOTION',
    },
    campaignTypes: [
      { id: 'smart_plus', label: 'Smart+ campaign', hint: 'AI automates targeting, budget and creative combos' },
      { id: 'manual', label: 'Manual campaign', hint: 'Full control of targeting, placements and bids' },
    ],
    conversionLocations: [
      { id: 'website', label: 'Website' },
      { id: 'app', label: 'App' },
      { id: 'instant_form', label: 'Instant form' },
      { id: 'tiktok_shop', label: 'TikTok Shop' },
    ],
    bidStrategies: [
      { id: 'lowest_cost', label: 'Maximum delivery (lowest cost)' },
      { id: 'cost_cap', label: 'Cost cap' },
      { id: 'value_optimization', label: 'Value optimization (ROAS)' },
    ],
    placements: [
      { id: 'tiktok', label: 'TikTok (For You feed)' },
      { id: 'pangle', label: 'Pangle (partner apps)' },
      { id: 'global_app_bundle', label: 'Global App Bundle' },
    ],
    formats: [
      { id: 'single_video', label: 'Single video (In-Feed)' },
      { id: 'spark', label: 'Spark Ad (boost an existing post)' },
      { id: 'carousel', label: 'Image carousel' },
      { id: 'catalog', label: 'Catalog / Video Shopping' },
    ],
    ctas: [...COMMON_CTAS, 'Watch now', 'Apply now'],
    limits: { headline: 100, primary: 100, description: 100 },
    minDailyBudgetHint: 'typically $50/day per campaign and $20/day per ad group',
    specialCategories: ['None', 'Credit', 'Employment', 'Housing'],
    identityLabel: 'TikTok identity (custom or authorized account)',
    breakdowns: ['Age', 'Gender', 'Placement', 'Country / region', 'Device OS', 'Day of week'],
    adSetPlans: {
      single: ['Automatic targeting'],
      test: ['Automatic targeting', 'Interest & behavior', 'Custom / lookalike audience'],
    },
    campaignBudget: true,
  },
  GOOGLE: {
    id: 'GOOGLE',
    name: 'Google Ads (Search & Shopping)',
    short: 'Google',
    color: '#4285F4',
    connectKey: 'google',
    managerName: 'Google Ads',
    levels: ['Campaign', 'Ad group / Asset group', 'Ad / Asset'],
    levelHelp: [
      'Goal, campaign type (Search, Performance Max, Demand Gen, Shopping), budget, bidding, networks, locations',
      'Keywords & match types (Search) or audience signals & assets (Performance Max)',
      'Responsive search ad headlines & descriptions, images, sitelinks, final URL',
    ],
    objectiveMap: {
      AWARENESS: 'Brand awareness and reach',
      TRAFFIC: 'Website traffic',
      ENGAGEMENT: 'Product and brand consideration',
      LEADS: 'Leads',
      SALES: 'Sales',
      APP: 'App promotion',
    },
    campaignTypes: [
      { id: 'search', label: 'Search', hint: 'Text ads when people search on Google' },
      { id: 'pmax', label: 'Performance Max', hint: 'One campaign across Search, YouTube, Display, Gmail, Maps' },
      { id: 'demand_gen', label: 'Demand Gen', hint: 'Visual ads on YouTube, Discover and Gmail' },
      { id: 'shopping', label: 'Shopping', hint: 'Product listings from your Merchant Center feed' },
    ],
    conversionLocations: [
      { id: 'website', label: 'Website' },
      { id: 'app', label: 'App' },
      { id: 'phone', label: 'Phone calls' },
      { id: 'store', label: 'Store visits' },
    ],
    bidStrategies: [
      { id: 'max_conversions', label: 'Maximize conversions' },
      { id: 'target_cpa', label: 'Target CPA' },
      { id: 'max_conversion_value', label: 'Maximize conversion value' },
      { id: 'target_roas', label: 'Target ROAS' },
      { id: 'max_clicks', label: 'Maximize clicks' },
    ],
    placements: [
      { id: 'google_search', label: 'Google Search' },
      { id: 'search_partners', label: 'Search partners' },
      { id: 'display', label: 'Display Network' },
      { id: 'shopping_tab', label: 'Shopping tab' },
    ],
    formats: [
      { id: 'rsa', label: 'Responsive search ad' },
      { id: 'pmax_assets', label: 'Performance Max asset group' },
      { id: 'demand_gen_image', label: 'Demand Gen image / video' },
      { id: 'shopping_product', label: 'Product listing ad' },
    ],
    ctas: ['Learn more', 'Shop now', 'Sign up', 'Get quote', 'Contact us', 'Book now', 'Download'],
    limits: { headline: 30, primary: 90, description: 90 },
    minDailyBudgetHint: 'no fixed minimum; $10+/day recommended for Search',
    specialCategories: ['None', 'Financial products', 'Employment', 'Housing', 'Political'],
    identityLabel: 'Google Ads customer account',
    breakdowns: ['Device', 'Network', 'Location', 'Hour of day', 'Day of week', 'Search term'],
    adSetPlans: {
      single: ['Exact + phrase match keywords'],
      test: ['Exact match (high intent)', 'Phrase match (discovery)', 'Broad match + smart bidding'],
    },
    campaignBudget: true,
  },
  YOUTUBE: {
    id: 'YOUTUBE',
    name: 'YouTube (Shorts & Video)',
    short: 'YouTube',
    color: '#FF0000',
    connectKey: 'google',
    managerName: 'Google Ads · Video campaigns',
    levels: ['Video campaign', 'Ad group', 'Video ad'],
    levelHelp: [
      'Goal, subtype (Video views, Efficient reach, Drive conversions), budget, bidding, locations',
      'Audience segments, demographics, content & topics, placements (Shorts, in-stream, in-feed)',
      'YouTube video, headline, description, CTA, final URL, companion banner',
    ],
    objectiveMap: {
      AWARENESS: 'Brand awareness and reach',
      TRAFFIC: 'Website traffic',
      ENGAGEMENT: 'Product and brand consideration',
      LEADS: 'Leads',
      SALES: 'Sales',
      APP: 'App promotion',
    },
    campaignTypes: [
      { id: 'video_views', label: 'Video views', hint: 'Get more people to watch your video' },
      { id: 'efficient_reach', label: 'Efficient reach', hint: 'Cost-effective reach with bumpers & in-stream' },
      { id: 'drive_conversions', label: 'Drive conversions', hint: 'Actions on your site from video viewers' },
    ],
    conversionLocations: [
      { id: 'website', label: 'Website' },
      { id: 'app', label: 'App' },
      { id: 'channel', label: 'YouTube channel' },
    ],
    bidStrategies: [
      { id: 'max_cpv', label: 'Maximum CPV (cost per view)' },
      { id: 'target_cpm', label: 'Target CPM' },
      { id: 'target_cpa', label: 'Target CPA' },
      { id: 'max_conversions', label: 'Maximize conversions' },
    ],
    placements: [
      { id: 'shorts', label: 'YouTube Shorts' },
      { id: 'in_stream', label: 'In-stream (skippable)' },
      { id: 'in_feed', label: 'In-feed video' },
      { id: 'bumper', label: 'Bumper (6 sec)' },
    ],
    formats: [
      { id: 'skippable_in_stream', label: 'Skippable in-stream' },
      { id: 'shorts_video', label: 'Vertical video (Shorts)' },
      { id: 'in_feed', label: 'In-feed video' },
      { id: 'bumper', label: 'Bumper' },
    ],
    ctas: ['Learn more', 'Shop now', 'Sign up', 'Subscribe', 'Watch more', 'Book now', 'Download'],
    limits: { headline: 15, primary: 70, description: 70 },
    minDailyBudgetHint: 'no fixed minimum; $10+/day recommended',
    specialCategories: ['None'],
    identityLabel: 'YouTube channel',
    breakdowns: ['Age', 'Gender', 'Device', 'Placement', 'Location', 'Day of week'],
    adSetPlans: {
      single: ['Affinity + in-market audiences'],
      test: ['Affinity audiences', 'In-market audiences', 'Custom segments (search intent)'],
    },
    campaignBudget: true,
  },
  LINKEDIN: {
    id: 'LINKEDIN',
    name: 'LinkedIn Ads',
    short: 'LinkedIn',
    color: '#0A66C2',
    connectKey: 'linkedin',
    managerName: 'LinkedIn Campaign Manager',
    levels: ['Campaign group', 'Campaign', 'Ad'],
    levelHelp: [
      'Groups related campaigns and shares an overall budget and schedule',
      'Objective, audience (job title, industry, company size), format, budget, bidding',
      'Intro text, headline, image / video / document, CTA, destination',
    ],
    objectiveMap: {
      AWARENESS: 'BRAND_AWARENESS',
      TRAFFIC: 'WEBSITE_VISIT',
      ENGAGEMENT: 'ENGAGEMENT',
      LEADS: 'LEAD_GENERATION',
      SALES: 'WEBSITE_CONVERSION',
      APP: null,
    },
    campaignTypes: [
      { id: 'sponsored_content', label: 'Sponsored Content', hint: 'Single image, video, carousel, document ads in the feed' },
      { id: 'message_ads', label: 'Message Ads', hint: 'Direct messages to LinkedIn inboxes' },
      { id: 'text_dynamic', label: 'Text & Dynamic Ads', hint: 'Right-rail ads' },
    ],
    conversionLocations: [
      { id: 'website', label: 'Website' },
      { id: 'lead_gen_form', label: 'LinkedIn Lead Gen Form' },
    ],
    bidStrategies: [
      { id: 'max_delivery', label: 'Maximum delivery (automated)' },
      { id: 'cost_cap', label: 'Cost cap' },
      { id: 'manual_cpc', label: 'Manual bidding' },
    ],
    placements: [
      { id: 'linkedin_feed', label: 'LinkedIn feed' },
      { id: 'audience_network', label: 'LinkedIn Audience Network' },
    ],
    formats: [
      { id: 'single_image', label: 'Single image' },
      { id: 'single_video', label: 'Video' },
      { id: 'carousel', label: 'Carousel' },
      { id: 'document', label: 'Document ad' },
    ],
    ctas: ['Learn more', 'Sign up', 'Register', 'Download', 'Request demo', 'Apply', 'Subscribe'],
    limits: { headline: 70, primary: 150, description: 100 },
    minDailyBudgetHint: 'typically $10/day minimum per campaign',
    specialCategories: ['None'],
    identityLabel: 'LinkedIn Company Page',
    breakdowns: ['Job title', 'Industry', 'Company size', 'Seniority', 'Location', 'Day of week'],
    adSetPlans: {
      single: ['Job title + industry'],
      test: ['Job title + industry', 'Seniority + company size', 'Matched audience / lookalike'],
    },
    campaignBudget: false,
  },
};

export const DEFAULT_SPLIT_WEIGHTS: Record<PlatformId, number> = {
  META: 35,
  TIKTOK: 25,
  GOOGLE: 20,
  YOUTUBE: 12,
  LINKEDIN: 8,
};
