import 'package:flutter/foundation.dart';
import '../models/dashboard_stats.dart';
import '../services/api_service.dart';

class DashboardProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  DashboardStats? _stats;
  bool _isLoading = false;
  bool _isRefreshing = false; // For background refresh
  bool _isInitialized = false;
  String? _errorMessage;
  DateTime? _lastUpdated;

  DashboardStats? get stats => _stats;
  bool get isLoading => _isLoading;
  bool get isRefreshing => _isRefreshing;
  bool get isInitialized => _isInitialized;
  String? get errorMessage => _errorMessage;
  DateTime? get lastUpdated => _lastUpdated;

  bool get shouldRefresh {
    if (_lastUpdated == null) return true;
    final now = DateTime.now();
    final difference = now.difference(_lastUpdated!);
    return difference.inMinutes > 5; // Refresh every 5 minutes
  }

  Future<void> loadDashboardStats(
      {bool forceRefresh = false, bool silent = false}) async {
    if (_isLoading) return;

    if (!forceRefresh && !shouldRefresh && _stats != null) {
      return; // Use cached data
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
      _stats = await _apiService.getDashboardStats();
      _lastUpdated = DateTime.now();
      _isInitialized = true;
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
      debugPrint('Error loading dashboard stats: $e');
    } finally {
      _isLoading = false;
      _isRefreshing = false;
      notifyListeners();
    }
  }

  Future<void> refreshStats() async {
    await loadDashboardStats(forceRefresh: true, silent: false);
  }

  Future<void> refreshInBackground() async {
    await loadDashboardStats(forceRefresh: true, silent: true);
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Helper getters for quick access to key metrics
  int get totalUsers => _stats?.totalUsers ?? 0;
  int get totalMessages => _stats?.totalMessages ?? 0;
  int get pendingReplies => _stats?.pendingReplies ?? 0;
  int get followUpsDue => _stats?.followUpsDue ?? 0;
  double get responseRate => _stats?.responseRate ?? 0.0;
  double get conversionRate => _stats?.conversionRate ?? 0.0;
}
