interface OperaWindow extends Window {
    opera: string;
}

export function isOperaWindow(window: Window): window is OperaWindow {
    return 'opera' in window;
}
