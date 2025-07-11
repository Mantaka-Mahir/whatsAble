import 'package:flutter/material.dart';
import '../widgets/loading_overlay.dart';

class ConversationScreen extends StatefulWidget {
  final String userId;

  const ConversationScreen({
    super.key,
    required this.userId,
  });

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  bool _isLoading = false;

  // Simulate loading for demo
  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));
    setState(() => _isLoading = false);
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Conversation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
          ),
        ],
      ),
      body: ContentLoadingOverlay(
        isLoading: _isLoading,
        child: RefreshIndicatorWrapper(
          onRefresh: _refreshData,
          isRefreshing: _isLoading,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 60),
                    const Icon(Icons.chat, size: 64, color: Colors.grey),
                    const SizedBox(height: 16),
                    Text('Conversation for user: ${widget.userId}'),
                    const SizedBox(height: 8),
                    const Text('Conversation screen coming soon...'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
