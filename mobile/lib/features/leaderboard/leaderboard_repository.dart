import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_error.dart';
import 'leaderboard_models.dart';

class LeaderboardRepository {
  LeaderboardRepository(this._dio);

  final Dio _dio;

  Future<List<LeaderboardEntry>> list({required String scope}) async {
    try {
      final res = await _dio.get('/leaderboard', queryParameters: {'scope': scope});
      final data = res.data;

      // Backend returns an object: { scope, rows: [...] }.
      if (data is Map<String, dynamic>) {
        final rows = data['rows'];
        if (rows is List) {
          return rows
              .whereType<Map<String, dynamic>>()
              .map(LeaderboardEntry.fromJson)
              .toList(growable: false);
        }
        return const <LeaderboardEntry>[];
      }

      // Legacy/alternate shape support: allow a raw list.
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(LeaderboardEntry.fromJson)
            .toList(growable: false);
      }

      return const <LeaderboardEntry>[];
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }

  Future<void> refresh() async {
    try {
      await _dio.post('/leaderboard/refresh');
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }
}

final leaderboardRepositoryProvider = Provider<LeaderboardRepository>((ref) {
  return LeaderboardRepository(ref.watch(dioProvider));
});

