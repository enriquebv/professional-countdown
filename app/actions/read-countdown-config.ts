import type { CountdownConfigWithId } from "~/lib/types";
import type { DatabaseRepository } from "~/repositories/db";

export default async function readCountdownConfig(
  id: CountdownConfigWithId["id"],
  databaseRepository: DatabaseRepository,
): Promise<CountdownConfigWithId> {
  return await databaseRepository.getCountdownConfig(id);
}
