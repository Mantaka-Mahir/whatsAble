class ApiConfig {
  // Backend server configuration
  // Use localhost:5000 for web/iOS simulator, 10.0.2.2:5000 for Android emulator
  static const String baseUrl = 'http://localhost:5000';
  static const String androidEmulatorUrl = 'http://10.0.2.2:5000';

  // Get the appropriate base URL based on platform
  static String get apiBaseUrl {
    // In production, you might want to detect platform
    // For now, using localhost for web testing
    return baseUrl; // Remove /api from base URL since routes handle their own paths
  }

  // API Endpoints matching your Node.js backend structure
  static const String authEndpoint = '/auth';
  static const String usersEndpoint = '/api/users';
  static const String messagesEndpoint = '/api/messages';
  static const String webhookEndpoint = '/api/webhook';
  static const String simulateFollowupEndpoint = '/api/simulate-followup';

  // Auth endpoints - matching your Node.js backend
  static const String loginEndpoint = '/auth/api/login';
  static const String logoutEndpoint = '/auth/api/logout';
  static const String profileEndpoint = '/auth/api/me';

  // User endpoints
  static String get getAllUsersEndpoint => usersEndpoint;

  // Message endpoints
  static String get getAllMessagesEndpoint => messagesEndpoint;
  static String getUserMessagesEndpoint(String userId) =>
      '$messagesEndpoint/$userId';
  static String markMessageReadEndpoint(String messageId) =>
      '$messagesEndpoint/$messageId/read';
  static String get sendMessageEndpoint => webhookEndpoint;
  static String get triggerFollowupEndpoint => simulateFollowupEndpoint;

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Headers
  static Map<String, String> get defaultHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  static Map<String, String> authHeaders(String token) => {
        ...defaultHeaders,
        'Authorization': 'Bearer $token',
      };

  // Error messages
  static const String networkError =
      'Network connection failed. Please check your internet connection.';
  static const String serverError =
      'Server error occurred. Please try again later.';
  static const String authError = 'Authentication failed. Please login again.';
  static const String unknownError =
      'An unknown error occurred. Please try again.';
}
