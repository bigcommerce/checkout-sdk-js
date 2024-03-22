import { isNil, omitBy } from 'lodash';

import {
    PayPalButtonStyleOptions,
    PayPalCommerceButtonsOptions,
    PayPalButtonStyleColor,
    PayPalButtonStyleLabel,
    PayPalButtonStyleShape,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalCommerceInitializationData } from './paypal-commerce-types';

interface PayPalCommerceRenderButtonOptions {
    containerId: string;
    config: PayPalCommerceButtonsOptions;
    currencyCode: string;
    paymentMethod: PaymentMethod<PayPalCommerceInitializationData>; // TODO: update with
    onEligibleFailed?: () => void;
    onRenderButton?: () => void;
}

interface IPayPalCommerceButton {
    render: (options: PayPalCommerceRenderButtonOptions) => void
}

export default class PayPalCommerceButton implements IPayPalCommerceButton {
    constructor(private paypalCommerceSdk: PayPalCommerceSdk) {}

    render({
       containerId,
       config,
       currencyCode,
       onEligibleFailed,
       paymentMethod,
    }: PayPalCommerceRenderButtonOptions): void {
        // TODO:
        const paypalButtonsSdk = this.paypalCommerceSdk.getPayPalButtonsSdk();

        const buttonConfig: PayPalCommerceButtonsOptions = omitBy(config, isNil);

        const paypalButton = paypalButtonsSdk.Buttons({
            ...buttonConfig,
            style: this.getValidButtonStyle(buttonConfig.style),
        });

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            if (onEligibleFailed && typeof onEligibleFailed === 'function') {
                onEligibleFailed();
            } else {
                console.error('Failed to render PayPal button');
            }
        }
    }

    /**
     *
     * Styles related methods
     *
     */
    getValidButtonStyle(style?: PayPalButtonStyleOptions): PayPalButtonStyleOptions {
        const { color, height, label, shape } = style || {};

        const validStyles = {
            color: color && PayPalButtonStyleColor[color] ? color : undefined,
            height: this.getValidHeight(height),
            label: label && PayPalButtonStyleLabel[label] ? label : undefined,
            shape: shape && PayPalButtonStyleShape[shape] ? shape : undefined,
        };

        return omitBy(validStyles, isNil);
    }

    private getValidHeight(height?: number): number {
        const defaultHeight = 40;
        const minHeight = 25;
        const maxHeight = 55;

        if (!height || typeof height !== 'number') {
            return defaultHeight;
        }

        if (height > maxHeight) {
            return maxHeight;
        }

        if (height < minHeight) {
            return minHeight;
        }

        return height;
    }
}
