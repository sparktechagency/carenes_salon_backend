import Service from "../modules/service/service.model";

const calculateTotalServiceTime = async (serviceIds:string[]) => {
    console.log("serviceIds",serviceIds)
    const services = await Service.find({ _id: { $in: serviceIds } });
    console.log(services);
    return services.reduce((total, service) => total + service.durationMinutes, 0);
  };



export default calculateTotalServiceTime;