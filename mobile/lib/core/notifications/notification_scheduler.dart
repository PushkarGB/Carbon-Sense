import 'package:android_alarm_manager_plus/android_alarm_manager_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'notification_constants.dart';
import 'notification_service.dart';

// ═══════════════════════════════════════════════════════════════════════════
// IST helpers (UTC+05:30) — duplicated from activity/ist_date.dart so
// top-level isolate callbacks don't depend on UI-layer imports.
// ═══════════════════════════════════════════════════════════════════════════

DateTime _nowIst() => DateTime.now().toUtc().add(const Duration(hours: 5, minutes: 30));

String _todayIstYmd() {
  final ist = _nowIst();
  final y = ist.year.toString().padLeft(4, '0');
  final m = ist.month.toString().padLeft(2, '0');
  final d = ist.day.toString().padLeft(2, '0');
  return '$y-$m-$d';
}

// ═══════════════════════════════════════════════════════════════════════════
// TOP-LEVEL ALARM CALLBACKS
// These run in their own isolate — must be top-level or static and
// annotated with @pragma('vm:entry-point').
// ═══════════════════════════════════════════════════════════════════════════

/// Daily input reminder — 8 PM IST.
/// Suppressed if the user already logged today.
@pragma('vm:entry-point')
Future<void> dailyInputReminderCallback() async {
  final prefs = await SharedPreferences.getInstance();
  final lastLog = prefs.getString('logs.daily.last_ymd') ?? '';
  if (lastLog == _todayIstYmd()) return; // already logged

  final enabled = prefs.getBool('notifications.enabled') ?? true;
  if (!enabled) return;

  await NotificationService.instance.init();
  await NotificationService.instance.show(
    id: NotificationIds.dailyInputReminder,
    title: NotificationService.pick(NotificationMessages.dailyInputTitles),
    body: NotificationService.pick(NotificationMessages.dailyInputBodies),
    payload: '/input/daily',
  );
}

/// Weekly reflection reminder — fires daily but only shows on Sundays
/// if the user hasn't submitted a weekly log in the past 6 days.
@pragma('vm:entry-point')
Future<void> weeklyInputReminderCallback() async {
  final ist = _nowIst();
  if (ist.weekday != DateTime.sunday) return; // only on Sundays

  final prefs = await SharedPreferences.getInstance();
  final lastWeekly = prefs.getString('logs.weekly.last_ymd') ?? '1970-01-01';
  final lastDate = DateTime.tryParse(lastWeekly);
  if (lastDate != null) {
    final diff = ist.difference(lastDate).inDays;
    if (diff < 6) return; // already submitted this week
  }

  final enabled = prefs.getBool('notifications.enabled') ?? true;
  if (!enabled) return;

  await NotificationService.instance.init();
  await NotificationService.instance.show(
    id: NotificationIds.weeklyInputReminder,
    title: NotificationService.pick(NotificationMessages.weeklyInputTitles),
    body: NotificationService.pick(NotificationMessages.weeklyInputBodies),
    payload: '/input/weekly',
  );
}

/// AQI check-in — fires at 8 AM, 1 PM, and 6 PM IST.
/// Each time slot uses a different notification ID so they don't overwrite.
@pragma('vm:entry-point')
Future<void> aqiMorningCallback() async {
  await _showAqi(NotificationIds.aqiMorning);
}

@pragma('vm:entry-point')
Future<void> aqiAfternoonCallback() async {
  await _showAqi(NotificationIds.aqiAfternoon);
}

@pragma('vm:entry-point')
Future<void> aqiEveningCallback() async {
  await _showAqi(NotificationIds.aqiEvening);
}

Future<void> _showAqi(int id) async {
  final prefs = await SharedPreferences.getInstance();
  final enabled = prefs.getBool('notifications.enabled') ?? true;
  if (!enabled) return;

  await NotificationService.instance.init();
  await NotificationService.instance.show(
    id: id,
    title: NotificationService.pick(NotificationMessages.aqiTitles),
    body: NotificationService.pick(NotificationMessages.aqiBodies),
    payload: '/shell/dashboard',
  );
}

/// Pending tasks nudge — 5 PM IST.
@pragma('vm:entry-point')
Future<void> pendingTasksCallback() async {
  final prefs = await SharedPreferences.getInstance();
  final enabled = prefs.getBool('notifications.enabled') ?? true;
  if (!enabled) return;

  await NotificationService.instance.init();
  await NotificationService.instance.show(
    id: NotificationIds.pendingTasks,
    title: NotificationService.pick(NotificationMessages.pendingTasksTitles),
    body: NotificationService.pick(NotificationMessages.pendingTasksBodies),
    payload: '/tasks/today',
  );
}

