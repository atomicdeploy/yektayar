package com.yektayar.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Rect;
import android.os.Build;
import android.util.DisplayMetrics;
import android.view.WindowManager;
import android.view.WindowMetrics;
import android.provider.Settings;

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
     * Get the app package name/identifier
     */
    public String getPackageName() {
        return context.getPackageName();
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
    
    /**
     * Get screen width in pixels
     */
    public int getScreenWidth() {
        DisplayMetrics displayMetrics = getDisplayMetrics();
        return displayMetrics.widthPixels;
    }
    
    /**
     * Get screen height in pixels
     */
    public int getScreenHeight() {
        DisplayMetrics displayMetrics = getDisplayMetrics();
        return displayMetrics.heightPixels;
    }
    
    /**
     * Get screen density (dpi)
     */
    public int getScreenDensityDpi() {
        DisplayMetrics displayMetrics = getDisplayMetrics();
        return displayMetrics.densityDpi;
    }
    
    /**
     * Get screen density scale factor
     */
    public float getScreenDensity() {
        DisplayMetrics displayMetrics = getDisplayMetrics();
        return displayMetrics.density;
    }
    
    /**
     * Get Android device ID (unique identifier)
     * Note: This returns Android ID which is unique per app installation
     */
    public String getDeviceId() {
        try {
            return Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
        } catch (Exception e) {
            return "unknown";
        }
    }
    
    /**
     * Get device hardware name
     */
    public String getHardwareName() {
        return Build.HARDWARE;
    }
    
    /**
     * Get device board name
     */
    public String getBoardName() {
        return Build.BOARD;
    }
    
    /**
     * Get device brand
     */
    public String getBrand() {
        return Build.BRAND;
    }
    
    /**
     * Get device product name
     */
    public String getProduct() {
        return Build.PRODUCT;
    }
    
    /**
     * Get DisplayMetrics helper
     * Uses modern WindowMetrics API for Android 11+ (API 30+)
     * Falls back to deprecated getDefaultDisplay() for older versions
     */
    private DisplayMetrics getDisplayMetrics() {
        WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics displayMetrics = new DisplayMetrics();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11 (API 30) and above - use WindowMetrics
            WindowMetrics windowMetrics = windowManager.getCurrentWindowMetrics();
            Rect bounds = windowMetrics.getBounds();
            displayMetrics.widthPixels = bounds.width();
            displayMetrics.heightPixels = bounds.height();
            // Get density from resources
            displayMetrics.density = context.getResources().getDisplayMetrics().density;
            displayMetrics.densityDpi = context.getResources().getDisplayMetrics().densityDpi;
        } else {
            // Android 10 (API 29) and below - use deprecated method
            windowManager.getDefaultDisplay().getMetrics(displayMetrics);
        }
        
        return displayMetrics;
    }
}
