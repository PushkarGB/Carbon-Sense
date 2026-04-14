import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'leaderboard_models.dart';
import 'leaderboard_repository.dart';

final leaderboardScopeProvider = StateProvider<String>((ref) => 'global');

final leaderboardProvider = FutureProvider<List<LeaderboardEntry>>((ref) async {
  final scope = ref.watch(leaderboardScopeProvider);
  return ref.watch(leaderboardRepositoryProvider).list(scope: scope);
});

