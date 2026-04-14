String todayIstYyyyMmDd() {
  final nowUtc = DateTime.now().toUtc();
  final ist = nowUtc.add(const Duration(hours: 5, minutes: 30));
  final y = ist.year.toString().padLeft(4, '0');
  final m = ist.month.toString().padLeft(2, '0');
  final d = ist.day.toString().padLeft(2, '0');
  return '$y-$m-$d';
}

