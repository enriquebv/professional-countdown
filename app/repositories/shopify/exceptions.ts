type ShopifyRepositoryErrorCodes = "user-errors-found" | "missing-metaobject";

class ShopifyRepositoryError extends Error {
  constructor(
    private code: ShopifyRepositoryErrorCodes,
    private query: string,
    private variables: any = null,
    private response: any = null,
  ) {
    super("Error in Shopify API repository.");
  }
}

export class UserErrorsFoundError extends ShopifyRepositoryError {
  constructor(query: string, variables: any, response: any) {
    super("user-errors-found", query, variables, response);
  }
}

export class MissingMetaobjectError extends ShopifyRepositoryError {
  constructor(query: string, variables: any, response: any) {
    super("missing-metaobject", query, variables, response);
  }
}
