import { ThreeDSjs, ThreeDSAuthenticationResponse, THREE_D_SECURE_AVAILABLE, THREE_D_SECURE_BUSY, THREE_D_SECURE_PROCEED } from './cba-mpgs';

export function getCBAMPGSScriptMock(
    configureSuccess: boolean = true,
    initiateAuthSuccess: boolean = true,
    authPayerSuccess: boolean = true,
    authAvailable: boolean = true,
    includeError: boolean = false,
    retryErrorCode: boolean = false
    ): ThreeDSjs {
        const authenticatePayerRetry = jest.fn()
            .mockImplementationOnce((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, retryErrorCode, includeError, authAvailable)))
            .mockImplementationOnce((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, false, includeError, authAvailable)));

        return {
            configure: jest.fn(config => config.callback()),
            isConfigured: jest.fn(() => configureSuccess),
            initiateAuthentication: jest.fn((_orderId, _transactionId, callback) => callback(_authenticationResponse(initiateAuthSuccess, retryErrorCode, includeError, authAvailable))),
            authenticatePayer: retryErrorCode ? authenticatePayerRetry : jest.fn((_orderId, _transactionId, callback) => callback(_authenticationResponse(authPayerSuccess, retryErrorCode, includeError, authAvailable))),
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
