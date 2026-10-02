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
  data_foundation?: {
    data_quality_score: number;
    total_observations_found: number;
    outliers_flagged: number;
    missing_rate: number;
    descriptive_stats?: Record<string, unknown>;
  } | null;
  rule_engine_findings?: {
    fired_rules_count: number;
    input_facts_count: number;
    fired_rules: Array<{
      name: string;
      rule_id?: string;
      supporting_facts?: string[];
      recommendation?: string;
    }>;
  } | null;
  knowledge_graph_context?: {
    linked_concepts: string[];
    related_nodes_count: number;
  } | null;
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

export interface KeyBiomarker {
  name: string;
  display_name: string;
  value: number;
  unit: string;
  reference_range: string;
  status: string;
  min_ref?: number | null;
  max_ref?: number | null;
  category?: string | null;
}

export interface HealthCategoryBreakdown {
  metabolic: number;
  cardiovascular: number;
  nutritional: number;
  lifestyle: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  time_ago: string;
  type: 'report' | 'analysis' | 'profile' | 'insight';
  timestamp: string;
}

export interface DashboardRecentReport {
  id: string;
  name: string;
  date: string;
  status: string;
  health_score: number | null;
  risk_level: string | null;
}

export interface NextCheckupInfo {
  date_str: string;
  days_left: number;
  recommendation: string;
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
  key_biomarkers?: KeyBiomarker[];
  health_score_breakdown?: HealthCategoryBreakdown;
  recent_activity?: RecentActivityItem[];
  recent_reports_list?: DashboardRecentReport[];
  total_biomarkers?: number;
  next_checkup?: NextCheckupInfo | null;
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

// ── Advanced Insights & Experiment Schemas ───────────────────────────────────

export interface ConceptExploreResponse {
  start_concept: string;
  target_concept?: string | null;
  traversal_mode: string;
  connected_path: string[];
  distance_hops: number;
  concepts_visited: number;
  network_structure: Array<{
    node: string;
    depth?: number;
    parent?: string | null;
    relation?: string | null;
    order?: number;
    explanation?: string | null;
  }>;
  educational_disclaimer: string;
}

export interface PathwaySearchResponse {
  strategy: string;
  start_panel: string;
  target_marker: string;
  path: string[];
  total_transition_cost: number;
  stages_evaluated: number;
  path_found: boolean;
  educational_disclaimer: string;
}

export interface OptimizationBenchmarkRequest {
  algorithm_type: 'annealing' | 'climbing';
  initial_values?: number[];
  max_steps?: number;
}

export interface OptimizationBenchmarkResponse {
  optimizer_type: string;
  calibrated_parameters: number[];
  final_objective_score: number;
  initial_score: number;
  steps_taken: number;
  convergence_profile: number[];
  technical_note: string;
}

export interface LogicEvaluationRequest {
  report_id?: string;
  custom_facts?: Record<string, boolean>;
  hypothesis_goal?: string;
}

export interface LogicEvaluationResponse {
  mode: string;
  hypothesis?: string | null;
  hypothesis_confirmed: boolean;
  findings_explained: Array<{
    fact: string;
    value: boolean;
    source: string;
    rule_id?: string | null;
    explanation?: string | null;
    supporting_facts?: string[];
  }>;
  rules_applied: string[];
  transparent_audit_trace: string[];
  missing_information: string[];
  educational_summary: string;
  has_sufficient_data?: boolean;
  insufficient_reason?: string | null;
  report_id_evaluated?: string | null;
}

export interface MetricTrajectoryResponse {
  parameter_name: string;
  total_observations: number;
  data_quality_score: number;
  missing_rate: number;
  has_sufficient_data?: boolean;
  insufficient_data_reason?: string | null;
  descriptive_statistics: {
    count?: number;
    mean?: number | null;
    std?: number | null;
    min?: number | null;
    q25?: number | null;
    median?: number | null;
    q75?: number | null;
    max?: number | null;
    iqr?: number | null;
    variance?: number | null;
  };
  trajectory?: {
    slope: number;
    intercept: number;
    r2_score: number;
    mae: number;
    rmse: number;
    direction: string;
    note: string;
  } | null;
  data_points: Array<{
    date?: string | null;
    name?: string;
    value?: number;
    unit?: string;
    status?: string;
    is_valid?: boolean;
    normalized_value?: number;
  }>;
  fitted_points?: Array<{
    x: number;
    fitted_y: number;
    date?: string;
    actual_value?: number;
    fitted_value?: number;
  }> | null;
  educational_disclaimer: string;
}

export interface CohortClassifyRequest {
  classifier_type: 'tree' | 'knn';
  sample_size?: number;
}

export interface CohortClassifyResponse {
  classifier: string;
  accuracy_score: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  confusion_matrix: number[][];
  evaluation_samples: number;
  transparent_decision_rules?: string | null;
  educational_disclaimer: string;
}

export interface ClusterGroupProfile {
  group_id: number;
  sample_count: number;
  cohort_share_pct: number;
  biomarker_centroids: number[];
}

export interface ClusterExplorationResponse {
  group_count: number;
  total_cohort_samples: number;
  biomarker_names: string[];
  cohesion_inertia: number;
  cohort_profiles: ClusterGroupProfile[];
  educational_disclaimer: string;
  is_synthetic?: boolean;
  has_sufficient_data?: boolean;
  insufficient_reason?: string | null;
  data_source?: string;
  scatter_points?: Array<{
    x: number;
    y: number;
    cluster_id: number;
    label?: string;
    point_id?: number;
    report_name?: string;
    values?: Record<string, number>;
  }>;
  feature_x_label?: string;
  feature_y_label?: string;
  pca_applied?: boolean;
  pca_explained_variance?: number[] | null;
}

export interface NLPAnalysisRequest {
  text: string;
  report_id?: string;
}

export interface NLPAnalysisResponse {
  original_text: string;
  normalized_text: string;
  token_count: number;
  sentence_count?: number;
  entities_found?: number;
  primary_intent?: string;
  intent_confidence?: number;
  grounded_prompt?: string;
  cleaned_tokens: string[];
  identified_biomarkers: string[];
  identified_units: string[];
  query_intent: string;
  grounded_context_prompt: string;
  grounded_parameters_count: number;
  entities?: Array<{
    text: string;
    category: string;
    start_char: number;
    end_char: number;
  }>;
  educational_disclaimer: string;
}

// ── Conversational AI Assistant ──────────────────────────────────────────────

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatRequest {
  question: string;
  report_id?: string;
  history?: AssistantMessage[];
}

export interface AssistantChatResponse {
  reply: string;
  classified_intent: string;
  referenced_biomarkers: string[];
  is_report_specific: boolean;
  grounded_parameters_count: number;
  disclaimer: string;
}
