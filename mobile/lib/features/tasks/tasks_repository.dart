import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_error.dart';
import 'tasks_models.dart';

class TasksRepository {
  TasksRepository(this._dio);

  final Dio _dio;

  Future<TodayTasksResponse> today() async {
    try {
      final res = await _dio.get('/tasks/today');
      return TodayTasksResponse.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }
}

final tasksRepositoryProvider = Provider<TasksRepository>((ref) {
  return TasksRepository(ref.watch(dioProvider));
});

