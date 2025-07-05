import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class UsersProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<User> _users = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';

  List<User> get users => _searchQuery.isEmpty
      ? _users
      : _users
          .where((user) =>
              user.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              user.phoneNumber.contains(_searchQuery))
          .toList();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;

  Future<void> loadUsers({bool refresh = false}) async {
    if (_isLoading) return;

    if (refresh) {
      _users.clear();
      _currentPage = 1;
      _hasMore = true;
    }

    if (!_hasMore && !refresh) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final newUsers = await _apiService.getAllUsers();

      if (refresh) {
        _users = newUsers;
      } else {
        _users.addAll(newUsers);
      }

      _hasMore =
          newUsers.length == 20; // If we got a full page, there might be more
      _currentPage++;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
      debugPrint('Error loading users: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshUsers() async {
    await loadUsers(refresh: true);
  }

  void searchUsers(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void clearSearch() {
    _searchQuery = '';
    notifyListeners();
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
