import AffirmSdk from './affirm-sdk';

export default interface AffirmWindow extends Window {
    Affirm: AffirmSdk;
}
