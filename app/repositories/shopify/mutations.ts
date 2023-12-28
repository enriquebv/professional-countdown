import { METAOBJECT_KEY } from "./constants";

export const MUTATION_CREATE_METAOBJECT_CONFIG = `
  mutation {
    metaobjectDefinitionCreate(definition: {
      name: "Testimonial2"
      type: "${METAOBJECT_KEY}"
      access: {
        admin: PUBLIC_READ_WRITE
      }
      fieldDefinitions: [
        {
          key: "author"
          name: "Author"
          type: "single_line_text_field"
        },
        {
          key: "body"
          name: "Body"
          type: "multi_line_text_field"
        }
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

export const MUTATION_DELETE_METAOBJECT_CONFIG = `
  mutation($id: ID!) {
    metaobjectDefinitionDelete(id: $id) {
      deletedId
    }
  }`;
