import type { CountdownConfig, CountdownConfigWithId } from "~/lib/types";
import type { PrismaClient } from "@prisma/client";
import prisma from "../../db.server";
import { mapCountdownConfigModelToType } from "./mappers";

export class DatabaseRepository {
  private prisma: PrismaClient = prisma;

  async getCountdownConfig(
    id: CountdownConfigWithId["id"],
  ): Promise<CountdownConfigWithId> {
    const model = await this.prisma.countdownConfig.findFirst({
      where: { id: id },
      include: {
        days: true,
      },
    });

    return mapCountdownConfigModelToType(model as any);
  }

  async saveCountdownConfig(
    config: CountdownConfig,
  ): Promise<CountdownConfigWithId> {
    const model = await this.prisma.countdownConfig.create({
      data: {
        name: config.name,
        finishAt: config.finishAt,
        scheduledAt: config.scheduledAt,
        mode: config.mode,
        days: {
          create: Object.entries(config.days).map(([day, dayConfig]) => ({
            day,
            allDay: dayConfig.allDay,
            enabled: dayConfig.enabled,
            rangeStart: dayConfig.hoursRange.start,
            rangeEnd: dayConfig.hoursRange.end,
          })),
        },
      },
    });

    return await this.getCountdownConfig(model.id);
  }
}
