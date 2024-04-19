import ActionOptions from './action-options';

export default function isActionOptions(param: any): param is ActionOptions {
    return param && typeof param.useCache === 'boolean';
}
