import { METAOBJECT_TYPE } from "./constants";

export const QUERY_METAOBJECT_CONFIG = `
  {
    metaobjectDefinitionByType(type:"${METAOBJECT_TYPE}") {
      id
    }
  }`;

export const QUERY_SHOP_TIMEZONE = `
  {
    shop {
      timezoneOffset
    }
  }`;
