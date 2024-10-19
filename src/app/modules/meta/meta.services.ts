import { ENUM_ORDER_STATUS, ENUM_SHOP_TYPE } from '../../utilities/enum';
import Order from '../order/order.model';
import Vendor from '../vendor/vendor.model';

const getAdminDashboardMetaDataFromDB = async () => {
  //   const income = await Transaction.aggregate([
  //     {
  //       $match: { paymentStatus: ENUM_PAYMENT_STATUS.PAID },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         totalIncome: { $sum: '$paidAmount' },
  //       },
  //     },
  //   ]);
  //   const totalIncome = income?.length > 0 ? income[0].totalIncome : 0;

  const totalGrocery = await Vendor.countDocuments({
    shopType: ENUM_SHOP_TYPE.GROCERY,
    status: 'activate',
  });
  const totalRestaurant = await Vendor.countDocuments({
    shopType: ENUM_SHOP_TYPE.RESTAURANT,
    status: 'activate',
  });
  const totalOrder = await Order.countDocuments();
  const totalCompletedOrder = await Order.countDocuments({
    status: ENUM_ORDER_STATUS.COMPLETED,
  });
  return {
    // totalIncome,
    totalOrder,
    totalGrocery,
    totalRestaurant,
    totalCompletedOrder,
  };
};
const getVendorDashboardMetaData = async (profileId: string) => {
  //   const income = await Transaction.aggregate([
  //     {
  //       $match: { paymentStatus: ENUM_PAYMENT_STATUS.PAID },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         totalIncome: { $sum: '$paidAmount' },
  //       },
  //     },
  //   ]);
  //   const totalIncome = income?.length > 0 ? income[0].totalIncome : 0;
  const totalOrder = await Order.countDocuments({ shop: profileId });
  const totalPendingOrder = await Order.countDocuments({
    status: ENUM_ORDER_STATUS.PENDING,
    shop: profileId,
  });
  const totalCompletedOrder = await Order.countDocuments({
    status: ENUM_ORDER_STATUS.COMPLETED,
    shop: profileId,
  });
  return {
    // totalIncome,
    totalOrder,
    totalPendingOrder,
    totalCompletedOrder,
  };
};

const getShopChartDataFromDB = async (year: number) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);
  const prevStartDate = new Date(`${year - 1}-01-01T00:00:00.000Z`);
  const prevEndDate = new Date(`${year}-01-01T00:00:00.000Z`);

  // Aggregation for Restaurant and Grocery per month for the current year
  const shopData = await Vendor.aggregate([
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
        _id: {
          month: { $month: '$createdAt' }, // Group by month
          shopType: '$shopType', // Group by shop type
        },
        totalShops: { $sum: 1 }, // Count shops
      },
    },
    {
      $sort: { '_id.month': 1 }, // Sort by month
    },
  ]);

  // Prepare the month array with default values
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    totalRestaurant: 0,
    totalGrocery: 0,
  }));

  // Assign the shop counts to the respective month and shop type
  shopData.forEach((data) => {
    const monthIndex = data._id.month - 1;
    if (data._id.shopType === 'Restaurant') {
      months[monthIndex].totalRestaurant = data.totalShops;
    } else if (data._id.shopType === 'Grocery') {
      months[monthIndex].totalGrocery = data.totalShops;
    }
  });

  // Calculate Monthly Growth (combined for both shop types)
  const currentMonthIndex = new Date().getMonth(); // Current month index
  const previousMonthIndex =
    currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

  const previousMonthTotal =
    months[previousMonthIndex].totalRestaurant +
    months[previousMonthIndex].totalGrocery;
  const currentMonthTotal =
    months[currentMonthIndex].totalRestaurant +
    months[currentMonthIndex].totalGrocery;

  const monthlyGrowth =
    previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : currentMonthTotal > 0
        ? 100
        : 0;

  // Daily Growth
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(today.setDate(today.getDate() - 1));

  const todayVendorsData = await Vendor.aggregate([
    {
      $match: {
        createdAt: {
          $gte: todayStart,
          $lt: new Date(todayStart.setHours(24)),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
      },
    },
  ]);

  const yesterdayVendorsData = await Vendor.aggregate([
    {
      $match: {
        createdAt: {
          $gte: yesterdayStart,
          $lt: new Date(yesterdayStart.setHours(24)),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
      },
    },
  ]);

  const todayVendors = todayVendorsData[0]
    ? todayVendorsData[0].totalVendors
    : 0;
  const yesterdayVendors = yesterdayVendorsData[0]
    ? yesterdayVendorsData[0].totalVendors
    : 0;

  const dailyGrowth =
    yesterdayVendors > 0
      ? ((todayVendors - yesterdayVendors) / yesterdayVendors) * 100
      : todayVendors > 0
        ? 100
        : 0;

  // Yearly Aggregation (combined for both shop types)
  const prevYearData = await Vendor.aggregate([
    {
      $match: {
        createdAt: {
          $gte: prevStartDate,
          $lt: prevEndDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
      },
    },
  ]);

  const currentYearData = await Vendor.aggregate([
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
        _id: null,
        totalVendors: { $sum: 1 },
      },
    },
  ]);

  const prevYearVendors = prevYearData[0] ? prevYearData[0].totalVendors : 0;
  const currentYearVendors = currentYearData[0]
    ? currentYearData[0].totalVendors
    : 0;

  const yearlyGrowth =
    prevYearVendors > 0
      ? ((currentYearVendors - prevYearVendors) / prevYearVendors) * 100
      : currentYearVendors > 0
        ? 100
        : 0;

  // Return aggregated data
  return {
    success: true,
    message: 'Shop chart data retrieved successfully',
    data: {
      chartData: months,
      monthlyGrowth: monthlyGrowth.toFixed(2) + '%',
      dailyGrowth: dailyGrowth.toFixed(2) + '%',
      yearlyGrowth: yearlyGrowth.toFixed(2) + '%',
    },
  };
};

// get chart data income for super admin

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
  vendorId: string,
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
        shop: vendorId,
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
        shop: vendorId,
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
        shop: vendorId,
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
        shop: vendorId,
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
  getAdminDashboardMetaDataFromDB,
  getVendorDashboardMetaData,
  getShopChartDataFromDB,
  getAreaChartDataForIncomeFromDB,
  getAreaChartDataForSalesFromDB,
};

export default metaServices;
