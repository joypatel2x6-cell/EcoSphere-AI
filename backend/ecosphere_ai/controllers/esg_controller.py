# -*- coding: utf-8 -*-
"""
EcoSphere AI — ESG Data & Transactions Controller
Handles all Environmental, Social, and Governance transactions/data APIs.
Supports: GET, POST, PUT, DELETE, Pagination, Sorting, Search, and Filtering.
Enforces Role-Based Access Control (RBAC).
"""

from odoo import http
from odoo.http import request
from .auth_controller import verify_jwt


class ESGController(http.Controller):

    # ── Helper Middleware / Guard ──────────────────────────────────────────
    def _authenticate_and_authorize(self, allowed_roles=None):
        """
        Extracts Bearer token and checks if user exists and has correct permissions.
        """
        auth_header = request.httprequest.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None, {"error": "Unauthorized", "status": 401}
        
        token = auth_header.split(' ')[1]
        payload = verify_jwt(token)
        if not payload:
            return None, {"error": "Invalid token or expired session", "status": 401}
            
        user_id = payload.get('sub')
        user = request.env['res.users'].sudo().browse(user_id)
        if not user.exists() or user.account_locked:
            return None, {"error": "User account locked or suspended", "status": 403}

        if allowed_roles and user.esg_role not in allowed_roles:
            return None, {"error": "Access denied: insufficient privileges", "status": 403}

        return user, None

    def _paginate_search(self, model_name, domain, order='id desc'):
        """Helper to process page/limit from params and execute search."""
        params = request.httprequest.args
        limit = int(params.get('limit', 20))
        page = int(params.get('page', 1))
        offset = (page - 1) * limit

        model = request.env[model_name].sudo()
        records = model.search(domain, limit=limit, offset=offset, order=order)
        total_count = model.search_count(domain)

        return records, total_count, page, limit

    # ── 1. ENVIRONMENTAL MODULE APIs ────────────────────────────────────────

    @http.route('/api/v1/environmental/emission-factors', type='json', auth='none', methods=['GET'], csrf=False)
    def get_emission_factors(self, **kwargs):
        """Fetch emission factors with optional category filtering."""
        user, err = self._authenticate_and_authorize()
        if err:
            return err

        params = request.httprequest.args
        category = params.get('category')
        domain = [('is_active', '=', True)]
        if category:
            domain.append(('category', '=', category))

        records, total, page, limit = self._paginate_search('ecosphere.emission.factor', domain)

        data = []
        for r in records:
            data.append({
                'id': r.id,
                'name': r.name,
                'code': r.code,
                'category': r.category,
                'scope': r.scope,
                'unit': r.unit,
                'factor_value': r.factor_value,
            })

        return {
            "status": 200,
            "data": data,
            "pagination": {"total": total, "page": page, "limit": limit}
        }

    @http.route('/api/v1/environmental/carbon-transactions', type='json', auth='none', methods=['GET', 'POST'], csrf=False)
    def carbon_transactions(self, **kwargs):
        """List or log carbon transactions."""
        user, err = self._authenticate_and_authorize()
        if err:
            return err

        if request.httprequest.method == 'GET':
            domain = []
            if user.esg_role not in ('super_admin', 'esg_manager', 'auditor'):
                # Regular user / dept manager only sees their department's data
                if user.department_id:
                    domain.append(('department_id', '=', user.department_id.id))
                else:
                    domain.append(('user_id', '=', user.id))

            records, total, page, limit = self._paginate_search('ecosphere.carbon.transaction', domain)
            data = []
            for r in records:
                data.append({
                    'id': r.id,
                    'name': r.name,
                    'transaction_date': str(r.transaction_date),
                    'department': r.department_id.name,
                    'factor': r.emission_factor_id.name,
                    'quantity': r.quantity,
                    'unit': r.unit,
                    'co2_kg': r.co2_kg,
                    'co2_tonnes': r.co2_tonnes,
                    'scope': r.scope,
                    'state': r.state,
                })
            return {
                "status": 200,
                "data": data,
                "pagination": {"total": total, "page": page, "limit": limit}
            }

        elif request.httprequest.method == 'POST':
            # Create a transaction
            body = request.get_json_data() or {}
            required = ['emission_factor_id', 'quantity', 'department_id']
            if not all(k in body for k in required):
                return {"error": "Missing required fields", "status": 400}

            txn = request.env['ecosphere.carbon.transaction'].sudo().create({
                'emission_factor_id': body['emission_factor_id'],
                'quantity': body['quantity'],
                'department_id': body['department_id'],
                'transaction_date': body.get('transaction_date'),
                'description': body.get('description'),
                'source_type': body.get('source_type', 'manual'),
                'user_id': user.id,
            })
            txn.action_confirm()

            return {
                "status": 201,
                "message": "Carbon transaction logged and confirmed.",
                "id": txn.id,
                "co2_kg": txn.co2_kg
            }

    # ── 2. SOCIAL MODULE APIs (CSR & VOLUNTEERING) ─────────────────────────

    @http.route('/api/v1/social/csr-activities', type='json', auth='none', methods=['GET', 'POST'], csrf=False)
    def csr_activities(self, **kwargs):
        """Fetch or create CSR Activities."""
        user, err = self._authenticate_and_authorize()
        if err:
            return err

        if request.httprequest.method == 'GET':
            records, total, page, limit = self._paginate_search('ecosphere.csr.activity', [])
            data = []
            for r in records:
                data.append({
                    'id': r.id,
                    'name': r.name,
                    'activity_type': r.activity_type,
                    'event_date': str(r.event_date),
                    'duration_hours': r.duration_hours,
                    'actual_participants': r.actual_participants,
                    'total_volunteer_hours': r.total_volunteer_hours,
                    'state': r.state,
                })
            return {
                "status": 200,
                "data": data,
                "pagination": {"total": total, "page": page, "limit": limit}
            }

        elif request.httprequest.method == 'POST':
            if user.esg_role not in ('super_admin', 'esg_manager', 'hr_manager'):
                return {"error": "Access denied", "status": 403}

            body = request.get_json_data() or {}
            activity = request.env['ecosphere.csr.activity'].sudo().create({
                'name': body.get('name'),
                'activity_type': body.get('activity_type'),
                'event_date': body.get('event_date'),
                'duration_hours': body.get('duration_hours'),
                'max_participants': body.get('max_participants', 50),
                'xp_reward': body.get('xp_reward', 50),
            })
            return {"status": 201, "id": activity.id, "message": "CSR activity created successfully."}

    # ── 3. GAMIFICATION MODULE APIs ─────────────────────────────────────────

    @http.route('/api/v1/gamification/leaderboard', type='json', auth='none', methods=['GET'], csrf=False)
    def get_leaderboard(self, **kwargs):
        """Fetch individual leaderboard snapshot."""
        user, err = self._authenticate_and_authorize()
        if err:
            return err

        records = request.env['ecosphere.leaderboard'].sudo().search([
            ('leaderboard_type', '=', 'individual')
        ], limit=50, order='rank asc')

        data = []
        for r in records:
            data.append({
                'rank': r.rank,
                'name': r.user_id.name,
                'xp_points': r.xp_points,
                'esg_level': r.esg_level,
            })

        return {"status": 200, "data": data}

    @http.route('/api/v1/gamification/challenges', type='json', auth='none', methods=['GET', 'POST'], csrf=False)
    def challenges(self, **kwargs):
        """List active challenges or register completion."""
        user, err = self._authenticate_and_authorize()
        if err:
            return err

        if request.httprequest.method == 'GET':
            records, total, page, limit = self._paginate_search('ecosphere.challenge', [('state', '=', 'published')])
            data = []
            for r in records:
                data.append({
                    'id': r.id,
                    'name': r.name,
                    'challenge_type': r.challenge_type,
                    'xp_reward': r.xp_reward,
                    'coins_reward': r.green_coins_reward,
                    'deadline': str(r.deadline_date),
                })
            return {"status": 200, "data": data}

        elif request.httprequest.method == 'POST':
            # Participate/Join challenge
            body = request.get_json_data() or {}
            challenge_id = body.get('challenge_id')
            if not challenge_id:
                return {"error": "Missing challenge ID", "status": 400}

            try:
                part = request.env['ecosphere.challenge.participation'].sudo().create({
                    'challenge_id': challenge_id,
                    'user_id': user.id,
                    'status': 'joined',
                })
                return {"status": 201, "message": "Successfully joined challenge", "id": part.id}
            except Exception as e:
                return {"error": str(e), "status": 400}
