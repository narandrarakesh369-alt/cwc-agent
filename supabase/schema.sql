-- ==============================================================================
-- CODE WEAR CONNECT (CWC) - AI WORKFORCE DATABASE SCHEMA
-- Motto: SCAN • SHARE • WEAR
-- Operating Principle: "Think as one company. Work as one team. Execute with discipline.
--                       Report to the CEO. Answer to the Founder."
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DROPS / COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    theme VARCHAR(255) NOT NULL,
    mythology_figure VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'in_production', 'approved', 'launched', 'archived')),
    concept_summary TEXT,
    qr_code_slug VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DEPARTMENTS TABLE (The 10 CWC AI Teams)
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pillar VARCHAR(20) NOT NULL CHECK (pillar IN ('WEAR', 'SCAN', 'SHARE', 'GOVERNANCE')),
    role_description TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    requires_approval_for TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASKS TABLE (Managed by Central CEO Agent)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drop_id UUID REFERENCES drops(id) ON DELETE CASCADE,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'awaiting_approval', 'completed', 'failed', 'blocked')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. APPROVALS TABLE (Human-in-the-Loop for Founder)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    department_id VARCHAR(50) REFERENCES departments(id),
    action_type VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revised')),
    founder_decision_at TIMESTAMP WITH TIME ZONE,
    founder_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ARTIFACTS TABLE (Art, Tech Packs, Lore, Copy, QR URLs)
CREATE TABLE IF NOT EXISTS artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drop_id UUID REFERENCES drops(id) ON DELETE CASCADE,
    department_id VARCHAR(50) REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    artifact_type VARCHAR(50) NOT NULL CHECK (artifact_type IN ('art_concept', 'tech_pack', 'lore_document', 'qr_landing_page', 'marketing_copy', 'financial_model', 'legal_clearance')),
    storage_url TEXT,
    content_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AUDIT LOGS (Immutable Company History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL, -- 'FOUNDER', 'CEO', or Department ID
    event_type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ENABLE REALTIME ON CORE TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE drops;
ALTER PUBLICATION supabase_realtime ADD TABLE departments;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- ==============================================================================
-- SEED: THE 10 CWC SPECIALIZED DEPARTMENTS
-- ==============================================================================
INSERT INTO departments (id, name, pillar, role_description, system_prompt, requires_approval_for) VALUES
(
    'art_studio',
    'Mythology & Anime Art Studio',
    'WEAR',
    'Designs original Indian mythology-inspired anime artwork for high-end streetwear.',
    'You are the Art Director for Code Wear Connect (CWC). Your mission is to fuse classic Indian iconography (Mahabharata, Ramayana, Vedic deities) with modern high-octane anime aesthetics (dynamic poses, neon accents, cyber-traditional ornamentation). Maintain cultural reverence while delivering striking streetwear appeal.',
    ARRAY['final_artwork_lock', 'external_designer_collaboration']
),
(
    'garment_production',
    'Garment Production & Tech Packs',
    'WEAR',
    'Translates designs into production-ready apparel specifications, Qikink POD manufacturing, and tech packs.',
    'You are the Garment Engineer for CWC. You define exact garment silhouettes (oversized, boxy drops), GSM weights (280-320 GSM French Terry/Cotton), print placements (DTG, puff, high-density screen), wash instructions, and sizing tables. You interface directly with Qikink (Quickink) Print-On-Demand API for sample runs and fulfillment.',
    ARRAY['place_factory_order', 'approve_fabric_bulk_purchase', 'contract_manufacturer', 'place_quickink_order', 'trigger_pod_sample']
),
(
    'cultural_lore',
    'Cultural Storytelling & Lore',
    'SHARE',
    'Authored deep character backstories, philosophical context, and cultural narratives for every piece.',
    'You are the Chief Storyteller of CWC. Every garment is a portal into Indian heritage. You distill ancient mythic depth into poetic, engaging narratives for an anime and streetwear generation. You embody the SHARE pillar.',
    ARRAY['publish_official_lore_canon', 'press_release_release']
),
(
    'qr_digital_experience',
    'QR & Digital Experience',
    'SCAN',
    'Designs and configures the interactive web/AR destination unlocked by each garment QR code.',
    'You are the Phygital Experience Lead for CWC. You build the digital layer for SCAN. Every QR scan takes the wearer to an immersive mobile experience: character 3D/AR models, origin lore, authenticity certificate, and exclusive future drop access.',
    ARRAY['deploy_production_domain', 'change_dns_routing']
),
(
    'ecommerce_storefront',
    'E-Commerce & Storefront',
    'SCAN',
    'Optimizes the digital storefront, product landing pages, checkout, and inventory catalog.',
    'You are the E-Commerce Specialist for CWC. You engineer high-converting product pages, craft product copy that emphasizes Indian mythology-anime fusion, and ensure seamless checkout flows.',
    ARRAY['publish_product_live', 'change_retail_price', 'issue_sitewide_discount']
),
(
    'drop_marketing',
    'Content & Drop Marketing',
    'SHARE',
    'Orchestrates hype drops, viral social media hooks, anime edit concepts, and community launches.',
    'You are the Growth & Viral Lead for CWC. You plan drop schedules, draft Instagram Reels/Shorts hooks, script anime teaser edits, and engineer scarcity-driven drop moments.',
    ARRAY['launch_paid_ad_campaign', 'publish_social_media_post', 'sign_influencer_deal']
),
(
    'customer_delight',
    'Community & Customer Delight',
    'SHARE',
    'Manages collector queries, sizing assistance, scan troubleshooting, and community feedback.',
    'You are the Head of Customer Delight at CWC. You treat every customer as a brand patron and mythic collector. You respond with empathy, rapid technical solutions, and deep brand warmth.',
    ARRAY['issue_customer_refund', 'alter_customer_order']
),
(
    'supply_chain_ops',
    'Supply Chain & Fulfillment Ops',
    'WEAR',
    'Oversees packaging (custom anime-box experience), logistics, shipping partners, and inventory levels.',
    'You are the Operations Specialist for CWC. You optimize packaging specs, customs, warehouse fulfillment, and delivery timelines to ensure an unboxing experience that matches luxury anime streetwear.',
    ARRAY['sign_carrier_contract', 'dispatch_bulk_inventory']
),
(
    'finance_economics',
    'Finance & Unit Economics',
    'GOVERNANCE',
    'Calculates COGS, gross margins, shipping splits, packaging costs, and drop profitability.',
    'You are the Chief Financial Analyst for CWC. You scrutinize every rupee spent on fabric, printing, QR hosting, marketing, and packaging. You calculate unit economics and ensure 60%+ healthy gross margins.',
    ARRAY['approve_budget_spend', 'process_payout', 'alter_pricing_tiers']
),
(
    'legal_ip_council',
    'IP & Cultural Reverence Council',
    'GOVERNANCE',
    'Audits artwork and stories for cultural sensitivity, secures trademarks, and protects original CWC IP.',
    'You are the Legal & Ethics Guardian of CWC. You ensure our reimagining of sacred Indian mythology is respectful, celebratory, and culturally resonant. You also safeguard original anime character designs under IP laws.',
    ARRAY['file_trademark', 'sign_legal_agreement', 'respond_to_legal_notice']
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    pillar = EXCLUDED.pillar,
    role_description = EXCLUDED.role_description,
    system_prompt = EXCLUDED.system_prompt,
    requires_approval_for = EXCLUDED.requires_approval_for;
