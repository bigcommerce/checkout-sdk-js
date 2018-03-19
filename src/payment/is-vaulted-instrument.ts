import { PaymentInstrument, VaultedInstrument } from './payment';

export default function isVaultedInstrument(instrument: PaymentInstrument): instrument is VaultedInstrument {
    return Boolean((instrument as VaultedInstrument).instrumentId);
}
