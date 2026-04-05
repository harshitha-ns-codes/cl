"""Reading history — triggers streak update (integration)."""

from __future__ import annotations

from datetime import datetime, timezone

from app.db import get_conn
from app.services import streak_service
from app.services.user_service import ensure_user


def add_to_history(user_id: str, article: dict, time_spent: int) -> dict:
    ensure_user(user_id)
    article_id = str(article.get("article_id") or article.get("id") or "")
    title = str(article.get("title") or "Article")
    ts = datetime.now(timezone.utc).isoformat()

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO reading_history (user_id, article_id, title, time_spent, timestamp)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user_id, article_id, title, int(time_spent), ts),
    )
    conn.commit()
    hid = cur.lastrowid
    conn.close()

    streak_service.update_user_streak(user_id)

    return {
        "id": hid,
        "user_id": user_id,
        "article_id": article_id,
        "title": title,
        "time_spent": int(time_spent),
        "timestamp": ts,
    }


def get_user_history(user_id: str) -> list[dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, user_id, article_id, title, time_spent, timestamp
        FROM reading_history
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 200
        """,
        (user_id,),
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
