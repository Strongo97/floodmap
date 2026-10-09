// Risk model, requirements §4. Pure: no DOM, imported by the site and by scripts/validate.mjs.
// Risk is always computed from depth_cm.max and frequency. Never store or read a "risk" field.

export function depthClass(maxCm) {
  if (maxCm < 10) return "shallow";
  if (maxCm <= 30) return "moderate";
  return "deep";
}
export const RISK_TABLE = {
  shallow:  { rare: "low",    occasional: "low",    frequent: "medium" },
  moderate: { rare: "low",    occasional: "medium", frequent: "high"   },
  deep:     { rare: "medium", occasional: "high",   frequent: "high"   }
};
export function computeRisk(depthCm, frequency) {
  return RISK_TABLE[depthClass(depthCm.max)][frequency];
}
export const RISK_RANK = { low: 1, medium: 2, high: 3 };