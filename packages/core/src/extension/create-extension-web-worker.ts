export function createExtensionWebWorker(url: string): Worker {
    let worker: Worker;

    if (!window.Worker) {
        throw new Error(
            `Unable to load the extension's web worker: your browser does not support Web Workers.`,
        );
    }

    try {
        const blob = URL.createObjectURL(
            new Blob(
                [
                    `importScripts=((i)=>(...a)=>i(...a.map((u)=>''+new URL(u,"${url}"))))(importScripts);importScripts("${url}")`,
                ],
                { type: 'text/javascript' },
            ),
        );

        worker = new Worker(blob);

    } catch (error) {
        throw new Error(
            `Unable to load the extension's web worker`,
        );
    }

    return worker;
}
