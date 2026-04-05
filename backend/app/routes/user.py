from flask import Blueprint, request, jsonify

user_bp = Blueprint("user", __name__)


@user_bp.get("/me")
def me():
    # TODO: resolve from Authorization header
    return jsonify(
        {
            "name": "Reader",
            "email": "you@example.com",
            "commute_minutes": 20,
            "interests": ["history", "science"],
        }
    ), 200


@user_bp.patch("/preferences")
def preferences():
    """
    Example: { "commute_minutes": 30, "interests": ["music", "philosophy"] }
    """
    data = request.get_json(silent=True) or {}
    # TODO: persist for authenticated user
    return jsonify({"saved": True, "preferences": data}), 200
