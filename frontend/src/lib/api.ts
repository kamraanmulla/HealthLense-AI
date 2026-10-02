import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
  UserProfile,
  UserProfileUpdate,
  MeasurementHistoryResponse,
  ReportUploadResponse,
  ReportListItem,
  ReportDetail,
  ReportStatusResponse,
  PaginatedResponse,
  DashboardResponse,
  ParameterTrendResponse,
  ChatResponse,
  ConceptExploreResponse,
  PathwaySearchResponse,
  OptimizationBenchmarkRequest,
  OptimizationBenchmarkResponse,
  LogicEvaluationRequest,
  LogicEvaluationResponse,
  MetricTrajectoryResponse,
  CohortClassifyRequest,
  CohortClassifyResponse,
  ClusterExplorationResponse,
  NLPAnalysisRequest,
  NLPAnalysisResponse,
  AssistantChatRequest,
  AssistantChatResponse,
} from '../types/api';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Token helpers ────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('access_token');
const getRefresh = () => localStorage.getItem('refresh_token');
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ── Interceptors ─────────────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refresh = getRefresh();
      if (!refresh) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post<TokenResponse>('/api/v1/auth/refresh', {
          refresh_token: refresh,
        });
        setTokens(data.access_token, data.refresh_token);
        processQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (e) {
        processQueue(e, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<UserResponse>('/auth/register', data).then((r) => r.data),
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data).then((r) => {
      setTokens(r.data.access_token, r.data.refresh_token);
      return r.data;
    }),
  me: () => api.get<UserResponse>('/auth/me').then((r) => r.data),
  logout: () => {
    clearTokens();
  },
  deactivate: () => api.delete('/auth/me').then((r) => r.data),
};

// ── Profile API ──────────────────────────────────────────────────────────────

export const profileApi = {
  get: () => api.get<UserProfile>('/profile').then((r) => r.data),
  update: (data: UserProfileUpdate) =>
    api.put<UserProfile>('/profile', data).then((r) => r.data),
  getMeasurements: (type: string = 'weight') =>
    api.get<MeasurementHistoryResponse>(`/profile/measurements/${type}`).then((r) => r.data),
};

// ── Reports API ──────────────────────────────────────────────────────────────

export const reportsApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<ReportUploadResponse>('/reports/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  list: (page = 1, perPage = 10, status?: string, search?: string) => {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (status) params.status = status;
    if (search) params.search = search;
    return api
      .get<PaginatedResponse<ReportListItem>>('/reports/', { params })
      .then((r) => r.data);
  },
  get: (id: string) =>
    api.get<ReportDetail>(`/reports/${id}`).then((r) => r.data),
  status: (id: string) =>
    api.get<ReportStatusResponse>(`/reports/${id}/status`).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/reports/${id}`).then((r) => r.data),
  exportPdf: (id: string) =>
    api.get(`/reports/${id}/export/pdf`, { responseType: 'blob' }).then((r) => r.data),
  chat: (id: string, question: string) =>
    api.post<ChatResponse>(`/reports/${id}/chat`, { question }).then((r) => r.data),
};

// ── Dashboard API ────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: () => api.get<DashboardResponse>('/dashboard').then((r) => r.data),
};

// ── Trends API ───────────────────────────────────────────────────────────────

export const trendsApi = {
  get: (parameter: string) =>
    api.get<ParameterTrendResponse>(`/health/trends/${parameter}`).then((r) => r.data),
};

// ── Insights & Advanced Analytics API ────────────────────────────────────────

export const insightsApi = {
  exploreKnowledgeGraph: (concept = 'Cardiovascular', target?: string, mode = 'breadth', report_id?: string) => {
    const params: Record<string, string> = { concept, mode };
    if (target) params.target = target;
    if (report_id) params.report_id = report_id;
    return api
      .get<ConceptExploreResponse>('/insights/knowledge-graph/explore', { params })
      .then((r) => r.data);
  },
  navigatePathway: (startPanel = 'Patient Intake', targetMarker = 'Serum Creatinine', strategy = 'optimal') => {
    const params = { start_panel: startPanel, target_marker: targetMarker, strategy };
    return api
      .get<PathwaySearchResponse>('/insights/search/pathway', { params })
      .then((r) => r.data);
  },
  runOptimization: (payload: OptimizationBenchmarkRequest) =>
    api
      .post<OptimizationBenchmarkResponse>('/insights/optimization/benchmark', payload)
      .then((r) => r.data),
  explainLogic: (payload: LogicEvaluationRequest) =>
    api
      .post<LogicEvaluationResponse>('/insights/logic/explain', payload)
      .then((r) => r.data),
  getTrajectory: (parameter: string) =>
    api
      .get<MetricTrajectoryResponse>(`/insights/trends/trajectory/${encodeURIComponent(parameter)}`)
      .then((r) => r.data),
  classifyCohort: (payload: CohortClassifyRequest) =>
    api
      .post<CohortClassifyResponse>('/insights/cohort/classify', payload)
      .then((r) => r.data),
  exploreClusters: (clusters = 3, source: 'user' | 'demo' = 'user') =>
    api
      .get<ClusterExplorationResponse>('/insights/clustering/cohorts', { params: { clusters, source } })
      .then((r) => r.data),
  analyzeNLP: (payload: NLPAnalysisRequest) =>
    api
      .post<NLPAnalysisResponse>('/insights/nlp/analyze', payload)
      .then((r) => r.data),
};

// ── Conversational AI Assistant API ──────────────────────────────────────────

export const assistantApi = {
  chat: (data: AssistantChatRequest) =>
    api.post<AssistantChatResponse>('/assistant/chat', data).then((r) => r.data),
};

export { getToken, clearTokens, setTokens };
export default api;
