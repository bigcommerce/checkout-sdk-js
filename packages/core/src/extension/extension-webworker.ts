/* eslint-disable no-console */
export class ExtensionWebWorker {
    private url: string;

    constructor(url: string) {
        if (!window.Worker) {
            throw new Error(
                `Unable to load the extension's web worker: your browser does not support Web Workers.`,
            );
        }

        this.url = url;
    }

    attach(): Worker {
        // TODO: error handling
        const blob = URL.createObjectURL(
            new Blob(
                [
                    `importScripts=((i)=>(...a)=>i(...a.map((u)=>''+new URL(u,"${this.url}"))))(importScripts);importScripts("${this.url}")`,
                ],
                { type: 'text/javascript' },
            ),
        );

        const worker = new Worker(blob);

        // Code below is temporary
        try {
            worker.onmessage = (event) => {
                console.log('Host got message:', event.data);
            };

            worker.onerror = (error) => {
                console.error('Main Script: Worker error:', error.message);
            };

            worker.postMessage('hello world');
        } catch (e: any) {
            console.error('Main Script: Failed during worker/observer setup.', e);
        }

        return worker;
    }
}
