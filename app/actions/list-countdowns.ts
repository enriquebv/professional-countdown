import type { DatabaseRepository } from "~/repositories/db";

export default async function listCountdowns(
  databaseRepository: DatabaseRepository,
) {
  return await databaseRepository.listCountdownConfigs();
}
