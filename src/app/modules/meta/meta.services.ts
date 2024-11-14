import Customer from '../customer/customer.model';
import Order from '../order/order.model';
import Service from '../service/service.model';

// get dashboard meta data
const getDashboardMetaData = async () => {
  const totalSales = 1000;
  const profitOnSales = 400;
  const totalService = await Service.countDocuments();
  const totalProduct = 1000;
  const totalCustomer = await Customer.countDocuments();

  return {
    totalSales,
    profitOnSales,
    totalService,
    totalProduct,
    totalCustomer,
  };
};

const getAreaChartDataForIncomeFromDB = async (year: number) => {
  // Create date objects for the start and end of the year
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  // TODO: right now use oder info for income , in future convert to transaction
  const incomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group by month
        totalIncome: { $sum: '$totalPrice' }, // Sum the paid amounts
      },
    },
    {
      $sort: { _id: 1 }, // Sort by month
    },
  ]);

  console.log('Aggregated Income Data:', incomeData); // Log the aggregated data

  // Create an array for all months with default income of 0
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }), // Month names
    totalIncome: 0,
  }));

  // Map the aggregated data to the corresponding months
  incomeData.forEach((data) => {
    const monthIndex = data._id - 1; // Convert month (1-12) to index (0-11)
    if (months[monthIndex]) {
      months[monthIndex].totalIncome = data.totalIncome;
    }
  });

  // Calculate Yearly Growth
  const previousYearIncomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year - 1}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: '$totalPrice' },
      },
    },
  ]);

  const currentYearTotalIncome = months.reduce(
    (acc, month) => acc + month.totalIncome,
    0,
  );
  const previousYearTotalIncome = previousYearIncomeData[0]
    ? previousYearIncomeData[0].totalIncome
    : 0;

  const yearlyGrowth =
    previousYearTotalIncome > 0
      ? ((currentYearTotalIncome - previousYearTotalIncome) /
          previousYearTotalIncome) *
        100
      : currentYearTotalIncome > 0
        ? 100 // If previous year was 0 and current year is > 0
        : 0;

  // Calculate Monthly Growth Percentages
  const currentMonthIndex = new Date().getMonth(); // Current month index (0-11)
  const previousMonthIndex =
    currentMonthIndex === 0 ? 11 : currentMonthIndex - 1; // Previous month index
  const previousMonthIncome = months[previousMonthIndex].totalIncome;

  const monthlyGrowth =
    previousMonthIncome > 0
      ? ((months[currentMonthIndex].totalIncome - previousMonthIncome) /
          previousMonthIncome) *
        100
      : months[currentMonthIndex].totalIncome > 0
        ? 100 // If previous month was 0 and current month is > 0
        : 0;

  // Calculate Daily Growth
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(today.setDate(today.getDate() - 1));

  const dailyIncomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: yesterdayStart,
          $lt: new Date(yesterdayStart.setHours(24)), // Next day at midnight
        },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: '$totalPrice' },
      },
    },
  ]);

  const todayIncomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: todayStart,
          $lt: new Date(todayStart.setHours(24)), // Next day at midnight
        },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: '$totalPrice' },
      },
    },
  ]);

  const yesterdayIncome = dailyIncomeData[0]
    ? dailyIncomeData[0].totalIncome
    : 0;
  const todayIncome = todayIncomeData[0] ? todayIncomeData[0].totalIncome : 0;

  const dailyGrowth =
    yesterdayIncome > 0
      ? ((todayIncome - yesterdayIncome) / yesterdayIncome) * 100
      : todayIncome > 0
        ? 100 // If yesterday was 0 and today is > 0
        : 0;

  // Return the detailed monthly data along with growth percentages
  return {
    chartData: months, // Keep the monthly income data
    yearlyGrowth: yearlyGrowth.toFixed(2) + '%', // Yearly growth percentage
    monthlyGrowth: monthlyGrowth.toFixed(2) + '%', // Monthly growth percentage
    dailyGrowth: dailyGrowth.toFixed(2) + '%', // Daily growth percentage
  };
};
const getAreaChartDataForSalesFromDB = async (
  AdminId: string,
  year: number,
) => {
  // Create date objects for the start and end of the year
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  // TODO: right now use oder info for income , in future convert to transaction
  const incomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
        shop: AdminId,
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group by month
        totalSales: { $sum: '$subTotal' }, // Sum the paid amounts
      },
    },
    {
      $sort: { _id: 1 }, // Sort by month
    },
  ]);

  console.log('Aggregated Income Data:', incomeData); // Log the aggregated data

  // Create an array for all months with default income of 0
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }), // Month names
    totalIncome: 0,
  }));

  // Map the aggregated data to the corresponding months
  incomeData.forEach((data) => {
    const monthIndex = data._id - 1; // Convert month (1-12) to index (0-11)
    if (months[monthIndex]) {
      months[monthIndex].totalIncome = data.totalIncome;
    }
  });

  // Calculate Yearly Growth
  const previousYearIncomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year - 1}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year}-01-01T00:00:00.000Z`),
        },
        shop: AdminId,
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$subTotal' }, // Sum the paid amounts
      },
    },
  ]);

  const currentYearTotalIncome = months.reduce(
    (acc, month) => acc + month.totalIncome,
    0,
  );
  const previousYearTotalIncome = previousYearIncomeData[0]
    ? previousYearIncomeData[0].totalIncome
    : 0;

  const yearlyGrowth =
    previousYearTotalIncome > 0
      ? ((currentYearTotalIncome - previousYearTotalIncome) /
          previousYearTotalIncome) *
        100
      : currentYearTotalIncome > 0
        ? 100 // If previous year was 0 and current year is > 0
        : 0;

  // Calculate Monthly Growth Percentages
  const currentMonthIndex = new Date().getMonth(); // Current month index (0-11)
  const previousMonthIndex =
    currentMonthIndex === 0 ? 11 : currentMonthIndex - 1; // Previous month index
  const previousMonthIncome = months[previousMonthIndex].totalIncome;

  const monthlyGrowth =
    previousMonthIncome > 0
      ? ((months[currentMonthIndex].totalIncome - previousMonthIncome) /
          previousMonthIncome) *
        100
      : months[currentMonthIndex].totalIncome > 0
        ? 100 // If previous month was 0 and current month is > 0
        : 0;

  // Calculate Daily Growth
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(today.setDate(today.getDate() - 1));

  const dailyIncomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: yesterdayStart,
          $lt: new Date(yesterdayStart.setHours(24)), // Next day at midnight
        },
        shop: AdminId,
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$subTotal' }, // Sum the paid amounts
      },
    },
  ]);

  const todayIncomeData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: todayStart,
          $lt: new Date(todayStart.setHours(24)), // Next day at midnight
        },
        shop: AdminId,
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$subTotal' }, // Sum the paid amounts
      },
    },
  ]);

  const yesterdayIncome = dailyIncomeData[0]
    ? dailyIncomeData[0].totalIncome
    : 0;
  const todayIncome = todayIncomeData[0] ? todayIncomeData[0].totalIncome : 0;

  const dailyGrowth =
    yesterdayIncome > 0
      ? ((todayIncome - yesterdayIncome) / yesterdayIncome) * 100
      : todayIncome > 0
        ? 100 // If yesterday was 0 and today is > 0
        : 0;

  // Return the detailed monthly data along with growth percentages
  return {
    chartData: months, // Keep the monthly income data
    yearlyGrowth: yearlyGrowth.toFixed(2) + '%', // Yearly growth percentage
    monthlyGrowth: monthlyGrowth.toFixed(2) + '%', // Monthly growth percentage
    dailyGrowth: dailyGrowth.toFixed(2) + '%', // Daily growth percentage
  };
};

const metaServices = {
  getDashboardMetaData,
  getAreaChartDataForIncomeFromDB,
  getAreaChartDataForSalesFromDB,
};

export default metaServices;
