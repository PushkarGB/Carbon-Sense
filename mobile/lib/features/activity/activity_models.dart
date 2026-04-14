class ActivityPayload {
  ActivityPayload({
    required this.date,
    required this.transportMode,
    required this.transportDistance,
    required this.electricityUnits,
    required this.acHours,
    required this.dietType,
    required this.mealsCount,
    required this.wasteSegregation,
    required this.wasteBagsUsed,
    required this.ecoActions,
  });

  final String date; // YYYY-MM-DD (IST)
  final String transportMode; // car | bike | bus | metro | walk
  final int transportDistance; // km
  final int electricityUnits; // kWh
  final int acHours; // hours
  final String dietType; // veg | non_veg | mixed
  final int mealsCount;
  final bool wasteSegregation;
  final int wasteBagsUsed;
  final List<String> ecoActions; // task ids like eco_bag

  Map<String, dynamic> toJson() => {
        'date': date,
        'transport': {'mode': transportMode, 'distance': transportDistance},
        'electricity': {'units_consumed': electricityUnits, 'ac_hours': acHours},
        'food': {'diet_type': dietType, 'meals_count': mealsCount},
        'waste': {'segregation': wasteSegregation, 'bags_used': wasteBagsUsed},
        'eco_actions': ecoActions,
      };
}

class ActivitySubmitResult {
  ActivitySubmitResult({
    required this.completedTaskIds,
    required this.totalEmission,
  });

  final List<String> completedTaskIds;
  final double? totalEmission;

  factory ActivitySubmitResult.fromJson(Map<String, dynamic> json) {
    final completed = <String>[];
    final ids = json['completed_task_ids'];
    if (ids is List) {
      for (final id in ids) {
        if (id is String) completed.add(id);
      }
    }
    final emission = json['emission'];
    double? total;
    if (emission is Map<String, dynamic>) {
      final v = emission['total_emission'];
      if (v is num) total = v.toDouble();
    }
    return ActivitySubmitResult(completedTaskIds: completed, totalEmission: total);
  }
}

