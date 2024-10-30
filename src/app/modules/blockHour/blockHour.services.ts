import { IBlockHour } from "./blockHour.interface";
import BlockHour from "./blockHour.model";

const addBlockHour  = async(payload:IBlockHour)=>{
    const result = await BlockHour.create(payload);

    return result;
}

const BlockHourService = {
    addBlockHour
}

export default BlockHourService;

