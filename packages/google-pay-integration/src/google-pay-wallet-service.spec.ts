import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';

import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import GooglePayScriptLoader from './google-pay-script-loader';
import GooglePayWalletService from './google-pay-wallet-service';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';

describe('GooglePayWalletService', () => {
    const cartId = 'cart-123';
    const orderId = 'order-456';
    const sessionSyncUrl = 'https://checkout.example.com/session-sync?jwt=the-token';

    let service: GooglePayWalletService;
    let walletButtonIntegrationService: WalletButtonIntegrationService;
    let gateway: GooglePayWalletGateway;
    let formPoster: FormPoster;

    const mockRedirectUrl = (externalCheckoutUrl: string | undefined) => {
        jest.spyOn(walletButtonIntegrationService, 'getRedirectToCheckoutUrl').mockResolvedValue({
            body: { redirectUrls: externalCheckoutUrl ? { externalCheckoutUrl } : null },
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
        it('posts the session sync token instead of navigating to it', async () => {
            mockRedirectUrl(sessionSyncUrl);

            await service.proxyTokenizationPayment(cartId, orderId, getCardDataResponse());

            expect(formPoster.postForm).toHaveBeenCalledWith(
                'https://checkout.example.com/session-sync',
                { jwt: 'the-token' },
            );
        });

        // Catalyst's GraphQL proxy always authenticates with a storefront token, so createCartRedirectUrls
        // always takes the session-sync branch and the URL always carries a jwt. Navigating a URL without one
        // would silently reproduce the URI length failure this replaced, so fail instead.
        it('throws when the returned URL carries no token', async () => {
            mockRedirectUrl('https://checkout.example.com/checkout?order_source=mcp');

            await expect(
                service.proxyTokenizationPayment(cartId, orderId, getCardDataResponse()),
            ).rejects.toThrow('Session sync token is missing from the checkout redirect URL');

            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('throws when no redirect URL comes back at all', async () => {
            mockRedirectUrl(undefined);

            await expect(
                service.proxyTokenizationPayment(cartId, orderId, getCardDataResponse()),
            ).rejects.toThrow('Failed to redirection to checkout page');
        });

        it('sends the nonce and card information as redirect query params', async () => {
            mockRedirectUrl(sessionSyncUrl);

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
});
