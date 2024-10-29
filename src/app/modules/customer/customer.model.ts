import { model, Schema } from 'mongoose';
import { ICustomer } from './customer.interface';

const CustomerSchema = new Schema<ICustomer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    city:{
      type:String,
      required:true
    },
    country:{
      type:String,
      required:true
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    age:{
      type:Number
    },

    // location: {
    //   type: LocationSchema,
    //   default: null,
    //   index: '2dsphere',
    // },
    profile_image: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  },
);

const Customer = model<ICustomer>('Customer', CustomerSchema);

export default Customer;
