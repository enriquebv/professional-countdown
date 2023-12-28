import { Listbox, Combobox, Icon } from "@shopify/polaris";
import { ClockMinor } from "@shopify/polaris-icons";
import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  value: Date;
  /** Value emitted is a new date, not a mutation of value */
  onChange: (value: Date) => void;
  disableHoursAfter?: Date;
}

// Tech debt: Create a withDate HOC and remove this component.
/** @decprecated Use LegacyInputTime. */
export default function LegacyInputTime(props: Props) {
  const { onChange, value } = props;
  const lastValidTime = useRef<string>();
  const [timeString, setTimeString] = useState<string>(
    getTimeStringFromDate(value),
  );
  const options = generateTimeOptions(value, props.disableHoursAfter);
  const timezoneLabel = useRef(getTimezoneLabel());

  function handleOnChange(time: string) {
    setTimeString(time);

    if (!isValidTimeString(time)) {
      return;
    }

    // Note: Will not mark as valid a date that surpasses the disableHoursAfter
    // Will also revert to the last valid input
    if (props.disableHoursAfter) {
      const [hours, minutes] = time.split(":").map(Number);
      const [disableHours, disableMinutes] = getTimeStringFromDate(
        props.disableHoursAfter,
      )
        .split(":")
        .map(Number);

      if (
        hours > disableHours ||
        (hours === disableHours && minutes > disableMinutes)
      ) {
        lastValidTime.current && setTimeString(lastValidTime.current);
        return;
      }
    }

    onChange(applyTimeToDay(value, time));
    lastValidTime.current = timeString;
  }

  // Note: If the input is invalid, revert to the last valid input
  function handleOnBlur() {
    if (timeString === undefined) return;

    if (!isValidTimeString(timeString) && lastValidTime.current !== undefined) {
      setTimeString(lastValidTime.current);
    }
  }

  useEffect(() => {
    if (value === undefined) return;

    const timeString = getTimeStringFromDate(value);
    setTimeString(timeString);
    lastValidTime.current = timeString;
  }, [value]);

  const optionsMarkup =
    options.length > 0
      ? options.map((option) => {
          const { label, value } = option;

          return (
            <Listbox.Option
              key={value}
              value={value}
              selected={value === timeString}
              accessibilityLabel={label}
            >
              {label}
            </Listbox.Option>
          );
        })
      : null;

  return (
    <Combobox
      activator={
        <Combobox.TextField
          prefix={<Icon source={ClockMinor} />}
          onChange={handleOnChange}
          label={`${props.label} (GMT ${timezoneLabel.current})`}
          value={timeString}
          onBlur={handleOnBlur}
          placeholder="Enter time"
          autoComplete="off"
        />
      }
    >
      {options.length > 0 ? (
        <Listbox onSelect={handleOnChange}>{optionsMarkup}</Listbox>
      ) : null}
    </Combobox>
  );
}

function getTimeStringFromDate(date?: Date): string {
  if (date === undefined) return "";

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutes.toString().padStart(2, "0");

  return `${hoursString}:${minutesString}`;
}

function generateTimeOptions(
  current: Date,
  disableHoursAfter?: Date,
): { label: string; value: string }[] {
  const result = [];
  let hourEnd = 24;

  if (disableHoursAfter && isSameDay(current, disableHoursAfter)) {
    hourEnd = disableHoursAfter.getHours();
  }

  for (let hour = 0; hour < hourEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourString = hour.toString().padStart(2, "0");
      const minuteString = minute.toString().padStart(2, "0");
      const value = `${hourString}:${minuteString}`;

      result.push({ label: value, value });
    }
  }

  return result;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function isValidTimeString(timeString: string): boolean {
  if (timeString === undefined) return false;

  const regex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
  return regex.test(timeString);
}

export function getTimezoneLabel() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const hours = Math.abs(offset / 60);
  const minutes = Math.abs(offset % 60);

  return `${offset < 0 ? "+" : "-"}${hours
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function hoursAndMinutesToTimeString(
  hours: number,
  minutes: number,
): string {
  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutes.toString().padStart(2, "0");

  return `${hoursString}:${minutesString}`;
}

export function applyTimeToDay(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);

  const result = new Date(date);

  result.setHours(hours);
  result.setMinutes(minutes);

  return result;
}
