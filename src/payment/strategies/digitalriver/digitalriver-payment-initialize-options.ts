import { OptionsResponse } from './digitalriver';

export default interface DigitalRiverPaymentInitializeOptions {
    /**
     * The ID of a container which the Digital River drop in component should be mounted
     */
    containerId: string;

    /**
     * Create a Configuration object for Drop-in that contains both required and optional values.
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#step-5-configure-hydrate
     */
    configuration: OptionsResponse;

    /**
     * Callback for submitting payment form that gets called
     * when buyer pay with DigitalRiver.
     */
    onSubmitForm(): void;

    /**
     * Callback used to hide the standard submit button which is rendered right after the payment providers.
     */
    onRenderButton?(): void;

    /**
     * Callback that gets triggered when an error happens when submitting payment form and contains an object with codes and error messages
     */
    onError?(error: Error): void;
}
