import type { CountdownConfig, CountdownConfigWithId } from "~/lib/types";
import type { DatabaseRepository } from "~/repositories/db";
import type ShopifyRepository from "~/repositories/shopify";

export default async function createCountdownConfig(
  config: CountdownConfig,
  databaseRepository: DatabaseRepository,
  shopifyRepository: ShopifyRepository,
): Promise<CountdownConfigWithId> {
  const storedConfig = await databaseRepository.saveCountdownConfig(config);
  await shopifyRepository.saveCountdownConfig(storedConfig);

  return storedConfig;
}
