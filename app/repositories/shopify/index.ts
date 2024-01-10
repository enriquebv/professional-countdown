import type { RestResources } from "@shopify/shopify-api/rest/admin/2023-10";
import type { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/build/ts/server/clients";
import { QUERY_METAOBJECT_CONFIG, QUERY_SHOP_TIMEZONE } from "./queries";
import {
  MUTATION_CREATE_METAOBJECT,
  MUTATION_CREATE_METAOBJECT_DEFINITION,
  MUTATION_DELETE_METAOBJECT_CONFIG,
} from "./mutations";
import { Logger } from "~/lib/logger";
import { UserErrorsFoundError } from "./exceptions";
import { type CountdownConfigWithId } from "~/lib/types";
import { CURRENT_METAOBJECT_VERSION, METAOBJECT_TYPE } from "./constants";

export default class ShopifyRepository {
  admin: AdminApiContext<RestResources>;

  constructor(admin: AdminApiContext<RestResources>) {
    this.admin = admin;
  }

  private async fetchGraphql(query: string, variables = {}) {
    try {
      const response = await this.admin.graphql(query, { variables });
      const json = await response.json();

      const hasUserErrors = Object.keys(json.data).some(
        (key) => (json.data[key]?.userErrors ?? []).length !== 0,
      );

      if (hasUserErrors) {
        throw new UserErrorsFoundError(query, variables, json);
      }

      return json;
    } catch (error) {
      await Logger.error("Error fetching shopify graphql API", { error });

      throw error;
    }
  }

  async createAppMetaobject() {
    const response = await this.fetchGraphql(
      MUTATION_CREATE_METAOBJECT_DEFINITION,
    );

    return response;
  }

  async saveCountdownConfig(config: CountdownConfigWithId) {
    await this.fetchGraphql(MUTATION_CREATE_METAOBJECT, {
      metaobject: {
        fields: [
          {
            key: "config-id",
            value: config.id,
          },
          {
            key: "version",
            value: CURRENT_METAOBJECT_VERSION,
          },
          {
            key: "config",
            value: JSON.stringify(config),
          },
        ],
        handle: `countdown-${config.id}`,
        type: METAOBJECT_TYPE,
      },
    });
  }

  async readConfig() {
    const response = await this.fetchGraphql(QUERY_METAOBJECT_CONFIG);

    return response;
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
