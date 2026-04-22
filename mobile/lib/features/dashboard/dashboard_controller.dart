import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dashboard_models.dart';
import 'dashboard_repository.dart';

final dashboardHomeProvider = FutureProvider<DashboardHome>((ref) async {
  return ref.watch(dashboardRepositoryProvider).home();
});

class DashboardController extends StateNotifier<AsyncValue<void>> {
  DashboardController(this._ref, this._repo) : super(const AsyncValue.data(null));

  final Ref _ref;
  final DashboardRepository _repo;

  Future<void> setStation(String station) async {
    state = const AsyncValue.loading();
    try {
      await _repo.setStation(station);
      _ref.invalidate(dashboardHomeProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<AqiReading?> fetchAqi(String station, String city) {
    return _repo.fetchAqi(station: station, city: city);
  }
}

final dashboardControllerProvider = StateNotifierProvider<DashboardController, AsyncValue<void>>((ref) {
  return DashboardController(ref, ref.watch(dashboardRepositoryProvider));
});

