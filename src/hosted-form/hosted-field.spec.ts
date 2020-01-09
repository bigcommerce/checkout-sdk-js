import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import { BrowserStorage } from '../common/storage';

import { InvalidHostedFormConfigError, InvalidHostedFormError } from './errors';
import HostedField, { LAST_RETRY_KEY } from './hosted-field';
import { HostedFieldEvent, HostedFieldEventType } from './hosted-field-events';
import HostedFieldType from './hosted-field-type';
import { getHostedFormOrderData } from './hosted-form-order-data.mock';
import { HostedInputEventMap, HostedInputEventType } from './iframe-content';

describe('HostedField', () => {
    let container: HTMLDivElement;
    let field: HostedField;
    let eventPoster: Pick<IframeEventPoster<HostedFieldEvent>, 'post' | 'setTarget'>;
    let eventListener: Pick<IframeEventListener<HostedInputEventMap>, 'listen'>;
    let location: Pick<Location, 'replace'>;
    let storage: Pick<BrowserStorage, 'getItem' | 'setItem'>;

    beforeEach(() => {
        container = document.createElement('div');
        eventPoster = { post: jest.fn(), setTarget: jest.fn() };
        eventListener = { listen: jest.fn() };
        location = { replace: jest.fn() };
        storage = { getItem: jest.fn(), setItem: jest.fn() };

        container.id = 'field-container-id';
        document.body.appendChild(container);

        field = new HostedField(
            'https://payment.bigcommerce.com',
            'dc030783-6129-4ee3-8e06-6f4270df1527',
            HostedFieldType.CardNumber,
            'field-container-id',
            'Enter your card number here',
            'Card number',
            { default: { color: 'rgb(0, 0, 0)' } },
            eventPoster as IframeEventPoster<HostedFieldEvent>,
            eventListener as IframeEventListener<HostedInputEventMap>,
            storage as BrowserStorage,
            location as Location
        );
    });

    afterEach(() => {
        container.remove();
    });

    it('attaches iframe to container', () => {
        field.attach();

        expect(document.querySelector('#field-container-id iframe'))
            .toBeDefined();
    });

    it('sets target for event poster', async () => {
        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!
                .dispatchEvent(new Event('load'));
        });

        await field.attach();

        expect(eventPoster.setTarget)
            .toHaveBeenCalled();
    });

    it('notifies if able to attach', async () => {
        jest.spyOn(eventPoster, 'post')
            .mockResolvedValue({ type: HostedInputEventType.AttachSucceeded });

        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!
                .dispatchEvent(new Event('load'));
        });

        await field.attach();

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedFieldEventType.AttachRequested,
                payload: {
                    accessibilityLabel: 'Card number',
                    placeholder: 'Enter your card number here',
                    styles: { default: { color: 'rgb(0, 0, 0)' } },
                    type: HostedFieldType.CardNumber,
                },
            }, {
                successType: HostedInputEventType.AttachSucceeded,
                errorType: HostedInputEventType.AttachFailed,
            });
    });

    it('retries if unable to attach', async () => {
        jest.spyOn(eventPoster, 'post')
            .mockRejectedValue({
                type: HostedInputEventType.AttachFailed,
                payload: {
                    error: { message: 'Invalid form', redirectUrl: 'https://store.foobar.com/checkout' },
                },
            });

        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!
                .dispatchEvent(new Event('load'));
        });

        field.attach();

        // Wait for a timeout because `attach` never resolves in this scenario
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(location.replace)
            .toHaveBeenCalled();
    });

    it('throws error if unable to attach or retry', async () => {
        jest.spyOn(eventPoster, 'post')
            .mockRejectedValue({
                type: HostedInputEventType.AttachFailed,
                payload: {
                    error: { message: 'Invalid form', redirectUrl: 'https://store.foobar.com/checkout' },
                },
            });

        jest.spyOn(storage, 'getItem')
            .mockImplementation(key => key.includes(LAST_RETRY_KEY) ? `${Date.now()}` : undefined);

        process.nextTick(() => {
            // tslint:disable-next-line:no-non-null-assertion
            document.querySelector('#field-container-id iframe')!
                .dispatchEvent(new Event('load'));
        });

        try {
            await field.attach();
        } catch (error) {
            expect(error)
                .toBeInstanceOf(InvalidHostedFormError);
        }
    });

    it('throws error if container is invalid', async () => {
        container.remove();

        try {
            await field.attach();
        } catch (error) {
            expect(error)
                .toBeInstanceOf(InvalidHostedFormConfigError);
        }
    });

    it('sends request to submit payment data', async () => {
        jest.spyOn(eventPoster, 'post')
            .mockResolvedValue({ type: HostedInputEventType.SubmitSucceeded });

        const fields = [HostedFieldType.CardExpiry, HostedFieldType.CardNumber];
        const data = getHostedFormOrderData();

        await field.submitForm(fields, data);

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedFieldEventType.SubmitRequested,
                payload: { fields, data },
            }, {
                successType: HostedInputEventType.SubmitSucceeded,
                errorType: HostedInputEventType.SubmitFailed,
            });
    });

    it('throws error if unable to submit payment', async () => {
        jest.spyOn(eventPoster, 'post')
            .mockRejectedValue({
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

    it('forwards error if submission fails because of runtime error', async () => {
        const rejection = new Error('Runtime error');

        jest.spyOn(eventPoster, 'post')
            .mockRejectedValue(rejection);

        const fields = [HostedFieldType.CardExpiry, HostedFieldType.CardNumber];
        const data = getHostedFormOrderData();

        try {
            await field.submitForm(fields, data);
        } catch (error) {
            expect(error).toEqual(rejection);
        }
    });
});
