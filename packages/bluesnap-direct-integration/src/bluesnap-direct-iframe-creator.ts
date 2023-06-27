import { BlueSnapDirectStyleProps } from './types';

export const createIframe = (
    name: string,
    src: string,
    style?: BlueSnapDirectStyleProps,
): HTMLIFrameElement => {
    const iframe = document.createElement('iframe');

    iframe.setAttribute(
        'sandbox',
        'allow-top-navigation allow-scripts allow-forms allow-same-origin',
    );

    iframe.src = src;

    iframe.name = name;

    if (style) {
        const { border, height, width } = style;

        iframe.style.border = border || '';
        iframe.style.height = height || '';
        iframe.style.width = width || '';
    }

    return iframe;
};
