/// Unique IDs for notifications and alarm-manager callbacks.
/// Notification IDs (100-107) are used with flutter_local_notifications.
/// Alarm IDs (200-207) are used with android_alarm_manager_plus.
class NotificationIds {
  NotificationIds._();

  static const int dailyInputReminder = 100;
  static const int weeklyInputReminder = 101;
  static const int aqiMorning = 102;
  static const int aqiAfternoon = 103;
  static const int aqiEvening = 104;
  static const int pendingTasks = 105;
  static const int streakSaver = 106;
  static const int todayTaskBrief = 107;
}

class AlarmIds {
  AlarmIds._();

  static const int dailyInputReminder = 200;
  static const int weeklyInputReminder = 201;
  static const int aqiMorning = 202;
  static const int aqiAfternoon = 203;
  static const int aqiEvening = 204;
  static const int pendingTasks = 205;
  static const int streakSaver = 206;
  static const int todayTaskBrief = 207;

  static const List<int> all = [
    dailyInputReminder,
    weeklyInputReminder,
    aqiMorning,
    aqiAfternoon,
    aqiEvening,
    pendingTasks,
    streakSaver,
    todayTaskBrief,
  ];
}

/// Engaging, varied notification copy so the user does not get fatigued by
/// repetitive wording.  A random entry is picked at display time.
class NotificationMessages {
  NotificationMessages._();

  // -- Daily input reminder (8 PM) --
  static const List<String> dailyInputTitles = [
    'Log your footprint!',
    'Today\'s activity awaits',
    'Don\'t forget to log!',
  ];
  static const List<String> dailyInputBodies = [
    'Take 30 seconds to record today\'s carbon activity before bed.',
    'Your daily log keeps your streak alive - tap to log now.',
    'A quick log today = a greener tomorrow. Let\'s go!',
  ];

  // -- Weekly reflection (Sunday 6 PM) --
  static const List<String> weeklyInputTitles = [
    'Weekly reflection time',
    'Wrap up your week',
  ];
  static const List<String> weeklyInputBodies = [
    'Submit your weekly summary and see how you\'ve improved.',
    'End the week strong - complete your weekly reflection now.',
  ];

  // -- AQI check (8 AM, 1 PM, 6 PM) --
  static const List<String> aqiTitles = [
    'Check today\'s AQI',
    'Air quality update',
    'How\'s the air today?',
  ];
  static const List<String> aqiBodies = [
    'See the latest air quality at your station before heading out.',
    'Stay informed - check the AQI at your monitoring station.',
    'Know before you go! Tap to view real-time air quality.',
  ];

  // -- Pending tasks (5 PM) --
  static const List<String> pendingTasksTitles = [
    'Tasks waiting for you',
    'Earn badges today!',
  ];
  static const List<String> pendingTasksBodies = [
    'Complete your eco-tasks and move closer to your next badge.',
    'You\'ve got pending tasks - knock them out before the day ends!',
  ];

  // -- Streak saver (9 PM) --
  static const List<String> streakSaverTitles = [
    'Save your streak!',
    'Streak at risk!',
  ];
  static const List<String> streakSaverBodies = [
    'Don\'t let your streak break - log today\'s activity now!',
    'Your streak is on the line! A quick log keeps it alive.',
  ];

  // -- Today's task brief (9 AM) --
  static const List<String> todayTaskBriefTitles = [
    'Good morning!',
    'Your eco-tasks are ready',
  ];
  static const List<String> todayTaskBriefBodies = [
    'Start the day green - check your 3 eco-tasks for today.',
    'Your daily eco-challenges await. Tap to see what\'s lined up!',
  ];
}
