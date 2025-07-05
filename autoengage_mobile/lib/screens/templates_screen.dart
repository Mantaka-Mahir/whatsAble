import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';

class TemplatesScreen extends StatelessWidget {
  const TemplatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Templates'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Navigate to create template screen
            },
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.text_snippet_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Templates screen coming soon...'),
          ],
        ),
      ),
    );
  }
}
