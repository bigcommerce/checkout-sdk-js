export default interface Fee {
    id: string;
    type: string;
    name: string;
    displayName: string;
    cost: number;
    source: string;
}

export interface FeeRequestBody {
    type: 'custom_fee';
    name: string;
    display_name: string;
    cost: number;
    source: string;
    tax_class_id?: number;
}
