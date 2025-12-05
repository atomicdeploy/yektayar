package ir.yektayar.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;

/**
 * DeviceInfo utility class for getting device and app information
 * This is an example of native Java code in the YektaYar Android app
 */
public class DeviceInfo {
    
    private Context context;
    
    public DeviceInfo(Context context) {
        this.context = context;
    }
    
    /**
     * Get the app version name
     */
    public String getAppVersion() {
        try {
            PackageInfo packageInfo = context.getPackageManager()
                .getPackageInfo(context.getPackageName(), 0);
            return packageInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            return "unknown";
        }
    }
    
    /**
     * Get the device model
     */
    public String getDeviceModel() {
        return Build.MODEL;
    }
    
    /**
     * Get the device manufacturer
     */
    public String getDeviceManufacturer() {
        return Build.MANUFACTURER;
    }
    
    /**
     * Get the Android OS version
     */
    public String getAndroidVersion() {
        return Build.VERSION.RELEASE;
    }
    
    /**
     * Get the Android SDK version
     */
    public int getAndroidSDKVersion() {
        return Build.VERSION.SDK_INT;
    }
    
    /**
     * Get device information as a formatted string
     */
    public String getDeviceInfoString() {
        return String.format(
            "App Version: %s\nDevice: %s %s\nAndroid: %s (SDK %d)",
            getAppVersion(),
            getDeviceManufacturer(),
            getDeviceModel(),
            getAndroidVersion(),
            getAndroidSDKVersion()
        );
    }
}
