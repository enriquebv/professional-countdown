import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  List,
  Link,
  InlineStack,
  Bleed,
  ResourceList,
  ResourceItem,
  Badge,
  type ResourceListProps,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import ShopifyRepository from "~/repositories/shopify";
import setupApp from "~/actions/setup-app";
import createContextByRequest from "~/context.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { databaseRepository } = await createContextByRequest(request);
  const countdowns = await databaseRepository.listCountdownConfigs();

  return json({ countdowns });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const body = await request.json();

  switch (body.action) {
    case "create":
      await setupApp(new ShopifyRepository(admin));
      return json({ created: true });
    default:
      return json({}, { status: 400 });
  }
};

export default function Index() {
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();
  const [selectedCountdowns, setSelectedCountdowns] = useState<
    ResourceListProps["selectedItems"]
  >([]);
  // const nav = useNavigation();
  // const actionData = useActionData<typeof action>();
  // const submit = useSubmit();
  // const isLoading =
  //   ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  // const sendSubmit = () =>
  //   submit(
  //     { action: "create" },
  //     { replace: true, method: "POST", encType: "application/json" },
  //   );

  // const sendRemove = () =>
  //   submit(
  //     { action: "remove" },
  //     { replace: true, method: "POST", encType: "application/json" },
  //   );

  console.log(data);

  return (
    <Page
      title="Countdowns"
      primaryAction={
        <Button
          variant="primary"
          onClick={() => navigate("/app/countdown/create")}
        >
          Create countdown
        </Button>
      }
    >
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <Bleed marginBlock={"400"} marginInline={"400"}>
                <ResourceList
                  selectedItems={selectedCountdowns}
                  onSelectionChange={setSelectedCountdowns}
                  resourceName={{ singular: "countdown", plural: "countdowns" }}
                  items={data.countdowns}
                  promotedBulkActions={[
                    {
                      content:
                        selectedCountdowns?.length === 1
                          ? "Remove selected coundown"
                          : "Remove selected countdowns",
                      onAction: () => console.log("Todo: implement bulk edit"),
                    },
                  ]}
                  renderItem={(item) => {
                    const { id, name } = item;

                    return (
                      <ResourceItem
                        id={id}
                        url={`/app/countdown/${id}`}
                        accessibilityLabel={`View details for ${name}`}
                      >
                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                          {name}
                        </Text>
                        <Badge progress="incomplete">Disabled</Badge>
                        <Badge progress="partiallyComplete" tone="info">
                          Will start at date
                        </Badge>
                        <Badge progress="complete" tone="success">
                          Active until date
                        </Badge>
                      </ResourceItem>
                    );
                  }}
                />
              </Bleed>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    App template specs
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Framework
                      </Text>
                      <Link
                        url="https://remix.run"
                        target="_blank"
                        removeUnderline
                      >
                        Remix
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Database
                      </Text>
                      <Link
                        url="https://www.prisma.io/"
                        target="_blank"
                        removeUnderline
                      >
                        Prisma
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Interface
                      </Text>
                      <span>
                        <Link
                          url="https://polaris.shopify.com"
                          target="_blank"
                          removeUnderline
                        >
                          Polaris
                        </Link>
                        {", "}
                        <Link
                          url="https://shopify.dev/docs/apps/tools/app-bridge"
                          target="_blank"
                          removeUnderline
                        >
                          App Bridge
                        </Link>
                      </span>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        API
                      </Text>
                      <Link
                        url="https://shopify.dev/docs/api/admin-graphql"
                        target="_blank"
                        removeUnderline
                      >
                        GraphQL API
                      </Link>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Next steps
                  </Text>
                  <List>
                    <List.Item>
                      Build an{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/getting-started/build-app-example"
                        target="_blank"
                        removeUnderline
                      >
                        {" "}
                        example app
                      </Link>{" "}
                      to get started
                    </List.Item>
                    <List.Item>
                      Explore Shopify’s API with{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                        target="_blank"
                        removeUnderline
                      >
                        GraphiQL
                      </Link>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
