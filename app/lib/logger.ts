import pino from "pino";

const logger = pino({
  transport: {
    target: "@autotelic/pino-seq-transport",
    options: {
      loggerOpts: {
        serverUrl: "https://logs.eberna.tech",
      },
    },
  },
});

export const Logger = {
  info: async (message: string, data: any) => {
    await logger.info(
      { ...data, SeqApplicationId: "professional-countdown" },
      message,
    );
  },
  error: async (message: string, data: any) => {
    await logger.error(
      { ...data, SeqApplicationId: "professional-countdown" },
      message,
    );
  },
};
