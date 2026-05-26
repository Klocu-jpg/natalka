---
name: Diet Preferences
description: Per-user diet preferences (likes, dislikes, allergies, diet type, health conditions, notes) fed into AI recipe generation
type: feature
---
Table `diet_preferences` (one row per user, UNIQUE user_id). Partner in couple can SELECT (for shared meal planning) but only owner can INSERT/UPDATE/DELETE.

Widget `DietPreferences` lives in the "home" tab (mobile) and as a full-width row at bottom of desktop grid. Registered in WidgetVisibilityContext as `diet-preferences`.

Edge functions `generate-recipe` and `generate-recipe-from-url` fetch the calling user's prefs and inject a Polish "PREFERENCJE UŻYTKOWNIKA" block into the system prompt. Allergies are marked as "BEZWZGLĘDNIE pomiń". Best-effort: failures to fetch prefs don't block recipe generation.
