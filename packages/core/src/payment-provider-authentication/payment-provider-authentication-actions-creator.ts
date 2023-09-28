import { createAction } from '@bigcommerce/data-store';
import { Observable, of } from 'rxjs';

import { PaymentProviderAuthentication } from './payment-provider-authentication';
import {
    PaymentProviderAuthenticationAction,
    PaymentProviderAuthenticationType,
} from './payment-provider-authentication-actions';

export default class PaymentProviderAuthenticationActionCreator {
    updatePaymentProviderAuthentication(
        providerAuthenticationData: PaymentProviderAuthentication,
    ): Observable<PaymentProviderAuthenticationAction> {
        return of(
            createAction(
                PaymentProviderAuthenticationType.UpdatePaymentProviderAuthentication,
                providerAuthenticationData,
            ),
        );
    }
}
