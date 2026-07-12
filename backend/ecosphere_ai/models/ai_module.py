# -*- coding: utf-8 -*-
"""
EcoSphere AI — AI Module Models
Stores AI configurations, chat sessions, predictions, and AI-generated reports.
"""

import logging
from odoo import api, fields, models, _

_logger = logging.getLogger(__name__)


class AIConfiguration(models.Model):
    """System-wide AI configuration (API keys, model settings)."""
    _name = 'ecosphere.ai.config'
    _description = 'AI Configuration'
    _rec_name = 'provider'

    provider = fields.Selection([
        ('openai',  'OpenAI (GPT-4 / GPT-4o)'),
        ('gemini',  'Google Gemini Pro'),
        ('claude',  'Anthropic Claude'),
        ('azure',   'Azure OpenAI'),
        ('custom',  'Custom LLM Endpoint'),
    ], string='AI Provider', required=True, default='openai')

    api_key = fields.Char(
        string='API Key',
        groups='base.group_system',
        help='Stored encrypted. Only visible to administrators.',
    )
    model_name = fields.Char(
        string='Model Name',
        default='gpt-4o',
        help='e.g. gpt-4o, gemini-pro, claude-3-5-sonnet-20241022',
    )
    base_url = fields.Char(string='API Base URL')
    max_tokens = fields.Integer(string='Max Tokens', default=4096)
    temperature = fields.Float(string='Temperature', default=0.7, digits=(3, 2))
    timeout_seconds = fields.Integer(string='Request Timeout (s)', default=60)

    is_active = fields.Boolean(string='Active', default=True)
    monthly_token_budget = fields.Integer(
        string='Monthly Token Budget',
        default=1000000,
        help='Alert if usage exceeds this threshold.',
    )
    tokens_used_this_month = fields.Integer(
        string='Tokens Used (This Month)',
        readonly=True,
        default=0,
    )

    system_prompt = fields.Text(
        string='System Prompt',
        default=(
            'You are EcoSphere AI, an expert ESG (Environmental, Social & Governance) '
            'assistant. You help companies track carbon emissions, improve social impact, '
            'ensure governance compliance, and achieve sustainability goals. '
            'Provide accurate, data-driven, and actionable ESG insights.'
        ),
    )

    _sql_constraints = [
        ('unique_active_provider', 'UNIQUE(provider)', 'Only one config per AI provider.')
    ]


class AIChatSession(models.Model):
    """AI chatbot conversation sessions."""
    _name = 'ecosphere.ai.session'
    _description = 'AI Chat Session'
    _order = 'create_date desc'

    user_id = fields.Many2one(
        'res.users', string='User', required=True, index=True, ondelete='cascade',
    )
    session_token = fields.Char(string='Session Token', index=True, copy=False)
    title = fields.Char(string='Session Title', default='New Conversation')
    message_ids = fields.One2many(
        'ecosphere.ai.message', 'session_id', string='Messages',
    )
    message_count = fields.Integer(
        string='Messages', compute='_compute_counts', store=True,
    )
    total_tokens = fields.Integer(string='Total Tokens Used', default=0)
    is_active = fields.Boolean(string='Active Session', default=True)
    context_module = fields.Selection([
        ('general',     'General ESG'),
        ('carbon',      'Carbon & Environment'),
        ('social',      'Social Impact'),
        ('governance',  'Governance & Compliance'),
        ('reports',     'Report Generation'),
        ('analytics',   'Analytics & Insights'),
    ], string='Context Module', default='general')

    @api.depends('message_ids')
    def _compute_counts(self):
        for session in self:
            session.message_count = len(session.message_ids)


class AIChatMessage(models.Model):
    """Individual messages within an AI chat session."""
    _name = 'ecosphere.ai.message'
    _description = 'AI Chat Message'
    _order = 'sequence asc, id asc'

    session_id = fields.Many2one(
        'ecosphere.ai.session', string='Session',
        required=True, ondelete='cascade', index=True,
    )
    sequence = fields.Integer(string='Sequence', default=10)
    role = fields.Selection([
        ('user',      'User'),
        ('assistant', 'AI Assistant'),
        ('system',    'System'),
    ], string='Role', required=True, default='user')

    content = fields.Text(string='Message Content', required=True)
    timestamp = fields.Datetime(string='Timestamp', default=fields.Datetime.now)
    tokens_used = fields.Integer(string='Tokens Used', default=0)
    model_used = fields.Char(string='AI Model')

    # Structured data extraction
    has_data = fields.Boolean(string='Contains Structured Data')
    data_json = fields.Text(string='Extracted Data (JSON)')
    chart_config = fields.Text(string='Chart Config (JSON)')

    rating = fields.Selection([
        ('1', '👎 Not helpful'),
        ('2', '😐 Somewhat helpful'),
        ('3', '👍 Very helpful'),
    ], string='User Rating')


