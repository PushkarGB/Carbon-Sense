import 'package:flutter/material.dart';

ThemeData buildCarbonSenseTheme() {
  const seed = Color(0xFF0EA371);
  final scheme = ColorScheme.fromSeed(seedColor: seed);

  return ThemeData(
    colorScheme: scheme,
    useMaterial3: true,
    scaffoldBackgroundColor: const Color(0xFFF7F8FA),
    appBarTheme: AppBarTheme(
      backgroundColor: const Color(0xFFF7F8FA),
      foregroundColor: scheme.onSurface,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
    ),
    cardTheme: const CardThemeData(
      elevation: 0,
      margin: EdgeInsets.zero,
    ),
  );
}

