# -*- coding: utf-8 -*-
"""EcoSphere AI — Odoo 18 Module Root Init"""

from . import models
from . import controllers
from . import services


def post_init_hook(env):
    """
    Post-installation hook.
    Seeds initial emission factors, badges, and system parameters.
    """
    from .services.setup_service import seed_initial_data
    seed_initial_data(env)


def uninstall_hook(env):
    """Cleanup on uninstall."""
    pass
