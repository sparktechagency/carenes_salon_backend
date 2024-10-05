export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IVendor {
  storeName: string;
  phoneNumber: string;
  storeLocation: ILocation;
  email: string;
  storeImage: string;
  storeLicence: string;
  shopType: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  paymentMethodPreference: string;
}
