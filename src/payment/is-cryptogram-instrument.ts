import { CryptogramInstrument, PaymentInstrument } from './payment';

export default function isCryptogramInstrument(instrument: PaymentInstrument): instrument is CryptogramInstrument {
    return Boolean((instrument as CryptogramInstrument).cryptogramId);
}
