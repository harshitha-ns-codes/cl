from flask import Blueprint, request, jsonify

from app.services import profile_service, streak_service, analytics_service
from app.services.history_service import add_to_history, get_user_history
from app.services.bookmark_service import add_bookmark, remove_bookmark, get_bookmarks

bp = Blueprint("routes", __name__)


@bp.route("/profile/<user_id>", methods=["GET"])
def get_profile(user_id: str):
    summary = profile_service.get_profile_summary(user_id)
    if not summary:
        return jsonify({"error": "not found"}), 404
    return jsonify(summary)


@bp.route("/profile/<user_id>", methods=["PUT"])
def put_profile(user_id: str):
    data = request.get_json(silent=True) or {}
    user = profile_service.update_user(user_id, data)
    if not user:
        return jsonify({"error": "not found"}), 404
    return jsonify(user.to_dict())


@bp.route("/history", methods=["POST"])
def post_history():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    article = {
        "article_id": data.get("article_id", ""),
        "title": data.get("title", "Article"),
    }
    time_spent = int(data.get("time_spent", 0))
    row = add_to_history(user_id, article, time_spent)
    return jsonify(row), 201


@bp.route("/history/<user_id>", methods=["GET"])
def list_history(user_id: str):
    profile_service.ensure_user(user_id)
    return jsonify(get_user_history(user_id))


@bp.route("/bookmark", methods=["POST"])
def post_bookmark():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    article = {
        "article_id": data.get("article_id", ""),
        "title": data.get("title", ""),
        "url": data.get("url", ""),
    }
    row = add_bookmark(user_id, article)
    return jsonify(row), 201


@bp.route("/bookmark/<article_id>", methods=["DELETE"])
def delete_bookmark_route(article_id: str):
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id query param required"}), 400
    ok = remove_bookmark(user_id, article_id)
    return ("", 204) if ok else (jsonify({"error": "not found"}), 404)


@bp.route("/bookmark/<user_id>", methods=["GET"])
def list_bookmarks(user_id: str):
    profile_service.ensure_user(user_id)
    return jsonify(get_bookmarks(user_id))


@bp.route("/streak/<user_id>", methods=["GET"])
def get_streak(user_id: str):
    profile_service.ensure_user(user_id)
    return jsonify(streak_service.get_user_streak(user_id))


@bp.route("/analytics/<user_id>", methods=["GET"])
def get_analytics(user_id: str):
    profile_service.ensure_user(user_id)
    return jsonify(analytics_service.get_user_analytics(user_id))


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})
