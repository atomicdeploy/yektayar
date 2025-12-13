package ir.yektayar.app;

import android.util.Log;
import android.view.WindowManager;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * SecureModePlugin - Prevents screenshots and screen recording
 * Used for DRM protection in sensitive content (e.g., courses)
 */
@CapacitorPlugin(name = "SecureMode")
public class SecureModePlugin extends Plugin {
    private static final String TAG = "SecureModePlugin";
    private boolean isSecureModeEnabled = false;

    /**
     * Enable secure mode - prevents screenshots and screen recording
     */
    @PluginMethod
    public void enable(PluginCall call) {
        try {
            getActivity().runOnUiThread(() -> {
                getActivity().getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE
                );
                isSecureModeEnabled = true;
                Log.i(TAG, "🔒 Secure mode enabled - screenshots blocked");
            });
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "❌ Failed to enable secure mode: " + e.getMessage());
            call.reject("Failed to enable secure mode", e);
        }
    }

    /**
     * Disable secure mode - allows screenshots again
     */
    @PluginMethod
    public void disable(PluginCall call) {
        try {
            getActivity().runOnUiThread(() -> {
                getActivity().getWindow().clearFlags(
                    WindowManager.LayoutParams.FLAG_SECURE
                );
                isSecureModeEnabled = false;
                Log.i(TAG, "🔓 Secure mode disabled - screenshots allowed");
            });
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "❌ Failed to disable secure mode: " + e.getMessage());
            call.reject("Failed to disable secure mode", e);
        }
    }

    /**
     * Check if secure mode is currently enabled
     */
    @PluginMethod
    public void isEnabled(PluginCall call) {
        call.resolve(new com.getcapacitor.JSObject().put("enabled", isSecureModeEnabled));
    }
}
