export default interface BarclaycardPaymentInitializeOptions {
    /**
     * If of the element that will contain the Iframe, it should be inside a modal dialog.
     */
    iframeContainerId: string;

    closureEventName: string;

    /**
     * A function that sets the modal status
     */
    setModalStatus(isOpen: boolean, callback?: void): void;

    /**
     * A function that sets the modal loading status
     */
    setModalLoadingStatus(isLoading: boolean): void;

}
