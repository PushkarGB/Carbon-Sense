import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';

import '../../core/api/api_error.dart';
import '../../core/lottie/lottie_assets.dart';
import 'tasks_controller.dart';
import 'tasks_models.dart';

class TodayTasksScreen extends ConsumerWidget {
  const TodayTasksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(todayTasksProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Today’s tasks')),
      body: SafeArea(
        child: state.when(
          data: (res) => _TasksList(tasks: res.tasks),
          loading: () => Center(
            child: LottieBuilder.asset(
              LottieAssets.loading,
              repeat: true,
              fit: BoxFit.contain,
            ),
          ),
          error: (e, _) {
            final err = ApiError.fromDio(e);
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      height: 160,
                      width: 160,
                      child: LottieBuilder.asset(
                        LottieAssets.error,
                        repeat: false,
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(err.message, textAlign: TextAlign.center),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}


class _TasksList extends StatelessWidget {
  const _TasksList({required this.tasks});

  final List<TaskItem> tasks;

  @override
  Widget build(BuildContext context) {
    if (tasks.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                height: 160,
                width: 160,
                child: LottieBuilder.asset(
                  LottieAssets.empty,
                  repeat: true,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'No tasks generated yet.\nCome back after you’ve used the app a bit.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 16),
      itemCount: tasks.length,
      separatorBuilder: (_, index) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final t = tasks[i];
        final completed = t.status == 'completed';
        final cs = Theme.of(context).colorScheme;

        return Card(
          child: ListTile(
            leading: Icon(
              completed ? Icons.check_circle : Icons.radio_button_unchecked,
              color: completed ? cs.primary : cs.onSurfaceVariant,
            ),
            title: Text(
              _prettyTaskTitle(t),
              style: TextStyle(
                fontWeight: completed ? FontWeight.w700 : FontWeight.w900,
              ),
            ),
            subtitle: Text(
              'Tap to reveal',
              style: TextStyle(color: cs.onSurfaceVariant),
            ),
            trailing: Icon(
              Icons.keyboard_arrow_right,
              color: cs.onSurfaceVariant,
            ),
            onTap: () => _showTaskDetails(context, t),
          ),
        );
      },
    );
  }

  String _prettyTaskTitle(TaskItem t) {
    final raw = t.title.trim();
    if (raw.isNotEmpty && raw.length >= 6) return raw;
    return t.taskId
        .replaceAll('_', ' ')
        .split(' ')
        .where((p) => p.isNotEmpty)
        .map((p) => p[0].toUpperCase() + p.substring(1))
        .join(' ');
  }

  String _prettyTaskMeta(TaskItem t) {
    final type = switch (t.completionType) {
      'auto' => 'Auto-check',
      'hybrid' => 'Needs proof',
      'manual' => 'Manual',
      _ => t.completionType,
    };
    final cat = switch (t.category) {
      'eco_action' => 'Eco action',
      'emission_reduction' => 'Reduction',
      'awareness' => 'Awareness',
      'system' => 'System',
      _ => t.category,
    };
    return '$cat • $type';
  }

  Future<void> _showTaskDetails(BuildContext context, TaskItem t) async {
    final cs = Theme.of(context).colorScheme;
    final labels = <String>[
      _prettyTaskMeta(t),
      t.status == 'completed' ? 'Completed' : 'Pending',
    ];

    await showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(_prettyTaskTitle(t)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              t.description.trim().isEmpty
                  ? 'No description is available for this task yet.'
                  : t.description,
              style: TextStyle(color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [for (final label in labels) Chip(label: Text(label))],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
