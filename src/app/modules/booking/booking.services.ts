/* eslint-disable @typescript-eslint/no-explicit-any */

import calculateTotalServiceTime from "../../helper/calculateTotalServiceTime";
import Booking from "./booking.model";

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

const createBooking = async (customerId: string, payload: any) => {
    const { staffId, serviceIds, date, startTime } = payload;
    console.log("date", date);

    // Calculate the total time for selected services
    const totalDuration = await calculateTotalServiceTime(serviceIds);

    // Create the start date in local time
    const [startHours, startMinutes] = startTime.split(":").map(Number); // Convert to numbers
    const startDate = new Date(date); // Initialize date with the provided date
    startDate.setHours(startHours, startMinutes, 0); // Set local hours and minutes

    console.log("total duration",totalDuration)
    // Create the end date based on total duration
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + totalDuration); // Add duration to start date

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    // Create the booking with local time
    const result = await Booking.create({
        ...payload,
        startTime: startDate, // Store local time
        endTime: endDate,     // Store local time
        customerId,
    });

    return result;
};



  const BookingService = {
    createBooking
  }

  export default BookingService;
