import BrowserInfo from './browser-info';

export default function getBrowserInfo(): BrowserInfo {
    return {
        color_depth: screen.colorDepth || 24,
        java_enabled: typeof navigator.javaEnabled === 'function' ? navigator.javaEnabled() : false,
        language: navigator.language || (navigator as any).userLanguage,
        screen_height: screen.height,
        screen_width: screen.width,
        time_zone_offset: new Date().getTimezoneOffset().toString(),
    };
}
