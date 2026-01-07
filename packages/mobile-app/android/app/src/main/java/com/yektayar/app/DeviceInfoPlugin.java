package com.yektayar.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Capacitor plugin to expose DeviceInfo to JavaScript
 */
@CapacitorPlugin(name = "DeviceInfoPlugin")
public class DeviceInfoPlugin extends Plugin {

    private DeviceInfo deviceInfo;

    @Override
    public void load() {
        deviceInfo = new DeviceInfo(getContext());
    }

    @PluginMethod
    public void getDeviceInfo(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("appVersion", deviceInfo.getAppVersion());
        ret.put("packageName", deviceInfo.getPackageName());
        ret.put("deviceModel", deviceInfo.getDeviceModel());
        ret.put("deviceManufacturer", deviceInfo.getDeviceManufacturer());
        ret.put("androidVersion", deviceInfo.getAndroidVersion());
        ret.put("androidSDK", deviceInfo.getAndroidSDKVersion());
        ret.put("deviceInfoString", deviceInfo.getDeviceInfoString());
        ret.put("screenWidth", deviceInfo.getScreenWidth());
        ret.put("screenHeight", deviceInfo.getScreenHeight());
        ret.put("screenDensityDpi", deviceInfo.getScreenDensityDpi());
        ret.put("screenDensity", deviceInfo.getScreenDensity());
        ret.put("deviceId", deviceInfo.getDeviceId());
        ret.put("hardwareName", deviceInfo.getHardwareName());
        ret.put("boardName", deviceInfo.getBoardName());
        ret.put("brand", deviceInfo.getBrand());
        ret.put("product", deviceInfo.getProduct());
        call.resolve(ret);
    }
}
