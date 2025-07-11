import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_card.dart';
import '../widgets/app_drawer.dart';
import '../widgets/loading_overlay.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final dashboardProvider = context.read<DashboardProvider>();

      // Load data only if not already loaded
      if (!dashboardProvider.isInitialized) {
        dashboardProvider.loadDashboardStats();
      }
    });
  }

  Future<void> _refreshData() async {
    await context.read<DashboardProvider>().refreshInBackground();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // Navigate to notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
          ),
          PopupMenuButton<String>(
            onSelected: (value) async {
              if (value == 'logout') {
                final navigator = Navigator.of(context);
                final authProvider = context.read<AuthProvider>();
                await authProvider.logout();
                navigator.pushReplacementNamed('/login');
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 8),
                    Text('Logout'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: Consumer<DashboardProvider>(
        builder: (context, dashboardProvider, child) {
          // Show full loading only for initial data load
          if (dashboardProvider.isLoading && dashboardProvider.stats == null) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          // Show error if no data is available
          if (dashboardProvider.errorMessage != null &&
              dashboardProvider.stats == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Failed to load dashboard',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    dashboardProvider.errorMessage!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => dashboardProvider.refreshStats(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          // Use the RefreshIndicatorWrapper for pull-to-refresh with background loading
          return RefreshIndicatorWrapper(
            onRefresh: _refreshData,
            isRefreshing: dashboardProvider.isRefreshing,
            child: ContentLoadingOverlay(
              isLoading: dashboardProvider.isRefreshing,
              child: _buildDashboardContent(context, dashboardProvider),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDashboardContent(
      BuildContext context, DashboardProvider dashboardProvider) {
    final stats = dashboardProvider.stats;
    if (stats == null) {
      return const Center(child: Text('No data available'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome message
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Theme.of(context).primaryColor,
                        child: Text(
                          authProvider.currentAdmin?.name
                                  .substring(0, 1)
                                  .toUpperCase() ??
                              'A',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome back, ${authProvider.currentAdmin?.name ?? 'Admin'}!',
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Last updated: ${dashboardProvider.lastUpdated != null ? DateFormat('MMM dd, HH:mm').format(dashboardProvider.lastUpdated!) : 'Never'}',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                            ),
                          ],
                        ),
                      ),
                      if (dashboardProvider.isLoading)
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                    ],
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Key metrics grid
          Text(
            'Key Metrics',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.2, // Increased from 1.5 to give more height
            children: [
              StatCard(
                title: 'Total Users',
                value: stats.totalUsers.toString(),
                icon: Icons.people_outline,
                color: Colors.blue,
                onTap: () => context.go('/users'),
              ),
              StatCard(
                title: 'Total Messages',
                value: stats.totalMessages.toString(),
                icon: Icons.chat_bubble_outline,
                color: Colors.green,
                onTap: () => context.go('/messages'),
              ),
              StatCard(
                title: 'Pending Replies',
                value: stats.pendingReplies.toString(),
                icon: Icons.reply_outlined,
                color: Colors.orange,
                showBadge: stats.pendingReplies > 0,
                onTap: () => context.go('/messages'),
              ),
              StatCard(
                title: 'Follow-ups Due',
                value: stats.followUpsDue.toString(),
                icon: Icons.schedule_outlined,
                color: Colors.red,
                showBadge: stats.followUpsDue > 0,
                onTap: () => context.go('/messages'),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Response rates
          Text(
            'Performance',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: StatCard(
                  title: 'Response Rate',
                  value: '${stats.responseRate.toStringAsFixed(1)}%',
                  icon: Icons.trending_up_outlined,
                  color:
                      stats.responseRate >= 50 ? Colors.green : Colors.orange,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: StatCard(
                  title: 'Conversion Rate',
                  value: '${stats.conversionRate.toStringAsFixed(1)}%',
                  icon: Icons.transform_outlined,
                  color:
                      stats.conversionRate >= 30 ? Colors.green : Colors.orange,
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Charts
          if (stats.dailyStats.isNotEmpty) ...[
            Text(
              'Activity Overview (Last 7 Days)',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: true),
                      titlesData: FlTitlesData(
                        leftTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: true),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              if (value.toInt() < stats.dailyStats.length) {
                                final date =
                                    stats.dailyStats[value.toInt()].date;
                                return Text(DateFormat('M/d').format(date));
                              }
                              return const Text('');
                            },
                          ),
                        ),
                        topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                      ),
                      borderData: FlBorderData(show: true),
                      lineBarsData: [
                        LineChartBarData(
                          spots: stats.dailyStats.asMap().entries.map((entry) {
                            return FlSpot(
                              entry.key.toDouble(),
                              entry.value.messagesSent.toDouble(),
                            );
                          }).toList(),
                          isCurved: true,
                          color: Colors.blue,
                          barWidth: 3,
                          dotData: const FlDotData(show: false),
                        ),
                        LineChartBarData(
                          spots: stats.dailyStats.asMap().entries.map((entry) {
                            return FlSpot(
                              entry.key.toDouble(),
                              entry.value.messagesReplied.toDouble(),
                            );
                          }).toList(),
                          isCurved: true,
                          color: Colors.green,
                          barWidth: 3,
                          dotData: const FlDotData(show: false),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],

          const SizedBox(height: 32),

          // Quick actions
          Text(
            'Quick Actions',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Card(
                  child: InkWell(
                    onTap: () => context.go('/users'),
                    borderRadius: BorderRadius.circular(12),
                    child: const Padding(
                      padding: EdgeInsets.all(16),
                      child: Column(
                        children: [
                          const Icon(Icons.person_add_outlined,
                              size: 32, color: Colors.blue),
                          SizedBox(height: 8),
                          Text('Manage Users', textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Card(
                  child: InkWell(
                    onTap: () => context.go('/templates'),
                    borderRadius: BorderRadius.circular(12),
                    child: const Padding(
                      padding: EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Icon(Icons.text_snippet_outlined,
                              size: 32, color: Colors.green),
                          SizedBox(height: 8),
                          Text('Message Templates',
                              textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
