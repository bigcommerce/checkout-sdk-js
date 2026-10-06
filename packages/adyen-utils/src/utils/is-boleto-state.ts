import { AdyenComponentEventState, BoletoState } from '../types';

export default function isBoletoState(param: AdyenComponentEventState): param is BoletoState {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (typeof param === 'object' && typeof (param as BoletoState).data.socialSecurityNumber) ===
            'string' &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        typeof (param as BoletoState).data.shopperName?.firstName === 'string' &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        typeof (param as BoletoState).data.shopperName?.lastName === 'string'
    );
}
