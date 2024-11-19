import Booking from '../booking/booking.model';
import Client from '../client/client.model';
import Customer from '../customer/customer.model';
import Order from '../order/order.model';
import Service from '../service/service.model';

// get dashboard meta data
// const getDashboardMetaData = async () => {
//   const totalSales = 1000;
//   const profitOnSales = 400;
//   const totalService = await Service.countDocuments();
//   const totalProduct = 1000;
//   const totalCustomer = await Customer.countDocuments();

//   return {
//     totalSales,
//     profitOnSales,
//     totalService,
//     totalProduct,
//     totalCustomer,
//   };
// };

const getDashboardMetaData = async () => {
  // const totalSales = 1000;
  // const profitOnSales = 400;
  const totalService = await Service.countDocuments();
  const totalCustomer = await Customer.countDocuments();
  const totalClient = await Client.countDocuments();

  const currentMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const lastMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1,
  );

  // Customer -----------
  const currentMonthCustomerCount = await Customer.countDocuments({
    createdAt: {
      $gte: currentMonthStart,
      $lt: new Date(),
    },
  });
  const lastMonthCustomerCount = await Customer.countDocuments({
    createdAt: {
      $gte: lastMonthStart,
      $lt: currentMonthStart,
    },
  });

  const customerChangeType =
    currentMonthCustomerCount > lastMonthCustomerCount
      ? 'increase'
      : 'decrease';
  const customerChangePercentage =
    lastMonthCustomerCount > 0
      ? Math.abs(
          ((currentMonthCustomerCount - lastMonthCustomerCount) /
            lastMonthCustomerCount) *
            100,
        )
      : 0;

  // client --------------------
  const currentMonthClientCount = await Client.countDocuments({
    createdAt: {
      $gte: currentMonthStart,
      $lt: new Date(),
    },
  });
  const lastMonthClientCount = await Client.countDocuments({
    createdAt: {
      $gte: lastMonthStart,
      $lt: currentMonthStart,
    },
  });

  const clientChangeType =
    currentMonthClientCount > lastMonthClientCount ? 'increase' : 'decrease';
  const clientChangePercentage =
    lastMonthClientCount > 0
      ? Math.abs(
          ((currentMonthClientCount - lastMonthClientCount) /
            lastMonthClientCount) *
            100,
        )
      : 0;

  // service -------------

  const currentMonthServiceCount = await Service.countDocuments({
    createdAt: {
      $gte: currentMonthStart,
      $lt: new Date(),
    },
  });
  const lastMonthServiceCount = await Service.countDocuments({
    createdAt: {
      $gte: lastMonthStart,
      $lt: currentMonthStart,
    },
  });

  const serviceChangeType =
    currentMonthServiceCount > lastMonthServiceCount ? 'increase' : 'decrease';
  const serviceChangePercentage =
    lastMonthServiceCount > 0
      ? Math.abs(
          ((currentMonthServiceCount - lastMonthServiceCount) /
            lastMonthServiceCount) *
            100,
        )
      : 0;

  const result = await calculateSalesAndProfit();

  // total sales -------------
  const totalSalesChangeType =
    result.currentMonth.totalSales > result.previousMonth.totalSales
      ? 'increase'
      : 'decrease';
  const totalSalesChangePercentage =
    result.previousMonth.totalSales > 0
      ? Math.abs(
          ((result.currentMonth.totalSales - result.previousMonth.totalSales) /
            result.previousMonth.totalSales) *
            100,
        )
      : 0;

  // total profit-----------------------
  const totalProfitChangeType =
    result.currentMonth.totalSales > result.previousMonth.totalSales
      ? 'increase'
      : 'decrease';
  const totalProfitChangePercentage =
    result.previousMonth.totalSales > 0
      ? Math.abs(
          ((result.currentMonth.totalProfit -
            result.previousMonth.totalProfit) /
            result.previousMonth.totalProfit) *
            100,
        )
      : 0;

  return {
    totalSales: result.overall.totalSales,
    totalProfit: result.overall.totalProfit,
    totalService,
    totalCustomer,
    totalClient,
    customerChangeType,
    customerChangePercentage: customerChangePercentage.toFixed(2),
    clientChangeType,
    clientChangePercentage: clientChangePercentage.toFixed(2),
    serviceChangeType,
    serviceChangePercentage: serviceChangePercentage.toFixed(2),
    totalSalesChangeType,
    totalSalesChangePercentage: totalSalesChangePercentage.toFixed(2),
    totalProfitChangeType,
    totalProfitChangePercentage: totalProfitChangePercentage.toFixed(2),
  };
};

