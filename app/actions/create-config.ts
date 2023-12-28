import type ShopifyRepository from "~/repositories/shopify";

export default async function createConfig(
  shopifyRepository: ShopifyRepository,
) {
  return await shopifyRepository.createConfig();
}
