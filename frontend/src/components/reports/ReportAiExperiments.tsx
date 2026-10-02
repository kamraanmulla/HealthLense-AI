import { Link } from 'react-router-dom';
import type { AIAnalysisResult } from '../../types/api';
import GlassCard from '../ui/GlassCard';
import {
  Binary,
  BookOpen,
  Network,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface ReportAiExperimentsProps {
  aiResult?: AIAnalysisResult | null;
  reportId?: string;
}

export default function ReportAiExperiments({ aiResult, reportId }: ReportAiExperimentsProps) {
  if (!aiResult) return null;

  const dataFoundation = aiResult.data_foundation;
  const ruleEngine = aiResult.rule_engine_findings;
  const knowledgeGraph = aiResult.knowledge_graph_context;

  // If none of the 3 experiments have data, don't render empty box
  if (!dataFoundation && !ruleEngine && !knowledgeGraph) {
    return null;
  }

  const qualityScore = dataFoundation?.data_quality_score ?? 0;
  const qualityPct = Math.round(qualityScore * 100);

  return (
    <div className="space-y-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
            <Binary className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#172033] tracking-tight">
              Report Intelligence Pipeline
            </h2>
            <p className="text-xs text-[#64748B]">
              Integrated AI Syllabus Experiments: Data Cleaning, Ontological Mapping & Rule-Based Reasoning
            </p>
          </div>
        </div>
        <Link
          to="/insights"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] hover:text-[#15803D] hover:underline"
        >
          <span>All 6 AI Experiments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exp 1: Data Foundation */}
        <GlassCard className="p-5 bg-white border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                Exp 1: Data Foundation
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">
                NumPy / Pandas
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#172033] mb-2">
              Parameter Quality & Normalization
            </h3>

            {dataFoundation ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">Quality Score</span>
                    <span className="font-bold text-[#16A34A]">{qualityPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#16A34A] transition-all"
                      style={{ width: `${qualityPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Validated</span>
                    <span className="font-bold text-[#172033]">
                      {dataFoundation.total_observations_found} parameters
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Outliers</span>
                    <span className="font-bold text-[#172033]">
                      {dataFoundation.outliers_flagged} flagged
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">Observations structured and cleaned via standard pipeline.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#64748B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
            <span>Unit-standardized to clinical SI references</span>
          </div>
        </GlassCard>

        {/* Exp 5: Rule Engine Reasoning */}
        <GlassCard className="p-5 bg-white border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0284C7]" />
                Exp 5: Rule Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                Chaining Logic
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#172033] mb-2">
              Explainable Clinical Reasoning
            </h3>

            {ruleEngine ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#172033]">
                    {ruleEngine.fired_rules_count} rules fired
                  </span>
                  <span className="text-xs text-[#64748B]">
                    from {ruleEngine.input_facts_count} observed facts
                  </span>
                </div>

                {ruleEngine.fired_rules.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                    {ruleEngine.fired_rules.slice(0, 3).map((r: { name: string; supporting_facts?: string[] }, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[11px]">
                        <p className="font-bold text-[#15803D]">{r.name}</p>
                        {r.supporting_facts && r.supporting_facts.length > 0 && (
                          <p className="text-[10px] text-[#64748B] mt-0.5 truncate">
                            Triggered by: {r.supporting_facts.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B]">
                    No abnormal rule antecedents triggered in this report panel.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">Transparent deterministic inference engine ready.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
            <Link
              to="/insights?tab=logic"
              className="text-[#0284C7] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Audit rule trace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </GlassCard>

        {/* Exp 2: Knowledge Graph */}
        <GlassCard className="p-5 bg-white border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-[#7C3AED]" />
                Exp 2: Knowledge Graph
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
                BFS / DFS
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#172033] mb-2">
              Curated Medical Ontology
            </h3>

            {knowledgeGraph && knowledgeGraph.linked_concepts && knowledgeGraph.linked_concepts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-[#64748B]">
                  Report biomarkers mapped to ontology nodes:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {knowledgeGraph.linked_concepts.slice(0, 6).map((c: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] font-bold text-[#172033]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">
                Traverse physiological relationships between biomarkers, organ systems, and risk factors.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
            <Link
              to="/insights?tab=knowledge"
              className="text-[#7C3AED] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Explore ontology graph</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
