import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';

import '../../../core/api/api_error.dart';
import '../../../core/lottie/lottie_assets.dart';
import '../../leaderboard/leaderboard_controller.dart';
import '../../leaderboard/leaderboard_models.dart';
import '../../leaderboard/leaderboard_repository.dart';

class LeaderboardTab extends ConsumerWidget {
  const LeaderboardTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scope = ref.watch(leaderboardScopeProvider);
    final state = ref.watch(leaderboardProvider);

    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Leaderboard',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'global', label: Text('Global')),
                    ButtonSegment(value: 'city', label: Text('City')),
                  ],
                  selected: {scope},
                  onSelectionChanged: (s) =>
                      ref.read(leaderboardScopeProvider.notifier).state = s.first,
                ),
                const SizedBox(width: 8),
                IconButton(
                  tooltip: 'Refresh',
                  onPressed: () async {
                    try {
                      await ref.read(leaderboardRepositoryProvider).refresh();
                      ref.invalidate(leaderboardProvider);
                    } catch (_) {}
                  },
                  icon: const Icon(Icons.refresh),
                ),
              ],
            ),
          ),
          Expanded(
            child: state.when(
              data: (list) => _LeaderboardList(entries: list),
              loading: () => _CenterLottie(text: 'Loading leaderboard…', asset: LottieAssets.loading),
              error: (e, _) => _LeaderboardError(error: ApiError.fromDio(e)),
            ),
          ),
        ],
      ),
    );
  }
}

class _LeaderboardList extends ConsumerWidget {
  const _LeaderboardList({required this.entries});

  final List<LeaderboardEntry> entries;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (entries.isEmpty) {
      return _CenterLottie(
        text: 'No leaderboard data yet.',
        asset: LottieAssets.empty,
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(leaderboardProvider);
      },
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
        itemCount: entries.length,
        separatorBuilder: (context, index) => const SizedBox(height: 8),
        itemBuilder: (context, i) {
          final e = entries[i];
          return Card(
            child: ListTile(
              leading: _RankBadge(rank: i + 1),
              title: Text(
                e.name,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              subtitle: Text('${e.city} • ${e.totalDaysLogged} days logged'),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    e.avgEmission.toStringAsFixed(1),
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  Text(
                    'avg kg',
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
              onTap: null,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            ),
          );
        },
      ),
    );
  }
}

class _RankBadge extends StatelessWidget {
  const _RankBadge({required this.rank});

  final int rank;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final bg = switch (rank) {
      1 => const Color(0xFFFFD700),
      2 => const Color(0xFFC0C0C0),
      3 => const Color(0xFFCD7F32),
      _ => cs.surfaceContainerHighest,
    };

    return Container(
      height: 42,
      width: 42,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Center(
        child: Text(
          '$rank',
          style: const TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}

class _LeaderboardError extends StatelessWidget {
  const _LeaderboardError({required this.error});

  final ApiError error;

  @override
  Widget build(BuildContext context) {
    return _CenterLottie(
      text: error.message,
      asset: LottieAssets.error,
      repeat: false,
    );
  }
}

class _CenterLottie extends StatelessWidget {
  const _CenterLottie({
    required this.text,
    required this.asset,
    this.repeat = true,
  });

  final String text;
  final String asset;
  final bool repeat;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 160,
              width: 160,
              child: LottieBuilder.asset(asset, repeat: repeat, fit: BoxFit.contain),
            ),
            const SizedBox(height: 10),
            Text(text, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
