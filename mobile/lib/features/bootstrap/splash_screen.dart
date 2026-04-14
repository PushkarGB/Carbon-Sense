import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../core/bootstrap/bootstrap_controller.dart';
import '../../core/lottie/lottie_assets.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(bootstrapProvider, (prev, next) {
      next.whenData((result) {
        if (result is BootstrapUnauthenticated) {
          context.go('/auth/login');
          return;
        }
        if (result is BootstrapAuthenticated) {
          if (!result.onboardingCompleted) {
            context.go('/onboarding');
          } else {
            context.go('/shell/dashboard');
          }
        }
      });
    });

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 260),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'CarbonSense',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 160,
                  width: 160,
                  child: LottieBuilder.asset(
                    LottieAssets.loading,
                    repeat: true,
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Warming up your dashboard…',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

