import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';
import '../widgets/loading_overlay.dart';

class TemplatesScreen extends StatefulWidget {
  const TemplatesScreen({super.key});

  @override
  State<TemplatesScreen> createState() => _TemplatesScreenState();
}

class _TemplatesScreenState extends State<TemplatesScreen> {
  bool _isLoading = false;

  // Simulate loading for demo
  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Templates'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Navigate to create template screen
            },
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: ContentLoadingOverlay(
        isLoading: _isLoading,
        child: RefreshIndicatorWrapper(
          onRefresh: _refreshData,
          isRefreshing: _isLoading,
          child: ListView(
            children: const [
              SizedBox(height: 80),
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.text_snippet_outlined,
                        size: 64, color: Colors.grey),
                    SizedBox(height: 16),
                    Text('Templates screen coming soon...'),
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
