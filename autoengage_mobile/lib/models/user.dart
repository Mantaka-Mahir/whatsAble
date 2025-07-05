import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String phoneNumber;
  final String name;
  final DateTime createdAt;
  final DateTime lastSeen;
  final bool isActive;
  final Map<String, dynamic>? metadata;

  User({
    required this.id,
    required this.phoneNumber,
    required this.name,
    required this.createdAt,
    required this.lastSeen,
    this.isActive = true,
    this.metadata,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  User copyWith({
    String? id,
    String? phoneNumber,
    String? name,
    DateTime? createdAt,
    DateTime? lastSeen,
    bool? isActive,
    Map<String, dynamic>? metadata,
  }) {
    return User(
      id: id ?? this.id,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      name: name ?? this.name,
      createdAt: createdAt ?? this.createdAt,
      lastSeen: lastSeen ?? this.lastSeen,
      isActive: isActive ?? this.isActive,
      metadata: metadata ?? this.metadata,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, phoneNumber: $phoneNumber, name: $name, isActive: $isActive)';
  }
}
