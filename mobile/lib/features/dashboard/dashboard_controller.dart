import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dashboard_models.dart';
import 'dashboard_repository.dart';

final dashboardHomeProvider = FutureProvider<DashboardHome>((ref) async {
  return ref.watch(dashboardRepositoryProvider).home();
});

