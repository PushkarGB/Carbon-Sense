import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

import '../config/app_config.dart';

class CloudinaryUploader {
  CloudinaryUploader(this._dio);

  final Dio _dio;

  Future<String> uploadProfilePicture(XFile file) async {
    final cloudName = AppConfig.cloudinaryCloudName.trim();
    final preset = AppConfig.cloudinaryUploadPreset.trim();
    if (cloudName.isEmpty || preset.isEmpty) {
      throw StateError('Missing Cloudinary config.');
    }

    final uri = 'https://api.cloudinary.com/v1_1/$cloudName/image/upload';
    final form = FormData.fromMap({
      'upload_preset': preset,
      'file': await MultipartFile.fromFile(
        file.path,
        filename: file.name,
      ),
    });

    final res = await _dio.post(uri, data: form);
    final data = res.data as Map<String, dynamic>;
    final url = (data['secure_url'] ?? data['url']) as String?;
    if (url == null || url.isEmpty) {
      throw StateError('Cloudinary response missing URL.');
    }
    return url;
  }
}

