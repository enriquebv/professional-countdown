import type ShopifyRepository from "~/repositories/shopify";

export default async function createConfig(
  shopifyRepository: ShopifyRepository,
) {
  await shopifyRepository.createAppMetaobject();
}
