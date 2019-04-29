import { includes } from 'lodash';

import Address from '../../../address/address';
import {
    MissingDataError, MissingDataErrorType, NotInitializedError,
    NotInitializedErrorType, StandardError
} from '../../../common/error/errors';
import { CreditCardInstrument, ThreeDSecureToken } from '../../payment';
import { ThreeDsResult } from '../../payment-response-body';

import {
    CardinalAccount,
    CardinalAddress,
    CardinalConsumer,
    CardinalEventType,
    CardinalInitializationType,
    CardinalOrderData,
    CardinalPartialOrder,
    CardinalPaymentBrand,
    CardinalScriptLoader,
    CardinalSignatureValidationErrors,
    CardinalSDK,
    CardinalTriggerEvents,
    CardinalValidatedAction,
    CardinalValidatedData
} from './index';

export default class CardinalClient {
    private _sdk?: Promise<CardinalSDK>;

    constructor(
        private _scriptLoader: CardinalScriptLoader
    ) {}

    initialize(testMode?: boolean): Promise<void> {
        if (!this._sdk) {
            this._sdk = this._scriptLoader.load(testMode);
        }

        return this._sdk.then(() => {});
    }

    configure(clientToken: string): Promise<void> {
        return this._getClientSDK()
            .then(client => new Promise<void>((resolve, reject) => {
                client.on(CardinalEventType.SetupCompleted, () => {
                    client.off(CardinalEventType.SetupCompleted);
                    client.off(CardinalEventType.Validated);

                    resolve();
                });

                client.on(CardinalEventType.Validated, (data: CardinalValidatedData) => {
                    client.off(CardinalEventType.SetupCompleted);
                    client.off(CardinalEventType.Validated);

                    switch (data.ActionCode) {
                        case CardinalValidatedAction.Error:
                            if (includes(CardinalSignatureValidationErrors, data.ErrorNumber)) {
                                reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
                            }
                            break;
                    }
                });

                client.setup(CardinalInitializationType.Init, {
                    jwt: clientToken,
                });
        }));
    }

    runBindProcess(ccNumber: string): Promise<void> {
        return this._getClientSDK()
            .then(client => client.trigger(CardinalTriggerEvents.BinProcess, ccNumber).catch(() => {}))
            .then(result => {
                if (!result || !result.Status) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }
            });
    }

    getThreeDSecureData(threeDSecureData: ThreeDsResult, orderData: CardinalOrderData): Promise<ThreeDSecureToken> {
        return this._getClientSDK()
            .then(client => {
                return new Promise<ThreeDSecureToken>((resolve, reject) => {
                    client.on(CardinalEventType.Validated, (data: CardinalValidatedData, jwt: string) => {
                        client.off(CardinalEventType.Validated);
                        switch (data.ActionCode) {
                            case CardinalValidatedAction.Success:
                                resolve({ token: jwt });
                                break;
                            case CardinalValidatedAction.NoAction:
                                if (data.ErrorNumber > 0) {
                                    reject(new StandardError(data.ErrorDescription));
                                } else {
                                    resolve({ token: jwt });
                                }
                                break;
                            case CardinalValidatedAction.Failure:
                                reject(new StandardError('User failed authentication or an error was encountered while processing the transaction'));
                                break;
                            case CardinalValidatedAction.Error:
                                reject(new StandardError(data.ErrorDescription));
                        }
                    });

                    const continueObject = {
                        AcsUrl: threeDSecureData.acs_url,
                        Payload: threeDSecureData.merchant_data,
                    };

                    const partialOrder = this._mapToPartialOrder(orderData, threeDSecureData.payer_auth_request);

                    client.continue(CardinalPaymentBrand.CCA, continueObject, partialOrder);
                });
        });
    }

    private _mapToPartialOrder(orderData: CardinalOrderData, transactionId: string): CardinalPartialOrder {
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
                TransactionId: transactionId,
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
        if (!this._sdk) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._sdk;
    }
}
