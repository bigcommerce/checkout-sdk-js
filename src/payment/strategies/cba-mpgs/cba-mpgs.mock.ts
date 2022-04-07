import { ThreeDSjs, ThreeDSAuthenticationResponse, THREE_D_SECURE_AVAILABLE, THREE_D_SECURE_BUSY, THREE_D_SECURE_PROCEED } from './cba-mpgs';

export function getCBAMPGSScriptMock(
    configureSuccess: boolean = true,
    initiateAuthSuccess: boolean = true,
    authPayerSuccess: boolean = true,
    authAvailable: boolean = true,
    includeErrorStep1: boolean = false,
    includeErrorStep2: boolean = false,
    retryErrorCode: boolean = false
    ): ThreeDSjs {
        const authenticatePayerRetry = jest.fn()
            .mockImplementationOnce((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, retryErrorCode, includeErrorStep2, authAvailable)))
            .mockImplementationOnce((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, false, includeErrorStep2, authAvailable)));

        return {
            configure: jest.fn(config => config.callback()),
            isConfigured: jest.fn(() => configureSuccess),
            initiateAuthentication: jest.fn((_orderId, _transactionId, callback) => callback(_authenticationResponse(initiateAuthSuccess, retryErrorCode, includeErrorStep1, authAvailable))),
            authenticatePayer: retryErrorCode ? authenticatePayerRetry : jest.fn((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, retryErrorCode, includeErrorStep2, authAvailable))),
        };
}

export function getCBAMPGSScriptMockRetryOnly(
    configureSuccess: boolean = true,
    initiateAuthSuccess: boolean = true,
    authPayerSuccess: boolean = true,
    authAvailable: boolean = true,
    includeErrorStep1: boolean = false,
    includeErrorStep2: boolean = false,
    retryErrorCode: boolean = false
    ): ThreeDSjs {
        const authenticatePayerRetry = jest.fn()
            .mockImplementation((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, retryErrorCode, includeErrorStep2, authAvailable)));

        return {
            configure: jest.fn(config => config.callback()),
            isConfigured: jest.fn(() => configureSuccess),
            initiateAuthentication: jest.fn((_orderId, _transactionId, callback) => callback(_authenticationResponse(initiateAuthSuccess, retryErrorCode, includeErrorStep1, authAvailable))),
            authenticatePayer: retryErrorCode ? authenticatePayerRetry : jest.fn((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, retryErrorCode, includeErrorStep2, authAvailable))),
        };
}

function _authenticationResponse(success: boolean, retryError?: boolean, includeError?: boolean, authAvailable?: boolean): ThreeDSAuthenticationResponse {
    const response: ThreeDSAuthenticationResponse = {
        restApiResponse: {
            transaction: {
                authenticationStatus: authAvailable ? THREE_D_SECURE_AVAILABLE : 'AUTHENTICATION_UNAVAILABLE',
            },
        },
        gatewayRecommendation: success ?  THREE_D_SECURE_PROCEED : 'DO_NOT_PROCEED',
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
