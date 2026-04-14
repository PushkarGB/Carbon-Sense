import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_error.dart';
import 'insights_models.dart';

class InsightsRepository {
  InsightsRepository(this._dio);

  final Dio _dio;

  Future<InsightsSummary> summary({required int rangeDays}) async {
    try {
      final res = await _dio.get(
        '/insights/summary',
        queryParameters: {'range_days': rangeDays},
      );
      return InsightsSummary.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }
}

final insightsRepositoryProvider = Provider<InsightsRepository>((ref) {
  return InsightsRepository(ref.watch(dioProvider));
});

