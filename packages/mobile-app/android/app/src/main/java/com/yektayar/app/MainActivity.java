package com.yektayar.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register custom plugins
        registerPlugin(DeviceInfoPlugin.class);
        registerPlugin(WebViewConsoleLoggerPlugin.class);
    }
}
