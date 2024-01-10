import { useParams } from "@remix-run/react";
import {
  Card,
  Layout,
  List,
  Page,
  Text,
  BlockStack,
  TextField,
  Tabs,
  Button,
  InlineStack,
  Icon,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import CountdownForm from "~/components/CountdownForm";
import useCountdownForm from "~/components/CountdownForm/useCountdownForm";
import { CancelMinor } from "@shopify/polaris-icons";
import { formatDate } from "~/lib/utils";

export default function AdditionalPage() {
  const params = useParams();
  const [selected, setSelected] = useState(0);
  const [showTemplates, setShowTemplates] = useState(true);
  const isCreate = params.modeOrId === "create";
  const form = useCountdownForm();

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  function handleSave() {
    const issues = form.checkValidity();

    if (issues.length > 0) {
      console.log(issues);
      return;
    }

    alert(JSON.stringify(form.values, null, 2));
  }

  function handleDiscard() {}

  return (
    <Page
      title="Countdown"
      backAction={{ content: "Back", url: "/app" }}
      primaryAction={
        <Button variant="primary" onClick={handleSave}>
          Create
        </Button>
      }
      secondaryActions={
        <Button key="discard" onClick={handleDiscard}>
          Discard
        </Button>
      }
    >
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
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Resume
                </Text>
                <List>
                  <List.Item>
                    Countdown will be active from{" "}
                    <strong>
                      {form.scheduledAt ? formatDate(form.scheduledAt) : "now"}
                    </strong>{" "}
                    to <strong>{formatDate(form.finishAt)}</strong>.
                  </List.Item>
                  {form.mode === "advanced" ? (
                    <>
                      <List.Item>
                        Will be visible on
                        <List>
                          {Object.entries(form.days).map(([key, value]) => {
                            if (!value.enabled) {
                              return (
                                <List.Item key={key}>
                                  {key} <strong>hidden</strong>.
                                </List.Item>
                              );
                            }

                            if (value.allDay) {
                              return (
                                <List.Item key={key}>
                                  {key} <strong>all day</strong>.
                                </List.Item>
                              );
                            }

                            return (
                              <List.Item key={key}>
                                {key} from{" "}
                                <strong>{value.hoursRange.start}</strong> to{" "}
                                <strong>{value.hoursRange.end}</strong>.
                              </List.Item>
                            );
                          })}
                        </List>
                      </List.Item>
                    </>
                  ) : null}
                </List>
              </BlockStack>
            </Card>
            {showTemplates ? (
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Countdown templates
                    </Text>
                    <Button
                      variant="plain"
                      icon={<Icon source={CancelMinor} />}
                      onClick={() => setShowTemplates(false)}
                    />
                  </InlineStack>

                  <List>
                    <List.Item>Next hour.</List.Item>
                    <List.Item>Next month at mornings.</List.Item>
                    <List.Item>Next year only fridays nights.</List.Item>
                  </List>
                </BlockStack>
              </Card>
            ) : null}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
