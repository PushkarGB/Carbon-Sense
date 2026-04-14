class LeaderboardEntry {
  LeaderboardEntry({
    required this.userId,
    required this.name,
    required this.city,
    required this.profilePictureUrl,
    required this.avgEmission,
    required this.totalEmission,
    required this.totalDaysLogged,
  });

  final String userId;
  final String name;
  final String city;
  final String? profilePictureUrl;
  final double avgEmission;
  final double totalEmission;
  final int totalDaysLogged;

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      userId: (json['user_id'] ?? '') as String,
      name: (json['name'] ?? '') as String,
      city: (json['city'] ?? '') as String,
      profilePictureUrl: json['profile_picture_url'] as String?,
      avgEmission: (json['avg_emission'] as num?)?.toDouble() ?? 0,
      totalEmission: (json['total_emission'] as num?)?.toDouble() ?? 0,
      totalDaysLogged: (json['total_days_logged'] as num?)?.toInt() ?? 0,
    );
  }
}

