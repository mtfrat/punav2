# Puna Tech · 15-Minute Bottleneck Audit Playbook
**Objective**: Qualify high-intent B2B clients, diagnose operational friction, and position custom software or enterprise automation as the obvious high-ROI solution—without ever delivering a generic sales pitch.

**Booking URL**: `https://cal.com/puna-tech-r7xi5x/15min`  
**Target Close Rate to Scoping Phase**: 40%+  
**Core Posture**: Diagnostic Partner / Senior Systems Architect (Not a vendor).

---

## 1. Call Mindset & Rules of Engagement

1. **Diagnosis precedes prescription**: Never discuss price, timeline, or technology before extracting the operational cost of the bottleneck.
2. **Quantify the bleeding**: If the prospect cannot express what manual work or tool friction costs them in hours, churned leads, or delayed revenue, help them calculate it on the call.
3. **Puna standard**: We build systems teams actually own. No black-box dependencies, no fragile point-to-point Zapier spaghetti.

---

## 2. Minute-by-Minute Breakdown (15 Minutes)

### Phase 1: Context & Frame Control (0:00 – 2:30)
> **Goal**: Establish conversational authority and set expectations immediately.

**Script**:
> *"Thanks for taking the time, [Name]. The goal for these 15 minutes is very focused: we look at where work is getting stuck, repeating, or falling through the cracks in your operation. By minute 12, we’ll separate whether this is a process issue, an automation fix, or a full software build. If there's a strong technical fit, we'll agree on what a minimal proof-of-concept looks like. If not, I’ll tell you directly and point you to the right off-the-shelf tool. Fair enough?"*

*Prospect agrees: Frame is set.*

---

### Phase 2: Bottleneck Extraction & Quantifying the Friction (2:30 – 8:00)
> **Goal**: Uncover the manual friction point and calculate its business cost.

**Key Diagnostic Questions**:
1. *"Walk me through the exact handoff where your team spends the most repetitive time today. Where does work stall?"*
2. *"When a lead / order / file comes in, how many different tools does a human have to touch before it's completed?"*
3. *"How many times per week does someone have to re-enter data that already exists in another tool?"*
4. *"What happens if this process fails or gets delayed by 48 hours? What breaks downstream?"*

**The Cost-of-Inaction Calculation**:
- If manual hours: `(Hours per week) × (Team members) × ($40/hr blended) × 52 weeks = $ Annual Waste`
- If lost leads: `(Inbound leads/mo) × (% response lag dropoff ~20%) × (Average Contract Value) = $ Lost Revenue`

**Script**:
> *"So right now, your team is spending roughly 18 hours every single week copying data between your forms, spreadsheets, and CRM, with an average delay of 6 hours per lead. At your current volume, even a 15% drop-off in speed-to-lead represents thousands in missed pipeline every month."*

---

### Phase 3: Architectural Prescription & Relevant Proof (8:00 – 12:00)
> **Goal**: Present the architectural pattern that solves the constraint, anchoring to proven Puna Tech implementations.

**Prescription Routing**:

#### If the bottleneck is Disconnected Tools & Lost Leads:
> *"What you have isn't a CRM problem; it's an orchestration gap. In our enterprise inbound router, we solved this by putting an 82-node n8n engine between web forms and HubSpot. It parses domain authenticity, checks corporate records, matches the exact account exec, and alerts via Telegram in 2.4 seconds—with 0% dropped submissions across 50,000 monthly events."*

#### If the bottleneck is Repetitive Review & Customer Churn:
> *"Off-the-shelf tools fail here because they're either too dumb to catch context or too risky to run autonomously. In our StarPress SaaS and LinkedIn Copilot engines, we use human-in-the-loop triggers: AI handles 95% of extraction, categorization, and drafting in sub-seconds, but if an edge case or human intervenes, the bot yields immediately. That gives you speed without brand risk."*

#### If the bottleneck is Outgrown Spreadsheets (Need a Platform):
> *"You’ve hit the ceiling of what Airtable or Sheets can safely do. What you need is a single, unified web application with role-based permissions, automated transactional pipelines, and an atomic ledger. We built this for our client Project Altiplano and our internal Autopost Studio—shipping an MVP in weeks rather than months."*

---

### Phase 4: Qualification & Next Step Close (12:00 – 15:00)
> **Goal**: Secure agreement on a 2-page Architecture & Scope Blueprint.

**Script**:
> *"Based on what you've shared, this is a clear technical fit. Here is the useful next step: we synthesize our notes from today into a concise 2-page Architecture & Scope Blueprint. It maps:*
> 1. *The exact data flow and integration boundaries,*
> 2. *The smallest scope that removes this constraint completely,*
> 3. *The fixed investment and 3-to-4 week delivery timeline.*
>
> *We send that over in 48 hours, schedule a 20-minute walkthrough, and if you like the blueprint, we start build phase. How does that sound?"*

---

## 3. Objection Handling Playbook

### Objection: *"Can't we just build this ourselves in Zapier / Make?"*
- **Response**: *"Zapier is fantastic for simple 2-step notifications. But as soon as you have data transformations, error retries, rate limits, or customer data privacy, Zapier becomes an unmonitored house of cards. One failed task breaks downstream CRM records silently. We build deterministic, self-healing engines in n8n or custom code where every failure is caught, logged, and isolated without crashing the pipeline."*

### Objection: *"Is AI reliable enough for our production workflow?"*
- **Response**: *"Not if you use it like an uncontrolled chatbot. We treat AI purely as a structured data transformer—using schema validation, strict temperature controls, and human-in-the-loop approval barriers. The AI drafts; your business rules validate; your team approves."*

### Objection: *"How much does an engagement typically cost?"*
- **Response**: *"A focused automation or data pipeline typically ranges from $3,000 to $7,500 depending on integration complexity, while a custom full-stack SaaS MVP runs from $8,000 to $18,000. Our blueprints provide fixed, milestone-based pricing with no surprise billings."*

---

## 4. Post-Call Action Checklist
- [ ] Log notes directly into CRM / Notion.
- [ ] Calculate the prospect's estimated Cost of Inaction.
- [ ] Share relevant live demo links (`https://starpress.puna-tech.com/` or `https://viralyt-pink.vercel.app/`).
- [ ] Deliver the 2-page Scope Blueprint within 48 business hours.
