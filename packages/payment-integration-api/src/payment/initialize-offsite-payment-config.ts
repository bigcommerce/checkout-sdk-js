export default interface InitializeOffsitePaymentConfig {
    methodId: string;
    gatewayId?: string;
    instrumentId?: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
}
