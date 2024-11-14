/* eslint-disable @typescript-eslint/no-explicit-any */

import calculateTotalServiceTime from '../../helper/calculateTotalServiceTime';
import Discount from '../discount/discount.model';
import { Product } from '../product/product.model';
import Service from '../service/service.model';
import Booking from './booking.model';

// const createBooking =  async (customerId:string,payload:any) => {
//     const { staffId, serviceIds, date, startTime } =payload;
//     console.log("date",date)

//     // Calculate the total time for selected services
//     const totalDuration = await calculateTotalServiceTime(serviceIds);

//     // const start = new Date(`${date}T${startTime}`);
//     // const end = new Date(start);
//     // end.setMinutes(start.getMinutes() + totalDuration);
//     const startDate = new Date(date);
//     const [startHours, startMinutes] = startTime.split(":");
//     startDate.setHours(startHours, startMinutes);
//     const endDate = new Date(startDate);
//         endDate.setMinutes(startDate.getMinutes() + totalDuration);

//         console.log("dkjfkdjf",startDate,endDate)

//     // Verify that the slot is still available
//     // const availableSlots = await BusinessHourServices.getAvailableTimeSlots(staffId, date);
//     // const selectedSlot = availableSlots.find(slot => slot.time === start.toISOString().slice(11, 16));

//     // if (!selectedSlot || selectedSlot.isBooked) {
//     //  throw new AppError(httpStatus.BAD_REQUEST,"'Selected time slot is no longer available'")
//     // }

//     // Create the booking
//     const result = await Booking.create({...payload,endTime:endDate,customerId,startTime:startDate});
//     return result
//   };

// const createBooking = async (customerId: string, payload: any) => {
//     const { staffId, serviceIds, date, startTime } = payload;
//     console.log("date", date);

//     // Calculate the total time for selected services
//     const totalDuration = await calculateTotalServiceTime(serviceIds);

//     // Create the start date in local time
//     const [startHours, startMinutes] = startTime.split(":").map(Number); // Convert to numbers
//     const startDate = new Date(date); // Initialize date with the provided date
//     startDate.setHours(startHours, startMinutes, 0); // Set local hours and minutes

//     console.log("total duration",totalDuration)
//     // Create the end date based on total duration
//     const endDate = new Date(startDate);
//     endDate.setMinutes(startDate.getMinutes() + totalDuration); // Add duration to start date

//     console.log("Start Date:", startDate);
//     console.log("End Date:", endDate);

//     // Create the booking with local time
//     const result = await Booking.create({
//         ...payload,
//         startTime: startDate, // Store local time
//         endTime: endDate,     // Store local time
//         customerId,
//     });

//     return result;
// };

// const createBooking = async (customerId: string, payload: any) => {
//   const { serviceIds, date, startTime } = payload;

//   // Fetch current date for discount comparison
//   const now = new Date();

//   // Fetch services and their prices (with discounts if applicable)
//   const servicesWithPrices = await Promise.all(
//     serviceIds.map(async (serviceId:string) => {
//       const service = await Service.findById(serviceId).select('price');

//       if (!service) {
//         throw new Error(`Service with ID ${serviceId} not found`);
//       }

//       // Check if there's an active discount for this service
//       const discount = await Discount.findOne({
//         shop: service.shop,
//         discountStartDate: { $lte: now },
//         discountEndDate: { $gte: now },
//         $or: [
//           { services: 'all-services' },
//           { services: service._id },
//         ],
//       });

//       // Calculate the discount price if a discount exists; otherwise, use the original price
//       const price = discount
//         ? service.price - (service.price * discount.discountPercentage) / 100
//         : service.price;

//       return { serviceId: service._id, price };
//     })
//   );

//   // Calculate the total time for selected services
//   const totalDuration = await calculateTotalServiceTime(serviceIds);

//   // Create the start date in local time
//   const [startHours, startMinutes] = startTime.split(':').map(Number); // Convert to numbers
//   const startDate = new Date(date); // Initialize date with the provided date
//   startDate.setHours(startHours, startMinutes, 0); // Set local hours and minutes

//   // Create the end date based on total duration
//   const endDate = new Date(startDate);
//   endDate.setMinutes(startDate.getMinutes() + totalDuration); // Add duration to start date

//   // Create the booking with local time and services including prices
//   const result = await Booking.create({
//     ...payload,
//     startTime: startDate, // Store local time
//     endTime: endDate,     // Store local time
//     customerId,
//     services: servicesWithPrices, // Add services array with serviceId and price
//   });

//   return result;
// };

const createBooking = async (customerId: string, payload: any) => {
  const {serviceIds, productIds, date, startTime, shopId } = payload;

  // Fetch current date for discount comparison
  const now = new Date();

  // Fetch services with their applicable prices
  const servicesWithPrices = await Promise.all(
    serviceIds.map(async (serviceId:string) => {
      const service = await Service.findById(serviceId).select('price');
      if (!service) throw new Error(`Service with ID ${serviceId} not found`);

      // Check for an active discount
      const discount = await Discount.findOne({
        shop: shopId,
        discountStartDate: { $lte: now },
        discountEndDate: { $gte: now },
        $or: [{ services: 'all-services' }, { services: service._id }],
      });

      // Calculate discount price if discount applies; otherwise, use original price
      const price = discount
        ? service.price - (service.price * discount.discountPercentage) / 100
        : service.price;

      return { serviceId: service._id, price };
    }),
  );

  // Fetch products with their applicable prices
  const productsWithPrices = await Promise.all(
    productIds.map(async (productId:string) => {
      const product = await Product.findById(productId).select('price');
      if (!product) throw new Error(`Product with ID ${productId} not found`);
      // Check for an active discount
      const discount = await Discount.findOne({
        shop: shopId,
        discountStartDate: { $lte: now },
        discountEndDate: { $gte: now },
        $or: [
          { products: 'all-products' },
          { products: { $in: [product._id.toString()] } },
        ],
      });
      // Calculate discount price if discount applies; otherwise, use original price
      const price = discount
        ? product.price - (product.price * discount.discountPercentage) / 100
        : product.price;

      return { productId: product._id, price };
    }),
  );

  // Calculate the total time for selected services
  const totalDuration = await calculateTotalServiceTime(serviceIds);

  // Create the start date in local time
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const startDate = new Date(date);
  startDate.setHours(startHours, startMinutes, 0);

  // Create the end date based on total duration
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + totalDuration);

  // Create the booking with services and products, including discount prices where applicable
  const result = await Booking.create({
    ...payload,
    startTime: startDate,
    endTime: endDate,
    customerId,
    services: servicesWithPrices, // Include services array with serviceId and price
    products: productsWithPrices, // Include products array with productId and price
  });

  return result;
};

const BookingService = {
  createBooking,
};

export default BookingService;
