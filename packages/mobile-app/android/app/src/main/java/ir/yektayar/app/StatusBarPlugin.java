package ir.yektayar.app;

import android.os.Build;
import android.util.Log;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Plugin to control status bar appearance
 * Allows JavaScript to change status bar color and icon appearance
 */
@CapacitorPlugin(name = "StatusBar")
public class StatusBarPlugin extends Plugin {
    
    private static final String TAG = "StatusBarPlugin";
    
    /**
     * Set status bar icon style (light or dark icons)
     * @param call - PluginCall with "style" parameter
     *              "light" = light/white icons (for dark backgrounds)
     *              "dark" = dark/black icons (for light backgrounds)
     */
    @PluginMethod
    public void setStyle(PluginCall call) {
        String style = call.getString("style", "dark");
        Log.i(TAG, "📱 setStyle called with: " + style + " (Android API: " + Build.VERSION.SDK_INT + ")");
        
        getActivity().runOnUiThread(() -> {
            try {
                Window window = getActivity().getWindow();
                View decorView = window.getDecorView();
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    // Android 11+ (API 30+)
                    WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, decorView);
                    
                    if ("light".equals(style)) {
                        // Light icons = white icons for dark backgrounds
                        Log.i(TAG, "✅ Setting LIGHT icons (white) via WindowInsetsControllerCompat");
                        controller.setAppearanceLightStatusBars(false);
                    } else {
                        // Dark icons = black icons for light backgrounds
                        Log.i(TAG, "✅ Setting DARK icons (black) via WindowInsetsControllerCompat");
                        controller.setAppearanceLightStatusBars(true);
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    // Android 6.0 - 10 (API 23-29)
                    int flags = decorView.getSystemUiVisibility();
                    Log.i(TAG, "📊 Current flags: " + flags);
                    
                    if ("light".equals(style)) {
                        // Light icons = white icons for dark backgrounds
                        // Remove light status bar flag (shows white icons)
                        flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        Log.i(TAG, "✅ Setting LIGHT icons (white) via system UI flags");
                    } else {
                        // Dark icons = black icons for light backgrounds
                        // Add light status bar flag (shows black icons)
                        flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        Log.i(TAG, "✅ Setting DARK icons (black) via system UI flags");
                    }
                    
                    Log.i(TAG, "📊 New flags: " + flags);
                    decorView.setSystemUiVisibility(flags);
                } else {
                    Log.w(TAG, "⚠️ Status bar icon style not supported on API < 23");
                }
                
                Log.i(TAG, "✅ Status bar style updated successfully");
            } catch (Exception e) {
                Log.e(TAG, "❌ Error setting status bar style: " + e.getMessage(), e);
            }
        });
        
        call.resolve();
    }
    
    /**
     * Set status bar background color
     * @param call - PluginCall with "color" parameter (hex color string like "#RRGGBB")
     */
    @PluginMethod
    public void setBackgroundColor(PluginCall call) {
        String color = call.getString("color");
        
        if (color == null) {
            call.reject("Color parameter is required");
            return;
        }
        
        getActivity().runOnUiThread(() -> {
            try {
                Window window = getActivity().getWindow();
                int colorValue = android.graphics.Color.parseColor(color);
                window.setStatusBarColor(colorValue);
                call.resolve();
            } catch (Exception e) {
                call.reject("Invalid color format: " + color, e);
            }
        });
    }
    
    /**
     * Get current status bar info
     */
    @PluginMethod
    public void getInfo(PluginCall call) {
        JSObject result = new JSObject();
        result.put("visible", true);
        result.put("style", "default");
        call.resolve(result);
    }
}
