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

  static const double _trendEpsilon = 0.05;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final emissions = summary.emissions;
    final projection = summary.projection;
    final projectedPoints = projection?.next30Days ?? const <ProjectionPoint>[];
    final hasProjection = projectedPoints.isNotEmpty;
    final actualCount = emissions.length;
    final totalCount = actualCount + projectedPoints.length;
    final maxX = totalCount > 1 ? (totalCount - 1).toDouble() : 1.0;

    final actualSpots = [
      for (var i = 0; i < emissions.length; i++)
        FlSpot(
          i.toDouble(),
          emissions[i].totalEmission,
        ),
    ];

    final projectedSpots = [
      if (emissions.isNotEmpty && projectedPoints.isNotEmpty)
        FlSpot(
          (emissions.length - 1).toDouble(),
          emissions.last.totalEmission,
        ),
      for (var i = 0; i < projectedPoints.length; i++)
        FlSpot(
          (emissions.length + i).toDouble(),
          projectedPoints[i].predictedEmission,
        ),
    ];

    final actualMax = emissions.isEmpty
        ? 0.0
        : emissions.map((e) => e.totalEmission).reduce((a, b) => a > b ? a : b);
    final projectionMax = projectedPoints.isEmpty
        ? 0.0
        : projectedPoints
              .map((e) => e.predictedEmission)
              .reduce((a, b) => a > b ? a : b);
    final chartMax = actualMax > projectionMax ? actualMax : projectionMax;

    final maxY = chartMax <= 0 ? 1.0 : chartMax * 1.15;

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
                  'Carbon shadow (actual + projection)',
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
                        gridData: FlGridData(
                          show: true,
                          drawVerticalLine: false,
                          horizontalInterval: maxY / 4,
                          getDrawingHorizontalLine: (_) => FlLine(
                            color: cs.outlineVariant.withValues(alpha: 0.25),
                            strokeWidth: 1,
                          ),
                        ),
                        titlesData: const FlTitlesData(show: false),
                        borderData: FlBorderData(show: false),
                        minX: 0,
                        maxX: maxX,
                        minY: 0,
                        maxY: maxY,
                        lineTouchData: LineTouchData(
                          touchTooltipData: LineTouchTooltipData(
                            getTooltipColor: (_) => cs.surfaceContainerHighest,
                            tooltipPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            getTooltipItems: (touchedSpots) {
                              return touchedSpots.map((spot) {
                                final index = spot.x.round();
                                final dateLabel = _xLabelForIndex(
                                  index,
                                  emissions,
                                  projectedPoints,
                                );
                                final isProjectionPoint = index >= emissions.length;
                                return LineTooltipItem(
                                  '${isProjectionPoint ? 'Projection' : 'Actual'} • $dateLabel\n${spot.y.toStringAsFixed(1)} kg',
                                  TextStyle(
                                    color: cs.onSurface,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                  ),
                                );
                              }).toList();
                            },
                          ),
                          handleBuiltInTouches: true,
                        ),
                        extraLinesData: hasProjection && actualCount > 0
                            ? ExtraLinesData(
                                verticalLines: [
                                  VerticalLine(
                                    x: (actualCount - 1).toDouble(),
                                    color: cs.tertiary.withValues(alpha: 0.45),
                                    strokeWidth: 1.2,
                                    dashArray: const [4, 4],
                                  ),
                                ],
                              )
                            : ExtraLinesData(),
                        lineBarsData: [
                          LineChartBarData(
                            spots: actualSpots,
                            isCurved: true,
                            gradient: LinearGradient(
                              colors: [cs.primary, cs.tertiary],
                            ),
                            barWidth: 4,
                            dotData: FlDotData(
                              show: true,
                              getDotPainter: (spot, percent, bar, index) {
                                return FlDotCirclePainter(
                                  radius: 3.8,
                                  color: cs.primary,
                                  strokeWidth: 1.8,
                                  strokeColor: cs.onPrimary,
                                );
                              },
                            ),
                            belowBarData: BarAreaData(
                              show: true,
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  cs.primary.withValues(alpha: 0.5),
                                  cs.tertiary.withValues(alpha: 0.0),
                                ],
                              ),
                            ),
                          ),
                          if (projectedPoints.isNotEmpty)
                            LineChartBarData(
                              spots: projectedSpots,
                              isCurved: true,
                              color: cs.tertiary,
                              barWidth: 3,
                              dashArray: const [8, 5],
                              dotData: FlDotData(
                                show: true,
                                checkToShowDot: (spot, _) {
                                  final index = spot.x.round();
                                  if (index < emissions.length) {
                                    return false;
                                  }
                                  final projectionIndex = index - emissions.length;
                                  return projectionIndex == 0 ||
                                      projectionIndex == projectedPoints.length - 1 ||
                                      projectionIndex % 5 == 0;
                                },
                                getDotPainter: (spot, percent, bar, index) {
                                  return FlDotCirclePainter(
                                    radius: 4.4,
                                    color: cs.tertiary,
                                    strokeWidth: 2,
                                    strokeColor: cs.onTertiary,
                                  );
                                },
                              ),
                              belowBarData: BarAreaData(
                                show: true,
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    cs.tertiary.withValues(alpha: 0.18),
                                    cs.tertiary.withValues(alpha: 0.0),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                if (projectedPoints.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 14,
                    runSpacing: 8,
                    children: [
                      _legendChip(context, color: cs.primary, label: 'Actual'),
                      _legendChip(
                        context,
                        color: cs.tertiary,
                        label: 'Projection',
                      ),
                      Text(
                        'Model: ${projection?.modelVersion ?? ''}',
                        style: TextStyle(color: cs.onSurfaceVariant),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cs.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _projectionNarrative(
                        emissions: emissions,
                        projectedPoints: projectedPoints,
                        yearEnd: projection?.yearEndProjection,
                      ),
                      style: TextStyle(
                        color: cs.onSurface,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: cs.secondaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.insights, color: cs.onSecondaryContainer),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Selected-range trend: ${summary.trend}. Keep tracking to maintain awareness!',
                          style: TextStyle(
                            color: cs.onSecondaryContainer,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
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
        _ThisWeekEmissionsCard(emissions: summary.emissions),
        const SizedBox(height: 12),
        _TrendCard(summary: summary),
        const SizedBox(height: 12),
        _BreakdownCard(latest: summary.latestBreakdown),
        const SizedBox(height: 12),
        _AqiCard(aqi: summary.aqi),
      ],
    );
  }

  String _projectionNarrative({
    required List<EmissionPoint> emissions,
    required List<ProjectionPoint> projectedPoints,
    required ProjectionPoint? yearEnd,
  }) {
    final current = emissions.isNotEmpty ? emissions.last.totalEmission : null;
    final monthPoint = projectedPoints.isNotEmpty ? projectedPoints.last : null;
    final yearPoint = yearEnd;

    if (current == null || monthPoint == null || yearPoint == null) {
      return 'Projection is available for next 30 days. Year-end projection will appear when the model provides it.';
    }

    final monthDelta = monthPoint.predictedEmission - current;
    final yearDelta = yearPoint.predictedEmission - current;

    final direction = _directionLabel(monthDelta, yearDelta);

    return 'If you continue at this rate, your daily emissions are projected to $direction to ${monthPoint.predictedEmission.toStringAsFixed(1)} kg by ${_shortDate(monthPoint.date)} and ${yearPoint.predictedEmission.toStringAsFixed(1)} kg by ${yearPoint.date}.';
  }

  String _directionLabel(double monthDelta, double yearDelta) {
    final avgDelta = (monthDelta + yearDelta) / 2;
    if (avgDelta > _trendEpsilon) {
      return 'increase';
    }
    if (avgDelta < -_trendEpsilon) {
      return 'decrease';
    }
    return 'stay stable';
  }

  String _shortDate(String ymd) {
    final parts = ymd.split('-');
    if (parts.length != 3) {
      return ymd;
    }
    final month = switch (parts[1]) {
      '01' => 'Jan',
      '02' => 'Feb',
      '03' => 'Mar',
      '04' => 'Apr',
      '05' => 'May',
      '06' => 'Jun',
      '07' => 'Jul',
      '08' => 'Aug',
      '09' => 'Sep',
      '10' => 'Oct',
      '11' => 'Nov',
      '12' => 'Dec',
      _ => parts[1],
    };
    return '${parts[2]} $month';
  }

  String _xLabelForIndex(
    int index,
    List<EmissionPoint> emissions,
    List<ProjectionPoint> projectedPoints,
  ) {
    if (index < emissions.length) {
      return _shortDate(emissions[index].date);
    }
    final projectionIndex = index - emissions.length;
    if (projectionIndex >= 0 && projectionIndex < projectedPoints.length) {
      return _shortDate(projectedPoints[projectionIndex].date);
    }
    return '';
  }
}

Widget _legendChip(
  BuildContext context, {
  required Color color,
  required String label,
}) {
  final cs = Theme.of(context).colorScheme;
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(
      color: cs.surfaceContainerHighest,
      borderRadius: BorderRadius.circular(999),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            color: cs.onSurfaceVariant,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    ),
  );
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
                        'Trend (${summary.rangeDays}d)',
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

class _ThisWeekEmissionsCard extends StatelessWidget {
  const _ThisWeekEmissionsCard({required this.emissions});

  final List<EmissionPoint> emissions;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    if (emissions.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            'No weekly emissions to display yet.',
            style: TextStyle(color: cs.onSurfaceVariant),
          ),
        ),
      );
    }

    final dailyByDate = <String, double>{
      for (final e in emissions) e.date: e.totalEmission,
    };

    final anchorDate = DateTime.tryParse(emissions.last.date);
    if (anchorDate == null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            'This week\'s emissions are unavailable.',
            style: TextStyle(color: cs.onSurfaceVariant),
          ),
        ),
      );
    }

    final week = List.generate(7, (index) {
      final day = anchorDate.subtract(Duration(days: 6 - index));
      final ymd = _toYmd(day);
      return (
        date: day,
        ymd: ymd,
        value: dailyByDate[ymd] ?? 0.0,
      );
    });

    final maxValue = week
        .map((d) => d.value)
        .reduce((a, b) => a > b ? a : b);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'This week\'s emissions',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 190,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  for (var i = 0; i < week.length; i++) ...[
                    Expanded(
                      child: _WeekEmissionBar(
                        label: _weekdayLabel(week[i].date),
                        value: week[i].value,
                        maxValue: maxValue,
                      ),
                    ),
                    if (i != week.length - 1) const SizedBox(width: 8),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _toYmd(DateTime day) {
    final y = day.year.toString().padLeft(4, '0');
    final m = day.month.toString().padLeft(2, '0');
    final d = day.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  String _weekdayLabel(DateTime day) {
    return switch (day.weekday) {
      DateTime.monday => 'Mon',
      DateTime.tuesday => 'Tue',
      DateTime.wednesday => 'Wed',
      DateTime.thursday => 'Thu',
      DateTime.friday => 'Fri',
      DateTime.saturday => 'Sat',
      DateTime.sunday => 'Sun',
      _ => '',
    };
  }
}

class _WeekEmissionBar extends StatelessWidget {
  const _WeekEmissionBar({
    required this.label,
    required this.value,
    required this.maxValue,
  });

  final String label;
  final double value;
  final double maxValue;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final normalized = maxValue <= 0 ? 0.0 : (value / maxValue).clamp(0.0, 1.0);
    final barHeight = 12 + (normalized * 96);

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Text(
          value.toStringAsFixed(1),
          style: TextStyle(
            color: cs.onSurfaceVariant,
            fontWeight: FontWeight.w700,
            fontSize: 11,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: 24,
          height: barHeight,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
              colors: [cs.primary, cs.tertiary],
            ),
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            color: cs.onSurfaceVariant,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
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
              'Latest emission breakdown',
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
