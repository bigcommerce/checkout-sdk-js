export default interface Fee {
    id: string;
    type: string;
    name: string;
    displayName: string;
    cost: number;
    source: string;
}

// request shape for the Checkout Fees API.
// Maps 1:1 to POST /v3/checkouts/{checkoutId}/fees.
export interface FeeRequestBody {
    type: 'custom_fee';
    name: string;
    display_name: string;
    cost: number;
    source: string;
    tax_class_id?: number;
}
