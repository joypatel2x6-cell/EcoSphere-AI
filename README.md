<div align="center">

# 🌍 EcoSphere AI

### Intelligent ESG Management Platform

**Empowering Sustainable Enterprises Through AI, Automation & Real-Time ESG Intelligence**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Odoo](https://img.shields.io/badge/Odoo-18-purple.svg)](https://odoo.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)
[![ESG](https://img.shields.io/badge/ESG-Intelligence-10b981.svg)](#)

</div>

---

## 📌 Overview

**EcoSphere AI** is a premium, enterprise-grade **ESG (Environmental, Social & Governance) Management Platform** powered by Artificial Intelligence. Built on an **Odoo 18 backend** and a modern **Vanilla JS/HTML/CSS frontend**, it enables organizations to measure, monitor, and improve their sustainability performance in real-time.

> Design philosophy: **Apple + Tesla + OpenAI + Linear** — dark-first glassmorphic UI, smooth animations, and premium micro-interactions.

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **ESG AI Chatbot** — Natural language Q&A across 10+ ESG topic categories
- **Voice Assistant** — Web Speech API navigation across all platform pages
- **Neural ESG Predictor** — Real-time ESG score simulation using sliders
- **Carbon Forecast Engine** — Dynamic 12-month emissions projection charts

### 🌿 ESG Modules

| Module | Description |
|--------|-------------|
| 🌍 Climate Analytics | Carbon footprint tracking, emissions monitoring, energy usage |
| 👥 Social Impact | Workforce metrics, community programs, gender equality scores |
| ⚖️ Governance Log | Compliance tracking, board structure, risk & audit flags |
| 📊 Report Center | Automated ESG PDF reports, analytics dashboards |
| 🏆 Eco League | Gamification — badges, challenges, leaderboards |
| 🔬 Innovations Lab | Green tech simulations, forest plantation canvas, AI predictions |
| 💡 AI Insights | ESG chatbot, context-aware recommendations |

### 🎨 UI/UX
- **Dark / Light mode toggle** — persists across all pages via `localStorage`
- **Animated hero headline** — flowing gradient color animation
- **3D Interactive Earth Globe** — real-time Leaflet.js globe on homepage
- **Glassmorphism cards** — `backdrop-filter` blur throughout
- **PWA installable** — Service worker + web app manifest

### ⚙️ Admin Portal
- User management with roles & permissions matrix
- Badge gallery & gamification control
- System health monitoring
- ESG analytics with chart visualizations
- Deep-link support: `admin.html?section=settings`

---

## 🏗️ Project Structure

```
EcoSphere-AI/
├── frontend/                    # Pure HTML/CSS/JS web app
│   ├── index.html               # Landing page (hero, features, globe)
│   ├── auth.html                # Login & registration
│   ├── dashboard.html           # Main ESG dashboard
│   ├── environmental.html       # Climate analytics module
│   ├── social.html              # Social impact module
│   ├── governance.html          # Governance & compliance
│   ├── reports.html             # Report generation center
│   ├── innovations.html         # AI simulation lab
│   ├── gamification.html        # Eco League & badges
│   ├── insights.html            # AI chatbot
│   ├── admin.html               # Admin portal
│   ├── styles.css               # Global design system & animations
│   ├── dashboard.css            # Shared dashboard layout styles
│   ├── innovations.css          # Innovations Lab styles
│   ├── insights.css             # AI chatbot styles
│   ├── sw.js                    # Service Worker (network-first, v6)
│   ├── manifest.json            # PWA manifest
│   ├── avatar-voice.js          # Voice assistant (Web Speech API)
│   ├── globe.js                 # 3D Earth globe renderer
│   └── app.js                   # Shared utilities
│
├── backend/                     # Odoo 18 ESG module
│   ├── ecosphere_ai/
│   │   ├── __manifest__.py      # Module manifest
│   │   ├── models/              # Odoo ORM models
│   │   │   ├── esg_report.py
│   │   │   ├── carbon_data.py
│   │   │   ├── analytics.py
│   │   │   ├── gamification.py
│   │   │   └── ai_module.py
│   │   ├── controllers/         # REST API controllers
│   │   │   ├── auth_controller.py  # JWT auth, OAuth, 2FA
│   │   │   ├── esg_controller.py
│   │   │   └── gamification_controller.py
│   │   ├── views/               # Odoo XML views & menus
│   │   ├── data/                # Demo data, badges, cron jobs
│   │   └── security/            # ACL rules
│   ├── app.py                   # Flask fallback API server
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Odoo 18** (for backend features)
- A modern browser (Chrome, Edge, Firefox)

### 1. Clone the Repository

```bash
git clone https://github.com/joypatel2x6-cell/EcoSphere-AI.git
cd EcoSphere-AI
```

### 2. Run the Frontend (Local Dev Server)

```bash
cd frontend
python -m http.server 8000
```

Open `http://localhost:8000/index.html` in your browser.

### 3. Run the Odoo 18 Backend

```bash
# Ensure Odoo 18 is installed and configured
cd backend
# Install the module into your Odoo addons path
# Then in Odoo: Apps → Install → EcoSphere AI
```

### 4. Run with Docker (Optional)

```bash
cd backend
docker-compose up --build
```

---

## 🔐 Authentication

The auth system (`auth_controller.py`) implements:

- **JWT Authentication** — Pure Python HMAC-SHA256 tokens
- **User Registration** — with email verification flow
- **OAuth Social Login** — Google, Microsoft, GitHub routing
- **Session Management** — with "Remember Me" support
- **Two-Factor Authentication (2FA)**
- **Account Lockout** — brute-force protection

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary (Emerald) | `#10b981` |
| Blue Accent | `#3b82f6` |
| Purple | `#a855f7` |
| Background Dark | `#0a0f0a` |
| Background Light | `#f0faf5` |
| Font | Inter, Space Grotesk |

**CSS Animation:** Hero headline uses a flowing `text-gradient-flow` keyframe animation (`8s ease infinite`) across a `300% 300%` gradient background.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript |
| Backend | Odoo 18 (Python) |
| Charts | Apache ECharts 5, Leaflet.js |
| Icons | Lucide Icons |
| Animations | GSAP 3, CSS Keyframes |
| Voice | Web Speech API (browser built-in) |
| PWA | Service Worker + Web App Manifest |
| Auth | JWT (HMAC-SHA256), OAuth 2.0 |

---

## 🗂️ Odoo Models

| Model | Purpose |
|-------|---------|
| `esg.report` | Consolidated ESG scoring and report generation |
| `carbon.data` | Carbon emissions tracking per activity/scope |
| `esg.analytics` | Trend analysis and time-series data |
| `gamification.badge` | Badge system, challenge definitions |
| `ai.module` | AI inference configs and recommendation engine |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ecosphere/auth/login` | JWT login |
| `POST` | `/ecosphere/auth/register` | New user registration |
| `POST` | `/ecosphere/auth/verify-2fa` | 2FA code verification |
| `GET`  | `/ecosphere/esg/scores` | Current ESG scores |
| `GET`  | `/ecosphere/esg/carbon` | Carbon emissions data |
| `POST` | `/ecosphere/esg/report` | Generate ESG report |
| `GET`  | `/ecosphere/gamification/badges` | User badges |

---

## 📱 PWA Support

EcoSphere AI is installable as a Progressive Web App:
- ✅ Service Worker with **network-first** strategy (cache v6)
- ✅ Offline fallback for cached ESG data
- ✅ Web App Manifest with icons
- ✅ Install prompt on supported browsers

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Joy Patel**  
CSO, EcoSphere Enterprise  
GitHub: [@joypatel2x6-cell](https://github.com/joypatel2x6-cell)

---

<div align="center">

**🌱 Building a Sustainable Future with Artificial Intelligence**

*EcoSphere AI — Making sustainability measurable, actionable, and impactful.*

</div>
