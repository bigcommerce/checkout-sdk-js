import { DigitalItem, GiftCertificateItem, PhysicalItem } from './line-item';

export default interface LineItemMap {
    physicalItems: PhysicalItem[];
    digitalItems: DigitalItem[];
    giftCertificates: GiftCertificateItem[];
}
