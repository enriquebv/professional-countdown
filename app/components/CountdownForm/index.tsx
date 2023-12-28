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
} from "@shopify/polaris";
import InputDate from "../InputDate";
import type useCountdownForm from "./useCountdownForm";
import { useState } from "react";
import LegacyInputTime from "../LegacyInputTime";
import { type CountdownFormValues } from "./useCountdownForm";
import HourRangeSlider from "../HourRangeSlider";

interface Props {
  form: ReturnType<typeof useCountdownForm>;
}

export default function CountdownForm(props: Props) {
  const { form } = props;
  const [isUsingScheduledAt, setIsUsingScheduledAt] = useState(false);

  function handleIsUsingEndDateChange(checked: boolean) {
    // Note: If is going to use end date, set it to previous day by default
    if (checked === true && form.scheduledAt === undefined) {
      const previousWeek = new Date();
      previousWeek.setDate(previousWeek.getDate() - 7);
      form.onScheduledAtChange(previousWeek);
    }

    // Note: If is not going to use end date, remove it
    if (checked === false && form.scheduledAt !== undefined) {
      form.removeScheduledAt();
    }

    setIsUsingScheduledAt(checked);
  }

  const selectedActiveDays = Object.entries(form.activeDays)
    .filter(([, value]) => value.enabled)
    .map(([key]) => key);

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Countdown dates
          </Text>
          <Datetime
            dateLabel="End date"
            timeLabel="End time"
            value={form.finishAt}
            onChange={form.onFinishAtChange}
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
              onChange={form.onScheduledAtChange}
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
                helpText:
                  "Will be shown at {{date}} and will hidden at {{date}}.",
              },
              { label: "Advanced", value: "advanced" },
            ]}
            selected={[form.mode]}
            onChange={(options) =>
              form.onModeChange(options[0] as CountdownFormValues["mode"])
            }
          />

          {form.mode === "advanced" ? (
            <Box>
              <>
                <BlockStack gap="200">
                  <ChoiceList
                    title="Days will be shown"
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
                    onChange={form.onActiveDaysEnabledChange}
                  />
                </BlockStack>
              </>
            </Box>
          ) : null}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

function createActiveDayOption<
  Key extends keyof CountdownFormValues["activeDays"],
>(
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
      return selected ? (
        <DayHourSelection
          onAllDayChange={(value) => form.onActiveDayAllDayChange(key, value)}
          onRangeChange={(value) => form.onActiveDayRangeChange(key, value)}
          allDayValue={form.activeDays[key].allDay}
          rangeValue={form.activeDays[key].hoursRange}
        />
      ) : null;
    },
  };
}

interface DatetimeProps {
  dateLabel: string;
  timeLabel: string;
  value: Date;
  onChange: (value: Date) => void;
  disableDatesAfter?: Date;
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
