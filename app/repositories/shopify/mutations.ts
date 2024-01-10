import { COUNTDOWNS_METAOBJECT_TYPE } from "./constants";

// Docs: https://shopify.dev/docs/api/admin-graphql/2023-10/mutations/metaobjectDefinitionCreate
export const MUTATION_CREATE_METAOBJECT_DEFINITION = `
  mutation {
    metaobjectDefinitionCreate(definition: {
      name: "Shopify Countdown Configs"
      type: "${COUNTDOWNS_METAOBJECT_TYPE}"
      access: {
        admin: PUBLIC_READ_WRITE
      }
      fieldDefinitions: [
        {
          key: "config-id"
          name: "ID"
          type: "single_line_text_field"
        },
        {
          key: "version"
          name: "Config Version"
          type: "single_line_text_field"
        },
        {
          key: "config",
          name: "Config",
          type: "json"
        },
      ]
    }) {
      metaobjectDefinition {
        id
      }
      userErrors {
        message
      }
    }
  }`;

// Docs: https://shopify.dev/docs/api/admin-graphql/2023-10/mutations/metaobjectCreate
export const MUTATION_CREATE_METAOBJECT = `
  mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject {
        id
        handle
      }
      userErrors {
        field
        message
        code
      }
    }
  }`;

export const MUTATION_DELETE_METAOBJECT_CONFIG = `
  mutation($id: ID!) {
    metaobjectDefinitionDelete(id: $id) {
      deletedId
    }
  }`;
