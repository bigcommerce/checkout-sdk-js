import { includes } from 'lodash';
import { Subject } from 'rxjs/index';
import { filter } from 'rxjs/internal/operators';
import { take } from 'rxjs/operators';

import Address from '../../../address/address';
import {
    MissingDataError, MissingDataErrorType, NotInitializedError,
    NotInitializedErrorType, StandardError
} from '../../../common/error/errors';
import { CreditCardInstrument } from '../../payment';
import { ThreeDsResult } from '../../payment-response-body';

import {
    CardinalAccount,
    CardinalAddress,
    CardinalConsumer,
    CardinalEventResponse,
    CardinalEventType,
    CardinalInitializationType,
    CardinalOrderData,
    CardinalPartialOrder,
    CardinalPaymentBrand,
    CardinalPaymentStep,
    CardinalScriptLoader,
    CardinalSetupCompletedData,
    CardinalSignatureValidationErrors,
    CardinalSDK,
    CardinalTriggerEvents,
    CardinalValidatedAction,
    CardinalValidatedData
} from './index';

export default class CardinalClient {
    private _sdk?: Promise<CardinalSDK>;
    private _cardinalEvent$: Subject<CardinalEventResponse>;
    private _testMode?: boolean;

    constructor(
        private _scriptLoader: CardinalScriptLoader
    ) {
        this._cardinalEvent$ = new Subject<CardinalEventResponse>();
    }

    initialize(testMode: boolean): Promise<void> {
        this._testMode = testMode;

        return this._getClientSDK().then(() => Promise.resolve());
    }

    configure(clientToken: string): Promise<void> {
        return this._getClientSDK().then(client => {
            client.on(CardinalEventType.SetupCompleted, (setupCompletedData: CardinalSetupCompletedData) => {
                this._resolveSetupEvent();
            });

            client.on(CardinalEventType.Validated, (data: CardinalValidatedData, jwt: string) => {
                switch (data.ActionCode) {
                    case CardinalValidatedAction.Success:
                        this._resolveAuthorizationPromise(jwt);
                        break;
                    case CardinalValidatedAction.NoAction:
                        if (data.ErrorNumber > 0) {
                            this._rejectAuthorizationPromise(data);
                        } else {
                            this._resolveAuthorizationPromise(jwt);
                        }
                        break;
                    case CardinalValidatedAction.Failure:
                        data.ErrorDescription = 'User failed authentication or an error was encountered while processing the transaction';
                        this._rejectAuthorizationPromise(data);
                        break;
                    case CardinalValidatedAction.Error:
                        if (includes(CardinalSignatureValidationErrors, data.ErrorNumber)) {
                            this._rejectSetupEvent();
                        } else {
                            this._rejectAuthorizationPromise(data);
                        }
                }
            });

            return new Promise<void>((resolve, reject) => {
                this._cardinalEvent$
                    .pipe(take(1), filter(event => event.step === CardinalPaymentStep.Setup))
                    .subscribe((event: CardinalEventResponse) => {
                        event.status ? resolve() : reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
                    });

                client.setup(CardinalInitializationType.Init, {
                    jwt: clientToken,
                });
            });
        });
    }

    runBindProcess(ccNumber: string): Promise<void> {
        return this._getClientSDK().then(client => {
            return new Promise<void>((resolve, reject) => {
                client.trigger(CardinalTriggerEvents.BinProcess, ccNumber).then(result => {
                    if (result && result.Status) {
                        resolve();
                    } else {
                        reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
                    }
                });
            });
        });
    }

    getThreeDSecureData(threeDSecureData: ThreeDsResult, orderData: CardinalOrderData): Promise<string> {
        return this._getClientSDK().then(client => {
            return new Promise<string>((resolve, reject) => {
                this._cardinalEvent$
                    .pipe(take(1), filter(event => event.step === CardinalPaymentStep.Authorization))
                    .subscribe((event: CardinalEventResponse) => {
                        if (!event.status) {
                            const message = event.data ? event.data.ErrorDescription : '';
                            reject(new StandardError(message));
                        }
                        resolve(event.jwt);
                    });

                const continueObject = {
                    AcsUrl: threeDSecureData.acs_url,
                    Payload: threeDSecureData.merchant_data,
                };

                const partialOrder = this._mapToPartialOrder(orderData);
                partialOrder.OrderDetails.TransactionId = threeDSecureData.payer_auth_request;

                client.continue(CardinalPaymentBrand.CCA, continueObject, partialOrder);
            });
        });
    }

    reset(): Promise<void> {
        return this._getClientSDK().then(client => {
            client.off(CardinalEventType.SetupCompleted);
            client.off(CardinalEventType.Validated);
        });
    }

    private _resolveAuthorizationPromise(jwt: string): void {
        this._cardinalEvent$.next({
            step: CardinalPaymentStep.Authorization,
            jwt,
            status: true,
        });
    }

    private _resolveSetupEvent(): void {
        this._cardinalEvent$.next({
            step: CardinalPaymentStep.Setup,
            status: true,
        });
    }

    private _rejectSetupEvent(): void {
        this._cardinalEvent$.next({
            step: CardinalPaymentStep.Setup,
            status: false,
        });
    }

    private _rejectAuthorizationPromise(data: CardinalValidatedData): void {
        this._cardinalEvent$.next({
            step: CardinalPaymentStep.Authorization,
            data,
            status: false,
        });
    }

    private _mapToPartialOrder(orderData: CardinalOrderData): CardinalPartialOrder {
        const consumer: CardinalConsumer = {
            BillingAddress: this._mapToCardinalAddress(orderData.billingAddress),
            Account: this._mapToCardinalAccount(orderData.paymentData),
        };

        if (orderData.billingAddress.email) {
            consumer.Email1 = orderData.billingAddress.email;
        }

        if (orderData.shippingAddress) {
            consumer.ShippingAddress = this._mapToCardinalAddress(orderData.shippingAddress);
        }

        return  {
            Consumer: consumer,
            OrderDetails: {
                OrderNumber: orderData.id,
                Amount: orderData.amount,
                CurrencyCode: orderData.currencyCode,
                OrderChannel: 'S',
            },
        };
    }

    private _mapToCardinalAccount(paymentData: CreditCardInstrument): CardinalAccount {
        return {
            AccountNumber: Number(paymentData.ccNumber),
            ExpirationMonth: Number(paymentData.ccExpiry.month),
            ExpirationYear: Number(paymentData.ccExpiry.year),
            NameOnAccount: paymentData.ccName,
            CardCode: Number(paymentData.ccCvv),
        };
    }

    private _mapToCardinalAddress(address: Address): CardinalAddress {
        const cardinalAddress: CardinalAddress = {
            FirstName: address.firstName,
            LastName: address.lastName,
            Address1: address.address1,
            City: address.city,
            State: address.stateOrProvince,
            PostalCode: address.postalCode,
            CountryCode: address.countryCode,
        };

        if (address.address2) {
            cardinalAddress.Address2 = address.address2;
        }

        if (address.phone) {
            cardinalAddress.Phone1 = address.phone;
        }

        return cardinalAddress;
    }

    private _getClientSDK(): Promise<CardinalSDK> {
        if (this._testMode === undefined) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!this._sdk) {
            this._sdk = this._scriptLoader.load(this._testMode);
        }

        return this._sdk;
    }
}
