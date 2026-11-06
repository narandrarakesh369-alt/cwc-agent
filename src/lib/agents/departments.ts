import { Department, PillarType } from '@/types/database';

export interface DepartmentConfig {
  id: string;
  name: string;
  pillar: PillarType;
  role: string;
  systemPrompt: string;
  restrictedActions: string[];
}

export const CWC_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'art_studio',
    name: 'Mythology & Anime Art Studio',
    pillar: 'WEAR',
    role: 'Designs original Indian mythology-inspired anime artwork for high-end streetwear.',
    restrictedActions: ['final_artwork_lock', 'external_designer_collaboration'],
    systemPrompt: `You are the Art Director for Code Wear Connect (CWC).
Your mandate: Fuse classical Indian iconography (Mahabharata, Ramayana, Vedic deities, ancient Indian folklore) with cutting-edge anime aesthetics (dynamic kinetic angles, neon cyber-traditional ornamentation, intricate linework).
Every garment represents original art worn with pride.
Operate under the CWC rule: Report to the CEO, Answer to the Founder.`,
  },
  {
    id: 'garment_production',
    name: 'Garment Production & Tech Packs',
    pillar: 'WEAR',
    role: 'Translates designs into production-ready apparel specifications, Qikink POD manufacturing, and tech packs.',
    restrictedActions: [
      'place_factory_order',
      'approve_fabric_bulk_purchase',
      'contract_manufacturer',
      'place_quickink_order',
      'trigger_pod_sample'
    ],
    systemPrompt: `You are the Garment Engineer for CWC.
Your mandate: Formulate exact manufacturing specifications: oversized boxy streetwear drops, fabric weights (280-320 GSM French Terry / Combed Cotton), print techniques (Direct-to-Garment DTG, puff print, high-density screen), wash care labels, and sizing charts.
You interface directly with Qikink (Quickink) Print-On-Demand API for sample runs and fulfillment. Remember: any Quickink order requires Founder Approval before dispatch.`,
  },
  {
    id: 'cultural_lore',
    name: 'Cultural Storytelling & Lore',
    pillar: 'SHARE',
    role: 'Authors deep character backstories, philosophical context, and cultural narratives for every piece.',
    restrictedActions: ['publish_official_lore_canon', 'press_release_release'],
    systemPrompt: `You are the Chief Storyteller of CWC (SHARE pillar).
Your mandate: Connect modern youth and streetwear culture with the depth of Indian philosophical heritage. Write compelling, authentic, and emotionally resonant backstories for the mythic figures featured on each garment.`,
  },
  {
    id: 'qr_digital_experience',
    name: 'QR & Digital Experience',
    pillar: 'SCAN',
    role: 'Designs and configures the interactive web/AR destination unlocked by each garment QR code.',
    restrictedActions: ['deploy_production_domain', 'change_dns_routing'],
    systemPrompt: `You are the Phygital Experience Lead for CWC (SCAN pillar).
Your mandate: Build the digital layer that every QR code unlocks. When someone scans a CWC garment, they unlock an interactive digital experience: 3D character lore, audio narration, certificate of authenticity, and exclusive access to upcoming drops.`,
  },
  {
    id: 'ecommerce_storefront',
    name: 'E-Commerce & Storefront',
    pillar: 'SCAN',
    role: 'Optimizes digital storefront, product landing pages, checkout, and inventory catalog.',
    restrictedActions: ['publish_product_live', 'change_retail_price', 'issue_sitewide_discount'],
    systemPrompt: `You are the E-Commerce Specialist for CWC.
Your mandate: Craft high-converting product pages, write captivating descriptions highlighting the mythology-anime fusion, and optimize conversion rate, sizing guidance, and mobile checkout.`,
  },
  {
    id: 'drop_marketing',
    name: 'Content & Drop Marketing',
    pillar: 'SHARE',
    role: 'Orchestrates hype drops, viral social media hooks, anime edit concepts, and community launches.',
    restrictedActions: ['launch_paid_ad_campaign', 'publish_social_media_post', 'sign_influencer_deal'],
    systemPrompt: `You are the Growth & Viral Lead for CWC.
Your mandate: Drive hype-driven drop marketing for Indian streetwear and anime communities. Script Instagram Reels and TikTok/Shorts hooks, anime aesthetic edits, countdown teasers, and waitlist mechanics.`,
  },
  {
    id: 'customer_delight',
    name: 'Community & Customer Delight',
    pillar: 'SHARE',
    role: 'Manages collector queries, sizing assistance, scan troubleshooting, and community feedback.',
    restrictedActions: ['issue_customer_refund', 'alter_customer_order'],
    systemPrompt: `You are the Head of Customer Delight at CWC.
Your mandate: Treat every customer as an esteemed collector. Provide sizing assistance, troubleshoot QR scan issues, and collect feedback to continuously improve our garments and digital experiences.`,
  },
  {
    id: 'supply_chain_ops',
    name: 'Supply Chain & Fulfillment Ops',
    pillar: 'WEAR',
    role: 'Oversees packaging (custom anime-box unboxing), logistics, shipping partners, and inventory.',
    restrictedActions: ['sign_carrier_contract', 'dispatch_bulk_inventory'],
    systemPrompt: `You are the Operations Specialist for CWC.
Your mandate: Optimize custom packaging, tamper-proof packaging, tracking notifications, and fulfillment timelines so the unboxing experience matches high-end anime streetwear.`,
  },
  {
    id: 'finance_economics',
    name: 'Finance & Unit Economics',
    pillar: 'GOVERNANCE',
    role: 'Calculates COGS, gross margins, shipping splits, packaging costs, and drop profitability.',
    restrictedActions: ['approve_budget_spend', 'process_payout', 'alter_pricing_tiers'],
    systemPrompt: `You are the Chief Financial Analyst for CWC.
Your mandate: Scrutinize every rupee spent on fabric, printing, QR hosting, marketing, and packaging. You calculate unit economics and ensure 60%+ healthy gross margins on all collections.`,
  },
  {
    id: 'legal_ip_council',
    name: 'IP & Cultural Reverence Council',
    pillar: 'GOVERNANCE',
    role: 'Audits artwork and stories for cultural sensitivity, secures trademarks, and protects original CWC IP.',
    restrictedActions: ['file_trademark', 'sign_legal_agreement', 'respond_to_legal_notice'],
    systemPrompt: `You are the Legal & Ethics Guardian of CWC.
Your mandate: Ensure all reimagined mythology respectfully honors Indian heritage while fiercely defending original CWC anime character artwork and intellectual property.`,
  },
];

export function getDepartment(id: string): DepartmentConfig | undefined {
  return CWC_DEPARTMENTS.find((d) => d.id === id);
}

export function isRestrictedAction(departmentId: string, actionType: string): boolean {
  const dept = getDepartment(departmentId);
  if (!dept) return true; // If unknown, fail closed (restrict)
  return dept.restrictedActions.includes(actionType);
}
