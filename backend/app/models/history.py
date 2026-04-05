from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ReadingHistoryEntry:
    id: int | None
    user_id: str
    article_id: str
    title: str
    time_spent: int
    timestamp: str

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "article_id": self.article_id,
            "title": self.title,
            "time_spent": self.time_spent,
            "timestamp": self.timestamp,
        }
