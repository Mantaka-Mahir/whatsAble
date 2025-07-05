import 'package:flutter/material.dart';

class ConversationScreen extends StatelessWidget {
  final String userId;

  const ConversationScreen({
    super.key,
    required this.userId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Conversation'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.chat, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text('Conversation for user: $userId'),
            const SizedBox(height: 8),
            const Text('Conversation screen coming soon...'),
          ],
        ),
      ),
    );
  }
}
