import type { CountdownConfigWithId } from "~/lib/types";
import type { DatabaseRepository } from "~/repositories/db";
import type ShopifyRepository from "~/repositories/shopify";

export default async function deleteCountdownConfig(
  config: CountdownConfigWithId,
  databaseRepository: DatabaseRepository,
  shopifyRepository: ShopifyRepository,
): Promise<void> {
  await databaseRepository.removeCountdownConfig(config);
  await shopifyRepository.removeCountdownMetaobject(config);
}
