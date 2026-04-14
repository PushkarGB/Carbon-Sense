import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import 'auth_models.dart';
import 'token_storage.dart';

class AuthRepository {
  AuthRepository({required Dio dio, required TokenStorage tokenStorage})
      : _dio = dio,
        _tokenStorage = tokenStorage;

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final res = await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    final session = AuthSession.fromJson(res.data as Map<String, dynamic>);
    await _tokenStorage.writeToken(session.token);
    return session;
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
    required String city,
    required String role,
    required String profilePictureUrl,
  }) async {
    final res = await _dio.post(
      '/auth/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'city': city,
        'role': role,
        'profile_picture_url': profilePictureUrl,
      },
    );
    final session = AuthSession.fromJson(res.data as Map<String, dynamic>);
    await _tokenStorage.writeToken(session.token);
    return session;
  }

  Future<AuthUser> me() async {
    final res = await _dio.get('/auth/me');
    return AuthUser.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> logout() async => _tokenStorage.deleteToken();
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(dioProvider);
  final tokenStorage = ref.watch(tokenStorageProvider);
  return AuthRepository(dio: dio, tokenStorage: tokenStorage);
});

