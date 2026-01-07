package com.yektayar.app;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.util.Log;
import androidx.core.content.FileProvider;

import java.io.File;

/**
 * AppUpdateManager handles checking for updates, downloading APK files,
 * and installing updates for the YektaYar Android app.
 * 
 * This manager supports:
 * - Checking server for latest version
 * - Downloading APK files via DownloadManager
 * - Installing downloaded APKs (requires user permission)
 * - Logging update events
 */
public class AppUpdateManager {
    
    private static final String TAG = "AppUpdateManager";
    private Context context;
    private DownloadManager downloadManager;
    private long downloadId = -1;
    private UpdateCallback callback;
    
    /**
     * Callback interface for update events
     */
    public interface UpdateCallback {
        void onUpdateCheckComplete(boolean updateAvailable, String version);
        void onDownloadStarted();
        void onDownloadProgress(int progress);
        void onDownloadComplete(String filePath);
        void onDownloadFailed(String error);
        void onInstallReady(String filePath);
    }
    
    public AppUpdateManager(Context context) {
        this.context = context;
        this.downloadManager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
    }
    
    /**
     * Set callback for update events
     */
    public void setCallback(UpdateCallback callback) {
        this.callback = callback;
    }
    
    /**
     * Download APK from the specified URL
     * 
     * @param downloadUrl URL to download the APK from
     * @param version Version number for logging and filename
     * @return Download ID for tracking
     */
    public long downloadUpdate(String downloadUrl, String version) {
        try {
            Log.i(TAG, "Starting APK download from: " + downloadUrl);
            
            if (callback != null) {
                callback.onDownloadStarted();
            }
            
            // Create download request
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(downloadUrl));
            request.setTitle("YektaYar Update");
            request.setDescription("Downloading version " + version);
            
            // Set destination
            String fileName = "yektayar-v" + version + ".apk";
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            
            // Configure request
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(false);
            
            // Set MIME type for APK
            request.setMimeType("application/vnd.android.package-archive");
            
            // Start download
            downloadId = downloadManager.enqueue(request);
            
            Log.i(TAG, "Download started with ID: " + downloadId);
            
            // Register broadcast receiver for download completion
            registerDownloadReceiver();
            
            return downloadId;
        } catch (Exception e) {
            Log.e(TAG, "Error starting download", e);
            if (callback != null) {
                callback.onDownloadFailed("Failed to start download: " + e.getMessage());
            }
            return -1;
        }
    }
    
    /**
     * Get download progress for current download
     * 
     * @return Progress percentage (0-100) or -1 if not available
     */
    public int getDownloadProgress() {
        if (downloadId == -1) {
            return -1;
        }
        
        try {
            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(downloadId);
            
            Cursor cursor = downloadManager.query(query);
            if (cursor != null && cursor.moveToFirst()) {
                int columnIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                int status = cursor.getInt(columnIndex);
                
                if (status == DownloadManager.STATUS_SUCCESSFUL) {
                    cursor.close();
                    return 100;
                } else if (status == DownloadManager.STATUS_RUNNING || status == DownloadManager.STATUS_PENDING) {
                    int bytesDownloadedIndex = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR);
                    int bytesTotalIndex = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES);
                    
                    long bytesDownloaded = cursor.getLong(bytesDownloadedIndex);
                    long bytesTotal = cursor.getLong(bytesTotalIndex);
                    
                    cursor.close();
                    
                    if (bytesTotal > 0) {
                        return (int) ((bytesDownloaded * 100) / bytesTotal);
                    }
                }
                
                cursor.close();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting download progress", e);
        }
        
        return -1;
    }
    
    /**
     * Install downloaded APK
     * Requires REQUEST_INSTALL_PACKAGES permission on Android 8.0+
     * 
     * @param filePath Path to the downloaded APK file
     */
    public void installUpdate(String filePath) {
        try {
            Log.i(TAG, "Installing APK from: " + filePath);
            
            File file = new File(filePath);
            if (!file.exists()) {
                Log.e(TAG, "APK file not found: " + filePath);
                if (callback != null) {
                    callback.onDownloadFailed("APK file not found");
                }
                return;
            }
            
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            
            Uri apkUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // Android 7.0 and above: Use FileProvider
                apkUri = FileProvider.getUriForFile(
                    context,
                    context.getPackageName() + ".fileprovider",
                    file
                );
            } else {
                // Below Android 7.0: Use file URI directly
                apkUri = Uri.fromFile(file);
            }
            
            intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            
            context.startActivity(intent);
            
            Log.i(TAG, "Installation intent started");
            
            if (callback != null) {
                callback.onInstallReady(filePath);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error installing update", e);
            if (callback != null) {
                callback.onDownloadFailed("Failed to install: " + e.getMessage());
            }
        }
    }
    
    /**
     * Register broadcast receiver for download completion
     */
    private void registerDownloadReceiver() {
        BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                
                if (id == downloadId) {
                    Log.i(TAG, "Download completed for ID: " + id);
                    
                    // Get downloaded file path
                    String filePath = getDownloadedFilePath(id);
                    
                    if (filePath != null) {
                        Log.i(TAG, "Downloaded file path: " + filePath);
                        
                        if (callback != null) {
                            callback.onDownloadComplete(filePath);
                        }
                        
                        // Automatically prepare for installation
                        installUpdate(filePath);
                    } else {
                        Log.e(TAG, "Failed to get downloaded file path");
                        if (callback != null) {
                            callback.onDownloadFailed("Failed to locate downloaded file");
                        }
                    }
                    
                    // Unregister receiver after handling
                    context.unregisterReceiver(this);
                }
            }
        };
        
        context.registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
    }
    
    /**
     * Get the file path of a downloaded file
     * 
     * @param downloadId Download ID
     * @return File path or null if not found
     */
    private String getDownloadedFilePath(long downloadId) {
        try {
            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(downloadId);
            
            Cursor cursor = downloadManager.query(query);
            if (cursor != null && cursor.moveToFirst()) {
                int columnIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI);
                String localUri = cursor.getString(columnIndex);
                cursor.close();
                
                if (localUri != null) {
                    // Convert content:// URI to file path
                    return Uri.parse(localUri).getPath();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting downloaded file path", e);
        }
        
        return null;
    }
    
    /**
     * Cancel current download
     */
    public void cancelDownload() {
        if (downloadId != -1) {
            downloadManager.remove(downloadId);
            downloadId = -1;
            Log.i(TAG, "Download cancelled");
        }
    }
    
    /**
     * Clean up resources
     */
    public void cleanup() {
        cancelDownload();
        callback = null;
    }
}
