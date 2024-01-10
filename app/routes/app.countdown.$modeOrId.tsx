import { useFetcher, useLoaderData } from "@remix-run/react";
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
  Banner,
} from "@shopify/polaris";
import { useCallback, useRef, useState } from "react";
import CountdownForm from "~/components/CountdownForm";
import useCountdownForm from "~/components/CountdownForm/useCountdownForm";
import { CancelMinor, ClipboardMinor } from "@shopify/polaris-icons";
import { formatDate } from "~/lib/utils";
import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import createCountdownConfig from "~/actions/create-countdown-config";
import type { CountdownConfig, CountdownConfigWithId } from "~/lib/types";
import readCountdownConfig from "~/actions/read-countdown-config";
import createContextByRequest from "~/context.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { databaseRepository } = await createContextByRequest(request);

  if (params.modeOrId === undefined) {
    return redirect("/app/?error=missing-mode-or-id");
  }

  if (params.modeOrId === "create") {
    return json({ mode: "create" });
  }

  return json({
    mode: "update",
    config: await readCountdownConfig(params.modeOrId, databaseRepository),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { databaseRepository, shopifyRepository } =
    await createContextByRequest(request);
  const body: CountdownConfig = await request.json();

  const config = await createCountdownConfig(
    body,
    databaseRepository,
    shopifyRepository,
  );

  return redirect(`/app/countdown/${config.id}?section=theme`);
};

export default function AdditionalPage() {
  const lastToastIdRef = useRef<string | null>(null);
  const data = useLoaderData<
    | {
        mode: "create";
      }
    | { mode: "update"; config: CountdownConfigWithId }
  >();
  const fetcher = useFetcher();
  const [showValidationErrors, setShowValidationErrors] =
    useState<boolean>(false);

  const [selected, setSelected] = useState(0);
  const [showTemplates, setShowTemplates] = useState(true);
  const form = useCountdownForm();

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  async function handleSave() {
    const issues = form.checkValidity();

    setShowValidationErrors(() => false);

    if (issues.length > 0) {
      setShowValidationErrors(() => true);
      return;
    }

    await fetcher.submit(JSON.stringify(form.values), {
      method: "POST",
      encType: "application/json",
    });

    shopify.toast.show("Countdown created.");
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
            {showValidationErrors && form.validationErrors.length !== 0 ? (
              <Banner title="Review fields" tone="critical">
                <List>
                  {form.validationErrors.includes("missing-name") ? (
                    <List.Item>Missing name.</List.Item>
                  ) : null}
                </List>
                <List>
                  {form.validationErrors.includes(
                    "finish-is-sooner-than-start",
                  ) ? (
                    <List.Item>Finish is sooner than start.</List.Item>
                  ) : null}
                </List>
              </Banner>
            ) : null}
            {data.mode === "update" ? (
              <Card>
                <BlockStack gap="300">
                  <div
                    role="button"
                    aria-label="Countdown ID"
                    onClick={() => {
                      if (lastToastIdRef.current !== null) {
                        shopify.toast.hide(lastToastIdRef.current);
                      }

                      navigator.clipboard.writeText(data.config.id);
                      lastToastIdRef.current = shopify.toast.show(
                        "Copied to clipboard.",
                      );
                    }}
                  >
                    <TextField
                      label="Countdown ID"
                      value={data.config.id}
                      readOnly
                      autoComplete="off"
                      connectedRight={
                        <Button
                          size="large"
                          icon={<Icon source={ClipboardMinor} />}
                        >
                          Copy
                        </Button>
                      }
                    />
                  </div>
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
                    disabled: data.mode === "create",
                  },
                ]}
                selected={selected}
                onSelect={handleTabChange}
                fitted
              ></Tabs>
            </Card>

            <CountdownForm
              form={form}
              showValidationErrors={showValidationErrors}
            />
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
                      Presets
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
