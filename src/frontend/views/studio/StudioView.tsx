'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ShieldCheck,
  Send,
  Wand2,
  Link2,
  Play,
  Heart,
  MessageCircle,
  Share2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Users,
  Sparkles,
  Sliders,
  Plus,
  X,
  Briefcase,
  Search,
  Hash,
  Rocket,
  Calendar,
  Clock,
  DollarSign,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import { useMode } from '@/frontend/context/ModeContext';

type StudioPlatform = 'meta' | 'tiktok' | 'google' | 'linkedin';

interface ObjectiveOption {
  id: string;
  label: string;
  simpleDesc: string;
  optimizationGoals: string[];
  conversionLocations: string[];
}

interface PlatformSpec {
  id: StudioPlatform;
  name: string;
  shortName: string;
  trackingName: string;
  trackingDetail: string;
  aspectLabel: string;
  objectives: ObjectiveOption[];
  placements: string[];
  defaultPlacements: string[];
  placementPresetLabel?: string;
  placementPresetFilter?: (p: string) => boolean;
  specialSettings: {
    id: string;
    title: string;
    simpleDesc: string;
    recommended?: boolean;
  }[];
  defaultCustomAudiences: string[];
  availableCustomAudiences: string[];
  defaultInterests: string[];
  interestLabel: string;
  interestPlaceholder: string;
  defaultHeadline: string;
  defaultBody: string;
  defaultCta: string;
  avgCpc: number;
  avgCpm: number;
  convRate: number;
}