class CarbonPrediction(models.Model):
    """AI-generated carbon emission predictions."""
    _name = 'ecosphere.carbon.prediction'
    _description = 'AI Carbon Prediction'
    _order = 'prediction_date desc'

    name = fields.Char(string='Prediction Title', required=True)
    department_id = fields.Many2one('hr.department', string='Department')
    prediction_date = fields.Date(string='Prediction Date', default=fields.Date.today)
    target_period = fields.Char(string='Target Period', help='e.g. Q3 2025, FY 2026')
    target_month = fields.Integer(string='Target Month')
    target_year = fields.Integer(string='Target Year')

    predicted_co2_kg = fields.Float(
        string='Predicted CO₂e (kg)', digits=(16, 4),
    )
    confidence_pct = fields.Float(string='Confidence (%)', digits=(5, 2))
    actual_co2_kg = fields.Float(
        string='Actual CO₂e (kg)', digits=(16, 4),
        help='Filled after actual period ends.',
    )
    accuracy_pct = fields.Float(
        string='Prediction Accuracy (%)',
        compute='_compute_accuracy',
        store=True,
        digits=(5, 2),
    )

    model_version = fields.Char(string='AI Model Version')
    features_used = fields.Text(string='Features Used (JSON)')
    recommendation = fields.Text(string='AI Recommendation')
    reduction_potential = fields.Float(
        string='Reduction Potential (kg)', digits=(16, 4),
    )

    @api.depends('predicted_co2_kg', 'actual_co2_kg')
    def _compute_accuracy(self):
        for rec in self:
            if rec.predicted_co2_kg and rec.actual_co2_kg:
                error = abs(rec.predicted_co2_kg - rec.actual_co2_kg)
                rec.accuracy_pct = max(0, 100 - (error / rec.actual_co2_kg * 100))
            else:
                rec.accuracy_pct = 0.0


class ESGScorePrediction(models.Model):
    """AI-predicted ESG scores for departments and the company."""
    _name = 'ecosphere.score.prediction'
    _description = 'ESG Score Prediction'
    _order = 'prediction_date desc'

    name = fields.Char(string='Prediction', required=True)
    department_id = fields.Many2one('hr.department', string='Department')
    prediction_date = fields.Date(string='Date', default=fields.Date.today, index=True)
    target_year = fields.Integer(string='Target Year')
    target_quarter = fields.Selection([
        ('Q1', 'Q1'), ('Q2', 'Q2'), ('Q3', 'Q3'), ('Q4', 'Q4'),
    ], string='Target Quarter')

    predicted_esg_score = fields.Float(string='Predicted ESG Score', digits=(5, 2))
    predicted_env_score = fields.Float(string='Environmental Score', digits=(5, 2))
    predicted_social_score = fields.Float(string='Social Score', digits=(5, 2))
    predicted_gov_score = fields.Float(string='Governance Score', digits=(5, 2))
    confidence_pct = fields.Float(string='Confidence (%)', digits=(5, 2))

    key_drivers = fields.Text(string='Key Score Drivers (JSON)')
    risks = fields.Text(string='Key Risks')
    recommendations = fields.Text(string='AI Recommendations')
    model_version = fields.Char(string='Model Version')


class AIGeneratedReport(models.Model):
    """Stores AI-generated ESG reports and document summaries."""
    _name = 'ecosphere.ai.report'
    _description = 'AI Generated Report'
    _order = 'generated_at desc'

    name = fields.Char(string='Report Title', required=True)
    report_type = fields.Selection([
        ('esg_summary',         'ESG Executive Summary'),
        ('carbon_analysis',     'Carbon Analysis Report'),
        ('compliance_check',    'Compliance Status Report'),
        ('sustainability_plan', 'Sustainability Action Plan'),
        ('benchmarking',        'Industry Benchmarking Report'),
        ('sdg_mapping',         'SDG Impact Mapping'),
        ('document_summary',    'Document Summary'),
        ('custom',              'Custom AI Report'),
    ], string='Report Type', required=True)

    user_id = fields.Many2one(
        'res.users', string='Requested By',
        default=lambda self: self.env.user,
    )
    department_id = fields.Many2one('hr.department', string='Department')
    generated_at = fields.Datetime(string='Generated At', default=fields.Datetime.now)

    prompt_used = fields.Text(string='Prompt Used')
    content = fields.Html(string='Report Content')
    raw_text = fields.Text(string='Raw Text Content')
    tokens_used = fields.Integer(string='Tokens Used', default=0)
    model_used = fields.Char(string='AI Model')
    generation_time_ms = fields.Integer(string='Generation Time (ms)')

    period_from = fields.Date(string='Data Period From')
    period_to = fields.Date(string='Data Period To')

    export_pdf_url = fields.Char(string='PDF Export URL')
    is_public = fields.Boolean(string='Publicly Accessible', default=False)
    quality_rating = fields.Selection([
        ('poor', 'Poor'), ('fair', 'Fair'), ('good', 'Good'), ('excellent', 'Excellent'),
    ], string='Quality Rating')
    feedback = fields.Text(string='User Feedback')
