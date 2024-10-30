import BlockHour from '../blockHour/blockHour.model';
import Booking from '../booking/booking.model';
import Staff from '../staff/staff.model';
import BusinessHour from './businessHour.model';

const getAvailableDates = async (staffId: string) => {
  const today = new Date();
  const nextFiveDays = [];

  const staff = await Staff.findById(staffId);
  if (!staff) throw new Error('Staff not found');

  const shopHours = await BusinessHour.find({
    entityId: staff.shop,
    entityType: 'Shop',
  });
  const staffHours = await BusinessHour.find({
    entityId: staffId,
    entityType: 'Staff',
  });

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });

    const shopDayHours = shopHours.find((hour) => hour.day === day);
    const staffDayHours = staffHours.find((hour) => hour.day === day);

    if (
      shopDayHours &&
      staffDayHours &&
      !shopDayHours.isClosed &&
      !staffDayHours.isClosed
    ) {
      nextFiveDays.push({
        date: date.toISOString().split('T')[0],
        day,
        isAvailable: true,
        openTime: staffDayHours.openTime,
        closeTime: staffDayHours.closeTime,
      });
    } else {
      nextFiveDays.push({
        date: date.toISOString().split('T')[0],
        day,
        isAvailable: false,
      });
    }
  }
  return nextFiveDays;
};

// get available slots

// const getAvailableTimeSlots = async (staffId: string, date: string) => {
//   const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
//   const staffHours = await BusinessHour.findOne({
//     entityId: staffId,
//     entityType: 'Staff',
//     day,
//   });
//   console.log('staff hours', staffHours);
//   if (!staffHours || staffHours.isClosed) return { availableSlots: [] };

//   //   const openTime = new Date(`${date}T${staffHours.openTime}`);
//   //   const closeTime = new Date(`${date}T${staffHours.closeTime}`);
//   const openTime = new Date(`${date}T${staffHours.openTime}:00.000+06:00`);
//   const closeTime = new Date(`${date}T${staffHours.closeTime}:00.000+06:00`);


//   console.log('opentime', openTime);
//   console.log('closetime', closeTime);
//   const blockHours = await BlockHour.find({
//     entityId: staffId,
//     entityType: 'Staff',
//     day,
//   });
//   const existingBookings = await Booking.find({
//     staffId,
//     startTime: { $gte: openTime, $lt: closeTime },
//   });

//   const availableSlots = [];
//   let slotStart = new Date(openTime);

//   while (slotStart < closeTime) {
//     const slotEnd = new Date(slotStart);
//     slotEnd.setMinutes(slotStart.getMinutes() + 30);

//     const isBlocked = blockHours.some(
//       (bh) =>
//         slotStart.toISOString().slice(11, 16) >= bh.startTime &&
//         slotStart.toISOString().slice(11, 16) < bh.endTime,
//     );
//     const isBooked = existingBookings.some(
//       (b) => slotStart >= b?.startTime && slotEnd <= b?.endTime,
//     );

//     if (!isBlocked && !isBooked) {
//       availableSlots.push(slotStart.toISOString().slice(11, 16));
//     }
//     slotStart = slotEnd;
//   }

//   return availableSlots;
// };
// const getAvailableTimeSlots = async (staffId: string, date: string) => {
//     const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
//     const staffHours = await BusinessHour.findOne({
//       entityId: staffId,
//       entityType: 'Staff',
//       day,
//     });
    
//     console.log('staff hours', staffHours);
    
//     // Check if staff hours are available or if staff is closed
//     if (!staffHours || staffHours.isClosed) return { availableSlots: [] };
  
//     // Create open and close time in local time
//     const openTime = new Date(date);
//     openTime.setHours(parseInt(staffHours.openTime.split(':')[0]), parseInt(staffHours.openTime.split(':')[1]), 0, 0);
  
//     const closeTime = new Date(date);
//     closeTime.setHours(parseInt(staffHours.closeTime.split(':')[0]), parseInt(staffHours.closeTime.split(':')[1]), 0, 0);
  
//     console.log('opentime', openTime);
//     console.log('closetime', closeTime);
    
//     // Fetch blocked hours and existing bookings
//     const blockHours = await BlockHour.find({
//       entityId: staffId,
//       entityType: 'Staff',
//       day,
//     });
  
//     const existingBookings = await Booking.find({
//       staffId,
//       startTime: { $gte: openTime, $lt: closeTime },
//     });
  
//     const availableSlots = [];
//     let slotStart = new Date(openTime);
  
//     // Generate available time slots in 30-minute intervals
//     while (slotStart < closeTime) {
//       const slotEnd = new Date(slotStart);
//       slotEnd.setMinutes(slotStart.getMinutes() + 30);
  
//       const isBlocked = blockHours.some(
//         (bh) =>
//           slotStart.toISOString().slice(11, 16) >= bh.startTime &&
//           slotStart.toISOString().slice(11, 16) < bh.endTime,
//       );
  
//       const isBooked = existingBookings.some(
//         (b) => slotStart >= b?.startTime && slotEnd <= b?.endTime,
//       );
  
//       if (!isBlocked && !isBooked) {
//         availableSlots.push(slotStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
//       }
//       slotStart = slotEnd;
//     }
  
//     return availableSlots;
//   };

const getAvailableTimeSlots = async (staffId: string, date: string) => {
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const staffHours = await BusinessHour.findOne({
      entityId: staffId,
      entityType: 'Staff',
      day,
    });
  
    console.log('staff hours', staffHours);
  
    // Check if staff hours are available or if staff is closed
    if (!staffHours || staffHours.isClosed) return { availableSlots: [] };
  
    // Create open and close time in local time
    const openTime = new Date(date);
    openTime.setHours(parseInt(staffHours.openTime.split(':')[0]), parseInt(staffHours.openTime.split(':')[1]), 0, 0);
  
    const closeTime = new Date(date);
    closeTime.setHours(parseInt(staffHours.closeTime.split(':')[0]), parseInt(staffHours.closeTime.split(':')[1]), 0, 0);
  
    console.log('opentime', openTime);
    console.log('closetime', closeTime);
  
    // Fetch blocked hours and existing bookings
    const blockHours = await BlockHour.find({
      entityId: staffId,
      entityType: 'Staff',
      day,
    });
  
    const existingBookings = await Booking.find({
      staffId,
      startTime: { $gte: openTime, $lt: closeTime },
    });
  
    const availableSlots = [];
    let slotStart = new Date(openTime);
  
    // Generate available time slots in 30-minute intervals
    while (slotStart < closeTime) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + 30);
  
      const isBlocked = blockHours.some(
        (bh) =>
          slotStart.toISOString().slice(11, 16) >= bh.startTime &&
          slotStart.toISOString().slice(11, 16) < bh.endTime,
      );
  
      const isBooked = existingBookings.some(
        (b) => slotStart >= b?.startTime && slotEnd <= b?.endTime,
      );
  
      // Push slot information with isBooked status
      if (!isBlocked) {
        availableSlots.push({
          time: slotStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          isBooked: isBooked, // true or false based on booking status
        });
      }
      slotStart = slotEnd;
    }
  
    return availableSlots;
  };
  
  

const BusinessHourServices = {
  getAvailableDates,
  getAvailableTimeSlots,
};

export default BusinessHourServices;
