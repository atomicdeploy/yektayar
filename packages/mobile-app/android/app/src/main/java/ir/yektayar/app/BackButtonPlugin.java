package ir.yektayar.app;

import android.app.Activity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Plugin to handle back button press and app exit
 */
@CapacitorPlugin(name = "BackButton")
public class BackButtonPlugin extends Plugin {
    
    /**
     * Exit the application
     */
    @PluginMethod
    public void exitApp(PluginCall call) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.moveTaskToBack(true);
            activity.finish();
        }
        call.resolve();
    }
    
    /**
     * Check if back button can exit the app
     * Always returns true for this plugin
     */
    @PluginMethod
    public void canExit(PluginCall call) {
        call.resolve();
    }
}
