import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class UsersProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<User> _users = [];
  bool _isLoading = false;
  bool _isInitialized = false; // Track if data has been loaded at least once
  bool _isRefreshing = false; // Track background refresh
  String? _errorMessage;
  String _searchQuery = '';
  DateTime? _lastLoadTime;

  List<User> get users => _searchQuery.isEmpty
      ? _users
      : _users
          .where((user) =>
              user.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              user.phoneNumber.contains(_searchQuery))
          .toList();

  bool get isLoading => _isLoading;
  bool get isRefreshing => _isRefreshing;
  bool get isInitialized => _isInitialized;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;
  DateTime? get lastLoadTime => _lastLoadTime;

  // Enhanced loading method with background refresh support
  Future<void> loadUsers({bool refresh = false, bool silent = false}) async {
    // If already loading, prevent duplicate requests
    if (_isLoading) return;

    // If we have data and this isn't a forced refresh, just return the cached data
    if (_isInitialized && !refresh && _users.isNotEmpty) {
      return;
    }

    // Set appropriate loading states
    if (silent) {
      _isRefreshing = true;
    } else {
      _isLoading = true;
    }
    _errorMessage = null;
    notifyListeners();

    try {
      final newUsers = await _apiService.getAllUsers();
      _users = newUsers;
      _isInitialized = true;
      _lastLoadTime = DateTime.now();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
    }

    _isLoading = false;
    _isRefreshing = false;
    notifyListeners();
  }

  // Background refresh - doesn't show loading indicator
  Future<void> refreshInBackground() async {
    await loadUsers(refresh: true, silent: true);
  }

  void searchUsers(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void clearSearch() {
    _searchQuery = '';
    notifyListeners();
  }

  Future<void> refreshUsers() async {
    await loadUsers(refresh: true);
  }

  Future<User?> getUserById(String userId) async {
    try {
      // First check if user is already in the list
      final existingUser = _users.cast<User?>().firstWhere(
            (user) => user?.id == userId,
            orElse: () => null,
          );

      if (existingUser != null) {
        return existingUser;
      }

      // If not found, return null since we don't have getUserById endpoint
      return null;
    } catch (e) {
      debugPrint('Error getting user by ID: $e');
      return null;
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Helper methods
  int get totalUsers => _users.length;

  List<User> get activeUsers => _users.where((user) => user.isActive).toList();

  List<User> get recentUsers {
    final sortedUsers = List<User>.from(_users);
    sortedUsers.sort((a, b) => b.lastSeen.compareTo(a.lastSeen));
    return sortedUsers.take(10).toList();
  }
}
