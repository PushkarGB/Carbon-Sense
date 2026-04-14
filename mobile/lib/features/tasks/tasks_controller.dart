import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'tasks_models.dart';
import 'tasks_repository.dart';

final todayTasksProvider = FutureProvider<TodayTasksResponse>((ref) async {
  return ref.watch(tasksRepositoryProvider).today();
});

