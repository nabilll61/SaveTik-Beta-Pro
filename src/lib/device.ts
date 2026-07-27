import { safeLocalStorage } from './safeStorage';

export const isApkOrWebView = (): boolean => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent.toLowerCase();

  // 1. Cordova check
  const isCordova = !!(window as any).cordova;

  // 2. Capacitor check
  const isCapacitor = !!(window as any).Capacitor;

  // 3. Android WebView typical indicators
  // Standard Android WebView user agents contain "wv"
  const isAndroidWebView = ua.includes('android') && ua.includes('wv');
  const isCrosswalk = ua.includes('crosswalk');

  // 4. Custom interfaces added by Android wrapper apps
  const hasAndroidInterface = !!(window as any).Android || !!(window as any).JSInterface;

  // 5. Override flags in localStorage for admin / testing purposes
  const forceApk = safeLocalStorage.getItem('savetik-force-apk-mode') === 'true';

  return isCordova || isCapacitor || isAndroidWebView || isCrosswalk || hasAndroidInterface || forceApk;
};
