import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'router.dart';
import 'theme.dart';

class CarbonSenseApp extends ConsumerWidget {
  const CarbonSenseApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'CarbonSense',
      theme: buildCarbonSenseTheme(),
      routerConfig: router,
    );
  }
}

