import MonerisStylingProps from './moneris';

export default interface MonerisaymentInitializeOptions {
    /**
     * The ID of a container where the Moneris iframe component should be mounted
     */
    containerId: string;

    style?: MonerisStylingProps;
}
