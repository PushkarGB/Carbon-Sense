import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../core/lottie/lottie_assets.dart';
import '../../core/api/api_error.dart';
import '../../core/preferences/lifestyle_prefs.dart';
import '../activity/ist_date.dart';
import 'onboarding_models.dart';
import 'onboarding_repository.dart';

class OnboardingFlowScreen extends ConsumerStatefulWidget {
  const OnboardingFlowScreen({super.key});

  @override
  ConsumerState<OnboardingFlowScreen> createState() =>
      _OnboardingFlowScreenState();
}

class _OnboardingFlowScreenState extends ConsumerState<OnboardingFlowScreen> {
  int _step = 0;

  String _transportMode = 'car';
  double _avgDailyDistance = 15;

  double _electricityUnitsPerMonth = 150;
  double _acHours = 2;

  String _dietType = 'veg';
  int _mealsPerDay = 3;

  int _wasteBagsPerMonth = 30;

  bool _submitting = false;
  String? _errorText;

  Future<void> _finish() async {
    setState(() {
      _submitting = true;
      _errorText = null;
    });

    final yyyyMm = todayIstYyyyMm();

    final monthlyKwh = _electricityUnitsPerMonth.round().clamp(0, 2000);
    final monthlyWasteBags = _wasteBagsPerMonth.clamp(0, 300);

    // Backend expects per-day defaults; derive from monthly inputs.
    final electricityPerDay = (monthlyKwh / 30).round().clamp(0, 60);
    final wasteBagsPerDay = (monthlyWasteBags / 30).ceil().clamp(0, 10);

    final defaults = OnboardingDefaults(
      transportMode: _transportMode,
      avgDailyDistanceKm: _avgDailyDistance.round(),
      electricityUnitsPerDay: electricityPerDay,
      acHoursPerDay: _acHours.round(),
      dietType: _dietType,
      mealsPerDay: _mealsPerDay,
      wasteBagsPerDay: wasteBagsPerDay,
    );

    try {
      await ref.read(onboardingRepositoryProvider).complete(defaults);
      final prefs = LifestylePrefs();
      await prefs.writeElectricityUnitsPerMonth(monthlyKwh, updatedYyyyMm: yyyyMm);
      await prefs.writeWasteBagsPerMonth(monthlyWasteBags, updatedYyyyMm: yyyyMm);
      if (!mounted) return;
      context.go('/shell/dashboard');
    } catch (e) {
      final apiError = e is ApiError ? e : ApiError.fromDio(e);
      setState(() {
        _errorText = apiError.message;
      });
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final header = switch (_step) {
      0 => (LottieAssets.onboardingTravel, 'Travel'),
      1 => (LottieAssets.onboardingEnergy, 'Energy'),
      2 => (LottieAssets.onboardingFood, 'Food'),
      _ => (LottieAssets.onboardingWaste, 'Waste'),
    };

    final questions = switch (_step) {
      0 => _travelStep(context),
      1 => _energyStep(context),
      2 => _foodStep(context),
      _ => _wasteStep(context),
    };

    return Scaffold(
      appBar: AppBar(
        title: Text('Onboarding (${_step + 1}/4)'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            children: [
              SizedBox(
                height: 170,
                child: LottieBuilder.asset(
                  header.$1,
                  repeat: true,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                header.$2,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: questions,
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
                      onPressed:
                          _submitting || _step == 0
                              ? null
                              : () => setState(() => _step -= 1),
                      child: const Text('Back'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: _submitting
                          ? null
                          : () async {
                              if (_step < 3) {
                                setState(() => _step += 1);
                                return;
                              }
                              await _finish();
                            },
                      child: Text(
                        _step < 3 ? 'Next' : (_submitting ? 'Saving…' : 'Finish'),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _travelStep(BuildContext context) {
    return ListView(
      children: [
        _questionTitle(context, 'Most days, what carries you?'),
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
        _questionTitle(context, 'How far does a typical day stretch? (km)'),
        const SizedBox(height: 8),
        _sliderLabel(context, '${_avgDailyDistance.round()} km'),
        Slider(
          value: _avgDailyDistance,
          min: 0,
          max: 100,
          divisions: 100,
          label: '${_avgDailyDistance.round()}',
          onChanged: _submitting ? null : (v) => setState(() => _avgDailyDistance = v),
        ),
      ],
    );
  }

  Widget _energyStep(BuildContext context) {
    return ListView(
      children: [
        _questionTitle(context, 'What does your meter whisper in a month?'),
        const SizedBox(height: 8),
        _sliderLabel(context, '${_electricityUnitsPerMonth.round()} units / month'),
        Slider(
          value: _electricityUnitsPerMonth,
          min: 0,
          max: 1200,
          divisions: 120,
          label: '${_electricityUnitsPerMonth.round()}',
          onChanged: _submitting ? null : (v) => setState(() => _electricityUnitsPerMonth = v),
        ),
        Text(
          'Tip: “unit” = kWh (from your electricity bill). We’ll spread it across days.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 18),
        _questionTitle(context, 'On a typical day, how long does the cool breeze run? (hours/day)'),
        const SizedBox(height: 8),
        _sliderLabel(context, '${_acHours.round()} hours'),
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

  Widget _foodStep(BuildContext context) {
    return ListView(
      children: [
        _questionTitle(context, "Most days, what’s on your plate?"),
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
        _questionTitle(context, 'How many meals does a typical day hold?'),
        const SizedBox(height: 8),
        _stepperRow(
          context,
          value: _mealsPerDay,
          min: 1,
          max: 6,
          unit: 'meals',
          onChanged: _submitting ? null : (v) => setState(() => _mealsPerDay = v),
        ),
      ],
    );
  }

  Widget _wasteStep(BuildContext context) {
    return ListView(
      children: [
        _questionTitle(context, 'How many waste bags leave in a month?'),
        const SizedBox(height: 8),
        _stepperRow(
          context,
          value: _wasteBagsPerMonth,
          min: 0,
          max: 300,
          unit: 'bags / month',
          onChanged: _submitting ? null : (v) => setState(() => _wasteBagsPerMonth = v),
        ),
        const SizedBox(height: 8),
        Text(
          'Rough estimate is fine. We’ll turn this into a daily average internally.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
      ],
    );
  }

  Widget _questionTitle(BuildContext context, String text) {
    return Text(
      text,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
    );
  }

  Widget _sliderLabel(BuildContext context, String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
      ),
    );
  }

  Widget _stepperRow(
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
                    fontWeight: FontWeight.w700,
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
}

