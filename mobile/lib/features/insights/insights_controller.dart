import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'insights_models.dart';
import 'insights_repository.dart';

final insightsRangeProvider = StateProvider<int>((ref) => 7);

final insightsSummaryProvider = FutureProvider<InsightsSummary>((ref) async {
  final range = ref.watch(insightsRangeProvider);
  return ref.watch(insightsRepositoryProvider).summary(rangeDays: range);
});

