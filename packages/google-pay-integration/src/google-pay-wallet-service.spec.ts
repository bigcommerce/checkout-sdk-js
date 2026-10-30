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
import { getPayPalCommerce } from './mocks/google-pay-payment-method.mock';
import { GooglePaymentsClient, TotalPriceStatusType } from './types';

describe('GooglePayWalletService', () => {
    const cartId = 'cart-123';
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
    let scriptLoader: GooglePayScriptLoader;
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
            addBillingAddress: jest.fn(),
            getRedirectToCheckoutUrl: jest.fn(),
        } as unknown as WalletButtonIntegrationService;

        gateway = {
            initialize: jest.fn().mockResolvedValue(undefined),
            getMerchantInfo: jest.fn().mockReturnValue({
                merchantName: 'Example Merchant',
                merchantId: '12345678901234567890',
                authJwt: 'foo.bar.baz',
            }),
            getCardParameters: jest.fn().mockReturnValue({
                allowedAuthMethods: ['PAN_ONLY'],
                allowedCardNetworks: ['VISA'],
            }),
            getPaymentGatewayParameters: jest.fn().mockReturnValue({
                gateway: 'example',
                gatewayMerchantId: 'merchant-id',
            }),
            getTokenizationConfig: jest.fn().mockReturnValue({
                providerId: 'bigcommerce_payments.googlepay',
                paymentType: 'googlepay',
                methodId: 'googlepay_bigcommerce_payments',
            }),
        };

        formPoster = createFormPoster();
        jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn());
        scriptLoader = { getGooglePaymentsClient: jest.fn() } as unknown as GooglePayScriptLoader;

        service = new GooglePayWalletService(
            walletButtonIntegrationService,
            scriptLoader,
            gateway,
            formPoster,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds the billing address to the cart', async () => {
        const address = service.mapToBillingAddress(getCardDataResponse());

        await service.addBillingAddress(cartId, address);

        expect(walletButtonIntegrationService.addBillingAddress).toHaveBeenCalledWith(
            cartId,
            address,
        );
    });

    it('requests a shipping address from Google Pay', async () => {
        const paymentsClient = {
            loadPaymentData: jest.fn().mockResolvedValue(getCardDataResponse()),
        } as unknown as GooglePaymentsClient;

        jest.spyOn(scriptLoader, 'getGooglePaymentsClient').mockResolvedValue(paymentsClient);

        await service.initialize(getPayPalCommerce(), 'USD', false, {
            currencyCode: 'USD',
            totalPrice: '10.00',
            totalPriceStatus: TotalPriceStatusType.ESTIMATED,
        });
        await service.showPaymentSheet();

        expect(paymentsClient.loadPaymentData).toHaveBeenCalledWith(
            expect.objectContaining({
                shippingAddressRequired: true,
                shippingAddressParameters: { phoneNumberRequired: true },
            }),
        );
    });

    describe('#proxyTokenizationPayment()', () => {
        // The token carries a base64 Google Pay nonce, which pushes the URL past the 2048-character limit the
        // storefront enforces on /session-sync. Posting keeps it out of the URI entirely.
        it('posts the session sync token when the mutation asks for a POST', async () => {
            mockHandoff(postHandoff);

            await service.proxyTokenizationPayment(cartId, getCardDataResponse());

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

            await service.proxyTokenizationPayment(cartId, getCardDataResponse());

            expect(assign).toHaveBeenCalledWith(redirectHandoff.url);
            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('throws when no handoff comes back at all', async () => {
            mockHandoff(undefined);

            await expect(
                service.proxyTokenizationPayment(cartId, getCardDataResponse()),
            ).rejects.toThrow('Failed to redirection to checkout page');
        });

        it('sends the nonce and card information as redirect query params', async () => {
            mockHandoff(postHandoff);

            await service.proxyTokenizationPayment(cartId, getCardDataResponse());

            expect(walletButtonIntegrationService.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    cartEntityId: cartId,
                    paymentWalletData: { providerId: 'bigcommerce_payments.googlepay' },
                    queryParams: expect.arrayContaining([
                        { key: 'action', value: 'set_external_checkout' },
                        { key: 'provider', value: 'googlepay_bigcommerce_payments' },
                        { key: 'card_information', value: '{"type":"VISA","number":"1111"}' },
                    ]),
                }),
            );
        });

        it('sends the Google Pay shipping address as a redirect query param', async () => {
            mockHandoff(postHandoff);

            await service.proxyTokenizationPayment(cartId, getCardDataResponse());

            expect(walletButtonIntegrationService.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryParams: expect.arrayContaining([
                        {
                            key: 'shipping_address',
                            value: encodeURIComponent(
                                JSON.stringify({
                                    email: 'john.doe@example.com',
                                    first_name: 'John',
                                    last_name: 'Doe',
                                    phone_number: '+1 555-555-5555',
                                    address_line_1: '11305 4 Points Dr',
                                    address_line_2: 'Building 2, Suite 100',
                                    city: 'Austin',
                                    state: 'TX',
                                    country_code: 'US',
                                    postal_code: '78726',
                                }),
                            ),
                        },
                    ]),
                }),
            );
        });

        it('does not send the billing address as a redirect query param', async () => {
            mockHandoff(postHandoff);

            await service.proxyTokenizationPayment(cartId, getCardDataResponse());

            expect(walletButtonIntegrationService.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryParams: expect.not.arrayContaining([
                        expect.objectContaining({ key: 'billing_address' }),
                    ]),
                }),
            );
        });

        it('omits the shipping address query param when Google Pay does not return one', async () => {
            mockHandoff(postHandoff);

            const response = getCardDataResponse();

            delete response.shippingAddress;

            await service.proxyTokenizationPayment(cartId, response);

            expect(walletButtonIntegrationService.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryParams: expect.not.arrayContaining([
                        expect.objectContaining({ key: 'shipping_address' }),
                    ]),
                }),
            );
        });
    });

    describe('#renderButton()', () => {
        it('replaces an existing button and removes it on cleanup', async () => {
            const container = document.createElement('div');
            const firstButton = document.createElement('button');
            const secondButton = document.createElement('button');
            const paymentsClient = {
                createButton: jest
                    .fn()
                    .mockReturnValueOnce(firstButton)
                    .mockReturnValueOnce(secondButton),
            } as unknown as GooglePaymentsClient;

            container.id = 'google-pay';
            document.body.appendChild(container);

            jest.spyOn(scriptLoader, 'getGooglePaymentsClient').mockResolvedValue(paymentsClient);

            await service.initialize(getPayPalCommerce(), 'USD', false, {
                currencyCode: 'USD',
                totalPrice: '10.00',
                totalPriceStatus: TotalPriceStatusType.ESTIMATED,
            });

            service.renderButton(container.id, { onClick: jest.fn() });
            service.renderButton(container.id, { onClick: jest.fn() });

            expect(container.children).toHaveLength(1);
            expect(firstButton.isConnected).toBe(false);
            expect(secondButton.parentElement).toBe(container);

            service.removeButton();

            expect(container.children).toHaveLength(0);

            container.remove();
        });

        // An integrator sees only a missing button when the container id is wrong, with nothing in the
        // console to point at the cause.
        it('throws when the container is not in the document', () => {
            expect(() => service.renderButton('missing-container', { onClick: jest.fn() })).toThrow(
                'no element with id "missing-container" was found',
            );
        });
    });
});
