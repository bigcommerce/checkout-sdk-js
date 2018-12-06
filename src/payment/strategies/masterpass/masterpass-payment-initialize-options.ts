export default interface MasterpassPaymentInitializeOptions {
    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the ChasePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;
}
