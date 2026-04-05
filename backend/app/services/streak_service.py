"""Daily streak using users.last_active_at and streak_count."""

from __future__ import annotations

from datetime import datetime, timezone, date

from app.db import get_conn


def _parse_date(iso: str | None) -> date | None:
    if not iso:
        return None
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt.date()
    except ValueError:
        return None


def update_user_streak(user_id: str) -> int:
    """
    Call when user activity is recorded (e.g. after history add).
    Increments at most once per calendar day transition from last_active.
    """
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT streak_count, last_active_at FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return 0

    streak = int(row["streak_count"] or 0)
    last_d = _parse_date(row["last_active_at"])
    today = datetime.now(timezone.utc).date()

    if last_d == today:
        now = datetime.now(timezone.utc).isoformat()
        cur.execute("UPDATE users SET last_active_at = ? WHERE id = ?", (now, user_id))
        conn.commit()
        conn.close()
        return streak

    if last_d is None:
        new_streak = 1
    else:
        delta = (today - last_d).days
        if delta == 1:
            new_streak = streak + 1
        elif delta == 0:
            new_streak = streak
        else:
            new_streak = 1

    now = datetime.now(timezone.utc).isoformat()
    cur.execute(
        "UPDATE users SET streak_count = ?, last_active_at = ? WHERE id = ?",
        (new_streak, now, user_id),
    )
    conn.commit()
    conn.close()
    return new_streak


def get_user_streak(user_id: str) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT streak_count, last_active_at FROM users WHERE id = ?", (user_id,)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return {"streak_count": 0, "last_active_at": None}
    return {
        "streak_count": int(row["streak_count"] or 0),
        "last_active_at": row["last_active_at"],
    }
