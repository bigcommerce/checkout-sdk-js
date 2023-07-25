import { EventEmitter } from 'events';

import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getCart } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { parseUrl } from '../common/url';
import { EmbeddedCheckoutEventType } from '../embedded-checkout/embedded-checkout-events';

import { Extension } from './extension';
import { ExtensionIframe } from './extension-iframe';
import { getExtensions } from './extension.mock';

describe('ExtensionIframe', () => {
    let cart: Cart;
    let container: HTMLDivElement;
    let extension: Extension;
    let extensionIframe: ExtensionIframe;
    let extensionOrigin: string;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'containerId';
        cart = getCart();
        extension = getExtensions()[0];
        extensionIframe = new ExtensionIframe('containerId', extension, {
            cartId: cart.id,
            parentOrigin: parseUrl('https://www.test.com').origin,
        });
        extensionOrigin = parseUrl(extension.url).origin;
        eventEmitter = new EventEmitter();

        document.getElementById = jest.fn().mockReturnValue(container);

        setTimeout(() => {
            eventEmitter.emit('message', {
                origin: extensionOrigin,
                data: { type: EmbeddedCheckoutEventType.FrameLoaded },
            });
        });

        jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
            return eventEmitter.addListener(type, listener);
        });
    });

    afterEach(() => {
        container.innerHTML = '';
    });

    it('attaches iframe to the container', async () => {
        await extensionIframe.attach();

        const iframe = container.querySelector('iframe') || document.createElement('iframe');

        const url = new URL(iframe.src);

        expect(url.origin).toBe(extensionOrigin);
        expect(url.searchParams.get('extensionId')).toBe(extension.id);
        expect(url.searchParams.get('cartId')).toBe(cart.id);
        expect(url.searchParams.get('parentOrigin')).toBe('https://www.test.com');
    });

    it('only attaches iframe once for an extension', async () => {
        await extensionIframe.attach();

        document.querySelector = jest.fn().mockReturnValue(container);
        container.querySelector = jest.fn().mockReturnValue(document.createElement('iframe'));

        await extensionIframe.attach();
        await extensionIframe.attach();

        expect(container.querySelectorAll('iframe')).toHaveLength(1);

        jest.resetAllMocks();
    });

    it('detaches the iframe from its parent', async () => {
        const removeChild = jest.spyOn(container, 'removeChild');

        await extensionIframe.attach();
        extensionIframe.detach();

        expect(removeChild).toHaveBeenCalled();
    });
});
