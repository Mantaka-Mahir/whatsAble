import 'package:json_annotation/json_annotation.dart';

part 'template.g.dart';

@JsonSerializable()
class MessageTemplate {
  final String id;
  final String name;
  final String content;
  final int followUpDelayHours;
  final String? followUpContent;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String createdBy;
  final Map<String, dynamic>? variables;

  MessageTemplate({
    required this.id,
    required this.name,
    required this.content,
    this.followUpDelayHours = 24,
    this.followUpContent,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
    required this.createdBy,
    this.variables,
  });

  factory MessageTemplate.fromJson(Map<String, dynamic> json) =>
      _$MessageTemplateFromJson(json);
  Map<String, dynamic> toJson() => _$MessageTemplateToJson(this);

  MessageTemplate copyWith({
    String? id,
    String? name,
    String? content,
    int? followUpDelayHours,
    String? followUpContent,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? createdBy,
    Map<String, dynamic>? variables,
  }) {
    return MessageTemplate(
      id: id ?? this.id,
      name: name ?? this.name,
      content: content ?? this.content,
      followUpDelayHours: followUpDelayHours ?? this.followUpDelayHours,
      followUpContent: followUpContent ?? this.followUpContent,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      createdBy: createdBy ?? this.createdBy,
      variables: variables ?? this.variables,
    );
  }

  bool get hasFollowUp =>
      followUpContent != null && followUpContent!.isNotEmpty;

  String processContent(Map<String, String> replacements) {
    String processed = content;
    replacements.forEach((key, value) {
      processed = processed.replaceAll('{{$key}}', value);
    });
    return processed;
  }

  @override
  String toString() {
    return 'MessageTemplate(id: $id, name: $name, isActive: $isActive)';
  }
}
