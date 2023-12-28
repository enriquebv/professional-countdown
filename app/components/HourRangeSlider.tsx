import { useState } from "react";
import { RangeSlider, InlineStack } from "@shopify/polaris";
import { useDebounce } from "react-use";
import type { DualValue } from "@shopify/polaris/build/ts/src/components/RangeSlider/types";
import InputTime from "./InputTime";

type Value = {
  start: string;
  end: string;
};

interface Props {
  value: Value;
  onChange(value: Value): void;
}

export default function HourRangeSlider(props: Props) {
  const [value, setValue] = useState<[number, number]>([
    timeStringToMinutes(props.value.start),
    timeStringToMinutes(props.value.end),
  ]);

  useDebounce(
    () => {
      props.onChange({
        start: minutesToTimeString(value[0]),
        end: minutesToTimeString(value[1]),
      });
    },
    100,
    [value],
  );

  return (
    <>
      <RangeSlider
        labelHidden
        label="Hour range slider"
        value={value as DualValue}
        min={0}
        max={1439}
        step={1}
        prefix="00:00"
        suffix="23:59"
        onChange={(value) => setValue(value as [number, number])}
      />
      <InlineStack align="space-between">
        <InputTime
          label="Start time"
          value={minutesToTimeString(value[0])}
          onChange={(time) => setValue([timeStringToMinutes(time), value[1]])}
          disableTimeBefore={minutesToTimeString(value[1])}
        />
        <InputTime
          label="End time"
          value={minutesToTimeString(value[1])}
          onChange={(time) => setValue([value[0], timeStringToMinutes(time)])}
          disableTimeAfter={minutesToTimeString(value[0])}
        />
      </InlineStack>
    </>
  );
}

// function that transform minutes numbers to time string
// by example, 0 => 00:00, 60 => 01:00, 1440 => 24:00
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const minutesString = (minutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutesString}`;
}

// function that is the inverse of minutesToTimeString
function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    console.log(timeString);
    return 0;
  }

  return hours * 60 + minutes;
}
