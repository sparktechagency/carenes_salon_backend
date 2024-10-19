import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import metaServices from './meta.services';

const getAminDashboardMetaData = catchAsync(async (req, res) => {
  const result = await metaServices.getAdminDashboardMetaDataFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard meta data successfully retrieved',
    data: result,
  });
});
const getVendorDashboardMetaData = catchAsync(async (req, res) => {
  const result = await metaServices.getVendorDashboardMetaData(
    req?.user?.profileId,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard meta data successfully retrieved',
    data: result,
  });
});
const getShopChartData = catchAsync(async (req, res) => {
  const result = await metaServices.getShopChartDataFromDB(
    Number(req?.query?.year),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Shop chart data retrieved successfully',
    data: result,
  });
});
const getAreaChartDataForIncome = catchAsync(async (req, res) => {
  const result = await metaServices.getAreaChartDataForIncomeFromDB(
    Number(req?.query?.year),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Income chart data retrieved successfully',
    data: result,
  });
});
const getAreaChartDataForSales = catchAsync(async (req, res) => {
  const result = await metaServices.getAreaChartDataForSalesFromDB(
    req?.user?.profileId,
    Number(req?.query?.year),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sales chart data retrieved successfully',
    data: result,
  });
});

const metaController = {
  getAminDashboardMetaData,
  getVendorDashboardMetaData,
  getShopChartData,
  getAreaChartDataForIncome,
  getAreaChartDataForSales,
};

export default metaController;