const STUDIO_PLATFORMS: Record<StudioPlatform, PlatformSpec> = {
  meta: {
    id: 'meta',
    name: 'Meta & Instagram',
    shortName: 'Meta',
    trackingName: 'Meta Conversions API (CAPI) Active',
    trackingDetail: 'Server-to-server purchase tracking & deduplication verified',
    aspectLabel: '4:5 Facebook Feed / 9:16 Reels',
    objectives: [
      {
        id: 'awareness',
        label: 'Awareness & Reach',
        simpleDesc: 'Show to the most people likely to remember your brand',
        optimizationGoals: ['Maximize Reach', 'Ad Recall Lift', 'ThruPlay Video Views'],
        conversionLocations: ['Facebook & Instagram Feeds', 'Reels & Stories'],
      },
      {
        id: 'traffic',
        label: 'Website Traffic',
        simpleDesc: 'Send high-intent visitors to your store or landing page',
        optimizationGoals: ['Landing Page Views', 'Link Clicks', 'Daily Unique Reach'],
        conversionLocations: ['Your Website', 'Instagram Profile', 'WhatsApp Chat'],
      },
      {
        id: 'engagement',
        label: 'Engagement & DMs',
        simpleDesc: 'Get post likes, comments, video views, or direct messages',
        optimizationGoals: ['Messenger & WhatsApp Chats', 'Post Engagement', 'ThruPlay Views'],
        conversionLocations: ['Messaging Apps (Messenger / WhatsApp)', 'On Your Ad'],
      },
      {
        id: 'leads',
        label: 'Customer Leads',
        simpleDesc: 'Collect emails, phone numbers, and quote requests easily',
        optimizationGoals: ['Instant Form Leads', 'Website Leads', 'Phone Calls'],
        conversionLocations: ['Meta Instant Form (1-Tap)', 'Your Website', 'Calls'],
      },
      {
        id: 'app',
        label: 'App Promotion',
        simpleDesc: 'Drive new iOS & Android app installs and signups',
        optimizationGoals: ['App Installs', 'In-App Purchases'],
        conversionLocations: ['App Store / Google Play'],
      },
      {
        id: 'sales',
        label: 'Online Sales',
        simpleDesc: 'Find buyers most likely to complete a checkout purchase',
        optimizationGoals: ['Purchases', 'Add to Cart', 'Initiate Checkout'],
        conversionLocations: ['Your Website', 'Website & Shop Catalog', 'WhatsApp Checkout'],
      },
    ],
    placements: [
      'Facebook Feed',
      'Facebook Reels',
      'Facebook Stories',
      'Facebook Marketplace',
      'Facebook Video Feeds',
      'Facebook Right Column',
      'Facebook Search Results',
      'Instagram Feed',
      'Instagram Reels',
      'Instagram Stories',
      'Instagram Explore',
      'Messenger Inbox',
      'Audience Network',
    ],
    defaultPlacements: [
      'Facebook Feed',
      'Facebook Reels',
      'Facebook Stories',
      'Facebook Marketplace',
      'Instagram Feed',
      'Instagram Reels',
    ],
    placementPresetLabel: 'Facebook Only (7)',
    placementPresetFilter: (p) => p.startsWith('Facebook'),
    specialSettings: [
      {
        id: 'adv-creative',
        title: 'Advantage+ Creative & Auto-Music',
        simpleDesc: 'Automatically adjusts brightness, aspect ratio, and trending audio per placement',
        recommended: true,
      },
      {
        id: 'use-existing-post',
        title: 'Preserve Social Proof (Likes & Comments)',
        simpleDesc: 'Keeps all organic likes and buyer comments attached when scaling the ad',
        recommended: true,
      },
      {
        id: 'retarget-cart',
        title: 'Dynamic Catalog & Cart Reminder',
        simpleDesc: 'Automatically shows the exact product a visitor viewed on your site',
      },
    ],
    defaultCustomAudiences: [
      'Website Visitors (Last 30 Days)',
      '2% Lookalike of Past Buyers',
    ],
    availableCustomAudiences: [
      'Website Visitors (Last 30 Days)',
      '2% Lookalike of Past Buyers',
      'Facebook & Instagram Engagers (90d)',
      'Customer Email List VIPs',
    ],
    defaultInterests: ['Online Shopping', 'Digital Marketing', 'E-Commerce Founders'],
    interestLabel: 'Buyer Interests & Behaviors',
    interestPlaceholder: 'Add interest (e.g., Fitness, Shopify, Fashion)...',
    defaultHeadline: 'Stop Wasting 40% of Your Ad Budget',
    defaultBody:
      'Manage Facebook, Instagram, TikTok, and Google ads in one calm workspace with automatic waste protection.',
    defaultCta: 'Start Free Trial',
    avgCpc: 1.15,
    avgCpm: 11.4,
    convRate: 0.052,
  },

  tiktok: {
    id: 'tiktok',
    name: 'TikTok Ads',
    shortName: 'TikTok',
    trackingName: 'TikTok Events API & Pixel Connected',
    trackingDetail: 'Advanced matching & SKAdNetwork attribution enabled',
    aspectLabel: '9:16 Full-Screen Sound-On Video',
    objectives: [
      {
        id: 'awareness',
        label: 'Reach & Brand Buzz',
        simpleDesc: 'Show your video to the maximum number of unique TikTok users',
        optimizationGoals: ['Unique Reach', 'Frequency-Capped Views'],
        conversionLocations: ['TikTok For You Feed'],
      },
      {
        id: 'traffic',
        label: 'Website & Store Visits',
        simpleDesc: 'Send viewers straight from For You feed to your website',
        optimizationGoals: ['Landing Page Views', 'Link Clicks'],
        conversionLocations: ['Your Website', 'TikTok Instant Page'],
      },
      {
        id: 'views',
        label: 'Video Views & Hook Test',
        simpleDesc: 'Get high-retention 6-second and full video watches cheaply',
        optimizationGoals: ['6-Second Focused Views', '2-Second Views'],
        conversionLocations: ['TikTok For You & Search'],
      },
      {
        id: 'community',
        label: 'Profile Follows & Interaction',
        simpleDesc: 'Grow your TikTok account followers and organic engagement',
        optimizationGoals: ['Profile Visits', 'New Followers'],
        conversionLocations: ['Your TikTok Profile'],
      },
      {
        id: 'leads',
        label: 'Instant Form Leads',
        simpleDesc: 'Collect signups with a fast auto-filled form inside TikTok',
        optimizationGoals: ['Instant Form Submissions', 'Higher-Intent Leads'],
        conversionLocations: ['TikTok Instant Form'],
      },
      {
        id: 'sales',
        label: 'Product & Shop Sales',
        simpleDesc: 'Drive direct checkout purchases on your site or TikTok Shop',
        optimizationGoals: ['Complete Payment', 'Add to Cart', 'Initiate Checkout'],
        conversionLocations: ['Your Website', 'TikTok Shop'],
      },
    ],
    placements: [
      'TikTok For You Feed',
      'TikTok Search Results (High Intent)',
      'TikTok Profile Feed',
      'TikTok Following Feed',
      'Pangle Partner App Network',
    ],
    defaultPlacements: [
      'TikTok For You Feed',
      'TikTok Search Results (High Intent)',
      'TikTok Profile Feed',
    ],
    placementPresetLabel: 'TikTok Core Only (4)',
    placementPresetFilter: (p) => p.startsWith('TikTok'),
    specialSettings: [
      {
        id: 'spark-ads',
        title: 'Spark Ads Mode (Boost Creator / Organic Post)',
        simpleDesc: 'Publishes from a real TikTok profile so every like & follow stays on your account',
        recommended: true,
      },
      {
        id: 'smart-plus',
        title: 'TikTok Smart+ Creative & Bid Optimizer',
        simpleDesc: 'Automatically tests hooks and shifts budget to videos with best 3-sec watch rate',
        recommended: true,
      },
      {
        id: 'search-toggle',
        title: 'Show in TikTok Search Results',
        simpleDesc: 'Displays your video when users search product reviews & recommendations',
        recommended: true,
      },
      {
        id: 'interactive-addon',
        title: 'Interactive Display Card & Promo Sticker',
        simpleDesc: 'Pops up a clickable discount badge after 3 seconds of watching',
      },
    ],
    defaultCustomAudiences: [
      'Watched 75%+ of Past TikTok Videos',
      'Website Visitors (Last 30 Days)',
    ],
    availableCustomAudiences: [
      'Watched 75%+ of Past TikTok Videos',
      'Website Visitors (Last 30 Days)',
      'TikTok Profile & Ad Engagers (30d)',
      '2% TikTok Lookalike Buyers',
    ],
    defaultInterests: ['#TikTokMadeMeBuyIt', 'Small Business', 'Tech & Productivity'],
    interestLabel: 'Hashtag & Video Creator Interactions',
    interestPlaceholder: 'Add hashtag or creator topic (e.g., #Skincare, #GymTok)...',
    defaultHeadline: 'The Tool Every Growing Store Uses in 2026',
    defaultBody:
      'We tested 5 ad tools and this one cut our wasted spend in half in 7 days.',
    defaultCta: 'Shop Now',
    avgCpc: 0.85,
    avgCpm: 8.2,
    convRate: 0.038,
  },

  google: {
    id: 'google',
    name: 'Google & YouTube',
    shortName: 'Google',
    trackingName: 'Google Enhanced Conversions & GA4 Active',
    trackingDetail: 'First-party hashed conversion tracking & Smart Bidding synced',
    aspectLabel: 'Search Text + YouTube Shorts 9:16',
    objectives: [
      {
        id: 'sales',
        label: 'All-in-One Sales (PMax)',
        simpleDesc: 'AI runs across Google Search, YouTube, Shopping & Gmail together',
        optimizationGoals: ['Maximize Conversion Value', 'Maximize Conversions'],
        conversionLocations: ['Your Website & Google Merchant Feed'],
      },
      {
        id: 'search',
        label: 'Google Search #1 Intent',
        simpleDesc: 'Appear right at the top when buyers search your exact keywords',
        optimizationGoals: ['Conversions (Target CPA)', 'Top of Page Impression Share'],
        conversionLocations: ['Google Search Results'],
      },
      {
        id: 'shorts',
        label: 'YouTube Shorts & Video',
        simpleDesc: 'Show engaging vertical & skippable video demos on YouTube',
        optimizationGoals: ['Target CPM Reach', 'Engaged Video Views'],
        conversionLocations: ['YouTube Shorts & In-Stream'],
      },
      {
        id: 'leads',
        label: 'Phone Calls & Quote Leads',
        simpleDesc: 'Capture high-intent local and national service inquiries',
        optimizationGoals: ['Lead Form Submits', 'Direct Phone Calls'],
        conversionLocations: ['Your Website', 'Google Call Asset'],
      },
      {
        id: 'awareness',
        label: 'YouTube Brand Reach',
        simpleDesc: 'Reach broad audiences watching relevant YouTube channels',
        optimizationGoals: ['Target CPM', 'Ad Recall Lift'],
        conversionLocations: ['YouTube Home & Watch Pages'],
      },
    ],
    placements: [
      'Google Search Top #1',
      'YouTube Shorts',
      'YouTube In-Stream Skippable',
      'Google Shopping Tab',
      'Google Discover Feed',
      'Gmail Promotions Tab',
      'Google Search Partners',
    ],
    defaultPlacements: [
      'Google Search Top #1',
      'YouTube Shorts',
      'Google Shopping Tab',
      'YouTube In-Stream Skippable',
    ],
    placementPresetLabel: 'Search + YouTube Only (4)',
    placementPresetFilter: (p) => p.startsWith('Google Search') || p.startsWith('YouTube'),
    specialSettings: [
      {
        id: 'exact-intent',
        title: 'High-Intent Exact & Phrase Keywords Only',
        simpleDesc: 'Focuses budget on buyers ready to purchase rather than broad browsers',
        recommended: true,
      },
      {
        id: 'negative-shield',
        title: 'AI Negative Keyword Shield ("free", "jobs", "cheap")',
        simpleDesc: 'Automatically blocks 400+ non-buying search terms to stop wasted clicks',
        recommended: true,
      },
      {
        id: 'sitelinks',
        title: 'Auto-Generate Sitelink & Price Extensions',
        simpleDesc: 'Expands your Search ad size with clickable Pricing, Demo & Review links',
        recommended: true,
      },
      {
        id: 'brand-guard',
        title: 'Competitor Brand Conquest & Defense',
        simpleDesc: 'Protects your brand name while capturing users comparing alternatives',
      },
    ],
    defaultCustomAudiences: [
      'In-Market Buyers (Actively Researching)',
      'Website Visitors & Cart Abandoners',
    ],
    availableCustomAudiences: [
      'In-Market Buyers (Actively Researching)',
      'Website Visitors & Cart Abandoners',
      'Custom Search Intent (Competitor URLs)',
      'YouTube Channel Viewers (90d)',
    ],
    defaultInterests: ['ad management software', 'facebook ads automation', 'roas tracker'],
    interestLabel: 'Target Buyer Search Keywords',
    interestPlaceholder: 'Add search keyword (e.g., best crm software, buy running shoes)...',
    defaultHeadline: 'Adoracle™ Official | AI Ad Management Platform',
    defaultBody:
      'Unify Meta, TikTok & Google Ads. Automated 404 link guard & 70/30 budget scaling. Start free.',
    defaultCta: 'Learn More',
    avgCpc: 1.65,
    avgCpm: 14.5,
    convRate: 0.078,
  },

  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    shortName: 'LinkedIn',
    trackingName: 'LinkedIn Insight Tag & CAPI Verified',
    trackingDetail: 'Company-level B2B attribution & CRM lead sync active',
    aspectLabel: '1.91:1 Sponsored Post / 1-Tap Lead Form',
    objectives: [
      {
        id: 'awareness',
        label: 'Executive Brand Reach',
        simpleDesc: 'Keep your company top-of-mind for Founders, VPs & decision-makers',
        optimizationGoals: ['Unique Reach', 'Impressions'],
        conversionLocations: ['LinkedIn Home Feed'],
      },
      {
        id: 'traffic',
        label: 'Case Study & Site Visits',
        simpleDesc: 'Drive high-value B2B prospects to your landing pages',
        optimizationGoals: ['Landing Page Clicks', 'Website Visits'],
        conversionLocations: ['Your Website'],
      },
      {
        id: 'engagement',
        label: 'Thought Leadership Engagement',
        simpleDesc: 'Boost likes, shares, and company page followers among target accounts',
        optimizationGoals: ['Social Actions', 'Company Page Follows'],
        conversionLocations: ['LinkedIn Feed Post'],
      },
      {
        id: 'leads',
        label: '1-Tap B2B Lead Gen Forms',
        simpleDesc: 'Auto-fills work email, job title & company name in 1 click',
        optimizationGoals: ['Lead Form Submissions'],
        conversionLocations: ['LinkedIn Native Lead Form'],
      },
      {
        id: 'sales',
        label: 'Demo Bookings & Pipeline',
        simpleDesc: 'Optimize for qualified sales calls and trial signups on your site',
        optimizationGoals: ['Website Conversions', 'Booked Demos'],
        conversionLocations: ['Your Website'],
      },
    ],
    placements: [
      'LinkedIn Home Feed (Desktop & Mobile)',
      'LinkedIn Video & Document Ads',
      'LinkedIn Right Rail (Desktop)',
      'Sponsored InMail / Conversation Ads',
      'LinkedIn Audience Network',
    ],
    defaultPlacements: [
      'LinkedIn Home Feed (Desktop & Mobile)',
      'LinkedIn Video & Document Ads',
      'LinkedIn Right Rail (Desktop)',
    ],
    placementPresetLabel: 'LinkedIn Native Only (4)',
    placementPresetFilter: (p) => !p.includes('Audience Network'),
    specialSettings: [
      {
        id: 'seniority-filter',
        title: 'Decision-Makers Only (Director, VP, CXO, Owner)',
        simpleDesc: 'Automatically excludes entry-level & student profiles to protect B2B spend',
        recommended: true,
      },
      {
        id: 'company-size',
        title: 'Target 11–500 Employee Growth Companies',
        simpleDesc: 'Focuses impressions on teams with active decision authority and budget',
        recommended: true,
      },
      {
        id: 'disable-lan',
        title: 'Disable Third-Party Audience Network',
        simpleDesc: 'Keeps 100% of your ads inside LinkedIn for higher B2B lead quality',
        recommended: true,
      },
      {
        id: 'audience-expansion',
        title: 'Predictive B2B Lookalike Expansion',
        simpleDesc: 'Finds similar job functions across matching SaaS & enterprise verticals',
      },
    ],
    defaultCustomAudiences: [
      'Target Account List (ABM Companies)',
      'Website Pricing Page Visitors (30d)',
    ],
    availableCustomAudiences: [
      'Target Account List (ABM Companies)',
      'Website Pricing Page Visitors (30d)',
      'LinkedIn Company Page Followers',
      'Past Lead Form Openers',
    ],
    defaultInterests: ['VP of Marketing', 'Founder / CEO', 'Head of Growth', 'E-Commerce Director'],
    interestLabel: 'Target Job Titles & Industries',
    interestPlaceholder: 'Add job title or industry (e.g., CTO, SaaS, FinTech)...',
    defaultHeadline: 'How Modern Growth Teams Cut Wasted Ad Spend by 38%',
    defaultBody:
      'Replace 5 disconnected ad managers with one intelligent workspace. Built for lean marketing teams.',
    defaultCta: 'Book Demo',
    avgCpc: 4.2,
    avgCpm: 34.0,
    convRate: 0.095,
  },
};

