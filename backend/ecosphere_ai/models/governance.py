# -*- coding: utf-8 -*-
"""
EcoSphere AI — Governance Module Models
Covers: ESG Policies, Audits, Compliance Issues, Risk Assessment,
Document Management, Approval Workflows, Deadlines.
"""

import logging
from datetime import datetime, timedelta
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


class ESGPolicy(models.Model):
    """
    ESG governance policies managed by compliance officers.
    Supports versioning, acknowledgement tracking, and automated reminders.
    """
    _name = 'ecosphere.policy'
    _description = 'ESG Policy'
    _order = 'name asc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Policy Title', required=True, tracking=True)
    policy_code = fields.Char(
        string='Policy Code',
        copy=False,
        default=lambda self: _('New'),
        readonly=True,
    )
    policy_type = fields.Selection([
        ('environmental',   'Environmental Policy'),
        ('social',          'Social & HR Policy'),
        ('governance',      'Corporate Governance'),
        ('data_privacy',    'Data Privacy (GDPR)'),
        ('anti_corruption', 'Anti-Corruption & Bribery'),
        ('supplier',        'Supplier Code of Conduct'),
        ('climate',         'Climate Risk Policy'),
        ('health_safety',   'Health & Safety Policy'),
        ('whistleblower',   'Whistleblower Policy'),
        ('carbon',          'Carbon Reduction Policy'),
        ('custom',          'Custom Policy'),
    ], string='Policy Type', required=True, index=True)

    owner_id = fields.Many2one(
        'res.users', string='Policy Owner',
        default=lambda self: self.env.user, tracking=True,
    )
    approver_id = fields.Many2one('res.users', string='Approver', tracking=True)
    department_id = fields.Many2one('hr.department', string='Responsible Department')

    version = fields.Char(string='Version', default='1.0')
    effective_date = fields.Date(string='Effective Date', required=True, index=True)
    review_date = fields.Date(string='Next Review Date', tracking=True)
    expiry_date = fields.Date(string='Expiry Date')

    document_url = fields.Char(string='Document URL / Attachment')
    attachment_ids = fields.Many2many(
        'ir.attachment', string='Policy Documents',
    )
    content = fields.Html(string='Policy Content')
    summary = fields.Text(string='Executive Summary')

    state = fields.Selection([
        ('draft',       'Draft'),
        ('in_review',   'In Review'),
        ('approved',    'Approved'),
        ('published',   'Published'),
        ('archived',    'Archived'),
        ('superseded',  'Superseded'),
    ], string='Status', default='draft', tracking=True, index=True)

    acknowledgement_required = fields.Boolean(
        string='Acknowledgement Required',
        default=True,
        help='If set, employees must explicitly acknowledge this policy.',
    )
    target_audience = fields.Selection([
        ('all',         'All Employees'),
        ('managers',    'Managers & Above'),
        ('department',  'Specific Department'),
        ('executives',  'C-Suite / Executives'),
    ], string='Target Audience', default='all')

    acknowledgement_ids = fields.One2many(
        'ecosphere.policy.acknowledgement',
        'policy_id',
        string='Acknowledgements',
    )
    acknowledgement_rate = fields.Float(
        string='Acknowledgement Rate (%)',
        compute='_compute_ack_rate',
        store=False,
        digits=(5, 2),
    )

    regulation_ref = fields.Char(
        string='Regulatory Reference',
        help='e.g. EU CSRD Art. 29, GRI 302, SASB EM-EP-130a.1',
    )
    gri_standards = fields.Char(string='GRI Standard Reference')
    sdg_ids = fields.Many2many('ecosphere.sdg', string='SDG Alignment')

    is_critical = fields.Boolean(string='Critical Policy')
    risk_level = fields.Selection([
        ('low', 'Low'), ('medium', 'Medium'),
        ('high', 'High'), ('critical', 'Critical'),
    ], string='Risk Level', default='medium')

    # ── Sequence ──────────────────────────────────────────────────────────────

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('policy_code', _('New')) == _('New'):
                vals['policy_code'] = self.env['ir.sequence'].next_by_code(
                    'ecosphere.policy'
                ) or _('New')
        return super().create(vals_list)

    # ── Computed ─────────────────────────────────────────────────────────────

    @api.depends('acknowledgement_ids')
    def _compute_ack_rate(self):
        for policy in self:
            total = len(policy.acknowledgement_ids)
            if total:
                acked = len(policy.acknowledgement_ids.filtered(
                    lambda a: a.status == 'acknowledged'
                ))
                policy.acknowledgement_rate = (acked / total) * 100
            else:
                policy.acknowledgement_rate = 0.0

    # ── Workflow Actions ──────────────────────────────────────────────────────

    def action_submit_review(self):
        self.write({'state': 'in_review'})
        # Notify approver
        for policy in self:
            if policy.approver_id:
                policy.message_post(
                    body=_('Policy submitted for your review and approval.'),
                    partner_ids=[policy.approver_id.partner_id.id],
                    message_type='notification',
                    subtype_xmlid='mail.mt_comment',
                )

    def action_approve(self):
        self.write({'state': 'approved'})

    def action_publish(self):
        for policy in self:
            policy.write({'state': 'published'})
            if policy.acknowledgement_required:
                policy._send_acknowledgement_requests()

    def action_archive_policy(self):
        self.write({'state': 'archived'})

    def _send_acknowledgement_requests(self):
        """Send acknowledgement requests to target employees."""
        self.ensure_one()
        employees = self._get_target_employees()
        for employee in employees:
            existing = self.acknowledgement_ids.filtered(
                lambda a: a.employee_id == employee
            )
            if not existing:
                self.env['ecosphere.policy.acknowledgement'].create({
                    'policy_id': self.id,
                    'employee_id': employee.id,
                    'due_date': fields.Date.today() + timedelta(days=14),
                })

    def _get_target_employees(self):
        """Return the set of employees required to acknowledge this policy."""
        if self.target_audience == 'all':
            return self.env['hr.employee'].search([('active', '=', True)])
        elif self.target_audience == 'department' and self.department_id:
            return self.env['hr.employee'].search([
                ('department_id', '=', self.department_id.id),
                ('active', '=', True),
            ])
        elif self.target_audience == 'managers':
            return self.env['hr.employee'].search([
                ('job_title', 'ilike', 'manager'),
                ('active', '=', True),
            ])
        return self.env['hr.employee'].browse()


