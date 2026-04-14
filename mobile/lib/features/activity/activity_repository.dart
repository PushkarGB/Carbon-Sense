import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_error.dart';
import 'activity_models.dart';

class ActivityRepository {
  ActivityRepository(this._dio);

  final Dio _dio;

  Future<ActivitySubmitResult> submitDaily(ActivityPayload payload) async {
    try {
      final res = await _dio.post('/activity/daily', data: payload.toJson());
      return ActivitySubmitResult.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }

  Future<ActivitySubmitResult> submitWeekly(ActivityPayload payload) async {
    try {
      final res = await _dio.post('/activity/weekly', data: payload.toJson());
      return ActivitySubmitResult.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }
}

final activityRepositoryProvider = Provider<ActivityRepository>((ref) {
  return ActivityRepository(ref.watch(dioProvider));
});

