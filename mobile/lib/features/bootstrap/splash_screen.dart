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
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF081B2E), Color(0xFF0A3B5C), Color(0xFF0EA371)],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final screenHeight = constraints.maxHeight;
              final earthSize = (screenHeight * 0.26).clamp(140.0, 240.0);
              final introSize = (screenHeight * 0.18).clamp(90.0, 170.0);
              return Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 360),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: introSize,
                          width: introSize,
                          child: LottieBuilder.asset(
                            LottieAssets.cinematicIntroPlaceholder,
                            repeat: true,
                            fit: BoxFit.contain,
                          ),
                        ),
                        SizedBox(height: screenHeight * 0.02),
                        Text(
                          'CarbonSense',
                          style: Theme.of(context).textTheme.displaySmall
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.6,
                              ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Decode your footprint. Rewrite tomorrow.',
                          style: Theme.of(context).textTheme.bodyLarge
                              ?.copyWith(
                                color: const Color(0xFFE8F5FF),
                                fontWeight: FontWeight.w600,
                              ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: screenHeight * 0.03),
                        SizedBox(
                          height: earthSize,
                          width: earthSize,
                          child: LottieBuilder.asset(
                            LottieAssets.earthRotatePlaceholder,
                            repeat: true,
                            fit: BoxFit.contain,
                          ),
                        ),
                        SizedBox(height: screenHeight * 0.03),
                        Text(
                          'Calibrating atmosphere...',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(color: const Color(0xFFCDE6FF)),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
