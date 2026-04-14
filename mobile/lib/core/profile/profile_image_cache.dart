import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final profileImageCacheProvider = Provider<ProfileImageCache>((ref) {
  return ProfileImageCache();
});

class ProfileImageCache {
  static const _keyUrl = 'profile.avatar.url';

  Future<String?> readCachedUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUrl);
  }

  Future<void> writeCachedUrl(String? url) async {
    final prefs = await SharedPreferences.getInstance();
    if (url == null || url.isEmpty) {
      await prefs.remove(_keyUrl);
    } else {
      await prefs.setString(_keyUrl, url);
    }
  }
}