// const calculateSalesAndProfit = async () => {
//   const bookings = await Booking.aggregate([
//     {
//       $match: {
//         paymentStatus: { $in: ['success', 'pay-on-shop'] },
//       },
//     },
//     {
//       $project: {
//         totalPrice: 1,
//         bookingPaymentType: 1,
//         profit: {
//           $cond: [
//             { $eq: ['$bookingPaymentType', 'online'] },
//             { $multiply: ['$totalPrice', 0.05] }, // 5% profit for online
//             // { $multiply: ["$totalPrice", 0.1] }, // 0.1 profit for pay-on-shop
//             0.1,
//           ],
//         },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalSales: { $sum: '$totalPrice' }, // Total sales from all bookings
//         totalProfit: { $sum: '$profit' }, // Total profit from calculated profits
//       },
//     },
//   ]);

//   if (!bookings.length) {
//     return {
//       totalSales: 0,
//       totalProfit: 0,
//     };
//   }

//   const { totalSales, totalProfit } = bookings[0];
//   return {
//     totalSales,
//     totalProfit,
//   };
// };
const calculateSalesAndProfit = async () => {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const previousMonthStart = new Date(currentMonthStart);
  previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);

  const previousMonthEnd = new Date(currentMonthStart);
  previousMonthEnd.setSeconds(-1);

  const bookings = await Booking.aggregate([
    {
      $match: {
        paymentStatus: { $in: ['success', 'pay-on-shop'] },
      },
    },
    {
      $project: {
        totalPrice: 1,
        bookingPaymentType: 1,
        createdAt: 1,
        profit: {
          $cond: [
            { $eq: ['$bookingPaymentType', 'online'] },
            { $multiply: ['$totalPrice', 0.05] }, // 5% profit for online
            // { $multiply: ['$totalPrice', 0.1] }, // 10% profit for pay-on-shop
            0.1,
          ],
        },
      },
    },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$totalPrice' }, // Overall total sales
              totalProfit: { $sum: '$profit' }, // Overall total profit
            },
          },
        ],
        currentMonth: [
          {
            $match: {
              createdAt: { $gte: currentMonthStart },
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$totalPrice' }, // Current month total sales
              totalProfit: { $sum: '$profit' }, // Current month total profit
            },
          },
        ],
        previousMonth: [
          {
            $match: {
              createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$totalPrice' }, // Previous month total sales
              totalProfit: { $sum: '$profit' }, // Previous month total profit
            },
          },
        ],
      },
    },
  ]);

  const overall = bookings[0].overall[0] || { totalSales: 0, totalProfit: 0 };
  const currentMonth = bookings[0].currentMonth[0] || {
    totalSales: 0,
    totalProfit: 0,
  };
  const previousMonth = bookings[0].previousMonth[0] || {
    totalSales: 0,
    totalProfit: 0,
  };

  return {
    overall: {
      totalSales: overall.totalSales,
      totalProfit: overall.totalProfit,
    },
    currentMonth: {
      totalSales: currentMonth.totalSales,
      totalProfit: currentMonth.totalProfit,
    },
    previousMonth: {
      totalSales: previousMonth.totalSales,
      totalProfit: previousMonth.totalProfit,
    },
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

const getMonthlySalesAndProfitByYear = async (year:number) => {
  // Calculate start and end dates for the given year
  const startDate = new Date(year, 0, 1); // January 1st of the given year
  const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st of the given year

  const data = await Booking.aggregate([
    {
      $match: {
        paymentStatus: { $in: ['success', 'pay-on-shop'] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $project: {
        month: { $month: '$createdAt' },
        totalPrice: 1,
        profit: {
          $cond: [
            { $eq: ['$bookingPaymentType', 'online'] },
            { $multiply: ['$totalPrice', 0.05] }, // 5% profit for online
            // { $multiply: ['$totalPrice', 0.1] }, // 10% profit for pay-on-shop
            0.1
          ],
        },
      },
    },
    {
      $group: {
        _id: { month: '$month' },
        totalSales: { $sum: '$totalPrice' },
        totalProfit: { $sum: '$profit' },
      },
    },
    {
      $sort: { '_id.month': 1 }, // Sort by month
    },
  ]);

  // Map month numbers to names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Fill in missing months with default values
  const fullYearData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1; // Months are 1-based in MongoDB
    const monthData = data.find(d => d._id.month === monthIndex) || { totalSales: 0, totalProfit: 0 };
    return {
      month: monthNames[i],
      totalSales: monthData.totalSales,
      totalProfit: monthData.totalProfit,
    };
  });

  return {
    success: true,
    message: `Sales chart data retrieved successfully for ${year}`,
    data: fullYearData,
  };
};

const metaServices = {
  getDashboardMetaData,
  getAreaChartDataForIncomeFromDB,
  getAreaChartDataForSalesFromDB,
  getMonthlySalesAndProfitByYear
};

export default metaServices;
