/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";

export class EcoSphereDashboard extends Component {
    static template = "ecosphere_ai.EcoSphereDashboard";
}

registry.category("actions").add("ecosphere_dashboard_action", EcoSphereDashboard);
