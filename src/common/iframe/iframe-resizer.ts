import { IFrameComponent, IFrameOptions } from 'iframe-resizer';

export {
    HeightCalculationMethod,
    IFrameComponent,
    IFrameMessageData,
    IFrameObject,
    IFrameOptions,
    IFramePage,
    IFramePageOptions,
    IFrameResizedData,
    IFrameScrollData,
    PageInfo,
    WidthCalculationMethod,
} from 'iframe-resizer';

// The reason why we are wrapping the original `iframeResizer` function imported
// from the package is because the package sets up event listeners (window
// resize etc...) as soon as the package is imported. Therefore, to defer the
// side effect from happening until the function is actually being used, we are
// importing the package inside this function. To minimise the chance of
// importing the original package inadvertently, we are also re-exporting all of
// its public interfaces. The re-exports do not cause any side effect because
// they are plain TypeScript interfaces; meaning they are only used for type
// checks rather than for code output.
export function iframeResizer(options: IFrameOptions, target: string | HTMLElement): IFrameComponent[] {
    const { iframeResizer: originalIframeResizer } = require('iframe-resizer');

    return originalIframeResizer(options, target);
}

// We also need to wrap the original `iframeResizer.contentWindow` because
// similarly the package sets up event listeners as soon as the package gets
// imported. Another reason is that if it is imported at the top level using a
// regular import statement, it will be stripped out by Webpack as it is
// considered as "unused", unless we explicitly mark it as a package that
// produces side effects.
export function setupContentWindowForIframeResizer(): void {
    /* eslint-disable-next-line import/no-internal-modules */
    require('iframe-resizer/js/iframeResizer.contentWindow');
}
