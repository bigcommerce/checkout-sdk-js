import { CheckoutSelectors, CheckoutService, createCheckoutService } from '../checkout';

import BodlEmitterService from './bodl-emitter-service';
import BodlEventsWindow, { BodlEvents } from './bodl-window';
import createBodlService from './create-bodl-service';
import NoopBodlService from './noop-bodl-service';

declare let window: BodlEventsWindow;

describe('createBodl', () => {
    let checkoutService: CheckoutService;
    let subscriber: (subscriber: (state: CheckoutSelectors) => void) => void;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        subscriber = () => {
            return checkoutService.getState();
        };
    });

    describe('#createBodlService()', () => {
        describe('when window.bodlEvents is undefined', () => {
            it('returns instance of noop logger', () => {
                expect(createBodlService(subscriber)).toBeInstanceOf(NoopBodlService);
            });
        });

        describe('when window.bodlEvents is defined', () => {
            beforeEach(() => {
                window.bodlEvents = {} as BodlEvents;
            });

            it('returns instance of BodlService', () => {
                expect(createBodlService(subscriber)).toBeInstanceOf(BodlEmitterService);
            });
        });
    });
});
