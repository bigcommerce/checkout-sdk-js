import {
    getErrorPaymentResponseBody,
    getResponse,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { DetachmentObserver } from './common/dom';
import { RequestError } from './common/errors';
import { IframeEventListener, IframeEventPoster } from './common/iframe';
import { InvalidHostedFormConfigError, InvalidHostedFormError } from './errors';
import HostedField from './hosted-field';
import { HostedFieldEvent, HostedFieldEventType } from './hosted-field-events';
import HostedFieldType from './hosted-field-type';
import { getHostedFormOrderData } from './hosted-form-order-data.mock';
import { HostedInputEventMap, HostedInputEventType } from './iframe-content';
import {
    StoredCardHostedFormDataMock,
    StoredCardHostedFormInstrumentFieldsMock,
} from './stored-card-hosted-form.mock';

describe('HostedField', () => {
    let container: HTMLDivElement;
    let field: HostedField;
    let controlPannelField: HostedField;
    let detachmentObserver: Pick<DetachmentObserver, 'ensurePresence'>;
    let eventPoster: Pick<IframeEventPoster<HostedFieldEvent>, 'post' | 'setTarget'>;
    let eventListener: Pick<IframeEventListener<HostedInputEventMap>, 'listen'>;
    let orderId: number;

    beforeEach(() => {
        container = document.createElement('div');
        detachmentObserver = { ensurePresence: jest.fn((_, promise) => promise) };
        eventPoster = { post: jest.fn(), setTarget: jest.fn() };
        eventListener = { listen: jest.fn() };
        orderId = 1;

        container.id = 'field-container-id';
        document.body.appendChild(container);

        controlPannelField = new HostedField(
            HostedFieldType.CardNumber,
            'field-container-id',
            'Enter your card number here',
            'Card number',
            { default: { color: 'rgb(0, 0, 0)', fontFamily: 'Open Sans, Arial' } },
            eventPoster as IframeEventPoster<HostedFieldEvent>,
            eventListener as IframeEventListener<HostedInputEventMap>,
            detachmentObserver as DetachmentObserver,
            orderId,
        );

        field = new HostedField(
            HostedFieldType.CardNumber,
            'field-container-id',
            'Enter your card number here',
            'Card number',
            { default: { color: 'rgb(0, 0, 0)', fontFamily: 'Open Sans, Arial' } },
            eventPoster as IframeEventPoster<HostedFieldEvent>,
            eventListener as IframeEventListener<HostedInputEventMap>,
            detachmentObserver as DetachmentObserver,
        );
    });

    afterEach(() => {
        container.remove();
    });

    it('attaches iframe to container', () => {
        field.attach();

        expect(document.querySelector('#field-container-id iframe')).toBeDefined();
    });

    it('sets iframe URL with version param', () => {
        field.attach();

        // tslint:disable-next-line:no-non-null-assertion
        expect(document.querySelector<HTMLIFrameElement>('#field-container-id iframe')!.src).toBe(
            `${location.origin}/account/stored-instruments/hosted-fields?version=1.0.0`,
        );
    });

    it('sets iframe URL with version param for Control Panel Iframe', () => {
        controlPannelField.attach();

        // tslint:disable-next-line:no-non-null-assertion
        expect(document.querySelector<HTMLIFrameElement>('#field-container-id iframe')!.src).toBe(
            `${location.origin}/admin/payments/${orderId}/hosted-form-field?version=1.0.0`,
        );
    });

    it('sets target for event poster', async () => {
        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!.dispatchEvent(new Event('load'));
        });

        await field.attach();

        expect(eventPoster.setTarget).toHaveBeenCalled();
    });

    it('ensures presence of iframe during attachment', async () => {
        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!.dispatchEvent(new Event('load'));
        });

        const promise = field.attach();

        await promise;

        expect(detachmentObserver.ensurePresence).toHaveBeenCalledWith(
            [document.querySelector('#field-container-id iframe')],
            promise,
        );
    });

    it('notifies if able to attach', async () => {
        jest.spyOn(eventPoster, 'post').mockResolvedValue({
            type: HostedInputEventType.AttachSucceeded,
        });

        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!.dispatchEvent(new Event('load'));
        });

        await field.attach();

        expect(eventPoster.post).toHaveBeenCalledWith(
            {
                type: HostedFieldEventType.AttachRequested,
                payload: {
                    accessibilityLabel: 'Card number',
                    fontUrls: [],
                    placeholder: 'Enter your card number here',
                    styles: { default: { color: 'rgb(0, 0, 0)', fontFamily: 'Open Sans, Arial' } },
                    origin: document.location.origin,
                    type: HostedFieldType.CardNumber,
                },
            },
            {
                successType: HostedInputEventType.AttachSucceeded,
                errorType: HostedInputEventType.AttachFailed,
            },
        );
    });

    it('notifies with font URLs if available', async () => {
        const linkElement = document.createElement('link');

        linkElement.href = 'https://fonts.googleapis.com/css?family=Open+Sans&display=swap';
        linkElement.rel = 'stylesheet';

        document.head.appendChild(linkElement);

        jest.spyOn(eventPoster, 'post').mockResolvedValue({
            type: HostedInputEventType.AttachSucceeded,
        });

        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!.dispatchEvent(new Event('load'));
        });

        await field.attach();

        expect(eventPoster.post).toHaveBeenCalledWith(
            {
                type: HostedFieldEventType.AttachRequested,
                payload: expect.objectContaining({
                    type: HostedFieldType.CardNumber,
                    fontUrls: ['https://fonts.googleapis.com/css?family=Open+Sans&display=swap'],
                }),
            },
            expect.any(Object),
        );
    });

    it('throws error if container is invalid', async () => {
        container.remove();

        try {
            await field.attach();
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidHostedFormConfigError);
        }
    });

    it('sends request to submit payment data', async () => {
        jest.spyOn(eventPoster, 'post').mockResolvedValue({
            type: HostedInputEventType.SubmitSucceeded,
        });

        const fields = [HostedFieldType.CardExpiry, HostedFieldType.CardNumber];
        const data = getHostedFormOrderData();

        await field.submitForm(fields, data);

        expect(eventPoster.post).toHaveBeenCalledWith(
            {
                type: HostedFieldEventType.SubmitRequested,
                payload: { fields, data },
            },
            {
                successType: HostedInputEventType.SubmitSucceeded,
                errorType: HostedInputEventType.SubmitFailed,
            },
        );
    });

    it('sends request to submit stored card form data', async () => {
        jest.spyOn(eventPoster, 'post').mockResolvedValue({
            type: HostedInputEventType.StoredCardSucceeded,
        });

        await field.submitStoredCardForm(
            StoredCardHostedFormInstrumentFieldsMock,
            StoredCardHostedFormDataMock,
        );

        expect(eventPoster.post).toHaveBeenCalledWith(
            {
                type: HostedFieldEventType.StoredCardRequested,
                payload: {
                    fields: StoredCardHostedFormInstrumentFieldsMock,
                    data: StoredCardHostedFormDataMock,
                },
            },
            {
                successType: HostedInputEventType.StoredCardSucceeded,
                errorType: HostedInputEventType.StoredCardFailed,
            },
        );
    });

    it('sends request to submit manual order form data', async () => {
        jest.spyOn(eventPoster, 'post').mockResolvedValue({
            type: HostedInputEventType.StoredCardSucceeded,
        });

        const data = {
            paymentMethodId: 'card',
            paymentSessionToken: '123123123',
        };

        await controlPannelField.submitManualOrderForm(data);

        expect(eventPoster.post).toHaveBeenCalledWith(
            {
                type: HostedFieldEventType.SubmitManualOrderRequested,
                payload: { data },
            },
            {
                successType: HostedInputEventType.SubmitManualOrderSucceeded,
                errorType: HostedInputEventType.SubmitManualOrderFailed,
            },
        );
    });

    it('ensures presence of iframe during submission', async () => {
        field.attach();

        const fields = [HostedFieldType.CardExpiry, HostedFieldType.CardNumber];
        const data = getHostedFormOrderData();
        const promise = field.submitForm(fields, data);

        await promise;

        expect(detachmentObserver.ensurePresence).toHaveBeenCalledWith(
            [document.querySelector('#field-container-id iframe')],
            promise,
        );
    });

    it('throws error if unable to submit payment', async () => {
        jest.spyOn(eventPoster, 'post').mockRejectedValue({
            type: HostedInputEventType.SubmitFailed,
            payload: { error: { code: 'hosted_form_error', message: 'Invalid form' } },
        });

        const fields = [HostedFieldType.CardExpiry, HostedFieldType.CardNumber];
        const data = getHostedFormOrderData();

        try {
            await field.submitForm(fields, data);
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidHostedFormError);
        }
    });

    it('forwards error if submission fails because of server error', async () => {
        jest.spyOn(eventPoster, 'post').mockRejectedValue({
            type: HostedInputEventType.SubmitFailed,
            payload: {
                // tslint:disable-next-line:no-non-null-assertion
                error: getErrorPaymentResponseBody().errors![0],
                response: getResponse(getErrorPaymentResponseBody()),
            },
        });

        const fields = [HostedFieldType.CardExpiry, HostedFieldType.CardNumber];
        const data = getHostedFormOrderData();

        try {
            await field.submitForm(fields, data);
        } catch (error) {
            expect(error).toBeInstanceOf(RequestError);
        }
    });

    it('forwards error if submission fails because of runtime error', async () => {
        const rejection = new Error('Runtime error');

        jest.spyOn(eventPoster, 'post').mockRejectedValue(rejection);

        const fields = [HostedFieldType.CardExpiry, HostedFieldType.CardNumber];
        const data = getHostedFormOrderData();

        try {
            await field.submitForm(fields, data);
        } catch (error) {
            expect(error).toEqual(rejection);
        }
    });
});
