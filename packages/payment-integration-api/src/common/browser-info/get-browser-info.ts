import BrowserInfo from './browser-info';

export default function getBrowserInfo(): BrowserInfo {
    const { navigator } = window;

    let language: string;

    if (navigator.language) {
        language = navigator.language;
    } else {
        language = (navigator as any).userLanguage;
    }

    return {
        color_depth: window.screen.colorDepth || 24,
        java_enabled: typeof navigator.javaEnabled === 'function' ? navigator.javaEnabled() : false,
        language,
        screen_height: window.screen.height,
        screen_width: window.screen.width,
        time_zone_offset: new Date().getTimezoneOffset().toString(),
    };
}
