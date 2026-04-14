import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../core/api/api_error.dart';
import '../../core/lottie/lottie_assets.dart';
import '../dashboard/dashboard_controller.dart';
import '../tasks/tasks_controller.dart';
import '../tasks/tasks_models.dart';
import 'activity_models.dart';
import 'activity_repository.dart';
import 'ist_date.dart';

enum ActivityType { daily, weekly }

class ActivityWizardScreen extends ConsumerStatefulWidget {
  const ActivityWizardScreen({super.key, required this.type});

  final ActivityType type;

  @override
  ConsumerState<ActivityWizardScreen> createState() => _ActivityWizardScreenState();
}

class _ActivityWizardScreenState extends ConsumerState<ActivityWizardScreen> {
  int _page = 0;
  bool _submitting = false;
  String? _errorText;

  // Defaults (will be overwritten if onboarding_defaults exists)
  String _transportMode = 'car';
  double _transportDistance = 10;
  double _electricityUnits = 5;
  double _acHours = 2;
  String _dietType = 'veg';
  int _mealsCount = 3;
  bool _wasteSegregation = true;
  int _wasteBagsUsed = 1;
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
            _transportDistance = d.avgDailyDistanceKm.toDouble();
            _electricityUnits = d.electricityUnitsPerDay.toDouble();
            _acHours = d.acHoursPerDay.toDouble();
            _dietType = d.dietType;
            _mealsCount = d.mealsPerDay;
            _wasteBagsUsed = d.wasteBagsPerDay;
          });
        }
        _didPrefill = true;
      });
    }

    final title = widget.type == ActivityType.daily ? 'Daily Log' : 'Weekly Log';
    final subtitle = widget.type == ActivityType.daily
        ? 'Tell us about today.'
        : 'Looking back at your week…';

    final ecoActionOptions = todayTasks.maybeWhen(
      data: (r) => r.tasks.where((t) => t.category == 'eco_action').toList(),
      orElse: () => const <TaskItem>[],
    );

    final headerLottie = LottieAssets.inputHeader;

    return Scaffold(
      appBar: AppBar(
        title: Text('$title (${_page + 1}/5)'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            children: [
              SizedBox(
                height: 140,
                child: LottieBuilder.asset(
                  headerLottie,
                  repeat: true,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: _pageBody(context, ecoActionOptions),
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
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _submitting || _page == 0
                          ? null
                          : () => setState(() => _page -= 1),
                      child: const Text('Back'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: _submitting
                          ? null
                          : () async {
                              if (_page < 4) {
                                setState(() => _page += 1);
                                return;
                              }
                              await _submit();
                            },
                      child: Text(
                        _page < 4 ? 'Next' : (_submitting ? 'Submitting…' : 'Submit'),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
            ],
          ),
        ),
      ),
    );
  }

  Widget _pageBody(BuildContext context, List<TaskItem> ecoActionOptions) {
    return switch (_page) {
      0 => _movePage(context),
      1 => _powerPage(context),
      2 => _platePage(context),
      3 => _tossPage(context),
      _ => _greenPage(context, ecoActionOptions),
    };
  }

  Widget _movePage(BuildContext context) {
    return ListView(
      children: [
        _q(context, 'How did you travel today?'),
        const SizedBox(height: 10),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'car', label: Text('🚗 Car')),
            ButtonSegment(value: 'bike', label: Text('🏍️ Bike')),
            ButtonSegment(value: 'bus', label: Text('🚌 Bus')),
            ButtonSegment(value: 'metro', label: Text('🚇 Metro')),
            ButtonSegment(value: 'walk', label: Text('🚶 Walk')),
          ],
          selected: {_transportMode},
          onSelectionChanged:
              _submitting ? null : (s) => setState(() => _transportMode = s.first),
        ),
        const SizedBox(height: 18),
        _q(context, 'How far did the road take you?'),
        const SizedBox(height: 8),
        _label(context, '${_transportDistance.round()} km'),
        Slider(
          value: _transportDistance,
          min: 0,
          max: 200,
          divisions: 200,
          label: '${_transportDistance.round()}',
          onChanged: _submitting ? null : (v) => setState(() => _transportDistance = v),
        ),
      ],
    );
  }

  Widget _powerPage(BuildContext context) {
    return ListView(
      children: [
        _q(context, 'How many units lit up your day?'),
        const SizedBox(height: 8),
        _label(context, '${_electricityUnits.round()} kWh'),
        Slider(
          value: _electricityUnits,
          min: 0,
          max: 50,
          divisions: 50,
          label: '${_electricityUnits.round()}',
          onChanged: _submitting ? null : (v) => setState(() => _electricityUnits = v),
        ),
        Text(
          'Tip: 1 unit = 1 kWh',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 18),
        _q(context, 'How long did the cool air flow?'),
        const SizedBox(height: 8),
        _label(context, '${_acHours.round()} hours'),
        Slider(
          value: _acHours,
          min: 0,
          max: 24,
          divisions: 24,
          label: '${_acHours.round()}',
          onChanged: _submitting ? null : (v) => setState(() => _acHours = v),
        ),
      ],
    );
  }

  Widget _platePage(BuildContext context) {
    return ListView(
      children: [
        _q(context, 'What was the vibe on your plate?'),
        const SizedBox(height: 10),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'veg', label: Text('🥗 Veg')),
            ButtonSegment(value: 'non_veg', label: Text('🍖 Non-Veg')),
            ButtonSegment(value: 'mixed', label: Text('🥘 Mixed')),
          ],
          selected: {_dietType},
          onSelectionChanged:
              _submitting ? null : (s) => setState(() => _dietType = s.first),
        ),
        const SizedBox(height: 18),
        _q(context, 'How many meals today?'),
        const SizedBox(height: 8),
        _stepper(
          context,
          value: _mealsCount,
          min: 1,
          max: 6,
          unit: 'meals',
          onChanged: _submitting ? null : (v) => setState(() => _mealsCount = v),
        ),
      ],
    );
  }

  Widget _tossPage(BuildContext context) {
    return ListView(
      children: [
        _q(context, 'Did you sort before you tossed?'),
        const SizedBox(height: 10),
        SwitchListTile.adaptive(
          contentPadding: EdgeInsets.zero,
          value: _wasteSegregation,
          onChanged: _submitting ? null : (v) => setState(() => _wasteSegregation = v),
          title: Text(_wasteSegregation ? 'Yes' : 'No'),
        ),
        const SizedBox(height: 18),
        _q(context, 'How many bags went out?'),
        const SizedBox(height: 8),
        _stepper(
          context,
          value: _wasteBagsUsed,
          min: 0,
          max: 10,
          unit: 'bags',
          onChanged: _submitting ? null : (v) => setState(() => _wasteBagsUsed = v),
        ),
        const SizedBox(height: 8),
        Text(
          '1 bag ≈ 1 kg',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
      ],
    );
  }

  Widget _greenPage(BuildContext context, List<TaskItem> options) {
    final cs = Theme.of(context).colorScheme;

    return ListView(
      children: [
        _q(context, 'Any green moves today?'),
        const SizedBox(height: 10),
        if (options.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  SizedBox(
                    height: 46,
                    width: 46,
                    child: LottieBuilder.asset(
                      LottieAssets.empty,
                      repeat: true,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'No eco actions available right now.',
                      style: TextStyle(color: cs.onSurfaceVariant),
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              for (final t in options)
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
        const SizedBox(height: 18),
        Text(
          'We use this to personalize tasks.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: cs.onSurfaceVariant,
              ),
        ),
      ],
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
          onPressed: (onChanged == null || value <= min)
              ? null
              : () => onChanged(value - 1),
          icon: const Icon(Icons.remove_circle_outline),
        ),
        Expanded(
          child: Center(
            child: Text(
              '$value $unit',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
          ),
        ),
        IconButton(
          onPressed: (onChanged == null || value >= max)
              ? null
              : () => onChanged(value + 1),
          icon: const Icon(Icons.add_circle_outline),
        ),
      ],
    );
  }

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _errorText = null;
    });

    final payload = ActivityPayload(
      date: todayIstYyyyMmDd(),
      transportMode: _transportMode,
      transportDistance: _transportDistance.round(),
      electricityUnits: _electricityUnits.round(),
      acHours: _acHours.round(),
      dietType: _dietType,
      mealsCount: _mealsCount,
      wasteSegregation: _wasteSegregation,
      wasteBagsUsed: _wasteBagsUsed,
      ecoActions: _ecoActions.toList(growable: false),
    );

    try {
      final repo = ref.read(activityRepositoryProvider);
      final result = widget.type == ActivityType.daily
          ? await repo.submitDaily(payload)
          : await repo.submitWeekly(payload);

      if (!mounted) return;

      // Refresh dashboard + tasks after submission.
      ref.invalidate(dashboardHomeProvider);
      ref.invalidate(todayTasksProvider);

      await showDialog<void>(
        context: context,
        barrierDismissible: true,
        builder: (_) => AlertDialog(
          title: const Text('Success'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                height: 120,
                width: 120,
                child: LottieBuilder.asset(
                  LottieAssets.success,
                  repeat: false,
                  fit: BoxFit.contain,
                ),
              ),
              if (result.totalEmission != null)
                Text('${result.totalEmission!.toStringAsFixed(1)} kg CO₂ logged'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Done'),
            ),
          ],
        ),
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
}

