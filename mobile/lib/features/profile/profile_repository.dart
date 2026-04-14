import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_error.dart';
import '../dashboard/dashboard_controller.dart';
import '../../core/profile/profile_image_cache.dart';
import 'profile_models.dart';

class ProfileRepository {
  ProfileRepository(this._dio, this._ref);

  final Dio _dio;
  final Ref _ref;

  Future<ProfileResponse> me() async {
    try {
      final res = await _dio.get('/profile/me');
      final profile = ProfileResponse.fromJson(res.data as Map<String, dynamic>);
      await _ref.read(profileImageCacheProvider).writeCachedUrl(profile.user.profilePictureUrl);
      _ref.invalidate(dashboardHomeProvider);
      return profile;
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }
}

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(ref.watch(dioProvider), ref);
});

