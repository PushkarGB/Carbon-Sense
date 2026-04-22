import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../../core/api/api_error.dart';
import '../../../core/lottie/lottie_assets.dart';
import '../../../core/preferences/lifestyle_prefs.dart';
import '../../dashboard/aqi_color.dart';
import '../../dashboard/aqi_station_picker.dart';
import '../../dashboard/dashboard_controller.dart';
import '../../dashboard/dashboard_models.dart';
import '../../tasks/awareness_signals.dart';
import '../../activity/ist_date.dart';

class DashboardTab extends ConsumerWidget {
  const DashboardTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardHomeProvider);
    ref.read(awarenessSignalsProvider).sendOnce(
      'aqi_screen_viewed',
      const {'aqi_screen_viewed': true},
    );
    final width = MediaQuery.sizeOf(context).width;
    final heroHeight = (width * 0.34).clamp(110.0, 170.0);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          SizedBox(
            height: heroHeight,
            child: LottieBuilder.asset(
              LottieAssets.dashboardHeaderPlaceholder,
              repeat: true,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 8),
          state.when(
            data: (home) => _StreakPopupGate(child: _DashboardBody(home: home)),
            loading: () => _DashboardLoading(),
            error: (e, _) => _DashboardError(error: ApiError.fromDio(e)),
          ),
        ],
      ),
    );
  }
}

class _StreakPopupGate extends ConsumerStatefulWidget {
  const _StreakPopupGate({required this.child});
  final Widget child;

  @override
  ConsumerState<_StreakPopupGate> createState() => _StreakPopupGateState();
}

class _StreakPopupGateState extends ConsumerState<_StreakPopupGate> {
  bool _checked = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_checked) return;
    _checked = true;
    // Let the dashboard render first, then show the popup after a short delay
    // so it feels intentional rather than an instant flash.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _maybeShow();
    });
  }

  Future<void> _maybeShow() async {
    // Small pause so the dashboard is visually settled before the overlay appears.
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;

    final prefs = LifestylePrefs();
    final today = todayIstYyyyMmDd();
    final pending = await prefs.readStreakPopupPendingYmd();
    final shown = await prefs.readStreakPopupShownYmd();
    if (!mounted) return;

    if (pending != today || shown == today) return;
    final value = await prefs.readStreakPopupValue();
    if (!mounted || value == null || value <= 0) return;
    final lost = await prefs.readStreakPopupLost();
    final previousValue = await prefs.readStreakPopupPreviousValue() ?? 0;

    if (lost && previousValue > 0) {
      await _showStreakDialog(
        animationAsset: LottieAssets.streakLost,
        title: 'Streak Lost',
        message:
            'Your $previousValue-day streak was reset because a day was missed.',
        actionLabel: 'Continue',
      );
      if (!mounted) return;
    }

    // Use the same premium animated dialog for streak updates.
    await _showStreakDialog(
      animationAsset: LottieAssets.streakFire,
      title: value == 1 ? 'New Streak Started!' : '🔥 $value-Day Streak!',
      message: value == 1
          ? 'Great start! Log your eco actions daily to build your streak.'
          : 'You\'re on a $value-day streak. Keep tracking your eco actions!',
      actionLabel: 'Awesome',
    );

    if (!mounted) return;
    await prefs.writeStreakPopupShownYmd(today);
  }

  Future<void> _showStreakDialog({
    required String animationAsset,
    required String title,
    required String message,
    required String actionLabel,
  }) {
    return showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: title,
      barrierColor: Colors.black.withValues(alpha: 0.28),
      transitionDuration: const Duration(milliseconds: 340),
      pageBuilder: (dialogContext, animation, secondaryAnimation) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
          child: _ElevatedStreakDialog(
            animationAsset: animationAsset,
            title: title,
            message: message,
            actionLabel: actionLabel,
          ),
        );
      },
      transitionBuilder: (dialogContext, animation, secondaryAnimation, child) {
        final curved = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
        );
        return FadeTransition(
          opacity: curved,
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.9, end: 1).animate(curved),
            child: child,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

class _ElevatedStreakDialog extends StatelessWidget {
  const _ElevatedStreakDialog({
    required this.animationAsset,
    required this.title,
    required this.message,
    required this.actionLabel,
  });

  final String animationAsset;
  final String title;
  final String message;
  final String actionLabel;

