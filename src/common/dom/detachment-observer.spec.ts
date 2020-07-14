import { EventEmitter } from 'events';
import { noop } from 'lodash';

import DetachmentObserver from './detachment-observer';
import { UnexpectedDetachmentError } from './errors';
import { MutationObserverFactory } from './mutation-observer';

describe('DetachmentObserver', () => {
    let mutationEventEmitter: EventEmitter;
    let mutationObserver: Pick<MutationObserver, 'disconnect' | 'observe'>;
    let mutationObserverFactory: Pick<MutationObserverFactory, 'create'>;
    let subject: DetachmentObserver;

    beforeEach(() => {
        mutationEventEmitter = new EventEmitter();

        mutationObserver = {
            observe: jest.fn(),
            disconnect: jest.fn(),
        };

        mutationObserverFactory = {
            create: jest.fn(callback => {
                mutationEventEmitter.on('remove', callback);

                return mutationObserver;
            }),
        };

        subject = new DetachmentObserver(
            mutationObserverFactory as MutationObserverFactory
        );
    });

    it('throws error and stops observing if targetted element is removed before promise is resolved', async () => {
        const element = document.createElement('div');
        const promise = new Promise(noop);
        const output = subject.ensurePresence([element], promise);

        mutationEventEmitter.emit('remove', [{ removedNodes: [element] }]);

        try {
            await output;
        } catch (error) {
            expect(error)
                .toEqual(expect.any(UnexpectedDetachmentError));

            expect(mutationObserver.disconnect)
                .toHaveBeenCalled();
        }
    });

    it('returns promised value and stops observing if targetted element is not removed before promise is resolved', async () => {
        const eventEmitter = new EventEmitter();
        const element = document.createElement('div');
        const promise = new Promise(resolve => eventEmitter.on('resolve', resolve));
        const output = subject.ensurePresence([element], promise);

        eventEmitter.emit('resolve', 'foobar');

        expect(await output)
            .toEqual('foobar');

        expect(mutationObserver.disconnect)
            .toHaveBeenCalled();
    });
});
