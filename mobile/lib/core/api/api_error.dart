import 'package:dio/dio.dart';

class ApiError implements Exception {
  ApiError({required this.code, required this.message});

  final String code;
  final String message;

  static ApiError fromDio(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map<String, dynamic>) {
        final code = data['error'];
        final message = data['message'];
        if (code is String && message is String) {
          return ApiError(code: code, message: message);
        }
      }
      return ApiError(
        code: 'NETWORK_ERROR',
        message: error.message ?? 'Request failed',
      );
    }
    return ApiError(code: 'UNKNOWN_ERROR', message: 'Something went wrong');
  }
}

