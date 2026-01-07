package com.yektayar.app;

import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

/**
 * Capacitor plugin to expose app update functionality to JavaScript
 * 
 * Provides methods for:
 * - Downloading APK updates
 * - Getting download progress
 * - Installing downloaded updates
 * - Canceling downloads
 */
@CapacitorPlugin(
    name = "AppUpdate",
    permissions = {
        @Permission(strings = {"android.permission.REQUEST_INSTALL_PACKAGES"}, alias = "install"),
        @Permission(strings = {"android.permission.WRITE_EXTERNAL_STORAGE"}, alias = "storage")
    }
)
public class AppUpdatePlugin extends Plugin {
    
    private static final String TAG = "AppUpdatePlugin";
    private AppUpdateManager updateManager;
    
    @Override
    public void load() {
        updateManager = new AppUpdateManager(getContext());
        Log.i(TAG, "AppUpdatePlugin loaded");
    }
    
    /**
     * Download APK update from URL
     * 
     * @param call Capacitor plugin call with downloadUrl and version parameters
     */
    @PluginMethod
    public void downloadUpdate(PluginCall call) {
        String downloadUrl = call.getString("downloadUrl");
        String version = call.getString("version", "unknown");
        
        if (downloadUrl == null || downloadUrl.isEmpty()) {
            call.reject("Download URL is required");
            return;
        }
        
        Log.i(TAG, "Downloading update - URL: " + downloadUrl + ", Version: " + version);
        
        // Set up callback for download events
        updateManager.setCallback(new AppUpdateManager.UpdateCallback() {
            @Override
            public void onUpdateCheckComplete(boolean updateAvailable, String version) {
                // Not used in download flow
            }
            
            @Override
            public void onDownloadStarted() {
                JSObject ret = new JSObject();
                ret.put("status", "started");
                ret.put("message", "Download started");
                notifyListeners("downloadStatus", ret);
            }
            
            @Override
            public void onDownloadProgress(int progress) {
                JSObject ret = new JSObject();
                ret.put("status", "progress");
                ret.put("progress", progress);
                notifyListeners("downloadStatus", ret);
            }
            
            @Override
            public void onDownloadComplete(String filePath) {
                JSObject ret = new JSObject();
                ret.put("status", "completed");
                ret.put("filePath", filePath);
                ret.put("message", "Download completed");
                notifyListeners("downloadStatus", ret);
                
                Log.i(TAG, "Download completed: " + filePath);
            }
            
            @Override
            public void onDownloadFailed(String error) {
                JSObject ret = new JSObject();
                ret.put("status", "failed");
                ret.put("error", error);
                notifyListeners("downloadStatus", ret);
                
                Log.e(TAG, "Download failed: " + error);
            }
            
            @Override
            public void onInstallReady(String filePath) {
                JSObject ret = new JSObject();
                ret.put("status", "installReady");
                ret.put("filePath", filePath);
                ret.put("message", "Ready to install");
                notifyListeners("downloadStatus", ret);
                
                Log.i(TAG, "Install ready: " + filePath);
            }
        });
        
        // Start download
        long downloadId = updateManager.downloadUpdate(downloadUrl, version);
        
        if (downloadId != -1) {
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("downloadId", downloadId);
            ret.put("message", "Download started successfully");
            call.resolve(ret);
        } else {
            call.reject("Failed to start download");
        }
    }
    
    /**
     * Get current download progress
     * 
     * @param call Capacitor plugin call
     */
    @PluginMethod
    public void getDownloadProgress(PluginCall call) {
        int progress = updateManager.getDownloadProgress();
        
        JSObject ret = new JSObject();
        ret.put("progress", progress);
        ret.put("success", progress != -1);
        
        call.resolve(ret);
    }
    
    /**
     * Install downloaded APK
     * Note: This will open the system installer, user must approve installation
     * 
     * @param call Capacitor plugin call with filePath parameter
     */
    @PluginMethod
    public void installUpdate(PluginCall call) {
        String filePath = call.getString("filePath");
        
        if (filePath == null || filePath.isEmpty()) {
            call.reject("File path is required");
            return;
        }
        
        Log.i(TAG, "Installing update from: " + filePath);
        
        updateManager.installUpdate(filePath);
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("message", "Installation initiated");
        call.resolve(ret);
    }
    
    /**
     * Cancel current download
     * 
     * @param call Capacitor plugin call
     */
    @PluginMethod
    public void cancelDownload(PluginCall call) {
        updateManager.cancelDownload();
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("message", "Download cancelled");
        call.resolve(ret);
    }
    
    @Override
    protected void handleOnDestroy() {
        if (updateManager != null) {
            updateManager.cleanup();
        }
    }
}
