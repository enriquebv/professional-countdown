import { useState } from "react";

interface ActiveDay {
  /* Defines if day is used in countdown */
  enabled: boolean;
  /* Countdown will be shown all day. If true, hoursRange will be ignored */
  allDay: boolean;
  /* Countdown will be shown in those hours range. If allDay is true, this config is ignored (but stored) */
  hoursRange: { start: string; end: string };
}

export interface CountdownFormValues {
  finishAt: Date;
  scheduledAt?: Date;
  mode: "simple" | "advanced";
  activeDays: {
    monday: ActiveDay;
    tuesday: ActiveDay;
    wednesday: ActiveDay;
    thursday: ActiveDay;
    friday: ActiveDay;
    saturday: ActiveDay;
    sunday: ActiveDay;
  };
}

export default function useCountdownForm() {
  const [values, setValues] = useState<CountdownFormValues>({
    finishAt: new Date(),
    mode: "advanced",
    activeDays: {
      monday: {
        enabled: true,
        allDay: true,
        hoursRange: { start: "00:00", end: "24:00" },
      },
      tuesday: {
        enabled: true,
        allDay: true,
        hoursRange: { start: "00:00", end: "24:00" },
      },
      wednesday: {
        enabled: true,
        allDay: true,
        hoursRange: { start: "00:00", end: "24:00" },
      },
      thursday: {
        enabled: true,
        allDay: true,
        hoursRange: { start: "00:00", end: "24:00" },
      },
      friday: {
        enabled: true,
        allDay: true,
        hoursRange: { start: "00:00", end: "24:00" },
      },
      saturday: {
        enabled: true,
        allDay: true,
        hoursRange: { start: "00:00", end: "24:00" },
      },
      sunday: {
        enabled: true,
        allDay: true,
        hoursRange: { start: "00:00", end: "24:00" },
      },
    },
  });

  console.log(values);

  return {
    ...values,
    onFinishAtChange: (finishAt: Date) => {
      // Note: If the scheduledAt is set and the finishAt is less than the scheduledAt, then update the scheduledAt to be the one day before as the finishAt.
      if (values.scheduledAt && finishAt < values.scheduledAt) {
        const scheduledAt = new Date(finishAt);

        scheduledAt.setDate(scheduledAt.getDate() - 1);

        setValues((values) => {
          return {
            ...values,
            finishAt,
            scheduledAt,
          };
        });

        return;
      }

      setValues((values) => {
        return {
          ...values,
          finishAt,
        };
      });
    },
    onScheduledAtChange: (scheduledAt: Date) => {
      setValues((values) => ({
        ...values,
        scheduledAt,
      }));
    },
    removeScheduledAt: () => {
      setValues((values) => {
        const { scheduledAt: _, ...rest } = values;
        return rest;
      });
    },
    onModeChange: (mode: CountdownFormValues["mode"]) => {
      setValues((values) => ({ ...values, mode }));
    },
    onActiveDaysEnabledChange: <
      Key extends keyof CountdownFormValues["activeDays"],
    >(
      days: string[],
    ) => {
      setValues((values) => {
        const activeDays = { ...values.activeDays };

        Object.keys(activeDays).forEach((day) => {
          activeDays[day as Key].enabled = days.includes(day as Key);
        });

        return { ...values, activeDays };
      });
    },
    onActiveDayRangeChange: <
      Key extends keyof CountdownFormValues["activeDays"],
    >(
      key: Key,
      value: { start: string; end: string },
    ) => {
      setValues((values) => {
        const activeDays = { ...values.activeDays };

        activeDays[key].hoursRange = value;

        return { ...values, activeDays };
      });
    },
    onActiveDayAllDayChange: <
      Key extends keyof CountdownFormValues["activeDays"],
    >(
      key: Key,
      value: boolean,
    ) => {
      setValues((values) => {
        const activeDays = { ...values.activeDays };

        activeDays[key].allDay = value;

        return { ...values, activeDays };
      });
    },
  };
}
