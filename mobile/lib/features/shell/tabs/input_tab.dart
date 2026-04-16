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
    final width = MediaQuery.sizeOf(context).width;
    final artHeight = (width * 0.38).clamp(120.0, 190.0);

    bool isWeeklyUnlockDay(DateTime? createdAt) {
      if (createdAt == null) return true;
      final createdYmd = DateTime(
        createdAt.year,
        createdAt.month,
        createdAt.day,
      );
      final now = DateTime.now();
      final todayYmd = DateTime(now.year, now.month, now.day);
      final daysSince = todayYmd.difference(createdYmd).inDays;
      return daysSince >= 7 && daysSince % 7 == 0;
    }

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          Text(
            'Input',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: artHeight,
            child: LottieBuilder.asset(
              LottieAssets.inputHeader,
              repeat: true,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE7F8EE), Color(0xFFF2FFF6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
            ),
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
                        onPressed: already
                            ? null
                            : () => context.push('/input/daily'),
                        child: Text(
                          already ? 'Daily log submitted' : 'Start daily log',
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFEAF3FF), Color(0xFFF3F7FF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
            ),
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
                        data: (h) =>
                            h.weeklyInsights.lastWeeklySubmissionDate == today,
                        orElse: () => false,
                      );
                      final unlockByDate = dashboard.maybeWhen(
                        data: (h) => isWeeklyUnlockDay(h.user.createdAt),
                        orElse: () => true,
                      );
                      final already = last == today || dashAlready;
                      final disabled = already || !unlockByDate;
                      return FilledButton.tonal(
                        onPressed: disabled
                            ? null
                            : () => context.push('/input/weekly'),
                        child: Text(
                          already
                              ? 'Weekly log submitted'
                              : (unlockByDate
                                    ? 'Start weekly log'
                                    : 'Weekly log unlocks every 7th day'),
                        ),
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
