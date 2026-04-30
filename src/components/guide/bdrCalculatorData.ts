// AUTO-GENERATED from Sales_Forecasting_-_Shared_2.xlsx (Calculator + 2026 Goals Firm + % of BDRs to Goal)

export interface CalcRow {
  monthlyGoal: number | null;
  actual: number | null;
  actVarDollar: number | null;
  actDaysNeeded: number | null;
  actVarPct: number | null;
  actBookingsToGoal: number | null;
  gpGroupPipe: number | null;
  gpExistingPipe: number | null;
  totalPipe: number | null;
  actPlusPipe: number | null;
  expVarDollar: number | null;
  expVarPct: number | null;
  remainPipeNeed: number | null;
  expDaysNeeded: number | null;
  expBookings: number | null;
  commEarned: number | null;
  commForecast: number | null;
  totalCommPred: number | null;
}

export interface BDR {
  id: string;
  name: string;
  market: string;
  annualRevenueGoal: number;
  annualGpGoal: number;
  rows: Record<string, CalcRow>;
}

// GP Margin (derived from Top Line Rev Goal / GP Goal). Used to convert any GP figure to the
// Top Line Revenue required to produce it (Revenue Needed = GP / margin).
export const gpMargin = (b: BDR) => b.annualGpGoal / b.annualRevenueGoal;
export const revenueForGp = (b: BDR, gp: number | null | undefined) => {
  if (gp === null || gp === undefined || Number.isNaN(gp)) return null;
  const m = gpMargin(b);
  if (!m) return null;
  return gp / m;
};

