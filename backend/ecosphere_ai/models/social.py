# -*- coding: utf-8 -*-
"""
EcoSphere AI — Social Module Models
Covers: CSR Activities, Volunteer Events, Employee Participation,
Training, DEI Metrics, Employee Wellness, Community Projects, Rankings.
"""

import logging
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class CSRActivity(models.Model):
    """
    Corporate Social Responsibility activities and volunteer events.
    Tracks planning, participation, impact, and ESG reporting.
    """
    _name = 'ecosphere.csr.activity'
    _description = 'CSR Activity / Volunteer Event'
    _order = 'event_date desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Activity Name', required=True, tracking=True)
    activity_type = fields.Selection([
        ('volunteer',       'Volunteer Event'),
        ('tree_planting',   'Tree Plantation'),
        ('blood_drive',     'Blood Drive'),
        ('food_drive',      'Food Drive'),
        ('beach_cleanup',   'Environmental Cleanup'),
        ('education',       'Education / Training'),
        ('fundraising',     'Fundraising'),
        ('donation',        'Corporate Donation'),
        ('internship',      'Social Internship'),
        ('community',       'Community Project'),
        ('wellness',        'Employee Wellness'),
        ('other',           'Other'),
    ], string='Activity Type', required=True, index=True)

    organizer_id = fields.Many2one(
        'res.users', string='Organizer',
        default=lambda self: self.env.user, tracking=True,
    )
    department_id = fields.Many2one('hr.department', string='Department', index=True)

    event_date = fields.Date(string='Event Date', required=True, index=True)
    event_end_date = fields.Date(string='End Date')
    duration_hours = fields.Float(string='Duration (hours)', digits=(6, 2))
    location = fields.Char(string='Location')
    max_participants = fields.Integer(string='Max Participants', default=50)

    actual_participants = fields.Integer(
        string='Actual Participants',
        compute='_compute_participant_stats',
        store=True,
    )
    total_volunteer_hours = fields.Float(
        string='Total Volunteer Hours',
        compute='_compute_participant_stats',
        store=True,
        digits=(10, 2),
    )

    participation_ids = fields.One2many(
        'ecosphere.employee.participation',
        'activity_id',
        string='Participants',
    )

    # ── Impact Metrics ────────────────────────────────────────────────────────
    trees_planted = fields.Integer(string='Trees Planted')
    co2_offset_kg = fields.Float(string='CO₂ Offset (kg)', digits=(10, 3))
    beneficiaries_count = fields.Integer(string='Beneficiaries Reached')
    funds_raised = fields.Monetary(string='Funds Raised', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id
    )

    # ── SDG Alignment ────────────────────────────────────────────────────────
    sdg_ids = fields.Many2many('ecosphere.sdg', string='UN SDG Alignment')

    description = fields.Html(string='Description')
    impact_report = fields.Html(string='Impact Report')
    image_url = fields.Char(string='Cover Image URL')

    state = fields.Selection([
        ('planned',     'Planned'),
        ('ongoing',     'Ongoing'),
        ('completed',   'Completed'),
        ('cancelled',   'Cancelled'),
    ], string='Status', default='planned', tracking=True, index=True)

    xp_reward = fields.Integer(
        string='XP Reward per Participant',
        default=50,
        help='XP points awarded to each confirmed participant.',
    )
    green_coins_reward = fields.Integer(
        string='Green Coins Reward',
        default=10,
    )

    # ── Computed ─────────────────────────────────────────────────────────────

    @api.depends('participation_ids', 'participation_ids.status', 'duration_hours')
    def _compute_participant_stats(self):
        for activity in self:
            confirmed = activity.participation_ids.filtered(
                lambda p: p.status == 'confirmed'
            )
            activity.actual_participants = len(confirmed)
            activity.total_volunteer_hours = len(confirmed) * (activity.duration_hours or 0)

    # ── Actions ───────────────────────────────────────────────────────────────

    def action_complete(self):
        """Mark activity as complete and award XP/coins to participants."""
        for activity in self:
            activity.write({'state': 'completed'})
            for participation in activity.participation_ids.filtered(
                lambda p: p.status == 'confirmed'
            ):
                user = participation.employee_id.user_id
                if user:
                    user.add_xp(activity.xp_reward, f'CSR: {activity.name}')
                    user.add_green_coins(
                        activity.green_coins_reward, f'CSR: {activity.name}'
                    )
                    user.update_streak()


class EmployeeParticipation(models.Model):
    """Tracks individual employee participation in CSR/volunteer activities."""
    _name = 'ecosphere.employee.participation'
    _description = 'Employee Participation'
    _order = 'participation_date desc'
    _rec_name = 'employee_id'

    activity_id = fields.Many2one(
        'ecosphere.csr.activity', string='Activity',
        required=True, ondelete='cascade', index=True,
    )
    employee_id = fields.Many2one(
        'hr.employee', string='Employee', required=True, index=True,
    )
    department_id = fields.Many2one(
        'hr.department', string='Department',
        related='employee_id.department_id', store=True,
    )
    participation_date = fields.Date(
        string='Participation Date', default=fields.Date.today,
    )
    hours_contributed = fields.Float(
        string='Hours Contributed', digits=(6, 2),
    )
    status = fields.Selection([
        ('registered',  'Registered'),
        ('confirmed',   'Confirmed'),
        ('attended',    'Attended'),
        ('absent',      'Absent'),
        ('cancelled',   'Cancelled'),
    ], string='Status', default='registered', index=True, tracking=True)
    feedback = fields.Text(string='Participant Feedback')
    rating = fields.Integer(string='Rating (1-5)', default=0)
    certificate_issued = fields.Boolean(string='Certificate Issued')
    certificate_url = fields.Char(string='Certificate URL')

    @api.constrains('rating')
    def _check_rating(self):
        for rec in self:
            if not 0 <= rec.rating <= 5:
                raise ValidationError(_('Rating must be between 0 and 5.'))


