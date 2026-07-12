# -*- coding: utf-8 -*-
"""
EcoSphere AI — Setup Service
Seeds default data such as initial emission factors and badges when the module is installed.
"""

import logging

_logger = logging.getLogger(__name__)


def seed_initial_data(env):
    """Seed default records for Hackathon demonstration."""
    _logger.info("EcoSphere: Seeding default data...")

    # ── 1. Default Emission Factors ──────────────────────────────────────────
    factors_data = [
        {
            'name': 'Grid Electricity (United States)',
            'code': 'GRID-US',
            'category': 'electricity',
            'scope': 'scope2',
            'unit': 'kWh',
            'factor_value': 0.385,  # kg CO2e per kWh
            'source': 'EPA 2024',
        },
        {
            'name': 'Natural Gas Combustion',
            'code': 'GAS-COMB',
            'category': 'fuel',
            'scope': 'scope1',
            'unit': 'm3',
            'factor_value': 2.021,  # kg CO2e per m3
            'source': 'EPA 2024',
        },
        {
            'name': 'Standard Diesel Vehicle',
            'code': 'FLEET-DSL',
            'category': 'fleet',
            'scope': 'scope1',
            'unit': 'litres',
            'factor_value': 2.68,   # kg CO2e per litre
            'source': 'DEFRA 2024',
        },
        {
            'name': 'Short-Haul Air Flight',
            'code': 'AIR-SH',
            'category': 'air_travel',
            'scope': 'scope3',
            'unit': 'km',
            'factor_value': 0.158,  # kg CO2e per passenger km
            'source': 'DEFRA 2024',
        }
    ]

    factor_model = env['ecosphere.emission.factor'].sudo()
    for factor in factors_data:
        existing = factor_model.search([('code', '=', factor['code'])], limit=1)
        if not existing:
            factor_model.create(factor)

    # ── 2. Default Badges ───────────────────────────────────────────────────
    badges_data = [
        {
            'name': 'Carbon Crusader',
            'code': 'CARB-CRUS',
            'description': 'Awarded for logged carbon offsets or reductions exceeding 500kg CO2e.',
            'category': 'carbon',
            'badge_level': 'silver',
            'xp_value': 150,
            'green_coins_value': 30,
            'icon_emoji': '🌱',
        },
        {
            'name': 'Ethics Champion',
            'code': 'ETH-CHAMP',
            'description': 'Acknowledge all core corporate governance policies.',
            'category': 'compliance',
            'badge_level': 'bronze',
            'xp_value': 100,
            'green_coins_value': 20,
            'icon_emoji': '⚖️',
        },
        {
            'name': 'Community Guardian',
            'code': 'COMM-GUARD',
            'description': 'Participate in 3 or more corporate social volunteer activities.',
            'category': 'csr',
            'badge_level': 'gold',
            'xp_value': 250,
            'green_coins_value': 50,
            'icon_emoji': '🤝',
        }
    ]

    badge_model = env['ecosphere.badge'].sudo()
    for badge in badges_data:
        existing = badge_model.search([('code', '=', badge['code'])], limit=1)
        if not existing:
            badge_model.create(badge)

    _logger.info("EcoSphere: Initial data seeded successfully.")
