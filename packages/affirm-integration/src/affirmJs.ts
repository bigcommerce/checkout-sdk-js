/* istanbul ignore file */

/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-underscore-dangle */
/**
 * Used this approach as Affirm uses snipped for initializing. Please refer to Affirm documentation in: https://docs.affirm.com/Integrate_Affirm/Direct_API#1._Add_Affirm.js
 */
import { Affirm, AffirmHostWindow } from './affirm';

interface AffirmConfig {
    public_api_key: string;
    script: string;
}

export default function loadAffirmJS(apiKey: string, scriptURL: string) {
    const _AFFIRM_CONFIG: AffirmConfig = {
        public_api_key: apiKey,
        script: scriptURL,
    };

    (function foo(
        m: AffirmHostWindow | any,
        g: AffirmConfig,
        n: 'affirm',
        d: 'checkout',
        a: 'ui',
        e: 'script',
        h: 'ready',
        c: 'jsReady',
    ) {
        const b = m[n] || {};
        console.log(JSON.parse(JSON.stringify(b)));
        const k = document.createElement(e);
        const p = document.getElementsByTagName(e)[0];
        // wypelnia obiekt checkout
        const l = function bar(a: Affirm | any, b: keyof Affirm, c: string) {
            return function baz() {
                a[b]._.push([c, arguments]);
            };
        };

        b[d] = l(b, d, 'set');

        console.log(JSON.parse(JSON.stringify(b)));

        const f = b[d];

        b[a] = {};
        b[a]._ = [];
        f._ = [];
        b._ = [];
        b[a][h] = l(b, a, h);
        console.log(JSON.parse(JSON.stringify(b)));

        b[c] = function qux() {
            b._.push([h, arguments]);
        };

        let a1 = 0;
        console.log(JSON.parse(JSON.stringify(b)));

        // wypelnia obiekt checkout
        for (
            const c1 = 'set add save post open empty reset on off trigger ready setProduct'.split(
                ' ',
            );
            a1 < c1.length;
            a1++
        ) {
            f[c1[a1]] = l(b, d, c1[a1]);
        }
        console.log(JSON.parse(JSON.stringify(b)));

        let a2 = 0;

        for (const c2 = ['get', 'token', 'url', 'items']; a2 < c2.length; a2++) {
            f[c2[a2]] = function foobar() {};
        }
        console.log(JSON.parse(JSON.stringify(b)));

        k.async = !0;
        k.src = g[e];
        console.log(JSON.parse(JSON.stringify(b)));

        if (p.parentNode) {
            p.parentNode.insertBefore(k, p);
        }
        console.log('k', k);
        console.log(JSON.parse(JSON.stringify(b)));

        delete (g as Partial<AffirmConfig>)[e];
        f(g);
        console.log(JSON.parse(JSON.stringify(b)));
        m[n] = b;
    })(window, _AFFIRM_CONFIG, 'affirm', 'checkout', 'ui', 'script', 'ready', 'jsReady');
}
