class DashboardStats {
  final int totalUsers;
  final int totalMessages;
  final int messagesThisMonth;
  final int messagesThisWeek;
  final int pendingReplies;
  final int followUpsDue;
  final double responseRate;
  final double conversionRate;
  final Map<String, int> messagesByStatus;
  final List<DailyStats> dailyStats;

  DashboardStats({
    required this.totalUsers,
    required this.totalMessages,
    required this.messagesThisMonth,
    required this.messagesThisWeek,
    required this.pendingReplies,
    required this.followUpsDue,
    required this.responseRate,
    required this.conversionRate,
    required this.messagesByStatus,
    required this.dailyStats,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalUsers: json['totalUsers'] ?? 0,
      totalMessages: json['totalMessages'] ?? 0,
      messagesThisMonth: json['messagesThisMonth'] ?? 0,
      messagesThisWeek: json['messagesThisWeek'] ?? 0,
      pendingReplies: json['pendingReplies'] ?? 0,
      followUpsDue: json['followUpsDue'] ?? 0,
      responseRate: (json['responseRate'] ?? 0.0).toDouble(),
      conversionRate: (json['conversionRate'] ?? 0.0).toDouble(),
      messagesByStatus: Map<String, int>.from(json['messagesByStatus'] ?? {}),
      dailyStats: (json['dailyStats'] as List<dynamic>?)
              ?.map((e) => DailyStats.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalUsers': totalUsers,
      'totalMessages': totalMessages,
      'messagesThisMonth': messagesThisMonth,
      'messagesThisWeek': messagesThisWeek,
      'pendingReplies': pendingReplies,
      'followUpsDue': followUpsDue,
      'responseRate': responseRate,
      'conversionRate': conversionRate,
      'messagesByStatus': messagesByStatus,
      'dailyStats': dailyStats.map((e) => e.toJson()).toList(),
    };
  }
}

class DailyStats {
  final DateTime date;
  final int messagesSent;
  final int messagesReplied;
  final int newUsers;

  DailyStats({
    required this.date,
    required this.messagesSent,
    required this.messagesReplied,
    required this.newUsers,
  });

  factory DailyStats.fromJson(Map<String, dynamic> json) {
    return DailyStats(
      date: DateTime.parse(json['date']),
      messagesSent: json['messagesSent'] ?? 0,
      messagesReplied: json['messagesReplied'] ?? 0,
      newUsers: json['newUsers'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String(),
      'messagesSent': messagesSent,
      'messagesReplied': messagesReplied,
      'newUsers': newUsers,
    };
  }
}
