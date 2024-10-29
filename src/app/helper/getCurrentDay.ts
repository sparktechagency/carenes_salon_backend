const getCurrentDay = () => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date(); // Get the current date
    const dayIndex = today.getDay(); // Get the day index (0 for Sunday, 1 for Monday, etc.)
    return daysOfWeek[dayIndex]; // Return the name of the current day
  };

export default getCurrentDay;