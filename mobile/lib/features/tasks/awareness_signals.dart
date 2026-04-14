import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'tasks_evaluate_repository.dart';

final awarenessSignalsProvider = Provider<AwarenessSignals>((ref) {
  return AwarenessSignals(ref);
});

class AwarenessSignals {
  AwarenessSignals(this._ref);

  final Ref _ref;
  final Set<String> _sent = {};

  Future<void> sendOnce(String key, Map<String, bool> signals) async {
    if (_sent.contains(key)) return;
    _sent.add(key);
    try {
      await _ref.read(tasksEvaluateRepositoryProvider).evaluate(signals);
    } catch (_) {
      // Awareness signals should not block UI flow.
    }
  }
}

