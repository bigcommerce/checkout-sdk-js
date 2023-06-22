import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getCart } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { InvalidExtensionConfigError } from './errors';
import { Extension } from './extension';
import { ExtensionIframe } from './extension-iframe';
import { getExtensions } from './extension.mock';

describe('ExtensionIframe', () => {
    let cart: Cart;
    let container: HTMLDivElement;
    let extension: Extension;
    let extensionIframe: ExtensionIframe;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'containerId';
        document.getElementById = jest.fn().mockReturnValue(container);

        cart = getCart();
        extension = getExtensions()[0];
        extensionIframe = new ExtensionIframe('containerId', extension, cart.id);
    });

    afterEach(() => {
        container.innerHTML = '';
    });

    it('attaches iframe to the container', () => {
        const appendChild = jest.spyOn(container, 'appendChild');

        extensionIframe.attach();

        expect(appendChild).toHaveBeenCalled();
    });

    it('throws InvalidExtensionConfigError when container ID is invalid', () => {
        document.getElementById = jest.fn().mockReturnValue(null);

        expect(() => extensionIframe.attach()).toThrow(InvalidExtensionConfigError);
    });

    it('detaches the iframe from its parent', () => {
        const removeChild = jest.spyOn(container, 'removeChild');

        extensionIframe.attach();
        extensionIframe.detach();

        expect(removeChild).toHaveBeenCalled();
    });
});
