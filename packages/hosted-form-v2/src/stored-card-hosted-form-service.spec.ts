import LegacyHostedFormOptions from './hosted-form-options';
import StoredCardHostedFormService from './stored-card-hosted-form-service';
import {
    StoredCardHostedFormDataMock,
    StoredCardHostedFormInstrumentFieldsMock,
} from './stored-card-hosted-form.mock';

import { HostedForm, HostedFormFactory } from '.';

describe('StoredCardHostedFormService', () => {
    let formFactory: HostedFormFactory;
    let service: StoredCardHostedFormService;
    let initializeOptions: LegacyHostedFormOptions;

    beforeEach(() => {
        formFactory = new HostedFormFactory();

        service = new StoredCardHostedFormService('https://bigpay.integration.zone', formFactory);
    });

    describe('when hosted form is enabled', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate' | 'submitStoredCard'>;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
                submitStoredCard: jest.fn(() => Promise.resolve()),
            };
            initializeOptions = {
                fields: {
                    cardCode: {
                        containerId: 'cardCode',
                    },
                    cardExpiry: {
                        containerId: 'cardExpiry',
                    },
                    cardNumber: {
                        containerId: 'cardNumber',
                    },
                    cardName: {
                        containerId: 'cardName',
                    },
                },
            };

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(formFactory, 'create').mockReturnValue(form);
        });

        it('creates hosted form', async () => {
            await service.initialize(initializeOptions);

            expect(formFactory.create).toHaveBeenCalledWith(
                'https://bigpay.integration.zone',
                initializeOptions,
            );
        });

        it('attaches hosted form to container', async () => {
            await service.initialize(initializeOptions);

            expect(form.attach).toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            await service.initialize(initializeOptions);
            await service.submitStoredCard(
                StoredCardHostedFormInstrumentFieldsMock,
                StoredCardHostedFormDataMock,
            );

            expect(form.submitStoredCard).toHaveBeenCalledWith({
                fields: StoredCardHostedFormInstrumentFieldsMock,
                data: StoredCardHostedFormDataMock,
            });
        });

        it('validates user input before submitting data', async () => {
            await service.initialize(initializeOptions);
            await service.submitStoredCard(
                StoredCardHostedFormInstrumentFieldsMock,
                StoredCardHostedFormDataMock,
            );

            expect(form.validate).toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            try {
                await service.initialize(initializeOptions);
                await service.submitStoredCard(
                    StoredCardHostedFormInstrumentFieldsMock,
                    StoredCardHostedFormDataMock,
                );
            } catch (error) {
                expect(form.submit).not.toHaveBeenCalled();
            }
        });
    });

    describe('when hosted form is enabled but hosted fields are not present for rendering', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate' | 'submitStoredCard'>;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
                submitStoredCard: jest.fn(() => Promise.resolve()),
            };
            initializeOptions = {
                fields: {},
            };

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(formFactory, 'create').mockReturnValue(form);
        });

        it('does not submit with hosted form', async () => {
            await service.initialize(initializeOptions);
            await service.submitStoredCard(
                StoredCardHostedFormInstrumentFieldsMock,
                StoredCardHostedFormDataMock,
            );

            expect(form.submit).not.toHaveBeenCalled();
        });
    });
});
