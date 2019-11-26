import { HostedVaultedInstrument, PaymentInstrument, VaultedInstrument } from './payment';

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
