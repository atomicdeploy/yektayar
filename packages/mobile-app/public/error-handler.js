/**
 * Global error handler to prevent white screen
 * This must load before the main application module
 */
(function() {
  // Global error handler
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error || event.message);
    showErrorScreen(
      'Application Error',
      'The application encountered an error and cannot start.',
      event.error ? (event.error.stack || event.error.message) : event.message
    );
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorScreen(
      'Promise Rejection',
      'The application encountered an error and cannot start.',
      event.reason ? (event.reason.stack || event.reason.message || String(event.reason)) : 'Unknown error'
    );
  });

  // Display error screen in the UI
  function showErrorScreen(title, message, details) {
    var app = document.getElementById('app');
    if (!app) return;
    
    // Detect if dark mode is preferred
    var isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Theme-aware colors for better readability (WCAG AA compliant)
    var bgColor = isDarkMode ? '#0a0f1a' : '#f8f9fa';
    var containerBg = isDarkMode ? '#1a2332' : '#ffffff';
    var titleColor = isDarkMode ? '#ff6b6b' : '#c92a2a';  // Improved contrast for light mode
    var messageColor = isDarkMode ? '#e8e9ed' : '#212529';  // Darker text for light mode
    var detailsBg = isDarkMode ? '#0d1520' : '#f8f9fa';
    var detailsColor = isDarkMode ? '#a0a3a8' : '#495057';
    var borderColor = isDarkMode ? '#2d3748' : '#dee2e6';
    
    app.innerHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: ' + bgColor + '; display: flex; align-items: center; justify-content: center; z-index: 9999;">' +
      '<div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 2rem; max-width: 600px; background: ' + containerBg + '; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">' +
      '<div style="font-size: 5rem; margin-bottom: 1.5rem;">❌</div>' +
      '<h1 style="font-size: 1.75rem; font-weight: bold; color: ' + titleColor + '; margin-bottom: 1rem;">' + escapeHtml(title) + '</h1>' +
      '<p style="font-size: 1.125rem; color: ' + messageColor + '; margin-bottom: 1.5rem; line-height: 1.6;">' + escapeHtml(message) + '</p>' +
      '<div style="background: ' + detailsBg + '; border: 1px solid ' + borderColor + '; border-radius: 0.5rem; padding: 1rem; width: 100%;">' +
      '<p style="font-size: 0.875rem; color: ' + detailsColor + '; margin: 0; font-family: monospace; word-break: break-word; text-align: left;">' + escapeHtml(details) + '</p>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  // HTML escape utility
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
