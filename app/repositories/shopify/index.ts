import type { RestResources } from "@shopify/shopify-api/rest/admin/2023-10";
import type { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/build/ts/server/clients";
import { QUERY_METAOBJECT_CONFIG, QUERY_SHOP_TIMEZONE } from "./queries";
import {
  MUTATION_CREATE_METAOBJECT_CONFIG,
  MUTATION_DELETE_METAOBJECT_CONFIG,
} from "./mutations";
import { Logger } from "~/lib/logger";

export default class ShopifyRepository {
  admin: AdminApiContext<RestResources>;

  constructor(admin: AdminApiContext<RestResources>) {
    this.admin = admin;
  }

  private async fetchGraphql(query: string, variables = {}) {
    try {
      const response = await this.admin.graphql(query, { variables });
      return await response.json();
    } catch (error) {
      await Logger.error("Error fetching shopify graphql API", { error });

      throw error;
    }
  }

  async createConfig() {
    const response = await this.admin.graphql(
      MUTATION_CREATE_METAOBJECT_CONFIG,
    );
    return await response.json();
  }

  async readConfig() {
    const response = await this.admin.graphql(QUERY_METAOBJECT_CONFIG);
    return await response.json();
  }

  async removeConfig() {
    const response = await this.fetchGraphql(QUERY_METAOBJECT_CONFIG);
    const id = response.data.metaobjectDefinitionByType.id;
    await this.fetchGraphql(MUTATION_DELETE_METAOBJECT_CONFIG, { id });
  }

  async getShopTimezone(): Promise<`${"+" | "-"}${number}`> {
    const response = await this.fetchGraphql(QUERY_SHOP_TIMEZONE);
    return response.data.shop.timezoneOffset;
  }
}
