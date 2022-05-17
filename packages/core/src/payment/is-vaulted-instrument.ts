import { FormattedPayload, FormattedVaultedInstrument, HostedVaultedInstrument, PaymentInstrument, VaultedInstrument } from './payment';

export default function isVaultedInstrument(instrument: PaymentInstrument): instrument is VaultedInstrument {
    return Boolean((instrument as VaultedInstrument).instrumentId);
}

export function isHostedVaultedInstrument(instrument: PaymentInstrument): instrument is HostedVaultedInstrument {
    return (
        Boolean((instrument as HostedVaultedInstrument).instrumentId) &&
        !instrument.hasOwnProperty('ccNumber') &&
        !instrument.hasOwnProperty('ccCvv')
    );
}

export function isFormattedVaultedInstrument(instrument: PaymentInstrument): instrument is FormattedPayload<FormattedVaultedInstrument> {
    const formattedInstrument = (instrument as FormattedPayload<FormattedVaultedInstrument>).formattedPayload;

    if (!formattedInstrument) {
        return false;
    }

    return typeof formattedInstrument.bigpay_token === 'string' ||
        Boolean(formattedInstrument.bigpay_token && formattedInstrument.bigpay_token.token);
}
