from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/signup")
def signup():
    """
    Example: { "name", "email", "password" }
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "email_required"}), 400
    # TODO: hash password, persist user, issue token
    return jsonify({"message": "created", "user": {"email": email}}), 201


@auth_bp.post("/login")
def login():
    """
    Example: { "email", "password" }
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "email_required"}), 400
    # TODO: verify credentials, issue JWT or session
    return jsonify({"token": "placeholder", "user": {"email": email}}), 200


@auth_bp.post("/logout")
def logout():
    return jsonify({"message": "logged_out"}), 200
