import { useParams } from "@remix-run/react";
import {
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  TextField,
  Tabs,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import CountdownForm from "~/components/CountdownForm";
import useCountdownForm from "~/components/CountdownForm/useCountdownForm";

export default function AdditionalPage() {
  const params = useParams();
  const [selected, setSelected] = useState(0);
  const isCreate = params.modeOrId === "create";
  const form = useCountdownForm();

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  return (
    <Page>
      {isCreate ? (
        <ui-title-bar title="Create countdown" />
      ) : (
        <ui-title-bar title="<countdown name>" />
      )}
      <Layout>
        <Layout.Section>
          <BlockStack gap="300">
            {!isCreate ? (
              <Card>
                <BlockStack gap="300">
                  <TextField
                    label="Countdown ID"
                    value="01348719237419237"
                    readOnly
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>
            ) : null}
            <Card padding={"0"}>
              <Tabs
                tabs={[
                  {
                    id: "config",
                    content: "1. Configure",
                    accessibilityLabel: "All customers",
                    panelID: "config",
                  },
                  {
                    id: "add-to-theme",
                    content: "2. Add to theme",
                    panelID: "add-to-theme",
                    disabled: true,
                  },
                ]}
                selected={selected}
                onSelect={handleTabChange}
                fitted
              ></Tabs>
            </Card>

            <CountdownForm form={form} />
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List>
                <List.Item>
                  <Link
                    url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                    target="_blank"
                    removeUnderline
                  >
                    App nav best practices
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
