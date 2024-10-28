// const mongoose = require('mongoose');

// const BusinessHourSchema = new mongoose.Schema({
//   entityId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: 'entityType',
//   },
//   entityType: { type: String, enum: ['Shop', 'Staff'], required: true },
//   day: {
//     type: String,
//     enum: [
//       'Sunday',
//       'Monday',
//       'Tuesday',
//       'Wednesday',
//       'Thursday',
//       'Friday',
//       'Saturday',
//     ],
//     required: true,
//   },
//   openTime: { type: String }, // Format: "HH:mm"
//   closeTime: { type: String },
//   isClosed: { type: Boolean, default: false },
// });

// const BlockHourSchema = new mongoose.Schema({
//   entityId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: 'entityType',
//   },
//   entityType: { type: String, enum: ['Shop', 'Staff'], required: true },
//   day: { type: String, required: true },
//   startTime: { type: String, required: true },
//   endTime: { type: String, required: true },
// });

// module.exports = {
//   BusinessHour: mongoose.model('BusinessHour', BusinessHourSchema),
//   BlockHour: mongoose.model('BlockHour', BlockHourSchema),
// };

// const ShopSchema = new mongoose.Schema({
//     name: String,
//     address: String,
//   });

//   const StaffSchema = new mongoose.Schema({
//     name: String,
//     shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
//     services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
//   });

//   const BookingSchema = new mongoose.Schema({
//     customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
//     staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
//     serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
//     startTime: Date,
//     endTime: Date,
//     status: { type: String, enum: ['booked', 'completed', 'canceled'], default: 'booked' }
//   });

//   module.exports = {
//     Shop: mongoose.model('Shop', ShopSchema),
//     Staff: mongoose.model('Staff', StaffSchema),
//     Booking: mongoose.model('Booking', BookingSchema),
//   };

// available dates-------------------------------------------------------------------

// const getAvailableDates = async (staffId) => {
//     const today = new Date();
//     const nextFiveDays = [];

//     const staff = await Staff.findById(staffId);
//     if (!staff) throw new Error('Staff not found');

//     const shopHours = await BusinessHour.find({ entityId: staff.shopId, entityType: 'Shop' });
//     const staffHours = await BusinessHour.find({ entityId: staffId, entityType: 'Staff' });

//     for (let i = 0; i < 5; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
//       const day = date.toLocaleDateString('en-US', { weekday: 'long' });

//       const shopDayHours = shopHours.find(hour => hour.day === day);
//       const staffDayHours = staffHours.find(hour => hour.day === day);

//       if (shopDayHours && staffDayHours && !shopDayHours.isClosed && !staffDayHours.isClosed) {
//         nextFiveDays.push({
//           date: date.toISOString().split('T')[0],
//           isAvailable: true,
//           openTime: staffDayHours.openTime,
//           closeTime: staffDayHours.closeTime,
//         });
//       } else {
//         nextFiveDays.push({
//           date: date.toISOString().split('T')[0],
//           isAvailable: false,
//         });
//       }
//     }
//     return nextFiveDays;
//   };

//   const getAvailableTimeSlots = async (staffId, date) => {
//     const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
//     const staffHours = await BusinessHour.findOne({ entityId: staffId, entityType: 'Staff', day });
//     if (!staffHours || staffHours.isClosed) return { availableSlots: [] };

//     const openTime = new Date(`${date}T${staffHours.openTime}`);
//     const closeTime = new Date(`${date}T${staffHours.closeTime}`);

//     const blockHours = await BlockHour.find({ entityId: staffId, entityType: 'Staff', day });
//     const existingBookings = await Booking.find({
//       staffId,
//       startTime: { $gte: openTime, $lt: closeTime },
//     });

//     const availableSlots = [];
//     let slotStart = new Date(openTime);

//     while (slotStart < closeTime) {
//       const slotEnd = new Date(slotStart);
//       slotEnd.setMinutes(slotStart.getMinutes() + 30);