class PolicyAcknowledgement(models.Model):
    """Tracks per-employee policy acknowledgement status."""
    _name = 'ecosphere.policy.acknowledgement'
    _description = 'Policy Acknowledgement'
    _order = 'due_date asc'

    policy_id = fields.Many2one(
        'ecosphere.policy', string='Policy',
        required=True, ondelete='cascade', index=True,
    )
    employee_id = fields.Many2one(
        'hr.employee', string='Employee', required=True, index=True,
    )
    due_date = fields.Date(string='Due Date', index=True)
    acknowledged_date = fields.Datetime(string='Acknowledged At')
    status = fields.Selection([
        ('pending',      'Pending'),
        ('acknowledged', 'Acknowledged'),
        ('overdue',      'Overdue'),
        ('waived',       'Waived'),
    ], string='Status', default='pending', index=True)
    ip_address = fields.Char(string='IP Address (for legal record)')
    notes = fields.Text(string='Notes')

    def action_acknowledge(self):
        """Employee acknowledges the policy."""
        self.write({
            'status': 'acknowledged',
            'acknowledged_date': fields.Datetime.now(),
            'ip_address': self._context.get('ip_address', ''),
        })
        # Award XP for compliance
        user = self.employee_id.user_id
        if user:
            user.add_xp(25, f'Policy Acknowledged: {self.policy_id.name}')


