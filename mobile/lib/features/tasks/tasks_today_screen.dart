import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';

import '../../core/api/api_error.dart';
import '../../core/lottie/lottie_assets.dart';
import 'tasks_controller.dart';
import 'tasks_models.dart';
import 'tasks_repository.dart';

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

class _TasksList extends ConsumerWidget {
  const _TasksList({required this.tasks});

  final List<TaskItem> tasks;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
                'No tasks generated yet.\nCome back after you\'ve used the app a bit.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    final pending = tasks.where((t) => t.status != 'completed').toList();
    final completed = tasks.where((t) => t.status == 'completed').toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 16),
      children: [
        if (pending.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 0, 4, 8),
            child: Text(
              'PENDING',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.6,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          for (final t in pending) ...[
            _TaskCard(task: t, ref: ref),
            const SizedBox(height: 8),
          ],
        ],
        if (completed.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 12, 4, 8),
            child: Text(
              'COMPLETED',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.6,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          for (final t in completed) ...[
            _TaskCard(task: t, ref: ref),
            const SizedBox(height: 8),
          ],
        ],
      ],
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({required this.task, required this.ref});

  final TaskItem task;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final completed = task.status == 'completed';
    final cs = Theme.of(context).colorScheme;
    final isManualOrHybrid =
        task.completionType == 'manual' || task.completionType == 'hybrid';

    return Card(
      child: ListTile(
        leading: Icon(
          completed ? Icons.check_circle : Icons.radio_button_unchecked,
          color: completed ? cs.primary : cs.onSurfaceVariant,
        ),
        title: Text(
          _prettyTaskTitle(task),
          style: TextStyle(
            fontWeight: completed ? FontWeight.w700 : FontWeight.w900,
            decoration: completed ? TextDecoration.lineThrough : null,
            color: completed ? cs.onSurfaceVariant : null,
          ),
        ),
        subtitle: Text(
          completed
              ? 'Done ✓'
              : isManualOrHybrid
              ? 'Tap to complete'
              : 'Tap to reveal',
          style: TextStyle(
            color: completed ? cs.primary : cs.onSurfaceVariant,
            fontWeight: completed ? FontWeight.w600 : null,
          ),
        ),
        trailing: Icon(Icons.keyboard_arrow_right, color: cs.onSurfaceVariant),
        onTap: () => _showTaskDetails(context, task, ref),
      ),
    );
  }
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

String _prettyCategory(TaskItem t) {
  return switch (t.category) {
    'eco_action' => 'Eco Action',
    'emission_reduction' => 'Reduction',
    'awareness' => 'Awareness',
    'system' => 'System',
    _ => t.category,
  };
}

String _completionLabel(TaskItem t) {
  return switch (t.completionType) {
    'auto' => 'Auto-tracked',
    'manual' => 'Manual',
    'hybrid' => 'Hybrid',
    _ => t.completionType,
  };
}

IconData _completionIcon(TaskItem t) {
  return switch (t.completionType) {
    'auto' => Icons.auto_awesome,
    'manual' => Icons.touch_app,
    'hybrid' => Icons.sync_alt,
    _ => Icons.help_outline,
  };
}

Future<void> _showTaskDetails(
  BuildContext context,
  TaskItem t,
  WidgetRef ref,
) async {
  final completed = t.status == 'completed';
  final canComplete =
      !completed &&
      (t.completionType == 'manual' || t.completionType == 'hybrid');

  await showGeneralDialog<void>(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Task details',
    barrierColor: Colors.black.withValues(alpha: 0.5),
    transitionDuration: const Duration(milliseconds: 300),
    pageBuilder: (dialogContext, animation, secondaryAnimation) {
      return _TaskDetailDialog(task: t, canComplete: canComplete, ref: ref);
    },
    transitionBuilder: (dialogContext, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
      );
      return SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.12),
          end: Offset.zero,
        ).animate(curved),
        child: FadeTransition(opacity: curved, child: child),
      );
    },
  );
}

class _TaskDetailDialog extends StatefulWidget {
  const _TaskDetailDialog({
    required this.task,
    required this.canComplete,
    required this.ref,
  });

  final TaskItem task;
  final bool canComplete;
  final WidgetRef ref;

  @override
  State<_TaskDetailDialog> createState() => _TaskDetailDialogState();
}

class _TaskDetailDialogState extends State<_TaskDetailDialog> {
  bool _loading = false;
  bool _completed = false;
  String? _error;

  Future<void> _completeTask() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await widget.ref
          .read(tasksRepositoryProvider)
          .completeTask(widget.task.taskId);
      if (!mounted) return;
      setState(() {
        _loading = false;
        _completed = true;
      });
      // Refresh the task list so the card updates.
      widget.ref.invalidate(todayTasksProvider);
      // Auto-close after a short celebratory pause.
      await Future<void>.delayed(const Duration(milliseconds: 1200));
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      final err = ApiError.fromDio(e);
      setState(() {
        _loading = false;
        _error = err.message;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final t = widget.task;
    final isCompleted = t.status == 'completed' || _completed;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header row ──
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? cs.primaryContainer
                        : cs.surfaceContainerHighest,
                    shape: BoxShape.circle,
                  ),
                  child: _completed
                      ? LottieBuilder.asset(
                          LottieAssets.success,
                          repeat: false,
                          fit: BoxFit.contain,
                          height: 24,
                          width: 24,
                        )
                      : Icon(
                          isCompleted
                              ? Icons.task_alt
                              : Icons.lightbulb_outline,
                          color: isCompleted
                              ? cs.onPrimaryContainer
                              : cs.onSurfaceVariant,
                        ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _prettyCategory(t).toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          color: cs.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _completed
                            ? 'Well Done! ✓'
                            : isCompleted
                            ? 'Completed'
                            : 'Pending Action',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: _completed ? cs.primary : cs.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // ── Title ──
            Text(
              _prettyTaskTitle(t),
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
            ),

            const SizedBox(height: 8),

            // ── Completion type badge ──
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: cs.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _completionIcon(t),
                    size: 14,
                    color: cs.onSurfaceVariant,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    _completionLabel(t),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // ── Description ──
            Text(
              t.description.trim().isEmpty
                  ? 'No description is available for this task yet.'
                  : t.description,
              style: TextStyle(
                fontSize: 16,
                color: cs.onSurfaceVariant,
                height: 1.5,
              ),
            ),

            // ── Error banner ──
            if (_error != null) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: cs.errorContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _error!,
                  style: TextStyle(
                    color: cs.onErrorContainer,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 28),

            // ── Action buttons ──
            if (widget.canComplete && !_completed) ...[
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _loading ? null : _completeTask,
                  icon: _loading
                      ? SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: cs.onPrimary,
                          ),
                        )
                      : const Icon(Icons.check_circle_outline),
                  label: Text(_loading ? 'Completing…' : 'Mark as Done'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: _loading
                      ? null
                      : () => Navigator.of(context).pop(),
                  child: const Text('Close'),
                ),
              ),
            ] else ...[
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(_completed ? 'Great!' : 'Got it'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
