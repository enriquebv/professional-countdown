import type { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/build/ts/server/clients";
import type { RestResources } from "@shopify/shopify-api/rest/admin/2023-10";
import { DatabaseRepository } from "./repositories/db";
import ShopifyRepository from "./repositories/shopify";
import { authenticate } from "./shopify.server";

/**
 * Validate request and create context for the request.
 */
export default async function createContextByRequest(
  request: Request,
): Promise<{
  admin: AdminApiContext<RestResources>;
  databaseRepository: DatabaseRepository;
  shopifyRepository: ShopifyRepository;
}> {
  const { admin, session } = await authenticate.admin(request);

  return {
    admin,
    databaseRepository: new DatabaseRepository(session.shop),
    shopifyRepository: new ShopifyRepository(admin),
  };
}
