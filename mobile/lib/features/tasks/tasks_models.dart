class TodayTasksResponse {
  TodayTasksResponse({required this.tasks});

  final List<TaskItem> tasks;

  factory TodayTasksResponse.fromJson(Map<String, dynamic> json) {
    final list = <TaskItem>[];
    final t = json['tasks'];
    if (t is List) {
      for (final item in t) {
        if (item is Map<String, dynamic>) list.add(TaskItem.fromJson(item));
      }
    }
    return TodayTasksResponse(tasks: list);
  }
}

class TaskItem {
  TaskItem({
    required this.taskId,
    required this.category,
    required this.title,
    required this.status,
    required this.completionType,
    required this.description,
  });

  final String taskId;
  final String category; // system | eco_action | emission_reduction | awareness
  final String title;
  final String status; // pending | completed
  final String completionType; // auto | manual | hybrid
  final String description;

  factory TaskItem.fromJson(Map<String, dynamic> json) {
    return TaskItem(
      taskId: (json['task_id'] ?? '') as String,
      category: (json['category'] ?? '') as String,
      title: (json['title'] ?? '') as String,
      status: (json['status'] ?? '') as String,
      completionType: (json['completion_type'] ?? '') as String,
      description: (json['description'] ?? '') as String,
    );
  }
}
