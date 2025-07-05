import 'package:flutter/foundation.dart';
import '../models/admin.dart';
import '../services/api_service.dart';

enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  AuthState _state = AuthState.initial;
  Admin? _currentAdmin;
  String? _errorMessage;

  AuthState get state => _state;
  Admin? get currentAdmin => _currentAdmin;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated =>
      _state == AuthState.authenticated && _currentAdmin != null;

  Future<void> checkAuthStatus() async {
    _setState(AuthState.loading);

    try {
      if (_apiService.isAuthenticated) {
        // For now, create a default admin since we don't have profile endpoint
        _currentAdmin = Admin(
          id: 'admin1',
          username: 'admin',
          email: 'admin@autoengage.com',
          name: 'Admin User',
          createdAt: DateTime.now(),
          lastLogin: DateTime.now(),
        );
        _setState(AuthState.authenticated);
      } else {
        _setState(AuthState.unauthenticated);
      }
    } catch (e) {
      _errorMessage = e.toString();
      _setState(AuthState.unauthenticated);
    }
  }

  Future<bool> login(String username, String password) async {
    _setState(AuthState.loading);

    try {
      final response = await _apiService.login(username, password);

      if (response['success'] == true) {
        // Create admin from response data
        final userData = response['data'];
        _currentAdmin = Admin(
          id: userData?['id'] ?? 'admin1',
          username: userData?['username'] ?? username,
          email: userData?['email'] ?? 'admin@autoengage.com',
          name: userData?['username'] ?? 'Admin User',
          createdAt: DateTime.now(),
          lastLogin: DateTime.now(),
        );
        _setState(AuthState.authenticated);
        return true;
      } else {
        _errorMessage = response['message'] ?? 'Login failed';
        _setState(AuthState.error);
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
      _setState(AuthState.error);
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
    } catch (e) {
      // Continue with logout even if API call fails
      debugPrint('Logout API call failed: $e');
    }

    _currentAdmin = null;
    _errorMessage = null;
    _setState(AuthState.unauthenticated);
  }

  void clearError() {
    _errorMessage = null;
    if (_state == AuthState.error) {
      _setState(AuthState.unauthenticated);
    }
  }

  void _setState(AuthState newState) {
    _state = newState;
    notifyListeners();
  }
}
