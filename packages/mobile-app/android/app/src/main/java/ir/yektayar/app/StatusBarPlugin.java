package ir.yektayar.app;

import android.os.Build;
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
    
    /**
     * Set status bar style (light or dark icons)
     * @param call - PluginCall with "style" parameter ("light" or "dark")
     */
    @PluginMethod
    public void setStyle(PluginCall call) {
        String style = call.getString("style", "light");
        
        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            View decorView = window.getDecorView();
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                // Android 11+ (API 30+)
                WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, decorView);
                
                if ("dark".equals(style)) {
                    // Dark style = light icons (for dark backgrounds)
                    controller.setAppearanceLightStatusBars(false);
                } else {
                    // Light style = dark icons (for light backgrounds)
                    controller.setAppearanceLightStatusBars(true);
                }
            } else {
                // Android 6.0 - 10 (API 23-29)
                int flags = decorView.getSystemUiVisibility();
                
                if ("dark".equals(style)) {
                    // Dark style = light icons (for dark backgrounds)
                    // Remove light status bar flag
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                } else {
                    // Light style = dark icons (for light backgrounds)
                    // Add light status bar flag
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    }
                }
                
                decorView.setSystemUiVisibility(flags);
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
