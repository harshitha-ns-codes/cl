from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Bookmark:
    id: int | None
    user_id: str
    article_id: str
    title: str
    url: str
    created_at: str

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "article_id": self.article_id,
            "title": self.title,
            "url": self.url,
            "created_at": self.created_at,
        }
