import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'remote_svg.dart';

import '../profile/profile_controller.dart';
import '../profile/profile_models.dart';

class BadgeGalleryScreen extends ConsumerWidget {
  const BadgeGalleryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(profileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Badge Gallery')),
      body: SafeArea(
        child: state.when(
          data: (profile) => _GalleryBody(badges: profile.badges),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Failed to load badges.\n$e')),
        ),
      ),
    );
  }
}

class _GalleryBody extends StatelessWidget {
  const _GalleryBody({required this.badges});

  final List<BadgeItem> badges;

  @override
  Widget build(BuildContext context) {
    final achieved = badges.where((b) => b.achieved).toList();
    final locked = badges.where((b) => !b.achieved).toList();
    final ordered = [...achieved, ...locked];

    if (ordered.isEmpty) {
      return const Center(child: Text('No badges available.'));
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: ordered.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.85,
      ),
      itemBuilder: (context, i) => _GalleryBadgeTile(badge: ordered[i]),
    );
  }
}

class _GalleryBadgeTile extends StatelessWidget {
  const _GalleryBadgeTile({required this.badge});

  final BadgeItem badge;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final border = badge.achieved ? cs.primary : cs.outlineVariant;
    final tierColor = switch (badge.tier) {
      'bronze' => const Color(0xFFCD7F32),
      'silver' => const Color(0xFFC0C0C0),
      'gold' => const Color(0xFFFFD700),
      'platinum' => const Color(0xFFB9F2FF),
      _ => cs.surfaceContainerHighest,
    };

    return InkWell(
      onTap: () => _showBadgeDetails(context, badge),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: border),
          color: cs.surface,
        ),
        child: Column(
          children: [
            Expanded(
              child: Stack(
                children: [
                  Center(
                    child: badge.iconUrl.isEmpty
                        ? Icon(
                            badge.achieved ? Icons.verified : Icons.lock_outline,
                            size: 40,
                            color: badge.achieved ? cs.primary : cs.onSurfaceVariant,
                          )
                        : Opacity(
                            opacity: badge.achieved ? 1 : 0.35,
                            child: RemoteSvg(
                              imageUrl: badge.iconUrl,
                              width: double.infinity,
                              height: double.infinity,
                              fit: BoxFit.contain,
                              colorFilter: badge.achieved
                                  ? null
                                  : const ColorFilter.mode(
                                      Colors.grey, BlendMode.srcIn),
                              placeholder: (context) => Icon(
                                badge.achieved ? Icons.verified : Icons.lock_outline,
                                size: 40,
                                color: badge.achieved ? cs.primary : cs.onSurfaceVariant,
                              ),
                            ),
                          ),
                  ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      height: 12,
                      width: 12,
                      decoration: BoxDecoration(
                        color: tierColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: cs.surface, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              badge.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.w800,
                color: badge.achieved ? cs.onSurface : cs.onSurfaceVariant,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showBadgeDetails(BuildContext context, BadgeItem badge) {
    final tierColor = switch (badge.tier) {
      'bronze' => const Color(0xFFCD7F32),
      'silver' => const Color(0xFFC0C0C0),
      'gold' => const Color(0xFFFFD700),
      'platinum' => const Color(0xFFB9F2FF),
      _ => const Color(0xFF0EA371),
    };

    String statusMsg;
    double? progressValue;
    if (badge.achieved) {
      statusMsg = 'Unlocked!';
      progressValue = 1.0;
    } else {
      final remaining = (badge.threshold - badge.currentValue).toDouble();
      if (remaining > 0) {
        final rStr = remaining == remaining.toInt()
            ? remaining.toInt().toString()
            : remaining.toStringAsFixed(1);
        statusMsg = '$rStr more to unlock';
        progressValue = badge.threshold > 0
            ? (badge.currentValue.toDouble() / badge.threshold).clamp(0.0, 1.0)
            : 0.0;
      } else {
        statusMsg = 'Processing unlock…';
        progressValue = 0.99;
      }
    }

    showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: badge.name,
      barrierColor: Colors.black.withValues(alpha: 0.72),
      transitionDuration: const Duration(milliseconds: 320),
      pageBuilder: (dialogContext, animation, secondaryAnimation) {
        const ink = Color(0xFF0B111A);
        const ink2 = Color(0xFF182433);
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding:
              const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Container(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              gradient: const LinearGradient(
                colors: [ink, ink2],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(
                  color: tierColor.withValues(alpha: 0.45), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: tierColor.withValues(alpha: 0.18),
                  blurRadius: 32,
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
                // ── Tier label ──
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: tierColor.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(999),
                    border:
                        Border.all(color: tierColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    badge.tier.toUpperCase(),
                    style: TextStyle(
                      color: tierColor,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.8,
                      fontSize: 11,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                // ── Badge icon ──
                Container(
                  height: 120,
                  width: 120,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        tierColor.withValues(alpha: 0.22),
                        Colors.white.withValues(alpha: 0.02),
                      ],
                    ),
                    border: Border.all(
                        color: tierColor.withValues(alpha: 0.5), width: 1.5),
                  ),
                  child: Opacity(
                    opacity: badge.achieved ? 1.0 : 0.4,
                    child: badge.iconUrl.isEmpty
                        ? Icon(
                            badge.achieved
                                ? Icons.workspace_premium
                                : Icons.lock_outline,
                            color: tierColor,
                            size: 56,
                          )
                        : RemoteSvg(
                            imageUrl: badge.iconUrl,
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.contain,
                            colorFilter: badge.achieved
                                ? null
                                : const ColorFilter.mode(
                                    Colors.grey, BlendMode.srcIn),
                            placeholder: (context) => Icon(
                              badge.achieved
                                  ? Icons.workspace_premium
                                  : Icons.lock_outline,
                              color: tierColor.withValues(alpha: 0.5),
                              size: 56,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 18),
                // ── Name ──
                Text(
                  badge.name,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    shadows: [
                      Shadow(
                        color: tierColor.withValues(alpha: 0.6),
                        blurRadius: 16,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                // ── Description ──
                Text(
                  badge.description,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.72),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 16),
                // ── Progress ──
                if (progressValue != null) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: progressValue,
                      minHeight: 7,
                      backgroundColor:
                          Colors.white.withValues(alpha: 0.1),
                      valueColor:
                          AlwaysStoppedAnimation<Color>(tierColor),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    badge.achieved
                        ? '✓ $statusMsg'
                        : '$statusMsg  •  ${(progressValue * 100).toStringAsFixed(0)}%',
                    style: TextStyle(
                      color: badge.achieved
                          ? tierColor
                          : Colors.white.withValues(alpha: 0.6),
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
                // ── Button ──
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.of(dialogContext).pop(),
                    style: FilledButton.styleFrom(
                      backgroundColor: tierColor,
                      foregroundColor: const Color(0xFF0B111A),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      textStyle:
                          const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    child: Text(badge.achieved ? 'Awesome' : 'Keep going'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
      transitionBuilder: (dialogContext, animation, secondaryAnimation, child) {
        final curved = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
        );
        return FadeTransition(
          opacity: curved,
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.92, end: 1).animate(curved),
            child: child,
          ),
        );
      },
    );
  }
}
