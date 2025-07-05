import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/admin.dart';
import '../models/user.dart';
import '../models/message.dart';
import '../models/template.dart';
import '../models/dashboard_stats.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message';
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String? _authToken;

  void initialize() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.apiBaseUrl,
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: ApiConfig.defaultHeaders,
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token if available
        if (_authToken != null) {
          options.headers['Authorization'] = 'Bearer $_authToken';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expired, clear storage and redirect to login
          clearAuth();
        }
        handler.next(error);
      },
    ));

    // Load saved token
    _loadAuthToken();
  }

  Future<void> _loadAuthToken() async {
    _authToken = await _storage.read(key: 'auth_token');
  }

  Future<void> _saveAuthToken(String token) async {
    _authToken = token;
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<void> clearAuth() async {
    _authToken = null;
    await _storage.delete(key: 'auth_token');
  }

  Future<T> _handleRequest<T>(Future<Response> request) async {
    try {
      final response = await request;
      return response.data;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw ApiException(ApiConfig.networkError);
      } else if (e.response?.statusCode == 401) {
        throw ApiException(ApiConfig.authError, 401);
      } else if (e.response?.statusCode == 500) {
        throw ApiException(ApiConfig.serverError, 500);
      } else {
        throw ApiException(
          e.response?.data?['message'] ?? ApiConfig.unknownError,
          e.response?.statusCode,
        );
      }
    } catch (e) {
      throw ApiException(ApiConfig.unknownError);
    }
  }

  // Authentication
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _handleRequest(
      _dio.post(ApiConfig.loginEndpoint, data: {
        'username': username,
        'password': password,
      }),
    );

    if (response['token'] != null) {
      await _saveAuthToken(response['token']);
    }

    return response;
  }

  Future<void> logout() async {
    try {
      await _handleRequest(_dio.post(ApiConfig.logoutEndpoint));
    } finally {
      await clearAuth();
    }
  }

  // Users
  Future<List<User>> getAllUsers() async {
    final response =
        await _handleRequest(_dio.get(ApiConfig.getAllUsersEndpoint));

    if (response is List) {
      return response.map((json) => User.fromJson(json)).toList();
    } else if (response['users'] != null) {
      return (response['users'] as List)
          .map((json) => User.fromJson(json))
          .toList();
    }

    return [];
  }

  // Messages
  Future<List<Message>> getAllMessages() async {
    final response =
        await _handleRequest(_dio.get(ApiConfig.getAllMessagesEndpoint));

    if (response is List) {
      return response.map((json) => Message.fromJson(json)).toList();
    } else if (response['messages'] != null) {
      return (response['messages'] as List)
          .map((json) => Message.fromJson(json))
          .toList();
    }

    return [];
  }

  Future<List<Message>> getUserMessages(String userId) async {
    final response = await _handleRequest(
        _dio.get(ApiConfig.getUserMessagesEndpoint(userId)));

    if (response is List) {
      return response.map((json) => Message.fromJson(json)).toList();
    } else if (response['messages'] != null) {
      return (response['messages'] as List)
          .map((json) => Message.fromJson(json))
          .toList();
    }

    return [];
  }

  Future<void> markMessageAsRead(String messageId) async {
    await _handleRequest(
        _dio.put(ApiConfig.markMessageReadEndpoint(messageId)));
  }

  Future<Map<String, dynamic>> sendMessage({
    required String phoneNumber,
    required String message,
  }) async {
    final response = await _handleRequest(
      _dio.post(ApiConfig.sendMessageEndpoint, data: {
        'phoneNumber': phoneNumber,
        'message': message,
      }),
    );

    return response;
  }

  Future<Map<String, dynamic>> triggerFollowup() async {
    final response =
        await _handleRequest(_dio.post(ApiConfig.triggerFollowupEndpoint));

    return response;
  }

  // Dashboard stats
  Future<DashboardStats> getDashboardStats() async {
    try {
      // Get users and messages to calculate stats
      final usersResponse = await getAllUsers();
      final messagesResponse = await getAllMessages();

      // Calculate stats from the data
      final totalUsers = usersResponse.length;
      final totalMessages = messagesResponse.length;
      final unreadMessages = messagesResponse.where((m) => !m.isRead).length;

      // Mock some additional stats - you can enhance this based on your backend data
      return DashboardStats(
        totalUsers: totalUsers,
        totalMessages: totalMessages,
        messagesThisMonth:
            (totalMessages * 0.3).round(), // Estimate 30% this month
        messagesThisWeek:
            (totalMessages * 0.1).round(), // Estimate 10% this week
        pendingReplies: unreadMessages,
        followUpsDue:
            (unreadMessages * 0.5).round(), // Estimate 50% need follow-up
        responseRate: 85.5,
        conversionRate: 12.3,
        messagesByStatus: {
          'sent': totalMessages - unreadMessages,
          'delivered': (totalMessages * 0.9).round(),
          'read': totalMessages - unreadMessages,
          'failed': (totalMessages * 0.02).round(),
        },
        dailyStats: [], // Empty for now, can be populated with real data
      );
    } catch (e) {
      // Return default stats if API fails
      return DashboardStats(
        totalUsers: 0,
        totalMessages: 0,
        messagesThisMonth: 0,
        messagesThisWeek: 0,
        pendingReplies: 0,
        followUpsDue: 0,
        responseRate: 0.0,
        conversionRate: 0.0,
        messagesByStatus: {},
        dailyStats: [],
      );
    }
  }

  // Template management (if needed later)
  Future<List<MessageTemplate>> getTemplates() async {
    // This would connect to your template endpoint when available
    return [];
  }

  Future<MessageTemplate> createTemplate(MessageTemplate template) async {
    // This would connect to your template creation endpoint when available
    throw ApiException('Template creation not implemented yet');
  }

  Future<void> updateTemplate(MessageTemplate template) async {
    // This would connect to your template update endpoint when available
    throw ApiException('Template update not implemented yet');
  }

  Future<void> deleteTemplate(String templateId) async {
    // This would connect to your template deletion endpoint when available
    throw ApiException('Template deletion not implemented yet');
  }

  // Check if user is authenticated
  bool get isAuthenticated => _authToken != null;

  String? get authToken => _authToken;
}
