import 'package:flutter/material.dart';

class ContentLoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final Color? backgroundColor;
  final Color? progressColor;
  final Widget? loadingWidget;
  final bool showOverlay;

  const ContentLoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
    this.backgroundColor,
    this.progressColor,
    this.loadingWidget,
    this.showOverlay = true,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // The main content
        child,

        // Loading overlay
        if (isLoading && showOverlay)
          Positioned.fill(
            child: Container(
              color: backgroundColor ?? Colors.black.withOpacity(0.1),
              child: Center(
                child: loadingWidget ??
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                        progressColor ?? Theme.of(context).colorScheme.primary,
                      ),
                    ),
              ),
            ),
          ),
      ],
    );
  }
}

class RefreshIndicatorWrapper extends StatelessWidget {
  final Future<void> Function() onRefresh;
  final Widget child;
  final bool isRefreshing;
  final bool showBackgroundProgress;
  final Color? backgroundColor;
  final Color? progressColor;

  const RefreshIndicatorWrapper({
    super.key,
    required this.onRefresh,
    required this.child,
    this.isRefreshing = false,
    this.showBackgroundProgress = true,
    this.backgroundColor,
    this.progressColor,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        RefreshIndicator(
          onRefresh: onRefresh,
          child: child,
        ),

        // Show subtle background progress indicator
        if (isRefreshing && showBackgroundProgress)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: LinearProgressIndicator(
              backgroundColor: backgroundColor ?? Colors.transparent,
              color: progressColor ??
                  Theme.of(context).colorScheme.primary.withOpacity(0.5),
              minHeight: 2,
            ),
          ),
      ],
    );
  }
}
