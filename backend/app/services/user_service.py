"""User row CRUD — used by profile, history, bookmarks (avoids circular imports)."""

from __future__ import annotations

import json

from app.db import get_conn
from app.models.user import User, now_iso


def ensure_user(user_id: str, defaults: dict | None = None) -> None:
    defaults = defaults or {}
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if cur.fetchone():
        conn.close()
        return
    created = now_iso()
    cur.execute(
        """
        INSERT INTO users (id, name, email, interests_json, preferences_json, created_at, last_active_at, streak_count)
        VALUES (?, ?, ?, ?, ?, ?, NULL, 0)
        """,
        (
            user_id,
            defaults.get("name", "Reader"),
            defaults.get("email", ""),
            json.dumps(defaults.get("interests", [])),
            json.dumps(defaults.get("preferences", {})),
            created,
        ),
    )
    conn.commit()
    conn.close()


def get_user(user_id: str) -> User | None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return User.from_row(row)


def update_user(user_id: str, payload: dict) -> User | None:
    ensure_user(user_id)
    conn = get_conn()
    cur = conn.cursor()
    fields = []
    values = []
    if "name" in payload:
        fields.append("name = ?")
        values.append(payload["name"])
    if "email" in payload:
        fields.append("email = ?")
        values.append(payload["email"])
    if "interests" in payload:
        fields.append("interests_json = ?")
        values.append(json.dumps(payload["interests"]))
    if "preferences" in payload:
        fields.append("preferences_json = ?")
        values.append(json.dumps(payload["preferences"]))
    if not fields:
        conn.close()
        return get_user(user_id)
    values.append(user_id)
    cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", values)
    conn.commit()
    conn.close()
    return get_user(user_id)
