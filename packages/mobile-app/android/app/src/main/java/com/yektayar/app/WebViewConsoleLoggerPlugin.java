package com.yektayar.app;

import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * WebViewConsoleLogger Plugin
 * 
 * This plugin bridges WebView console logs to Android logcat for debugging.
 * It intercepts console.log, console.error, console.warn, console.info, and console.debug
 * calls from the web app and forwards them to Android's Log system.
 * 
 * Usage:
 * - Automatically bridges all console.* calls when WebView is configured
 * - Logs are visible in logcat with tag "WebViewConsole"
 * - Can also be called programmatically via Capacitor plugin interface
 * 
 * To view logs via ADB:
 * adb logcat -s WebViewConsole:* YektaYar:*
 */
@CapacitorPlugin(name = "WebViewConsoleLogger")
public class WebViewConsoleLoggerPlugin extends Plugin {
    
    private static final String TAG = "YektaYar";
    
    @Override
    public void load() {
        super.load();
        Log.i(TAG, "WebViewConsoleLogger Plugin loaded");
        
        // Configure WebView to bridge console messages to logcat
        bridge.getWebView().post(() -> {
            WebView webView = bridge.getWebView();
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                    String message = consoleMessage.message();
                    String sourceId = consoleMessage.sourceId();
                    int lineNumber = consoleMessage.lineNumber();
                    
                    String logMessage = String.format("[%s:%d] %s", 
                        getFileName(sourceId), lineNumber, message);
                    
                    switch (consoleMessage.messageLevel()) {
                        case ERROR:
                            Log.e(TAG, logMessage);
                            break;
                        case WARNING:
                            Log.w(TAG, logMessage);
                            break;
                        case DEBUG:
                            Log.d(TAG, logMessage);
                            break;
                        case TIP:
                        case LOG:
                        default:
                            Log.i(TAG, logMessage);
                            break;
                    }
                    
                    return true;
                }
            });
            
            Log.i(TAG, "WebView console logging configured - logs will appear in logcat");
        });
    }
    
    /**
     * Extract filename from full path for cleaner log messages
     */
    private String getFileName(String path) {
        if (path == null || path.isEmpty()) {
            return "unknown";
        }
        
        // Extract just the filename from the full path
        int lastSlash = path.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < path.length() - 1) {
            return path.substring(lastSlash + 1);
        }
        
        return path;
    }
    
    /**
     * Manual logging method that can be called from JavaScript
     */
    @PluginMethod
    public void log(PluginCall call) {
        String level = call.getString("level", "info");
        String message = call.getString("message", "");
        
        switch (level.toLowerCase()) {
            case "error":
                Log.e(TAG, message);
                break;
            case "warn":
            case "warning":
                Log.w(TAG, message);
                break;
            case "debug":
                Log.d(TAG, message);
                break;
            case "verbose":
                Log.v(TAG, message);
                break;
            case "info":
            default:
                Log.i(TAG, message);
                break;
        }
        
        call.resolve();
    }
}
