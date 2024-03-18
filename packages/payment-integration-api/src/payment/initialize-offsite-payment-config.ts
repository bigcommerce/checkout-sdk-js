export default interface InitializeOffsitePaymentConfig {
    methodId: string;
    gatewayId?: string;
    instrumentId?: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    target?: string;
    promise?: Promise<undefined>;
}
