import Booking from '../booking/booking.model';
import Client from '../client/client.model';
import Customer from '../customer/customer.model';
import Service from '../service/service.model';

const getDashboardMetaData = async () => {
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

const getMonthlySalesAndProfitByYear = async (year: number) => {
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
            { $multiply: ['$totalPrice', 0.1] }, // 10% profit for pay-on-shop
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
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Fill in missing months with default values
  const fullYearData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const monthData = data.find((d) => d._id.month === monthIndex) || {
      totalSales: 0,
      totalProfit: 0,
    };
    return {
      month: monthNames[i],
      totalSales: monthData.totalSales,
      totalProfit: monthData.totalProfit,
    };
  });

  // Calculate total sales for the entire year
  const totalYearlySales = fullYearData.reduce(
    (sum, monthData) => sum + monthData.totalSales,
    0,
  );

  return {
    success: true,
    message: `Sales chart data retrieved successfully for ${year}`,
    data: fullYearData,
    totalSales: totalYearlySales,
  };
};

const metaServices = {
  getDashboardMetaData,
  getMonthlySalesAndProfitByYear,
};

export default metaServices;
