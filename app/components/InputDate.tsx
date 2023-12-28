import { useEffect, useState } from "react";
import {
  Card,
  DatePicker as BaseDatePicker,
  Icon,
  Popover,
  TextField,
} from "@shopify/polaris";
import { CalendarMinor } from "@shopify/polaris-icons";

export interface Props {
  label: string;
  value?: Date;
  onChange: (value: Date) => void;
  disableDatesBefore?: Date;
  disableDatesAfter?: Date;
}

export default function DateInput(props: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date | undefined>(props.value);

  const [visibleMonth, setVisibleMonth] = useState({
    month: (date ?? new Date()).getMonth(),
    year: (date ?? new Date()).getFullYear(),
  });
  const formattedValue = date?.toLocaleDateString();

  function handleOnClose() {
    setShowDatePicker(false);
  }

  function handleVisibleMonthChange(month: number, year: number) {
    setVisibleMonth({ month, year });
  }

  function handleDateChange({ start: date }: { start: Date }) {
    const dateToEmit = new Date(date);

    // Fix timezone offset
    dateToEmit.setMinutes(
      dateToEmit.getMinutes() - dateToEmit.getTimezoneOffset(),
      0,
      0,
    );

    setDate(dateToEmit);
    setShowDatePicker(false);
    props.onChange(dateToEmit);
  }

  useEffect(() => {
    if (props.value) {
      setDate(props.value);
    }
  }, [props.value]);

  return (
    <Popover
      active={showDatePicker}
      autofocusTarget="none"
      preferInputActivator={false}
      preferredPosition="below"
      preventCloseOnChildOverlayClick
      onClose={handleOnClose}
      activator={
        <TextField
          role="combobox"
          label={props.label}
          prefix={<Icon source={CalendarMinor} />}
          value={formattedValue}
          onFocus={() => setShowDatePicker(true)}
          autoComplete="off"
        />
      }
    >
      <Card>
        <BaseDatePicker
          disableDatesBefore={props.disableDatesBefore}
          disableDatesAfter={props.disableDatesAfter}
          month={visibleMonth.month}
          year={visibleMonth.year}
          selected={date}
          onMonthChange={handleVisibleMonthChange}
          onChange={handleDateChange}
        />
      </Card>
    </Popover>
  );
}
