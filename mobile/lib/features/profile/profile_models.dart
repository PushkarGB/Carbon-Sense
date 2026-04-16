class ProfileResponse {
  ProfileResponse({
    required this.user,
    required this.summary,
    required this.badges,
    required this.performance,
  });

  final ProfileUser user;
  final ProfileSummary summary;
  final List<BadgeItem> badges;
  final PerformanceMetricsLite performance;

  factory ProfileResponse.fromJson(Map<String, dynamic> json) {
    final badges = <BadgeItem>[];
    final b = json['badges'];
    if (b is List) {
      for (final item in b) {
        if (item is Map<String, dynamic>) badges.add(BadgeItem.fromJson(item));
      }
    }

    final profile =
        (json['profile'] ?? const <String, dynamic>{}) as Map<String, dynamic>;
    final profilePerf =
        (profile['performance_metrics'] ?? const <String, dynamic>{})
            as Map<String, dynamic>;
    final profileStreak = (profile['streak_days'] as num?)?.toInt() ?? 0;

    return ProfileResponse(
      user: ProfileUser.fromJson(
        (json['user'] ?? const {}) as Map<String, dynamic>,
      ),
      summary: ProfileSummary.fromJson(
        (json['summary'] ?? const {}) as Map<String, dynamic>,
        fallbackStreakDays: profileStreak,
      ),
      badges: badges,
      performance: PerformanceMetricsLite.fromJson(profilePerf),
    );
  }
}

class ProfileUser {
  ProfileUser({
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

  factory ProfileUser.fromJson(Map<String, dynamic> json) {
    return ProfileUser(
      name: (json['name'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      city: (json['city'] ?? '') as String,
      role: (json['role'] ?? '') as String,
      profilePictureUrl: json['profile_picture_url'] as String?,
    );
  }
}

class ProfileSummary {
  ProfileSummary({
    required this.streakDays,
    required this.totalDaysLogged,
    required this.badgesUnlocked,
    required this.avgEmission,
    required this.reductionPercent,
  });

  final int streakDays;
  final int totalDaysLogged;
  final int badgesUnlocked;
  final double avgEmission;
  final double reductionPercent;

  factory ProfileSummary.fromJson(
    Map<String, dynamic> json, {
    int fallbackStreakDays = 0,
  }) {
    return ProfileSummary(
      streakDays: (json['streak_days'] as num?)?.toInt() ?? fallbackStreakDays,
      totalDaysLogged: (json['total_days_logged'] as num?)?.toInt() ?? 0,
      badgesUnlocked: (json['badges_unlocked'] as num?)?.toInt() ?? 0,
      avgEmission: (json['avg_emission'] as num?)?.toDouble() ?? 0,
      reductionPercent: (json['reduction_percent'] as num?)?.toDouble() ?? 0,
    );
  }
}

class BadgeItem {
  BadgeItem({
    required this.badgeId,
    required this.name,
    required this.description,
    required this.iconUrl,
    required this.tier,
    required this.achieved,
  });

  final String badgeId;
  final String name;
  final String description;
  final String iconUrl;
  final String tier; // bronze|silver|gold|platinum
  final bool achieved;

  factory BadgeItem.fromJson(Map<String, dynamic> json) {
    return BadgeItem(
      badgeId: (json['badge_id'] ?? '') as String,
      name: (json['name'] ?? '') as String,
      description: (json['description'] ?? '') as String,
      iconUrl: (json['icon_url'] ?? '') as String,
      tier: (json['tier'] ?? '') as String,
      achieved: json['achieved'] as bool? ?? false,
    );
  }
}

class PerformanceMetricsLite {
  PerformanceMetricsLite({
    required this.baselineEmission,
    required this.baselineStatus,
    required this.currentAvgEmission,
    required this.reductionPercent,
  });

  final double baselineEmission;
  final String baselineStatus;
  final double currentAvgEmission;
  final double reductionPercent;

  factory PerformanceMetricsLite.fromJson(Map<String, dynamic> json) {
    return PerformanceMetricsLite(
      baselineEmission: (json['baseline_emission'] as num?)?.toDouble() ?? 0,
      baselineStatus: (json['baseline_status'] ?? '') as String,
      currentAvgEmission:
          (json['current_avg_emission'] as num?)?.toDouble() ?? 0,
      reductionPercent: (json['reduction_percent'] as num?)?.toDouble() ?? 0,
    );
  }
}