/// Streak saver — 9 PM IST.
/// Only fires if the user hasn't logged today AND has an active streak.
@pragma('vm:entry-point')
Future<void> streakSaverCallback() async {
  final prefs = await SharedPreferences.getInstance();
  final lastLog = prefs.getString('logs.daily.last_ymd') ?? '';
  if (lastLog == _todayIstYmd()) return; // already safe

  final streakValue = prefs.getInt('streak.popup.value') ?? 0;
  if (streakValue <= 0) return; // no streak to save

  final enabled = prefs.getBool('notifications.enabled') ?? true;
  if (!enabled) return;

  await NotificationService.instance.init();
  await NotificationService.instance.show(
    id: NotificationIds.streakSaver,
    title: NotificationService.pick(NotificationMessages.streakSaverTitles),
    body: NotificationService.pick(NotificationMessages.streakSaverBodies),
    payload: '/input/daily',
  );
}

/// Today's task brief — 9 AM IST.
@pragma('vm:entry-point')
Future<void> todayTaskBriefCallback() async {
  final prefs = await SharedPreferences.getInstance();
  final enabled = prefs.getBool('notifications.enabled') ?? true;
  if (!enabled) return;

  await NotificationService.instance.init();
  await NotificationService.instance.show(
    id: NotificationIds.todayTaskBrief,
    title: NotificationService.pick(NotificationMessages.todayTaskBriefTitles),
    body: NotificationService.pick(NotificationMessages.todayTaskBriefBodies),
    payload: '/tasks/today',
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULING
// ═══════════════════════════════════════════════════════════════════════════

/// Calculates the next occurrence of a given IST hour:minute.
/// Returns a [DateTime] in **UTC** (required by alarm_manager).
DateTime _nextIstOccurrence(int hour, int minute) {
  final now = _nowIst();
  var target = DateTime.utc(now.year, now.month, now.day, hour, minute);
  // target is in "IST-shaped UTC" — subtract offset to get true UTC.
  target = target.subtract(const Duration(hours: 5, minutes: 30));
  if (target.isBefore(DateTime.now().toUtc())) {
    target = target.add(const Duration(days: 1));
  }
  return target;
}

/// Schedule all recurring notification alarms.
/// Safe to call multiple times — each call replaces existing alarms.
Future<void> scheduleAllNotifications() async {
  const oneDay = Duration(days: 1);

  // 1. Daily input reminder — 8:00 PM IST
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.dailyInputReminder,
    dailyInputReminderCallback,
    startAt: _nextIstOccurrence(20, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );

  // 2. Weekly input reminder — 6:00 PM IST (callback self-gates to Sundays)
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.weeklyInputReminder,
    weeklyInputReminderCallback,
    startAt: _nextIstOccurrence(18, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );

  // 3a. AQI morning — 8:00 AM IST
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.aqiMorning,
    aqiMorningCallback,
    startAt: _nextIstOccurrence(8, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );

  // 3b. AQI afternoon — 1:00 PM IST
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.aqiAfternoon,
    aqiAfternoonCallback,
    startAt: _nextIstOccurrence(13, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );

  // 3c. AQI evening — 6:00 PM IST
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.aqiEvening,
    aqiEveningCallback,
    startAt: _nextIstOccurrence(18, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );

  // 4. Pending tasks — 5:00 PM IST
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.pendingTasks,
    pendingTasksCallback,
    startAt: _nextIstOccurrence(17, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );

  // 5. Streak saver — 9:00 PM IST
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.streakSaver,
    streakSaverCallback,
    startAt: _nextIstOccurrence(21, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );

  // 6. Today's task brief — 9:00 AM IST
  await AndroidAlarmManager.periodic(
    oneDay,
    AlarmIds.todayTaskBrief,
    todayTaskBriefCallback,
    startAt: _nextIstOccurrence(9, 0),
    exact: true,
    wakeup: true,
    rescheduleOnReboot: true,
  );
}

/// Cancel every scheduled alarm.  Called on logout or when the user
/// disables notifications in settings.
Future<void> cancelAllNotifications() async {
  for (final id in AlarmIds.all) {
    await AndroidAlarmManager.cancel(id);
  }
}
