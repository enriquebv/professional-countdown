import type ShopifyRepository from "~/repositories/shopify";

export default async function getConfig(shopifyRepository: ShopifyRepository) {
  return await shopifyRepository.readConfig();
}
