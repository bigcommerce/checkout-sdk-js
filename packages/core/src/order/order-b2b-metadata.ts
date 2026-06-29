import { AddressExtraFieldValue } from '../form';

export interface OrderB2BMetadata {
    invoiceComment?: string;
    orderExtraFields?: AddressExtraFieldValue[];
    poNumber?: string;
    referenceNumber?: string;
}
