# -*- coding: utf-8 -*-
"""
EcoSphere AI — Environmental Module Models
Covers: Emission Factors, Carbon Transactions, Environmental Goals,
Fleet/Purchase/Manufacturing/Expense emissions, Water, Energy, Waste.
"""

import logging
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class EmissionFactor(models.Model):
    """
    Master table of GHG emission conversion factors.
    Supports Scope 1, 2, and 3 emissions per GHG Protocol.
    """
    _name = 'ecosphere.emission.factor'
    _description = 'GHG Emission Factor'
    _order = 'category, name'
    _rec_name = 'name'

    name = fields.Char(string='Factor Name', required=True, index=True)
    code = fields.Char(string='Factor Code', index=True)
    category = fields.Selection([
        ('electricity',     'Electricity'),
        ('fuel',            'Fuel & Combustion'),
        ('fleet',           'Fleet & Transport'),
        ('waste',           'Waste'),
        ('water',           'Water'),
        ('refrigerant',     'Refrigerants'),
        ('purchase',        'Purchased Goods'),
        ('manufacturing',   'Manufacturing'),
        ('air_travel',      'Air Travel'),
        ('business_travel', 'Business Travel'),
        ('other',           'Other'),
    ], string='Category', required=True, index=True)

    scope = fields.Selection([
        ('scope1', 'Scope 1 — Direct'),
        ('scope2', 'Scope 2 — Indirect Energy'),
        ('scope3', 'Scope 3 — Value Chain'),
    ], string='GHG Scope', required=True, default='scope1')

    unit = fields.Char(string='Input Unit', required=True, help='e.g. kWh, litres, km, kg')
    factor_value = fields.Float(
        string='Factor (kg CO₂e per unit)',
        required=True,
        digits=(16, 6),
        help='CO₂ equivalent in kg per input unit.',
    )
    source = fields.Char(
        string='Data Source',
        help='e.g. EPA 2024, DEFRA 2024, IPCC AR6',
    )
    country_id = fields.Many2one('res.country', string='Country / Region')
    valid_from = fields.Date(string='Valid From')
    valid_to = fields.Date(string='Valid To')
    is_active = fields.Boolean(string='Active', default=True)
    description = fields.Text(string='Description')

    # ── Compute ────────────────────────────────────────────────────────────

    def calculate_co2(self, quantity):
        """
        Calculate CO₂ equivalent for a given quantity.

        Args:
            quantity (float): Amount in the factor's input unit.

        Returns:
            float: kg CO₂ equivalent.
        """
        self.ensure_one()
        return round(quantity * self.factor_value, 4)


