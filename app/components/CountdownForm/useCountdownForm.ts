import { useCallback, useEffect, useRef, useState } from "react";
import type { CountdownConfig } from "~/lib/types";

export type ValidationError = "missing-name" | "finish-is-sooner-than-start";

/**
 * Hook to easily manage the countdown form state.
 */
export default function useCountdownForm() {
  const valuesSnapshotRef = useRef<string>();
  const [values, setValues] = useState<CountdownConfig>({
    name: "",
    finishAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    mode: "simple",
    days: {
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

  const storeValuesSnapshot = useCallback(() => {
    valuesSnapshotRef.current = JSON.stringify(values);
  }, [values]);

  function checkTouchedStaus(): boolean {
    return JSON.stringify(values) !== valuesSnapshotRef.current;
  }

  function checkValidity(): ValidationError[] {
    const result: ValidationError[] = [];

    if (!values.name || values.name.length === 0) {
      result.push("missing-name");
    }

    if (values.scheduledAt && values.finishAt < values.scheduledAt) {
      result.push("finish-is-sooner-than-start");
    }

    return result;
  }

  function handleNameChange(name: string) {
    setValues((values) => ({
      ...values,
      name,
    }));
  }

  function handleFinishAtChange(finishAt: Date) {
    // Note: If the scheduledAt is set and the finishAt is less than the scheduledAt,
    // then update the scheduledAt to be the one day before as the finishAt.
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
  }

  function handleScheduledAtChange(scheduledAt: Date) {
    setValues((values) => ({
      ...values,
      scheduledAt,
    }));
  }

  function handleRemoveScheduledAt() {
    setValues((values) => {
      const { scheduledAt: _, ...rest } = values;
      return rest;
    });
  }

  function handleModeChange(mode: CountdownConfig["mode"]) {
    setValues((values) => ({
      ...values,
      mode,
    }));
  }

  /**
   * Passing an array of days to enable them. The rest of the days will be disabled.
   */
  function handleActiveDaysChange<Key extends keyof CountdownConfig["days"]>(
    activeDays: Key[],
  ) {
    setValues((values) => {
      const days = { ...values.days };

      Object.entries(values.days).forEach(([k, day]) => {
        days[k as Key] = {
          ...day,
          enabled: activeDays.includes(k as Key),
        };
      });

      return { ...values, days };
    });
  }

  function handleActiveDaysRangeChange<
    Key extends keyof CountdownConfig["days"],
  >(key: Key, value: { start: string; end: string }) {
    setValues((values) => {
      const activeDays = { ...values.days };

      activeDays[key].hoursRange = value;

      return { ...values, days: activeDays };
    });
  }

  function handleActiveDaysAllDayChange(
    key: keyof CountdownConfig["days"],
    value: boolean,
  ) {
    setValues((values) => {
      const activeDays = { ...values.days };

      activeDays[key].allDay = value;

      return { ...values, days: activeDays };
    });
  }

  useEffect(() => {
    if (valuesSnapshotRef.current === undefined && values !== undefined) {
      storeValuesSnapshot();
    }
  }, [storeValuesSnapshot, values]);

  return {
    ...values,
    values,
    checkTouchedStaus,
    checkValidity,
    validationErrors: checkValidity(),
    setName: handleNameChange,
    setFinishAt: handleFinishAtChange,
    setScheduledAt: handleScheduledAtChange,
    removeScheduledAt: handleRemoveScheduledAt,
    setMode: handleModeChange,
    setActiveDayEnabledStatus: handleActiveDaysChange,
    setActiveDayRange: handleActiveDaysRangeChange,
    setActiveDayAllDayStatus: handleActiveDaysAllDayChange,
  };
}
