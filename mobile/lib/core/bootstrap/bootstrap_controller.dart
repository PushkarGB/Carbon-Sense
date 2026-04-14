import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../auth/auth_models.dart';
import '../auth/auth_repository.dart';
import '../profile/profile_image_cache.dart';
import '../preferences/lifestyle_prefs.dart';
import '../../features/activity/ist_date.dart';

sealed class BootstrapResult {
  const BootstrapResult();
}

class BootstrapUnauthenticated extends BootstrapResult {
  const BootstrapUnauthenticated();
}

class BootstrapAuthenticated extends BootstrapResult {
  const BootstrapAuthenticated({
    required this.user,
    required this.onboardingCompleted,
  });

  final AuthUser user;
  final bool onboardingCompleted;
}

final bootstrapProvider = FutureProvider<BootstrapResult>((ref) async {
  final tokenStorage = ref.watch(tokenStorageProvider);
  final token = await tokenStorage.readToken();
  if (token == null || token.isEmpty) {
    return const BootstrapUnauthenticated();
  }

  final authRepo = ref.watch(authRepositoryProvider);
  final dio = ref.watch(dioProvider);
  final avatarCache = ref.watch(profileImageCacheProvider);
  final prefs = LifestylePrefs();

  AuthUser user;
  try {
    user = await authRepo.me();
    await avatarCache.writeCachedUrl(user.profilePictureUrl);
  } on DioException {
    await tokenStorage.deleteToken();
    return const BootstrapUnauthenticated();
  }

  // Spec: call on every app launch once JWT is available.
  try {
    final res = await dio.get('/app/open');
    final data = res.data;
    if (data is Map<String, dynamic>) {
      final updated = data['streak_updated'];
      final streakDays = data['streak_days'];
      if (updated == true && streakDays is num) {
        final today = todayIstYyyyMmDd();
        await prefs.writeStreakPopupValue(streakDays.toInt());
        await prefs.writeStreakPopupPendingYmd(today);
      }
    }
  } catch (_) {}

  // Source of truth for onboarding gating is guaranteed in /dashboard/home.
  bool? onboardingCompleted = user.onboardingCompleted;
  if (onboardingCompleted == null) {
    try {
      final res = await dio.get('/dashboard/home');
      final data = res.data as Map<String, dynamic>;
      onboardingCompleted = data['onboarding_completed'] as bool?;
    } catch (_) {}
  }

  return BootstrapAuthenticated(
    user: user,
    onboardingCompleted: onboardingCompleted ?? false,
  );
});

