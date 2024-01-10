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