  @override
  Widget build(BuildContext context) {
    const flame = Color(0xFFFFB74D);
    const ember = Color(0xFFFF7043);

    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: Colors.white.withValues(alpha: 0.32)),
          boxShadow: [
            BoxShadow(
              color: ember.withValues(alpha: 0.24),
              blurRadius: 42,
              spreadRadius: 3,
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.36),
              blurRadius: 34,
              offset: const Offset(0, 18),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 154,
              width: 154,
              child: LottieBuilder.asset(
                animationAsset,
                repeat: false,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                shadows: [
                  Shadow(
                    color: flame.withValues(alpha: 0.72),
                    blurRadius: 18,
                  ),
                  Shadow(
                    color: Colors.black.withValues(alpha: 0.5),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white.withValues(alpha: 0.88),
                fontWeight: FontWeight.w700,
                height: 1.45,
                shadows: [
                  Shadow(
                    color: Colors.black.withValues(alpha: 0.7),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.of(context).pop(),
                style: FilledButton.styleFrom(
                  backgroundColor: flame,
                  foregroundColor: const Color(0xFF241407),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  textStyle: const TextStyle(fontWeight: FontWeight.w900),
                ),
                child: Text(actionLabel),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardLoading extends StatelessWidget {
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
            const Expanded(child: Text('Loading your dashboard…')),
          ],
        ),
      ),
    );
  }
}

class _DashboardError extends StatelessWidget {
  const _DashboardError({required this.error});

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
                    'Couldn’t load dashboard',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
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

class _DashboardBody extends StatelessWidget {
  const _DashboardBody({required this.home});

  final DashboardHome home;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _Header(user: home.user, streakDays: home.streakDays),
        const SizedBox(height: 16),
        _TodayEmissionCard(todayEmission: home.todayEmission),
        const SizedBox(height: 12),
        _AqiCard(home: home),
        const SizedBox(height: 12),
        _TasksProgressCard(progress: home.tasksProgress),
        const SizedBox(height: 12),
        _PerformanceCard(perf: home.performance),
        if (!home.onboardingCompleted) ...[
          const SizedBox(height: 12),
          _OnboardingBanner(),
        ],
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.user, required this.streakDays});

  final DashboardUser user;
  final int streakDays;

  @override
  Widget build(BuildContext context) {
    const startColor = Color(0xFF0F2027);
    const midColor = Color(0xFF203A43);
    const endColor = Color(0xFF2C5364);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [startColor, midColor, endColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            offset: const Offset(0, 8),
            blurRadius: 20,
          )
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hi, ${user.name}',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${user.city} • ${user.role}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white70,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.local_fire_department, color: Colors.amberAccent, size: 20),
                const SizedBox(width: 6),
                Text(
                  '$streakDays',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          _Avatar(url: user.profilePictureUrl, name: user.name),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.url, required this.name});

  final String? url;
  final String name;

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().isEmpty
        ? '?'
        : name
              .trim()
              .split(RegExp(r'\s+'))
              .take(2)
              .map((p) => p.isNotEmpty ? p[0].toUpperCase() : '')
              .join();

    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: SizedBox(
        height: 44,
        width: 44,
        child: url == null || url!.isEmpty
            ? ColoredBox(
                color: Theme.of(context).colorScheme.secondaryContainer,
                child: Center(
                  child: Text(
                    initials,
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      color: Theme.of(context).colorScheme.onSecondaryContainer,
                    ),
                  ),
                ),
              )
            : CachedNetworkImage(
                imageUrl: url!,
                fit: BoxFit.cover,
                errorWidget: (context, url, error) => ColoredBox(
                  color: Theme.of(context).colorScheme.secondaryContainer,
                  child: Center(child: Text(initials)),
                ),
              ),
      ),
    );
  }
}

class _TodayEmissionCard extends StatelessWidget {
  const _TodayEmissionCard({required this.todayEmission});

