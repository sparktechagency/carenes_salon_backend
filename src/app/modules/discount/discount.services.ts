import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IDiscount } from "./discount.interface";
import Discount from "./discount.model";

const createDiscount = async(shopId:string,payload:IDiscount)=>{
    const discount = await Discount.findOne({shop:shopId});

    if(discount){
        throw new AppError(httpStatus.BAD_REQUEST,"You already have a discount schedule")
    }

    const result = await Discount.create({...payload,shop:shopId});

    return result;
}

const getDiscount = async(shopId:string)=>{
    const discount = await Discount.findOne({shop:shopId});

    if(!discount){
        throw new AppError(httpStatus.BAD_REQUEST,"You don't add any discount");
    }
    return discount;
}

const updateDiscount = async(shopId:string,id:string,payload:Partial<IDiscount>)=>{
    const discount = await Discount.findOne({_id:id,shop:shopId});

    if(!discount){
        throw new AppError(httpStatus.NOT_FOUND,"You don't have any discount schedule")
    }
    const result = await Discount.findOne({_id:id,shop:shopId},payload,{new:true,runValidators:true});
    return result;
}


const DiscountService = {
    createDiscount,
    getDiscount,
    updateDiscount
}

export default DiscountService;