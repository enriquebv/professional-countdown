import {
  BlockStack,
  Box,
  Card,
  Checkbox,
  InlineStack,
  ChoiceList,
  Text,
  ButtonGroup,
  Button,
  type ChoiceListProps,
  Bleed,
  TextField,
  InlineError,
} from "@shopify/polaris";
import InputDate from "../InputDate";
import type useCountdownForm from "./useCountdownForm";
import { useState } from "react";
import LegacyInputTime from "../LegacyInputTime";
import HourRangeSlider from "../HourRangeSlider";
import { formatDate } from "~/lib/utils";
import type { CountdownConfig } from "~/lib/types";

interface Props {
  form: ReturnType<typeof useCountdownForm>;
  showValidationErrors: boolean;
}

export default function CountdownForm(props: Props) {
  const { form } = props;
  const [isUsingScheduledAt, setIsUsingScheduledAt] = useState(false);

  function handleIsUsingEndDateChange(checked: boolean) {
    // Note: If is going to use end date, set it to previous 6 from now by default
    if (checked === true && form.scheduledAt === undefined) {
      const previousWeek = new Date(form.finishAt);
      previousWeek.setDate(previousWeek.getDate() - 6);
      form.setScheduledAt(previousWeek);
    }

    // Note: If is not going to use end date, remove it
    if (checked === false && form.scheduledAt !== undefined) {
      form.removeScheduledAt();
    }

    setIsUsingScheduledAt(checked);
  }

  const selectedActiveDays = Object.entries(form.days)
    .filter(([, value]) => value.enabled)
    .map(([key]) => key);

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Countdown dates
          </Text>
          <TextField
            id="countdown-name"
            label="Title"
            autoComplete="off"
            value={form.values.name}
            onChange={form.setName}
            error={
              props.showValidationErrors &&
              form.validationErrors.includes("missing-name")
            }
            helpText={
              props.showValidationErrors &&
              form.validationErrors.includes("missing-name") ? (
                <InlineError
                  fieldID="countdown-name"
                  message="Name can not be empty."
                />
              ) : (
                "This is the name of the countdown. It will be used to identify it."
              )
            }
          />

          <Datetime
            dateLabel="End date"
            timeLabel="End time"
            value={form.finishAt}
            onChange={form.setFinishAt}
            disableDatesBefore={new Date()}
            helperText="It will end at this date."
          />

          <Checkbox
            label="Schedule start"
            checked={isUsingScheduledAt}
            onChange={handleIsUsingEndDateChange}
          />

          {isUsingScheduledAt && form.scheduledAt !== undefined ? (
            <Datetime
              dateLabel="Start date"
              timeLabel="Start time"
              value={form.scheduledAt}
              onChange={form.setScheduledAt}
              disableDatesAfter={form.finishAt}
              helperText="It will be hidden until this date."
            />
          ) : null}
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Customization
          </Text>

          <ChoiceList
            title="Company name"
            titleHidden
            choices={[
              {
                label: "Simple",
                value: "simple",
                helpText: `Countdown will be active from 
                    ${
                      form.scheduledAt ? formatDate(form.scheduledAt) : "now"
                    } to 
                    ${formatDate(form.finishAt)}.`,
              },
              {
                label: "Advanced",
                value: "advanced",
                helpText: "Configure countdown visibility by day and/or hour.",
              },
            ]}
            selected={[form.mode]}
            onChange={(options) =>
              form.setMode(options[0] as CountdownConfig["mode"])
            }
          />

          {form.mode === "advanced" ? (
            <Bleed marginBlockStart="200">
              <Box paddingInlineStart="600">
                <BlockStack gap="200">
                  <ChoiceList
                    title={
                      <Text as="p" variant="headingSm" fontWeight="medium">
                        Day-Specific Settings
                      </Text>
                    }
                    allowMultiple
                    choices={[
                      createActiveDayOption("monday", selectedActiveDays, form),
                      createActiveDayOption(
                        "tuesday",
                        selectedActiveDays,
                        form,
                      ),
                      createActiveDayOption(
                        "wednesday",
                        selectedActiveDays,
                        form,
                      ),
                      createActiveDayOption(
                        "thursday",
                        selectedActiveDays,
                        form,
                      ),
                      createActiveDayOption("friday", selectedActiveDays, form),
                      createActiveDayOption(
                        "saturday",
                        selectedActiveDays,
                        form,
                      ),
                      createActiveDayOption("sunday", selectedActiveDays, form),
                    ]}
                    selected={selectedActiveDays}
                    error={
                      selectedActiveDays.length === 0
                        ? "At least one day must be selected. "
                        : undefined
                    }
                    onChange={form.setActiveDayEnabledStatus}
                  />
                </BlockStack>
              </Box>
            </Bleed>
          ) : null}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

function createActiveDayOption<Key extends keyof CountdownConfig["days"]>(
  key: Key,
  selectedActiveDays: string[],
  form: ReturnType<typeof useCountdownForm>,
): ChoiceListProps["choices"][number] {
  const LABEL_PER_KEY: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  return {
    label: (
      <Text
        as="p"
        tone={selectedActiveDays.includes(key) ? undefined : "subdued"}
        textDecorationLine={
          selectedActiveDays.includes(key) ? undefined : "line-through"
        }
      >
        {LABEL_PER_KEY[key]}
      </Text>
    ),
    value: key,
    renderChildren(selected: boolean) {
      if (!selected) {
        return null;
      }

      return (
        <DayHourSelection
          onAllDayChange={(value) => form.setActiveDayAllDayStatus(key, value)}
          onRangeChange={(value) => form.setActiveDayRange(key, value)}
          allDayValue={form.days[key].allDay}
          rangeValue={form.days[key].hoursRange}
        />
      );
    },
  };
}

interface DatetimeProps {
  dateLabel: string;
  timeLabel: string;
  value: Date;
  onChange: (value: Date) => void;
  disableDatesAfter?: Date;
  disableDatesBefore?: Date;
  helperText?: string;
}

function Datetime(props: DatetimeProps) {
  return (
    <BlockStack gap="200">
      <InlineStack blockAlign="center" gap="200">
        <Box minWidth="48%">
          <InputDate
            label={props.dateLabel}
            value={props.value}
            onChange={props.onChange}
            disableDatesAfter={props.disableDatesAfter}
            disableDatesBefore={props.disableDatesBefore}
          />
        </Box>
        <Box minWidth="48%">
          <LegacyInputTime
            label={props.timeLabel}
            value={props.value}
            onChange={props.onChange}
            disableHoursAfter={props.disableDatesAfter}
          />
        </Box>
      </InlineStack>
      {props.helperText ? (
        <Text as="p" variant="bodyMd" tone="subdued">
          {props.helperText}
        </Text>
      ) : null}
    </BlockStack>
  );
}

interface DayHourSelectionProps {
  allDayValue: boolean;
  rangeValue: { start: string; end: string };
  onAllDayChange(value: boolean): void;
  onRangeChange(value: { start: string; end: string }): void;
}

function DayHourSelection(props: DayHourSelectionProps) {
  return (
    <BlockStack gap="200">
      <ButtonGroup variant="segmented">
        <Button
          pressed={props.allDayValue === true}
          onClick={() => props.onAllDayChange(true)}
        >
          All day
        </Button>
        <Button
          pressed={props.allDayValue === false}
          onClick={() => props.onAllDayChange(false)}
        >
          Specific hours range
        </Button>
      </ButtonGroup>

      {props.allDayValue === false ? (
        <HourRangeSlider
          onChange={props.onRangeChange}
          value={props.rangeValue}
        />
      ) : null}
    </BlockStack>
  );
}
