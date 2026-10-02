"""
Experiment 9: Clinical Natural Language Processing & AI Integration
===================================================================
Implements lexical NLP processing and Gemini grounding:
- Text normalization and cleaning (unicode, whitespace, artifact suppression)
- Tokenization and clinical term boundary detection
- Terminology extraction (biomarker names, numerical quantities, clinical units)
- Query intent classification for report-related question understanding
- Grounded structured prompt synthesis for Gemini without hallucinated values
- SAFETY: NLP and generative models NEVER override verified numerical values,
  alter reference ranges, or fabricate clinical diagnoses.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class ExtractedToken:
    text: str
    lemma: str
    is_stop: bool
    is_numeric: bool
    entity_type: Optional[str] = None  # "BIOMARKER" | "UNIT" | "VALUE" | None


@dataclass
class NLPAnalysisResult:
    original_text: str
    normalized_text: str
    token_count: int
    cleaned_tokens: List[str]
    identified_biomarkers: List[str]
    identified_units: List[str]
    query_intent: str  # "explanation", "range_query", "trend_inquiry", "general_health"
    grounded_context_prompt: str


class ClinicalNLPEngine:
    """
    Rule-based and pattern-assisted NLP engine for clinical report text
    and question understanding.
    """

    KNOWN_BIOMARKERS: Dict[str, List[str]] = {
        "hemoglobin": ["hemoglobin", "haemoglobin", "hb", "hgb"],
        "platelets": ["platelets", "platelet count", "plt"],
        "rbc": ["rbc", "red blood cells", "erythrocytes"],
        "wbc": ["wbc", "white blood cells", "leukocytes"],
        "glucose": ["fasting glucose", "glucose", "blood sugar", "fbs", "glycemia"],
        "hba1c": ["hba1c", "glycated hemoglobin", "a1c"],
        "cholesterol": ["total cholesterol", "cholesterol", "chol"],
        "triglycerides": ["triglycerides", "tg", "trigs"],
        "creatinine": ["creatinine", "serum creatinine", "creat"],
        "urea": ["urea", "blood urea nitrogen", "bun"],
        "sgot": ["sgot", "ast", "aspartate aminotransferase"],
        "sgpt": ["sgpt", "alt", "alanine aminotransferase"],
    }

    KNOWN_UNITS: Set[str] = {
        "g/dl", "mg/dl", "mmol/l", "umol/l", "u/l", "iu/l", "thou/ul",
        "mill/ul", "%", "fl", "pg", "ng/ml", "ug/dl", "mm/hr",
    }

    STOPWORDS: Set[str] = {
        "a", "an", "the", "and", "or", "in", "of", "to", "for", "with", "on", "at",
        "is", "are", "was", "were", "be", "been", "this", "that", "my", "your", "what",
        "does", "mean", "can", "you", "tell", "me", "about", "please", "why", "how",
    }

    def normalize_text(self, text: str) -> str:
        """Cleans and standardizes raw text input."""
        if not text:
            return ""
        # Lowercase, replace non-breaking spaces and redundant whitespaces
        cleaned = text.replace("\u00a0", " ").replace("\r\n", "\n")
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        return cleaned.strip()

    def tokenize(self, text: str) -> List[ExtractedToken]:
        """Splits normalized text into lexical tokens with preliminary POS/entity tags."""
        normalized = self.normalize_text(text)
        # Tokenize by punctuation / whitespace boundaries while preserving unit symbols like 'g/dL'
        raw_words = re.findall(r"[A-Za-z0-9/%]+|[.,!?;]", normalized)

        tokens: List[ExtractedToken] = []
        for word in raw_words:
            lower = word.lower()
            is_num = bool(re.match(r"^[-+]?\d*\.?\d+$", word))
            is_stop = lower in self.STOPWORDS
            entity = None

            if is_num:
                entity = "VALUE"
            elif lower in self.KNOWN_UNITS:
                entity = "UNIT"
            else:
                # Check for biomarker match
                for bio_key, aliases in self.KNOWN_BIOMARKERS.items():
                    if lower in aliases:
                        entity = "BIOMARKER"
                        break

            tokens.append(
                ExtractedToken(
                    text=word,
                    lemma=lower,
                    is_stop=is_stop,
                    is_numeric=is_num,
                    entity_type=entity,
                )
            )

        return tokens

    def extract_clinical_entities(self, text: str) -> Tuple[List[str], List[str]]:
        """Identifies standard biomarker names and clinical measurement units."""
        tokens = self.tokenize(text)
        text_lower = self.normalize_text(text).lower()

        found_biomarkers: Set[str] = set()
        for bio_key, aliases in self.KNOWN_BIOMARKERS.items():
            for alias in aliases:
                # Search for multi-word aliases as well
                if re.search(r"\b" + re.escape(alias) + r"\b", text_lower):
                    found_biomarkers.add(bio_key.capitalize())
                    break

        found_units: Set[str] = {t.text.lower() for t in tokens if t.entity_type == "UNIT"}
        return sorted(list(found_biomarkers)), sorted(list(found_units))

    def classify_query_intent(self, question: str) -> str:
        """Classifies the primary intent of a user's question regarding their medical report."""
        q_norm = self.normalize_text(question).lower()

        # Specific metric checks first
        if any(w in q_norm for w in ["range", "cutoff", "reference value", "reference range", "normal values"]):
            return "range_query"
        elif any(w in q_norm for w in ["trend", "history", "previous", "change", "worse", "better", "improving"]):
            return "trend_inquiry"
        elif any(w in q_norm for w in ["why", "explain", "what does", "meaning", "understand", "reason", "what is"]):
            return "explanation"
        elif any(w in q_norm for w in ["normal", "high", "low"]):
            return "range_query"
        else:
            return "general_health"

    def build_grounded_assistant_prompt(
        self,
        user_question: str,
        verified_parameters: List[Dict[str, Any]],
        detected_conditions: Optional[List[str]] = None,
    ) -> NLPAnalysisResult:
        """
        Structures a validated prompt ensuring the generative AI is bound
        strictly to extracted verified laboratory facts.
        """
        tokens = self.tokenize(user_question)
        cleaned_words = [t.lemma for t in tokens if not t.is_stop and not t.entity_type == "PUNCT"]
        biomarkers, units = self.extract_clinical_entities(user_question)
        intent = self.classify_query_intent(user_question)

        # Build grounded facts block
        param_lines = []
        for p in verified_parameters[:12]:
            name = p.get("parameter_name") or p.get("name", "Unknown")
            val = p.get("value")
            unit = p.get("unit", "")
            rng = p.get("reference_range") or p.get("reference_text", "N/A")
            st = p.get("status", "normal")
            param_lines.append(f"- {name}: {val} {unit} (Ref: {rng}, Status: {st})")

        facts_block = "\n".join(param_lines) if param_lines else "No specific numerical parameters."
        cond_str = ", ".join(detected_conditions) if detected_conditions else "None flagged."

        grounded_prompt = (
            f"You are the HealthLens AI clinical explanation assistant.\n"
            f"USER QUESTION: \"{user_question}\"\n"
            f"CLASSIFIED INTENT: {intent}\n\n"
            f"VERIFIED CLINICAL REPORT PARAMETERS (DO NOT INVENT OTHER MEASUREMENTS):\n"
            f"{facts_block}\n\n"
            f"DETERMINISTIC EVALUATION INDICATORS: {cond_str}\n\n"
            f"GUIDANCE: Explain what these verified numbers mean in clear, educational language.\n"
            f"MANDATORY FACTUAL GROUNDING: Do NOT invent, extrapolate, or fabricate any missing laboratory values, units, or historical trends. "
            f"Base all explanations strictly on the verified parameters above. If an indicator was not measured in this report, clearly state that it is unavailable.\n"
            f"Do not prescribe medications, calculate ungrounded clinical risks, or diagnose diseases. Always advise discussing findings with a licensed physician."
        )

        return NLPAnalysisResult(
            original_text=user_question,
            normalized_text=self.normalize_text(user_question),
            token_count=len(tokens),
            cleaned_tokens=cleaned_words,
            identified_biomarkers=biomarkers,
            identified_units=units,
            query_intent=intent,
            grounded_context_prompt=grounded_prompt,
        )
