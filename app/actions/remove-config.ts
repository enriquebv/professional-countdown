import type ShopifyRepository from "~/repositories/shopify";

export default async function removeConfig(
  shopifyRepository: ShopifyRepository,
) {
  return await shopifyRepository.removeConfig();
}
