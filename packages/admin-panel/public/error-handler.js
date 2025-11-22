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
    
    app.innerHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #f8f9fa; display: flex; align-items: center; justify-content: center; z-index: 9999;">' +
      '<div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 2rem; max-width: 600px;">' +
      '<div style="font-size: 5rem; margin-bottom: 1.5rem;">❌</div>' +
      '<h1 style="font-size: 1.75rem; font-weight: bold; color: #dc3545; margin-bottom: 1rem;">' + escapeHtml(title) + '</h1>' +
      '<p style="font-size: 1.125rem; color: #495057; margin-bottom: 1.5rem; line-height: 1.6;">' + escapeHtml(message) + '</p>' +
      '<div style="background: #fff; border: 1px solid #dee2e6; border-radius: 0.5rem; padding: 1rem; width: 100%;">' +
      '<p style="font-size: 0.875rem; color: #6c757d; margin: 0; font-family: monospace; word-break: break-word; text-align: left;">' + escapeHtml(details) + '</p>' +
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