export const BDRS: BDR[] = [
  {
    id: "hallie", name: "Bellack, Hallie", market: "Georgia", annualRevenueGoal: 340000, annualGpGoal: 85000,
    rows:
  {
    "2025-Jan": { monthlyGoal: 0, actual: 0, actVarDollar: 0, actDaysNeeded: 0, actVarPct: null, actBookingsToGoal: 0, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: 0, expVarPct: 1, remainPipeNeed: 0, expDaysNeeded: 0, expBookings: 0, commEarned: 0, commForecast: 0, totalCommPred: 0 },
    "2025-Feb": { monthlyGoal: 0, actual: 0, actVarDollar: 0, actDaysNeeded: 0, actVarPct: null, actBookingsToGoal: 0, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: 0, expVarPct: 1, remainPipeNeed: 0, expDaysNeeded: 0, expBookings: 0, commEarned: 0, commForecast: 0, totalCommPred: 0 },
    "2025-Mar": { monthlyGoal: 0, actual: 0, actVarDollar: 0, actDaysNeeded: 0, actVarPct: null, actBookingsToGoal: 0, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: 0, expVarPct: 1, remainPipeNeed: 0, expDaysNeeded: 0, expBookings: 0, commEarned: 0, commForecast: 0, totalCommPred: 0 },
    "2025-Apr": { monthlyGoal: 0, actual: 580.38, actVarDollar: 580.38, actDaysNeeded: -29.019, actVarPct: null, actBookingsToGoal: -0.9673, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 580.38, expVarDollar: 580.38, expVarPct: 1, remainPipeNeed: 0, expDaysNeeded: -29.019, expBookings: -0.9361, commEarned: 29.019, commForecast: 0, totalCommPred: 28.0829 },
    "2025-May": { monthlyGoal: 1970.8856, actual: 1146.16, actVarDollar: -824.7256, actDaysNeeded: 41.2363, actVarPct: 0.5815, actBookingsToGoal: 1.3302, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 1146.16, expVarDollar: -824.7256, expVarPct: 0.5815, remainPipeNeed: -2474.1768, expDaysNeeded: 41.2363, expBookings: 1.3302, commEarned: 57.308, commForecast: 0, totalCommPred: 58.6382 },
    "2025-Jun": { monthlyGoal: 3851.5625, actual: 1317.3, actVarDollar: -2534.2625, actDaysNeeded: 126.7131, actVarPct: 0.342, actBookingsToGoal: 4.2238, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 1317.3, expVarDollar: -2534.2625, expVarPct: 0.342, remainPipeNeed: -7602.7875, expDaysNeeded: 126.7131, expBookings: 4.0875, commEarned: 65.865, commForecast: 0, totalCommPred: 69.9525 },
    "2025-Jul": { monthlyGoal: 4067.7114, actual: 1361.21, actVarDollar: -2706.5014, actDaysNeeded: 135.3251, actVarPct: 0.3346, actBookingsToGoal: 4.3653, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 1361.21, expVarDollar: -2706.5014, expVarPct: 0.3346, remainPipeNeed: -8119.5041, expDaysNeeded: 135.3251, expBookings: 4.3653, commEarned: 68.0605, commForecast: 0, totalCommPred: 72.4258 },
    "2025-Aug": { monthlyGoal: 4011.3405, actual: 3121.47, actVarDollar: -889.8705, actDaysNeeded: 44.4935, actVarPct: 0.7782, actBookingsToGoal: 1.4353, gpGroupPipe: 1288, gpExistingPipe: null, totalPipe: null, actPlusPipe: 4409.47, expVarDollar: 398.1295, expVarPct: 1.0993, remainPipeNeed: -1381.6114, expDaysNeeded: -19.9065, expBookings: -0.6421, commEarned: 156.0735, commForecast: 64.4, totalCommPred: 219.8314 },
    "2025-Sep": { monthlyGoal: 7993.6675, actual: 4068.32, actVarDollar: -3925.3475, actDaysNeeded: 196.2674, actVarPct: 0.5089, actBookingsToGoal: 6.5422, gpGroupPipe: 3930, gpExistingPipe: null, totalPipe: null, actPlusPipe: 7998.32, expVarDollar: 4.6525, expVarPct: 1.0006, remainPipeNeed: -7846.0425, expDaysNeeded: -0.2326, expBookings: -0.0075, commEarned: 203.416, commForecast: 196.5, totalCommPred: 399.9085 },
    "2025-Oct": { monthlyGoal: 9530.4759, actual: 5875.39, actVarDollar: -3655.0859, actDaysNeeded: 182.7543, actVarPct: 0.6165, actBookingsToGoal: 5.8953, gpGroupPipe: 4061, gpExistingPipe: null, totalPipe: null, actPlusPipe: 9936.39, expVarDollar: 405.9141, expVarPct: 1.0426, remainPipeNeed: -6904.2577, expDaysNeeded: -20.2957, expBookings: -0.6547, commEarned: 293.7695, commForecast: 203.05, totalCommPred: 496.1648 },
    "2025-Nov": { monthlyGoal: 7128.9911, actual: 3862.01, actVarDollar: -3266.9811, actDaysNeeded: 163.3491, actVarPct: 0.5417, actBookingsToGoal: 5.445, gpGroupPipe: 2417, gpExistingPipe: null, totalPipe: null, actPlusPipe: 6279.01, expVarDollar: -849.9811, expVarPct: 0.8808, remainPipeNeed: -7383.9433, expDaysNeeded: 42.4991, expBookings: 1.3709, commEarned: 193.1005, commForecast: 120.85, totalCommPred: 315.3214 },
    "2025-Dec": { monthlyGoal: 6026.4487, actual: 3434.66, actVarDollar: -2591.7887, actDaysNeeded: 129.5894, actVarPct: 0.5699, actBookingsToGoal: 4.1803, gpGroupPipe: 0, gpExistingPipe: null, totalPipe: null, actPlusPipe: 3434.66, expVarDollar: -2591.7887, expVarPct: 0.5699, remainPipeNeed: -7775.3661, expDaysNeeded: 129.5894, expBookings: 4.1803, commEarned: 171.733, commForecast: 0, totalCommPred: 175.9133 },
    "2025-All": { monthlyGoal: 44581.0831, actual: 24766.9, actVarDollar: -19814.1831, actDaysNeeded: 990.7092, actVarPct: 0.5555, actBookingsToGoal: 32.4501, gpGroupPipe: 11696, gpExistingPipe: null, totalPipe: null, actPlusPipe: 36462.9, expVarDollar: -8118.1831, expVarPct: 0.8179, remainPipeNeed: -47746.5494, expDaysNeeded: 405.9092, expBookings: 13.0938, commEarned: 1238.345, commForecast: 0, totalCommPred: 1251.4388 },
    "2025-Q1": { monthlyGoal: 0, actual: 0, actVarDollar: 0, actDaysNeeded: null, actVarPct: null, actBookingsToGoal: 0, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: 0, expVarPct: null, remainPipeNeed: 0, expDaysNeeded: null, expBookings: 0, commEarned: null, commForecast: null, totalCommPred: null },
    "2025-Q2": { monthlyGoal: 5822.4481, actual: 3043.84, actVarDollar: -2778.6081, actDaysNeeded: null, actVarPct: null, actBookingsToGoal: 0, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 3043.84, expVarDollar: -2778.6081, expVarPct: null, remainPipeNeed: -8335.8243, expDaysNeeded: null, expBookings: 0, commEarned: null, commForecast: null, totalCommPred: null },
    "2025-Q3": { monthlyGoal: 16072.7193, actual: 8551, actVarDollar: -7521.7193, actDaysNeeded: null, actVarPct: null, actBookingsToGoal: 0, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 13769, expVarDollar: -2303.7193, expVarPct: null, remainPipeNeed: -22565.158, expDaysNeeded: null, expBookings: 0, commEarned: null, commForecast: null, totalCommPred: null },
    "2025-Q4": { monthlyGoal: 22685.9157, actual: 13172.06, actVarDollar: -9513.8557, actDaysNeeded: null, actVarPct: null, actBookingsToGoal: 0, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 19650.06, expVarDollar: -3035.8557, expVarPct: null, remainPipeNeed: -28541.5671, expDaysNeeded: null, expBookings: 0, commEarned: null, commForecast: null, totalCommPred: null },
    "2026-Jan": { monthlyGoal: 4091, actual: 4054.16, actVarDollar: -36.84, actDaysNeeded: 1.228, actVarPct: 0.991, actBookingsToGoal: 0.0396, gpGroupPipe: 1550, gpExistingPipe: 0, totalPipe: 1550, actPlusPipe: 5604.16, expVarDollar: 1513.16, expVarPct: 1.3699, remainPipeNeed: 1427.2, expDaysNeeded: -50.4387, expBookings: -1.6271, commEarned: 202.708, commForecast: 77.5, totalCommPred: 280.208 },
    "2026-Feb": { monthlyGoal: 4278, actual: 2488.46, actVarDollar: -1789.54, actDaysNeeded: 59.6513, actVarPct: 0.5817, actBookingsToGoal: 2.1304, gpGroupPipe: 1400, gpExistingPipe: 0, totalPipe: 1400, actPlusPipe: 3888.46, expVarDollar: -389.54, expVarPct: 0.9089, remainPipeNeed: -4565.1333, expDaysNeeded: 12.9847, expBookings: 0.4189, commEarned: 124.423, commForecast: 70, totalCommPred: 194.423 },
    "2026-Mar": { monthlyGoal: 5022, actual: 2826.27, actVarDollar: -2195.73, actDaysNeeded: 73.191, actVarPct: 0.5628, actBookingsToGoal: 2.361, gpGroupPipe: 100, gpExistingPipe: 0, totalPipe: 100, actPlusPipe: 2926.27, expVarDollar: -2095.73, expVarPct: 0.5827, remainPipeNeed: -7219.1, expDaysNeeded: 69.8577, expBookings: 2.2535, commEarned: 141.3135, commForecast: 5, totalCommPred: 146.3135 },
    "2026-Apr": { monthlyGoal: 5609, actual: 3712.86, actVarDollar: -1896.14, actDaysNeeded: 63.2047, actVarPct: 0.6619, actBookingsToGoal: 2.1068, gpGroupPipe: 0, gpExistingPipe: 0, totalPipe: 0, actPlusPipe: 3712.86, expVarDollar: -1896.14, expVarPct: 0.6619, remainPipeNeed: -6320.4667, expDaysNeeded: 63.2047, expBookings: 2.0389, commEarned: 185.643, commForecast: 0, totalCommPred: 185.643 },
    "2026-May": { monthlyGoal: 6466, actual: 3866.04, actVarDollar: -2599.96, actDaysNeeded: 86.6653, actVarPct: 0.5979, actBookingsToGoal: 2.7957, gpGroupPipe: 9975, gpExistingPipe: 0, totalPipe: 9975, actPlusPipe: 13841.04, expVarDollar: 7375.04, expVarPct: 2.1406, remainPipeNeed: 1308.4667, expDaysNeeded: -245.8347, expBookings: -7.9302, commEarned: 193.302, commForecast: 498.75, totalCommPred: 692.052 },
    "2026-Jun": { monthlyGoal: 11286, actual: 2405.16, actVarDollar: -8880.84, actDaysNeeded: 296.028, actVarPct: 0.2131, actBookingsToGoal: 9.8676, gpGroupPipe: 14250, gpExistingPipe: 0, totalPipe: 14250, actPlusPipe: 16655.16, expVarDollar: 5369.16, expVarPct: 1.4757, remainPipeNeed: -15352.8, expDaysNeeded: -178.972, expBookings: -5.7733, commEarned: 120.258, commForecast: 712.5, totalCommPred: 832.758 },
    "2026-Jul": { monthlyGoal: 12452, actual: 2451.48, actVarDollar: -10000.52, actDaysNeeded: 333.3507, actVarPct: 0.1969, actBookingsToGoal: 10.7532, gpGroupPipe: 14725, gpExistingPipe: 0, totalPipe: 14725, actPlusPipe: 17176.48, expVarDollar: 4724.48, expVarPct: 1.3794, remainPipeNeed: -18610.0667, expDaysNeeded: -157.4827, expBookings: -5.0801, commEarned: 122.574, commForecast: 736.25, totalCommPred: 858.824 },
    "2026-Aug": { monthlyGoal: 9718, actual: 2451.48, actVarDollar: -7266.52, actDaysNeeded: 242.2173, actVarPct: 0.2523, actBookingsToGoal: 7.8135, gpGroupPipe: 7125, gpExistingPipe: 0, totalPipe: 7125, actPlusPipe: 9576.48, expVarDollar: -141.52, expVarPct: 0.9854, remainPipeNeed: -17096.7333, expDaysNeeded: 4.7173, expBookings: 0.1522, commEarned: 122.574, commForecast: 356.25, totalCommPred: 478.824 },
    "2026-Sep": { monthlyGoal: 6795, actual: 1689.16, actVarDollar: -5105.84, actDaysNeeded: 170.1947, actVarPct: 0.2486, actBookingsToGoal: 5.6732, gpGroupPipe: 0, gpExistingPipe: 0, totalPipe: 0, actPlusPipe: 1689.16, expVarDollar: -5105.84, expVarPct: 0.2486, remainPipeNeed: -17019.4667, expDaysNeeded: 170.1947, expBookings: 5.4902, commEarned: 84.458, commForecast: 0, totalCommPred: 84.458 },
    "2026-Oct": { monthlyGoal: 8101, actual: 1721.12, actVarDollar: -6379.88, actDaysNeeded: 212.6627, actVarPct: 0.2125, actBookingsToGoal: 6.8601, gpGroupPipe: 0, gpExistingPipe: 0, totalPipe: 0, actPlusPipe: 1721.12, expVarDollar: -6379.88, expVarPct: 0.2125, remainPipeNeed: -21266.2667, expDaysNeeded: 212.6627, expBookings: 6.8601, commEarned: 86.056, commForecast: 0, totalCommPred: 86.056 },
    "2026-Nov": { monthlyGoal: 6060, actual: 1665.6, actVarDollar: -4394.4, actDaysNeeded: 146.48, actVarPct: 0.2749, actBookingsToGoal: 4.8827, gpGroupPipe: 0, gpExistingPipe: 0, totalPipe: 0, actPlusPipe: 1665.6, expVarDollar: -4394.4, expVarPct: 0.2749, remainPipeNeed: -14648, expDaysNeeded: 146.48, expBookings: 4.7252, commEarned: 83.28, commForecast: 0, totalCommPred: 83.28 },
    "2026-Dec": { monthlyGoal: 5122, actual: 1721.12, actVarDollar: -3400.88, actDaysNeeded: 113.3627, actVarPct: 0.336, actBookingsToGoal: 3.6569, gpGroupPipe: 0, gpExistingPipe: 0, totalPipe: 0, actPlusPipe: 1721.12, expVarDollar: -3400.88, expVarPct: 0.336, remainPipeNeed: -11336.2667, expDaysNeeded: 113.3627, expBookings: 3.6569, commEarned: 86.056, commForecast: 0, totalCommPred: 86.056 },
    "2026-All": { monthlyGoal: 85000, actual: 31052.91, actVarDollar: -53947.09, actDaysNeeded: 1798.2363, actVarPct: 0.3653, actBookingsToGoal: 59.9412, gpGroupPipe: 49125, gpExistingPipe: 0, totalPipe: 49125, actPlusPipe: 80177.91, expVarDollar: -4822.09, expVarPct: 0.9433, remainPipeNeed: -130698.6333, expDaysNeeded: 160.7363, expBookings: 5.185, commEarned: 1552.6455, commForecast: 2456.25, totalCommPred: 4008.8955 },
    "2026-Q1": { monthlyGoal: 13391, actual: 9368.89, actVarDollar: -4022.11, actDaysNeeded: 134.0703, actVarPct: 0.6996, actBookingsToGoal: 1.4897, gpGroupPipe: 3050, gpExistingPipe: 0, totalPipe: 3050, actPlusPipe: 12418.89, expVarDollar: -972.11, expVarPct: 0.9274, remainPipeNeed: -10357.0333, expDaysNeeded: 345.2344, expBookings: 3.8359, commEarned: 0, commForecast: 0, totalCommPred: 0 },
    "2026-Q2": { monthlyGoal: 23361, actual: 9984.06, actVarDollar: -13376.94, actDaysNeeded: 445.898, actVarPct: 0.4274, actBookingsToGoal: 4.9, gpGroupPipe: 24225, gpExistingPipe: 0, totalPipe: 24225, actPlusPipe: 34209.06, expVarDollar: 10848.06, expVarPct: 1.4644, remainPipeNeed: -20364.8, expDaysNeeded: 678.8267, expBookings: 7.4596, commEarned: 0, commForecast: 363.375, totalCommPred: 363.375 },
    "2026-Q3": { monthlyGoal: 28965, actual: 6592.12, actVarDollar: -22372.88, actDaysNeeded: 745.7627, actVarPct: 0.2276, actBookingsToGoal: 8.1061, gpGroupPipe: 21850, gpExistingPipe: 0, totalPipe: 21850, actPlusPipe: 28442.12, expVarDollar: -522.88, expVarPct: 0.9819, remainPipeNeed: -52726.2667, expDaysNeeded: 1757.5422, expBookings: 19.1037, commEarned: 0, commForecast: 0, totalCommPred: 0 },
    "2026-Q4": { monthlyGoal: 19283, actual: 5107.84, actVarDollar: -14175.16, actDaysNeeded: 472.5053, actVarPct: 0.2649, actBookingsToGoal: 5.1359, gpGroupPipe: 0, gpExistingPipe: 0, totalPipe: 0, actPlusPipe: 5107.84, expVarDollar: -14175.16, expVarPct: 0.2649, remainPipeNeed: -47250.5333, expDaysNeeded: 1575.0178, expBookings: 17.1198, commEarned: 0, commForecast: 0, totalCommPred: 0 },
  },
  },
  {
    id: "matt", name: "Griffith, Matthew", market: "Nashville", annualRevenueGoal: 335016, annualGpGoal: 83754,
    rows:
  {
    "2026-Jan": { monthlyGoal: 3273, actual: 3039.13, actVarDollar: -233.87, actDaysNeeded: 2.1436, actVarPct: 0.9285, actBookingsToGoal: 0.0715, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 3039.13, expVarDollar: -233.87, expVarPct: 0.9285, remainPipeNeed: 233.87, expDaysNeeded: 2.1436, expBookings: 0.0715, commEarned: 151.9565, commForecast: null, totalCommPred: 151.9565 },
    "2026-Feb": { monthlyGoal: 3851, actual: 4586.79, actVarDollar: 735.79, actDaysNeeded: -5.7319, actVarPct: 1.1911, actBookingsToGoal: -0.1911, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 4586.79, expVarDollar: 735.79, expVarPct: 1.1911, remainPipeNeed: -735.79, expDaysNeeded: -5.7319, expBookings: -0.1911, commEarned: 229.3395, commForecast: null, totalCommPred: 229.3395 },
    "2026-Mar": { monthlyGoal: 5022, actual: 6070.23, actVarDollar: 1048.23, actDaysNeeded: -6.2618, actVarPct: 1.2087, actBookingsToGoal: -0.2087, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 6070.23, expVarDollar: 1048.23, expVarPct: 1.2087, remainPipeNeed: -1048.23, expDaysNeeded: -6.2618, expBookings: -0.2087, commEarned: 303.5115, commForecast: null, totalCommPred: 303.5115 },
    "2026-Apr": { monthlyGoal: 5609, actual: 4864.71, actVarDollar: -744.29, actDaysNeeded: 3.9809, actVarPct: 0.8673, actBookingsToGoal: 0.1327, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 4864.71, expVarDollar: -744.29, expVarPct: 0.8673, remainPipeNeed: 744.29, expDaysNeeded: 3.9809, expBookings: 0.1327, commEarned: 243.2355, commForecast: null, totalCommPred: 243.2355 },
    "2026-May": { monthlyGoal: 6466, actual: 3389.11, actVarDollar: -3076.89, actDaysNeeded: 14.2757, actVarPct: 0.5241, actBookingsToGoal: 0.4759, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 3389.11, expVarDollar: -3076.89, expVarPct: 0.5241, remainPipeNeed: 3076.89, expDaysNeeded: 14.2757, expBookings: 0.4759, commEarned: 169.4555, commForecast: null, totalCommPred: 169.4555 },
    "2026-Jun": { monthlyGoal: 11286, actual: 1934.4, actVarDollar: -9351.6, actDaysNeeded: 24.8581, actVarPct: 0.1714, actBookingsToGoal: 0.8286, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 1934.4, expVarDollar: -9351.6, expVarPct: 0.1714, remainPipeNeed: 9351.6, expDaysNeeded: 24.8581, expBookings: 0.8286, commEarned: 96.72, commForecast: null, totalCommPred: 96.72 },
    "2026-Jul": { monthlyGoal: 12452, actual: 1998.88, actVarDollar: -10453.12, actDaysNeeded: 25.1842, actVarPct: 0.1605, actBookingsToGoal: 0.8395, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 1998.88, expVarDollar: -10453.12, expVarPct: 0.1605, remainPipeNeed: 10453.12, expDaysNeeded: 25.1842, expBookings: 0.8395, commEarned: 99.944, commForecast: null, totalCommPred: 99.944 },
    "2026-Aug": { monthlyGoal: 9718, actual: 1620.07, actVarDollar: -8097.93, actDaysNeeded: 24.9988, actVarPct: 0.1667, actBookingsToGoal: 0.8333, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 1620.07, expVarDollar: -8097.93, expVarPct: 0.1667, remainPipeNeed: 8097.93, expDaysNeeded: 24.9988, expBookings: 0.8333, commEarned: 81.0035, commForecast: null, totalCommPred: 81.0035 },
    "2026-Sep": { monthlyGoal: 6795, actual: 0, actVarDollar: -6795, actDaysNeeded: 30, actVarPct: 0, actBookingsToGoal: 1, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: -6795, expVarPct: 0, remainPipeNeed: 6795, expDaysNeeded: 30, expBookings: 1, commEarned: 0, commForecast: null, totalCommPred: 0 },
    "2026-Oct": { monthlyGoal: 8101, actual: 0, actVarDollar: -8101, actDaysNeeded: 30.0, actVarPct: 0, actBookingsToGoal: 1, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: -8101, expVarPct: 0, remainPipeNeed: 8101, expDaysNeeded: 30.0, expBookings: 1, commEarned: 0, commForecast: null, totalCommPred: 0 },
    "2026-Nov": { monthlyGoal: 6060, actual: 0, actVarDollar: -6060, actDaysNeeded: 30, actVarPct: 0, actBookingsToGoal: 1, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: -6060, expVarPct: 0, remainPipeNeed: 6060, expDaysNeeded: 30, expBookings: 1, commEarned: 0, commForecast: null, totalCommPred: 0 },
    "2026-Dec": { monthlyGoal: 5122, actual: 0, actVarDollar: -5122, actDaysNeeded: 30.0, actVarPct: 0, actBookingsToGoal: 1, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: -5122, expVarPct: 0, remainPipeNeed: 5122, expDaysNeeded: 30.0, expBookings: 1, commEarned: 0, commForecast: null, totalCommPred: 0 },
    "2026-Q1": { monthlyGoal: 10421, actual: 13696.15, actVarDollar: 3275.15, actDaysNeeded: null, actVarPct: 1.3143, actBookingsToGoal: null, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 13696.15, expVarDollar: 3275.15, expVarPct: 1.3143, remainPipeNeed: -3275.15, expDaysNeeded: null, expBookings: null, commEarned: 684.8075, commForecast: null, totalCommPred: 684.8075 },
    "2026-Q2": { monthlyGoal: 23361, actual: 10188.22, actVarDollar: -13172.78, actDaysNeeded: null, actVarPct: 0.4361, actBookingsToGoal: null, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 10188.22, expVarDollar: -13172.78, expVarPct: 0.4361, remainPipeNeed: 13172.78, expDaysNeeded: null, expBookings: null, commEarned: 509.411, commForecast: null, totalCommPred: 509.411 },
    "2026-Q3": { monthlyGoal: 28965, actual: 3618.95, actVarDollar: -25346.05, actDaysNeeded: null, actVarPct: 0.1249, actBookingsToGoal: null, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 3618.95, expVarDollar: -25346.05, expVarPct: 0.1249, remainPipeNeed: 25346.05, expDaysNeeded: null, expBookings: null, commEarned: 180.9475, commForecast: null, totalCommPred: 180.9475 },
    "2026-Q4": { monthlyGoal: 19283, actual: 0, actVarDollar: -19283, actDaysNeeded: null, actVarPct: 0, actBookingsToGoal: null, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 0, expVarDollar: -19283, expVarPct: 0, remainPipeNeed: 19283, expDaysNeeded: null, expBookings: null, commEarned: 0, commForecast: null, totalCommPred: 0 },
    "2026-All": { monthlyGoal: 83755, actual: 27503.32, actVarDollar: -56251.68, actDaysNeeded: null, actVarPct: 0.3284, actBookingsToGoal: null, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: 27503.32, expVarDollar: -56251.68, expVarPct: 0.3284, remainPipeNeed: 56251.68, expDaysNeeded: null, expBookings: null, commEarned: 1375.166, commForecast: null, totalCommPred: 1375.166 },
  },
  },
];

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
export const QUARTERS = ["Q1","Q2","Q3","Q4"] as const;

