import { MockWorker } from '../../extension/extension.mock';

import { WorkerEventPoster } from './worker-event-poster';

describe('WorkerEventPoster', () => {
    let mockWorker: MockWorker;

    beforeEach(() => {
        mockWorker = new MockWorker('https://worker.extension.com/worker.js');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with a worker and context', () => {
            const poster = new WorkerEventPoster(mockWorker as any as Worker, 'testContext');

            expect(poster).toBeDefined();
        });
    });

    describe('post', () => {
        it('should call worker.postMessage with the event and the provided context', () => {
            const poster = new WorkerEventPoster(mockWorker as any as Worker, 'testContext');
            const event = { id: 'dynamic-translatable-123', text: 'dynamic text', locale: 'en-US' };

            poster.post(event);

            expect(mockWorker.postMessage).toHaveBeenCalledTimes(1);
            expect(mockWorker.postMessage).toHaveBeenCalledWith({
                ...event,
                context: 'testContext',
            });
        });

        it('should spread the event properties into the message object', () => {
            const poster = new WorkerEventPoster(mockWorker as any as Worker, 'testContext');
            const event = { id: 'dynamic-translatable-123', text: 'dynamic text', locale: 'en-US' };

            poster.post(event);

            expect(mockWorker.postMessage).toHaveBeenCalledWith({
                id: 'dynamic-translatable-123',
                text: 'dynamic text',
                locale: 'en-US',
                context: 'testContext',
            });
        });

        it('should throw an error if post is called when _worker is null (defensive check)', () => {
            const poster = new WorkerEventPoster(null as any as Worker, 'testContext');

            const event = { type: 'FAIL_EVENT' };

            expect(() => poster.post(event)).toThrow(
                'WorkerPoster: Worker is not initialized or creation failed. Cannot post message.',
            );
            expect(mockWorker.postMessage).not.toHaveBeenCalled();
        });
    });
});
