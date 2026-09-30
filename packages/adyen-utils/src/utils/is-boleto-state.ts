import { AdyenComponentEventState, BoletoState } from '../types';

export default function isBoletoState(param: AdyenComponentEventState): param is BoletoState {
    return (
        (typeof param === 'object' && typeof param.data.socialSecurityNumber) === 'string' &&
        typeof param.data.shopperName?.firstName === 'string' &&
        typeof param.data.shopperName?.lastName === 'string'
    );
}
