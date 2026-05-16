export interface RecommendationConfidenceInput {
  sampleSize: number;
  signalStrength: number;
  consistency: number;
  severity?: number;
}
