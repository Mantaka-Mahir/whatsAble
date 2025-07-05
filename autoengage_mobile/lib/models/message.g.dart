// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Message _$MessageFromJson(Map<String, dynamic> json) => Message(
      id: json['id'] as String,
      userId: json['userId'] as String,
      content: json['content'] as String,
      type: $enumDecode(_$MessageTypeEnumMap, json['type']),
      status: $enumDecode(_$MessageStatusEnumMap, json['status']),
      sentAt: DateTime.parse(json['sentAt'] as String),
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
      repliedAt: json['repliedAt'] == null
          ? null
          : DateTime.parse(json['repliedAt'] as String),
      replyContent: json['replyContent'] as String?,
      templateId: json['templateId'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$MessageToJson(Message instance) => <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'content': instance.content,
      'type': _$MessageTypeEnumMap[instance.type]!,
      'status': _$MessageStatusEnumMap[instance.status]!,
      'sentAt': instance.sentAt.toIso8601String(),
      'readAt': instance.readAt?.toIso8601String(),
      'repliedAt': instance.repliedAt?.toIso8601String(),
      'replyContent': instance.replyContent,
      'templateId': instance.templateId,
      'metadata': instance.metadata,
    };

const _$MessageTypeEnumMap = {
  MessageType.initial: 'initial',
  MessageType.followUp: 'follow_up',
  MessageType.reply: 'reply',
};

const _$MessageStatusEnumMap = {
  MessageStatus.sent: 'sent',
  MessageStatus.delivered: 'delivered',
  MessageStatus.read: 'read',
  MessageStatus.replied: 'replied',
  MessageStatus.followUpSent: 'follow_up_sent',
  MessageStatus.failed: 'failed',
};
