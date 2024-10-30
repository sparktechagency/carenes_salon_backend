import Staff from "../staff/staff.model";
import BusinessHour from "./businessHour.model";

const getAvailableDates = async (staffId: string) => {
    const today = new Date();
    const nextFiveDays = [];
  
    const staff = await Staff.findById(staffId);
    if (!staff) throw new Error('Staff not found');
  
    const shopHours = await BusinessHour.find({ entityId: staff.shop, entityType: 'Shop' });
    const staffHours = await BusinessHour.find({ entityId: staffId, entityType: 'Staff' });
  
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  
      const shopDayHours = shopHours.find(hour => hour.day === day);
      const staffDayHours = staffHours.find(hour => hour.day === day);
  
      if (shopDayHours && staffDayHours && !shopDayHours.isClosed && !staffDayHours.isClosed) {
        nextFiveDays.push({
          date: date.toISOString().split('T')[0],
          day,  // Add the day of the week here
          isAvailable: true,
          openTime: staffDayHours.openTime,
          closeTime: staffDayHours.closeTime,
        });
      } else {
        nextFiveDays.push({
          date: date.toISOString().split('T')[0],
          day,  // Add the day of the week here
          isAvailable: false,
        });
      }
    }
    return nextFiveDays;
  };
  




const BusinessHourServices = {
    getAvailableDates
}

export default BusinessHourServices;