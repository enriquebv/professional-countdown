import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Card,
  Layout,
  List,
  Page,
  Text,
  BlockStack,
  Tabs,
  Button,
  InlineStack,
  Icon,
  Banner,
  Modal,
} from "@shopify/polaris";
import { useCallback, useRef, useState } from "react";
import CountdownForm from "~/components/CountdownForm";
import useCountdownForm from "~/components/CountdownForm/useCountdownForm";
import { CancelMinor } from "@shopify/polaris-icons";
import { formatDate } from "~/lib/utils";
import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import mutateCountdownConfig from "~/actions/mutate-countdown-config";
import type { CountdownConfig, CountdownConfigWithId } from "~/lib/types";
import readCountdownConfig from "~/actions/read-countdown-config";
import createContextByRequest from "~/context.server";
import deleteCountdownConfig from "~/actions/delete-countdown-config";

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

  switch (request.method) {
    case "POST":
      const config = await mutateCountdownConfig(
        body,
        databaseRepository,
        shopifyRepository,
      );

      return redirect(`/app/countdown/${config.id}`);
    case "DELETE":
      await deleteCountdownConfig(
        body as CountdownConfigWithId,
        databaseRepository,
        shopifyRepository,
      );
      return redirect(`/app/`);
    default:
      return redirect("/app/?error=invalid-countdown-form-method");
  }
};

export default function CountdownFormPage() {
  const navigate = useNavigate();
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastToastIdRef = useRef<string | null>(null);
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [showValidationErrors, setShowValidationErrors] =
    useState<boolean>(false);

  const [selected, setSelected] = useState(0);
  const [showTemplates, setShowTemplates] = useState(true);
  const form = useCountdownForm(isUpdatingForm(data) ? data.config : undefined);

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

    const body = form.values;
    const isUpdating = isUpdatingForm(data);

    if (isUpdating) {
      body.id = data.config.id;
    }

    setIsLoading(true);
    await fetcher.submit(JSON.stringify(body), {
      method: "POST",
      encType: "application/json",
    });

    if (isUpdating) {
      setIsLoading(false);
      shopify.toast.show("Countdown updated.");
    } else {
      setIsLoading(false);
      shopify.toast.show("Countdown created.", {
        action: "Add to theme",
        onAction: () => alert("Not implemented yet."),
      });
    }
  }

  async function handleRemove() {
    if (!isUpdatingForm(data)) {
      alert("Countdown not created yet.");
      return;
    }

    await fetcher.submit(JSON.stringify(data.config), {
      method: "DELETE",
      encType: "application/json",
    });
  }

  function handleCopyId() {
    if (isUpdatingForm(data) === false) {
      alert("Countdown not created yet.");
      return;
    }

    if (lastToastIdRef.current !== null) {
      shopify.toast.hide(lastToastIdRef.current);
    }

    navigator.clipboard.writeText(data.config.id);
    lastToastIdRef.current = shopify.toast.show("Copied to clipboard.");
  }

  return (
    <Page
      title="Countdown"
      backAction={{ content: "Back", url: "/app" }}
      primaryAction={
        <Button
          variant="primary"
          loading={isLoading}
          onClick={handleSave}
          disabled={
            !form.checkTouchedStaus() || form.checkValidity().length !== 0
          }
        >
          {isUpdatingForm(data) ? "Save" : "Create"}
        </Button>
      }
      actionGroups={
        isUpdatingForm(data)
          ? [
              {
                title: "Actions",
                actions: [
                  { content: "Copy ID", onAction: handleCopyId },
                  {
                    content: "Remove",
                    destructive: true,
                    onAction: () => setShowRemoveConfirmation(true),
                  },
                ],
              },
            ]
          : undefined
      }
    >
      <ConfirmationModal
        active={showDiscardConfirmation}
        onClose={() => setShowDiscardConfirmation(false)}
        title="Discard changes?"
        content="If you discard your changes, you won’t be able to recover them."
        cancelAction={{
          text: "Continue editing",
          onAction: () => setShowDiscardConfirmation(false),
        }}
        confirmationAction={{
          text: "Discard changes",
          onAction: () => {
            navigate("/app");
          },
        }}
      />

      {isUpdatingForm(data) ? (
        <ConfirmationModal
          active={showRemoveConfirmation}
          onClose={() => setShowRemoveConfirmation(false)}
          title={`Delete countdown ${data.config.name}?`}
          content={
            <>
              Are you sure you want to delete the countdown{" "}
              <strong> {data.config.name}</strong>? This can’t be undone.
            </>
          }
          cancelAction={{
            text: "Cancel",
            onAction: () => setShowRemoveConfirmation(false),
          }}
          confirmationAction={{
            text: "Delete countdown",
            onAction: handleRemove,
          }}
        />
      ) : null}

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
            <Card padding={"0"}>
              <Tabs
                tabs={[
                  {
                    id: "config",
                    content: "Configuration",
                    panelID: "configuration",
                  },
                  {
                    id: "add-to-theme",
                    content: "Theme",
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

interface ConfirmationModal {
  active: boolean;
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  onClose: () => void;
  confirmationAction: { text: string; onAction: () => void };
  cancelAction: { text: string; onAction: () => void };
}

function ConfirmationModal(props: ConfirmationModal) {
  return (
    <Modal
      open={props.active}
      onClose={props.onClose}
      title={props.title}
      primaryAction={{
        destructive: true,
        content: props.confirmationAction.text,
        onAction: props.confirmationAction.onAction,
      }}
      secondaryActions={[
        {
          content: props.cancelAction.text,
          onAction: props.cancelAction.onAction,
        },
      ]}
    >
      <Modal.Section>{props.content}</Modal.Section>
    </Modal>
  );
}

function isUpdatingForm(
  data: any,
): data is { mode: "update"; config: CountdownConfigWithId } {
  return data.mode === "update";
}