class ESGAudit(models.Model):
    """
    ESG audit management — internal and external audits.
    Tracks findings, corrective actions, and sign-offs.
    """
    _name = 'ecosphere.audit'
    _description = 'ESG Audit'
    _order = 'audit_date desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Audit Title', required=True, tracking=True)
    audit_code = fields.Char(
        string='Audit Reference',
        copy=False,
        default=lambda self: _('New'),
        readonly=True,
    )
    audit_type = fields.Selection([
        ('internal',        'Internal Audit'),
        ('external',        'External / Third-Party'),
        ('regulatory',      'Regulatory / Government'),
        ('customer',        'Customer Audit'),
        ('certification',   'Certification Audit'),
        ('pre_audit',       'Pre-Audit / Gap Analysis'),
    ], string='Audit Type', required=True, default='internal')

    audit_scope = fields.Selection([
        ('environmental',   'Environmental (E)'),
        ('social',          'Social (S)'),
        ('governance',      'Governance (G)'),
        ('esg_full',        'Full ESG'),
        ('carbon',          'Carbon Accounting'),
        ('labor',           'Labor Practices'),
        ('data_security',   'Data & Cyber Security'),
    ], string='Audit Scope', required=True)

    lead_auditor_id = fields.Many2one('res.users', string='Lead Auditor', tracking=True)
    auditor_team = fields.Many2many('res.users', string='Audit Team')
    department_id = fields.Many2one('hr.department', string='Department / Entity Audited')

    audit_date = fields.Date(string='Audit Start Date', required=True, index=True)
    audit_end_date = fields.Date(string='Audit End Date')
    report_due_date = fields.Date(string='Report Due Date')

    state = fields.Selection([
        ('planned',         'Planned'),
        ('in_progress',     'In Progress'),
        ('findings_review', 'Findings in Review'),
        ('completed',       'Completed'),
        ('certified',       'Certified / Signed Off'),
        ('cancelled',       'Cancelled'),
    ], string='Status', default='planned', tracking=True, index=True)

    finding_ids = fields.One2many(
        'ecosphere.audit.finding',
        'audit_id',
        string='Audit Findings',
    )
    total_findings = fields.Integer(
        string='Total Findings',
        compute='_compute_findings_summary',
        store=True,
    )
    critical_findings = fields.Integer(
        string='Critical Findings',
        compute='_compute_findings_summary',
        store=True,
    )
    open_findings = fields.Integer(
        string='Open Findings',
        compute='_compute_findings_summary',
        store=True,
    )

    overall_score = fields.Float(
        string='Overall Score (%)',
        digits=(5, 2),
        help='Compliance score as a percentage.',
    )
    certification_standard = fields.Char(
        string='Standard / Framework',
        help='e.g. ISO 14001, GRI, SASB, TCFD, CDP',
    )
    audit_report = fields.Html(string='Audit Report')
    executive_summary = fields.Text(string='Executive Summary')
    attachments = fields.Many2many('ir.attachment', string='Attachments')

    @api.depends('finding_ids', 'finding_ids.severity', 'finding_ids.status')
    def _compute_findings_summary(self):
        for audit in self:
            audit.total_findings = len(audit.finding_ids)
            audit.critical_findings = len(audit.finding_ids.filtered(
                lambda f: f.severity == 'critical'
            ))
            audit.open_findings = len(audit.finding_ids.filtered(
                lambda f: f.status in ('open', 'in_progress')
            ))

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('audit_code', _('New')) == _('New'):
                vals['audit_code'] = self.env['ir.sequence'].next_by_code(
                    'ecosphere.audit'
                ) or _('New')
        return super().create(vals_list)


class AuditFinding(models.Model):
    """Individual findings from an ESG audit with corrective actions."""
    _name = 'ecosphere.audit.finding'
    _description = 'Audit Finding'
    _order = 'severity desc, audit_id'

    audit_id = fields.Many2one(
        'ecosphere.audit', string='Audit',
        required=True, ondelete='cascade', index=True,
    )
    title = fields.Char(string='Finding Title', required=True)
    finding_type = fields.Selection([
        ('non_conformity',  'Non-Conformity'),
        ('observation',     'Observation'),
        ('opportunity',     'Improvement Opportunity'),
        ('positive',        'Positive Practice'),
        ('major_nc',        'Major Non-Conformity'),
    ], string='Finding Type', required=True)

    severity = fields.Selection([
        ('low',      'Low'),
        ('medium',   'Medium'),
        ('high',     'High'),
        ('critical', 'Critical'),
    ], string='Severity', default='medium', index=True)

    area = fields.Char(string='Area / Process')
    description = fields.Text(string='Finding Description', required=True)
    evidence = fields.Text(string='Evidence / Reference')
    regulation_ref = fields.Char(string='Standard/Regulation Reference')

    owner_id = fields.Many2one('res.users', string='Responsible Owner', tracking=True)
    corrective_action = fields.Text(string='Corrective Action Plan')
    due_date = fields.Date(string='Corrective Action Due Date', index=True)
    completion_date = fields.Date(string='Completion Date')

    status = fields.Selection([
        ('open',        'Open'),
        ('in_progress', 'In Progress'),
        ('resolved',    'Resolved'),
        ('verified',    'Verified & Closed'),
        ('waived',      'Risk Accepted / Waived'),
    ], string='Status', default='open', tracking=True, index=True)


