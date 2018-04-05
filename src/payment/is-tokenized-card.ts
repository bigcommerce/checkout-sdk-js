import { PaymentInstrument, TokenizedCreditCard } from './payment';

export default function isTokenizedCreditCardLike(tokenizeCard: PaymentInstrument): tokenizeCard is TokenizedCreditCard {
    return Boolean((tokenizeCard as TokenizedCreditCard).nonce);
}
