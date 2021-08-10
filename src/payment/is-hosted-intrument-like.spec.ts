import isHostedInstrumentLike from './is-hosted-intrument-like';
import { getHostedInstrument, getPartialHostedInstrument } from './payments.mock';

describe('isHostedInstrumentLike', () => {
    it('returns true if the object has both matching properties as undefined', () => {
        const paymentData = getHostedInstrument(undefined, undefined);
        expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns true if the object has any matching properties as undefined', () => {
      const paymentData = getHostedInstrument(true, undefined);
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns true if the object has any matching properties as undefined', () => {
      const paymentData = getHostedInstrument(undefined, false);
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns true if the object has both boolean values as false', () => {
      const paymentData = getHostedInstrument(false, false);
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns true if the object has both boolean values as true', () => {
      const paymentData = getHostedInstrument(true, true);
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns true if the object has both boolean values', () => {
      const paymentData = getHostedInstrument(false, true);
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns true if the object has at least one matching property', () => {
      const paymentData = getPartialHostedInstrument();
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns true if the object is object-like', () => {
      const paymentData = {};
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeTruthy();
    });

    it('returns false if the object is null', () => {
      const paymentData = null;
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeFalsy();
    });

    it('returns false if the object is undefined', () => {
      const paymentData = undefined;
      expect(paymentData && isHostedInstrumentLike(paymentData)).toBeFalsy();
    });
});