class ComplianceIssue(models.Model):
    """Tracks compliance violations, incidents, and regulatory breaches."""
    _name = 'ecosphere.compliance.issue'
    _description = 'Compliance Issue'
    _order = 'detected_date desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Issue Title', required=True, tracking=True)
    issue_ref = fields.Char(
        string='Issue Reference',
        copy=False,
        default=lambda self: _('New'),
        readonly=True,
    )
    issue_type = fields.Selection([
        ('regulatory',      'Regulatory Breach'),
        ('policy',          'Policy Violation'),
        ('reporting',       'Reporting Gap'),
        ('data_quality',    'Data Quality Issue'),
        ('disclosure',      'Disclosure Failure'),
        ('labor',           'Labor Law Violation'),
        ('environmental',   'Environmental Incident'),
        ('fraud',           'Fraud / Corruption'),
        ('cyber',           'Cyber Security Incident'),
        ('other',           'Other'),
    ], string='Issue Type', required=True, index=True)

    severity = fields.Selection([
        ('minor',    'Minor'),
        ('moderate', 'Moderate'),
        ('major',    'Major'),
        ('critical', 'Critical'),
        ('breach',   'Regulatory Breach'),
    ], string='Severity', default='moderate', tracking=True, index=True)

    detected_date = fields.Date(string='Date Detected', required=True, index=True)
    reported_by_id = fields.Many2one('res.users', string='Reported By')
    department_id = fields.Many2one('hr.department', string='Department', index=True)
    owner_id = fields.Many2one('res.users', string='Issue Owner', tracking=True)

    description = fields.Text(string='Issue Description', required=True)
    root_cause = fields.Text(string='Root Cause Analysis')
    immediate_action = fields.Text(string='Immediate Action Taken')
    corrective_plan = fields.Text(string='Corrective Action Plan')

    resolution_date = fields.Date(string='Target Resolution Date', tracking=True)
    actual_resolution_date = fields.Date(string='Actual Resolution Date')

    state = fields.Selection([
        ('open',        'Open'),
        ('under_review','Under Review'),
        ('remediation', 'In Remediation'),
        ('resolved',    'Resolved'),
        ('closed',      'Closed'),
        ('escalated',   'Escalated'),
    ], string='Status', default='open', tracking=True, index=True)

    financial_impact = fields.Monetary(
        string='Financial Impact', currency_field='currency_id',
    )
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id,
    )
    regulatory_body = fields.Char(string='Regulatory Authority')
    fine_amount = fields.Monetary(string='Fine / Penalty', currency_field='currency_id')
    is_reported_externally = fields.Boolean(string='Reported to Regulator')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('issue_ref', _('New')) == _('New'):
                vals['issue_ref'] = self.env['ir.sequence'].next_by_code(
                    'ecosphere.compliance.issue'
                ) or _('New')
        return super().create(vals_list)


class RiskAssessment(models.Model):
    """ESG risk register and assessment."""
    _name = 'ecosphere.risk.assessment'
    _description = 'ESG Risk Assessment'
    _order = 'risk_score desc, name'

    name = fields.Char(string='Risk Title', required=True)
    risk_category = fields.Selection([
        ('climate_physical',    'Climate — Physical Risk'),
        ('climate_transition',  'Climate — Transition Risk'),
        ('regulatory',          'Regulatory & Legal'),
        ('reputational',        'Reputational'),
        ('operational',         'Operational'),
        ('supply_chain',        'Supply Chain'),
        ('social',              'Social / Community'),
        ('governance',          'Governance & Ethics'),
        ('cybersecurity',       'Cyber & Data Security'),
        ('market',              'Market / Economic'),
    ], string='Risk Category', required=True, index=True)

    department_id = fields.Many2one('hr.department', string='Department')
    owner_id = fields.Many2one('res.users', string='Risk Owner')
    review_date = fields.Date(string='Review Date')

    likelihood = fields.Selection([
        ('1', 'Rare (1)'), ('2', 'Unlikely (2)'), ('3', 'Possible (3)'),
        ('4', 'Likely (4)'), ('5', 'Almost Certain (5)'),
    ], string='Likelihood', required=True)
    impact = fields.Selection([
        ('1', 'Negligible (1)'), ('2', 'Minor (2)'), ('3', 'Moderate (3)'),
        ('4', 'Major (4)'), ('5', 'Catastrophic (5)'),
    ], string='Impact', required=True)

    risk_score = fields.Integer(
        string='Risk Score',
        compute='_compute_risk_score',
        store=True,
    )
    risk_level = fields.Selection([
        ('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical'),
    ], string='Risk Level', compute='_compute_risk_score', store=True)

    description = fields.Text(string='Risk Description')
    existing_controls = fields.Text(string='Existing Controls')
    mitigation_plan = fields.Text(string='Mitigation Plan')
    residual_risk = fields.Integer(string='Residual Risk Score')

    state = fields.Selection([
        ('identified', 'Identified'),
        ('assessed',   'Assessed'),
        ('mitigated',  'Mitigated'),
        ('accepted',   'Risk Accepted'),
        ('closed',     'Closed'),
    ], string='Status', default='identified')

    @api.depends('likelihood', 'impact')
    def _compute_risk_score(self):
        for rec in self:
            if rec.likelihood and rec.impact:
                score = int(rec.likelihood) * int(rec.impact)
                rec.risk_score = score
                if score <= 4:
                    rec.risk_level = 'low'
                elif score <= 9:
                    rec.risk_level = 'medium'
                elif score <= 16:
                    rec.risk_level = 'high'
                else:
                    rec.risk_level = 'critical'
            else:
                rec.risk_score = 0
                rec.risk_level = 'low'
