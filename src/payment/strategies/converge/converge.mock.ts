import { ConvergeResponseData, ConvergeSDK } from './converge';

export function getConvergeMock(): ConvergeSDK {
    return { web3dsFlow: jest.fn( )};
}

export function getConvergeConfirmPaymentResponse(): ConvergeResponseData {
    return {
        messageType: 'RReq',
        messageVersion: '2.1.0',
        threeDSServerTransID: '9e7bbadd-f37e-4988-8b73-dd0887c0b834',
        dsTransID: '9b7c00f0-a0bc-47a6-8f2f-b97445ccda49',
        acsTransID: '5f13f964-08e9-4c5b-839c-590fb3deb7b1',
        acsReferenceNumber: 'ELAVON_ACS_EMULATOR_REF_NUMBER32',
        acsOperatorID: 'ELAVON_ACS_EMULATOR_OPERATOR_ID1',
        dsReferenceNumber: 'ELAVON_3DS_DS_EMULATOR_REF_NUM32',
        transStatus: 'Y',
        authenticationType: '01',
        acsChallengeMandated: 'Y',
        acsURL: 'https://uat.acs.fraud.eu.elavonaws.com/acs/challenge/VISA',
        authenticationValue: 'KbFvasJ8VhUsgVk5eUue7yS8Z/M=',
        eci: '05',
        interactionCounter: '01',
        messageCategory: '01',
        authenticated: true,
        message: 'Account Verification Successful',
        messageId: '0b0deb70-3249-4c73-9cf5-92f6cac231af',
    };
}
