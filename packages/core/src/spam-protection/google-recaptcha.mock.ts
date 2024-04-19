export function getGoogleRecaptchaMock(): ReCaptchaV2.ReCaptcha {
    return {
        render: jest.fn(),
        reset: jest.fn(),
        getResponse: jest.fn(),
        execute: jest.fn(),
    };
}
