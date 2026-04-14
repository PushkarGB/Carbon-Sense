import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'tabs/dashboard_tab.dart';
import 'tabs/input_tab.dart';
import 'tabs/insights_tab.dart';
import 'tabs/leaderboard_tab.dart';
import 'tabs/profile_tab.dart';

class ShellScreen extends StatelessWidget {
  const ShellScreen({super.key, required this.tab});

  final String tab;

  int get _index {
    return switch (tab) {
      'dashboard' => 0,
      'input' => 1,
      'insights' => 2,
      'leaderboard' => 3,
      'profile' => 4,
      _ => 0,
    };
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
}

