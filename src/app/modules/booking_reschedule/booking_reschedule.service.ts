import { JwtPayload } from "jsonwebtoken";
import { IBookingReschedule } from "./booking_reschedule.interface";

const createRescheduleRequest = async(userData:JwtPayload,payload:IBookingReschedule)=>{
    console.log("reschedule request created",userData,payload);

}




const RescheduleRequestServices = {
    createRescheduleRequest
}

export default RescheduleRequestServices;