import { BankInstrument } from './instrument';
import { BankInternalInstrument } from './instrument-response-body';

export function mapToBankInstrument(instrument: BankInternalInstrument): BankInstrument {
    return {
        bigpayToken: instrument.bigpay_token,
        defaultInstrument: instrument.default_instrument,
        provider: instrument.provider,
        externalId: instrument.external_id,
        trustedShippingAddress: instrument.trusted_shipping_address,
        accountNumber: instrument.account_number,
        issuer: instrument.issuer,
        iban: instrument.iban,
        method: instrument.method,
        type: 'bank',
    };
}
