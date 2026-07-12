# -*- coding: utf-8 -*-
"""
EcoSphere AI — Audit & Activity Logging Models
Provides logging for user actions, security events, and database audits.
"""

from odoo import fields, models


class ActivityLog(models.Model):
    """
    Log of actions performed by users within the system.
    """
    _name = 'ecosphere.activity.log'
    _description = 'EcoSphere User Activity Log'
    _order = 'create_date desc'

    user_id = fields.Many2one('res.users', string='User', required=True, index=True, ondelete='cascade')
    action = fields.Char(string='Action Category', required=True, index=True)
    description = fields.Text(string='Action Description', required=True)
    metadata = fields.Text(string='Metadata / Details (JSON)')
    ip_address = fields.Char(string='IP Address')


class SecurityLog(models.Model):
    """
    Critical security logs (e.g. 2FA changes, login lockouts, permission updates).
    """
    _name = 'ecosphere.security.log'
    _description = 'EcoSphere Security Log'
    _order = 'create_date desc'

    user_id = fields.Many2one('res.users', string='User', index=True, ondelete='set null')
    event_type = fields.Selection([
        ('login_failure', 'Login Failure'),
        ('account_locked', 'Account Locked'),
        ('account_unlocked', 'Account Unlocked'),
        ('password_change', 'Password Changed'),
        ('2fa_changed', '2FA Settings Changed'),
        ('role_change', 'Role / Permissions Changed'),
    ], string='Event Type', required=True, index=True)

    description = fields.Text(string='Description', required=True)
    ip_address = fields.Char(string='IP Address')
    user_agent = fields.Char(string='User Agent')
