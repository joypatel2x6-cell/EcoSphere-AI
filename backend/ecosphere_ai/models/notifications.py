# -*- coding: utf-8 -*-
"""
EcoSphere AI — Notifications Model
Manages in-app, badge unlock, challenge, and compliance notification logs.
"""

from odoo import fields, models


class ESGNotification(models.Model):
    """
    User Notifications for system alerts, gamification, and carbon limits.
    """
    _name = 'ecosphere.notification'
    _description = 'EcoSphere Notification'
    _order = 'create_date desc'

    user_id = fields.Many2one('res.users', string='Recipient', required=True, index=True, ondelete='cascade')
    title = fields.Char(string='Title', required=True)
    message = fields.Text(string='Message', required=True)
    notification_type = fields.Selection([
        ('general', 'General'),
        ('badge', 'Badge Unlocked'),
        ('challenge', 'Challenge Update'),
        ('policy', 'Policy Reminder'),
        ('compliance', 'Compliance Alert'),
        ('carbon_limit', 'Carbon Limit Warning'),
        ('reward', 'Reward Redemption'),
        ('level_up', 'Level Up!'),
    ], string='Notification Type', default='general', required=True, index=True)

    is_read = fields.Boolean(string='Read', default=False, index=True)
    reference_model = fields.Char(string='Related Model')
    reference_id = fields.Integer(string='Related ID')