//       const isBlocked = blockHours.some(bh =>
//         slotStart.toISOString().slice(11, 16) >= bh.startTime &&
//         slotStart.toISOString().slice(11, 16) < bh.endTime
//       );
//       const isBooked = existingBookings.some(b =>
//         slotStart >= b.startTime && slotEnd <= b.endTime
//       );

//       if (!isBlocked && !isBooked) {
//         availableSlots.push(slotStart.toISOString().slice(11, 16));
//       }
//       slotStart = slotEnd;
//     }

//     return { availableSlots };
//   };

//
// calculate service minutes ----------------------
// const calculateTotalServiceTime = async (serviceIds) => {
//     const services = await Service.find({ _id: { $in: serviceIds } });
//     return services.reduce((total, service) => total + service.duration, 0);
//   };

// get avaialbe slot-----------------
// const getAvailableTimeSlots = async (staffId, date, serviceIds) => {
//     const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

//     // Calculate total time needed based on selected services
//     const totalDuration = await calculateTotalServiceTime(serviceIds);

//     // Retrieve business hours for the selected day
//     const staffHours = await BusinessHour.findOne({ entityId: staffId, entityType: 'Staff', day });
//     if (!staffHours || staffHours.isClosed) return { availableSlots: [] };

//     const openTime = new Date(`${date}T${staffHours.openTime}`);
//     const closeTime = new Date(`${date}T${staffHours.closeTime}`);

//     // Retrieve block hours and existing bookings for the day
//     const blockHours = await BlockHour.find({ entityId: staffId, entityType: 'Staff', day });
//     const existingBookings = await Booking.find({
//       staffId,
//       startTime: { $gte: openTime, $lt: closeTime },
//     });

//     const availableSlots = [];
//     let slotStart = new Date(openTime);

//     while (slotStart < closeTime) {
//       const slotEnd = new Date(slotStart);
//       slotEnd.setMinutes(slotStart.getMinutes() + totalDuration);

//       // Ensure the slot end time does not exceed business hours
//       if (slotEnd > closeTime) break;

//       // Check if the slot conflicts with block hours
//       const isBlocked = blockHours.some(bh =>
//         (slotStart.toISOString().slice(11, 16) >= bh.startTime && slotStart.toISOString().slice(11, 16) < bh.endTime) ||
//         (slotEnd.toISOString().slice(11, 16) > bh.startTime && slotEnd.toISOString().slice(11, 16) <= bh.endTime)
//       );

//       // Check if the slot conflicts with existing bookings
//       const isBooked = existingBookings.some(b =>
//         (slotStart < b.endTime && slotEnd > b.startTime)
//       );

//       // Add slot with `isBooked` flag
//       availableSlots.push({
//         time: slotStart.toISOString().slice(11, 16),
//         isBooked: isBlocked || isBooked,
//       });

//       // Move to the next 30-minute slot
//       slotStart.setMinutes(slotStart.getMinutes() + 30);
//     }

//     return { availableSlots };
//   };

/// booking-------------------------
// app.post('/bookings', async (req, res) => {
//     const { customerId, staffId, serviceIds, date, startTime } = req.body;

//     // Calculate the total time for selected services
//     const totalDuration = await calculateTotalServiceTime(serviceIds);

//     const start = new Date(`${date}T${startTime}`);
//     const end = new Date(start);
//     end.setMinutes(start.getMinutes() + totalDuration);

//     // Verify that the slot is still available
//     const availableSlots = await getAvailableTimeSlots(staffId, date, serviceIds);
//     const selectedSlot = availableSlots.find(slot => slot.time === start.toISOString().slice(11, 16));

//     if (!selectedSlot || selectedSlot.isBooked) {
//       return res.status(400).json({ error: 'Selected time slot is no longer available' });
//     }

//     // Create the booking
//     const newBooking = new Booking({
//       customerId,
//       staffId,
//       serviceIds,
//       startTime: start,
//       endTime: end,
//       status: 'booked'
//     });
//     await newBooking.save();

//     res.status(201).json({ message: 'Booking successful', booking: newBooking });
//   });
