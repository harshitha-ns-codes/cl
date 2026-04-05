"""Bookmarks — ready to integrate with recommendations later."""

from __future__ import annotations

from datetime import datetime, timezone

from app.db import get_conn
from app.services.user_service import ensure_user


def add_bookmark(user_id: str, article: dict) -> dict:
    ensure_user(user_id)
    article_id = str(article.get("article_id") or article.get("id") or "")
    title = str(article.get("title") or "")
    url = str(article.get("url") or "")
    created = datetime.now(timezone.utc).isoformat()

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO bookmarks (user_id, article_id, title, url, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, article_id) DO UPDATE SET
            title = excluded.title,
            url = excluded.url,
            created_at = excluded.created_at
        """,
        (user_id, article_id, title, url, created),
    )
    conn.commit()
    conn.close()
    return {
        "user_id": user_id,
        "article_id": article_id,
        "title": title,
        "url": url,
        "created_at": created,
    }


def remove_bookmark(user_id: str, article_id: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?",
        (user_id, article_id),
    )
    conn.commit()
    deleted = cur.rowcount > 0
    conn.close()
    return deleted


def get_bookmarks(user_id: str) -> list[dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, user_id, article_id, title, url, created_at
        FROM bookmarks
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user_id,),
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
