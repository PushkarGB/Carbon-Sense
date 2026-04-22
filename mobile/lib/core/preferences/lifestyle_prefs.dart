import 'package:shared_preferences/shared_preferences.dart';

class LifestylePrefs {
  static const _kWasteBagsPerMonth = 'lifestyle.waste.bags_per_month';
  static const _kWasteLastUpdatedYyyyMm = 'lifestyle.waste.last_updated_yyyy_mm';

  static const _kElectricityUnitsPerMonth = 'lifestyle.electricity.units_per_month';
  static const _kElectricityLastUpdatedYyyyMm = 'lifestyle.electricity.last_updated_yyyy_mm';

  static const _kLastDailyLogYmd = 'logs.daily.last_ymd';
  static const _kLastWeeklyLogYmd = 'logs.weekly.last_ymd';

  static const _kStreakPopupShownYmd = 'streak.popup.shown_ymd';
  static const _kStreakPopupPendingYmd = 'streak.popup.pending_ymd';
  static const _kStreakPopupValue = 'streak.popup.value';
  static const _kStreakPopupLost = 'streak.popup.lost';
  static const _kStreakPopupPreviousValue = 'streak.popup.previous_value';
  static const _kBadgesSeenCount = 'badges.seen_count';
  static const _kNotificationsEnabled = 'notifications.enabled';

  Future<int?> readWasteBagsPerMonth() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kWasteBagsPerMonth);
  }

  Future<void> writeWasteBagsPerMonth(int bagsPerMonth, {required String updatedYyyyMm}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kWasteBagsPerMonth, bagsPerMonth);
    await prefs.setString(_kWasteLastUpdatedYyyyMm, updatedYyyyMm);
  }

  Future<String?> readWasteLastUpdatedYyyyMm() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kWasteLastUpdatedYyyyMm);
  }

  Future<int?> readElectricityUnitsPerMonth() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kElectricityUnitsPerMonth);
  }

  Future<void> writeElectricityUnitsPerMonth(int unitsPerMonth, {required String updatedYyyyMm}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kElectricityUnitsPerMonth, unitsPerMonth);
    await prefs.setString(_kElectricityLastUpdatedYyyyMm, updatedYyyyMm);
  }

  Future<String?> readElectricityLastUpdatedYyyyMm() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kElectricityLastUpdatedYyyyMm);
  }

  Future<String?> readLastDailyLogYmd() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kLastDailyLogYmd);
  }

  Future<void> writeLastDailyLogYmd(String ymd) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLastDailyLogYmd, ymd);
  }

  Future<String?> readLastWeeklyLogYmd() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kLastWeeklyLogYmd);
  }

  Future<void> writeLastWeeklyLogYmd(String ymd) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLastWeeklyLogYmd, ymd);
  }

  Future<String?> readStreakPopupShownYmd() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kStreakPopupShownYmd);
  }

  Future<void> writeStreakPopupShownYmd(String ymd) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kStreakPopupShownYmd, ymd);
  }

  Future<String?> readStreakPopupPendingYmd() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kStreakPopupPendingYmd);
  }

  Future<void> writeStreakPopupPendingYmd(String ymd) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kStreakPopupPendingYmd, ymd);
  }

  Future<int?> readStreakPopupValue() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kStreakPopupValue);
  }

  Future<void> writeStreakPopupValue(int value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kStreakPopupValue, value);
  }

  Future<bool> readStreakPopupLost() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_kStreakPopupLost) ?? false;
  }

  Future<void> writeStreakPopupLost(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kStreakPopupLost, value);
  }

  Future<int?> readStreakPopupPreviousValue() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kStreakPopupPreviousValue);
  }

  Future<void> writeStreakPopupPreviousValue(int value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kStreakPopupPreviousValue, value);
  }

  Future<int?> readBadgesSeenCount() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kBadgesSeenCount);
  }

  Future<void> writeBadgesSeenCount(int value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kBadgesSeenCount, value);
  }

  Future<bool> readNotificationsEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_kNotificationsEnabled) ?? true;
  }

  Future<void> writeNotificationsEnabled(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kNotificationsEnabled, value);
  }

  /// Clears ALL per-user session data from SharedPreferences.
  /// Must be called on both logout AND successful login/register to prevent
  /// stale state from a previous user bleeding into the new session.
  Future<void> clearUserSession() async {
    final prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.remove(_kLastDailyLogYmd),
      prefs.remove(_kLastWeeklyLogYmd),
      prefs.remove(_kStreakPopupShownYmd),
      prefs.remove(_kStreakPopupPendingYmd),
      prefs.remove(_kStreakPopupValue),
      prefs.remove(_kStreakPopupLost),
      prefs.remove(_kStreakPopupPreviousValue),
      prefs.remove(_kBadgesSeenCount),
      // Note: lifestyle baseline keys (waste, electricity) are intentionally
      // NOT cleared on logout — they are device-level onboarding defaults
      // that may reasonably carry over if the same person logs back in.
    ]);
  }
}

