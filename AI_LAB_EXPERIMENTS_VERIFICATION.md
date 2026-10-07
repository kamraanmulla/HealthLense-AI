# HealthLens AI — AI Lab Experiments Verification & Viva Guide

This document cross-verifies all **9 AI Laboratory syllabus experiments** integrated natively into **HealthLens AI**. Every experiment operates genuinely within the clinical report analysis pipeline and interactive AI Lab intelligence hub.

---

## 📋 Comprehensive Cross-Verification Matrix

| Exp | Syllabus Requirement | HealthLens AI Representation | Status | Exact Backend Files & Symbols | Frontend UI & Interactive Location |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | **Introduction to AI & Python Environment**<br>(NumPy, Pandas, Matplotlib, data handling) | Vectorized biomarker cleaning, unit standardization, descriptive statistics, and Matplotlib distribution plots | ✅ **Fully Implemented** | [`DataFoundationService`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp1_data_foundation.py)<br>• `validate_and_clean_measurements()`<br>• `compute_descriptive_statistics()`<br>• `generate_distribution_plot_base64()` | `/insights` → **Exp 1: Data Foundation Panel**<br>• Data Quality Score Box<br>• Parameters Table<br>• Matplotlib Distribution Chart |
| **2** | **Uninformed Search Algorithms**<br>(BFS & DFS graph traversal) | Ontological medical knowledge graph: Biomarker → Organ System → Health Concern → Recommended Follow-up | ✅ **Fully Implemented** | [`MedicalKnowledgeGraph`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp2_graph_traversal.py)<br>• `breadth_first_search()` (FIFO Queue)<br>• `depth_first_search()` (LIFO Stack) | `/insights` → **Exp 2: Knowledge Graph Panel**<br>• Interactive concept picker<br>• BFS/DFS mode toggle<br>• Traversal node sequence & hops |
| **3** | **Informed Search Techniques**<br>(Greedy Best-First & A* Search) | Laboratory panel & biomarker pathway navigation in 2D conceptual space with Euclidean heuristics | ✅ **Fully Implemented** | [`MedicalSearchRouter`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp3_informed_search.py)<br>• `a_star_search()` ($f = g + h$ PriorityQueue)<br>• `greedy_best_first_search()` ($h$) | `/insights` → **Exp 3: Pathway Search Panel**<br>• Stage routing selector<br>• Cost & node expansion metrics<br>• Optimal path visualization |
| **4** | **Local Search Algorithms**<br>(Hill Climbing & Simulated Annealing) | Technical curve fitting & synthetic optical sensor calibration benchmark | ✅ **Fully Implemented** | [`ParameterOptimizer`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp4_local_search.py)<br>• `hill_climbing()` (Steepest descent)<br>• `simulated_annealing()` (Metropolis $P=e^{-\Delta E/T}$) | `/insights` → **Exp 4: Optimization Panel**<br>• Step count slider<br>• Algorithm switcher<br>• Convergence trajectory curve |
| **5** | **Reasoning Techniques**<br>(Forward & Backward Chaining) | Deterministic expert system evaluating clinical indicators with audit proof traces & sub-goal validation | ✅ **Fully Implemented** | [`RuleEngine`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp5_rule_engine.py)<br>• `forward_chain()` (Fixed-point derivation)<br>• `backward_chain()` (Goal recursion) | `/insights` → **Exp 5: Rule Engine Panel**<br>• Custom fact toggles<br>• Hypothesis verifier<br>• Step-by-step firing audit log |
| **6** | **Machine Learning: Regression**<br>(Linear Regression & Trend Modeling) | Ordinary Least Squares regression over dated patient observations to estimate longitudinal biomarker trajectory | ✅ **Fully Implemented** | [`TrendRegressionService`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp6_regression.py)<br>• `train_and_evaluate()`<br>• `fit_longitudinal_trajectory()` | `/insights` → **Exp 6: Trend Regression Panel**<br>• Interactive biomarker selector<br>• Fitted line ($y = mx + b$)<br>• MAE, MSE, RMSE, R² scores |
| **7** | **Classification Algorithms**<br>(k-NN & Decision Tree) | Multi-marker demographic and metabolic pattern classification with explainable split trees | ✅ **Fully Implemented** | [`HealthPatternClassifier`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp7_classification.py)<br>• `train_knn()` (StandardScaler + Euclidean)<br>• `train_decision_tree()` (Gini split tree) | `/insights` → **Exp 7: Classification Panel**<br>• Classifier switcher<br>• Confusion matrix table<br>• Accuracy, Precision, Recall, F1 |
| **8** | **Clustering Techniques**<br>(K-Means Clustering) | Unsupervised biomarker observation grouping with standard scaling, centroid calculation & 2D PCA projection | ✅ **Fully Implemented** | [`CohortClusterService`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp8_clustering.py)<br>• `fit_clusters()` (KMeans + PCA)<br>• `build_user_observation_matrix()` | `/insights` → **Exp 8: Clustering Panel**<br>• Cluster slider ($k=2..5$)<br>• User data / Demo toggle<br>• 2D PCA scatter plot & centroids |
| **9** | **NLP & AI Application Development**<br>(Clinical NLP + Gemini Assistant) | Lexical tokenization, clinical entity extraction, query intent classification, and grounded Gemini AI generation | ✅ **Fully Implemented** | [`ClinicalNLPEngine`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp9_nlp_engine.py)<br>[`GeminiProvider`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/services/ai/gemini_provider.py)<br>• `tokenize()`, `extract_clinical_entities()`<br>• `build_grounded_assistant_prompt()` | `/insights` → **Exp 9: Clinical NLP Panel**<br>• Interactive query tester<br>• Token & entity inspector<br>• Intent badge & grounded prompt<br>• `/assistant` full chat app |

