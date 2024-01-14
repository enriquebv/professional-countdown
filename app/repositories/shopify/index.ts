import type { RestResources } from "@shopify/shopify-api/rest/admin/2023-10";
import type { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/build/ts/server/clients";
import {
  QUERY_METAOBJECT_BY_HANDLE,
  QUERY_METAOBJECT_CONFIG,
  QUERY_SHOP_TIMEZONE,
} from "./queries";
import {
  MUTATION_CREATE_METAOBJECT,
  MUTATION_CREATE_METAOBJECT_DEFINITION,
  MUTATION_DELETE_METAOBJECT_CONFIG,
  MUTATION_UPDATE_METAOBJECT,
} from "./mutations";
import { Logger } from "~/lib/logger";
import { MissingMetaobjectError, UserErrorsFoundError } from "./exceptions";
import { type CountdownConfigWithId } from "~/lib/types";
import {
  CURRENT_COUNTDOWNS_METAOBJECT_VERSION,
  COUNTDOWNS_METAOBJECT_TYPE,
} from "./constants";

export default class ShopifyRepository {
  admin: AdminApiContext<RestResources>;

  constructor(admin: AdminApiContext<RestResources>) {
    this.admin = admin;
  }

  private async fetchGraphql<ReturnType = any>(
    query: string,
    variables = {},
    avoidMetaobjectDefinitionCreation = false,
  ): Promise<ReturnType> {
    try {
      const response = await this.admin.graphql(query, { variables });
      const json = await response.json();

      const hasUserErrors = Object.keys(json.data).some(
        (key) => (json.data[key]?.userErrors ?? []).length !== 0,
      );
      const isMissingMetaobjectDefinition =
        hasUserErrors &&
        Object.values(json.data)
          .filter((data: any) => data.userErrors)
          .flatMap((data: any) =>
            data.userErrors.map((error: { code: string }) => error.code),
          )
          .includes("UNDEFINED_OBJECT_TYPE");

      // Note: if the metaobject definition is missing, we create it and try again.
      if (
        isMissingMetaobjectDefinition &&
        avoidMetaobjectDefinitionCreation === false
      ) {
        await this.createAppMetaobject();
        return await this.fetchGraphql(query, variables, true);
      }

      if (hasUserErrors) {
        Object.keys(json.data).forEach((key) => {
          const errors = json.data[key].userErrors ?? [];
          console.group("[ShopifyRepository] GraphQL user error");

          errors.forEach((error: { message: string; code: string }) => {
            console.error(`- ${error.message} (${error.code})`);
          });

          console.groupEnd();
        });

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

  async getCountdownMetaobjectByHandle(
    handle: string,
  ): Promise<{ id: string }> {
    const variables = { handle, type: COUNTDOWNS_METAOBJECT_TYPE };
    const response = await this.fetchGraphql(
      QUERY_METAOBJECT_BY_HANDLE,
      variables,
    );

    if (response.data.metaobjectByHandle === null) {
      throw new MissingMetaobjectError(
        QUERY_METAOBJECT_BY_HANDLE,
        variables,
        response,
      );
    }

    return response.data.metaobjectByHandle;
  }

  async saveCountdownConfig(config: CountdownConfigWithId) {
    const handle = ShopifyRepository.createCountdownMetaobjectHandle(config.id);
    const fields = [
      {
        key: "config-id",
        value: config.id,
      },
      {
        key: "version",
        value: CURRENT_COUNTDOWNS_METAOBJECT_VERSION,
      },
      {
        key: "config",
        value: JSON.stringify(config),
      },
    ];

    try {
      const { id } = await this.getCountdownMetaobjectByHandle(handle);
      const variables = {
        id,
        metaobject: {
          fields,
        },
      };

      await this.fetchGraphql(MUTATION_UPDATE_METAOBJECT, variables);
    } catch (error) {
      // Note: If missing metaobject, create it
      if (error instanceof MissingMetaobjectError) {
        const variables = {
          metaobject: {
            fields,
            handle: `countdown-${config.id}`,
            type: COUNTDOWNS_METAOBJECT_TYPE,
          },
        };
        await this.fetchGraphql(MUTATION_CREATE_METAOBJECT, variables);

        return;
      }

      throw error;
    }
  }

  async removeCountdownMetaobject(
    config: CountdownConfigWithId,
  ): Promise<void> {
    try {
      const handle = ShopifyRepository.createCountdownMetaobjectHandle(
        config.id,
      );
      const storedMetaobject =
        await this.getCountdownMetaobjectByHandle(handle);

      console.log("📦", storedMetaobject);

      const variables = {
        id: storedMetaobject.id,
      };

      await this.fetchGraphql(MUTATION_DELETE_METAOBJECT_CONFIG, variables);
    } catch (error) {
      if (error instanceof MissingMetaobjectError) {
        return;
      }

      throw error;
    }
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

  static createCountdownMetaobjectHandle(id: string) {
    return `countdown-${id}`;
  }
}
