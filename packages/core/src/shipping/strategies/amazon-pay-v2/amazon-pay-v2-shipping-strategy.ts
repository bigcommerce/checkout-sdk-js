import { noop } from 'rxjs';

import {
    AmazonPayV2ChangeActionType,
    AmazonPayV2PaymentProcessor,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';

import { ConsignmentActionCreator, ShippingStrategyActionCreator } from '../..';
import { AddressRequestBody } from '../../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../../shipping-request-options';
import ShippingStrategy from '../shipping-strategy';

export default class AmazonPayV2ShippingStrategy implements ShippingStrategy {
    constructor(
        private _store: CheckoutStore,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor,
        private _shippingStrategyActionCreator: ShippingStrategyActionCreator,
    ) {}

    updateAddress(
        address: AddressRequestBody,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const shippingAddress = this._store.getState().shippingAddress.getShippingAddress();

        if (!shippingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingShippingAddress);
        }

        const updateAddressRequestBody = {
            ...shippingAddress,
            customFields: address.customFields,
        };

        return this._store.dispatch(
            this._consignmentActionCreator.updateAddress(updateAddressRequestBody, options),
        );
    }

    selectOption(
        optionId: string,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(optionId, options),
        );
    }

    async initialize(options: ShippingInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { amazonpay, methodId } = options;

        if (!amazonpay || !methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.amazonpay" argument is not provided.',
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        await this._amazonPayV2PaymentProcessor.initialize(paymentMethod);

        const { paymentToken, region } = paymentMethod.initializationData;
        const buttonId = amazonpay.editAddressButtonId;

        if (paymentToken && buttonId) {
            const shouldShowLoadingSpinner = this._shouldShowLoadingSpinner(region);

            this._bindEditButton(buttonId, paymentToken, 'changeAddress', shouldShowLoadingSpinner);
        }

        return this._store.getState();
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        await this._amazonPayV2PaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private _bindEditButton(
        id: string,
        sessionId: string,
        changeAction: AmazonPayV2ChangeActionType,
        shouldShowLoadingSpinner: boolean,
    ): void {
        const button = document.getElementById(id);

        if (!button || !button.parentNode) {
            return;
        }

        if (shouldShowLoadingSpinner) {
            const clone = button.cloneNode(true);

            button.parentNode.replaceChild(clone, button);

            clone.addEventListener('click', () => this._showLoadingSpinner());
        }

        this._amazonPayV2PaymentProcessor.bindButton(id, sessionId, changeAction);
    }

    private _showLoadingSpinner(): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._shippingStrategyActionCreator.widgetInteraction(() => new Promise(noop)),
            { queueId: 'widgetInteraction' },
        );
    }

    private _shouldShowLoadingSpinner(region: string) {
        return region !== 'us';
    }
}
