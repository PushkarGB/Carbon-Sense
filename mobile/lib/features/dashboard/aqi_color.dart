import 'package:flutter/material.dart';

Color aqiColor(int aqi) {
  // Spec bands:
  // 0–50 Green (#00e400)
  // 51–100 Yellow (#ffff00)
  // 101–150 Orange (#ff7e00)
  // 151–200 Red (#ff0000)
  // 201–300 Purple (#8f3f97)
  // 301–500 Maroon (#7e0023)
  if (aqi <= 50) return const Color(0xFF00E400);
  if (aqi <= 100) return const Color(0xFFFFFF00);
  if (aqi <= 150) return const Color(0xFFFF7E00);
  if (aqi <= 200) return const Color(0xFFFF0000);
  if (aqi <= 300) return const Color(0xFF8F3F97);
  return const Color(0xFF7E0023);
}

String aqiLevel(int aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy (Sensitive)';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