---

## 🔬 Detailed Experiment Breakdown

### Experiment 1: Introduction to AI & Python Environment
* **Aim**: Configure Python environment and perform data handling, numerical computation, and statistical visualization.
* **Objective**: Process extracted laboratory measurements, handle missing values, standardize units, compute descriptive statistics, and plot distribution curves.
* **Algorithm / Libraries**: **NumPy** (`np.mean`, `np.std`, `np.percentile`, `np.isnan`), **Pandas** (`pd.DataFrame`, `pd.to_numeric`), **Matplotlib** (`matplotlib.pyplot` in headless `Agg` mode).
* **Implementation**: [`DataFoundationService`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp1_data_foundation.py) in `backend/app/experiments/exp1_data_foundation.py`.
* **Input**: List of raw extracted parameters `[{"name": "Hemoglobin", "value": "14.2", "unit": "g/dL"}, ...]`.
* **Output**: Verified DataFrame, audit statistics (total, valid, missing, data quality score %), descriptive stats (Mean, Median, Std, IQR, Min, Max), and a base64-encoded Matplotlib PNG chart.
* **Where Used in HealthLens AI**: Runs on every report upload in [`report_service.py`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/services/report_service.py#L126) and displayed in the **Data Foundation Panel** on `/insights`.
* **Viva Q&A**:
  * *Q: Why use NumPy and Pandas instead of standard Python lists?*
  * *A: Vectorized numerical processing allows instant type-coercion, robust missing value handling (`NaN`), percentiles/IQR calculation without explicit loops, and seamless scaling.*

---

### Experiment 2: Uninformed Search Algorithms (BFS & DFS)
* **Aim**: Implement Breadth-First Search (BFS) and Depth-First Search (DFS) on a knowledge graph.
* **Objective**: Traverse educational medical ontology linking **Biomarkers → Organ Systems → Possible Health Concerns → Recommended Follow-ups**.
* **Algorithm**:
  * **BFS**: Uses a FIFO queue (`collections.deque`), guarantees the shortest path (unweighted hops), level-order exploration.
  * **DFS**: Uses a LIFO stack, explores deep thematic branches, detects cycles.
* **Implementation**: [`MedicalKnowledgeGraph`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp2_graph_traversal.py) in `backend/app/experiments/exp2_graph_traversal.py`.
* **Input**: `start_node` (e.g. `"Fasting Glucose"`), optional `target_node` (e.g. `"Fasting Re-test & Nutritional Counseling"`), `mode` (`"breadth"` or `"depth"`).
* **Output**: `BFSResult` / `DFSResult` containing `path`, `distance`, `visited_count`, and `traversal_tree`.
* **Where Used in HealthLens AI**: Embedded in [`report_service.py`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/services/report_service.py#L158) to map patient biomarkers to physiological systems and available on `/insights` under Knowledge Graph.
* **Viva Q&A**:
  * *Q: When would BFS be preferred over DFS in medical knowledge exploration?*
  * *A: BFS is preferred when we want the shortest and most direct link between a biomarker and its immediate physiological panel (minimal hops).*

---

### Experiment 3: Informed Search Techniques (Greedy Best-First & A*)
* **Aim**: Implement heuristic-driven search algorithms.
* **Objective**: Navigate laboratory panel routing from patient intake to target biomarkers with minimum transition complexity.
* **Algorithm**:
  * **Greedy Best-First**: Prioritizes strictly lowest heuristic $h(n)$.
  * **A\* Search**: Evaluates $f(n) = g(n) + h(n)$ where $g(n)$ is actual cost and $h(n)$ is admissible Euclidean distance in 2D conceptual space.
* **Implementation**: [`MedicalSearchRouter`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp3_informed_search.py) in `backend/app/experiments/exp3_informed_search.py`.
* **Input**: `start_panel` (e.g. `"Patient Intake"`), `target_marker` (e.g. `"Serum Creatinine"`), `strategy` (`"optimal"` or `"directed"`).
* **Output**: `SearchResult` containing optimal route, total transition cost, and node expansion count.
* **Where Used in HealthLens AI**: Interactive pathway navigation router on `/insights` (Pathway Search Panel).
* **Viva Q&A**:
  * *Q: What makes the heuristic in A* admissible?*
  * *A: The Euclidean distance between conceptual coordinates never overestimates the actual edge transition cost ($h(n) \le h^*(n)$), ensuring A* always finds the optimal path.*

---

### Experiment 4: Local Search Algorithms (Hill Climbing & Simulated Annealing)
* **Aim**: Implement iterative local optimization algorithms.
* **Objective**: Find optimal parameters for technical curve fitting and synthetic sensor calibration without altering clinical rules.
* **Algorithm**:
  * **Hill Climbing**: Evaluates orthogonal neighbor steps ($\pm \text{step\_size}$) and terminates at local optima when no neighbor improves objective score.
  * **Simulated Annealing**: Stochastic search with geometric cooling ($T = T \times \alpha$) accepting worsening moves with Metropolis probability $P = \exp(-\Delta E / T)$ to escape local minima.
* **Implementation**: [`ParameterOptimizer`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp4_local_search.py) in `backend/app/experiments/exp4_local_search.py`.
* **Input**: Initial parameter state (e.g. `[1.5, -1.5]`), `max_iterations`, `step_size`.
* **Output**: `OptimizationResult` with calibrated parameters, final loss score, iterations taken, and convergence history profile.
* **Where Used in HealthLens AI**: Calibration benchmark module on `/insights` (Optimization Panel).
* **Viva Q&A**:
  * *Q: Why is local search kept isolated from medical diagnosis?*
  * *A: Clinical diagnostic bounds and reference intervals must be strictly deterministic and clinically validated; stochastic optimization is appropriate only for non-clinical sensor calibration.*

---

### Experiment 5: Reasoning Techniques (Forward & Backward Chaining)
* **Aim**: Build an explainable rule-based expert system.
* **Objective**: Derive clinical indicators from verified lab facts and verify hypotheses using goal-directed search.
* **Algorithm**:
  * **Forward Chaining**: Data-driven, bottom-up inference iterating through rules until fixed-point saturation.
  * **Backward Chaining**: Goal-directed, top-down recursion with cycle detection and missing-fact identification.
* **Implementation**: [`RuleEngine`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp5_rule_engine.py) in `backend/app/experiments/exp5_rule_engine.py`.
* **Input**: Known lab facts (e.g. `{"hemoglobin_low": True, "mcv_low": True, "ferritin_low": True}`).
* **Output**: `InferenceResult` with derived facts, fired rules list, and transparent audit trace.
* **Where Used in HealthLens AI**: Directly in [`report_service.py`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/services/report_service.py#L130) to evaluate patient reports and on `/insights` under Rule Engine.
* **Viva Q&A**:
  * *Q: What is the main difference between forward and backward chaining?*
  * *A: Forward chaining starts with known lab values to infer all possible health indicators; backward chaining starts with a hypothesis (e.g. "Does the user show an iron deficiency pattern?") and searches backwards for supporting facts.*

---

### Experiment 6: Machine Learning — Regression
* **Aim**: Implement Linear Regression for numerical trend modeling.
* **Objective**: Model the mathematical trajectory of longitudinal biomarker observations over time and compute standard evaluation metrics.
* **Algorithm**: Scikit-learn `LinearRegression`, Ordinary Least Squares closed-form solution ($y = Xw + b$).
* **Implementation**: [`TrendRegressionService`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp6_regression.py) in `backend/app/experiments/exp6_regression.py`.
* **Metrics Computed**: Mean Absolute Error (MAE), Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and Coefficient of Determination ($R^2$).
* **Where Used in HealthLens AI**: Longitudinal trajectory endpoint `/api/v1/insights/trends/trajectory/{parameter}` and Trend Panel on `/insights`.
* **Viva Q&A**:
  * *Q: What does an $R^2$ score of 0.85 indicate?*
  * *A: 85% of the variance in the observed biomarker values is explained by time in the linear model.*

---

### Experiment 7: Classification Algorithms (k-NN & Decision Trees)
* **Aim**: Implement supervised classification and evaluate with standard metrics.
* **Objective**: Classify multi-biomarker patterns and generate human-readable decision logic trees.
* **Algorithm**:
  * **k-Nearest Neighbors (k-NN)**: Distance-based classification with `StandardScaler` and Euclidean metric.
  * **Decision Tree**: Tree induction using Gini impurity criterion and depth constraints for interpretability.
* **Implementation**: [`HealthPatternClassifier`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp7_classification.py) in `backend/app/experiments/exp7_classification.py`.
* **Metrics Computed**: Accuracy, Precision, Recall, F1-Score, and full Confusion Matrix.
* **Where Used in HealthLens AI**: Cohort classification benchmark on `/insights` (Classification Panel).
* **Viva Q&A**:
  * *Q: Why is feature scaling essential for k-NN but not for Decision Trees?*
  * *A: k-NN relies on Euclidean distances, so features with larger ranges would dominate without scaling. Decision Trees split one feature at a time based on rank thresholds, making them scale-invariant.*

---

### Experiment 8: Clustering Techniques (K-Means Clustering)
* **Aim**: Implement unsupervised clustering to segment patient observations.
* **Objective**: Group multi-marker observations into neutral geometric clusters and visualize via Principal Component Analysis (PCA).
* **Algorithm**: Scikit-learn `KMeans` with k-means++ centroid initialization, `StandardScaler`, and `PCA(n_components=2)`.
* **Implementation**: [`CohortClusterService`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp8_clustering.py) in `backend/app/experiments/exp8_clustering.py`.
* **Output**: Within-cluster sum of squares (Inertia), centroid profiles in original biological units, and 2D scatter coordinates.
* **Where Used in HealthLens AI**: Real user report clustering and educational demo on `/insights` (K-Means Clustering Panel).
* **Viva Q&A**:
  * *Q: Why are clusters labeled as "Cluster 0, Cluster 1" instead of disease names?*
  * *A: Unsupervised clustering groups data points by mathematical geometric proximity in feature space; assigning clinical disease labels without clinical validation would be methodologically incorrect.*

---

### Experiment 9: NLP & Generative AI Application
* **Aim**: Develop an end-to-end NLP and AI-assisted conversational healthcare application.
* **Objective**: Preprocess medical report text, tokenize clinical entities, classify query intent, and generate grounded answers using Google Gemini without hallucinations.
* **Algorithm**:
  * Lexical normalization & regex boundary tokenization.
  * Biomedical named-entity extraction (biomarkers & standard units).
  * Rule-based query intent classification (`explanation`, `range_query`, `trend_inquiry`, `general_health`).
  * Grounded context prompt synthesis binding Google Gemini strictly to verified patient parameters.
* **Implementation**:
  * [`ClinicalNLPEngine`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/experiments/exp9_nlp_engine.py)
  * [`GeminiProvider`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/backend/app/services/ai/gemini_provider.py)
  * [`Assistant.tsx`](file:///c:/Users/Kamraan%20Mulla/OneDrive/Desktop/HealthLense%20AI/frontend/src/pages/Assistant.tsx)
* **Where Used in HealthLens AI**: Full AI Health Assistant (`/assistant`), report explanation generator, and interactive NLP panel on `/insights`.
* **Viva Q&A**:
  * *Q: How does HealthLens AI prevent LLM hallucinations on lab reports?*
  * *A: The Clinical NLP Engine extracts and verifies laboratory values deterministically first, then constructs a grounded prompt with explicit negative constraints instructing the model to rely only on verified values.*

---

## 🚀 Test Execution & Verification Log

All test suites were executed cleanly in the project environment:

```bash
# 1. AI Laboratory Experiment Suite (19 automated tests)
backend\.venv\Scripts\python.exe -m pytest tests/test_experiments.py -v
# Result: 19 PASSED in 6.17s

# 2. Insights & Advanced Analytics API Suite (10 integration tests)
backend\.venv\Scripts\python.exe -m pytest tests/test_api_v1_insights.py -v
# Result: 10 PASSED in 8.65s

# 3. Machine Learning Population Anomaly Detection (11 validation checks)
backend\.venv\Scripts\python.exe test_ml_integration.py
# Result: ALL 11 VALIDATION TESTS PASSED CLEANLY

# 4. Frontend Production Build & TypeScript Verification
npm run build (in frontend/)
# Result: ✓ 3233 modules transformed, 0 errors, built in 1.97s
```