const AI_COPY_SUGGESTIONS: Record<StudioPlatform, { headline: string; body: string }> = {
  meta: {
    headline: 'Your Ads Are Leaking Budget — Fix It in 60 Seconds',
    body: 'Adoracle automatically pauses broken links, shifts 70% of spend to winning ads, and shows clear results without jargon.',
  },
  tiktok: {
    headline: 'POV: You Finally Stopped Guessing Which Ad Works',
    body: 'Watch how our AI splits budget 70/30 between proven winners and fresh creator hooks automatically.',
  },
  google: {
    headline: 'Cut Wasted Ad Spend by 38% | Multi-Channel AI Manager',
    body: 'Automated 24/7 bid protection & cross-platform ROAS tracking for Meta, TikTok & Google. Try free today.',
  },
  linkedin: {
    headline: 'Scaling Paid Acquisition Without Hiring a 5-Person Ops Team',
    body: 'See how B2B & DTC leaders automate cross-channel budget pacing and server-side attribution in one dashboard.',
  },
};

/* Official Brand SVG Logos */
function RealPlatformLogo({ id, size = 18 }: { id: StudioPlatform; size?: number }) {
  switch (id) {
    case 'meta':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M22.9 9.5C20.5 9.5 18.6 11.2 16.8 14.1L16 15.4L15.2 14.1C13.4 11.2 11.5 9.5 9.1 9.5C5.3 9.5 2.5 12.8 2.5 17.1C2.5 21.1 5.1 23.8 8.7 23.8C11.3 23.8 13.3 22.1 15.3 18.8L16 17.6L16.7 18.8C18.7 22.1 20.7 23.8 23.3 23.8C26.9 23.8 29.5 21.1 29.5 17.1C29.5 12.8 26.7 9.5 22.9 9.5ZM8.8 21.1C6.7 21.1 5.2 19.5 5.2 17.1C5.2 14.4 6.8 12.2 9.1 12.2C10.7 12.2 12.1 13.5 13.7 16.1L14.3 17.1C12.5 19.9 10.8 21.1 8.8 21.1ZM23.2 21.1C21.2 21.1 19.5 19.9 17.7 17.1L18.3 16.1C19.9 13.5 21.3 12.2 22.9 12.2C25.2 12.2 26.8 14.4 26.8 17.1C26.8 19.5 25.3 21.1 23.2 21.1Z"
            fill="#0081FB"
          />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M21.8 6H18.4V19.6C18.4 21.4 17 22.8 15.2 22.8C13.4 22.8 12 21.4 12 19.6C12 17.9 13.3 16.5 15 16.4V12.9C11.4 13.1 8.6 16 8.6 19.6C8.6 23.3 11.6 26.3 15.3 26.3C19 26.3 22 23.3 22 19.6V12.6C23.3 13.6 24.9 14.2 26.6 14.2V10.8C23.9 10.8 21.8 8.7 21.8 6Z"
            fill="currentColor"
          />
          <path
            d="M22.6 7.1V10.5C24.3 10.5 25.9 9.9 27.2 8.9V12.3C25.5 12.3 23.9 11.7 22.6 10.7V17.7C22.6 21.4 19.6 24.4 15.9 24.4C14.6 24.4 13.4 24 12.4 23.4C13.6 25.1 15.5 26.3 17.7 26.3C21.4 26.3 24.4 23.3 24.4 19.6V12.6C25.7 13.6 27.3 14.2 29 14.2V10.8C26.3 10.8 24.1 9.2 22.6 7.1Z"
            fill="#FE2C55"
          />
        </svg>
      );
    case 'google':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M27.5 16.3C27.5 15.4 27.4 14.6 27.3 13.8H16V18.5H22.5C22.2 20 21.3 21.3 20 22.1V25.2H23.9C26.2 23.1 27.5 20 27.5 16.3Z"
            fill="#4285F4"
          />
          <path
            d="M16 28C19.2 28 21.9 26.9 23.9 25.2L20 22.1C18.9 22.8 17.6 23.3 16 23.3C12.9 23.3 10.3 21.2 9.4 18.4H5.4V21.5C7.4 25.4 11.4 28 16 28Z"
            fill="#34A853"
          />
          <path
            d="M9.4 18.4C9.1 17.7 9 16.9 9 16C9 15.1 9.1 14.3 9.4 13.6V10.5H5.4C4.6 12.1 4.1 14 4.1 16C4.1 18 4.6 19.9 5.4 21.5L9.4 18.4Z"
            fill="#FBBC05"
          />
          <path
            d="M16 8.7C17.8 8.7 19.3 9.3 20.6 10.5L24 7.1C21.9 5.2 19.2 4 16 4C11.4 4 7.4 6.6 5.4 10.5L9.4 13.6C10.3 10.8 12.9 8.7 16 8.7Z"
            fill="#EA4335"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="24" height="24" rx="5" fill="#0A66C2" />
          <path
            d="M11.3 13.5H8.5V22.5H11.3V13.5ZM9.9 9.2C9 9.2 8.3 9.9 8.3 10.8C8.3 11.7 9 12.4 9.9 12.4C10.8 12.4 11.5 11.7 11.5 10.8C11.5 9.9 10.8 9.2 9.9 9.2ZM23.5 17.2C23.5 14.6 22.1 13.3 20 13.3C18.4 13.3 17.6 14.2 17.2 14.8V13.5H14.5V22.5H17.3V17.8C17.3 16.6 17.6 15.5 19.1 15.5C20.5 15.5 20.7 16.8 20.7 17.9V22.5H23.5V17.2Z"
            fill="white"
          />
        </svg>
      );
  }
}

