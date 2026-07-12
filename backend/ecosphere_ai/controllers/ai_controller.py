# -*- coding: utf-8 -*-
"""
EcoSphere AI — Artificial Intelligence Integration Controller
Provides endpoints for:
- AI Chatbot (natural language ESG queries)
- Carbon Emission Prediction
- ESG Score Predictions & Sustainability Recommendations
- Document Summarization & Smart Search Assistant
"""

import json
import logging
from odoo import http
from odoo.http import request
from .auth_controller import verify_jwt

_logger = logging.getLogger(__name__)


class AIController(http.Controller):

    def _authenticate(self):
        auth_header = request.httprequest.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None, {"error": "Unauthorized", "status": 401}
        token = auth_header.split(' ')[1]
        payload = verify_jwt(token)
        if not payload:
            return None, {"error": "Invalid token", "status": 401}
        user = request.env['res.users'].sudo().browse(payload.get('sub'))
        if not user.exists() or user.account_locked:
            return None, {"error": "Account suspended", "status": 403}
        return user, None

    # ── AI Chatbot API ───────────────────────────────────────────────────────
    @http.route('/api/v1/ai/chat', type='json', auth='none', methods=['POST'], csrf=False)
    def ai_chat(self, **kwargs):
        """
        AI chat assistant for natural language queries.
        Supports session management & historical conversation retrieval.
        """
        user, err = self._authenticate()
        if err:
            return err

        body = request.get_json_data() or {}
        prompt = body.get('prompt')
        session_token = body.get('session_token')

        if not prompt:
            return {"error": "Prompt is required", "status": 400}

        # Retrieve or create session
        session_model = request.env['ecosphere.ai.session'].sudo()
        session = False
        if session_token:
            session = session_model.search([('session_token', '=', session_token), ('user_id', '=', user.id)], limit=1)
        if not session:
            import secrets
            session = session_model.create({
                'user_id': user.id,
                'session_token': secrets.token_hex(16),
                'title': prompt[:30] + ('...' if len(prompt) > 30 else '')
            })

        # Save user message
        request.env['ecosphere.ai.message'].sudo().create({
            'session_id': session.id,
            'role': 'user',
            'content': prompt,
        })

        # Mock AI response logic for Hackathon / offline fallback
        # In production, this calls OpenAI or Gemini APIs using settings from ecosphere.ai.config
        ai_response_text = self._generate_ai_response_mock(prompt, user)

        # Save assistant message
        ai_msg = request.env['ecosphere.ai.message'].sudo().create({
            'session_id': session.id,
            'role': 'assistant',
            'content': ai_response_text,
        })

        return {
            "status": 200,
            "session_token": session.session_token,
            "response": ai_response_text,
            "message_id": ai_msg.id
        }

    def _generate_ai_response_mock(self, prompt, user):
        """Generates smart responsive templates based on prompt keywords."""
        prompt_lower = prompt.lower()
        if 'carbon' in prompt_lower or 'emission' in prompt_lower:
            return (
                "Based on recent telemetry, EcoSphere AI projects Scope 1 emissions to decline "
                "by 12.4% over Q3 due to the new fleet electrification scheme. However, "
                "Scope 3 value chain emissions remain 4.2% above baseline targets."
            )
        elif 'challenge' in prompt_lower or 'score' in prompt_lower:
            return (
                f"Hello {user.name}! Your current ESG Level is {user.esg_level} with {user.xp_points} XP. "
                "To optimize your impact, join the current 'Zero Waste July' weekly challenge."
            )
        elif 'policy' in prompt_lower or 'compliance' in prompt_lower:
            return (
                "Governance Assessment: The Supplier Code of Conduct has achieved an 84% "
                "acknowledgement rate. No regulatory compliance alerts are currently pending."
            )
        return (
            "EcoSphere AI is ready. You can query me on carbon calculation models, ESG metrics, "
            "department rankings, or policies. Let me know how I can assist with your sustainability targets."
        )

    # ── AI Carbon Prediction API ─────────────────────────────────────────────
    @http.route('/api/v1/ai/predict-carbon', type='json', auth='none', methods=['POST'], csrf=False)
    def predict_carbon(self, **kwargs):
        """Predicts department carbon emission footprint using simple simulation model."""
        user, err = self._authenticate()
        if err:
            return err

        body = request.get_json_data() or {}
        dept_id = body.get('department_id')
        if not dept_id:
            return {"error": "Missing department ID", "status": 400}

        # Create simulated prediction entry
        pred = request.env['ecosphere.carbon.prediction'].sudo().create({
            'name': 'AI Forecast - Scope 1 & 2',
            'department_id': dept_id,
            'predicted_co2_kg': 4200.50,
            'confidence_pct': 92.4,
            'recommendation': 'Reduce peak energy usage in office zones 2 & 4. Transition logistics partner to EV carriers.',
        })

        return {
            "status": 200,
            "prediction": {
                "id": pred.id,
                "predicted_co2_kg": pred.predicted_co2_kg,
                "confidence": pred.confidence_pct,
                "recommendation": pred.recommendation,
            }
        }
