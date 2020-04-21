/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Amazon Pay V2.
 */
export default interface AmazonPayV2ShippingInitializeOptions {
    /**
     * This editAddressButtonId is used to set an event listener, provide an element ID if you want
     * users to be able to select a different shipping address by clicking on a button.
     * It should be an HTML element.
     */
    editAddressButtonId?: string;
}
