# 🚨 CodeRescue AI — 911 for Developers

**Hackathon:** AI For Bharat 2026 · Student Track  
**Team:** DDoxers · Lead: Avanish Ravindra Kasar  
**Live Demo:** [https://avanishkasar.github.io/AI-for-BHART/](https://avanishkasar.github.io/AI-for-BHART/)  
**Tagline:** When your code breaks, we respond faster than 911

---

## 🚨 The Problem

| Pain Point | Scale |
|-----------|-------|
| **2–4 hours wasted daily** per developer searching fragmented platforms | 60% of developers affected |
| **$5,600/minute** average production downtime cost | $300B lost annually |
| **40% dropout rate** among programming students | Stuck at 2 AM with no help |
| **Language barriers** exclude millions of non-English developers | 27M developers worldwide |

## 💡 The Solution

**CodeRescue AI** applies 911 emergency dispatch principles to developer support:

- **AI Triage in <30 seconds** — classifies severity (P0 Critical → P4 Learning)
- **60–70% auto-resolved** by Amazon Bedrock (Claude) instantly
- **8 specialized AI tools** for different debugging scenarios
- **10+ Indian languages** for accessibility
- **Expert routing** for complex issues (voice, video, screen-share)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Static Site (HTML5/CSS3/Vanilla JS)                │
│  Hosted on GitHub Pages / Amazon S3 + CloudFront     │
│                                                      │
│  8 Feature Tabs · Glassmorphism UI · 10+ Languages   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (fetch API)
                       ▼
┌─────────────────────────────────────────────────────┐
│              AMAZON API GATEWAY                      │
│  REST API · CORS enabled · Rate limiting             │
│  POST /api/rescue                                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              AWS LAMBDA                              │
│  Python 3.12 · Feature routing · System prompts      │
│  Structured JSON parsing · Error handling            │
└──────────┬───────────────────────┬──────────────────┘
           │                       │
           ▼                       ▼
┌────────────────────┐  ┌────────────────────────────┐
│  AMAZON BEDROCK    │  │  AMAZON DYNAMODB            │
│  Claude 3 Haiku    │  │  Incident tracking          │
│  Foundation Model  │  │  Session persistence        │
│  8 system prompts  │  │  30-day TTL auto-cleanup    │
│  per feature       │  │  PAY_PER_REQUEST billing    │
└────────────────────┘  └────────────────────────────┘
```

### AWS Services Used

| Service | Purpose | Why It's Needed |
|---------|---------|----------------|
| **Amazon Bedrock** | Foundation model access (Claude 3 Haiku) | Powers all 8 AI features — each with specialized system prompts for code analysis, debugging guidance, and document generation |
| **AWS Lambda** | Serverless compute | Handles feature routing, prompt engineering, and response parsing with zero idle cost |
| **Amazon API Gateway** | REST API endpoint | CORS-enabled HTTPS endpoint connecting frontend to Lambda, with rate limiting |
| **Amazon DynamoDB** | NoSQL database | Stores incident history, session data, and analytics with automatic TTL cleanup |
| **Amazon S3** *(optional)* | Static hosting | Alternative to GitHub Pages for frontend deployment |
| **Amazon CloudWatch** | Monitoring & logging | Lambda execution tracking, error alerting, usage analytics |

### Why AI is Required

CodeRescue AI's 8 features each need different AI capabilities:

1. **Emergency Chat** — Real-time conversational debugging with code-aware context
2. **Dependency Danger Score** — Risk assessment from package metadata analysis
3. **Error Ancestry Tree** — Traces errors from symptom → root architectural decision (requires reasoning)
4. **Context Capsule** — Generates structured handoff documentation from session input
5. **Quiet Mentor** — Code review with pattern detection and coaching-style feedback
6. **Commit Risk Predictor** — Security and performance vulnerability analysis in diffs
7. **Post-Mortem Generator** — Transforms incident details into professional documents
8. **Rubber Duck Mode** — Socratic debugging with problem-specific guided questions

Each feature has a dedicated system prompt that constrains the model to output structured JSON or markdown that maps directly to the UI components. Hardcoded fallbacks ensure the app remains functional even without API connectivity.

---

## ⚡ Features (8 Total)

### Core Emergency System
| Feature | Description |
|---------|-------------|
| 🚨 **Panic Button + AI Triage** | One-click context capture → severity classification (P0–P4) → intelligent routing |
| 💬 **Emergency Chat** | Real-time AI debugging assistant with code-aware responses |

### Specialized AI Tools
| Feature | Description |
|---------|-------------|
| 📦 **Dependency Danger Score** | Risk score (0–100) for any npm package — CVEs, bus factor, abandonment, modern alternatives |
| 🌳 **Error Ancestry Tree** | 4-layer visual trace: Surface Error → Propagation → Origin Gap → Root Decision |
| 🧬 **Context Capsule** | Auto-generates structured handoff docs — what was built, what failed, what's next |
| 🦉 **The Quiet Mentor** | Post-session code review — detects console logs, missing error boundaries, tech debt |
| ⚡ **Commit Risk Predictor** | Scores git diffs (0–100) for SQL injection, auth bypass, secrets, performance issues |
| 📋 **Post-Mortem Generator** | Professional incident post-mortem with timeline, action items, lessons learned |
| 🦆 **Rubber Duck Mode** | 4-step Socratic debugging — AI asks questions, developer finds their own answer |

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 / CSS3 / Vanilla JavaScript** — zero dependencies, instant load
- **Glassmorphism Design System** — `backdrop-filter: blur(20px)`, CSS variables, responsive
- **Google Fonts** — Inter (UI) + JetBrains Mono (code)
- **180 twinkling stars** background animation

### Backend
- **AWS Lambda** (Python 3.12) — serverless request handler
- **Amazon Bedrock** (Claude 3 Haiku) — foundation model for all AI features
- **Amazon API Gateway** — REST API with CORS
- **Amazon DynamoDB** — incident tracking with TTL auto-cleanup

### Infrastructure
- **AWS SAM** — Infrastructure as Code (CloudFormation)
- **GitHub Pages** — frontend hosting
- **Git/GitHub** — version control

---

## 🚀 Deployment Guide

### Frontend (Already Live)
The static frontend is deployed via GitHub Pages at:  
**https://avanishkasar.github.io/AI-for-BHART/**

### Backend (AWS)

**Prerequisites:**
- AWS account with Bedrock model access enabled for Claude 3 Haiku
- AWS CLI configured (`aws configure`)
- AWS SAM CLI installed ([install guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))

**Deploy:**
```bash
cd backend

# Build
sam build

# Deploy (first time — guided)
sam deploy --guided

# Deploy (subsequent)
sam deploy
```

**After deployment:**
1. Copy the API Gateway endpoint URL from the output
2. Open `js/api.js`
3. Set `endpoint` to your API URL
4. Set `enabled` to `true`
5. Push to GitHub

```javascript
const API_CONFIG = {
    endpoint: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/api/rescue',
    timeout: 15000,
    enabled: true,
};
```

### Enable Bedrock Model Access
1. Go to **Amazon Bedrock console** → **Model access**
2. Request access to **Anthropic Claude 3 Haiku**
3. Wait for approval (usually instant for Haiku)

---

## 📊 How It Works

```
Developer hits Panic Button
        ↓
Context captured automatically (code, errors, environment)
        ↓
AI classifies severity in <30 seconds:
  • P0 Critical  → Emergency team alert (<60s response)
  • P1 High      → Immediate expert notification (<5min)
  • P2 Medium    → AI + Human expert queue (<15min)
  • P3 Low       → AI resolves instantly
  • P4 Learning  → AI Tutor with guided approach
        ↓
Multi-modal response: Chat / Voice / Video / Screen Share
        ↓
Solution auto-documented in Knowledge Base
```

---

## 📁 Project Structure

```
AI-for-BHART/
├── index.html              # Landing page (hero, features, how-it-works)
├── dashboard.html          # Interactive dashboard with 8 feature tabs
├── css/
│   ├── style.css           # Global design system + star animations
│   └── dashboard.css       # Dashboard-specific styles (~2100 lines)
├── js/
│   ├── main.js             # Landing page JS (stars, navbar, terminal typing)
│   ├── api.js              # AWS API integration layer with fallback
│   └── dashboard.js        # All 8 features (~1700 lines)
├── backend/
│   ├── lambda_function.py  # AWS Lambda handler (Bedrock + DynamoDB)
│   ├── template.yaml       # SAM/CloudFormation infrastructure template
│   └── requirements.txt    # Python dependencies (boto3)
├── design.md               # Detailed system design document
├── requirements.md         # Full project requirements
├── PROBLEM_STATEMENT.md    # Problem definition
└── README.md               # This file
```

---

## 📈 Expected Impact

| Metric | Target |
|--------|--------|
| Developer productivity increase | **20%** |
| Support cost reduction | **60%** |
| Repeat question reduction | **50%** |
| Incident resolution speed | **40% faster** |
| Student retention improvement | **30%** |

---

## 🎯 Target Market

- **27 million developers** worldwide, growing 22% annually
- **Millions of CS students** learning to code
- **$300 billion** lost annually in developer productivity

### Segments
| Segment | Share | Price Point |
|---------|-------|-------------|
| Students & Junior Devs | 60% | Free tier |
| Development Teams (Startups) | 25% | $10/mo per dev |
| Educational Institutions | 10% | $50/mo per dept |
| Enterprise (100+ devs) | 5% | Custom pricing |

---

## 👥 Team DDoxers

| Name | Role |
|------|------|
| **Avanish Ravindra Kasar** | Team Lead, Full-Stack Developer |

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

**CodeRescue AI — Making every developer emergency manageable, every problem solvable, and every learning moment valuable.**
