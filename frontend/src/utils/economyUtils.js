export function applyGoldPassDiscount(economyData) {
  const discountMultiplier = economyData.has_gold_pass ? 0.8 : 1;

  return {
    ...economyData,
    total_gold_needed: Math.round(economyData.total_gold_needed * discountMultiplier),
    total_time_seconds: economyData.total_time_seconds * discountMultiplier,
  };
}
