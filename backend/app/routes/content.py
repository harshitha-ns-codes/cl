from flask import Blueprint, request, jsonify

content_bp = Blueprint("content", __name__)


@content_bp.post("/ingest")
def ingest():
    """
    Example: { "url": "https://..." } — later: fetch, extract reader HTML, queue embeddings.
    """
    data = request.get_json(silent=True) or {}
    url = data.get("url")
    if not url:
        return jsonify({"error": "url_required"}), 400
    return jsonify({"url": url, "status": "queued", "id": "placeholder-id"}), 202


@content_bp.post("/thoughts")
def capture_thought():
    """
    Example: { "body": "...", "source_url": "optional" }
    """
    data = request.get_json(silent=True) or {}
    body = data.get("body")
    if not body:
        return jsonify({"error": "body_required"}), 400
    return jsonify({"id": "thought-1", "body": body}), 201


@content_bp.get("/recommendations")
def recommendations():
    # TODO: filter by user interests + commute length
    return jsonify({"items": []}), 200
