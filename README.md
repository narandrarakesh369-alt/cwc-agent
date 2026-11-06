# CODE WEAR CONNECT (CWC) — AI WORKFORCE OS

> **SCAN • SHARE • WEAR**  
> *"Think as one company. Work as one team. Execute with discipline. Report to the CEO. Answer to the Founder."*

---

## 🏛️ System Architecture

CWC AI Workforce is a **100% cloud-native** hierarchical multi-agent platform designed specifically for the Code Wear Connect phygital anime streetwear brand.

- **Zero Local Storage**: All tasks, state, approvals, and assets live in **Supabase** (Postgres + Realtime + Storage).
- **Executive Control Center**: A full-stack **Next.js** dashboard deployed on **Vercel**.
- **Founder Remote Command & Approval Gate**: Direct **Telegram Bot** integration with interactive `[Approve]` / `[Reject]` buttons.
- **Single Master Intelligence**: A Central **CEO Agent** orchestrating **10 specialized departments**.

---

## 🏢 The 10 CWC Specialized Departments

| Pillar | Department | Core Mandate | Restricted Action (Founder Approval Required) |
| :--- | :--- | :--- | :--- |
| **WEAR** | **1. Mythology & Anime Art Studio** | Fuses Indian iconography with cyber-anime aesthetics. | `final_artwork_lock`, `external_designer_collaboration` |
| **WEAR** | **2. Garment Production & Tech Packs** | 280-320 GSM French Terry specs, DTG/puff placement. | `place_factory_order`, `approve_fabric_bulk_purchase` |
| **SHARE** | **3. Cultural Storytelling & Lore** | Authentic character arcs & philosophical context. | `publish_official_lore_canon`, `press_release_release` |
| **SCAN** | **4. QR & Digital Experience** | Interactive web/AR layer unlocked by garment QR. | `deploy_production_domain`, `change_dns_routing` |
| **SCAN** | **5. E-Commerce & Storefront** | Product listings, conversion copy, bundle pricing. | `publish_product_live`, `change_retail_price` |
| **SHARE** | **6. Content & Drop Marketing** | Viral launch campaigns, anime reels scripts, hype hooks. | `launch_paid_ad_campaign`, `publish_social_media_post` |
| **SHARE** | **7. Community & Customer Delight**| Sizing support, scan troubleshooting, collector care. | `issue_customer_refund`, `alter_customer_order` |
| **WEAR** | **8. Supply Chain & Inventory Ops** | Anime box unboxing experience, shipping, warehouse. | `sign_carrier_contract`, `dispatch_bulk_inventory` |
| **GOVERNANCE**| **9. Finance & Unit Economics** | COGS analysis, margins, pricing tiers, profitability. | `approve_budget_spend`, `process_payout` |
| **GOVERNANCE**| **10. IP & Cultural Reverence Council**| Cultural sensitivity audits, copyright & trademark. | `file_trademark`, `sign_legal_agreement` |

---

## 🚀 Quick Setup & Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete step-by-step setup instructions across:
1. **Supabase Database & Realtime**
2. **Telegram Bot (@BotFather)**
3. **GitHub Repository**
4. **Vercel Serverless Hosting**

---

## 💬 Telegram Bot Commands

| Command | Action |
| :--- | :--- |
| `/start` | Authenticate Founder identity & display system status. |
| `/status` | Real-time executive summary of all 10 departments and active drops. |
| `/pending` | List all actions awaiting Founder authorization. |
| `/drop <Title>` | Commission a new apparel drop across all 10 departments. |
| Inline `[✅ Approve]` | One-tap cryptographic authorization of external action. |
| Inline `[❌ Reject]` | Block and abort proposed external action. |
