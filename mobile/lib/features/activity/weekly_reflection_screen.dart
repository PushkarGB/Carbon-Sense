import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../core/api/api_error.dart';
import '../../core/lottie/lottie_assets.dart';
import '../../core/widgets/celebration_dialog.dart';
import '../../core/preferences/lifestyle_prefs.dart';
import '../dashboard/dashboard_controller.dart';
import '../dashboard/dashboard_models.dart';
import '../tasks/tasks_controller.dart';
import '../tasks/tasks_models.dart';
import 'activity_models.dart';
import 'activity_repository.dart';
import 'ist_date.dart';

class WeeklyReflectionScreen extends ConsumerStatefulWidget {
  const WeeklyReflectionScreen({super.key});

  @override
  ConsumerState<WeeklyReflectionScreen> createState() => _WeeklyReflectionScreenState();
}

class _WeeklyReflectionScreenState extends ConsumerState<WeeklyReflectionScreen> {
  bool _submitting = false;
  String? _errorText;

  // “Most days this week…”
  String _transportMode = 'car';
  double _avgDistance = 10;
  int _electricityProxy = 1; // quiet/normal/loud
  double _acHours = 2;
  String _dietType = 'veg';
  int _mealsCount = 3;
  bool _wasteSegregation = true;
  final Set<String> _ecoActions = {};

  bool _didPrefill = false;

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(dashboardHomeProvider);
    final todayTasks = ref.watch(todayTasksProvider);

    if (!_didPrefill) {
      dashboard.whenData((home) {
        if (_didPrefill) return;
        final d = home.onboardingDefaults;
        if (d != null) {
          setState(() {
            _transportMode = d.transportMode;
            _avgDistance = d.avgDailyDistanceKm.toDouble();
            _acHours = d.acHoursPerDay.toDouble();
            _dietType = d.dietType;
            _mealsCount = d.mealsPerDay;
          });
        }
        _didPrefill = true;
      });
    }

