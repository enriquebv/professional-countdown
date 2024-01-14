import { COUNTDOWNS_METAOBJECT_TYPE } from "./constants";

export const QUERY_METAOBJECT_CONFIG = `
  {
    metaobjectDefinitionByType(type:"${COUNTDOWNS_METAOBJECT_TYPE}") {
      id
    }
  }`;

export const QUERY_SHOP_TIMEZONE = `
  {
    shop {
      timezoneOffset
    }
  }`;

// Docs: https://shopify.dev/docs/api/admin-graphql/2023-10/queries/metaobjectByHandle
export const QUERY_METAOBJECT_BY_HANDLE = `
  query GetMetaobjectByHandle($handle: String!, $type: String!) {
    metaobjectByHandle(handle: { handle: $handle, type: $type }) {
      id
    }  
  }
`;
