import type { CountdownConfig, CountdownConfigDay } from "@prisma/client";
import type { CountdownConfigWithId } from "~/lib/types";

export function mapCountdownConfigModelToType(
  model: CountdownConfig & { days: CountdownConfigDay[] },
): CountdownConfigWithId {
  const days: CountdownConfigWithId["days"] = model.days.reduce(
    (acc, dayConfig) => {
      acc[dayConfig.day as keyof CountdownConfigWithId["days"]] = {
        enabled: dayConfig.enabled,
        allDay: dayConfig.allDay,
        hoursRange: {
          start: dayConfig.rangeStart,
          end: dayConfig.rangeEnd,
        },
      };

      return acc;
    },
    {} as CountdownConfigWithId["days"],
  );

  return {
    id: model.id,
    name: model.name,
    finishAt: model.finishAt,
    scheduledAt: model.scheduledAt ?? undefined,
    mode: model.mode as "simple" | "advanced",
    days,
  };
}
