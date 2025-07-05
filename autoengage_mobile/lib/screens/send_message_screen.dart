import 'package:flutter/material.dart';

class SendMessageScreen extends StatelessWidget {
  final String userId;

  const SendMessageScreen({
    super.key,
    required this.userId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Send Message'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.send, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text('Send message to user: $userId'),
            const SizedBox(height: 8),
            const Text('Send message screen coming soon...'),
          ],
        ),
      ),
    );
  }
}
