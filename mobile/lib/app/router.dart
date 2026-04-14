import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/activity/activity_wizard_screen.dart';
import '../features/bootstrap/splash_screen.dart';
import '../features/onboarding/onboarding_flow_screen.dart';
import '../features/shell/shell_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingFlowScreen(),
      ),
      GoRoute(
        path: '/input/daily',
        builder: (context, state) =>
            const ActivityWizardScreen(type: ActivityType.daily),
      ),
      GoRoute(
        path: '/input/weekly',
        builder: (context, state) =>
            const ActivityWizardScreen(type: ActivityType.weekly),
      ),
      GoRoute(
        path: '/shell/:tab',
        builder: (context, state) {
          final tab = state.pathParameters['tab'] ?? 'dashboard';
          return ShellScreen(tab: tab);
        },
      ),
    ],
  );
});

