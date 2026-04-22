import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_error.dart';
import 'dashboard_models.dart';

class DashboardRepository {
  DashboardRepository(this._dio);

  final Dio _dio;

  Future<DashboardHome> home() async {
    try {
      final res = await _dio.get('/dashboard/home');
      return DashboardHome.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }

  Future<AqiReading?> fetchAqi({String? station, String? city}) async {
    try {
      final query = <String, dynamic>{};
      if (station != null) query['station'] = station;
      if (city != null) query['city'] = city;
      final res = await _dio.get('/dashboard/aqi', queryParameters: query);
      if (res.data == null || res.data.toString().isEmpty) return null;
      return AqiReading.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      // Ignore not found or similar
      return null;
    }
  }

  Future<void> setStation(String station) async {
    try {
      await _dio.put('/profile/station', data: {'station': station});
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }
}

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.watch(dioProvider));
});

