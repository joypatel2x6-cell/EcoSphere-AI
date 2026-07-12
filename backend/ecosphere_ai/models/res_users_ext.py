# -*- coding: utf-8 -*-
"""
EcoSphere AI — Extended User Model
Adds ESG role system, 2FA, JWT tokens, OAuth, account locking,
login history, and profile fields to Odoo's res.users.
"""

import hashlib
import secrets
import logging
from datetime import datetime, timedelta

from odoo import api, fields, models, _
from odoo.exceptions import AccessDenied, ValidationError
from odoo.tools import email_normalize

_logger = logging.getLogger(__name__)

# ─── Role Constants ──────────────────────────────────────────────────────────

ESG_ROLES = [
    ('super_admin',     'Super Admin'),
    ('esg_manager',     'ESG Manager'),
    ('dept_manager',    'Department Manager'),
    ('hr_manager',      'HR Manager'),
    ('compliance',      'Compliance Officer'),
    ('employee',        'Employee'),
    ('auditor',         'Auditor'),
    ('guest',           'Guest User'),
]


class EcoSphereUser(models.Model):
    """
    Extends res.users with ESG-specific profile data,
    security features, and gamification fields.
    """
    _inherit = 'res.users'

    # ── ESG Role & Department ────────────────────────────────────────────────
    esg_role = fields.Selection(
        selection=ESG_ROLES,
        string='ESG Role',
        default='employee',
        required=True,
        index=True,
        help='Determines the user\'s access level within EcoSphere AI.',
    )
    department_id = fields.Many2one(
        comodel_name='hr.department',
        string='ESG Department',
        index=True,
        ondelete='set null',
    )
    employee_id = fields.Many2one(
        comodel_name='hr.employee',
        string='Linked Employee',
        compute='_compute_employee_id',
        store=True,
    )

    # ── Gamification Profile ─────────────────────────────────────────────────
    xp_points = fields.Integer(
        string='XP Points',
        default=0,
        help='Experience points earned through ESG activities.',
    )
    green_coins = fields.Integer(
        string='Green Coins',
        default=0,
        help='Redeemable currency for ESG rewards.',
    )
    esg_level = fields.Integer(
        string='ESG Level',
        compute='_compute_esg_level',
        store=True,
        help='Gamification level calculated from XP points.',
    )
    total_badges = fields.Integer(
        string='Total Badges',
        compute='_compute_badge_count',
        store=False,
    )
    streak_days = fields.Integer(
        string='Current Streak (days)',
        default=0,
    )
    last_activity_date = fields.Date(
        string='Last ESG Activity',
    )

    # ── Security Fields ──────────────────────────────────────────────────────
    two_factor_enabled = fields.Boolean(
        string='2FA Enabled',
        default=False,
    )
    two_factor_secret = fields.Char(
        string='2FA Secret Key',
        copy=False,
        groups='base.group_system',
    )
    failed_login_count = fields.Integer(
        string='Failed Login Attempts',
        default=0,
        copy=False,
    )
    account_locked = fields.Boolean(
        string='Account Locked',
        default=False,
        help='Locked after 5 consecutive failed login attempts.',
    )
    account_locked_until = fields.Datetime(
        string='Locked Until',
        copy=False,
    )
    last_login = fields.Datetime(
        string='Last Successful Login',
        readonly=True,
    )
    last_password_change = fields.Datetime(
        string='Last Password Change',
        default=fields.Datetime.now,
    )
    password_reset_token = fields.Char(
        string='Password Reset Token',
        copy=False,
        groups='base.group_system',
    )
    password_reset_expiry = fields.Datetime(
        string='Reset Token Expiry',
        copy=False,
        groups='base.group_system',
    )

    # ── OAuth Fields ─────────────────────────────────────────────────────────
    oauth_provider = fields.Char(
        string='OAuth Provider',
        help='google | microsoft | github',
    )
    oauth_uid = fields.Char(
        string='OAuth User ID',
        index=True,
        copy=False,
    )
    oauth_access_token = fields.Char(
        string='OAuth Access Token',
        copy=False,
        groups='base.group_system',
    )

    # ── JWT Session ──────────────────────────────────────────────────────────
    jwt_token_hash = fields.Char(
        string='Active JWT Hash',
        copy=False,
        groups='base.group_system',
        help='SHA-256 hash of the most recent JWT token for validation.',
    )
    jwt_expires_at = fields.Datetime(
        string='JWT Expiry',
        copy=False,
    )
    remember_me = fields.Boolean(
        string='Remember Me',
        default=False,
    )

    # ── Email Verification ───────────────────────────────────────────────────
    email_verified = fields.Boolean(
        string='Email Verified',
        default=False,
    )
    email_verify_token = fields.Char(
        string='Email Verification Token',
        copy=False,
        groups='base.group_system',
    )

    # ── Profile ──────────────────────────────────────────────────────────────
    job_title = fields.Char(string='Job Title')
    avatar_url = fields.Char(string='Avatar URL')
    timezone_display = fields.Char(string='Display Timezone', default='UTC')
    onboarding_completed = fields.Boolean(
        string='Onboarding Done',
        default=False,
    )

    # ── Computed Fields ──────────────────────────────────────────────────────

    @api.depends('xp_points')
    def _compute_esg_level(self):
        """
        Level thresholds:
          Level 1: 0–499 XP
          Level 2: 500–1499 XP
          Level 3: 1500–2999 XP
          Level 4: 3000–5999 XP
          Level 5: 6000+ XP
        """
        thresholds = [0, 500, 1500, 3000, 6000]
        for user in self:
            level = 1
            for idx, threshold in enumerate(thresholds):
                if user.xp_points >= threshold:
                    level = idx + 1
            user.esg_level = level

    @api.depends()
    def _compute_badge_count(self):
        """Count unlocked badges for display."""
        for user in self:
            user.total_badges = self.env['ecosphere.badge.grant'].search_count(
                [('user_id', '=', user.id)]
            )

    @api.depends('name')
    def _compute_employee_id(self):
        """Link to hr.employee if one exists with the same user."""
        for user in self:
            employee = self.env['hr.employee'].search(
                [('user_id', '=', user.id)], limit=1
            )
            user.employee_id = employee.id if employee else False

    # ── Security Business Logic ───────────────────────────────────────────────

    def action_lock_account(self, duration_minutes=30):
        """Lock account for a specified duration."""
        self.ensure_one()
        self.write({
            'account_locked': True,
            'account_locked_until': datetime.now() + timedelta(minutes=duration_minutes),
        })
        self.env['ecosphere.security.log'].sudo().create({
            'user_id': self.id,
            'event_type': 'account_locked',
            'description': f'Account locked for {duration_minutes} minutes.',
            'ip_address': self._context.get('ip_address', 'unknown'),
        })
        _logger.warning('EcoSphere: Account locked for user %s', self.login)

    def action_unlock_account(self):
        """Unlock account and reset failed counter."""
        self.ensure_one()
        self.write({
            'account_locked': False,
            'account_locked_until': False,
            'failed_login_count': 0,
        })

    def increment_failed_login(self):
        """Increment failed login count and lock if threshold exceeded."""
        self.ensure_one()
        MAX_ATTEMPTS = int(
            self.env['ir.config_parameter'].sudo().get_param(
                'ecosphere.max_login_attempts', '5'
            )
        )
        new_count = self.failed_login_count + 1
        self.sudo().write({'failed_login_count': new_count})

        if new_count >= MAX_ATTEMPTS:
            self.sudo().action_lock_account()
            raise AccessDenied(
                _('Account locked due to %d failed login attempts. '
                  'Try again in 30 minutes or reset your password.') % MAX_ATTEMPTS
            )

    def reset_failed_login(self):
        """Reset failed login counter after successful authentication."""
        self.ensure_one()
        self.sudo().write({
            'failed_login_count': 0,
            'last_login': fields.Datetime.now(),
        })

    def generate_password_reset_token(self):
        """Generate a secure password reset token (valid 1 hour)."""
        self.ensure_one()
        token = secrets.token_urlsafe(32)
        self.sudo().write({
            'password_reset_token': token,
            'password_reset_expiry': datetime.now() + timedelta(hours=1),
        })
        return token

    def generate_email_verify_token(self):
        """Generate email verification token."""
        self.ensure_one()
        token = secrets.token_urlsafe(24)
        self.sudo().write({'email_verify_token': token})
        return token

    def verify_email(self, token):
        """Verify email token and mark email as verified."""
        self.ensure_one()
        if self.email_verify_token == token:
            self.sudo().write({
                'email_verified': True,
                'email_verify_token': False,
            })
            return True
        return False

    # ── Gamification Logic ────────────────────────────────────────────────────

    def add_xp(self, points, reason='ESG Activity'):
        """
        Award XP points and trigger level-up notifications.

        Args:
            points (int): XP points to add.
            reason (str): Human-readable reason for XP award.
        """
        self.ensure_one()
        old_level = self.esg_level
        self.sudo().write({'xp_points': self.xp_points + points})
        new_level = self.esg_level

        # Level-up notification
        if new_level > old_level:
            self.env['ecosphere.notification'].sudo().create({
                'user_id': self.id,
                'title': _('🎉 Level Up!'),
                'message': _(
                    'Congratulations! You reached ESG Level %d!'
                ) % new_level,
                'notification_type': 'level_up',
                'is_read': False,
            })

        # Log XP event
        self.env['ecosphere.activity.log'].sudo().create({
            'user_id': self.id,
            'action': 'xp_awarded',
            'description': f'+{points} XP — {reason}',
            'metadata': f'{{"points": {points}, "reason": "{reason}"}}',
        })
        _logger.info('EcoSphere: Awarded %d XP to user %s (%s)', points, self.name, reason)

    def add_green_coins(self, coins, reason='ESG Reward'):
        """Award Green Coins (redeemable currency)."""
        self.ensure_one()
        self.sudo().write({'green_coins': self.green_coins + coins})
        _logger.info(
            'EcoSphere: Awarded %d Green Coins to user %s (%s)',
            coins, self.name, reason
        )

    def deduct_green_coins(self, coins):
        """Deduct Green Coins for reward redemption."""
        self.ensure_one()
        if self.green_coins < coins:
            raise ValidationError(
                _('Insufficient Green Coins. You have %d but need %d.')
                % (self.green_coins, coins)
            )
        self.sudo().write({'green_coins': self.green_coins - coins})

    def update_streak(self):
        """Update daily activity streak."""
        self.ensure_one()
        today = fields.Date.today()
        if self.last_activity_date:
            delta = (today - self.last_activity_date).days
            if delta == 1:
                # Consecutive day
                self.sudo().write({
                    'streak_days': self.streak_days + 1,
                    'last_activity_date': today,
                })
            elif delta > 1:
                # Streak broken
                self.sudo().write({'streak_days': 1, 'last_activity_date': today})
        else:
            self.sudo().write({'streak_days': 1, 'last_activity_date': today})

    # ── API Representation ────────────────────────────────────────────────────

    def to_api_dict(self):
        """Return a safe API-serializable dictionary of the user profile."""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'esg_role': self.esg_role,
            'department': self.department_id.name if self.department_id else None,
            'xp_points': self.xp_points,
            'green_coins': self.green_coins,
            'esg_level': self.esg_level,
            'streak_days': self.streak_days,
            'total_badges': self.total_badges,
            'email_verified': self.email_verified,
            'two_factor_enabled': self.two_factor_enabled,
            'avatar_url': self.avatar_url,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }

    # ── Constraints ───────────────────────────────────────────────────────────

    @api.constrains('email')
    def _check_email_unique(self):
        """Enforce unique non-empty emails across ESG users."""
        for user in self:
            if user.email:
                domain = [
                    ('email', '=', email_normalize(user.email)),
                    ('id', '!=', user.id),
                ]
                if self.search_count(domain):
                    raise ValidationError(
                        _('A user with email "%s" already exists.') % user.email
                    )


class EcoSphereLoginHistory(models.Model):
    """Stores every login attempt (success or failure) for security auditing."""
    _name = 'ecosphere.login.history'
    _description = 'EcoSphere Login History'
    _order = 'login_at desc'
    _rec_name = 'user_id'

    user_id = fields.Many2one('res.users', string='User', index=True, ondelete='cascade')
    login_at = fields.Datetime(string='Login At', default=fields.Datetime.now, index=True)
    ip_address = fields.Char(string='IP Address')
    user_agent = fields.Char(string='User Agent')
    status = fields.Selection([
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('locked', 'Locked'),
        ('2fa_pending', '2FA Pending'),
    ], string='Status', default='success', index=True)
    failure_reason = fields.Char(string='Failure Reason')
    oauth_provider = fields.Char(string='OAuth Provider')
    session_duration = fields.Integer(string='Session Duration (min)')
    location = fields.Char(string='Geo Location')
    device_type = fields.Char(string='Device Type')
