import ScriptLoader from './script-loader';

export function createScriptLoader(): ScriptLoader {
    return new ScriptLoader(document);
}
