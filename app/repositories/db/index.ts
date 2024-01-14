import type { CountdownConfig, CountdownConfigWithId } from "~/lib/types";
import type { PrismaClient } from "@prisma/client";
import prisma from "../../db.server";
import { mapCountdownConfigModelToType } from "./mappers";

export class DatabaseRepository {
  private prisma: PrismaClient = prisma;
  private shop: string;

  constructor(shop: string) {
    this.shop = shop;
  }

  async listCountdownConfigs(): Promise<CountdownConfigWithId[]> {
    const models = await this.prisma.countdownConfig.findMany({
      where: { shop: this.shop, removed: false },
      include: {
        days: true,
      },
    });

    return models.map(mapCountdownConfigModelToType);
  }

  async getCountdownConfig(
    id: CountdownConfigWithId["id"],
  ): Promise<CountdownConfigWithId> {
    const model = await this.prisma.countdownConfig.findFirst({
      where: { id, shop: this.shop },
      include: {
        days: true,
      },
    });

    return mapCountdownConfigModelToType(model as any);
  }

  /**
   * Saves the countdown config to the database.
   * If "id" is provided, then it will update the existing countdown config.
   */
  async saveCountdownConfig(
    config: CountdownConfig,
  ): Promise<CountdownConfigWithId> {
    const partials = {
      name: config.name,
      shop: this.shop,
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
    };

    const model = config.id
      ? await this.prisma.countdownConfig.update({
          where: { id: config.id },
          data: partials,
        })
      : await this.prisma.countdownConfig.create({ data: partials });

    return await this.getCountdownConfig(model.id);
  }

  async removeCountdownConfig(config: CountdownConfigWithId): Promise<void> {
    await this.prisma.countdownConfig.update({
      where: { id: config.id },
      data: { removed: true },
    });
  }
}
