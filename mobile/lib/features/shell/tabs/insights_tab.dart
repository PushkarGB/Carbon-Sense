import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../../core/api/api_error.dart';
import '../../../core/lottie/lottie_assets.dart';
import '../../dashboard/aqi_color.dart';
import '../../insights/insights_controller.dart';
import '../../insights/insights_models.dart';
import '../../tasks/awareness_signals.dart';

class InsightsTab extends ConsumerWidget {
  const InsightsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // v1 awareness: viewing Insights screen can unlock awareness tasks.
    ref.read(awarenessSignalsProvider).sendOnce(
      'insights_screen_viewed',
      const {'insights_screen_viewed': true},
    );

    final state = ref.watch(insightsSummaryProvider);
    final width = MediaQuery.sizeOf(context).width;
    final heroHeight = (width * 0.30).clamp(90.0, 150.0);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          SizedBox(
            height: heroHeight,
            child: LottieBuilder.asset(
              LottieAssets.insightsHeaderPlaceholder,
              repeat: true,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Insights',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              SegmentedButton<int>(
                segments: const [
                  ButtonSegment(value: 7, label: Text('7d')),
                  ButtonSegment(value: 30, label: Text('30d')),
                ],
                selected: {ref.watch(insightsRangeProvider)},
                onSelectionChanged: (s) =>
                    ref.read(insightsRangeProvider.notifier).state = s.first,
              ),
            ],
          ),
          const SizedBox(height: 14),
          state.when(
            data: (summary) => _InsightsBody(summary: summary),
            loading: () => _InsightsLoading(),
            error: (e, _) => _InsightsError(error: ApiError.fromDio(e)),
          ),
        ],
      ),
    );
  }
}

class _InsightsLoading extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            SizedBox(
              height: 56,
              width: 56,
              child: LottieBuilder.asset(
                LottieAssets.loading,
                repeat: true,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(child: Text('Loading insights…')),
          ],
        ),
      ),
    );
  }
}

class _InsightsError extends StatelessWidget {
  const _InsightsError({required this.error});

