import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/messages_provider.dart';
import '../providers/users_provider.dart';
import '../models/message.dart';
import '../models/user.dart';
import '../widgets/app_drawer.dart';
import '../widgets/loading_overlay.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen>
    with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'all';
  String _selectedSort = 'newest';
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final messagesProvider = context.read<MessagesProvider>();
      final usersProvider = context.read<UsersProvider>();

      // Load data only if not already loaded
      if (!messagesProvider.isInitialized) {
        messagesProvider.loadAllMessages();
      }

      if (!usersProvider.isInitialized) {
        usersProvider.loadUsers();
      }
    });

    _searchController.addListener(() {
      context.read<MessagesProvider>().searchMessages(_searchController.text);
    });
  }

  Future<void> _refreshData() async {
    await Future.wait([
      context.read<MessagesProvider>().refreshInBackground(),
      context.read<UsersProvider>().refreshInBackground()
    ]);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Sent'),
            Tab(text: 'Delivered'),
            Tab(text: 'Read'),
          ],
        ),
      ),
      drawer: const AppDrawer(),
      body: Consumer<MessagesProvider>(
        builder: (context, messagesProvider, child) {
          // Show loading indicator only on first load
          if (messagesProvider.isLoading && messagesProvider.messages.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          // Show error if no data and we have an error
          if (messagesProvider.errorMessage != null &&
              messagesProvider.messages.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'Failed to load messages',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    messagesProvider.errorMessage!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () =>
                        messagesProvider.loadAllMessages(refresh: true),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return ContentLoadingOverlay(
            isLoading: messagesProvider.isRefreshing,
            child: Column(
              children: [
                _buildSearchAndFilters(),
                Expanded(
                  child: RefreshIndicatorWrapper(
                    onRefresh: _refreshData,
                    isRefreshing: messagesProvider.isRefreshing,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildMessagesList(),
                        _buildMessagesList(statusFilter: MessageStatus.sent),
                        _buildMessagesList(
                            statusFilter: MessageStatus.delivered),
                        _buildMessagesList(statusFilter: MessageStatus.read),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showSendMessageDialog(),
        icon: const Icon(Icons.send),
        label: const Text('Send Message'),
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search messages...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        context.read<MessagesProvider>().clearSearch();
                      },
                    )
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: Colors.grey[50],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedSort,
                  decoration: InputDecoration(
                    labelText: 'Sort by',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'newest', child: Text('Newest')),
                    DropdownMenuItem(value: 'oldest', child: Text('Oldest')),
                    DropdownMenuItem(value: 'status', child: Text('Status')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedSort = value!;
                    });
                    context.read<MessagesProvider>().sortMessages(value!);
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedFilter,
                  decoration: InputDecoration(
                    labelText: 'Type',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('All Types')),
                    DropdownMenuItem(value: 'initial', child: Text('Initial')),
                    DropdownMenuItem(
                        value: 'follow_up', child: Text('Follow-up')),
                    DropdownMenuItem(value: 'reply', child: Text('Reply')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedFilter = value!;
                    });
                    context.read<MessagesProvider>().filterByType(value!);
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMessagesList({MessageStatus? statusFilter}) {
    return Consumer2<MessagesProvider, UsersProvider>(
      builder: (context, messagesProvider, usersProvider, child) {
        List<Message> messages = messagesProvider.messages;
        if (statusFilter != null) {
          messages = messages.where((m) => m.status == statusFilter).toList();
        }

        if (messages.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.chat_bubble_outline,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  statusFilter != null
                      ? 'No ${statusFilter.toString().split('.').last} messages found'
                      : 'No messages found',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Messages will appear here once sent',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          itemCount: messages.length,
          padding: const EdgeInsets.all(16),
          itemBuilder: (context, index) {
            final message = messages[index];
            final user = usersProvider.users
                .where((u) => u.id == message.userId)
                .firstOrNull;

            return _buildMessageCard(message, user);
          },
        );
      },
    );
  }

  Widget _buildMessageCard(Message message, User? user) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showMessageDetails(message, user),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: _getStatusColor(message.status),
                    child: Text(
                      user?.name.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                user?.name ?? 'Unknown User',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            _buildStatusChip(message.status),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          user?.phoneNumber ?? 'No phone',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                message.content,
                style: const TextStyle(fontSize: 14),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildTypeChip(message.type),
                  const Spacer(),
                  Text(
                    DateFormat('MMM dd, yyyy • HH:mm').format(message.sentAt),
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              if (message.status == MessageStatus.read &&
                  message.readAt != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    children: [
                      Icon(
                        Icons.visibility,
                        size: 14,
                        color: Colors.grey[500],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Read ${DateFormat('MMM dd • HH:mm').format(message.readAt!)}',
                        style: TextStyle(
                          color: Colors.grey[500],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              if (message.status == MessageStatus.replied &&
                  message.repliedAt != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.reply,
                          size: 14,
                          color: Colors.blue[700],
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            message.replyContent ?? 'Customer replied',
                            style: TextStyle(
                              color: Colors.blue[700],
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(MessageStatus status) {
    Color color = _getStatusColor(status);
    IconData icon = _getStatusIcon(status);
    String label = _getStatusLabel(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeChip(MessageType type) {
    Color color;
    String label;

    switch (type) {
      case MessageType.initial:
        color = Colors.blue;
        label = 'Initial';
        break;
      case MessageType.followUp:
        color = Colors.orange;
        label = 'Follow-up';
        break;
      case MessageType.reply:
        color = Colors.green;
        label = 'Reply';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Color _getStatusColor(MessageStatus status) {
    switch (status) {
      case MessageStatus.sent:
        return Colors.blue;
      case MessageStatus.delivered:
        return Colors.orange;
      case MessageStatus.read:
        return Colors.green;
      case MessageStatus.replied:
        return Colors.purple;
      case MessageStatus.followUpSent:
        return Colors.teal;
      case MessageStatus.failed:
        return Colors.red;
    }
  }

  IconData _getStatusIcon(MessageStatus status) {
    switch (status) {
      case MessageStatus.sent:
        return Icons.send;
      case MessageStatus.delivered:
        return Icons.done;
      case MessageStatus.read:
        return Icons.done_all;
      case MessageStatus.replied:
        return Icons.reply;
      case MessageStatus.followUpSent:
        return Icons.forward;
      case MessageStatus.failed:
        return Icons.error;
    }
  }

  String _getStatusLabel(MessageStatus status) {
    switch (status) {
      case MessageStatus.sent:
        return 'Sent';
      case MessageStatus.delivered:
        return 'Delivered';
      case MessageStatus.read:
        return 'Read';
      case MessageStatus.replied:
        return 'Replied';
      case MessageStatus.followUpSent:
        return 'Follow-up';
      case MessageStatus.failed:
        return 'Failed';
    }
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Options'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Quick filter actions:'),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.schedule),
              title: const Text('Show Pending'),
              onTap: () {
                Navigator.pop(context);
                context.read<MessagesProvider>().filterByStatus([
                  MessageStatus.sent,
                  MessageStatus.delivered,
                ]);
              },
            ),
            ListTile(
              leading: const Icon(Icons.check_circle),
              title: const Text('Show Completed'),
              onTap: () {
                Navigator.pop(context);
                context.read<MessagesProvider>().filterByStatus([
                  MessageStatus.read,
                  MessageStatus.replied,
                ]);
              },
            ),
            ListTile(
              leading: const Icon(Icons.error),
              title: const Text('Show Failed'),
              onTap: () {
                Navigator.pop(context);
                context.read<MessagesProvider>().filterByStatus([
                  MessageStatus.failed,
                ]);
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<MessagesProvider>().clearFilters();
            },
            child: const Text('Clear Filters'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showMessageDetails(Message message, User? user) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Container(
          padding: const EdgeInsets.all(24),
          constraints: const BoxConstraints(maxWidth: 500),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: _getStatusColor(message.status),
                    child: Text(
                      user?.name.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'Unknown User',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          user?.phoneNumber ?? 'No phone',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  _buildStatusChip(message.status),
                  const SizedBox(width: 8),
                  _buildTypeChip(message.type),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  message.content,
                  style: const TextStyle(fontSize: 16),
                ),
              ),
              const SizedBox(height: 16),
              _buildTimeline(message),
              const SizedBox(height: 24),
              Row(
                children: [
                  if (message.status == MessageStatus.read)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _sendFollowUp(message.userId);
                        },
                        icon: const Icon(Icons.forward),
                        label: const Text('Send Follow-up'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  if (message.status == MessageStatus.read)
                    const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _showSendMessageDialog(userId: message.userId);
                      },
                      icon: const Icon(Icons.send),
                      label: const Text('Send New'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeline(Message message) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Timeline',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        _buildTimelineItem(
          'Sent',
          DateFormat('MMM dd, yyyy • HH:mm').format(message.sentAt),
          Icons.send,
          Colors.blue,
          isCompleted: true,
        ),
        if (message.status.index >= MessageStatus.delivered.index)
          _buildTimelineItem(
            'Delivered',
            'Message delivered to WhatsApp',
            Icons.done,
            Colors.orange,
            isCompleted: true,
          ),
        if (message.readAt != null)
          _buildTimelineItem(
            'Read',
            DateFormat('MMM dd, yyyy • HH:mm').format(message.readAt!),
            Icons.done_all,
            Colors.green,
            isCompleted: true,
          ),
        if (message.repliedAt != null)
          _buildTimelineItem(
            'Reply Received',
            DateFormat('MMM dd, yyyy • HH:mm').format(message.repliedAt!),
            Icons.reply,
            Colors.purple,
            isCompleted: true,
          ),
        if (message.status == MessageStatus.failed)
          _buildTimelineItem(
            'Failed',
            'Message delivery failed',
            Icons.error,
            Colors.red,
            isCompleted: true,
          ),
      ],
    );
  }

  Widget _buildTimelineItem(
    String title,
    String subtitle,
    IconData icon,
    Color color, {
    bool isCompleted = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isCompleted ? color : Colors.grey[300],
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 16,
              color: isCompleted ? Colors.white : Colors.grey[600],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: isCompleted ? Colors.black : Colors.grey[600],
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showSendMessageDialog({String? userId}) {
    final messageController = TextEditingController();
    String? selectedUserId = userId;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Send Message'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (userId == null)
                Consumer<UsersProvider>(
                  builder: (context, usersProvider, child) {
                    return DropdownButtonFormField<String>(
                      value: selectedUserId,
                      decoration: const InputDecoration(
                        labelText: 'Select Customer',
                        border: OutlineInputBorder(),
                      ),
                      items: usersProvider.users
                          .map(
                            (user) => DropdownMenuItem(
                              value: user.id,
                              child: Text('${user.name} (${user.phoneNumber})'),
                            ),
                          )
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          selectedUserId = value;
                        });
                      },
                    );
                  },
                ),
              if (userId == null) const SizedBox(height: 16),
              TextField(
                controller: messageController,
                decoration: const InputDecoration(
                  labelText: 'Message',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 4,
                maxLength: 1000,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: selectedUserId != null &&
                      messageController.text.trim().isNotEmpty
                  ? () {
                      Navigator.pop(context);
                      _sendMessage(
                          selectedUserId!, messageController.text.trim());
                    }
                  : null,
              child: const Text('Send'),
            ),
          ],
        ),
      ),
    );
  }

  void _sendMessage(String userId, String content) async {
    try {
      // Get user's phone number first
      final user = context
          .read<UsersProvider>()
          .users
          .where((u) => u.id == userId)
          .firstOrNull;

      if (user == null) {
        _showErrorToast('User not found');
        return;
      }

      await context.read<MessagesProvider>().sendMessage(
            phoneNumber: user.phoneNumber,
            message: content,
          );
      _showSuccessToast('Message sent successfully!');
    } catch (e) {
      _showErrorToast('Failed to send message: $e');
    }
  }

  void _sendFollowUp(String userId) async {
    try {
      await context.read<MessagesProvider>().sendFollowUp(userId);
      _showSuccessToast('Follow-up sent successfully!');
    } catch (e) {
      _showErrorToast('Failed to send follow-up: $e');
    }
  }

  void _showSuccessToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 8),
            Text(message),
          ],
        ),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  void _showErrorToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}
