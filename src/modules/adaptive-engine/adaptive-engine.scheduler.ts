import { adaptiveEngineService } from "./adaptive-engine.service";

const DEFAULT_INTERVAL_MINUTES = 360;

const getIntervalMs = () => {
  const configured = Number(process.env.ADAPTIVE_ENGINE_INTERVAL_MINUTES);
  const minutes = Number.isFinite(configured) && configured >= 15
    ? configured
    : DEFAULT_INTERVAL_MINUTES;
  return minutes * 60_000;
};

export const startAdaptiveEngineScheduler = () => {
  if (process.env.ADAPTIVE_ENGINE_ENABLED?.toLowerCase() === "false") {
    console.log("[adaptive-engine] scheduler disabled");
    return null;
  }

  const intervalMs = getIntervalMs();
  console.log(`[adaptive-engine] scheduler enabled every ${Math.round(intervalMs / 60_000)} minutes`);

  const timer = setInterval(() => {
    void adaptiveEngineService.recalculateAllActiveUsers("daily_scheduler")
      .then((results) => {
        const failed = results.filter((result) => !result.ok).length;
        console.log(`[adaptive-engine] scheduled recalculation complete: ${results.length - failed} ok, ${failed} failed`);
      })
      .catch((error) => {
        console.error("[adaptive-engine] scheduled recalculation failed:", error);
      });
  }, intervalMs);

  timer.unref();
  return timer;
};