    final ecoActionOptions = todayTasks.maybeWhen(
      data: (r) => r.tasks.where((t) => t.category == 'eco_action').toList(),
      orElse: () => const <TaskItem>[],
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Weekly reflection')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            children: [
              SizedBox(
                height: 120,
                child: LottieBuilder.asset(
                  LottieAssets.inputHeader,
                  repeat: true,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Not a copy of your days — a summary layer.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView(
                  children: [
                    _sectionTitle(context, 'Most days this week…'),
                    const SizedBox(height: 10),
                    _q(context, 'Which wheels carried you most?'),
                    const SizedBox(height: 10),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'car', label: Text('Car')),
                        ButtonSegment(value: 'bike', label: Text('Bike')),
                        ButtonSegment(value: 'bus', label: Text('Bus')),
                        ButtonSegment(value: 'metro', label: Text('Metro')),
                        ButtonSegment(value: 'walk', label: Text('Walk')),
                      ],
                      selected: {_transportMode},
                      onSelectionChanged:
                          _submitting ? null : (s) => setState(() => _transportMode = s.first),
                    ),
                    const SizedBox(height: 18),
                    _q(context, 'How far did your routine stretch (per day)?'),
                    const SizedBox(height: 8),
                    _label(context, '${_avgDistance.round()} km / day'),
                    Slider(
                      value: _avgDistance,
                      min: 0,
                      max: 200,
                      divisions: 200,
                      label: '${_avgDistance.round()}',
                      onChanged: _submitting ? null : (v) => setState(() => _avgDistance = v),
                    ),
                    const SizedBox(height: 18),
                    _q(context, 'Was the switchboard quiet or loud?'),
                    const SizedBox(height: 10),
                    SegmentedButton<int>(
                      segments: const [
                        ButtonSegment(value: 0, label: Text('Quiet')),
                        ButtonSegment(value: 1, label: Text('Normal')),
                        ButtonSegment(value: 2, label: Text('Loud')),
                      ],
                      selected: {_electricityProxy},
                      onSelectionChanged:
                          _submitting ? null : (s) => setState(() => _electricityProxy = s.first),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'We anchor this to your monthly baseline from onboarding.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                    const SizedBox(height: 18),
                    _q(context, 'How long did the cool air run (most days)?'),
                    const SizedBox(height: 8),
                    _label(context, '${_acHours.round()} hours / day'),
                    Slider(
                      value: _acHours,
                      min: 0,
                      max: 24,
                      divisions: 24,
                      label: '${_acHours.round()}',
                      onChanged: _submitting ? null : (v) => setState(() => _acHours = v),
                    ),
                    const SizedBox(height: 18),
                    _q(context, 'What was the usual mood on your plate?'),
                    const SizedBox(height: 10),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'veg', label: Text('Veg')),
                        ButtonSegment(value: 'non_veg', label: Text('Non-veg')),
                        ButtonSegment(value: 'mixed', label: Text('Mixed')),
                      ],
                      selected: {_dietType},
                      onSelectionChanged:
                          _submitting ? null : (s) => setState(() => _dietType = s.first),
                    ),
                    const SizedBox(height: 18),
                    _q(context, 'How many meals did a typical day hold?'),
                    const SizedBox(height: 8),
                    _stepper(
                      context,
                      value: _mealsCount,
                      min: 1,
                      max: 6,
                      unit: 'meals',
                      onChanged: _submitting ? null : (v) => setState(() => _mealsCount = v),
                    ),
                    const SizedBox(height: 18),
                    _q(context, 'Did you sort before you tossed (most days)?'),
                    const SizedBox(height: 10),
                    SwitchListTile.adaptive(
                      contentPadding: EdgeInsets.zero,
                      value: _wasteSegregation,
                      onChanged: _submitting ? null : (v) => setState(() => _wasteSegregation = v),
                      title: Text(_wasteSegregation ? 'Yes' : 'No'),
                    ),
                    const SizedBox(height: 18),
                    _q(context, 'Which green moves showed up more than once?'),
                    const SizedBox(height: 10),
                    if (ecoActionOptions.isEmpty)
                      Text(
                        'No eco actions available right now.',
                        style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                      )
                    else
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          for (final t in ecoActionOptions)
                            FilterChip(
                              label: Text(t.title),
                              selected: _ecoActions.contains(t.taskId),
                              onSelected: _submitting
                                  ? null
                                  : (on) => setState(() {
                                        if (on) {
                                          _ecoActions.add(t.taskId);
                                        } else {
                                          _ecoActions.remove(t.taskId);
                                        }
                                      }),
                            ),
                        ],
                      ),
                  ],
                ),
              ),
              if (_errorText != null) ...[
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    _errorText!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ),
              ],
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _submitting ? null : () => _submit(dashboard),
                  child: Text(_submitting ? 'Submitting…' : 'Submit weekly'),
                ),
              ),
              const SizedBox(height: 6),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit(AsyncValue<DashboardHome> dashboard) async {
    setState(() {
      _submitting = true;
      _errorText = null;
    });

    final prefs = LifestylePrefs();
    final today = todayIstYyyyMmDd();

    // Duplicate guard: local + dashboard lane.
    final localLast = await prefs.readLastWeeklyLogYmd();
    final dashLast = dashboard.maybeWhen(data: (h) => h.weeklyInsights.lastWeeklySubmissionDate, orElse: () => null);
    if (localLast == today || dashLast == today) {
      setState(() {
        _submitting = false;
        _errorText = 'Weekly log already submitted for today.';
      });
      return;
    }

    final monthlyUnits = await prefs.readElectricityUnitsPerMonth();
    final monthlyWasteBags = await prefs.readWasteBagsPerMonth();
    final baseUnitsPerDay = monthlyUnits == null ? 6 : (monthlyUnits / 30).round().clamp(0, 60);
    final proxyMultiplier = switch (_electricityProxy) { 0 => 0.7, 1 => 1.0, _ => 1.3 };
    final electricityUnits = (baseUnitsPerDay * proxyMultiplier).round().clamp(0, 80);
    final baseWasteBagsPerDay = monthlyWasteBags == null ? 1 : (monthlyWasteBags / 30).ceil().clamp(0, 10);

    final payload = ActivityPayload(
      date: today,
      transportMode: _transportMode,
      transportDistance: _avgDistance.round(),
      electricityUnits: electricityUnits,
      acHours: _acHours.round(),
      dietType: _dietType,
      mealsCount: _mealsCount,
      wasteSegregation: _wasteSegregation,
      wasteBagsUsed: baseWasteBagsPerDay,
      ecoActions: _ecoActions.toList(growable: false),
    );

    try {
      final repo = ref.read(activityRepositoryProvider);
      final result = await repo.submitWeekly(payload);

      if (!mounted) return;
      await prefs.writeLastWeeklyLogYmd(today);

      ref.invalidate(dashboardHomeProvider);
      ref.invalidate(todayTasksProvider);

      if (!context.mounted) return;
      await showCelebrationDialog(
        context,
        title: 'Week Saved!',
        subtitle: result.totalEmission != null
            ? '${result.totalEmission!.toStringAsFixed(1)} kg CO\u2082 estimated this week'
            : 'Your weekly reflection has been recorded.',
        actionLabel: 'Continue',
      );

      if (!mounted) return;
      context.go('/shell/dashboard');
    } catch (e) {
      final api = e is ApiError ? e : ApiError.fromDio(e);
      setState(() => _errorText = api.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Text _sectionTitle(BuildContext context, String text) {
    return Text(
      text,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
    );
  }

  Text _q(BuildContext context, String text) {
    return Text(
      text,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
          ),
    );
  }

  Widget _label(BuildContext context, String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }

  Widget _stepper(
    BuildContext context, {
    required int value,
    required int min,
    required int max,
    required String unit,
    required ValueChanged<int>? onChanged,
  }) {
    return Row(
      children: [
        IconButton(
          onPressed: (onChanged == null || value <= min) ? null : () => onChanged(value - 1),
          icon: const Icon(Icons.remove_circle_outline),
        ),
        Expanded(
          child: Center(
            child: Text(
              '$value $unit',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
            ),
          ),
        ),
        IconButton(
          onPressed: (onChanged == null || value >= max) ? null : () => onChanged(value + 1),
          icon: const Icon(Icons.add_circle_outline),
        ),
      ],
    );
  }
}

