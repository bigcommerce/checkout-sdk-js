import { NotInitializedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BlueSnapDirectErrorCode as ErrorCode,
    BlueSnapDirectErrorDescription as ErrorDescription,
    BlueSnapDirectEventOrigin as EventOrigin,
    BlueSnapDirectHostedFieldTagId as HostedFieldTagId,
    BlueSnapDirectHostedPaymentFieldsOptions as HostedPaymentFieldsOptions,
} from '../types';

import BluesnapDirectNameOnCardInput from './bluesnap-direct-name-on-card-input';

describe('BluesnapDirectNameOnCardInput', () => {
    let nameOnCardInput: BluesnapDirectNameOnCardInput;
    let options: HostedPaymentFieldsOptions;

    const getInputElement = () =>
        (document.createElement as jest.Mock).mock.results[0].value as HTMLInputElement;

    beforeEach(() => {
        nameOnCardInput = new BluesnapDirectNameOnCardInput();
        options = {
            token: 'pfToken',
            onFieldEventHandler: {
                setupComplete: jest.fn(),
                onFocus: jest.fn(),
                onBlur: jest.fn(),
                onError: jest.fn(),
                onType: jest.fn(),
                onEnter: jest.fn(),
                onValid: jest.fn(),
            },
            ccnPlaceHolder: '',
            cvvPlaceHolder: '',
            expPlaceHolder: 'MM / YY',
            style: {
                input: {
                    color: 'green',
                    'font-family': 'Montserrat',
                    'font-size': '13px',
                    'font-weight': '508',
                },
                '.invalid': {
                    color: 'red',
                    'font-family': 'Arial',
                    'font-size': '14px',
                    'font-weight': '509',
                },
                ':focus': {
                    color: 'blue',
                    'font-family': 'Helvetica',
                    'font-size': '15px',
                    'font-weight': '510',
                },
            },
        };

        jest.spyOn(document, 'createElement');
    });

    afterEach(() => {
        jest.spyOn(document, 'createElement').mockRestore();
    });

    describe('attach', () => {
        it('should create an HTMLInputElement', () => {
            nameOnCardInput.attach(options);

            expect(document.createElement).toHaveBeenCalledWith('input');
        });

        it('should configure it', () => {
            nameOnCardInput.attach(options);

            expect(getInputElement()).toEqual(
                expect.objectContaining({
                    autocomplete: 'cc-name',
                    id: HostedFieldTagId.CardName,
                    inputMode: 'text',
                    maxLength: 200,
                    style: expect.objectContaining({
                        backgroundColor: 'transparent',
                        border: '0px',
                        height: '100%',
                        margin: '0px',
                        outline: 'none',
                        padding: '0px',
                        width: '100%',
                    }),
                    type: 'text',
                }),
            );
        });

        it('should apply default styles', () => {
            nameOnCardInput.attach(options);

            expect(getInputElement()).toEqual(
                expect.objectContaining({
                    style: expect.objectContaining({
                        color: 'green',
                        fontFamily: 'Montserrat',
                        fontSize: '13px',
                        fontWeight: '508',
                    }),
                }),
            );
        });

        describe('should add event listeners', () => {
            const pretendUserFocuses = () => getInputElement().dispatchEvent(new Event('focus'));
            const pretendUserBlurs = (value = '') => {
                getInputElement().value = value;
                getInputElement().dispatchEvent(new Event('blur'));
            };
            const pretendUserEnters = () => getInputElement().dispatchEvent(new Event('enter'));

            beforeEach(() => {
                nameOnCardInput.attach(options);
            });

            it('should handle focus event', () => {
                pretendUserFocuses();

                expect(options.onFieldEventHandler?.onFocus).toHaveBeenCalledWith(
                    HostedFieldTagId.CardName,
                );
                expect(getInputElement().style).toEqual(
                    expect.objectContaining({
                        color: 'blue',
                        fontFamily: 'Helvetica',
                        fontSize: '15px',
                        fontWeight: '510',
                    }),
                );
            });

            it('should handle blur event with invalid value', () => {
                pretendUserBlurs();

                expect(options.onFieldEventHandler?.onBlur).toHaveBeenCalledWith(
                    HostedFieldTagId.CardName,
                );
                expect(options.onFieldEventHandler?.onError).toHaveBeenCalledWith(
                    HostedFieldTagId.CardName,
                    ErrorCode.INVALID_OR_EMPTY,
                    ErrorDescription.EMPTY,
                    EventOrigin.ON_BLUR,
                );
                expect(getInputElement().style).toEqual(
                    expect.objectContaining({
                        color: 'red',
                        fontFamily: 'Arial',
                        fontSize: '14px',
                        fontWeight: '509',
                    }),
                );
            });

            it('should handle blur event with valid value', () => {
                pretendUserBlurs('John Doe');

                expect(options.onFieldEventHandler?.onBlur).toHaveBeenCalledWith(
                    HostedFieldTagId.CardName,
                );
                expect(options.onFieldEventHandler?.onValid).toHaveBeenCalledWith(
                    HostedFieldTagId.CardName,
                );
                expect(getInputElement().style).toEqual(
                    expect.objectContaining({
                        color: 'green',
                        fontFamily: 'Montserrat',
                        fontSize: '13px',
                        fontWeight: '508',
                    }),
                );
            });

            it('should handle enter event', () => {
                pretendUserEnters();

                expect(options.onFieldEventHandler?.onEnter).toHaveBeenCalledWith(
                    HostedFieldTagId.CardName,
                );
            });
        });

        it('should set aria-label attribute', () => {
            nameOnCardInput.attach(options, 'foo');

            expect(getInputElement().getAttribute('aria-label')).toBe('foo');
        });

        it('should set placeholder attribute', () => {
            nameOnCardInput.attach(options, 'foo', 'bar');

            expect(getInputElement().placeholder).toBe('bar');
        });

        it('should mount it', () => {
            const mountCardNameContainer = () => {
                jest.spyOn(document, 'createElement').mockRestore();

                const container = document.createElement('div');

                jest.spyOn(document, 'createElement');

                container.dataset.bluesnap = 'noc';

                jest.spyOn(container, 'appendChild');

                document.body.append(container);

                return container;
            };
            const cardNameContainer = mountCardNameContainer();

            nameOnCardInput.attach(options);

            expect(cardNameContainer.appendChild).toHaveBeenCalledWith(getInputElement());
        });
    });

    describe('getValue', () => {
        it("should return it's value", () => {
            const pretendUserFillsCcName = () => {
                getInputElement().value = 'John Doe';
            };

            nameOnCardInput.attach(options);
            pretendUserFillsCcName();

            expect(nameOnCardInput.getValue()).toBe('John Doe');
        });

        it('should fail if not attached yet', () => {
            const getValue = () => nameOnCardInput.getValue();

            expect(getValue).toThrow(NotInitializedError);
        });
    });

    describe('detach', () => {
        it('should detach it', () => {
            nameOnCardInput.attach(options);
            jest.spyOn(getInputElement(), 'remove');

            nameOnCardInput.detach();

            expect(getInputElement().remove).toHaveBeenCalled();
        });
    });
});
