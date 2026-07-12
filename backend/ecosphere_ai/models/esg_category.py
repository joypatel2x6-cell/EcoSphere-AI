# -*- coding: utf-8 -*-
"""
EcoSphere AI — ESG Category & Classification Models
Provides a categorization structure for environmental, social, and governance elements.
"""

from odoo import fields, models


class ESGCategory(models.Model):
    """
    Categorization of ESG indicators and parameters.
    """
    _name = 'ecosphere.category'
    _description = 'ESG Category'
    _order = 'sequence, name'

    name = fields.Char(string='Category Name', required=True, translate=True)
    code = fields.Char(string='Code', required=True, index=True)
    sequence = fields.Integer(string='Sequence', default=10)
    type = fields.Selection([
        ('environmental', 'Environmental (E)'),
        ('social', 'Social (S)'),
        ('governance', 'Governance (G)'),
    ], string='ESG Pillar', required=True, index=True)
    description = fields.Text(string='Description')
    parent_id = fields.Many2one('ecosphere.category', string='Parent Category', ondelete='cascade')
    child_ids = fields.One2many('ecosphere.category', 'parent_id', string='Sub-categories')
    active = fields.Boolean(string='Active', default=True)

    _sql_constraints = [
        ('code_uniq', 'unique(code)', 'The Category code must be unique!'),
    ]
