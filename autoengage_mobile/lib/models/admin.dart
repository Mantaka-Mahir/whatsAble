import 'package:json_annotation/json_annotation.dart';

part 'admin.g.dart';

@JsonSerializable()
class Admin {
  final String id;
  final String username;
  final String email;
  final String name;
  final DateTime createdAt;
  final DateTime lastLogin;
  final bool isActive;
  final List<String> permissions;

  Admin({
    required this.id,
    required this.username,
    required this.email,
    required this.name,
    required this.createdAt,
    required this.lastLogin,
    this.isActive = true,
    this.permissions = const [],
  });

  factory Admin.fromJson(Map<String, dynamic> json) => _$AdminFromJson(json);
  Map<String, dynamic> toJson() => _$AdminToJson(this);

  Admin copyWith({
    String? id,
    String? username,
    String? email,
    String? name,
    DateTime? createdAt,
    DateTime? lastLogin,
    bool? isActive,
    List<String>? permissions,
  }) {
    return Admin(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      name: name ?? this.name,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
      isActive: isActive ?? this.isActive,
      permissions: permissions ?? this.permissions,
    );
  }

  bool hasPermission(String permission) {
    return permissions.contains(permission) || permissions.contains('admin');
  }

  @override
  String toString() {
    return 'Admin(id: $id, username: $username, email: $email, isActive: $isActive)';
  }
}
