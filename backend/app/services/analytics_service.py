"""Aggregates from reading_history (time tracking)."""

from __future__ import annotations

from app.db import get_conn


def get_user_analytics(user_id: str) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT
            COALESCE(SUM(time_spent), 0) AS total_time_spent,
            COUNT(*) AS articles_read
        FROM reading_history
        WHERE user_id = ?
        """,
        (user_id,),
    )
    row = cur.fetchone()
    conn.close()

    total = int(row["total_time_spent"] or 0)
    count = int(row["articles_read"] or 0)
    avg = round(total / count) if count else 0

    return {
        "total_time_spent": total,
        "articles_read": count,
        "avg_time_per_article": avg,
    }
