import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';

import {
    CheckoutHandoff,
    CheckoutHandoffMethod,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import GooglePayScriptLoader from './google-pay-script-loader';
import GooglePayWalletService from './google-pay-wallet-service';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';

describe('GooglePayWalletService', () => {
    const cartId = 'cart-123';
    const orderId = 'order-456';
    const sessionSyncUrl = 'https://checkout.example.com/session-sync';

    const postHandoff: CheckoutHandoff = {
        url: sessionSyncUrl,
        method: CheckoutHandoffMethod.Post,
        fields: [{ name: 'jwt', value: 'the-token' }],
    };

    const redirectHandoff: CheckoutHandoff = {
        url: `${sessionSyncUrl}?jwt=the-token`,
        method: CheckoutHandoffMethod.Redirect,
        fields: [],
    };

    let service: GooglePayWalletService;
    let walletButtonIntegrationService: WalletButtonIntegrationService;
    let gateway: GooglePayWalletGateway;
    let formPoster: FormPoster;

    const mockHandoff = (externalCheckoutHandoff: CheckoutHandoff | undefined) => {
        jest.spyOn(walletButtonIntegrationService, 'getRedirectToCheckoutUrl').mockResolvedValue({
            body: {
                redirectUrls: externalCheckoutHandoff
                    ? { externalCheckoutUrl: externalCheckoutHandoff.url, externalCheckoutHandoff }
                    : null,
            },
        } as Awaited<ReturnType<WalletButtonIntegrationService['getRedirectToCheckoutUrl']>>);
    };

    beforeEach(() => {
        walletButtonIntegrationService = {
            getRedirectToCheckoutUrl: jest.fn(),
        } as unknown as WalletButtonIntegrationService;

        gateway = {
            getTokenizationConfig: jest.fn().mockReturnValue({
                intentTypename: 'BigcommercePaymentWalletIntentData',
                providerId: 'bigcommerce_payments.googlepay',
                paymentType: 'googlepay',
                methodId: 'googlepay_bigcommerce_payments',
            }),
        } as unknown as GooglePayWalletGateway;

        formPoster = createFormPoster();
        jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn());

        service = new GooglePayWalletService(
            walletButtonIntegrationService,
            {} as GooglePayScriptLoader,
            gateway,
            formPoster,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('#proxyTokenizationPayment()', () => {
        // The token carries a base64 Google Pay nonce, which pushes the URL past the 2048-character limit the
        // storefront enforces on /session-sync. Posting keeps it out of the URI entirely.
        it('posts the session sync token when the mutation asks for a POST', async () => {
            mockHandoff(postHandoff);

            await service.proxyTokenizationPayment(cartId, orderId, getCardDataResponse());

            expect(formPoster.postForm).toHaveBeenCalledWith(sessionSyncUrl, { jwt: 'the-token' });
        });

        // Any other wallet keeps the plain navigation it has always had, so the same code path serves both.
        it('navigates when the mutation asks for a redirect', async () => {
            const assign = jest.fn();

            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { assign },
            });

            mockHandoff(redirectHandoff);

            await service.proxyTokenizationPayment(cartId, orderId, getCardDataResponse());

            expect(assign).toHaveBeenCalledWith(redirectHandoff.url);
            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('throws when no handoff comes back at all', async () => {
            mockHandoff(undefined);

            await expect(
                service.proxyTokenizationPayment(cartId, orderId, getCardDataResponse()),
            ).rejects.toThrow('Failed to redirection to checkout page');
        });

        it('sends the nonce and card information as redirect query params', async () => {
            mockHandoff(postHandoff);

            await service.proxyTokenizationPayment(cartId, orderId, getCardDataResponse());

            expect(walletButtonIntegrationService.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    cartEntityId: cartId,
                    queryParams: expect.arrayContaining([
                        { key: 'action', value: 'set_external_checkout' },
                        { key: 'provider', value: 'googlepay_bigcommerce_payments' },
                        { key: 'card_information', value: '{"type":"VISA","number":"1111"}' },
                    ]),
                }),
            );
        });
    });

    describe('#renderButton()', () => {
        // An integrator sees only a missing button when the container id is wrong, with nothing in the
        // console to point at the cause.
        it('throws when the container is not in the document', () => {
            expect(() => service.renderButton('missing-container', { onClick: jest.fn() })).toThrow(
                'no element with id "missing-container" was found',
            );
        });
    });
});
