import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../../core/lottie/lottie_assets.dart';
import '../../../core/preferences/lifestyle_prefs.dart';
import '../../activity/ist_date.dart';
import '../../dashboard/dashboard_controller.dart';

class InputTab extends ConsumerWidget {
  const InputTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final today = todayIstYyyyMmDd();
    final dashboard = ref.watch(dashboardHomeProvider);
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          Text(
            'Input',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 160,
            child: LottieBuilder.asset(
              LottieAssets.inputHeader,
              repeat: true,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Daily activity',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'A quick snapshot of today. No meter math.',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 12),
                  FutureBuilder<String?>(
                    future: LifestylePrefs().readLastDailyLogYmd(),
                    builder: (context, snap) {
                      final last = snap.data;
                      final already = last == today;
                      return FilledButton(
                        onPressed: already ? null : () => context.push('/input/daily'),
                        child: Text(already ? 'Daily log submitted' : 'Start daily log'),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Weekly activity',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'A reflection layer. Works even if daily logs were missed.',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 12),
                  FutureBuilder<String?>(
                    future: LifestylePrefs().readLastWeeklyLogYmd(),
                    builder: (context, snap) {
                      final last = snap.data;
                      final dashAlready = dashboard.maybeWhen(
                        data: (h) => h.weeklyInsights.lastWeeklySubmissionDate == today,
                        orElse: () => false,
                      );
                      final already = last == today || dashAlready;
                      return FilledButton.tonal(
                        onPressed: already ? null : () => context.push('/input/weekly'),
                        child: Text(already ? 'Weekly log submitted' : 'Start weekly log'),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