  final ApiError error;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 56,
              width: 56,
              child: LottieBuilder.asset(
                LottieAssets.error,
                repeat: false,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Couldn’t load insights',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    error.message,
                    style: TextStyle(color: cs.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InsightsBody extends ConsumerWidget {
  const _InsightsBody({required this.summary});

  final InsightsSummary summary;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final emissions = summary.emissions;

    final maxY = emissions.isEmpty
        ? 1.0
        : emissions
                  .map((e) => e.totalEmission)
                  .reduce((a, b) => a > b ? a : b) *
              1.15;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Emissions',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 12),
                if (emissions.isEmpty)
                  SizedBox(
                    height: 150,
                    child: Center(
                      child: Text(
                        'No emissions logged in this range yet.',
                        style: TextStyle(color: cs.onSurfaceVariant),
                      ),
                    ),
                  )
                else
                  SizedBox(
                    height: 180,
                    child: LineChart(
                      LineChartData(
                        gridData: const FlGridData(show: false),
                        titlesData: const FlTitlesData(show: false),
                        borderData: FlBorderData(show: false),
                        minY: 0,
                        maxY: maxY,
                        lineBarsData: [
                          LineChartBarData(
                            spots: [
                              for (var i = 0; i < emissions.length; i++)
                                FlSpot(
                                  i.toDouble(),
                                  emissions[i].totalEmission,
                                ),
                            ],
                            isCurved: true,
                            color: cs.primary,
                            barWidth: 3,
                            dotData: const FlDotData(show: false),
                            belowBarData: BarAreaData(
                              show: true,
                              color: cs.primary.withValues(alpha: 0.12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _SummaryGrid(summary: summary.summary),
        const SizedBox(height: 12),
        _ComparisonCard(summary: summary),
        const SizedBox(height: 12),
        _TrendCard(summary: summary),
        const SizedBox(height: 12),
        _BreakdownCard(latest: summary.latestBreakdown),
        const SizedBox(height: 12),
        _AqiCard(aqi: summary.aqi),
      ],
    );
  }
}

class _SummaryGrid extends StatelessWidget {
  const _SummaryGrid({required this.summary});

  final SummaryStats summary;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(label: 'Average', value: summary.averageEmission),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(label: 'Total', value: summary.totalEmission),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(label: 'Max', value: summary.maxEmission),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: cs.onSurfaceVariant)),
            const SizedBox(height: 4),
            Text(
              '${value.toStringAsFixed(1)} kg',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
    );
  }
}

class _ComparisonCard extends ConsumerWidget {
  const _ComparisonCard({required this.summary});

  final InsightsSummary summary;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    double? today;
    double? yesterday;

    if (summary.emissions.isNotEmpty) {
      final last = summary.emissions.last;
      today = last.totalEmission;
      if (summary.emissions.length >= 2) {
        yesterday =
            summary.emissions[summary.emissions.length - 2].totalEmission;
      }
    }

    final deltaPct = (today != null && yesterday != null && yesterday > 0)
        ? ((today - yesterday) / yesterday) * 100
        : null;

    Future<void> fire() async {
      await ref.read(awarenessSignalsProvider).sendOnce(
        'comparison_viewed',
        const {'comparison_viewed': true},
      );
    }

    return VisibilityDetector(
      key: const Key('comparison-card'),
      onVisibilityChanged: (info) {
        if (info.visibleFraction >= 0.6) {
          fire();
        }
      },
      child: Card(
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => fire(),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Today vs Yesterday',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _bar(context, 'Today', today ?? 0)),
                    const SizedBox(width: 12),
                    Expanded(child: _bar(context, 'Yesterday', yesterday ?? 0)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  deltaPct == null
                      ? 'Not enough data to compare.'
                      : '${deltaPct.abs().toStringAsFixed(1)}% ${deltaPct >= 0 ? 'higher' : 'lower'}',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _bar(BuildContext context, String label, double value) {
    final cs = Theme.of(context).colorScheme;
    final height = (value * 10).clamp(10, 120).toDouble();
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: cs.onSurfaceVariant)),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.bottomLeft,
            child: Container(
              height: height,
              width: 18,
              decoration: BoxDecoration(
                color: cs.primary,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value.toStringAsFixed(1),
            style: const TextStyle(fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }
}

class _TrendCard extends ConsumerWidget {
  const _TrendCard({required this.summary});

  final InsightsSummary summary;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<void> fire() async {
      await ref.read(awarenessSignalsProvider).sendOnce('trend_viewed', const {
        'trend_viewed': true,
      });
    }

    final trend = summary.trend;
    final icon = switch (trend) {
      'increasing' => Icons.trending_up,
      'decreasing' => Icons.trending_down,
      _ => Icons.trending_flat,
    };

    return VisibilityDetector(
      key: const Key('trend-card'),
      onVisibilityChanged: (info) {
        if (info.visibleFraction >= 0.6) fire();
      },
      child: Card(
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => fire(),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 30,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Weekly Trend',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        trend,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BreakdownCard extends StatelessWidget {
  const _BreakdownCard({required this.latest});

  final LatestBreakdown? latest;

  @override
  Widget build(BuildContext context) {
    if (latest == null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              SizedBox(
                height: 56,
                width: 56,
                child: LottieBuilder.asset(
                  LottieAssets.empty,
                  repeat: true,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(child: Text('No breakdown yet.')),
            ],
          ),
        ),
      );
    }

    final total = latest!.values.values.fold<double>(0, (a, b) => a + b);
    if (total <= 0) {
      return const SizedBox.shrink();
    }

    final palette = <Color>[
      const Color(0xFF0EA371),
      const Color(0xFF2F80ED),
      const Color(0xFFF2994A),
      const Color(0xFFEB5757),
      const Color(0xFF9B51E0),
    ];
    final entries =
        latest!.percentages.entries.where((e) => e.value > 0).toList()
          ..sort((a, b) => b.value.compareTo(a.value));

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Carbon shadow (latest breakdown)',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 160,
              child: Row(
                children: [
                  Expanded(
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 42,
                        sections: [
                          for (var i = 0; i < entries.length; i++)
                            PieChartSectionData(
                              value: entries[i].value,
                              color: palette[i % palette.length],
                              showTitle: false,
                              radius: 42,
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (final e in entries.take(5))
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              children: [
                                Expanded(child: Text(_prettyKey(e.key))),
                                Text('${e.value.toStringAsFixed(0)}%'),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _prettyKey(String key) {
    return key
        .replaceAll('_', ' ')
        .split(' ')
        .where((p) => p.isNotEmpty)
        .map((p) => p[0].toUpperCase() + p.substring(1))
        .join(' ');
  }
}

class _AqiCard extends StatelessWidget {
  const _AqiCard({required this.aqi});

  final AqiLite? aqi;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Air quality (AQI)',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 10),
            if (aqi == null)
              Text(
                'AQI unavailable',
                style: TextStyle(color: cs.onSurfaceVariant),
              )
            else
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: aqiColor(aqi!.aqi),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${aqi!.aqi}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 22,
                            color: Colors.black,
                          ),
                        ),
                        Text(
                          aqiLevel(aqi!.aqi),
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: Colors.black,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Wrap(
                      spacing: 10,
                      runSpacing: 8,
                      children: [
                        _pill(context, 'PM2.5', aqi!.pm25),
                        _pill(context, 'PM10', aqi!.pm10),
                        _pill(context, 'NO₂', aqi!.no2),
                        _pill(context, 'SO₂', aqi!.so2),
                        _pill(context, 'CO', aqi!.co),
                      ],
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _pill(BuildContext context, String label, double value) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$label ${value.toStringAsFixed(0)}',
        style: TextStyle(
          color: cs.onSurfaceVariant,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
