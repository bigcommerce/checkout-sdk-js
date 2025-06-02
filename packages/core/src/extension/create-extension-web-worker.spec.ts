import { createExtensionWebWorker } from './create-extension-web-worker';
import { MockWorker } from './extension.mock';

// Store original window properties
const originalWorker = window.Worker;
const originalCreateObjectURL = URL.createObjectURL;
const originalBlob = window.Blob;

describe('createExtensionWebWorker', () => {
    let mockCreateObjectURL: jest.Mock;
    let mockBlobConstructor: jest.Mock;
    let mockWorkerConstructor: jest.Mock;

    beforeEach(() => {
        mockCreateObjectURL = jest.fn().mockReturnValue('blob:http://localhost/mock-blob-url-123');
        URL.createObjectURL = mockCreateObjectURL;

        mockBlobConstructor = jest.fn((content, options) => ({
            content,
            options,
            size: content.join('').length,
            type: options.type,
        }));
        window.Blob = mockBlobConstructor as any;

        mockWorkerConstructor = jest.fn((url) => new MockWorker(url));
        window.Worker = mockWorkerConstructor as any;
    });

    afterEach(() => {
        window.Worker = originalWorker;
        URL.createObjectURL = originalCreateObjectURL;
        window.Blob = originalBlob;
        jest.clearAllMocks();
    });

    it('should throw an error if Web Workers are not supported', () => {
        // Simulate no Worker support
        (window as any).Worker = undefined;

        const workerScriptUrl = 'http://localhost/my-worker.js';

        expect(() => createExtensionWebWorker(workerScriptUrl)).toThrow(
            `Unable to load the extension's web worker: your browser does not support Web Workers.`,
        );
    });

    it('should create and return a new Worker instance on success', () => {
        const workerScriptUrl = 'http://localhost/my-worker.js';
        const worker = createExtensionWebWorker(workerScriptUrl);

        expect(mockBlobConstructor).toHaveBeenCalledTimes(1);

        const expectedBlobContent = [
            `importScripts=((i)=>(...a)=>i(...a.map((u)=>''+new URL(u,"${workerScriptUrl}"))))(importScripts);`,
            `importScripts("${workerScriptUrl}")`,
        ].join('');

        expect(mockBlobConstructor.mock.calls[0][0]).toEqual([expectedBlobContent]); // Content is an array of strings
        expect(mockBlobConstructor.mock.calls[0][1]).toEqual({ type: 'text/javascript' });
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlobConstructor.mock.results[0].value);
        expect(mockWorkerConstructor).toHaveBeenCalledTimes(1);
        expect(mockWorkerConstructor).toHaveBeenCalledWith(
            'blob:http://localhost/mock-blob-url-123',
        ); // The mocked blob URL
        expect(worker).toBeInstanceOf(MockWorker);
    });

    it('should throw a generic error if URL.createObjectURL fails', () => {
        mockCreateObjectURL.mockImplementation(() => {
            throw new Error('Blob URL creation failed');
        });

        const workerScriptUrl = 'http://localhost/my-worker.js';

        expect(() => createExtensionWebWorker(workerScriptUrl)).toThrow(
            "Unable to load the extension's web worker",
        );
    });

    it('should throw a generic error if new Worker() instantiation fails', () => {
        mockWorkerConstructor.mockImplementation(() => {
            throw new Error('Worker instantiation failed');
        });

        const workerScriptUrl = 'http://localhost/my-worker.js';

        expect(() => createExtensionWebWorker(workerScriptUrl)).toThrow(
            "Unable to load the extension's web worker",
        );
    });

    it('should throw a generic error if Blob constructor fails', () => {
        mockBlobConstructor.mockImplementation(() => {
            throw new Error('Blob creation failed');
        });

        const workerScriptUrl = 'http://localhost/my-worker.js';

        expect(() => createExtensionWebWorker(workerScriptUrl)).toThrow(
            "Unable to load the extension's web worker",
        );
    });
});
