import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_error.dart';

class TasksEvaluateRepository {
  TasksEvaluateRepository(this._dio);

  final Dio _dio;

  Future<void> evaluate(Map<String, bool> signals) async {
    try {
      await _dio.post('/tasks/evaluate', data: {'signals': signals});
    } catch (e) {
      throw ApiError.fromDio(e);
    }
  }
}

final tasksEvaluateRepositoryProvider = Provider<TasksEvaluateRepository>((ref) {
  return TasksEvaluateRepository(ref.watch(dioProvider));
});