class CarbonTransaction(models.Model):
    """
    Core transaction table for all carbon emission/offset events.
    Every emission from fleet, energy, purchase, expense etc.
    is recorded here for consolidated carbon accounting.
    """
    _name = 'ecosphere.carbon.transaction'
    _description = 'Carbon Transaction'
    _order = 'transaction_date desc, id desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(
        string='Transaction Reference',
        required=True,
        copy=False,
        default=lambda self: _('New'),
        readonly=True,
        states={'draft': [('readonly', False)]},
    )
    transaction_date = fields.Date(
        string='Date',
        required=True,
        default=fields.Date.today,
        index=True,
    )
    department_id = fields.Many2one(
        'hr.department',
        string='Department',
        required=True,
        index=True,
        tracking=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='Recorded By',
        default=lambda self: self.env.user,
        tracking=True,
    )
    emission_factor_id = fields.Many2one(
        'ecosphere.emission.factor',
        string='Emission Factor',
        required=True,
    )
    source_type = fields.Selection([
        ('manual',          'Manual Entry'),
        ('fleet',           'Fleet / Vehicle'),
        ('electricity',     'Electricity'),
        ('gas',             'Natural Gas'),
        ('purchase',        'Purchase Order'),
        ('expense',         'Employee Expense'),
        ('manufacturing',   'Manufacturing'),
        ('water',           'Water Consumption'),
        ('waste',           'Waste Generation'),
        ('air_travel',      'Air Travel'),
        ('offset',          'Carbon Offset'),
    ], string='Source Type', required=True, default='manual', index=True)

    quantity = fields.Float(
        string='Quantity',
        required=True,
        digits=(16, 4),
        help='Amount in the emission factor\'s input unit.',
    )
    unit = fields.Char(
        string='Unit',
        compute='_compute_unit',
        store=True,
    )
    co2_kg = fields.Float(
        string='CO₂e (kg)',
        compute='_compute_co2',
        store=True,
        digits=(16, 4),
        help='kg CO₂ equivalent — auto-calculated from quantity × factor.',
    )
    co2_tonnes = fields.Float(
        string='CO₂e (tonnes)',
        compute='_compute_co2',
        store=True,
        digits=(16, 6),
    )
    scope = fields.Selection(
        related='emission_factor_id.scope',
        store=True,
        string='GHG Scope',
    )

    # ── Source References ────────────────────────────────────────────────────
    fleet_vehicle_id = fields.Many2one('fleet.vehicle', string='Vehicle')
    purchase_order_id = fields.Many2one('purchase.order', string='Purchase Order')
    expense_id = fields.Many2one('hr.expense', string='Expense')
    account_move_id = fields.Many2one('account.move', string='Invoice')

    description = fields.Text(string='Description / Notes')
    state = fields.Selection([
        ('draft',     'Draft'),
        ('confirmed', 'Confirmed'),
        ('audited',   'Audited'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True, index=True)

    is_offset = fields.Boolean(
        string='Is Carbon Offset',
        help='Negative emissions (carbon removal or offset purchases).',
    )
    verification_status = fields.Selection([
        ('unverified', 'Unverified'),
        ('verified',   'Verified'),
        ('rejected',   'Rejected'),
    ], string='Verification', default='unverified')

    # ── Computed ─────────────────────────────────────────────────────────────

    @api.depends('emission_factor_id')
    def _compute_unit(self):
        for rec in self:
            rec.unit = rec.emission_factor_id.unit if rec.emission_factor_id else ''

    @api.depends('quantity', 'emission_factor_id', 'is_offset')
    def _compute_co2(self):
        for rec in self:
            if rec.emission_factor_id and rec.quantity:
                kg = rec.emission_factor_id.calculate_co2(rec.quantity)
                if rec.is_offset:
                    kg = -abs(kg)
                rec.co2_kg = kg
                rec.co2_tonnes = kg / 1000.0
            else:
                rec.co2_kg = 0.0
                rec.co2_tonnes = 0.0

    # ── Sequence ──────────────────────────────────────────────────────────────

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code(
                    'ecosphere.carbon.transaction'
                ) or _('New')
        return super().create(vals_list)

    # ── Actions ───────────────────────────────────────────────────────────────

    def action_confirm(self):
        """Confirm carbon transaction and update department score."""
        for rec in self:
            rec.write({'state': 'confirmed'})
            rec._update_department_carbon_score()
        return True

    def action_cancel(self):
        for rec in self:
            rec.write({'state': 'cancelled'})

    def _update_department_carbon_score(self):
        """Trigger department carbon score recalculation."""
        if self.department_id:
            self.env['ecosphere.department.score'].sudo()._recompute_carbon(
                self.department_id.id, self.transaction_date
            )

    # ── Analytics Helpers ─────────────────────────────────────────────────────

    @api.model
    def get_monthly_summary(self, year, month, department_id=None):
        """
        Returns monthly carbon summary as a dict.

        Args:
            year (int): 4-digit year.
            month (int): 1-12.
            department_id (int|None): Filter by department.

        Returns:
            dict: total_kg, total_tonnes, by_scope, by_source
        """
        domain = [
            ('state', '=', 'confirmed'),
            ('transaction_date', '>=', f'{year}-{month:02d}-01'),
            ('transaction_date', '<=', f'{year}-{month:02d}-31'),
        ]
        if department_id:
            domain.append(('department_id', '=', department_id))

        records = self.search(domain)
        result = {
            'total_kg': sum(records.mapped('co2_kg')),
            'total_tonnes': sum(records.mapped('co2_tonnes')),
            'by_scope': {},
            'by_source': {},
            'count': len(records),
        }

        for scope_key, scope_label in [
            ('scope1', 'Scope 1'), ('scope2', 'Scope 2'), ('scope3', 'Scope 3')
        ]:
            scope_recs = records.filtered(lambda r: r.scope == scope_key)
            result['by_scope'][scope_key] = {
                'label': scope_label,
                'kg': sum(scope_recs.mapped('co2_kg')),
                'count': len(scope_recs),
            }

        for src in records.mapped('source_type'):
            src_recs = records.filtered(lambda r: r.source_type == src)
            result['by_source'][src] = sum(src_recs.mapped('co2_kg'))

        return result


class EnvironmentalGoal(models.Model):
    """
    Environmental targets set at department or company level.
    Tracks progress against carbon reduction, energy, water, waste goals.
    """
    _name = 'ecosphere.environmental.goal'
    _description = 'Environmental Goal'
    _order = 'deadline_date asc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Goal Title', required=True)
    goal_type = fields.Selection([
        ('carbon_reduction',    'Carbon Reduction'),
        ('energy_consumption',  'Energy Consumption'),
        ('water_conservation',  'Water Conservation'),
        ('waste_reduction',     'Waste Reduction'),
        ('renewable_energy',    'Renewable Energy %'),
        ('fleet_electrification','Fleet Electrification %'),
        ('custom',              'Custom Goal'),
    ], string='Goal Type', required=True)

    department_id = fields.Many2one('hr.department', string='Department')
    owner_id = fields.Many2one(
        'res.users',
        string='Goal Owner',
        default=lambda self: self.env.user,
        tracking=True,
    )

    target_value = fields.Float(string='Target Value', required=True, digits=(16, 2))
    current_value = fields.Float(
        string='Current Value',
        digits=(16, 2),
        compute='_compute_current_value',
        store=True,
    )
    unit = fields.Char(string='Unit', help='e.g. tonnes CO₂, kWh, litres, %')
    baseline_value = fields.Float(string='Baseline Value', digits=(16, 2))
    baseline_year = fields.Integer(string='Baseline Year', default=2020)

    start_date = fields.Date(string='Start Date', required=True, default=fields.Date.today)
    deadline_date = fields.Date(string='Deadline', required=True, tracking=True)

    progress_pct = fields.Float(
        string='Progress (%)',
        compute='_compute_progress',
        store=True,
        digits=(5, 2),
    )
    state = fields.Selection([
        ('draft',       'Draft'),
        ('active',      'Active'),
        ('achieved',    'Achieved'),
        ('overdue',     'Overdue'),
        ('cancelled',   'Cancelled'),
    ], string='Status', default='draft', tracking=True, index=True)

    description = fields.Text(string='Goal Description')
    achievement_notes = fields.Text(string='Achievement Notes')
    priority = fields.Selection(
        [('0', 'Low'), ('1', 'Normal'), ('2', 'High'), ('3', 'Critical')],
        string='Priority',
        default='1',
    )
    sdg_alignment = fields.Many2many(
        'ecosphere.sdg',
        string='UN SDG Alignment',
        help='Sustainable Development Goals this target supports.',
    )

    # ── Computed ─────────────────────────────────────────────────────────────

    @api.depends('goal_type', 'department_id', 'start_date', 'deadline_date')
    def _compute_current_value(self):
        """Pull actual value from transactions based on goal type."""
        for goal in self:
            goal.current_value = goal._fetch_actual_value()

    def _fetch_actual_value(self):
        """Retrieve actual metric value from relevant transaction tables."""
        self.ensure_one()
        domain = [
            ('transaction_date', '>=', self.start_date),
            ('state', '=', 'confirmed'),
        ]
        if self.department_id:
            domain.append(('department_id', '=', self.department_id.id))

        if self.goal_type == 'carbon_reduction':
            txns = self.env['ecosphere.carbon.transaction'].search(domain)
            return abs(sum(txns.mapped('co2_tonnes')))

        return 0.0

    @api.depends('current_value', 'target_value', 'baseline_value')
    def _compute_progress(self):
        for goal in self:
            if goal.target_value and goal.baseline_value:
                reduction_needed = goal.baseline_value - goal.target_value
                reduction_achieved = goal.baseline_value - goal.current_value
                if reduction_needed:
                    goal.progress_pct = min(
                        100.0,
                        (reduction_achieved / reduction_needed) * 100
                    )
                else:
                    goal.progress_pct = 0.0
            elif goal.target_value:
                goal.progress_pct = min(
                    100.0,
                    (goal.current_value / goal.target_value) * 100
                )
            else:
                goal.progress_pct = 0.0


class EnergyConsumption(models.Model):
    """Track energy consumption by source and department."""
    _name = 'ecosphere.energy.consumption'
    _description = 'Energy Consumption Record'
    _order = 'period_date desc'
    _inherit = ['mail.thread']

    name = fields.Char(string='Reference', required=True)
    period_date = fields.Date(string='Period', required=True, index=True)
    department_id = fields.Many2one('hr.department', string='Department', index=True)

    energy_type = fields.Selection([
        ('electricity',     'Electricity'),
        ('natural_gas',     'Natural Gas'),
        ('diesel_generator','Diesel Generator'),
        ('solar',           'Solar PV'),
        ('wind',            'Wind'),
        ('biomass',         'Biomass'),
        ('district_heat',   'District Heat'),
        ('other',           'Other'),
    ], string='Energy Type', required=True)

    is_renewable = fields.Boolean(
        string='Renewable Source',
        compute='_compute_is_renewable',
        store=True,
    )
    quantity_kwh = fields.Float(string='Quantity (kWh)', digits=(16, 2), required=True)
    cost = fields.Monetary(string='Cost', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )
    utility_provider = fields.Char(string='Utility Provider')
    meter_id = fields.Char(string='Meter ID')
    invoice_ref = fields.Char(string='Invoice Reference')

    # Auto-generate carbon transaction on confirmation
    carbon_transaction_id = fields.Many2one(
        'ecosphere.carbon.transaction',
        string='Carbon Record',
        readonly=True,
    )

    @api.depends('energy_type')
    def _compute_is_renewable(self):
        renewable_types = {'solar', 'wind', 'biomass'}
        for rec in self:
            rec.is_renewable = rec.energy_type in renewable_types

    def action_generate_carbon_record(self):
        """Auto-generate a carbon transaction from this energy record."""
        for rec in self:
            if rec.carbon_transaction_id:
                continue
            factor = self.env['ecosphere.emission.factor'].search([
                ('category', '=', 'electricity'),
                ('is_active', '=', True),
            ], limit=1)
            if factor and not rec.is_renewable:
                txn = self.env['ecosphere.carbon.transaction'].create({
                    'department_id': rec.department_id.id,
                    'emission_factor_id': factor.id,
                    'source_type': 'electricity',
                    'quantity': rec.quantity_kwh,
                    'transaction_date': rec.period_date,
                    'description': f'Auto-generated from energy record {rec.name}',
                    'state': 'confirmed',
                })
                rec.carbon_transaction_id = txn.id


class WaterConsumption(models.Model):
    """Track water consumption for water stewardship reporting."""
    _name = 'ecosphere.water.consumption'
    _description = 'Water Consumption Record'
    _order = 'period_date desc'

    name = fields.Char(string='Reference', required=True)
    period_date = fields.Date(string='Period', required=True, index=True)
    department_id = fields.Many2one('hr.department', string='Department', index=True)

    source_type = fields.Selection([
        ('municipal',   'Municipal / Tap'),
        ('well',        'Well / Groundwater'),
        ('rainwater',   'Rainwater Harvesting'),
        ('recycled',    'Recycled Water'),
        ('river',       'River / Surface Water'),
    ], string='Water Source', required=True)

    quantity_m3 = fields.Float(string='Volume (m³)', digits=(16, 3), required=True)
    quantity_litres = fields.Float(
        string='Volume (Litres)',
        compute='_compute_litres',
        store=True,
    )
    cost = fields.Monetary(string='Cost', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )
    is_recycled = fields.Boolean(string='Recycled / Reused')
    treatment_type = fields.Char(string='Treatment Method')
    discharge_location = fields.Char(string='Discharge Location')

    @api.depends('quantity_m3')
    def _compute_litres(self):
        for rec in self:
            rec.quantity_litres = rec.quantity_m3 * 1000.0


class WasteRecord(models.Model):
    """Track waste generation, segregation, and disposal."""
    _name = 'ecosphere.waste.record'
    _description = 'Waste Record'
    _order = 'record_date desc'

    name = fields.Char(string='Reference', required=True)
    record_date = fields.Date(string='Date', required=True, index=True)
    department_id = fields.Many2one('hr.department', string='Department', index=True)

    waste_type = fields.Selection([
        ('general',     'General / Mixed'),
        ('hazardous',   'Hazardous'),
        ('electronic',  'Electronic / E-Waste'),
        ('organic',     'Organic / Food'),
        ('recyclable',  'Recyclable'),
        ('medical',     'Medical / Clinical'),
        ('construction','Construction & Demolition'),
    ], string='Waste Type', required=True)

    disposal_method = fields.Selection([
        ('landfill',    'Landfill'),
        ('incineration','Incineration'),
        ('recycling',   'Recycling'),
        ('composting',  'Composting'),
        ('reuse',       'Reuse / Donation'),
        ('treatment',   'Treatment'),
    ], string='Disposal Method', required=True)

    quantity_kg = fields.Float(string='Quantity (kg)', digits=(16, 3), required=True)
    is_diverted = fields.Boolean(
        string='Diverted from Landfill',
        compute='_compute_diverted',
        store=True,
    )
    waste_contractor = fields.Char(string='Waste Contractor')
    manifest_number = fields.Char(string='Waste Manifest #')

    @api.depends('disposal_method')
    def _compute_diverted(self):
        diverted_methods = {'recycling', 'composting', 'reuse', 'treatment'}
        for rec in self:
            rec.is_diverted = rec.disposal_method in diverted_methods


class EcosphereSDG(models.Model):
    """UN Sustainable Development Goals reference table."""
    _name = 'ecosphere.sdg'
    _description = 'UN Sustainable Development Goal'
    _order = 'number'

    number = fields.Integer(string='SDG Number', required=True)
    name = fields.Char(string='Goal Title', required=True)
    description = fields.Text(string='Description')
    icon_url = fields.Char(string='Icon URL')
    color_hex = fields.Char(string='Color (Hex)')
