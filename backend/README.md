# EcoSphere AI — Odoo 18 ESG Backend Module

Welcome to the backend architecture of **EcoSphere AI**, designed for Odoo 18. This repository contains the complete enterprise-ready source code, database schemas, security configurations, and API controllers.

---

## 🏗️ Architecture Overview

The system strictly follows the Odoo Model-View-Controller (MVC) structure and integrates JWT-based authentication for modern Single Page Applications (SPA) or mobile frontends.

```
backend/
├── ecosphere_ai/
│   ├── __init__.py
│   ├── __manifest__.py        # Module metadata & dependencies
│   ├── controllers/            # REST & JSON HTTP Controllers
│   │   ├── auth_controller.py  # User authentication & OAuth placeholders
│   │   ├── esg_controller.py   # Environmental, Social, and Gamification APIs
│   │   └── ai_controller.py    # OpenAI/Gemini integration and chat API
│   ├── models/                 # Normalized PostgreSQL representation
│   │   ├── res_users_ext.py    # Extended user fields (XP, streaks, roles)
│   │   ├── environmental.py    # Scope 1/2/3 carbon ledger, water, waste, goals
│   │   ├── social.py           # CSR, volunteering, DEI parity metrics, training
│   │   ├── governance.py       # Policies, audti trails, risk assessment
│   │   ├── gamification.py     # Rewards, Green Coins shop, challenges
│   │   └── ai_module.py        # Chat log session, carbon projections
│   ├── security/               # Group definitions and ACL rules
│   │   ├── ecosphere_groups.xml
│   │   ├── ir.model.access.csv
│   │   └── record_rules.xml
│   └── data/                   # Initial seeds and background cron configurations
│       ├── emission_factors.xml
│       └── cron_jobs.xml
└── Dockerfile                  # Container definition
```

---

## 🔐 Authentication & Roles

EcoSphere AI enforces **Role-Based Access Control (RBAC)** across the following roles:
1. **Super Admin** - Full configuration and audit permission.
2. **ESG Manager** - Creates policies, approves challenges, signs off audits.
3. **Department Manager** - Logs emissions and views departmental reports.
4. **HR Manager** - Manages diversity metrics and wellness events.
5. **Compliance Officer** - Manages ESG compliance issues.
6. **Auditor** - Read-only auditing access to carbon ledger and activity logs.
7. **Employee** - Participates in challenges, logs volunteer hours.
8. **Guest** - Read-only demo access.

### Features Included
*   **JWT Handshakes**: Stateless authentication with automatic token expiration.
*   **2FA Verification**: Multi-factor verification.
*   **Account Lockout**: Automated lockout after 5 failed password attempts.

---

## 🚀 Docker Setup & Deployment

Ensure you have Docker and Docker Compose installed.

1.  **Launch the Stack**:
    ```bash
    docker-compose -f backend/docker-compose.yml up --build -d
    ```
2.  **Verify Services**:
    *   **Odoo 18 Backend**: `http://localhost:8069`
    *   **Client Dashboard**: `http://localhost:8000`

3.  **Bootstrap Odoo Database**:
    *   Navigate to `http://localhost:8069`.
    *   Create a database (e.g., `ecosphere_esg`).
    *   Go to Settings -> Activate Developer Mode -> Update Apps List.
    *   Install the **EcoSphere AI** module.

---

## 📈 ESG Metrics Scoring Rules

The platform automatically computes environmental impact scores based on department emission logs:
$$\text{Environmental Score} = 100.0 - \left( \frac{\text{Total } \text{CO}_2\text{e (kg)}}{1000.0} \right)$$
$$\text{Overall ESG Score} = (E \times 40\%) + (S \times 30\%) + (G \times 30\%)$$
These scoring definitions reside within the `ecosphere.department.score` model in [`analytics.py`](file:///c:/Users/joypa/Odoo/EcoSphere-AI/backend/ecosphere_ai/models/analytics.py).
