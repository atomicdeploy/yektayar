package ir.yektayar.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Plugin to provide bidirectional communication between Java/Kotlin and JavaScript
 * Allows JavaScript to call Java methods and Java to send events to JavaScript
 */
@CapacitorPlugin(name = "JSBridge")
public class JSBridgePlugin extends Plugin {
    
    /**
     * Echo method - returns the input message
     * Useful for testing the bridge communication
     */
    @PluginMethod
    public void echo(PluginCall call) {
        String message = call.getString("message", "");
        
        JSObject result = new JSObject();
        result.put("message", message);
        result.put("timestamp", System.currentTimeMillis());
        
        call.resolve(result);
    }
    
    /**
     * Send event from Java to JavaScript
     * This method can be called from other Java code to notify JavaScript
     */
    public void sendEventToJS(String eventName, JSObject data) {
        notifyListeners(eventName, data);
    }
    
    /**
     * Get device info
     */
    @PluginMethod
    public void getDeviceInfo(PluginCall call) {
        JSObject result = new JSObject();
        result.put("manufacturer", android.os.Build.MANUFACTURER);
        result.put("model", android.os.Build.MODEL);
        result.put("osVersion", android.os.Build.VERSION.RELEASE);
        result.put("sdkVersion", android.os.Build.VERSION.SDK_INT);
        
        call.resolve(result);
    }
    
    /**
     * Show a toast message
     */
    @PluginMethod
    public void showToast(PluginCall call) {
        String message = call.getString("message", "");
        int duration = call.getInt("duration", 0); // 0 = SHORT, 1 = LONG
        
        getActivity().runOnUiThread(() -> {
            android.widget.Toast.makeText(
                getContext(),
                message,
                duration == 1 ? android.widget.Toast.LENGTH_LONG : android.widget.Toast.LENGTH_SHORT
            ).show();
        });
        
        call.resolve();
    }
    
    /**
     * Perform a custom action
     * This is a template method that can be extended for specific use cases
     */
    @PluginMethod
    public void performAction(PluginCall call) {
        String action = call.getString("action", "");
        JSObject params = call.getObject("params", new JSObject());
        
        // Handle different actions
        JSObject result = new JSObject();
        result.put("action", action);
        result.put("success", true);
        result.put("message", "Action performed: " + action);
        
        call.resolve(result);
    }
}