export const KPI_LABELS: Array<{ key: keyof CalcRow; label: string; format: "currency" | "percent" | "number" }> = [
  { key: "monthlyGoal", label: "Monthly GP Goal", format: "currency" },
  { key: "actual", label: "Actual GP Standings", format: "currency" },
  { key: "actVarDollar", label: "Act Variance $ to Goal", format: "currency" },
  { key: "actVarPct", label: "Act Variance % to Goal", format: "percent" },
  { key: "actDaysNeeded", label: "Act # Days Needed to Goal", format: "number" },
  { key: "actBookingsToGoal", label: "Act # Full Month Bookings to Goal", format: "number" },
  { key: "gpGroupPipe", label: "GP in Group Pipeline", format: "currency" },
  { key: "totalPipe", label: "Total Pipeline", format: "currency" },
  { key: "actPlusPipe", label: "Actual + Pipeline GP", format: "currency" },
  { key: "expVarDollar", label: "Exp Variance $ to Goal", format: "currency" },
  { key: "expVarPct", label: "Exp Variance % to Goal", format: "percent" },
  { key: "remainPipeNeed", label: "Remaining Pipeline Need", format: "currency" },
  { key: "commEarned", label: "Commission Earned", format: "currency" },
  { key: "commForecast", label: "Commission Forecast – Pipeline", format: "currency" },
  { key: "totalCommPred", label: "Total Monthly Commission Prediction", format: "currency" },
];
