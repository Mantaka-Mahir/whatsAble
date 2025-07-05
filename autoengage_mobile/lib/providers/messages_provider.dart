import 'package:flutter/foundation.dart';
import '../models/message.dart';
import '../services/api_service.dart';

class MessagesProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Message> _messages = [];
  bool _isLoading = false;
  String? _errorMessage;
  String? _selectedUserId;

  List<Message> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get selectedUserId => _selectedUserId;

  Future<void> loadAllMessages() async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _messages = await _apiService.getAllMessages();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException: ', '');
    }

    _isLoading = false;
    notifyListeners();
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
}
