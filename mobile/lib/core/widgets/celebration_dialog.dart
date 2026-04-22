import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../lottie/lottie_assets.dart';

/// A premium full-screen celebration overlay with:
///  - Blurred + dimmed background
///  - Large Lottie animation
///  - Animated title and subtitle that slide-fade in
///  - Auto-dismiss after a short delay (or tap to dismiss)
Future<void> showCelebrationDialog(
  BuildContext context, {
  required String title,
  String? subtitle,
  String actionLabel = 'Done',
  String animationAsset = LottieAssets.success,
}) {
  return showGeneralDialog<void>(
    context: context,
    barrierDismissible: true,
    barrierLabel: title,
    barrierColor: Colors.transparent, // handled by BackdropFilter
    transitionDuration: const Duration(milliseconds: 400),
    pageBuilder: (dialogContext, animation, secondaryAnimation) {
      return _CelebrationOverlay(
        title: title,
        subtitle: subtitle,
        actionLabel: actionLabel,
        animationAsset: animationAsset,
      );
    },
    transitionBuilder: (dialogContext, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
      );
      return FadeTransition(opacity: curved, child: child);
    },
  );
}

class _CelebrationOverlay extends StatefulWidget {
  const _CelebrationOverlay({
    required this.title,
    required this.subtitle,
    required this.actionLabel,
    required this.animationAsset,
  });

  final String title;
  final String? subtitle;
  final String actionLabel;
  final String animationAsset;

  @override
  State<_CelebrationOverlay> createState() => _CelebrationOverlayState();
}

class _CelebrationOverlayState extends State<_CelebrationOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _textAnim;
  late final Animation<double> _titleOpacity;
  late final Animation<Offset> _titleSlide;
  late final Animation<double> _subtitleOpacity;
  late final Animation<Offset> _subtitleSlide;
  late final Animation<double> _buttonOpacity;

  @override
  void initState() {
    super.initState();
    _textAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Title: 0.25 → 0.55
    _titleOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _textAnim,
        curve: const Interval(0.25, 0.55, curve: Curves.easeOut),
      ),
    );
    _titleSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _textAnim,
        curve: const Interval(0.25, 0.55, curve: Curves.easeOutCubic),
      ),
    );

    // Subtitle: 0.4 → 0.7
    _subtitleOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _textAnim,
        curve: const Interval(0.4, 0.7, curve: Curves.easeOut),
      ),
    );
    _subtitleSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _textAnim,
        curve: const Interval(0.4, 0.7, curve: Curves.easeOutCubic),
      ),
    );

    // Button: 0.6 → 0.9
    _buttonOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _textAnim,
        curve: const Interval(0.6, 0.9, curve: Curves.easeOut),
      ),
    );

    // Start text animations after the Lottie has had a moment to play.
    Future.delayed(const Duration(milliseconds: 350), () {
      if (mounted) _textAnim.forward();
    });
  }

  @override
  void dispose() {
    _textAnim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const accentGreen = Color(0xFF0EA371);

    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
      child: Container(
        color: Colors.black.withValues(alpha: 0.55),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // ── Large Lottie animation ──
                  SizedBox(
                    height: 200,
                    width: 200,
                    child: LottieBuilder.asset(
                      widget.animationAsset,
                      repeat: false,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── Animated title ──
                  AnimatedBuilder(
                    animation: _textAnim,
                    builder: (context, child) {
                      return SlideTransition(
                        position: _titleSlide,
                        child: Opacity(
                          opacity: _titleOpacity.value,
                          child: child,
                        ),
                      );
                    },
                    child: Text(
                      widget.title,
                      textAlign: TextAlign.center,
                      style: Theme.of(context)
                          .textTheme
                          .headlineMedium
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            shadows: [
                              Shadow(
                                color: accentGreen.withValues(alpha: 0.6),
                                blurRadius: 24,
                              ),
                              Shadow(
                                color: Colors.black.withValues(alpha: 0.5),
                                blurRadius: 12,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                    ),
                  ),

                  if (widget.subtitle != null) ...[
                    const SizedBox(height: 12),

                    // ── Animated subtitle ──
                    AnimatedBuilder(
                      animation: _textAnim,
                      builder: (context, child) {
                        return SlideTransition(
                          position: _subtitleSlide,
                          child: Opacity(
                            opacity: _subtitleOpacity.value,
                            child: child,
                          ),
                        );
                      },
                      child: Text(
                        widget.subtitle!,
                        textAlign: TextAlign.center,
                        style: Theme.of(context)
                            .textTheme
                            .bodyLarge
                            ?.copyWith(
                              color: Colors.white.withValues(alpha: 0.88),
                              fontWeight: FontWeight.w600,
                              height: 1.5,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withValues(alpha: 0.7),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 36),

                  // ── Animated button ──
                  AnimatedBuilder(
                    animation: _textAnim,
                    builder: (context, child) {
                      return Opacity(
                        opacity: _buttonOpacity.value,
                        child: child,
                      );
                    },
                    child: SizedBox(
                      width: 200,
                      child: FilledButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: FilledButton.styleFrom(
                          backgroundColor: accentGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          textStyle:
                              const TextStyle(fontWeight: FontWeight.w900),
                        ),
                        child: Text(widget.actionLabel),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
