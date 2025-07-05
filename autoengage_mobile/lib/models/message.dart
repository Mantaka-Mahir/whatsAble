import 'package:json_annotation/json_annotation.dart';

part 'message.g.dart';

enum MessageStatus {
  @JsonValue('sent')
  sent,
  @JsonValue('delivered')
  delivered,
  @JsonValue('read')
  read,
  @JsonValue('replied')
  replied,
  @JsonValue('follow_up_sent')
  followUpSent,
  @JsonValue('failed')
  failed,
}

enum MessageType {
  @JsonValue('initial')
  initial,
  @JsonValue('follow_up')
  followUp,
  @JsonValue('reply')
  reply,
}

@JsonSerializable()
class Message {
  final String id;
  final String userId;
  final String content;
  final MessageType type;
  final MessageStatus status;
  final DateTime sentAt;
  final DateTime? readAt;
  final DateTime? repliedAt;
  final String? replyContent;
  final String? templateId;
  final Map<String, dynamic>? metadata;

  Message({
    required this.id,
    required this.userId,
    required this.content,
    required this.type,
    required this.status,
    required this.sentAt,
    this.readAt,
    this.repliedAt,
    this.replyContent,
    this.templateId,
    this.metadata,
  });

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);

  Message copyWith({
    String? id,
    String? userId,
    String? content,
    MessageType? type,
    MessageStatus? status,
    DateTime? sentAt,
    DateTime? readAt,
    DateTime? repliedAt,
    String? replyContent,
    String? templateId,
    Map<String, dynamic>? metadata,
  }) {
    return Message(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      content: content ?? this.content,
      type: type ?? this.type,
      status: status ?? this.status,
      sentAt: sentAt ?? this.sentAt,
      readAt: readAt ?? this.readAt,
      repliedAt: repliedAt ?? this.repliedAt,
      replyContent: replyContent ?? this.replyContent,
      templateId: templateId ?? this.templateId,
      metadata: metadata ?? this.metadata,
    );
  }

  bool get hasReply => replyContent != null && replyContent!.isNotEmpty;
  bool get isRead =>
      status == MessageStatus.read || status == MessageStatus.replied;
  bool get needsFollowUp => status == MessageStatus.read && !hasReply;

  @override
  String toString() {
    return 'Message(id: $id, userId: $userId, type: $type, status: $status)';
  }
}
