from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, List, Dict
import json


@dataclass
class User:
    id: str
    name: str = ""
    email: str = ""
    interests: List[Any] = field(default_factory=list)
    preferences: Dict[str, Any] = field(default_factory=dict)
    created_at: str = ""
    last_active_at: str | None = None
    streak_count: int = 0

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "interests": self.interests,
            "preferences": self.preferences,
            "created_at": self.created_at,
            "last_active_at": self.last_active_at,
            "streak_count": self.streak_count,
        }

    @staticmethod
    def from_row(row) -> "User":
        return User(
            id=row["id"],
            name=row["name"] or "",
            email=row["email"] or "",
            interests=json.loads(row["interests_json"] or "[]"),
            preferences=json.loads(row["preferences_json"] or "{}"),
            created_at=row["created_at"] or "",
            last_active_at=row["last_active_at"],
            streak_count=int(row["streak_count"] or 0),
        )


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
