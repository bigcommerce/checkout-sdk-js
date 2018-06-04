import { NonceInstrument, PaymentInstrument } from './payment';

export default function isNonceLike(instrument: PaymentInstrument): instrument is NonceInstrument {
    return Boolean((instrument as NonceInstrument).nonce);
}
