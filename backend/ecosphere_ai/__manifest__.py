# -*- coding: utf-8 -*-
# EcoSphere AI — Odoo 18 Hackathon Module
# Production-Ready ESG Management Platform

{
    'name': 'EcoSphere AI — ESG Management Platform',
    'version': '18.0.1.0.0',
    'category': 'Sustainability/ESG',
    'summary': 'AI-Powered ESG Management: Carbon, Social, Governance, Gamification & Analytics',
    'description': """
EcoSphere AI — Enterprise ESG Platform
========================================
A complete AI-powered Environmental, Social & Governance (ESG) management
platform built for Odoo 18 Hackathon.

Features:
---------
• Environmental: Carbon tracking, emission factors, goal management
• Social: CSR activities, volunteer events, DEI metrics, wellness
• Governance: Policies, audits, compliance, risk assessment
• Gamification: XP engine, badges, green coins, leaderboards
• AI Module: ChatGPT/Gemini integration, predictions, report generation
• Reports: PDF/Excel/CSV export, custom builder
• Analytics: ESG scores, department rankings, trend analysis
• Notifications: Email, in-app, alerts
• Security: JWT, 2FA, RBAC, OAuth, rate limiting
    """,
    'author': 'EcoSphere AI Team',
    'website': 'https://github.com/joypatel2x6-cell/EcoSphere-AI',
    'license': 'LGPL-3',

    'depends': [
        'base',
        'mail',
        'web',
        'hr',
        'hr_attendance',
        'fleet',
        'purchase',
        'account',
        'stock',
        'gamification',
        'survey',
        'document',
        'calendar',
        'contacts',
        'base_setup',
    ],

    'data': [
        # Security
        'security/ecosphere_groups.xml',
        'security/ir.model.access.csv',
        'security/record_rules.xml',

        # Master Data
        'data/emission_factors.xml',
        'data/badge_data.xml',
        'data/email_templates.xml',
        'data/cron_jobs.xml',
        'data/system_params.xml',

        # Views
        'views/menu_views.xml',
        'views/dashboard_views.xml',
        'views/environmental_views.xml',
        'views/social_views.xml',
        'views/governance_views.xml',
        'views/gamification_views.xml',
        'views/ai_views.xml',
        'views/report_views.xml',
        'views/admin_views.xml',
        'views/notification_views.xml',

        # Reports
        'reports/carbon_report.xml',
        'reports/esg_summary_report.xml',
        'reports/department_report.xml',
    ],

    'demo': [
        'data/demo_data.xml',
    ],

    'assets': {
        'web.assets_backend': [
            'ecosphere_ai/static/src/css/ecosphere.css',
            'ecosphere_ai/static/src/js/dashboard.js',
            'ecosphere_ai/static/src/js/charts.js',
        ],
    },

    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
    'application': True,

    'post_init_hook': 'post_init_hook',
    'uninstall_hook': 'uninstall_hook',
}
