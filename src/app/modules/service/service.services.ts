import httpStatus from "http-status";
import AppError from "../../error/appError";
import Category from "../category/category.model";
import Client from "../client/client.model";
import IService from "./service.interface";
import Service from "./service.model";

const createService = async(shopId:string,payload:IService)=>{
    const isCategoryExist = await  Category.findById(payload.category);
    if(!isCategoryExist){
        throw new AppError(httpStatus.NOT_FOUND,"Category not exits")
    }
    const shop = await Client.findById(shopId);
    const result = await Service.create({...payload,shop:shopId,shopCategory:shop.shopCategoryId});
    return result;
}


const updateService = async(id:string,payload:Partial<IService>)=>{
   if(payload.category){
    const isCategoryExist = await  Category.findById(payload.category);
    if(!isCategoryExist){
        throw new AppError(httpStatus.NOT_FOUND,"Category not exits")
    }
   }
   const result = await Service.findByIdAndUpdate(id,payload,{new:true,runValidators:true});
   return result;
}

const deleteService = async(id:string)=>{
    const result = await Service.findByIdAndDelete(id);
    return result;
}



const ServiceService = {
    createService,
    updateService,
    deleteService
}


export default ServiceService;