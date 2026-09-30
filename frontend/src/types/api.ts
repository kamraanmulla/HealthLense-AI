// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name?: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  user_id: number;
  full_name?: string | null;
  age: number | null;
  dob: string | null;
  gender: string | null;
  height: number | null;
  height_unit: string | null;
  weight: number | null;
  weight_unit: string | null;
  bmi: number | null;
  medical_conditions: string | null;
  previous_surgeries: string | null;
  allergies: string | null;
  medications: string | null;
  family_history: string | null;
  major_medical_events: string | null;
  activity_level: string | null;
  exercise_frequency: string | null;
  sleep_information: string | null;
  smoking_status: string | null;
  alcohol_consumption: string | null;
  health_concerns: string | null;
  health_goals: string | null;
  dietary_preference: string | null;
  onboarding_completed: boolean;
  weight_history?: MeasurementHistoryPoint[];
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  age?: number | null;
  dob?: string | null;
  gender?: string | null;
  height?: number | null;
  height_unit?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  bmi?: number | null;
  medical_conditions?: string | null;
  previous_surgeries?: string | null;
  allergies?: string | null;
  medications?: string | null;
  family_history?: string | null;
  major_medical_events?: string | null;
  activity_level?: string | null;
  exercise_frequency?: string | null;
  sleep_information?: string | null;
  smoking_status?: string | null;
  alcohol_consumption?: string | null;
  health_concerns?: string | null;
  health_goals?: string | null;
  dietary_preference?: string | null;
  onboarding_completed?: boolean;
}

export interface MeasurementHistoryPoint {
  id: number;
  value: number;
  unit: string;
  recorded_at: string;
}

export interface MeasurementHistoryResponse {
  measurement_type: string;
  current_value: number | null;
  current_unit: string | null;
  points: MeasurementHistoryPoint[];
}

// ── Reports ──────────────────────────────────────────────────────────────────

export interface ReportUploadResponse {
  id: string;
  status: string;
  message: string;
}

export interface ReportListItem {
  id: string;
  original_filename: string;
  file_type: string;
  status: string;
  health_score: number | null;
  risk_level: string | null;
  created_at: string;
}

export interface ReportParameter {
  id: number;
  name: string;
  value: number | null;
  unit: string | null;
  reference_min: number | null;
  reference_max: number | null;
  reference_text: string | null;
  status: string;
  confidence_score?: number | null;
}

export interface AbnormalParameter {
  test_name: string;
  result: number | string | null;
  range: string | null;
  status: string;
}

export interface HealthInsight {
  insight: string;
}

export interface Recommendation {
  recommendation: string;
}

export interface ScoreExplanation {
  parameter: string;
  patient_value: number | string | null;
  reference_range: string | null;
  severity: string;
  score_impact: number;
  explanation: string;
}

export interface Condition {
  id: string;
  name: string;
  confidence: number;
  severity: string;
  evidence: string[];
  explanation: string;
  recommended_specialist: string;
  urgency: string;
  recommended_tests: string[];
}

export interface AIHealthSummary {
  overall_summary: string;
  key_findings: string[];
  lifestyle_recommendations: string[];
  dietary_guidance: string[];
  doctor_discussion_points: string[];
  medical_disclaimer: string;
}

// ── ML Anomaly Detection ─────────────────────────────────────────────────────

export interface LongitudinalChange {
  parameter: string;
  current_value: number;
  previous_value: number | null;
  absolute_change: number | null;
  percentage_change: number | null;
  direction: string | null;
  number_of_previous_reports: number;
}

export interface MLAnomalyDetectionResult {
  anomaly_detected: boolean;
  anomaly_level: string;  // 'normal' | 'low' | 'medium' | 'high' | 'unavailable'
  anomaly_score: number | null;
  affected_parameters: string[];
  reason: string;
  model_version: string;
  analysis_type: string;
  parameters_analyzed: string[];
  longitudinal_changes?: LongitudinalChange[];
  disclaimer: string;
}

export interface AIAnalysisResult {
  health_score: number;
  health_grade?: string;
  risk_level: string;
  confidence_pct?: number;
  score_explanation?: (string | ScoreExplanation)[];
  summary: string;
  patient_info: Record<string, unknown>;
  detected_diseases?: string[];
  detected_conditions?: Condition[];
  ml_anomaly_detection?: MLAnomalyDetectionResult;
  ai_health_summary?: AIHealthSummary;
  top_risks?: string[];
  abnormal_parameters: AbnormalParameter[];
  personalized_health_insights: HealthInsight[];
  lifestyle_advice?: string[];
  diet_suggestions?: string[];
  exercise_suggestions?: string[];
  recommendations: Recommendation[];
  immediate_attention?: string[];
  doctor_recommendation?: string;
  follow_up_tests?: string[];
  long_term_monitoring?: string[];
  preventive_advice?: string[];
}

export interface ReportDetail {
  id: string;
  user_id: number;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  status: string;
  error_message: string | null;
  health_score: number | null;
  health_grade: string | null;
  risk_level: string | null;
  confidence_pct: number | null;
  ai_result: AIAnalysisResult | null;
  parameters: ReportParameter[];
  created_at: string;
  updated_at: string | null;
}

export interface ReportStatusResponse {
  id: string;
  status: string;
  health_score: number | null;
  health_grade: string | null;
  risk_level: string | null;
  confidence_pct: number | null;
  error_message: string | null;
  progress?: number;
  processing_stage?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface RiskDistribution {
  low: number;
  moderate: number;
  high: number;
}

export interface ParameterStatusSummary {
  total: number;
  normal: number;
  low: number;
  high: number;
}

export interface DashboardStats {
  total_reports: number;
  completed_reports: number;
  average_health_score: number | null;
  latest_health_score: number | null;
  latest_risk_level: string | null;
  risk_distribution: RiskDistribution;
  parameter_summary: ParameterStatusSummary;
}

export interface HealthTimelinePoint {
  report_id: string;
  date: string;
  health_score: number;
  risk_level: string;
}

export interface ParameterTrendPoint {
  report_id: string;
  date: string;
  value: number;
  status: string;
}

export interface ParameterTrend {
  name: string;
  unit: string | null;
  points: ParameterTrendPoint[];
}

export interface DashboardResponse {
  health_score: number | null;
  risk_level: string | null;
  profile_completion: number;
  health_summary: string | null;
  attention_required: string[];
  improving_parameters: string[];
  declining_parameters: string[];
  recent_reports: number;
  latest_insights: HealthInsight[];
  recommendations: Recommendation[];
  stats: DashboardStats;
  health_timeline: HealthTimelinePoint[];
  parameter_trends: ParameterTrend[];
}

// ── Health Trends ────────────────────────────────────────────────────────────

export interface TrendPoint {
  report_id: string;
  date: string;
  value: number;
  status: string;
  unit?: string | null;
  reference_min?: number | null;
  reference_max?: number | null;
  reference_range?: string | null;
}

export interface ParameterTrendResponse {
  parameter: string;
  canonical_name?: string | null;
  unit: string | null;
  reference_range?: string | null;
  reference_min?: number | null;
  reference_max?: number | null;
  latest_value?: number | null;
  latest_date?: string | null;
  total_measurements: number;
  trend: string;
  points: TrendPoint[];
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  disclaimer: string;
}
