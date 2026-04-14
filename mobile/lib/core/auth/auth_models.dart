class AuthUser {
  AuthUser({
    required this.name,
    required this.email,
    required this.city,
    required this.role,
    required this.profilePictureUrl,
    required this.onboardingCompleted,
  });

  final String name;
  final String email;
  final String city;
  final String role;
  final String? profilePictureUrl;
  final bool? onboardingCompleted;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      name: (json['name'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      city: (json['city'] ?? '') as String,
      role: (json['role'] ?? '') as String,
      profilePictureUrl: json['profile_picture_url'] as String?,
      onboardingCompleted: json['onboarding_completed'] as bool?,
    );
  }
}

class AuthSession {
  AuthSession({required this.token, required this.user});

  final String token;
  final AuthUser user;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      token: (json['access_token'] ?? '') as String,
      user: AuthUser.fromJson((json['user'] ?? const {}) as Map<String, dynamic>),
    );
  }
}

