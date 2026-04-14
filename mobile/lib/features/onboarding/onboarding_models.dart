class OnboardingDefaults {
  const OnboardingDefaults({
    required this.transportMode,
    required this.avgDailyDistanceKm,
    required this.electricityUnitsPerDay,
    required this.acHoursPerDay,
    required this.dietType,
    required this.mealsPerDay,
    required this.wasteBagsPerDay,
  });

  final String transportMode; // car | bike | bus | metro | walk
  final int avgDailyDistanceKm; // 0–100
  final int electricityUnitsPerDay; // 0–30 (kWh)
  final int acHoursPerDay; // 0–24
  final String dietType; // veg | non_veg | mixed
  final int mealsPerDay; // 1–6
  final int wasteBagsPerDay; // 0–10

  Map<String, dynamic> toJson() => {
        'transport_mode': transportMode,
        'avg_daily_distance_km': avgDailyDistanceKm,
        'electricity_units_per_day': electricityUnitsPerDay,
        'ac_hours_per_day': acHoursPerDay,
        'diet_type': dietType,
        'meals_per_day': mealsPerDay,
        'waste_bags_per_day': wasteBagsPerDay,
      };
}

