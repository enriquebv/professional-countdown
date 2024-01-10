export interface ActiveDay {
  enabled: boolean;
  allDay: boolean;
  hoursRange: { start: string; end: string };
}

type WithId<T> = T & { id: string };

export interface CountdownConfig {
  id?: string;
  name: string;
  finishAt: Date;
  scheduledAt?: Date;
  mode: "simple" | "advanced";
  days: {
    monday: ActiveDay;
    tuesday: ActiveDay;
    wednesday: ActiveDay;
    thursday: ActiveDay;
    friday: ActiveDay;
    saturday: ActiveDay;
    sunday: ActiveDay;
  };
}

export type CountdownConfigWithId = WithId<CountdownConfig>;
