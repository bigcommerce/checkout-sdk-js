import {
    FormattedPayload,
    FormattedVaultedInstrument,
    HostedVaultedInstrument,
    PaymentInstrumentPayload,
    VaultedInstrument,
} from './payment';

export default function isVaultedInstrument(
    instrument: PaymentInstrumentPayload,
): instrument is VaultedInstrument {
    return Boolean((instrument as VaultedInstrument).instrumentId);
}

export function isHostedVaultedInstrument(
    instrument: PaymentInstrumentPayload,
): instrument is HostedVaultedInstrument {
    return (
        Boolean((instrument as HostedVaultedInstrument).instrumentId) &&
        !Object.prototype.hasOwnProperty.call(instrument, 'ccNumber') &&
        !Object.prototype.hasOwnProperty.call(instrument, 'ccCvv')
    );
}

export function isFormattedVaultedInstrument(
    instrument: PaymentInstrumentPayload,
): instrument is FormattedPayload<FormattedVaultedInstrument> {
    const formattedInstrument = (instrument as FormattedPayload<FormattedVaultedInstrument>)
        .formattedPayload;

    if (!formattedInstrument) {
        return false;
    }

    return (
        typeof formattedInstrument.bigpay_token === 'string' ||
        Boolean(formattedInstrument.bigpay_token && formattedInstrument.bigpay_token.token)
    );
}
