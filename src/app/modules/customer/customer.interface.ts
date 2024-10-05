export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
export interface ICustomer {
  name: string;
  email: string;
  phoneNumber: string;
  location: ILocation;
  profile_image: string;
}
