import { AdyenComponentEventState, BoletoState } from '../types';

export default function isBoletoState(param: AdyenComponentEventState): param is BoletoState {
    return (
        (typeof param === 'object' && typeof (param as BoletoState).data.socialSecurityNumber) ===
            'string' &&
        typeof (param as BoletoState).data.shopperName?.firstName === 'string' &&
        typeof (param as BoletoState).data.shopperName?.lastName === 'string'
    );
}
