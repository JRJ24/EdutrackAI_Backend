import { proactiveAlertsService } from "../notifications/proactive-alerts.service";
import { adaptiveEngineService } from "./adaptive-engine.service";

const DEFAULT_INTERVAL_MINUTES = 60;

const getIntervalMs = () => {
  const configured = Number(process.env.ADAPTIVE_ENGINE_INTERVAL_MINUTES);
  const minutes = Number.isFinite(configured) && configured >= 15
    ? configured
    : DEFAULT_INTERVAL_MINUTES;
  return minutes * 60_000;
};

const runSweep = async () => {
  const [adaptive, proactive] = await Promise.all([
    adaptiveEngineService.recalculateAllActiveUsers("daily_scheduler"),
    proactiveAlertsService.runAllActiveUsers(),
  ]);

  const adaptiveFailed = adaptive.filter((result) => !result.ok).length;
  const proactiveFailed = proactive.filter((result) => !result.ok).length;
  const proactiveCreated = proactive.reduce((total, result) => total + result.created, 0);

  console.log(
    `[adaptive-engine] sweep complete: ${adaptive.length - adaptiveFailed}/${adaptive.length} adaptive ok, ` +
    `${proactive.length - proactiveFailed}/${proactive.length} proactive ok, ${proactiveCreated} alert(s) created`,
  );
};

export const startAdaptiveEngineScheduler = () => {
  if (process.env.ADAPTIVE_ENGINE_ENABLED?.toLowerCase() === "false") {
    console.log("[adaptive-engine] scheduler disabled");
    return null;
  }

  const intervalMs = getIntervalMs();
  console.log(`[adaptive-engine] scheduler enabled every ${Math.round(intervalMs / 60_000)} minutes`);

  // Do not wait one full interval after boot. This makes important events visible
  // immediately when the backend starts, while dedupe rules prevent email spam.
  const initialRun = setTimeout(() => {
    void runSweep().catch((error) => {
      console.error("[adaptive-engine] initial sweep failed:", error);
    });
  }, 2_000);
  initialRun.unref();

  const timer = setInterval(() => {
    void runSweep().catch((error) => {
      console.error("[adaptive-engine] scheduled sweep failed:", error);
    });
  }, intervalMs);

  timer.unref();
  return timer;
};