class DiversityMetric(models.Model):
    """
    Diversity, Equity & Inclusion (DEI) metrics.
    Tracks gender parity, leadership representation, pay equity, etc.
    """
    _name = 'ecosphere.diversity.metric'
    _description = 'DEI Diversity Metric'
    _order = 'period_date desc, metric_type'

    name = fields.Char(string='Metric Name', required=True)
    metric_type = fields.Selection([
        ('gender_ratio',        'Gender Ratio (M/F/Other)'),
        ('leadership_parity',   'Leadership Gender Parity'),
        ('pay_equity',          'Pay Equity Index'),
        ('ethnicity',           'Ethnic Diversity'),
        ('age_distribution',    'Age Distribution'),
        ('disability',          'Disability Inclusion'),
        ('new_hire_diversity',  'New Hire Diversity'),
        ('promotion_equity',    'Promotion Equity'),
        ('retention_rate',      'Retention Rate by Group'),
        ('training_hours',      'Training Hours per Employee'),
        ('custom',              'Custom KPI'),
    ], string='Metric Type', required=True, index=True)

    department_id = fields.Many2one('hr.department', string='Department')
    period_date = fields.Date(string='Reporting Period', required=True, index=True)

    metric_value = fields.Float(string='Metric Value', digits=(10, 4))
    unit = fields.Char(string='Unit', help='e.g. %, ratio, count')
    target_value = fields.Float(string='Target Value', digits=(10, 4))
    baseline_value = fields.Float(string='Baseline Value', digits=(10, 4))

    # Detailed breakdown for gender ratio
    male_count = fields.Integer(string='Male Count')
    female_count = fields.Integer(string='Female Count')
    non_binary_count = fields.Integer(string='Non-binary / Other Count')

    notes = fields.Text(string='Notes / Analysis')
    data_source = fields.Char(string='Data Source')
    verified_by = fields.Many2one('res.users', string='Verified By')

    pct_achievement = fields.Float(
        string='% Achievement',
        compute='_compute_achievement',
        store=True,
        digits=(5, 2),
    )

    @api.depends('metric_value', 'target_value')
    def _compute_achievement(self):
        for rec in self:
            if rec.target_value:
                rec.pct_achievement = (rec.metric_value / rec.target_value) * 100
            else:
                rec.pct_achievement = 0.0


class EmployeeWellness(models.Model):
    """Employee wellness program tracking."""
    _name = 'ecosphere.employee.wellness'
    _description = 'Employee Wellness Record'
    _order = 'record_date desc'

    name = fields.Char(string='Program Name', required=True)
    program_type = fields.Selection([
        ('mental_health',   'Mental Health Support'),
        ('fitness',         'Fitness & Exercise'),
        ('nutrition',       'Nutrition & Diet'),
        ('financial',       'Financial Wellness'),
        ('stress',          'Stress Management'),
        ('eap',             'Employee Assistance Program'),
        ('checkup',         'Health Checkup / Screening'),
        ('yoga_meditation', 'Yoga / Meditation'),
        ('ergonomics',      'Ergonomics'),
        ('other',           'Other'),
    ], string='Program Type', required=True)

    department_id = fields.Many2one('hr.department', string='Department')
    record_date = fields.Date(string='Date', required=True, index=True)
    participants_count = fields.Integer(string='Participants')
    satisfaction_score = fields.Float(string='Avg Satisfaction (1-10)', digits=(4, 2))
    cost = fields.Monetary(string='Program Cost', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id
    )
    notes = fields.Text(string='Notes')
    attendance_rate = fields.Float(string='Attendance Rate (%)', digits=(5, 2))


class TrainingRecord(models.Model):
    """ESG training and competency development records."""
    _name = 'ecosphere.training.record'
    _description = 'ESG Training Record'
    _order = 'training_date desc'
    _inherit = ['mail.thread']

    name = fields.Char(string='Training Name', required=True)
    training_type = fields.Selection([
        ('esg_fundamentals',    'ESG Fundamentals'),
        ('carbon_literacy',     'Carbon Literacy'),
        ('compliance',          'Regulatory Compliance'),
        ('sustainability',      'Sustainability Practices'),
        ('dei',                 'Diversity & Inclusion'),
        ('ethics',              'Business Ethics'),
        ('safety',              'Health & Safety'),
        ('data_privacy',        'Data Privacy / GDPR'),
        ('leadership',          'Sustainability Leadership'),
        ('custom',              'Custom Training'),
    ], string='Training Type', required=True)

    department_id = fields.Many2one('hr.department', string='Department')
    trainer = fields.Char(string='Trainer / Provider')
    training_date = fields.Date(string='Training Date', required=True, index=True)
    duration_hours = fields.Float(string='Duration (hours)', digits=(6, 2))
    is_mandatory = fields.Boolean(string='Mandatory Training')

    participant_ids = fields.Many2many(
        'hr.employee', string='Participants',
    )
    participants_count = fields.Integer(
        string='Participants Count',
        compute='_compute_count',
        store=True,
    )
    completion_rate = fields.Float(string='Completion Rate (%)', digits=(5, 2))
    assessment_avg_score = fields.Float(string='Avg Assessment Score', digits=(5, 2))
    certification_issued = fields.Boolean(string='Certification Issued')
    cost_per_head = fields.Monetary(string='Cost per Head', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id
    )

    @api.depends('participant_ids')
    def _compute_count(self):
        for rec in self:
            rec.participants_count = len(rec.participant_ids)

    xp_reward = fields.Integer(string='XP Reward on Completion', default=100)
