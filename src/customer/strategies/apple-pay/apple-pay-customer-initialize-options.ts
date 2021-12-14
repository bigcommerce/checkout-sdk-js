/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support ApplePay.
 *
 * When ApplePay is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, it will trigger apple sheet
 */
 export default interface ApplePayCustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
}
