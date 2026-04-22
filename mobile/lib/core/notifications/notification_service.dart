import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'notification_constants.dart';

/// Global navigator key used to navigate when a notification is tapped.
/// Assigned in [CarbonSenseApp] and consumed here.
final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

/// Singleton wrapper around [FlutterLocalNotificationsPlugin].
///
/// Responsibilities:
/// - One-time plugin initialisation (Android channel creation).
/// - Showing a local notification with a [payload] (= route path).
/// - Handling notification taps → navigating via [rootNavigatorKey].
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static const _channelId = 'carbonsense_reminders';
  static const _channelName = 'CarbonSense Reminders';
  static const _channelDescription =
      'Daily reminders for activity logging, AQI, streaks and tasks';

  bool _initialised = false;

  /// Must be called once in [main] before any notification is shown.
  Future<void> init() async {
    if (_initialised) return;

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const initSettings = InitializationSettings(android: androidSettings);

    await _plugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onTap,
    );

    _initialised = true;
  }

  /// Show a local notification.
  ///
  /// [id] should be one of [NotificationIds] constants so we can update /
  /// replace an existing notification of the same category.
  /// [payload] is the GoRouter path to navigate to on tap.
  Future<void> show({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDescription,
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const details = NotificationDetails(android: androidDetails);

    await _plugin.show(id, title, body, details, payload: payload);
  }

  // ── tap handler ──────────────────────────────────────────────────

  static void _onTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload == null || payload.isEmpty) return;

    // Attempt navigation via the root navigator.
    final ctx = rootNavigatorKey.currentContext;
    if (ctx == null) return;

    // Use Navigator.pushNamed as a fallback-safe approach;
    // GoRouter listens on the top-level navigator so this works.
    Navigator.of(ctx).pushNamed(payload);
  }

  // ── helpers ──────────────────────────────────────────────────────

  /// Pick a random entry from a list of message variants.
  static String pick(List<String> options) {
    return options[Random().nextInt(options.length)];
  }
}
