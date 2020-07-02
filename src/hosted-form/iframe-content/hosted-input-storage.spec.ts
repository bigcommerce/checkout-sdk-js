import { BrowserStorage } from '../../common/storage';

import HostedInputStorage from './hosted-input-storage';

describe('HostedInputStorage', () => {
    let storage: Pick<BrowserStorage, 'getItem' | 'setItem'>;
    let subject: HostedInputStorage;

    beforeEach(() => {
        storage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
        };
        subject = new HostedInputStorage(storage as BrowserStorage);
    });

    it('sets nonce in browser storage', () => {
        subject.setNonce('abc');

        expect(storage.setItem)
            .toHaveBeenCalledWith('nonce', 'abc');
    });

    it('retrieves nonce in browser storage', () => {
        jest.spyOn(storage, 'getItem')
            .mockReturnValue('abc');

        expect(subject.getNonce())
            .toEqual('abc');

        expect(storage.getItem)
            .toHaveBeenCalledWith('nonce');
    });
});
