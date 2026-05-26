---
name: Diet preferences & meal planning hub
description: Diet hub with multi-person meal planning that sums per-member TDEE
type: feature
---
# Dieta i plan jedzenia (wieloosobowy)

- Widget DietPreferences = centralny hub: ustawienia (dialog), generowanie planu AI, podgląd 7 dni × 3 posiłki, import do "Planu obiadów" + automatyczne dodanie składników do listy zakupów.
- Liczba osób (servings 1–4) w lokalnym storage `diet-plan-servings-v1`. Domyślnie = liczba członków pary.
- Edge `generate-meal-plan` i `reroll-meal` pobierają `diet_preferences` WSZYSTKICH członków pary (via `get_couple_member_ids` RPC), liczą TDEE per osoba (Mifflin–St Jeor), SUMUJĄ kcal i każą AI wygenerować posiłek dla całego gospodarstwa:
  - `calories`, `protein_g`, `carbs_g`, `fats_g` = ŁĄCZNE wartości na posiłek (suma porcji wszystkich osób).
  - `ingredients.amount` = łączna ilość dla N osób.
  - Alergie i nielubiane składniki są UNIĄ wszystkich osób (bezwzględnie pomijane).
- UI pokazuje łączne dzienne kcal + rozbicie per osoba gdy servings > 1. Ostrzega gdy brakuje danych członka pary.
- Generowanie zablokowane gdy servings > 1 a któraś osoba nie ma kompletu danych (płeć/wzrost/waga/rok ur.).
- Draft planu w localStorage `diet-plan-draft-v1`. Import zastępuje istniejące meals (delete all by user_id, then insert 21).
