class InsightsSummary {
  InsightsSummary({
    required this.rangeDays,
    required this.emissions,
    required this.summary,
    required this.trend,
    required this.latestBreakdown,
    required this.aqi,
  });

  final int rangeDays;
  final List<EmissionPoint> emissions;
  final SummaryStats summary;
  final String trend; // increasing | stable | decreasing
  final LatestBreakdown? latestBreakdown;
  final AqiLite? aqi;

  factory InsightsSummary.fromJson(Map<String, dynamic> json) {
    final emissions = <EmissionPoint>[];
    final e = json['emissions'];
    if (e is List) {
      for (final item in e) {
        if (item is Map<String, dynamic>) emissions.add(EmissionPoint.fromJson(item));
      }
    }

    return InsightsSummary(
      rangeDays: (json['range_days'] as num?)?.toInt() ?? 7,
      emissions: emissions,
      summary: SummaryStats.fromJson((json['summary'] ?? const {}) as Map<String, dynamic>),
      trend: (json['trend'] ?? 'stable') as String,
      latestBreakdown: json['latest_breakdown'] == null
          ? null
          : LatestBreakdown.fromJson(json['latest_breakdown'] as Map<String, dynamic>),
      aqi: json['aqi'] == null ? null : AqiLite.fromJson(json['aqi'] as Map<String, dynamic>),
    );
  }
}

class EmissionPoint {
  EmissionPoint({required this.date, required this.totalEmission});

  final String date; // YYYY-MM-DD
  final double totalEmission;

  factory EmissionPoint.fromJson(Map<String, dynamic> json) {
    return EmissionPoint(
      date: (json['date'] ?? '') as String,
      totalEmission: (json['total_emission'] as num?)?.toDouble() ?? 0,
    );
  }
}

class SummaryStats {
  SummaryStats({
    required this.averageEmission,
    required this.totalEmission,
    required this.minEmission,
    required this.maxEmission,
    required this.daysWithData,
  });

  final double averageEmission;
  final double totalEmission;
  final double minEmission;
  final double maxEmission;
  final int daysWithData;

  factory SummaryStats.fromJson(Map<String, dynamic> json) {
    return SummaryStats(
      averageEmission: (json['average_emission'] as num?)?.toDouble() ?? 0,
      totalEmission: (json['total_emission'] as num?)?.toDouble() ?? 0,
      minEmission: (json['min_emission'] as num?)?.toDouble() ?? 0,
      maxEmission: (json['max_emission'] as num?)?.toDouble() ?? 0,
      daysWithData: (json['days_with_data'] as num?)?.toInt() ?? 0,
    );
  }
}

class LatestBreakdown {
  LatestBreakdown({required this.date, required this.values, required this.percentages});

  final String date;
  final Map<String, double> values;
  final Map<String, double> percentages;

  factory LatestBreakdown.fromJson(Map<String, dynamic> json) {
    Map<String, double> parseMap(Object? m) {
      final out = <String, double>{};
      if (m is Map<String, dynamic>) {
        for (final e in m.entries) {
          final v = e.value;
          if (v is num) out[e.key] = v.toDouble();
        }
      }
      return out;
    }

    return LatestBreakdown(
      date: (json['date'] ?? '') as String,
      values: parseMap(json['values']),
      percentages: parseMap(json['percentages']),
    );
  }
}

class AqiLite {
  AqiLite({
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

  factory AqiLite.fromJson(Map<String, dynamic> json) {
    return AqiLite(
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

