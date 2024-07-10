import { RequestSender } from '@bigcommerce/request-sender';

import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import { BrowserStorage } from '../common/storage';

import embedCheckout from './embed-checkout';
import EmbeddedCheckout from './embedded-checkout';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import ResizableIframeCreator from './resizable-iframe-creator';

jest.mock('./embedded-checkout', () => {
    return jest.fn(() => {
        const instance: Partial<EmbeddedCheckout> = {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            attach: jest.fn(() => Promise.resolve(instance)),
        };

        return instance;
    });
});

describe('embedCheckout()', () => {
    let options: EmbeddedCheckoutOptions;

    beforeEach(() => {
        options = {
            url: 'https://mybigcommerce.com/checkout',
            containerId: 'checkout',
        };
    });

    it('attaches checkout iframe', async () => {
        const checkout = await embedCheckout(options);

        expect(checkout.attach).toHaveBeenCalled();
    });

    it('constructs instance with required dependencies', async () => {
        await embedCheckout(options);

        expect(EmbeddedCheckout).toHaveBeenCalledWith(
            expect.any(ResizableIframeCreator),
            expect.any(IframeEventListener),
            expect.any(IframeEventPoster),
            expect.any(LoadingIndicator),
            expect.any(RequestSender),
            expect.any(BrowserStorage),
            expect.any(Location),
            options,
        );
    });
});
