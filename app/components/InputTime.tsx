import { Listbox, Combobox, Icon } from "@shopify/polaris";
import { ClockMinor } from "@shopify/polaris-icons";
import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disableTimeAfter?: string;
  disableTimeBefore?: string;
}

export default function InputTime(props: Props) {
  const { onChange } = props;
  const lastValueRef = useRef(props.value);
  const [intermediateValue, setIntermediateValue] = useState<string>(
    props.value,
  );

  const options = generateTimeOptions({
    disableAfter: props.disableTimeAfter,
    disableBefore: props.disableTimeBefore,
  });
  const timezoneLabel = useRef(getTimezoneLabel());

  function handleOnChange(value: string) {
    setIntermediateValue(value);

    if (!isValidTimeString(value)) {
      return;
    }

    onChange(value);
  }

  const optionsMarkup =
    options.length > 0
      ? options.map((option) => {
          return (
            <Listbox.Option
              key={option.value}
              value={option.value}
              selected={option.value === intermediateValue}
              accessibilityLabel={option.label}
            >
              {option.label}
            </Listbox.Option>
          );
        })
      : null;

  useEffect(() => {
    if (props.value !== lastValueRef.current) {
      lastValueRef.current = props.value;
      setIntermediateValue(props.value);
    }
  }, [props.value]);

  return (
    <Combobox
      activator={
        <Combobox.TextField
          prefix={<Icon source={ClockMinor} />}
          onChange={handleOnChange}
          label={`${props.label} (GMT ${timezoneLabel.current})`}
          value={intermediateValue}
          placeholder="Enter time"
          autoComplete="off"
          error={
            isValidTimeString(intermediateValue) ? undefined : "Invalid time"
          }
        />
      }
    >
      {options.length > 0 ? (
        <Listbox onSelect={handleOnChange}>{optionsMarkup}</Listbox>
      ) : null}
    </Combobox>
  );
}

function generateTimeOptions(
  options: { disableAfter?: string; disableBefore?: string } = {},
): { label: string; value: string }[] {
  const result = [];
  let hourMin = 0;
  let hourMax = 24;

  if (options.disableBefore !== undefined) {
    const [hour, minute] = options.disableBefore.split(":").map(Number);
    hourMax = hour;
    if (minute > 0) {
      hourMax += 1;
    }
  }

  if (options.disableAfter !== undefined) {
    const [hour, minute] = options.disableAfter.split(":").map(Number);
    hourMin = hour;
    if (minute > 0) {
      hourMin += 1;
    }
  }

  for (let hour = hourMin; hour < hourMax; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourString = hour.toString();
      const minuteString = minute.toString().padStart(2, "0");
      const value = `${hourString}:${minuteString}`;

      result.push({ label: value, value });
    }
  }

  return result;
}

function isValidTimeString(timeString: string): boolean {
  if (timeString === undefined) return false;

  const hasSeparator = timeString.includes(":");
  const chunksAreValid = timeString
    .split(":")
    .filter(Boolean)
    .filter((chunk, chunkIndex) => {
      const allowedLengths = [1, 2];

      return (
        chunk.length >= allowedLengths[chunkIndex] &&
        chunk.length < 3 &&
        !isNaN(Number(chunk))
      );
    });

  return hasSeparator && chunksAreValid.length === 2;
}

function getTimezoneLabel() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const hours = Math.abs(offset / 60);
  const minutes = Math.abs(offset % 60);

  return `${offset < 0 ? "+" : "-"}${hours
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
