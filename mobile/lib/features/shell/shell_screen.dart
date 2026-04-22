import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../core/preferences/lifestyle_prefs.dart';
import '../../core/lottie/lottie_assets.dart';
import '../insights/insights_controller.dart';
import '../profile/profile_controller.dart';
import '../profile/profile_models.dart';
import 'tabs/dashboard_tab.dart';
import 'tabs/input_tab.dart';
import 'tabs/insights_tab.dart';
import 'tabs/leaderboard_tab.dart';
import 'tabs/profile_tab.dart';


class ShellScreen extends ConsumerStatefulWidget {
  const ShellScreen({super.key, required this.tab});

  final String tab;

  @override
  ConsumerState<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends ConsumerState<ShellScreen> {
  bool _showingBadgeDialog = false;
  ProfileResponse? _queuedBadgeProfile;

  int get _index {
    return switch (widget.tab) {
      'dashboard' => 0,
      'input' => 1,
      'insights' => 2,
      'leaderboard' => 3,
      'profile' => 4,
      _ => 0,
    };
  }

  @override
  void initState() {
    super.initState();
    ref.listenManual(profileProvider, (_, next) {
      next.whenData((profile) {
        Future(() => _handleBadgeUnlocks(profile)).ignore();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const DashboardTab(),
      const InputTab(),
      const InsightsTab(),
      const LeaderboardTab(),
      const ProfileTab(),
    ];

    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) {
          final next = switch (i) {
            0 => 'dashboard',
            1 => 'input',
            2 => 'insights',
            3 => 'leaderboard',
            _ => 'profile',
          };
          if (next == 'insights') {
            ref.invalidate(insightsSummaryProvider);
          }
          context.go('/shell/$next');
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.edit_note_outlined),
            selectedIcon: Icon(Icons.edit_note),
            label: 'Input',
          ),
          NavigationDestination(
            icon: Icon(Icons.insights_outlined),
            selectedIcon: Icon(Icons.insights),
            label: 'Insights',
          ),
          NavigationDestination(
            icon: Icon(Icons.emoji_events_outlined),
            selectedIcon: Icon(Icons.emoji_events),
            label: 'Leaderboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Future<void> _handleBadgeUnlocks(ProfileResponse profile) async {
    if (_showingBadgeDialog) {
      _queuedBadgeProfile = profile;
      return;
    }

    final prefs = LifestylePrefs();
    final current = profile.summary.badgesUnlocked;
    final seen = await prefs.readBadgesSeenCount();

    if (seen == null) {
      // BUG FIX: was writing `current` here which silently swallowed all
      // existing badges on first launch. Write 0 instead so any already-
      // awarded badges will trigger the unlock dialog on this first load.
      await prefs.writeBadgesSeenCount(0);
      // Fall through — delta = current - 0 = current, so dialogs fire.
    }

    // Use non-nullable seenCount after the init path above.
    final seenCount = seen ?? 0;
    if (current <= seenCount || !mounted) {
      return;
    }

    final delta = current - seenCount;
    final newestBadges = profile.badges
        .where((badge) => badge.achieved)
        .toList()
      ..sort((a, b) {
        final aTime = a.awardedAt?.millisecondsSinceEpoch ?? 0;
        final bTime = b.awardedAt?.millisecondsSinceEpoch ?? 0;
        return bTime.compareTo(aTime);
      });

    final queue = newestBadges.take(delta).toList().reversed.toList();
    _showingBadgeDialog = true;
    try {
      for (final badge in queue) {
        if (!mounted) {
          break;
        }
        await showGeneralDialog<void>(
          context: context,
          barrierLabel: 'Badge unlocked',
          barrierDismissible: true,
          barrierColor: Colors.black.withValues(alpha: 0.72),
          transitionDuration: const Duration(milliseconds: 320),
          pageBuilder: (dialogContext, animation, secondaryAnimation) =>
              _BadgeUnlockDialog(badge: badge),
          transitionBuilder:
              (dialogContext, animation, secondaryAnimation, child) {
            final curved = CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            );
            return FadeTransition(
              opacity: curved,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.94, end: 1).animate(curved),
                child: child,
              ),
            );
          },
        );
      }
      await prefs.writeBadgesSeenCount(current);
    } finally {
      _showingBadgeDialog = false;
    }

    final queuedProfile = _queuedBadgeProfile;
    _queuedBadgeProfile = null;
    if (queuedProfile != null && mounted) {
      await _handleBadgeUnlocks(queuedProfile);
    }
  }
}

class _BadgeUnlockDialog extends StatefulWidget {
  const _BadgeUnlockDialog({required this.badge});

  final BadgeItem badge;

  @override
  State<_BadgeUnlockDialog> createState() => _BadgeUnlockDialogState();
}

class _BadgeUnlockDialogState extends State<_BadgeUnlockDialog> {
  bool _revealBadge = false;
  Timer? _revealTimer;

  @override
  void initState() {
    super.initState();
    _revealTimer = Timer(const Duration(milliseconds: 700), () {
      if (!mounted) {
        return;
      }
      setState(() => _revealBadge = true);
    });
  }

  @override
  void dispose() {
    _revealTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const gold = Color(0xFFE9C46A);
    const goldSoft = Color(0xFFF4A261);
    const ink = Color(0xFF0B111A);
    const ink2 = Color(0xFF182433);

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 22, 24, 20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            colors: [ink, ink2],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: gold.withValues(alpha: 0.38)),
          boxShadow: [
            BoxShadow(
              color: goldSoft.withValues(alpha: 0.12),
              blurRadius: 28,
              spreadRadius: 2,
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.42),
              blurRadius: 36,
              offset: const Offset(0, 18),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 118,
              width: 118,
              child: LottieBuilder.asset(
                LottieAssets.success,
                repeat: false,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'BADGE UNLOCKED',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: gold.withValues(alpha: 0.88),
                letterSpacing: 3.4,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 18),
            AnimatedSlide(
              duration: const Duration(milliseconds: 520),
              curve: Curves.easeOutCubic,
              offset: _revealBadge ? Offset.zero : const Offset(0, 0.14),
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 520),
                curve: Curves.easeOutCubic,
                opacity: _revealBadge ? 1 : 0,
                child: Column(
                  children: [
                    Container(
                      height: 132,
                      width: 132,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            gold.withValues(alpha: 0.28),
                            Colors.white.withValues(alpha: 0.03),
                          ],
                        ),
                        border: Border.all(
                          color: gold.withValues(alpha: 0.55),
                          width: 1.6,
                        ),
                      ),
                      child: widget.badge.iconUrl.isEmpty
                          ? Icon(
                              Icons.workspace_premium,
                              color: gold,
                              size: 64,
                            )
                          : CachedNetworkImage(
                              imageUrl: widget.badge.iconUrl,
                              fit: BoxFit.contain,
                              errorWidget:
                                  (context, imageUrl, error) => Icon(
                                Icons.workspace_premium,
                                color: gold,
                                size: 64,
                              ),
                            ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      widget.badge.name,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.6,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.badge.description,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.72),
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: gold.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: gold.withValues(alpha: 0.22)),
                      ),
                      child: Text(
                        widget.badge.tier.toUpperCase(),
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: gold,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.8,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.of(context).pop(),
                style: FilledButton.styleFrom(
                  backgroundColor: goldSoft,
                  foregroundColor: ink,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  textStyle: const TextStyle(fontWeight: FontWeight.w800),
                ),
                child: const Text('Continue'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

