// Cart page / mini cart / add to cart modal -> default & payNowOptions
// PDP -> buyNowOptions & payNowOptions



export default class PayPalButton {
    renderOrThrow({
        containerId,
        paymentMethodName, // (!) FundingSource
        buttonStyles, // (?)
        onEligibilityFailure, // (?)
        onCancel, // (?)
        onRenderButton, // (?)
        buyNowOptions, // (?)
        payNowOptions, // (?) -skip checkout
        paypalSdk, // (!)
    }): Promise<void> {
        let paypalConfig = {
            fundingSource: '',
            style: {},
            ...callbacks,
        };

        // validate input data

        /**
         *
         * Get PayPal callbacks
         *
         * */



        /**
         *
         * Styles
         *
         * */
        if (buttonStyles) {
            paypalConfig.style = this.getValidButtonStyle(paymentMethodName, buttonStyles);
        }


        /**
         *
         * Get mapped FundingSource based on payment provider name
         *
         */


        // render wallet button based on config



        // get paypal sdk
        // get default callbacks -> will be always provided
        // get buy now callbacks -> buyNow config should be provided via render options
        // get pay now callbacks -> payNow config should be provided via render options
        // handle on eligibility failure -> should be provided via render options



        const paypalButton = paypal.Buttons(paypalConfig);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            console.log(`Button is not eligible to render. Payment method name is ${paymentMethodName}`);

            onEligibilityFailure();
        }
    }

    /**
     *
     * Funding source mapper
     *
     */
    private getFundingSourceByPaymentMethodName(paymentMethodName: string): string {
        // All mappings should be here
        return '';
    }


    /**
     *
     * Buttons styles
     *
     */
    private getValidButtonStyle(paymentMethodName: string, buttonStyles: object): object {
        // All styles calculations should be here
        return {};
    }


    /**
     *
     * PayPal Config callbacks
     *
     * */
    private getButtonCallbacks() {
        const callbacks = {
            createOrder: () => {},
            onApprove: () => {},
        };

        if (buyNowOptions) {
            // Should buyNowInitializeOptions be validated on higher level?

            const buyNowCallbacks = {
                onClick: () => {}, // only if buyNowInitializeOptions is provided
                onCancel: () => {}, // load default checkout
            };

            Object.assign(callbacks, buyNowCallbacks);
        }

        if (payNowOptions) {
            const payNowCallbacks = {
                onShippingAddressChange: () => {},
                onShippingOptionsChange: () => {},
                onApprove: () => {},
            };

            Object.assign(callbacks, payNowCallbacks);
        }

        return callbacks;
    }

}
