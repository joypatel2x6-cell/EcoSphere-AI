# -*- coding: utf-8 -*-
"""
EcoSphere AI — Gamification Module Models
Covers: Challenges, XP Engine, Badge Engine, Reward Engine,
Leaderboard, Green Coins, Achievements, Reward Redemption.
"""

import logging
from datetime import datetime, timedelta
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


class EcoChallenge(models.Model):
    """
    Gamification challenges (daily / weekly / monthly / special).
    Employees earn XP and Green Coins by completing challenges.
    """
    _name = 'ecosphere.challenge'
    _description = 'ESG Challenge'
    _order = 'deadline_date asc, name'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Challenge Title', required=True, tracking=True)
    challenge_code = fields.Char(
        string='Challenge Code',
        copy=False,
        default=lambda self: _('New'),
        readonly=True,
    )
    challenge_type = fields.Selection([
        ('daily',    'Daily Challenge'),
        ('weekly',   'Weekly Challenge'),
        ('monthly',  'Monthly Challenge'),
        ('special',  'Special Event'),
        ('team',     'Team Challenge'),
        ('company',  'Company-Wide Challenge'),
    ], string='Challenge Type', required=True, index=True)

    category = fields.Selection([
        ('carbon',      'Carbon Reduction'),
        ('energy',      'Energy Saving'),
        ('water',       'Water Conservation'),
        ('waste',       'Waste Reduction'),
        ('transport',   'Sustainable Transport'),
        ('csr',         'CSR Participation'),
        ('training',    'Learning & Development'),
        ('wellness',    'Wellness'),
        ('governance',  'Compliance & Governance'),
        ('innovation',  'Green Innovation'),
        ('custom',      'Custom'),
    ], string='Category', required=True)

    description = fields.Html(string='Challenge Description')
    instructions = fields.Html(string='How to Complete')
    image_url = fields.Char(string='Challenge Image URL')

    start_date = fields.Date(string='Start Date', required=True, index=True)
    deadline_date = fields.Date(string='Deadline', required=True, tracking=True)

    # ── Rewards ───────────────────────────────────────────────────────────────
    xp_reward = fields.Integer(string='XP Reward', default=100, required=True)
    green_coins_reward = fields.Integer(string='Green Coins Reward', default=20)
    badge_id = fields.Many2one(
        'ecosphere.badge', string='Badge Reward (Optional)',
        help='Badge automatically unlocked upon completion.',
    )

    # ── Completion Criteria ───────────────────────────────────────────────────
    target_type = fields.Selection([
        ('manual',      'Manual Verification'),
        ('auto_carbon', 'Auto: Carbon Reduction Target'),
        ('auto_csr',    'Auto: CSR Activity Participation'),
        ('auto_training','Auto: Training Completion'),
        ('survey',      'Survey Response'),
    ], string='Completion Method', default='manual')
    target_value = fields.Float(string='Target Value', digits=(10, 2))
    target_unit = fields.Char(string='Target Unit')

    # ── Participation ─────────────────────────────────────────────────────────
    participation_ids = fields.One2many(
        'ecosphere.challenge.participation',
        'challenge_id',
        string='Participants',
    )
    total_participants = fields.Integer(
        string='Total Participants',
        compute='_compute_stats',
        store=True,
    )
    completed_count = fields.Integer(
        string='Completed',
        compute='_compute_stats',
        store=True,
    )
    completion_rate = fields.Float(
        string='Completion Rate (%)',
        compute='_compute_stats',
        store=True,
        digits=(5, 2),
    )

    max_participants = fields.Integer(
        string='Max Participants',
        default=0,
        help='0 = unlimited',
    )
    department_ids = fields.Many2many(
        'hr.department',
        string='Target Departments',
        help='Leave empty to make it company-wide.',
    )

    state = fields.Selection([
        ('draft',     'Draft'),
        ('published', 'Published / Active'),
        ('ended',     'Ended'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True, index=True)

    creator_id = fields.Many2one(
        'res.users', string='Created By',
        default=lambda self: self.env.user,
    )
    approver_id = fields.Many2one('res.users', string='Approved By')
    approved_at = fields.Datetime(string='Approved At')

    is_featured = fields.Boolean(string='Featured Challenge')
    difficulty = fields.Selection([
        ('easy',   'Easy — Beginner'),
        ('medium', 'Medium — Intermediate'),
        ('hard',   'Hard — Expert'),
        ('elite',  'Elite — Champion'),
    ], string='Difficulty', default='medium')

    # ── Computed ─────────────────────────────────────────────────────────────

    @api.depends('participation_ids', 'participation_ids.status')
    def _compute_stats(self):
        for challenge in self:
            parts = challenge.participation_ids
            challenge.total_participants = len(parts)
            completed = parts.filtered(lambda p: p.status == 'completed')
            challenge.completed_count = len(completed)
            challenge.completion_rate = (
                (len(completed) / len(parts) * 100) if parts else 0.0
            )

    # ── Sequence ──────────────────────────────────────────────────────────────

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('challenge_code', _('New')) == _('New'):
                vals['challenge_code'] = self.env['ir.sequence'].next_by_code(
                    'ecosphere.challenge'
                ) or _('New')
        return super().create(vals_list)

    # ── Actions ───────────────────────────────────────────────────────────────

    def action_publish(self):
        """Publish challenge and notify target audience."""
        for challenge in self:
            challenge.write({
                'state': 'published',
                'approver_id': self.env.user.id,
                'approved_at': fields.Datetime.now(),
            })
            challenge._notify_target_users()

    def action_end(self):
        """End challenge and process rewards for completed participants."""
        for challenge in self:
            challenge.write({'state': 'ended'})
            challenge._process_rewards()

    def _notify_target_users(self):
        """Send in-app notification to eligible users."""
        self.ensure_one()
        domain = [('active', '=', True)]
        if self.department_ids:
            domain.append(('department_id', 'in', self.department_ids.ids))
        employees = self.env['hr.employee'].search(domain)
        for emp in employees:
            if emp.user_id:
                self.env['ecosphere.notification'].sudo().create({
                    'user_id': emp.user_id.id,
                    'title': f'🎯 New Challenge: {self.name}',
                    'message': (
                        f'A new {self.get_challenge_type_display()} has been published! '
                        f'Complete it by {self.deadline_date} to earn '
                        f'{self.xp_reward} XP and {self.green_coins_reward} Green Coins.'
                    ),
                    'notification_type': 'challenge',
                    'reference_id': self.id,
                    'reference_model': 'ecosphere.challenge',
                })

    def get_challenge_type_display(self):
        """Return human-readable challenge type."""
        return dict(self._fields['challenge_type'].selection).get(
            self.challenge_type, self.challenge_type
        )

    def _process_rewards(self):
        """Award XP and coins to all completed participants."""
        self.ensure_one()
        completed = self.participation_ids.filtered(lambda p: p.status == 'completed')
        for participation in completed:
            user = participation.user_id
            if user:
                user.add_xp(self.xp_reward, f'Challenge: {self.name}')
                user.add_green_coins(self.green_coins_reward, f'Challenge: {self.name}')
                if self.badge_id:
                    self.env['ecosphere.badge.grant'].sudo()._grant_badge(
                        user, self.badge_id, f'Challenge: {self.name}'
                    )

    # ── Scheduled Actions ─────────────────────────────────────────────────────

    @api.model
    def _cron_check_deadlines(self):
        """Cron: auto-end challenges past their deadline."""
        expired = self.search([
            ('state', '=', 'published'),
            ('deadline_date', '<', fields.Date.today()),
        ])
        for challenge in expired:
            challenge.action_end()
        _logger.info('EcoSphere: Processed %d expired challenges.', len(expired))


class ChallengeParticipation(models.Model):
    """Tracks individual user participation in challenges."""
    _name = 'ecosphere.challenge.participation'
    _description = 'Challenge Participation'
    _order = 'joined_at desc'
    _rec_name = 'user_id'

    challenge_id = fields.Many2one(
        'ecosphere.challenge', string='Challenge',
        required=True, ondelete='cascade', index=True,
    )
    user_id = fields.Many2one(
        'res.users', string='User', required=True, index=True, ondelete='cascade',
    )
    employee_id = fields.Many2one(
        'hr.employee', string='Employee',
        related='user_id.employee_id', store=True,
    )
    department_id = fields.Many2one(
        'hr.department', string='Department',
        related='employee_id.department_id', store=True,
    )

    joined_at = fields.Datetime(string='Joined At', default=fields.Datetime.now)
    completed_at = fields.Datetime(string='Completed At')
    approved_at = fields.Datetime(string='Approved At')
    approved_by_id = fields.Many2one('res.users', string='Approved By')

    status = fields.Selection([
        ('joined',      'Joined'),
        ('in_progress', 'In Progress'),
        ('submitted',   'Submitted for Review'),
        ('completed',   'Completed ✓'),
        ('rejected',    'Rejected'),
        ('expired',     'Expired'),
    ], string='Status', default='joined', tracking=True, index=True)

    progress_value = fields.Float(string='Progress Value', digits=(10, 2))
    submission_notes = fields.Text(string='Submission Notes')
    submission_attachments = fields.Many2many('ir.attachment', string='Evidence / Attachments')
    reviewer_feedback = fields.Text(string='Reviewer Feedback')

    xp_awarded = fields.Integer(string='XP Awarded', default=0)
    coins_awarded = fields.Integer(string='Coins Awarded', default=0)
    rewards_processed = fields.Boolean(string='Rewards Processed', default=False)

    _sql_constraints = [
        (
            'unique_user_challenge',
            'UNIQUE(challenge_id, user_id)',
            'A user can only join a challenge once.',
        )
    ]

    def action_submit(self, notes='', progress=100.0):
        """Submit challenge for approval."""
        self.write({
            'status': 'submitted',
            'progress_value': progress,
            'submission_notes': notes,
        })

    def action_approve(self):
        """Approve and process rewards."""
        self.write({
            'status': 'completed',
            'completed_at': fields.Datetime.now(),
            'approved_at': fields.Datetime.now(),
            'approved_by_id': self.env.user.id,
        })
        for rec in self:
            rec._award_rewards()

    def action_reject(self, feedback=''):
        self.write({'status': 'rejected', 'reviewer_feedback': feedback})

    def _award_rewards(self):
        """Award XP and green coins to the participant."""
        self.ensure_one()
        if self.rewards_processed:
            return
        challenge = self.challenge_id
        user = self.user_id
        if user and challenge:
            user.add_xp(challenge.xp_reward, f'Challenge: {challenge.name}')
            user.add_green_coins(challenge.green_coins_reward, f'Challenge: {challenge.name}')
            if challenge.badge_id:
                self.env['ecosphere.badge.grant'].sudo()._grant_badge(
                    user, challenge.badge_id, f'Challenge: {challenge.name}'
                )
            self.write({
                'xp_awarded': challenge.xp_reward,
                'coins_awarded': challenge.green_coins_reward,
                'rewards_processed': True,
            })


class EcosphereBadge(models.Model):
    """Badge definitions for the gamification engine."""
    _name = 'ecosphere.badge'
    _description = 'ESG Achievement Badge'
    _order = 'name'

    name = fields.Char(string='Badge Name', required=True)
    code = fields.Char(string='Badge Code', index=True, copy=False)
    description = fields.Text(string='Description')
    image_url = fields.Char(string='Badge Image URL')
    icon_emoji = fields.Char(string='Emoji Icon', default='🏅')

    badge_level = fields.Selection([
        ('bronze',   '🥉 Bronze'),
        ('silver',   '🥈 Silver'),
        ('gold',     '🥇 Gold'),
        ('platinum', '💎 Platinum'),
        ('diamond',  '💠 Diamond'),
    ], string='Badge Level', default='bronze')

    category = fields.Selection([
        ('carbon',      'Carbon Champion'),
        ('energy',      'Energy Saver'),
        ('csr',         'CSR Hero'),
        ('compliance',  'Compliance Star'),
        ('innovation',  'Green Innovator'),
        ('leadership',  'ESG Leader'),
        ('streak',      'Streak Master'),
        ('training',    'Knowledge Champion'),
        ('social',      'Social Impact'),
        ('governance',  'Governance Guardian'),
        ('special',     'Special Achievement'),
    ], string='Category', required=True)

    xp_value = fields.Integer(string='XP Value', default=50)
    green_coins_value = fields.Integer(string='Green Coins Value', default=10)

    # Auto-award criteria
    auto_award = fields.Boolean(
        string='Auto-Award',
        help='If set, the system automatically grants this badge when criteria are met.',
    )
    auto_award_trigger = fields.Selection([
        ('xp_threshold',     'XP Points Threshold'),
        ('streak_days',      'Consecutive Day Streak'),
        ('challenge_count',  'Challenges Completed'),
        ('csr_count',        'CSR Activities'),
        ('policy_ack',       'Policy Acknowledgements'),
        ('carbon_reduction', 'Carbon Reduction (tonnes)'),
    ], string='Auto-Award Trigger')
    auto_award_value = fields.Float(string='Trigger Value', digits=(10, 2))

    is_hidden = fields.Boolean(string='Hidden Badge (Surprise)')
    is_active = fields.Boolean(string='Active', default=True)
    total_grants = fields.Integer(
        string='Total Times Awarded',
        compute='_compute_grant_count',
        store=False,
    )

    def _compute_grant_count(self):
        for badge in self:
            badge.total_grants = self.env['ecosphere.badge.grant'].search_count(
                [('badge_id', '=', badge.id)]
            )


class BadgeGrant(models.Model):
    """Records of badge awards to users."""
    _name = 'ecosphere.badge.grant'
    _description = 'Badge Grant Record'
    _order = 'granted_at desc'

    user_id = fields.Many2one(
        'res.users', string='User', required=True, index=True, ondelete='cascade',
    )
    badge_id = fields.Many2one(
        'ecosphere.badge', string='Badge', required=True, ondelete='cascade',
    )
    granted_at = fields.Datetime(string='Granted At', default=fields.Datetime.now)
    granted_by_id = fields.Many2one('res.users', string='Granted By')
    reason = fields.Char(string='Reason')
    is_notified = fields.Boolean(string='User Notified', default=False)

    _sql_constraints = [
        (
            'unique_user_badge',
            'UNIQUE(user_id, badge_id)',
            'A badge can only be granted once per user.',
        )
    ]

    def _grant_badge(self, user, badge, reason=''):
        """
        Grant a badge to a user if not already awarded.

        Args:
            user: res.users record
            badge: ecosphere.badge record
            reason (str): Why the badge was awarded.
        """
        existing = self.search([
            ('user_id', '=', user.id),
            ('badge_id', '=', badge.id),
        ], limit=1)
        if existing:
            return None

        grant = self.create({
            'user_id': user.id,
            'badge_id': badge.id,
            'reason': reason,
        })

        # Add bonus XP and coins
        user.add_xp(badge.xp_value, f'Badge: {badge.name}')
        user.add_green_coins(badge.green_coins_value, f'Badge: {badge.name}')

        # Send notification
        self.env['ecosphere.notification'].sudo().create({
            'user_id': user.id,
            'title': f'{badge.icon_emoji} Badge Unlocked: {badge.name}!',
            'message': f'You earned the {badge.badge_level.title()} badge: {badge.name}.',
            'notification_type': 'badge',
        })
        _logger.info(
            'EcoSphere: Badge "%s" granted to user %s', badge.name, user.name
        )
        return grant


class EcoReward(models.Model):
    """Redeemable rewards in the Green Coins marketplace."""
    _name = 'ecosphere.reward'
    _description = 'ESG Reward'
    _order = 'cost_coins asc, name'

    name = fields.Char(string='Reward Name', required=True)
    description = fields.Text(string='Description')
    image_url = fields.Char(string='Image URL')
    icon_emoji = fields.Char(string='Emoji Icon', default='🎁')

    reward_type = fields.Selection([
        ('gift_voucher',    'Gift Voucher'),
        ('extra_leave',     'Extra Leave Day'),
        ('merchandise',     'Eco Merchandise'),
        ('donation',        'Charity Donation on Behalf'),
        ('carbon_offset',   'Carbon Offset Certificate'),
        ('experience',      'Experience / Event Ticket'),
        ('recognition',     'Public Recognition'),
        ('custom',          'Custom Reward'),
    ], string='Reward Type', required=True)

    cost_coins = fields.Integer(string='Green Coins Required', required=True)
    stock_quantity = fields.Integer(string='Available Stock', default=0)
    is_unlimited = fields.Boolean(string='Unlimited Stock', default=False)
    is_active = fields.Boolean(string='Active', default=True)

    department_ids = fields.Many2many(
        'hr.department', string='Eligible Departments',
        help='Leave empty for all departments.',
    )
    min_esg_level = fields.Integer(string='Minimum ESG Level Required', default=1)
    valid_until = fields.Date(string='Valid Until')

    redemption_ids = fields.One2many(
        'ecosphere.reward.redemption', 'reward_id', string='Redemptions',
    )
    total_redeemed = fields.Integer(
        string='Total Redeemed', compute='_compute_redemptions', store=False,
    )

    def _compute_redemptions(self):
        for reward in self:
            reward.total_redeemed = self.env['ecosphere.reward.redemption'].search_count(
                [('reward_id', '=', reward.id), ('status', '=', 'fulfilled')]
            )


class RewardRedemption(models.Model):
    """Records of reward redemptions."""
    _name = 'ecosphere.reward.redemption'
    _description = 'Reward Redemption'
    _order = 'redeemed_at desc'
    _inherit = ['mail.thread']

    user_id = fields.Many2one(
        'res.users', string='User', required=True, index=True,
    )
    reward_id = fields.Many2one(
        'ecosphere.reward', string='Reward', required=True, ondelete='restrict',
    )
    redeemed_at = fields.Datetime(string='Redeemed At', default=fields.Datetime.now)
    coins_spent = fields.Integer(string='Coins Spent', required=True)

    status = fields.Selection([
        ('pending',     'Pending Fulfillment'),
        ('fulfilled',   'Fulfilled'),
        ('cancelled',   'Cancelled'),
        ('expired',     'Expired'),
    ], string='Status', default='pending', tracking=True)

    fulfillment_date = fields.Date(string='Fulfillment Date')
    fulfillment_notes = fields.Text(string='Fulfillment Notes')
    fulfilled_by_id = fields.Many2one('res.users', string='Fulfilled By')

    def action_fulfill(self):
        for rec in self:
            rec.write({
                'status': 'fulfilled',
                'fulfillment_date': fields.Date.today(),
                'fulfilled_by_id': self.env.user.id,
            })
            # Notify user
            self.env['ecosphere.notification'].sudo().create({
                'user_id': rec.user_id.id,
                'title': '🎁 Reward Fulfilled!',
                'message': f'Your redemption for "{rec.reward_id.name}" has been fulfilled!',
                'notification_type': 'reward',
            })


class Leaderboard(models.Model):
    """Pre-computed leaderboard snapshots for performance."""
    _name = 'ecosphere.leaderboard'
    _description = 'ESG Leaderboard Snapshot'
    _order = 'period_date desc, rank asc'

    period_date = fields.Date(string='Period', required=True, index=True)
    period_type = fields.Selection([
        ('weekly',  'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly',  'Yearly'),
        ('alltime', 'All Time'),
    ], string='Period Type', required=True, index=True)
    leaderboard_type = fields.Selection([
        ('individual',  'Individual'),
        ('department',  'Department'),
        ('team',        'Team'),
    ], string='Type', default='individual', index=True)

    user_id = fields.Many2one('res.users', string='User')
    department_id = fields.Many2one('hr.department', string='Department')
    rank = fields.Integer(string='Rank')
    xp_points = fields.Integer(string='XP Points')
    green_coins = fields.Integer(string='Green Coins')
    esg_level = fields.Integer(string='ESG Level')
    badges_count = fields.Integer(string='Badges')
    challenges_completed = fields.Integer(string='Challenges Completed')
    carbon_saved_kg = fields.Float(string='Carbon Saved (kg)', digits=(12, 2))
    csr_hours = fields.Float(string='CSR Hours', digits=(8, 2))
    esg_score = fields.Float(string='ESG Score', digits=(5, 2))
    change_from_prev = fields.Integer(
        string='Rank Change',
        help='Positive = improved rank, Negative = dropped.',
    )

    @api.model
    def _cron_refresh_leaderboard(self):
        """Cron job: Refresh leaderboard snapshots weekly."""
        from .analytics import EsgScore
        self._compute_individual_leaderboard()
        self._compute_department_leaderboard()
        _logger.info('EcoSphere: Leaderboard snapshots refreshed.')

    def _compute_individual_leaderboard(self):
        """Compute and store individual user rankings."""
        today = fields.Date.today()
        users = self.env['res.users'].search([
            ('esg_role', '!=', 'guest'),
            ('active', '=', True),
        ], order='xp_points desc')

        # Remove old snapshot for this period
        self.search([
            ('period_date', '=', today),
            ('period_type', '=', 'monthly'),
            ('leaderboard_type', '=', 'individual'),
        ]).unlink()

        for rank, user in enumerate(users, start=1):
            self.create({
                'period_date': today,
                'period_type': 'monthly',
                'leaderboard_type': 'individual',
                'user_id': user.id,
                'rank': rank,
                'xp_points': user.xp_points,
                'green_coins': user.green_coins,
                'esg_level': user.esg_level,
            })

    def _compute_department_leaderboard(self):
        """Compute department rankings."""
        today = fields.Date.today()
        self.search([
            ('period_date', '=', today),
            ('leaderboard_type', '=', 'department'),
        ]).unlink()

        dept_scores = self.env['ecosphere.department.score'].search([],
            order='esg_score desc')
        for rank, score in enumerate(dept_scores, start=1):
            self.create({
                'period_date': today,
                'period_type': 'monthly',
                'leaderboard_type': 'department',
                'department_id': score.department_id.id,
                'rank': rank,
                'esg_score': score.esg_score,
            })
