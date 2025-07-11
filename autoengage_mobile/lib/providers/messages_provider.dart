import 'package:flutter/foundation.dart';
import '../models/message.dart';
import '../services/api_service.dart';

class MessagesProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Message> _messages = [];
  List<Message> _filteredMessages = [];
  bool _isLoading = false;
  bool _isRefreshing = false;
  bool _isInitialized = false;
  String? _errorMessage;
  String? _selectedUserId;
  String _searchQuery = '';
  String _sortOrder = 'newest';
  String _typeFilter = 'all';
  List<MessageStatus> _statusFilter = [];
  DateTime? _lastLoadTime;

  List<Message> get messages => _searchQuery.isNotEmpty ||
          _typeFilter != 'all' ||
          _statusFilter.isNotEmpty
      ? _filteredMessages
      : _messages;
  bool get isLoading => _isLoading;
  bool get isRefreshing => _isRefreshing;
  bool get isInitialized => _isInitialized;
  String? get errorMessage => _errorMessage;
  String? get selectedUserId => _selectedUserId;
  DateTime? get lastLoadTime => _lastLoadTime;

  Future<void> loadAllMessages(
      {bool refresh = false, bool silent = false}) async {
    // If already loading, prevent duplicate requests
    if (_isLoading) return;

    // Use cached data if available and not forced to refresh
    if (_isInitialized && !refresh && _messages.isNotEmpty) {
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
      _messages = await _apiService.getAllMessages();
      _applyFilters();
      _isInitialized = true;
      _lastLoadTime = DateTime.now();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
    }

    _isLoading = false;
    _isRefreshing = false;
    notifyListeners();
  }

  // Background refresh - doesn't show full loading indicator
  Future<void> refreshInBackground() async {
    await loadAllMessages(refresh: true, silent: true);
  }

  Future<void> loadUserMessages(String userId) async {
    if (_isLoading) return;

    _selectedUserId = userId;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _messages = await _apiService.getUserMessages(userId);
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> markMessageAsRead(String messageId) async {
    try {
      await _apiService.markMessageAsRead(messageId);

      // Update local message state
      final messageIndex = _messages.indexWhere((m) => m.id == messageId);
      if (messageIndex != -1) {
        _messages[messageIndex] = _messages[messageIndex].copyWith(
          status: MessageStatus.read,
          readAt: DateTime.now(),
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error marking message as read: $e');
    }
  }

  Future<bool> sendMessage({
    required String phoneNumber,
    required String message,
  }) async {
    try {
      await _apiService.sendMessage(
        phoneNumber: phoneNumber,
        message: message,
      );

      // Optionally refresh messages to include the new one
      if (_selectedUserId != null) {
        await loadUserMessages(_selectedUserId!);
      } else {
        await loadAllMessages();
      }

      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
      notifyListeners();
      return false;
    }
  }

  Future<bool> triggerFollowup() async {
    try {
      await _apiService.triggerFollowup();

      // Refresh messages to see any new follow-ups
      if (_selectedUserId != null) {
        await loadUserMessages(_selectedUserId!);
      } else {
        await loadAllMessages();
      }

      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
      notifyListeners();
      return false;
    }
  }

  Future<void> refreshMessages() async {
    if (_selectedUserId != null) {
      await loadUserMessages(_selectedUserId!);
    } else {
      await loadAllMessages();
    }
  }

  void clearMessages() {
    _messages.clear();
    _selectedUserId = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Helper methods
  List<Message> get unreadMessages => _messages
      .where((message) => message.status != MessageStatus.read)
      .toList();

  List<Message> get recentMessages {
    final sortedMessages = List<Message>.from(_messages);
    sortedMessages.sort((a, b) => b.sentAt.compareTo(a.sentAt));
    return sortedMessages.take(20).toList();
  }

  int get unreadCount => unreadMessages.length;

  Future<void> sendFollowUp(String userId) async {
    try {
      await _apiService.triggerFollowup();

      // Refresh messages to see the new follow-up
      await loadAllMessages();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
      notifyListeners();
      rethrow;
    }
  }

  void searchMessages(String query) {
    _searchQuery = query.toLowerCase();
    _applyFilters();
    notifyListeners();
  }

  void clearSearch() {
    _searchQuery = '';
    _applyFilters();
    notifyListeners();
  }

  void sortMessages(String sortOrder) {
    _sortOrder = sortOrder;
    _applyFilters();
    notifyListeners();
  }

  void filterByType(String type) {
    _typeFilter = type;
    _applyFilters();
    notifyListeners();
  }

  void filterByStatus(List<MessageStatus> statuses) {
    _statusFilter = statuses;
    _applyFilters();
    notifyListeners();
  }

  void clearFilters() {
    _searchQuery = '';
    _typeFilter = 'all';
    _statusFilter = [];
    _sortOrder = 'newest';
    _applyFilters();
    notifyListeners();
  }

  void _applyFilters() {
    _filteredMessages = List.from(_messages);

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      _filteredMessages = _filteredMessages.where((message) {
        return message.content.toLowerCase().contains(_searchQuery);
      }).toList();
    }

    // Apply type filter
    if (_typeFilter != 'all') {
      MessageType? type;
      switch (_typeFilter) {
        case 'initial':
          type = MessageType.initial;
          break;
        case 'follow_up':
          type = MessageType.followUp;
          break;
        case 'reply':
          type = MessageType.reply;
          break;
      }
      if (type != null) {
        _filteredMessages = _filteredMessages.where((message) {
          return message.type == type;
        }).toList();
      }
    }

    // Apply status filter
    if (_statusFilter.isNotEmpty) {
      _filteredMessages = _filteredMessages.where((message) {
        return _statusFilter.contains(message.status);
      }).toList();
    }

    // Apply sorting
    switch (_sortOrder) {
      case 'newest':
        _filteredMessages.sort((a, b) => b.sentAt.compareTo(a.sentAt));
        break;
      case 'oldest':
        _filteredMessages.sort((a, b) => a.sentAt.compareTo(b.sentAt));
        break;
      case 'status':
        _filteredMessages
            .sort((a, b) => a.status.index.compareTo(b.status.index));
        break;
    }
  }
}
