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
}

