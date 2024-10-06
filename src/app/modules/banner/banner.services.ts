import { IShopBanner } from './banner.interface';
import { ShopBanner } from './banner.model';

// shop banner ------------------------
const createShopBannerIntoDB = async (shopId: string, payload: IShopBanner) => {
  const result = await ShopBanner.create({ ...payload, shop: shopId });
  return result;
};

const getMyShopBanner = async (shopId: string) => {
  const result = await ShopBanner.find({ shop: shopId });
  return result;
};

const deleteMyShopBanner = async (shopId: string, bannerId: string) => {
  const result = await ShopBanner.findOneAndDelete({
    shop: shopId,
    _id: bannerId,
  });

  return result;
};

const bannerServices = {
  createShopBannerIntoDB,
  getMyShopBanner,
  deleteMyShopBanner,
};

export default bannerServices;