  final TodayEmission? todayEmission;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    "Today's emission",
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                Text(
                  todayEmission == null
                      ? 'No log today'
                      : '${todayEmission!.total.toStringAsFixed(1)} kg CO₂',
                  style: TextStyle(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (todayEmission == null)
              Row(
                children: [
                  SizedBox(
                    height: 72,
                    width: 72,
                    child: LottieBuilder.asset(
                      LottieAssets.empty,
                      repeat: true,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text('Log today’s activity to see your breakdown.'),
                  ),
                ],
              )
            else
              SizedBox(
                height: 160,
                child: Row(
                  children: [
                    Expanded(
                      child: _Donut(breakdown: todayEmission!.breakdown),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _BreakdownLegend(
                        breakdown: todayEmission!.breakdown,
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
}

class _Donut extends StatelessWidget {
  const _Donut({required this.breakdown});

  final Map<String, double> breakdown;

  @override
  Widget build(BuildContext context) {
    final total = breakdown.values.fold<double>(0, (a, b) => a + b);
    if (total <= 0) {
      return Center(
        child: LottieBuilder.asset(
          LottieAssets.empty,
          repeat: true,
          fit: BoxFit.contain,
        ),
      );
    }

    final palette = <Color>[
      const Color(0xFF0EA371),
      const Color(0xFF2F80ED),
      const Color(0xFFF2994A),
      const Color(0xFFEB5757),
      const Color(0xFF9B51E0),
    ];

    final entries = breakdown.entries.where((e) => e.value > 0).toList();
    entries.sort((a, b) => b.value.compareTo(a.value));

    return PieChart(
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
    );
  }
}

class _BreakdownLegend extends StatelessWidget {
  const _BreakdownLegend({required this.breakdown});

  final Map<String, double> breakdown;

  @override
  Widget build(BuildContext context) {
    final entries = breakdown.entries.where((e) => e.value > 0).toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    if (entries.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final e in entries.take(5))
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _prettyKey(e.key),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Text(
                  e.value.toStringAsFixed(1),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
      ],
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
  const _AqiCard({required this.home});

  final DashboardHome home;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final aqi = home.aqi;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Air quality (AQI) - ${aqi?.station ?? home.user.city}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                TextButton(
                  onPressed: () => CompareCitySheet.show(context),
                  style: TextButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                  child: const Text('Compare'),
                ),
              ],
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
            if (aqi != null) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => ChangeStationSheet.show(context, home.user.city),
                  icon: const Icon(Icons.location_on_outlined, size: 18),
                  label: const Text('Change Station'),
                ),
              ),
            ],
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

class _TasksProgressCard extends StatelessWidget {
  const _TasksProgressCard({required this.progress});

  final TasksProgress? progress;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.push('/tasks/today'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Today’s tasks',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Icon(Icons.chevron_right, color: cs.onSurfaceVariant),
                ],
              ),
              const SizedBox(height: 10),
              if (progress == null)
                Text(
                  'No tasks yet.',
                  style: TextStyle(color: cs.onSurfaceVariant),
                )
              else ...[
                Text(
                  '${progress!.completed}/${progress!.total} completed',
                  style: TextStyle(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    minHeight: 10,
                    value: progress!.total == 0
                        ? 0
                        : progress!.completed / progress!.total,
                    backgroundColor: cs.surfaceContainerHighest,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _PerformanceCard extends StatelessWidget {
  const _PerformanceCard({required this.perf});

  final PerformanceMetrics perf;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final reduction = perf.reductionPercent;
    final isPositive = reduction >= 0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Performance',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _metric(
                    context,
                    label: 'Baseline',
                    value: perf.baselineEmission.toStringAsFixed(1),
                    suffix: 'kg',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _metric(
                    context,
                    label: 'Current avg',
                    value: perf.currentAvgEmission.toStringAsFixed(1),
                    suffix: 'kg',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: cs.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Icon(
                    isPositive ? Icons.trending_down : Icons.trending_up,
                    color: isPositive ? cs.primary : cs.error,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${reduction.abs().toStringAsFixed(1)}% ${isPositive ? 'reduction' : 'increase'}',
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                  Text(
                    perf.baselineStatus,
                    style: TextStyle(
                      color: cs.onSurfaceVariant,
                      fontWeight: FontWeight.w700,
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

  Widget _metric(
    BuildContext context, {
    required String label,
    required String value,
    required String suffix,
  }) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: cs.onSurfaceVariant)),
          const SizedBox(height: 2),
          Text(
            '$value $suffix',
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }
}

// _ProjectionCard removed

class _OnboardingBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.go('/onboarding'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(Icons.auto_awesome, color: cs.primary),
              const SizedBox(width: 12),
              const Expanded(
                child: Text('Finish onboarding to personalize your tasks.'),
              ),
              Icon(Icons.chevron_right, color: cs.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }
}
