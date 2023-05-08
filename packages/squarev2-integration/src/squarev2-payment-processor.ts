import { fromEvent, merge, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import {
    BillingAddress,
    guard,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import SquareV2PaymentInitializeOptions from './squarev2-payment-initialize-options';
import SquareV2ScriptLoader from './squarev2-script-loader';
import {
    BillingContact,
    Card,
    CardInputEvent,
    CardInputEventTypes,
    ChargeVerifyBuyerDetails,
    Payments,
    SqEvent,
} from './types';

export interface SquareV2PaymentProcessorOptions {
    applicationId: string;
    locationId?: string;
    testMode?: boolean;
}

export default class SquareV2PaymentProcessor {
    private _payments?: Payments;
    private _card?: Card;
    private _formValidationSubscription?: Subscription;

    constructor(
        private _scriptLoader: SquareV2ScriptLoader,
        private _paymentIntegrationService: PaymentIntegrationService,
    ) {}

    async initialize({
        testMode,
        applicationId,
        locationId,
    }: SquareV2PaymentProcessorOptions): Promise<void> {
        const square = await this._scriptLoader.load(testMode);

        this._payments = square.payments(applicationId, locationId);
    }

    async deinitialize(): Promise<void> {
        if (this._formValidationSubscription) {
            this._formValidationSubscription.unsubscribe();
        }

        if (this._card) {
            await this._card.destroy();
        }

        this._formValidationSubscription = undefined;
        this._card = undefined;
        this._payments = undefined;
    }

    async initializeCard({
        containerId,
        style,
        onValidationChange,
    }: SquareV2PaymentInitializeOptions): Promise<void> {
        const { postalCode } = this._paymentIntegrationService.getState().getBillingAddress() || {};

        this._card = await this._getPayments().card();
        await this._card.attach(`#${containerId}`);

        try {
            await this._card.configure({ postalCode, style });
        } catch (_error) {
            /* Do nothing: we should not block shoppers from buying. */
        }

        if (onValidationChange) {
            this._formValidationSubscription = this._subscribeToFormValidation(
                this._card,
                onValidationChange,
            );
        }
    }

    async tokenize(): Promise<string> {
        const result = await this._getCard().tokenize();

        if (result.status !== 'OK' || !result.token) {
            let errorMessage = `Tokenization failed with status: ${result.status}`;

            if (result.errors) {
                errorMessage += ` and errors: ${JSON.stringify(result.errors)}`;
            }

            throw new Error(errorMessage);
        }

        return result.token;
    }

    async verifyBuyer(token: string): Promise<string> {
        const { getCheckoutOrThrow, getBillingAddressOrThrow } =
            this._paymentIntegrationService.getState();
        const { outstandingBalance, cart } = getCheckoutOrThrow();

        const details: ChargeVerifyBuyerDetails = {
            amount: outstandingBalance.toString(),
            billingContact: this._mapToSquareBillingContact(getBillingAddressOrThrow()),
            currencyCode: cart.currency.code,
            intent: 'CHARGE',
        };

        const response = await this._getPayments().verifyBuyer(token, details);

        return response ? response.token : '';
    }

    private _getPayments(): Payments {
        return guard(
            this._payments,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private _subscribeToFormValidation(
        card: Card,
        observer: Required<SquareV2PaymentInitializeOptions>['onValidationChange'],
    ): Subscription {
        const blacklist = ['cardNumber', 'cvv'];
        const invalidFields = new Set<string>(blacklist);
        const eventObservables = [
            'focusClassAdded',
            'focusClassRemoved',
            'errorClassAdded',
            'errorClassRemoved',
            'cardBrandChanged',
            'postalCodeChanged',
        ].map((eventType) => fromEvent(card, eventType as CardInputEventTypes));

        return merge(...eventObservables)
            .pipe(
                map((event: SqEvent<CardInputEvent>): boolean => {
                    const {
                        detail: {
                            field,
                            currentState: { isCompletelyValid },
                        },
                    } = event;

                    if (blacklist.includes(field)) {
                        invalidFields[isCompletelyValid ? 'delete' : 'add'](field);
                    }

                    return invalidFields.size === 0;
                }),
                distinctUntilChanged(),
            )
            .subscribe(observer);
    }

    private _getCard(): Card {
        return guard(
            this._card,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private _mapToSquareBillingContact({
        firstName: givenName,
        lastName: familyName,
        address1,
        address2,
        city,
        stateOrProvinceCode: state,
        postalCode,
        countryCode,
        email,
        phone,
    }: BillingAddress): BillingContact {
        return {
            givenName,
            familyName,
            addressLines: [address1, address2],
            city,
            state,
            postalCode,
            countryCode,
            email,
            phone,
        };
    }
}
