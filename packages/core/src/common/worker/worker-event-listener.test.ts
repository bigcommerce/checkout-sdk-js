import { WorkerEventListener } from './worker-event-listener';

describe('WorkerEventListener', () => {
    let worker: Worker;
    let workerEventListener: WorkerEventListener<any>;

    const testMessage = {
        type: 'dummyType',
        payload: { data: 'test' },
        context: { extensionId: '123' },
    };

    beforeEach(() => {
        worker = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            postMessage: jest.fn(),
        } as unknown as Worker;

        workerEventListener = new WorkerEventListener(worker);
    });

    it('should start listening to messages', () => {
        workerEventListener.listen();

        expect(worker.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should stop listening to worker messages', () => {
        workerEventListener.listen();
        workerEventListener.stopListen();

        expect(worker.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should add a listener for a specific event type', () => {
        const listener = jest.fn();

        workerEventListener.addListener(testMessage.type, listener);
        workerEventListener.trigger(testMessage);

        expect(listener).toHaveBeenCalledWith(testMessage);
    });

    it('should remove a listener for a specific event type', () => {
        const listener = jest.fn();

        workerEventListener.addListener(testMessage.type, listener);
        workerEventListener.removeListener(testMessage.type, listener);
        workerEventListener.trigger(testMessage);

        expect(listener).not.toHaveBeenCalled();
    });

    it('should trigger all listeners for a specific event type', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        workerEventListener.addListener(testMessage.type, listener1);
        workerEventListener.addListener(testMessage.type, listener2);
        workerEventListener.trigger(testMessage);

        expect(listener1).toHaveBeenCalledWith(testMessage);
        expect(listener2).toHaveBeenCalledWith(testMessage);
    });
});
