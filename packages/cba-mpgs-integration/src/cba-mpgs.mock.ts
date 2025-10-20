import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    THREE_D_SECURE_AVAILABLE,
    THREE_D_SECURE_BUSY,
    THREE_D_SECURE_PROCEED,
    ThreeDSAuthenticationResponse,
    ThreeDSjs,
} from './cba-mpgs';

export function getCBAMPGSScriptMock(
    configureSuccess = true,
    initiateAuthSuccess = true,
    authPayerSuccess = true,
    authAvailable = true,
    includeErrorStep1 = false,
    includeErrorStep2 = false,
    retryErrorCode = false,
): ThreeDSjs {
    const authenticatePayerRetry = jest
        .fn()
        .mockImplementationOnce((_orderId, _transactionId, callback) =>
            callback(
                _authenticationResponse(
                    authPayerSuccess,
                    retryErrorCode,
                    includeErrorStep2,
                    authAvailable,
                ),
            ),
        )
        .mockImplementationOnce((_orderId, _transactionId, callback) =>
            callback(
                _authenticationResponse(authPayerSuccess, false, includeErrorStep2, authAvailable),
            ),
        );

    return {
        configure: jest.fn((config) => Promise.resolve(config.callback())),
        isConfigured: jest.fn(() => configureSuccess),
        initiateAuthentication: jest.fn((_orderId, _transactionId, callback) =>
            callback(
                _authenticationResponse(
                    initiateAuthSuccess,
                    retryErrorCode,
                    includeErrorStep1,
                    authAvailable,
                ),
            ),
        ),
        authenticatePayer: retryErrorCode
            ? authenticatePayerRetry
            : jest.fn((_orderId, _transactionId, callback) =>
                  callback(
                      _authenticationResponse(
                          authPayerSuccess,
                          retryErrorCode,
                          includeErrorStep2,
                          authAvailable,
                      ),
                  ),
              ),
    };
}

export function getCBAMPGSScriptMockRetryOnly(
    configureSuccess = true,
    initiateAuthSuccess = true,
    authPayerSuccess = true,
    authAvailable = true,
    includeErrorStep1 = false,
    includeErrorStep2 = false,
    retryErrorCode = false,
): ThreeDSjs {
    const authenticatePayerRetry = jest
        .fn()
        .mockImplementation((_orderId, _transactionId, callback) =>
            callback(
                _authenticationResponse(
                    authPayerSuccess,
                    retryErrorCode,
                    includeErrorStep2,
                    authAvailable,
                ),
            ),
        );

    return {
        configure: jest.fn((config) => Promise.resolve(config.callback())),
        isConfigured: jest.fn(() => configureSuccess),
        initiateAuthentication: jest.fn((_orderId, _transactionId, callback) =>
            callback(
                _authenticationResponse(
                    initiateAuthSuccess,
                    retryErrorCode,
                    includeErrorStep1,
                    authAvailable,
                ),
            ),
        ),
        authenticatePayer: retryErrorCode
            ? authenticatePayerRetry
            : jest.fn((_orderId, _transactionId, callback) =>
                  callback(
                      _authenticationResponse(
                          authPayerSuccess,
                          retryErrorCode,
                          includeErrorStep2,
                          authAvailable,
                      ),
                  ),
              ),
    };
}

// eslint-disable-next-line no-underscore-dangle
function _authenticationResponse(
    success: boolean,
    retryError?: boolean,
    includeError?: boolean,
    authAvailable?: boolean,
): ThreeDSAuthenticationResponse {
    const response: ThreeDSAuthenticationResponse = {
        restApiResponse: {
            transaction: {
                authenticationStatus: authAvailable
                    ? THREE_D_SECURE_AVAILABLE
                    : 'AUTHENTICATION_UNAVAILABLE',
            },
        },
        gatewayRecommendation: success ? THREE_D_SECURE_PROCEED : 'DO_NOT_PROCEED',
    };

    if (includeError) {
        response.error = {
            code: 'error_code',
            msg: 'something went wrong',
            cause: retryError ? THREE_D_SECURE_BUSY : undefined,
        };
    }

    return response;
}

export function getCBAMPGS(): PaymentMethod {
    return {
        id: 'cba_mpgs',
        gateway: '',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        clientToken: 'foo',
        config: {
            displayName: 'CBA MPGS',
            is3dsEnabled: true,
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            isTestModeFlagEnabled: false,
            merchantId: 'ABC123',
        },
        skipRedirectConfirmationAlert: true,
    };
}
