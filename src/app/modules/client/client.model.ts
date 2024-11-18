import { model, Schema, models } from 'mongoose';
import { IClient } from './client.interface';
import { ILocation } from '../customer/customer.interface';
import { ENUM_PAYMENT_PREFERENCES } from '../../utilities/enum';

const locationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const clientSchema = new Schema<IClient>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  shopCategoryId:{
    type:Schema.Types.ObjectId,
    // required:true,
    ref:"ShopCategory"
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String,},
  gender:{
    type:String,

  },
  dateOfBirth:{
    type:Date,
  },
  shopName:{
    type:String,
  },
  shopCategory: { type: String},
  shopGenderCategory: {
    type: String,
    enum: ['male', 'female'],
  },
  shopImages: {
    type: [String],
  },

  location: {
    type: locationSchema,
    // required: true,
    index: '2dsphere',
  },
  profile_image: { type: String, default: '' },
  bankName: { type: String, },
  bankAccountName: { type: String, },
  bankAccountNumber: { type: String, },
  branchCode: { type: String, },
  bankCity: { type: String, },
  payOnShopChargeDueAmount : {type:Number,default:0},
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  totalRatingCount: {
    type: Number,
    default: 0, 
  },
  paymentPreferences:{type:String,enum:Object.values(ENUM_PAYMENT_PREFERENCES)},
  isShopInfoProvided:{type:Boolean,default:false} ,
  isProfileCompleted:{type:Boolean,default:false},
  isDeleted: { type: Boolean, default: false },
},{
  timestamps: true,
  toJSON: { virtuals: true },
});

const Client = models.Client || model('Client', clientSchema);

export default Client;
