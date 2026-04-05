"""Combined profile summary for API."""

from __future__ import annotations

from app.services import user_service, streak_service, analytics_service


def ensure_user(user_id: str, defaults: dict | None = None) -> None:
    user_service.ensure_user(user_id, defaults)


def get_user(user_id: str):
    return user_service.get_user(user_id)


def update_user(user_id: str, payload: dict):
    return user_service.update_user(user_id, payload)


def get_profile_summary(user_id: str) -> dict:
    user_service.ensure_user(user_id)
    user = user_service.get_user(user_id)
    if not user:
        return {}

    from app.services.bookmark_service import get_bookmarks

    streak = streak_service.get_user_streak(user_id)
    bookmarks = get_bookmarks(user_id)
    analytics = analytics_service.get_user_analytics(user_id)

    return {
        "user": user.to_dict(),
        "interests": user.interests,
        "streak": streak,
        "bookmarks_count": len(bookmarks),
        "analytics": analytics,
    }
