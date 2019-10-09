export default interface BarclaycardPaymentInitializeOptions {
    iframeContainerId: string;

    closureEventName: string;

    /**
     * A function that sets the modal status
     */
    setModalStatus(isOpen: boolean, callback?: void): void;

    setModalLoadingStatus(isLoading: boolean): void;

}
