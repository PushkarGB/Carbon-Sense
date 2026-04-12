import {
  calculateDailyEmission,
  EmissionFactorValues,
  evaluateTaskCompletion,
} from './activity.logic';

describe('activity logic', () => {
  const emissionFactors: EmissionFactorValues = {
    electricity: 0.71,
    transport_bike: 0.02,
    transport_bus: 0.08,
    transport_car: 0.12,
    transport_metro: 0.03,
    transport_walk: 0,
  };

  it('calculates daily emissions using the locked contract', () => {
    const result = calculateDailyEmission(
      {
        date: '2026-04-12',
        eco_actions: ['eco_bag'],
        electricity: {
          ac_hours: 2,
          units_consumed: 10,
        },
        food: {
          diet_type: 'mixed',
          meals_count: 4,
        },
        transport: {
          distance: 10,
          mode: 'car',
        },
        waste: {
          bags_used: 2,
          segregation: true,
        },
      },
      emissionFactors,
    );

    expect(result.breakdown.electricity).toBeCloseTo(7.1);
    expect(result.breakdown.transport).toBeCloseTo(1.2);
    expect(result.breakdown.food).toBeCloseTo(9);
    expect(result.breakdown.waste).toBeCloseTo(1);
    expect(result.totalEmission).toBeCloseTo(18.3);
  });

  it('evaluates the finalized submission-time task rules', () => {
    const baseContext = {
      activity: {
        date: '2026-04-12',
        eco_actions: [],
        electricity: {
          ac_hours: 3,
          units_consumed: 5,
        },
        food: {
          diet_type: 'veg' as const,
          meals_count: 2,
        },
        transport: {
          distance: 4,
          mode: 'walk' as const,
        },
        waste: {
          bags_used: 1,
          segregation: true,
        },
      },
      baselineEmission: 20,
      currentAverageEmission: 12,
      latestEmission: 10,
      profileAverageAcHours: 4,
      profileAverageDistance: 8,
      recentVehicleDistanceAverage: 6,
      yesterdayEmission: 11,
    };

    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'daily_input' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'hybrid', task_id: 'ac_reduce' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'hybrid', task_id: 'fuel_save' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'hybrid', task_id: 'short_trip_replace' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'hybrid', task_id: 'transport_walk' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'beat_yesterday' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'below_average' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'low_impact_day' },
        baseContext,
      ),
    ).toBe(true);

    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'transport_public' },
        {
          ...baseContext,
          activity: {
            ...baseContext.activity,
            transport: {
              distance: 10,
              mode: 'bus',
            },
          },
        },
      ),
    ).toBe(true);
  });

  it('does not complete guarded tasks when their documented baselines are missing', () => {
    const context = {
      activity: {
        date: '2026-04-12',
        eco_actions: [],
        electricity: {
          ac_hours: 5,
          units_consumed: 5,
        },
        food: {
          diet_type: 'veg' as const,
          meals_count: 2,
        },
        transport: {
          distance: 3,
          mode: 'walk' as const,
        },
        waste: {
          bags_used: 1,
          segregation: false,
        },
      },
      baselineEmission: 0,
      currentAverageEmission: 0,
      latestEmission: 6,
      profileAverageAcHours: 2,
      profileAverageDistance: 2,
      recentVehicleDistanceAverage: 0,
      yesterdayEmission: 0,
    };

    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'beat_yesterday' },
        context,
      ),
    ).toBe(false);
    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'below_average' },
        context,
      ),
    ).toBe(false);
    expect(
      evaluateTaskCompletion(
        { completion_type: 'auto', task_id: 'low_impact_day' },
        context,
      ),
    ).toBe(false);
    expect(
      evaluateTaskCompletion(
        { completion_type: 'hybrid', task_id: 'short_trip_replace' },
        context,
      ),
    ).toBe(false);
  });
});
