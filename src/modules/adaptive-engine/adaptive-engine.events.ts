import { adaptiveEngineService, type AdaptiveTrigger } from "./adaptive-engine.service";

export const triggerAdaptiveRecalculation = (
  userId: string,
  trigger: AdaptiveTrigger,
) => {
  void adaptiveEngineService.recalculateUser(userId, trigger).catch((error) => {
    console.error(`[adaptive-engine] ${trigger} recalculation failed for ${userId}:`, error);
  });
};
