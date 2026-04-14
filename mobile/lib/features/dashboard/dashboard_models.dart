class DashboardHome {
  DashboardHome({
    required this.user,
    required this.streakDays,
    required this.todayEmission,
    required this.aqi,
    required this.tasksProgress,
    required this.performance,
    required this.onboardingCompleted,
    required this.onboardingDefaults,
    required this.projectionNext30Days,
  });

  final DashboardUser user;
  final int streakDays;
  final TodayEmission? todayEmission;
  final AqiReading? aqi;
  final TasksProgress? tasksProgress;
  final PerformanceMetrics performance;
  final bool onboardingCompleted;
  final OnboardingDefaultsLite? onboardingDefaults;
  final List<double>? projectionNext30Days;

  factory DashboardHome.fromJson(Map<String, dynamic> json) {
    return DashboardHome(
      user: DashboardUser.fromJson(
        (json['user'] ?? const {}) as Map<String, dynamic>,
      ),
      streakDays: ((json['streak'] ?? const {}) as Map<String, dynamic>)['streak_days']
              as int? ??
          0,
      todayEmission: json['today_emission'] == null
          ? null
          : TodayEmission.fromJson(
              json['today_emission'] as Map<String, dynamic>,
            ),
      aqi: json['aqi'] == null
          ? null
          : AqiReading.fromJson(json['aqi'] as Map<String, dynamic>),
      tasksProgress: json['tasks_progress'] == null
          ? null
          : TasksProgress.fromJson(
              json['tasks_progress'] as Map<String, dynamic>,
            ),
      performance: PerformanceMetrics.fromJson(
        (json['performance_metrics'] ?? const {}) as Map<String, dynamic>,
      ),
      onboardingCompleted: json['onboarding_completed'] as bool? ?? true,
      onboardingDefaults: json['onboarding_defaults'] == null
          ? null
          : OnboardingDefaultsLite.fromJson(
              json['onboarding_defaults'] as Map<String, dynamic>,
            ),
      projectionNext30Days: _parseProjection30(json['projection']),
    );
  }

  static List<double>? _parseProjection30(Object? projection) {
    if (projection is Map<String, dynamic>) {
      final next30 = projection['next_30_days'];
      if (next30 is List) {
        final values = <double>[];
        for (final item in next30) {
          if (item is num) values.add(item.toDouble());
          if (item is Map<String, dynamic>) {
            final v = item['value'];
            if (v is num) values.add(v.toDouble());
          }
        }
        return values.isEmpty ? null : values;
      }
    }
    return null;
  }
}

class OnboardingDefaultsLite {
  OnboardingDefaultsLite({
    required this.transportMode,
    required this.avgDailyDistanceKm,
    required this.electricityUnitsPerDay,
    required this.acHoursPerDay,
    required this.dietType,
    required this.mealsPerDay,
    required this.wasteBagsPerDay,
  });

  final String transportMode;
  final int avgDailyDistanceKm;
  final int electricityUnitsPerDay;
  final int acHoursPerDay;
  final String dietType;
  final int mealsPerDay;
  final int wasteBagsPerDay;

  factory OnboardingDefaultsLite.fromJson(Map<String, dynamic> json) {
    return OnboardingDefaultsLite(
      transportMode: (json['transport_mode'] ?? 'car') as String,
      avgDailyDistanceKm: (json['avg_daily_distance_km'] as num?)?.toInt() ?? 15,
      electricityUnitsPerDay:
          (json['electricity_units_per_day'] as num?)?.toInt() ?? 5,
      acHoursPerDay: (json['ac_hours_per_day'] as num?)?.toInt() ?? 2,
      dietType: (json['diet_type'] ?? 'veg') as String,
      mealsPerDay: (json['meals_per_day'] as num?)?.toInt() ?? 3,
      wasteBagsPerDay: (json['waste_bags_per_day'] as num?)?.toInt() ?? 1,
    );
  }
}

class DashboardUser {
  DashboardUser({
    required this.name,
    required this.email,
    required this.city,
    required this.role,
    required this.profilePictureUrl,
  });

  final String name;
  final String email;
  final String city;
  final String role;
  final String? profilePictureUrl;

  factory DashboardUser.fromJson(Map<String, dynamic> json) {
    return DashboardUser(
      name: (json['name'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      city: (json['city'] ?? '') as String,
      role: (json['role'] ?? '') as String,
      profilePictureUrl: json['profile_picture_url'] as String?,
    );
  }
}

class TodayEmission {
  TodayEmission({required this.total, required this.breakdown});

  final double total;
  final Map<String, double> breakdown;

  factory TodayEmission.fromJson(Map<String, dynamic> json) {
    final breakdown = <String, double>{};
    final b = json['breakdown'];
    if (b is Map<String, dynamic>) {
      for (final entry in b.entries) {
        final v = entry.value;
        if (v is num) breakdown[entry.key] = v.toDouble();
      }
    }
    return TodayEmission(
      total: (json['total_emission'] as num?)?.toDouble() ?? 0,
      breakdown: breakdown,
    );
  }
}

class AqiReading {
  AqiReading({
    required this.aqi,
    required this.city,
    required this.pm25,
    required this.pm10,
    required this.no2,
    required this.so2,
    required this.co,
  });

  final int aqi;
  final String city;
  final double pm25;
  final double pm10;
  final double no2;
  final double so2;
  final double co;

  factory AqiReading.fromJson(Map<String, dynamic> json) {
    return AqiReading(
      aqi: (json['aqi'] as num?)?.toInt() ?? 0,
      city: (json['city'] ?? '') as String,
      pm25: (json['pm25'] as num?)?.toDouble() ?? 0,
      pm10: (json['pm10'] as num?)?.toDouble() ?? 0,
      no2: (json['no2'] as num?)?.toDouble() ?? 0,
      so2: (json['so2'] as num?)?.toDouble() ?? 0,
      co: (json['co'] as num?)?.toDouble() ?? 0,
    );
  }
}

class TasksProgress {
  TasksProgress({
    required this.completed,
    required this.pending,
    required this.total,
    required this.completionRate,
  });

  final int completed;
  final int pending;
  final int total;
  final double completionRate;

  factory TasksProgress.fromJson(Map<String, dynamic> json) {
    return TasksProgress(
      completed: (json['completed'] as num?)?.toInt() ?? 0,
      pending: (json['pending'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
      completionRate: (json['completion_rate'] as num?)?.toDouble() ?? 0,
    );
  }
}

class PerformanceMetrics {
  PerformanceMetrics({
    required this.baselineEmission,
    required this.baselineStatus,
    required this.currentAvgEmission,
    required this.reductionPercent,
  });

  final double baselineEmission;
  final String baselineStatus;
  final double currentAvgEmission;
  final double reductionPercent;

  factory PerformanceMetrics.fromJson(Map<String, dynamic> json) {
    return PerformanceMetrics(
      baselineEmission: (json['baseline_emission'] as num?)?.toDouble() ?? 0,
      baselineStatus: (json['baseline_status'] ?? '') as String,
      currentAvgEmission: (json['current_avg_emission'] as num?)?.toDouble() ?? 0,
      reductionPercent: (json['reduction_percent'] as num?)?.toDouble() ?? 0,
    );
  }
}

