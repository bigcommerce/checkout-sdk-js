import { createScriptLoader } from '@bigcommerce/script-loader';

import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    InvalidArgumentError,
    NotInitializedError,
    PaymentInvalidFormError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapHostedFieldType } from './bluesnap-direct-constants';
import BlueSnapDirectHostedForm from './bluesnap-direct-hosted-form';
import BlueSnapHostedInputValidator from './bluesnap-direct-hosted-input-validator';
import BluesnapDirectNameOnCardInput from './bluesnap-direct-name-on-card-input';
import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';
import getBlueSnapDirectSdkMock from './mocks/bluesnap-direct-sdk.mock';
import getBlueSnapPaymentInitializeOptionsMocks from './mocks/credit-card-payment-initialize-options.mock';
import {
    BlueSnapDirectSdk,
    BlueSnapDirectCardType as CardType,
    BlueSnapDirectErrorCode as ErrorCode,
    BlueSnapDirectErrorDescription as ErrorDescription,
    BlueSnapDirectEventOrigin as EventOrigin,
    BlueSnapDirectHostedFieldTagId as HostedFieldTagId,
    BlueSnapDirectHostedPaymentFieldsOptions as HostedPaymentFieldsOptions,
} from './types';

describe('BlueSnapDirectHostedForm', () => {
    let sdkMocks: ReturnType<typeof getBlueSnapDirectSdkMock>;
    let blueSnapDirectSdkMock: BlueSnapDirectSdk;
    let scriptLoader: BlueSnapDirectScriptLoader;
    let nameOnCardInput: BluesnapDirectNameOnCardInput;
    let hostedInputValidator: BlueSnapHostedInputValidator;
    let hostedForm: BlueSnapDirectHostedForm;

    let optionsMocks: ReturnType<typeof getBlueSnapPaymentInitializeOptionsMocks>;
    let ccOptionsMock: CreditCardPaymentInitializeOptions;
    let fieldset: HTMLFieldSetElement;
    let ccCvvContainer: HTMLDivElement;
    let ccExpiryContainer: HTMLDivElement;
    let ccNumberContainer: HTMLDivElement;
    let ccNameContainer: HTMLDivElement;

    beforeEach(() => {
        sdkMocks = getBlueSnapDirectSdkMock();
        blueSnapDirectSdkMock = sdkMocks.sdk;
        scriptLoader = new BlueSnapDirectScriptLoader(createScriptLoader());
        jest.spyOn(scriptLoader, 'load').mockResolvedValue(blueSnapDirectSdkMock);

        jest.spyOn(document, 'createElement');
        nameOnCardInput = new BluesnapDirectNameOnCardInput();
        jest.spyOn(nameOnCardInput, 'attach').mockReturnValue(undefined);
        jest.spyOn(nameOnCardInput, 'detach').mockReturnValue(undefined);
        jest.spyOn(nameOnCardInput, 'getValue').mockReturnValue('John Doe');

        hostedInputValidator = new BlueSnapHostedInputValidator();
        hostedForm = new BlueSnapDirectHostedForm(
            scriptLoader,
            nameOnCardInput,
            hostedInputValidator,
        );

        optionsMocks = getBlueSnapPaymentInitializeOptionsMocks();
        ccOptionsMock = optionsMocks.ccOptions;

        fieldset = document.createElement('fieldset');
        ccCvvContainer = document.createElement('div');
        ccExpiryContainer = document.createElement('div');
        ccNumberContainer = document.createElement('div');
        ccNameContainer = document.createElement('div');

        ccCvvContainer.id = optionsMocks.ccCvvContainerId;
        ccExpiryContainer.id = optionsMocks.ccExpiryContainerId;
        ccNumberContainer.id = optionsMocks.ccNumberContainerId;
        ccNameContainer.id = optionsMocks.ccNameContainerId;

        document.body
            .appendChild(fieldset)
            .append(ccCvvContainer, ccExpiryContainer, ccNumberContainer, ccNameContainer);
    });

    afterEach(() => {
        document.body.removeChild(fieldset);
        jest.spyOn(document, 'createElement').mockRestore();
    });

    describe('#initialize', () => {
        it('should initialize hosted form successfully', async () => {
            await hostedForm.initialize();

            expect(scriptLoader.load).toHaveBeenCalledWith(false);
        });
    });

    describe('#attach', () => {
        it('should set custom BlueSnap attributes to the hosted fields containers', async () => {
            await hostedForm.initialize();
            await hostedForm.attach('pfToken', ccOptionsMock);

            expect(ccCvvContainer.dataset.bluesnap).toBe(HostedFieldTagId.CardCode);
            expect(ccExpiryContainer.dataset.bluesnap).toBe(HostedFieldTagId.CardExpiry);
            expect(ccNumberContainer.dataset.bluesnap).toBe(HostedFieldTagId.CardNumber);
            expect(ccNameContainer.dataset.bluesnap).toBe(HostedFieldTagId.CardName);
        });

        it('should create hosted payment fields', async () => {
            const expectedStyle = {
                color: 'rgb (51, 51, 51)',
                'font-family': 'Montserrat, Arial, Helvetica, sans-serif',
                'font-size': '13px',
                'font-weight': '508',
            };
            const expectedOptions = {
                token: 'pfToken',
                onFieldEventHandler: {
                    setupComplete: expect.any(Function),
                    onFocus: expect.any(Function),
                    onBlur: expect.any(Function),
                    onError: expect.any(Function),
                    onType: expect.any(Function),
                    onEnter: expect.any(Function),
                    onValid: expect.any(Function),
                },
                ccnPlaceHolder: '',
                cvvPlaceHolder: '',
                expPlaceHolder: 'MM / YY',
                style: {
                    input: expectedStyle,
                    '.invalid': expectedStyle,
                    ':focus': expectedStyle,
                },
            };

            await hostedForm.initialize();
            await hostedForm.attach('pfToken', ccOptionsMock);

            expect(blueSnapDirectSdkMock.hostedPaymentFieldsCreate).toHaveBeenCalledWith(
                expectedOptions,
            );
            expect(nameOnCardInput.attach).toHaveBeenCalledWith(
                expectedOptions,
                undefined,
                undefined,
            );
        });

        describe('should call the UI event callbacks:', () => {
            test('onFocus', async () => {
                const triggerFocus = () => {
                    const { onFieldEventHandler: { onFocus } = {} } = (
                        blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                    ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                    onFocus?.(HostedFieldTagId.CardNumber);
                };

                await hostedForm.initialize();
                await hostedForm.attach('pfToken', ccOptionsMock);
                triggerFocus();

                expect(ccOptionsMock.form.onFocus).toHaveBeenCalledWith({
                    fieldType: BlueSnapHostedFieldType.ccn,
                });
            });

            test('onBlur', async () => {
                const triggerBlur = () => {
                    const { onFieldEventHandler: { onBlur } = {} } = (
                        blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                    ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                    onBlur?.(HostedFieldTagId.CardNumber);
                };

                await hostedForm.initialize();
                await hostedForm.attach('pfToken', ccOptionsMock);
                triggerBlur();

                expect(ccOptionsMock.form.onBlur).toHaveBeenCalledWith({
                    fieldType: BlueSnapHostedFieldType.ccn,
                });
            });

            test('onEnter', async () => {
                const triggerEnter = () => {
                    const { onFieldEventHandler: { onEnter } = {} } = (
                        blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                    ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                    onEnter?.(HostedFieldTagId.CardNumber);
                };

                await hostedForm.initialize();
                await hostedForm.attach('pfToken', ccOptionsMock);
                triggerEnter();

                expect(ccOptionsMock.form.onEnter).toHaveBeenCalledWith({
                    fieldType: BlueSnapHostedFieldType.ccn,
                });
            });

            test('onCardTypeChange', async () => {
                const triggerCardTypeChange = () => {
                    const { onFieldEventHandler: { onType } = {} } = (
                        blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                    ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                    onType?.(HostedFieldTagId.CardNumber, 'MASTERCARD', undefined);
                };

                await hostedForm.initialize();
                await hostedForm.attach('pfToken', ccOptionsMock);
                triggerCardTypeChange();

                expect(ccOptionsMock.form.onCardTypeChange).toHaveBeenCalledWith({
                    cardType: CardType.MASTERCARD,
                });
            });

            describe('onValidate', () => {
                test('when onError is called', async () => {
                    const triggerError = () => {
                        const { onFieldEventHandler: { onError } = {} } = (
                            blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                        ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                        onError?.(
                            HostedFieldTagId.CardNumber,
                            ErrorCode.INVALID_OR_EMPTY,
                            ErrorDescription.INVALID,
                            EventOrigin.ON_BLUR,
                        );
                    };

                    await hostedForm.initialize();
                    await hostedForm.attach('pfToken', ccOptionsMock);
                    triggerError();

                    expect(ccOptionsMock.form.onValidate).toHaveBeenCalledWith(
                        hostedInputValidator.validate({
                            tagId: HostedFieldTagId.CardNumber,
                            errorDescription: ErrorDescription.INVALID,
                        }),
                    );
                });

                test('when onValid is called', async () => {
                    const triggerValid = () => {
                        const { onFieldEventHandler: { onValid } = {} } = (
                            blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                        ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                        onValid?.(HostedFieldTagId.CardNumber);
                    };

                    await hostedForm.initialize();
                    await hostedForm.attach('pfToken', ccOptionsMock);
                    triggerValid();

                    expect(ccOptionsMock.form.onValidate).toHaveBeenCalledWith(
                        hostedInputValidator.validate({
                            tagId: HostedFieldTagId.CardNumber,
                        }),
                    );
                });
            });
        });

        describe('throws an error if...', () => {
            test('hosted form has not been initialized', async () => {
                const attach = hostedForm.attach('pfToken', ccOptionsMock);

                await expect(attach).rejects.toThrow(NotInitializedError);
            });

            test('fields is not a HostedCardFieldOptionsMap', async () => {
                const attach = () => {
                    ccOptionsMock.form.fields = {};

                    return hostedForm.attach('pfToken', ccOptionsMock);
                };

                await hostedForm.initialize();

                await expect(attach()).rejects.toThrow(InvalidArgumentError);
            });

            test('invalid containers are provided', async () => {
                const attach = () => {
                    Object.values(ccOptionsMock.form.fields).forEach((field) => {
                        field.containerId = 'foo';
                    });

                    return hostedForm.attach('pfToken', ccOptionsMock);
                };

                await hostedForm.initialize();

                await expect(attach()).rejects.toThrow(InvalidArgumentError);
            });

            test('when onError is called with an unexpected error', async () => {
                const triggerError = () => {
                    const { onFieldEventHandler: { onError } = {} } = (
                        blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                    ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                    onError?.(
                        HostedFieldTagId.CardNumber,
                        ErrorCode.ERROR_500,
                        ErrorDescription.INVALID,
                        EventOrigin.ON_BLUR,
                    );
                };

                await hostedForm.initialize();
                await hostedForm.attach('pfToken', ccOptionsMock);

                expect(triggerError).toThrow(Error);
                expect(ccOptionsMock.form.onValidate).not.toHaveBeenCalled();
            });
        });
    });

    describe('#validate', () => {
        it('should call the onValidate callback and return the BlueSnapDirectHostedForm instance', async () => {
            const pretendUserEntersValidData = () => {
                const { onFieldEventHandler: { onValid } = {} } = (
                    blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                onValid?.(HostedFieldTagId.CardNumber);
                onValid?.(HostedFieldTagId.CardExpiry);
                onValid?.(HostedFieldTagId.CardCode);
                onValid?.(HostedFieldTagId.CardName);
            };
            const placeOrder = () => hostedForm.validate();

            await hostedForm.initialize();
            await hostedForm.attach('pfToken', ccOptionsMock);
            pretendUserEntersValidData();

            expect(placeOrder()).toBe(hostedForm);
            expect(ccOptionsMock.form.onValidate).toHaveBeenCalledWith(
                hostedInputValidator.validate(),
            );
        });

        it('should call the onValidate callback and throw an error', async () => {
            const pretendUserForgetsFillCcName = () => {
                const { onFieldEventHandler: { onValid } = {} } = (
                    blueSnapDirectSdkMock.hostedPaymentFieldsCreate as jest.Mock
                ).mock.calls[0][0] as HostedPaymentFieldsOptions;

                onValid?.(HostedFieldTagId.CardNumber);
                onValid?.(HostedFieldTagId.CardExpiry);
                onValid?.(HostedFieldTagId.CardCode);
            };
            const placeOrder = () => hostedForm.validate();

            await hostedForm.initialize();
            await hostedForm.attach('pfToken', ccOptionsMock);
            pretendUserForgetsFillCcName();

            expect(placeOrder).toThrow(PaymentInvalidFormError);
            expect(ccOptionsMock.form.onValidate).toHaveBeenCalledWith(
                hostedInputValidator.validate(),
            );
        });

        it('should throw an error with details', async () => {
            const expectedErrors = {
                cardNumber: [{ message: 'Credit card number is required', type: 'required' }],
                cardExpiry: [{ message: 'Expiration date is required', type: 'required' }],
                cardCode: [{ message: 'CVV is required', type: 'required' }],
                cardName: [{ message: 'Full name is required', type: 'required' }],
            };
            const getErrorDetails = () => {
                try {
                    hostedForm.validate();
                } catch (err) {
                    return (err as PaymentInvalidFormError).details;
                }
            };

            await hostedForm.initialize();
            await hostedForm.attach('pfToken', ccOptionsMock);

            expect(getErrorDetails()).toStrictEqual(expectedErrors);
        });
    });

    describe('#submit', () => {
        it('should submit data successfully', async () => {
            const placeOrder = () => hostedForm.submit();

            await hostedForm.initialize();

            await expect(placeOrder()).resolves.toStrictEqual({
                ...sdkMocks.callbackResults,
                cardHolderName: 'John Doe',
            });
        });

        it('should fail to submit data', async () => {
            const initialize = () => {
                const sdkWithErrors = getBlueSnapDirectSdkMock(true).sdk;

                jest.spyOn(scriptLoader, 'load').mockResolvedValue(sdkWithErrors);

                return hostedForm.initialize();
            };
            const placeOrder = () => hostedForm.submit();

            await initialize();

            await expect(placeOrder()).rejects.toThrow(PaymentMethodFailedError);
        });

        it('throws an error if hosted form has not been initialized', async () => {
            const placeOrder = () => hostedForm.submit();

            await expect(placeOrder()).rejects.toThrow(NotInitializedError);
        });
    });

    describe('#detach', () => {
        it('should detach name on card input', () => {
            hostedForm.detach();

            expect(nameOnCardInput.detach).toHaveBeenCalled();
        });
    });
});
