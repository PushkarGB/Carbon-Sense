import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'profile_models.dart';
import 'profile_repository.dart';

final profileProvider = FutureProvider<ProfileResponse>((ref) async {
  return ref.watch(profileRepositoryProvider).me();
});

