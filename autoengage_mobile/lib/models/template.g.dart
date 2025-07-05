// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'template.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MessageTemplate _$MessageTemplateFromJson(Map<String, dynamic> json) =>
    MessageTemplate(
      id: json['id'] as String,
      name: json['name'] as String,
      content: json['content'] as String,
      followUpDelayHours: (json['followUpDelayHours'] as num?)?.toInt() ?? 24,
      followUpContent: json['followUpContent'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      createdBy: json['createdBy'] as String,
      variables: json['variables'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$MessageTemplateToJson(MessageTemplate instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'content': instance.content,
      'followUpDelayHours': instance.followUpDelayHours,
      'followUpContent': instance.followUpContent,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'createdBy': instance.createdBy,
      'variables': instance.variables,
    };
