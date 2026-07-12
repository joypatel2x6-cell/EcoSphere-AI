# -*- coding: utf-8 -*-
"""
EcoSphere AI — Analytics & ESG Score Calculation Models
Tracks department rankings, overall company scores, and carbon trends.
"""

from odoo import api, fields, models


class DepartmentScore(models.Model):
    """
    Department-level ESG scores, rankings, and trends.
    """
    _name = 'ecosphere.department.score'
    _description = 'Department ESG Score'
    _order = 'period_date desc, esg_score desc'

    department_id = fields.Many2one('hr.department', string='Department', required=True, index=True)
    period_date = fields.Date(string='Period Date', required=True, default=fields.Date.today, index=True)

    esg_score = fields.Float(string='ESG Score', digits=(5, 2), default=0.0)
    environmental_score = fields.Float(string='Environmental Score', digits=(5, 2), default=0.0)
    social_score = fields.Float(string='Social Score', digits=(5, 2), default=0.0)
    governance_score = fields.Float(string='Governance Score', digits=(5, 2), default=0.0)

    carbon_emission_kg = fields.Float(string='Total Carbon Emissions (kg)', digits=(16, 2), default=0.0)
    volunteer_hours = fields.Float(string='Volunteer Hours Contributed', digits=(10, 2), default=0.0)
    policy_ack_rate = fields.Float(string='Policy Acknowledgement Rate (%)', digits=(5, 2), default=0.0)
    active_challenges_count = fields.Integer(string='Completed Challenges Count', default=0)

    @api.model
    def _recompute_carbon(self, department_id, date_val):
        """
        Recalculates environmental and carbon metrics for a department score record.
        Normally called after a carbon transaction is verified or modified.
        """
        domain = [
            ('department_id', '=', department_id),
            ('transaction_date', '=', date_val),
            ('state', '=', 'confirmed')
        ]
        txns = self.env['ecosphere.carbon.transaction'].search(domain)
        total_co2 = sum(txns.mapped('co2_kg'))

        # Find or create score record
        score_rec = self.search([
            ('department_id', '=', department_id),
            ('period_date', '=', date_val)
        ], limit=1)
        if not score_rec:
            score_rec = self.create({
                'department_id': department_id,
                'period_date': date_val,
            })

        score_rec.write({
            'carbon_emission_kg': total_co2,
            'environmental_score': max(0.0, min(100.0, 100.0 - (total_co2 / 1000.0)))  # example logic
        })
        score_rec._recompute_total_esg()

    def _recompute_total_esg(self):
        self.ensure_one()
        # Calculate overall score as weighted average
        self.esg_score = (self.environmental_score * 0.4) + (self.social_score * 0.3) + (self.governance_score * 0.3)
