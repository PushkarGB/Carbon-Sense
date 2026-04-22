import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../badges/remote_svg.dart';
import 'package:lottie/lottie.dart';

import '../../../core/notifications/notification_scheduler.dart';

import '../../../core/api/api_error.dart';
import '../../../core/auth/auth_repository.dart';
import '../../../core/bootstrap/bootstrap_controller.dart';
import '../../../core/lottie/lottie_assets.dart';
import '../../../core/preferences/lifestyle_prefs.dart';
import '../../dashboard/dashboard_controller.dart';
import '../../insights/insights_controller.dart';
import '../../profile/profile_controller.dart';
import '../../profile/profile_models.dart';
import '../../tasks/tasks_controller.dart';

class ProfileTab extends ConsumerWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(profileProvider);
    final width = MediaQuery.sizeOf(context).width;
    final heroHeight = (width * 0.30).clamp(90.0, 150.0);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          SizedBox(
            height: heroHeight,
            child: LottieBuilder.asset(
              LottieAssets.profileHeaderPlaceholder,
              repeat: true,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Profile',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 14),
          state.when(
            data: (p) => _ProfileBody(profile: p),
            loading: () => _LoadingCard(),
            error: (e, _) => _ErrorCard(error: ApiError.fromDio(e)),
          ),
        ],
      ),
    );
  }
}

class _LoadingCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            SizedBox(
              height: 56,
              width: 56,
              child: LottieBuilder.asset(
                LottieAssets.loading,
                repeat: true,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(child: Text('Loading profile…')),
          ],
        ),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.error});

  final ApiError error;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 56,
              width: 56,
              child: LottieBuilder.asset(
                LottieAssets.error,
                repeat: false,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Couldn’t load profile',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    error.message,
                    style: TextStyle(color: cs.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileBody extends ConsumerWidget {
  const _ProfileBody({required this.profile});

  final ProfileResponse profile;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _ProfileHeader(user: profile.user),
        const SizedBox(height: 12),
        _StatsRow(summary: profile.summary),
        const SizedBox(height: 12),
        _BadgeGallery(badges: profile.badges),
        const SizedBox(height: 12),
        const _NotificationsToggle(),
        const SizedBox(height: 12),
        _LogoutCard(ref: ref),
      ],
    );
  }
}

class _NotificationsToggle extends StatefulWidget {
  const _NotificationsToggle();

  @override
  State<_NotificationsToggle> createState() => _NotificationsToggleState();
}

class _NotificationsToggleState extends State<_NotificationsToggle> {
  bool _enabled = true;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final val = await LifestylePrefs().readNotificationsEnabled();
    if (!mounted) return;
    setState(() {
      _enabled = val;
      _loaded = true;
    });
  }

  Future<void> _toggle(bool value) async {
    setState(() => _enabled = value);
    await LifestylePrefs().writeNotificationsEnabled(value);
    if (value) {
      await scheduleAllNotifications();
    } else {
      await cancelAllNotifications();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            const Icon(Icons.notifications_active_outlined),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Push Notifications',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            if (!_loaded)
              const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              Switch.adaptive(
                value: _enabled,
                onChanged: _toggle,
              ),
          ],
        ),
      ),
    );
  }
}

class _LogoutCard extends StatelessWidget {
  const _LogoutCard({required this.ref});

  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.logout, color: cs.error),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Log out',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            TextButton(
              onPressed: () => _confirmLogout(context),
              style: TextButton.styleFrom(foregroundColor: cs.error),
              child: const Text('Log out'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('You can log back in anytime with your account.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    await cancelAllNotifications();
    await ref.read(authRepositoryProvider).logout();
    await LifestylePrefs().clearUserSession();
    ref
      ..invalidate(bootstrapProvider)
      ..invalidate(dashboardHomeProvider)
      ..invalidate(insightsSummaryProvider)
      ..invalidate(profileProvider)
      ..invalidate(todayTasksProvider);

    if (context.mounted) {
      context.go('/auth/login');
    }
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.user});

  final ProfileUser user;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: SizedBox(
                height: 68,
                width: 68,
                child:
                    user.profilePictureUrl == null ||
                        user.profilePictureUrl!.isEmpty
                    ? ColoredBox(
                        color: cs.secondaryContainer,
                        child: Center(
                          child: Text(
                            _initials(user.name),
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 18,
                              color: cs.onSecondaryContainer,
                            ),
                          ),
                        ),
                      )
                    : CachedNetworkImage(
                        imageUrl: user.profilePictureUrl!,
                        fit: BoxFit.cover,
                        errorWidget: (context, url, error) => ColoredBox(
                          color: cs.secondaryContainer,
                          child: Center(child: Text(_initials(user.name))),
                        ),
                      ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user.name,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${user.city} • ${user.role}',
                    style: TextStyle(
                      color: cs.onSurfaceVariant,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    user.email,
                    style: TextStyle(color: cs.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((p) => p.isNotEmpty)
        .toList();
    if (parts.isEmpty) return '?';
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.summary});

  final ProfileSummary summary;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _Stat(label: 'Streak', value: '${summary.streakDays}'),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _Stat(
            label: 'Days logged',
            value: '${summary.totalDaysLogged}',
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _Stat(label: 'Badges', value: '${summary.badgesUnlocked}'),
        ),
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: cs.onSurfaceVariant)),
            const SizedBox(height: 4),
            Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
    );
  }
}

// Removed _Performance section

class _BadgeGallery extends StatelessWidget {
  const _BadgeGallery({required this.badges});

  final List<BadgeItem> badges;

  @override
  Widget build(BuildContext context) {
    final achieved = badges.where((b) => b.achieved).toList();
    final locked = badges.where((b) => !b.achieved).toList();
    final ordered = [...achieved, ...locked].take(3).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Top Badges',
                  style: Theme.of(
                    context,
                  ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                TextButton(
                  onPressed: () => context.push('/badges'),
                  child: const Text('See all'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (ordered.isEmpty)
              Row(
                children: [
                  SizedBox(
                    height: 56,
                    width: 56,
                    child: LottieBuilder.asset(
                      LottieAssets.empty,
                      repeat: true,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('No badges yet.')),
                ],
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: ordered.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.92,
                ),
                itemBuilder: (context, i) => _BadgeTile(badge: ordered[i]),
              ),
          ],
        ),
      ),
    );
  }
}

class _BadgeTile extends StatelessWidget {
  const _BadgeTile({required this.badge});

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
      onTap: () => showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          title: Text(badge.name),
          content: Text(badge.description),
        ),
      ),
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
                            badge.achieved
                                ? Icons.verified
                                : Icons.lock_outline,
                            size: 34,
                            color: badge.achieved
                                ? cs.primary
                                : cs.onSurfaceVariant,
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
                                badge.achieved
                                    ? Icons.verified
                                    : Icons.lock_outline,
                                size: 34,
                                color: badge.achieved
                                    ? cs.primary
                                    : cs.onSurfaceVariant,
                              ),
                            ),
                          ),
                  ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      height: 10,
                      width: 10,
                      decoration: BoxDecoration(
                        color: tierColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: cs.surface, width: 1),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
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
}
