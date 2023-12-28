import { METAOBJECT_KEY } from "./constants";

export const QUERY_METAOBJECT_CONFIG = `
  {
    metaobjectDefinitionByType(type:"${METAOBJECT_KEY}") {
      id
    }
  }`;

export const QUERY_SHOP_TIMEZONE = `
  {
    shop {
      timezoneOffset
    }
  }`;