export default function CampaignStudioPage() {
  const modeContext = useMode() as any;
  const isExpert = Boolean(
    modeContext?.isExpert ?? modeContext?.expertMode ?? modeContext?.mode === 'expert'
  );

  const [selectedPlatform, setSelectedPlatform] = useState<StudioPlatform>('meta');
  const spec = STUDIO_PLATFORMS[selectedPlatform];

  // Step 1: Campaign Goal & Optimization
  const [objective, setObjective] = useState<string>('sales');
  const currentObjectiveObj =
    spec.objectives.find((o) => o.id === objective) || spec.objectives[0];
  const [optimizationGoal, setOptimizationGoal] = useState<string>(
    currentObjectiveObj.optimizationGoals[0]
  );
  const [conversionLocation, setConversionLocation] = useState<string>(
    currentObjectiveObj.conversionLocations[0]
  );

  // Step 2: Cross-Platform Audience & Targeting Controls
  const [audienceMode, setAudienceMode] = useState<'advantage' | 'manual'>('advantage');
  const [locations, setLocations] = useState<string[]>(['United States', 'United Kingdom', 'Canada']);
  const [newLocationInput, setNewLocationInput] = useState<string>('');
  const [ageMin, setAgeMin] = useState<number>(22);
  const [ageMax, setAgeMax] = useState<number>(54);
  const [gender, setGender] = useState<'all' | 'women' | 'men'>('all');
  const [excludeRecentBuyers, setExcludeRecentBuyers] = useState<boolean>(true);
  const [selectedCustomAudiences, setSelectedCustomAudiences] = useState<string[]>(
    spec.defaultCustomAudiences
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(spec.defaultInterests);
  const [newInterestInput, setNewInterestInput] = useState<string>('');

  // LinkedIn-specific Company Size filter
  const [companySizeFilter, setCompanySizeFilter] = useState<string>('11–500 Employees');

  // Step 3: Budget, Schedule, Caps & Pacing Controls
  const [budgetType, setBudgetType] = useState<'daily' | 'lifetime'>('daily');
  const [dailyBudget, setDailyBudget] = useState<number>(120);
  const [lifetimeBudget, setLifetimeBudget] = useState<number>(3600);
  const [budgetMode, setBudgetMode] = useState<'auto' | 'manual'>('auto');

  // Bid Strategy & Caps
  const [bidStrategy, setBidStrategy] = useState<'lowest_cost' | 'cost_cap' | 'target_cpa'>('lowest_cost');
  const [costCapAmount, setCostCapAmount] = useState<number>(25);

  // Schedule & Duration Date & Time States
  const [scheduleMode, setScheduleMode] = useState<'Continuous' | 'Custom Range'>('Custom Range');
  const [startDateTime, setStartDateTime] = useState<string>('2026-11-15T08:00');
  const [endDateTime, setEndDateTime] = useState<string>('2026-12-15T23:59');

  // Ad Manager Caps
  const [frequencyCapMode, setFrequencyCapMode] = useState<string>('2 views / 7 days');
  const [spendCapEnabled, setSpendCapEnabled] = useState<boolean>(false);
  const [spendCapAmount, setSpendCapAmount] = useState<number>(5000);

  // Step 4: Placements & Optimizers
  const [activePlacements, setActivePlacements] = useState<string[]>(spec.defaultPlacements);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    'adv-creative': true,
    'use-existing-post': true,
    'spark-ads': true,
    'smart-plus': true,
    'search-toggle': true,
    'exact-intent': true,
    'negative-shield': true,
    sitelinks: true,
    'seniority-filter': true,
    'company-size': true,
    'disable-lan': true,
  });

  // Step 5: Creative & Link Guard
  const [headline, setHeadline] = useState<string>(spec.defaultHeadline);
  const [bodyText, setBodyText] = useState<string>(spec.defaultBody);
  const [ctaLabel, setCtaLabel] = useState<string>(spec.defaultCta);
  const [destinationUrl, setDestinationUrl] = useState<string>('https://adoracle.com/trial');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);

  const handleSelectPlatform = (id: StudioPlatform) => {
    const next = STUDIO_PLATFORMS[id];
    const defaultObj = next.objectives[next.objectives.length - 1];
    setSelectedPlatform(id);
    setObjective(defaultObj.id);
    setOptimizationGoal(defaultObj.optimizationGoals[0]);
    setConversionLocation(defaultObj.conversionLocations[0]);
    setSelectedCustomAudiences(next.defaultCustomAudiences);
    setSelectedInterests(next.defaultInterests);
    setActivePlacements(next.defaultPlacements);
    setHeadline(next.defaultHeadline);
    setBodyText(next.defaultBody);
    setCtaLabel(next.defaultCta);
    setDeployedSuccess(false);
  };

  const handleSelectObjective = (obj: ObjectiveOption) => {
    setObjective(obj.id);
    setOptimizationGoal(obj.optimizationGoals[0]);
    setConversionLocation(obj.conversionLocations[0]);
  };

  const togglePlacement = (item: string) => {
    setActivePlacements((prev) =>
      prev.includes(item)
        ? prev.length > 1
          ? prev.filter((p) => p !== item)
          : prev
        : [...prev, item]
    );
  };

  const toggleFeature = (id: string) => {
    setEnabledFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCustomAudience = (aud: string) => {
    setSelectedCustomAudiences((prev) =>
      prev.includes(aud) ? prev.filter((a) => a !== aud) : [...prev, aud]
    );
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newLocationInput.trim();
    if (val && !locations.includes(val)) {
      setLocations([...locations, val]);
      setNewLocationInput('');
    }
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newInterestInput.trim();
    if (val && !selectedInterests.includes(val)) {
      setSelectedInterests([...selectedInterests, val]);
      setNewInterestInput('');
    }
  };

  const handleMagicRewrite = () => {
    setIsRewriting(true);
    setTimeout(() => {
      const suggestion = AI_COPY_SUGGESTIONS[selectedPlatform];
      setHeadline(suggestion.headline);
      setBodyText(suggestion.body);
      setIsRewriting(false);
    }, 550);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeployedSuccess(true);
    }, 850);
  };

  // Dynamic Forecast & Breakdown Math
  const effectiveDailySpend = budgetType === 'daily' ? dailyBudget : Math.round(lifetimeBudget / 30);
  const weeklySpend = effectiveDailySpend * 7;
  const isAwarenessGoal = objective === 'awareness' || objective === 'views';

  const estWeeklyImpressions = Math.round((weeklySpend / spec.avgCpm) * 1000);
  const estWeeklyReach = Math.round(estWeeklyImpressions * 0.68);
  const estWeeklyClicks = Math.round(weeklySpend / spec.avgCpc);
  const estCtr = ((estWeeklyClicks / (estWeeklyImpressions || 1)) * 100).toFixed(2);
  const estCpc = spec.avgCpc.toFixed(2);
  const estWeeklyOutcomes = isAwarenessGoal
    ? Math.round(estWeeklyReach * 0.14)
    : Math.max(1, Math.round(estWeeklyClicks * spec.convRate));
  const estCostPerOutcome = isAwarenessGoal
    ? `$${spec.avgCpm.toFixed(2)} CPM`
    : `$${(weeklySpend / estWeeklyOutcomes).toFixed(2)}`;

  const estimatedAudienceMillions = (
    locations.length * (selectedPlatform === 'linkedin' ? 2.4 : 14.2) +
    (audienceMode === 'advantage' ? 24.5 : selectedInterests.length * 4.2) +
    (ageMax - ageMin) * 0.35
  ).toFixed(1);

  const urlLooksValid =
    destinationUrl.startsWith('https://') && !destinationUrl.includes('404');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#E6F1FF] dark:bg-blue-950/40 border border-[#BBD9FF] dark:border-blue-900 text-xs text-[#153E9E] dark:text-blue-200">
        <span>This is the classic single-platform studio. To create one campaign on several platforms at once, use the new builder.</span>
        <a href="/builder" className="font-bold underline whitespace-nowrap">Open Campaign Builder →</a>
      </div>

      {/* 1. HEADER & SINGLE-ROW ALIGNED PLATFORM SWITCHER TABS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campaign Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete enterprise ad manager controls—objectives, schedule start/end dates, caps, and deep forecasts.
          </p>
        </div>

        {/* Single-Row Aligned Platform Pill Tabs */}
        <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto max-w-full shrink-0">
          {(Object.keys(STUDIO_PLATFORMS) as StudioPlatform[]).map((platformKey) => {
            const item = STUDIO_PLATFORMS[platformKey];
            const active = selectedPlatform === platformKey;

            return (
              <button
                key={platformKey}
                type="button"
                onClick={() => handleSelectPlatform(platformKey)}
                className={`relative flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors z-10 ${active
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="studioActivePlatformPill"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#153E9E] to-[#1E57D0] -z-10 shadow-sm"
                  />
                )}
                <RealPlatformLogo id={platformKey} size={16} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 8 COLS: Complete 5-Step Guided Ad Manager */}
        <div className="lg:col-span-8 space-y-5">
          {/* STEP 1: CAMPAIGN GOAL & OPTIMIZATION EVENT */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_10px_rgb(15,23,42,0.02)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E57D0]">
                  Step 1
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  What is your main goal on {spec.shortName}?
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#E6F1FF] text-[#153E9E] text-[11px] font-bold">
                AI tunes bidding automatically
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spec.objectives.map((obj) => {
                const isSelected = objective === obj.id;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => handleSelectObjective(obj)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${isSelected
                        ? 'bg-[#153E9E] text-white border-[#153E9E] shadow-md'
                        : 'bg-[#F8FAFC] dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 border-slate-200/70 dark:border-slate-800 hover:border-[#1E57D0]/50'
                      }`}
                  >
                    <p className="text-xs font-bold">{obj.label}</p>
                    <p
                      className={`text-[11px] mt-1 leading-snug ${isSelected ? 'text-blue-100/85' : 'text-slate-500 dark:text-slate-400'
                        }`}
                    >
                      {obj.simpleDesc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Conversion Location & Optimization Goal */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Where Results Happen
                </label>
                <select
                  value={conversionLocation}
                  onChange={(e) => setConversionLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                >
                  {currentObjectiveObj.conversionLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Optimize Ad Delivery For
                </label>
                <select
                  value={optimizationGoal}
                  onChange={(e) => setOptimizationGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                >
                  {currentObjectiveObj.optimizationGoals.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: PLATFORM-TAILORED AUDIENCE & TARGETING */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_10px_rgb(15,23,42,0.02)] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E57D0]">
                  Step 2
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Who Should See Your Ad on {spec.shortName}?
                </h2>
              </div>

              {/* AI Finder vs Manual Rules Switch */}
              <div className="inline-flex p-1 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setAudienceMode('advantage')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${audienceMode === 'advantage'
                      ? 'bg-[#153E9E] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  <Sparkles size={12} />{' '}
                  {selectedPlatform === 'meta'
                    ? 'Advantage+ AI'
                    : selectedPlatform === 'tiktok'
                      ? 'Smart+ Targeting'
                      : 'AI Auto-Expand'}
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceMode('manual')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${audienceMode === 'manual'
                      ? 'bg-[#153E9E] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  <Sliders size={12} /> Manual Rules
                </button>
              </div>
            </div>

            {/* Hard Audience Guardrails */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#1E57D0]" /> Audience Controls (Strict Boundaries)
                </span>
                <span className="text-[11px] text-slate-400">
                  Ads never show outside these rules
                </span>
              </div>

              {/* Locations Picker */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Target Countries or Cities
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {locations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1FF] text-[#153E9E] text-xs font-bold"
                    >
                      {loc}
                      {locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setLocations(locations.filter((l) => l !== loc))}
                          className="hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddLocation} className="flex gap-2">
                  <input
                    type="text"
                    value={newLocationInput}
                    onChange={(e) => setNewLocationInput(e.target.value)}
                    placeholder="Add country, city, or region (e.g., Australia, London)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#153E9E] text-white text-xs font-bold hover:bg-[#1E57D0]"
                  >
                    + Add
                  </button>
                </form>
              </div>

              {/* Platform-Specific Demographic / Firmographic Row */}
              {selectedPlatform === 'linkedin' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Target Company Size
                    </label>
                    <select
                      value={companySizeFilter}
                      onChange={(e) => setCompanySizeFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option>1–10 Employees (Micro)</option>
                      <option>11–500 Employees (Growth SMB)</option>
                      <option>501–5,000 Employees (Mid-Market)</option>
                      <option>5,000+ Employees (Enterprise)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => setExcludeRecentBuyers(!excludeRecentBuyers)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${excludeRecentBuyers
                          ? 'bg-[#E6F1FF] border-[#1E57D0] text-[#153E9E]'
                          : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500'
                        }`}
                    >
                      <span>Exclude Current Customers &amp; Competitors</span>
                      {excludeRecentBuyers && <Check size={14} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Age Range ({ageMin} – {ageMax}+)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={ageMin}
                        onChange={(e) => setAgeMin(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        {[18, 21, 22, 25, 30, 35].map((age) => (
                          <option key={age} value={age}>
                            Min {age}
                          </option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-xs">to</span>
                      <select
                        value={ageMax}
                        onChange={(e) => setAgeMax(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        {[35, 45, 54, 65].map((age) => (
                          <option key={age} value={age}>
                            {age === 65 ? '65+' : age}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Gender
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {(['all', 'women', 'men'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${gender === g
                              ? 'bg-[#153E9E] text-white'
                              : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => setExcludeRecentBuyers(!excludeRecentBuyers)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${excludeRecentBuyers
                          ? 'bg-[#E6F1FF] border-[#1E57D0] text-[#153E9E]'
                          : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500'
                        }`}
                    >
                      <span>Exclude Past Buyers</span>
                      {excludeRecentBuyers && <Check size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Audiences & Platform-Specific Interests / Keywords / Job Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Warm Retargeting &amp; Lookalikes
                </label>
                <div className="space-y-2">
                  {spec.availableCustomAudiences.map((aud) => {
                    const active = selectedCustomAudiences.includes(aud);
                    return (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => toggleCustomAudience(aud)}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${active
                            ? 'bg-[#E6F1FF]/80 border-[#1E57D0] text-[#153E9E]'
                            : 'bg-[#F8FAFC] dark:bg-slate-800/40 border-slate-200/70 text-slate-500'
                          }`}
                      >
                        <span className="truncate">{aud}</span>
                        {active && <Check size={13} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {spec.interestLabel}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {selectedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F6FB] dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedInterests(selectedInterests.filter((i) => i !== interest))
                        }
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddInterest} className="flex gap-2">
                  <input
                    type="text"
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    placeholder={spec.interestPlaceholder}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-[#1E57D0]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-[#E6F1FF] text-[#153E9E] text-xs font-bold hover:bg-[#1E57D0] hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </form>

                <div className="mt-3 p-3 rounded-xl bg-[#E6F1FF]/60 dark:bg-blue-950/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#153E9E] dark:text-sky-300 flex items-center gap-1.5">
                    <Users size={13} /> Est. Audience Size:
                  </span>
                  <span className="font-extrabold text-[#153E9E] dark:text-sky-300">
                    {estimatedAudienceMillions}M people · Optimal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: BUDGET, SCHEDULE (DATE/TIME), CAPS & COMPREHENSIVE BREAKDOWN */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_10px_rgb(15,23,42,0.02)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E57D0]">
                  Step 3
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Campaign Budget, Schedule Start/End Date &amp; Caps
                </h2>
              </div>

              {/* Budget Type Selector */}
              <div className="inline-flex p-1 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setBudgetType('daily')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${budgetType === 'daily'
                      ? 'bg-[#153E9E] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  Daily Budget
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('lifetime')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${budgetType === 'lifetime'
                      ? 'bg-[#153E9E] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  Lifetime Budget
                </button>
              </div>
            </div>

            {/* Budget Configuration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {budgetType === 'daily' ? 'Daily Spending Limit' : 'Total Lifetime Budget'}
                  </span>
                  <span className="text-base font-extrabold text-[#153E9E] dark:text-sky-400">
                    {budgetType === 'daily' ? `$${dailyBudget}/day` : `$${lifetimeBudget.toLocaleString()} total`}
                  </span>
                </div>
                {budgetType === 'daily' ? (
                  <>
                    <input
                      type="range"
                      min={20}
                      max={1000}
                      step={10}
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(Number(e.target.value))}
                      className="w-full accent-[#1E57D0] cursor-pointer h-2 rounded-lg bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>$20/day</span>
                      <span>${weeklySpend.toLocaleString()}/week total</span>
                      <span>$1,000/day</span>
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={lifetimeBudget}
                      onChange={(e) => setLifetimeBudget(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  Budget Optimization &amp; Bidding
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setBudgetMode('auto')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${budgetMode === 'auto'
                        ? 'bg-[#153E9E] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {isExpert ? 'CBO (Campaign)' : 'Auto-Pick Winners'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetMode('manual')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${budgetMode === 'manual'
                        ? 'bg-[#153E9E] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {isExpert ? 'ABO (Ad Set)' : 'Equal Split'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bid Strategy & Cost Caps Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Bid Strategy &amp; Cost Control
                </label>
                <select
                  value={bidStrategy}
                  onChange={(e) => setBidStrategy(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                >
                  <option value="lowest_cost">Lowest Cost / Maximize Conversions (Recommended)</option>
                  <option value="cost_cap">Cost Per Result Cap (Control CPA)</option>
                  <option value="target_cpa">Target Cost Per Acquisition (Smart Bidding)</option>
                </select>
              </div>

              {bidStrategy !== 'lowest_cost' && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Maximum Cost Per Result Limit ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={costCapAmount}
                      onChange={(e) => setCostCapAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CAMPAIGN SCHEDULE & DURATION CALENDAR (EDITABLE START & END DATE/TIME) */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#1E57D0]" /> Campaign Schedule &amp; Duration Start/End Date &amp; Time
                </span>
                <select
                  value={scheduleMode}
                  onChange={(e) => setScheduleMode(e.target.value as any)}
                  className="px-3 py-1 rounded-lg border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-[#153E9E] dark:text-sky-300 focus:outline-none"
                >
                  <option value="Custom Range">Set Custom Start &amp; End Date/Time</option>
                  <option value="Continuous">Run Continuously (Ongoing)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Start Date & Time */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block flex items-center gap-1">
                    <Clock size={12} className="text-blue-600" /> Start Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                  />
                </div>

                {/* End Date & Time */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block flex items-center gap-1">
                    <Clock size={12} className="text-blue-600" /> End Date &amp; Time {scheduleMode === 'Continuous' && '(Ongoing)'}
                  </label>
                  <input
                    type="datetime-local"
                    disabled={scheduleMode === 'Continuous'}
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* AD MANAGER CAPS & PACING CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Ad Frequency Capping (Anti-Fatigue)
                </label>
                <select
                  value={frequencyCapMode}
                  onChange={(e) => setFrequencyCapMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                >
                  <option>1 view / 7 days</option>
                  <option>2 views / 7 days (Recommended)</option>
                  <option>3 views / 7 days</option>
                  <option>1 view / 24 hours</option>
                  <option>No Frequency Cap (Continuous Delivery)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Campaign Spend Cap (Safety Limit)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpendCapEnabled(!spendCapEnabled)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${spendCapEnabled ? 'bg-[#153E9E] text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                  >
                    {spendCapEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {spendCapEnabled ? (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={spendCapAmount}
                      onChange={(e) => setSpendCapAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-2">No maximum limit enforced beyond daily/lifetime budget.</p>
                )}
              </div>
            </div>

            {/* EXPANDED 8-METRIC FULL FUNNEL & COST FORECAST BREAKDOWN GRID */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <PieChart size={14} className="text-[#1E57D0]" /> Comprehensive Estimated Forecast &amp; Cost Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Reach (7d)</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {estWeeklyReach.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Impressions</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {estWeeklyImpressions.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Link Clicks</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {estWeeklyClicks.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Click-Through Rate (CTR)</span>
                  <span className="text-sm font-extrabold text-[#153E9E] dark:text-sky-400">
                    {estCtr}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Cost Per Click (CPC)</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ${estCpc}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {isAwarenessGoal ? 'Brand Recall Lift' : 'Est. Conversions'}
                  </span>
                  <span className="text-sm font-extrabold text-[#153E9E] dark:text-sky-400">
                    {estWeeklyOutcomes.toLocaleString()} / wk
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {isAwarenessGoal ? 'Cost / 1k Views' : 'Cost / Result (CPA)'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {estCostPerOutcome}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. 7-Day Spend</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ${weeklySpend.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: PLACEMENTS & PLATFORM BUILT-IN OPTIMIZERS */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_10px_rgb(15,23,42,0.02)] space-y-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E57D0]">
                Step 4
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {spec.shortName} Placements &amp; Smart Controls
              </h2>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Where Your Ad Appears ({activePlacements.length} of {spec.placements.length} selected)
                </span>

                <div className="flex items-center gap-1.5">
                  {spec.placementPresetLabel && spec.placementPresetFilter && (
                    <button
                      type="button"
                      onClick={() =>
                        setActivePlacements(
                          spec.placements.filter(spec.placementPresetFilter!)
                        )
                      }
                      className="px-2.5 py-1 rounded-full bg-[#E6F1FF] hover:bg-[#1E57D0] text-[#153E9E] hover:text-white text-[10px] font-bold transition-colors"
                    >
                      {spec.placementPresetLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActivePlacements([...spec.placements])}
                    className="px-2.5 py-1 rounded-full bg-[#F3F6FB] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-colors"
                  >
                    Select All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {spec.placements.map((place) => {
                  const selected = activePlacements.includes(place);
                  const isFacebookPriority =
                    selectedPlatform === 'meta' && place.startsWith('Facebook');

                  return (
                    <button
                      key={place}
                      type="button"
                      onClick={() => togglePlacement(place)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${selected
                          ? 'bg-[#E6F1FF] dark:bg-blue-950/50 border-[#1E57D0] text-[#153E9E] dark:text-sky-300'
                          : 'bg-[#F8FAFC] dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                        }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{place}</span>
                        {isFacebookPriority && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-sky-300 text-[9px] font-extrabold">
                            FB
                          </span>
                        )}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${selected
                            ? 'bg-[#1E57D0] text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                          }`}
                      >
                        {selected && <Check size={10} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Built-In Optimizers */}
            <div className="pt-2 space-y-2.5">
              {spec.specialSettings.map((setting) => {
                const isOn = Boolean(enabledFeatures[setting.id]);
                return (
                  <div
                    key={setting.id}
                    onClick={() => toggleFeature(setting.id)}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-[#1E57D0]/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {setting.title}
                        </p>
                        {setting.recommended && (
                          <span className="px-2 py-0.5 rounded-full bg-[#E6F1FF] text-[#153E9E] text-[9px] font-extrabold uppercase">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {setting.simpleDesc}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label={setting.title}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 ${isOn ? 'bg-[#1E57D0]' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${isOn ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 5: AD COPY & DESTINATION LINK SAFETY GUARD */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_10px_rgb(15,23,42,0.02)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E57D0]">
                  Step 5
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Write Your Ad &amp; Verify Destination Link
                </h2>
              </div>

              <button
                type="button"
                onClick={handleMagicRewrite}
                disabled={isRewriting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#E6F1FF] hover:bg-[#1E57D0] text-[#153E9E] hover:text-white text-xs font-bold transition-all"
              >
                <Wand2 size={13} />
                <span>{isRewriting ? 'Writing...' : 'AI Magic Rewrite'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Attention Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Button Label
                </label>
                <select
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0]"
                >
                  <option>Start Free Trial</option>
                  <option>Shop Now</option>
                  <option>Learn More</option>
                  <option>Send Message</option>
                  <option>Sign Up</option>
                  <option>Book Demo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Main Ad Caption
              </label>
              <textarea
                rows={2}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#1E57D0]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Website Destination Link
                </label>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold ${urlLooksValid ? 'text-[#1E57D0]' : 'text-rose-600'
                    }`}
                >
                  {urlLooksValid ? (
                    <>
                      <CheckCircle2 size={12} /> Link tested · 200 OK (Fast load)
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} /> Warning: Check URL before publishing
                    </>
                  )}
                </span>
              </div>
              <div className="relative">
                <Link2
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#1E57D0]"
                />
              </div>
            </div>
          </div>

          {/* Tracking Verification Strip */}
          <div className="rounded-2xl bg-[#E6F1FF] dark:bg-blue-950/40 border border-[#1E57D0]/20 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#153E9E] text-white flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#153E9E] dark:text-sky-300">
                  {spec.trackingName}
                </p>
                <p className="text-[11px] text-[#1E57D0]/90 dark:text-sky-400/80">
                  {spec.trackingDetail}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#153E9E] text-white text-[11px] font-bold">
              Verified ✓
            </span>
          </div>

          {/* DEDICATED BOTTOM PUBLISH ACTION BAR */}
          <div className="rounded-3xl bg-gradient-to-r from-[#12285E] via-[#163F9A] to-[#1E57D0] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-200">
                <Rocket size={13} />
                <span>Ready to Publish · {spec.name}</span>
              </div>
              <h3 className="text-base font-bold">
                ${effectiveDailySpend}/day · {activePlacements.length} Placements · Est.{' '}
                {estWeeklyOutcomes.toLocaleString()}{' '}
                {isAwarenessGoal ? 'Brand Recalls' : 'Customers'}/wk
              </h3>
              <p className="text-xs text-blue-100/80">
                Adoracle 70/30 Guard &amp; 404 Link Shield will protect this campaign automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-7 py-3.5 rounded-full bg-white text-[#153E9E] hover:bg-blue-50 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow shrink-0"
            >
              {deployedSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Published to {spec.shortName}!</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>
                    {isDeploying
                      ? `Publishing to ${spec.shortName}...`
                      : `Publish ${spec.shortName} Campaign`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT 4 COLS: Sticky Native Platform Ad Preview + Quick Launch */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Live {spec.shortName} Preview
              </span>
              <span className="text-[11px] font-semibold text-[#1E57D0] truncate max-w-[160px]">
                {activePlacements[0]}
              </span>
            </div>

            {/* PLATFORM-SPECIFIC MOCKUP */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlatform}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-[#F8FAFC] dark:bg-slate-950"
              >
                {selectedPlatform === 'google' ? (
                  <div className="p-4 bg-white dark:bg-slate-900 space-y-2 text-left">
                    <span className="text-[10px] font-extrabold text-slate-900 dark:text-white">
                      Sponsored
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E6F1FF] text-[#153E9E] font-bold text-[10px] flex items-center justify-center">
                        A
                      </div>
                      <div className="leading-tight">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Adoracle
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {destinationUrl}
                        </p>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-blue-700 dark:text-sky-400 leading-snug">
                      {headline}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {bodyText}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-blue-700 dark:text-sky-400">
                      <span>{ctaLabel} →</span>
                      <span>· Pricing</span>
                      <span>· Live Demo</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#153E9E] to-[#2A6FE0] text-white font-bold text-xs flex items-center justify-center">
                          A
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                            Adoracle
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Sponsored · {activePlacements[0]}
                          </p>
                        </div>
                      </div>
                      <RealPlatformLogo id={selectedPlatform} size={16} />
                    </div>

                    {selectedPlatform === 'linkedin' && (
                      <div className="px-3.5 pb-2.5 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300">
                        {bodyText}
                      </div>
                    )}

                    <div className="relative h-52 bg-gradient-to-br from-[#0E1D44] via-[#163F9A] to-[#2F7DEB] p-5 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold">
                          {spec.aspectLabel}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Play size={14} className="fill-white" />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-extrabold leading-snug">{headline}</p>
                        <p className="text-[11px] text-blue-100/85 mt-1 line-clamp-2">
                          {bodyText}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-900 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[180px]">{destinationUrl}</span>
                        <div className="flex items-center gap-2.5 text-slate-500">
                          <Heart size={13} />
                          <MessageCircle size={13} />
                          <Share2 size={13} />
                        </div>
                      </div>

                      <div className="w-full py-2 px-3 rounded-xl bg-[#E6F1FF] text-[#153E9E] text-xs font-bold flex items-center justify-between">
                        <span>{ctaLabel}</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Quick Campaign Summary Strip */}
            <div className="mt-3.5 p-3 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800/50 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between gap-2">
                <span>Goal:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {currentObjectiveObj.label}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Budget:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  ${effectiveDailySpend}/day ({budgetType})
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Duration:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {scheduleMode === 'Continuous' ? 'Continuous' : 'Custom Dates'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying}
              className="mt-4 w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-[#153E9E] to-[#1E57D0] text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md"
            >
              {deployedSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Published to {spec.shortName}!</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>
                    {isDeploying
                      ? `Launching on ${spec.shortName}...`
                      : `Publish to ${spec.shortName}`}
                  </span>
                </>
              )}
            </button>

            {deployedSuccess && (
              <p className="text-[11px] text-center text-[#1E57D0] dark:text-sky-400 font-semibold mt-2.5">
                Live in Campaigns · AI 70/30 Guard is monitoring spend.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}