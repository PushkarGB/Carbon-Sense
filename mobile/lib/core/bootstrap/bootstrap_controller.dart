import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../auth/auth_models.dart';
import '../auth/auth_repository.dart';
import '../profile/profile_image_cache.dart';

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
    await dio.get('/app/open');
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

