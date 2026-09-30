"""
HealthLens AI — NHANES Dataset Loader
======================================
Loads and merges raw NHANES .xpt files from the project directory.
Maps NHANES survey variable codes to standardized HealthLens clinical parameters,
filters sentinel/below-LOD artifacts, and normalizes measurement units.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

# Standardized HealthLens Parameter Names
# Mapping: NHANES column code -> HealthLens canonical name & optional unit conversion
BIOPRO_COLUMN_MAP: Dict[str, str] = {
    "LBXSCR": "Creatinine",            # mg/dL
    "LBXSBU": "Urea",                  # mg/dL (Blood Urea Nitrogen)
    "LBXSAL": "Albumin",               # g/dL
    "LBXSTP": "Total Protein",         # g/dL
    "LBXSASSI": "SGOT",                # U/L (AST)
    "LBXSATSI": "SGPT",                # U/L (ALT)
    "LBXSAPSI": "ALP",                 # U/L (Alkaline Phosphatase)
    "LBXSNASI": "Sodium",              # mEq/L
    "LBXSKSI": "Potassium",            # mEq/L
    "LBXSCA": "Calcium",               # mg/dL
    "LBXSGL": "Glucose (Fasting)",     # mg/dL
    "LBXSTB": "Bilirubin (Total)",      # mg/dL
    "LBXSUA": "Uric Acid",             # mg/dL
    "LBXSCH": "Total Cholesterol",     # mg/dL
    "LBXSTR": "Triglycerides",         # mg/dL
    "LBXSIR": "Iron",                  # µg/dL
}

GHB_COLUMN_MAP: Dict[str, str] = {
    "LBXGH": "HbA1c",                  # %
}

GLU_COLUMN_MAP: Dict[str, str] = {
    "LBXGLU": "Glucose (Fasting)",     # mg/dL (fasting plasma glucose)
}

FERTIN_COLUMN_MAP: Dict[str, str] = {
    "LBXFER": "Ferritin",              # ng/mL
}

VID_COLUMN_MAP: Dict[str, str] = {
    "LBXVIDMS": "Vitamin D",           # original nmol/L -> convert to ng/mL via * 0.4006
}

ALB_CR_COLUMN_MAP: Dict[str, str] = {
    "URXUMA": "Urine Albumin",         # µg/mL
    "URXUCR": "Urine Creatinine",      # mg/dL
    "URDACT": "Albumin/Creatinine Ratio", # mg/g
}

CBC_COLUMN_MAP: Dict[str, str] = {
    "LBXHGB": "Hemoglobin",            # g/dL
    "LBXRBCSI": "RBC",                 # mill/µL (10^6 cells/µL)
    "LBXWBCSI": "WBC",                 # thou/µL (10^3 cells/µL)
    "LBXPLTSI": "Platelets",           # thou/µL (10^3 cells/µL)
    "LBXMCVSI": "MCV",                 # fL
    "LBXMCHSI": "MCH",                 # pg
    "LBXMC": "MCHC",                   # g/dL
    "LBXRDW": "RDW",                   # %
    "LBXHCT": "Hematocrit",            # %
}

HSCRP_COLUMN_MAP: Dict[str, str] = {
    "LBXHSCRP": "hs-CRP",              # mg/L
}


def find_nhanes_files(search_paths: Optional[List[Path]] = None) -> Dict[str, Path]:
    """
    Search and locate the 8 known NHANES .xpt files in candidate directories.
    """
    if search_paths is None:
        # Default search roots: project root, parent dirs, current working dir
        base_dir = Path(__file__).resolve().parent
        candidate_dirs = [
            base_dir.parent.parent.parent,  # HealthLense AI/ root
            base_dir.parent.parent,         # backend/
            Path.cwd(),
            Path.cwd().parent,
        ]
    else:
        candidate_dirs = search_paths

    known_filenames = [
        "BIOPRO_L.xpt",
        "CBC_J.xpt",
        "ALB_CR_L.xpt",
        "FERTIN_L.xpt",
        "GHB_L.xpt",
        "GLU_L.xpt",
        "HSCRP_I.xpt",
        "VID_L.xpt",
    ]

    located: Dict[str, Path] = {}
    for filename in known_filenames:
        for cdir in candidate_dirs:
            target = cdir / filename
            if target.exists() and target.is_file():
                located[filename] = target
                break

    return located


def _clean_nhanes_series(series: pd.Series) -> pd.Series:
    """
    Clean SAS XPT numeric series:
    - Replace SAS float underflow artifacts (< 1e-10) with NaN
    - Filter sentinel missing values (e.g., 77777, 99999)
    - Filter negative values for clinical concentrations
    """
    s = pd.to_numeric(series, errors="coerce")
    # Mask SAS float underflow like 5.3976e-79
    s = s.mask(s < 1e-10)
    # Mask sentinel NHANES missing codes
    s = s.mask(s.isin([7777, 9999, 77777, 99999]))
    return s


def load_biochemistry_dataset(located_files: Dict[str, Path]) -> pd.DataFrame:
    """
    Load and merge Cycle L biochemistry, metabolic, vitamin, iron, and urine files on SEQN.
    Returns cleaned dataframe with HealthLens canonical column names.
    """
    if "BIOPRO_L.xpt" not in located_files:
        raise FileNotFoundError("BIOPRO_L.xpt not found")

    biopro_raw = pd.read_sas(located_files["BIOPRO_L.xpt"], format="xport")
    df = pd.DataFrame({"SEQN": biopro_raw["SEQN"].astype(float)})

    # Map BIOPRO columns
    for code, name in BIOPRO_COLUMN_MAP.items():
        if code in biopro_raw.columns:
            df[name] = _clean_nhanes_series(biopro_raw[code])

    # Merge GHB (HbA1c)
    if "GHB_L.xpt" in located_files:
        ghb_raw = pd.read_sas(located_files["GHB_L.xpt"], format="xport")
        ghb_clean = pd.DataFrame({
            "SEQN": ghb_raw["SEQN"].astype(float),
            "HbA1c": _clean_nhanes_series(ghb_raw["LBXGH"])
        })
        df = df.merge(ghb_clean, on="SEQN", how="left")

    # Merge GLU (Fasting Glucose)
    if "GLU_L.xpt" in located_files:
        glu_raw = pd.read_sas(located_files["GLU_L.xpt"], format="xport")
        fasting_glu = _clean_nhanes_series(glu_raw["LBXGLU"])
        glu_clean = pd.DataFrame({
            "SEQN": glu_raw["SEQN"].astype(float),
            "fasting_glu_alt": fasting_glu
        })
        df = df.merge(glu_clean, on="SEQN", how="left")
        # Combine with LBXSGL if Fasting Glucose was missing
        df["Glucose (Fasting)"] = df["Glucose (Fasting)"].fillna(df["fasting_glu_alt"])
        df = df.drop(columns=["fasting_glu_alt"])

    # Merge Vitamin D
    if "VID_L.xpt" in located_files:
        vid_raw = pd.read_sas(located_files["VID_L.xpt"], format="xport")
        # LBXVIDMS is in nmol/L. Convert to ng/mL: 1 nmol/L = 0.4006 ng/mL
        raw_vid = _clean_nhanes_series(vid_raw["LBXVIDMS"])
        vid_clean = pd.DataFrame({
            "SEQN": vid_raw["SEQN"].astype(float),
            "Vitamin D": (raw_vid * 0.4006).round(2)
        })
        df = df.merge(vid_clean, on="SEQN", how="left")

    # Merge Ferritin
    if "FERTIN_L.xpt" in located_files:
        fer_raw = pd.read_sas(located_files["FERTIN_L.xpt"], format="xport")
        fer_clean = pd.DataFrame({
            "SEQN": fer_raw["SEQN"].astype(float),
            "Ferritin": _clean_nhanes_series(fer_raw["LBXFER"])
        })
        df = df.merge(fer_clean, on="SEQN", how="left")

    # Merge Urine Albumin / Creatinine
    if "ALB_CR_L.xpt" in located_files:
        alb_cr_raw = pd.read_sas(located_files["ALB_CR_L.xpt"], format="xport")
        alb_cr_clean = pd.DataFrame({"SEQN": alb_cr_raw["SEQN"].astype(float)})
        for code, name in ALB_CR_COLUMN_MAP.items():
            if code in alb_cr_raw.columns:
                alb_cr_clean[name] = _clean_nhanes_series(alb_cr_raw[code])
        df = df.merge(alb_cr_clean, on="SEQN", how="left")

    return df


def load_cbc_dataset(located_files: Dict[str, Path]) -> pd.DataFrame:
    """
    Load Cycle J CBC dataset.
    Returns cleaned dataframe with HealthLens canonical column names.
    """
    if "CBC_J.xpt" not in located_files:
        raise FileNotFoundError("CBC_J.xpt not found")

    cbc_raw = pd.read_sas(located_files["CBC_J.xpt"], format="xport")
    df = pd.DataFrame({"SEQN": cbc_raw["SEQN"].astype(float)})

    for code, name in CBC_COLUMN_MAP.items():
        if code in cbc_raw.columns:
            df[name] = _clean_nhanes_series(cbc_raw[code])

    return df


def load_hscrp_dataset(located_files: Dict[str, Path]) -> pd.DataFrame:
    """
    Load Cycle I hs-CRP dataset.
    Returns cleaned dataframe with HealthLens canonical column names.
    """
    if "HSCRP_I.xpt" not in located_files:
        raise FileNotFoundError("HSCRP_I.xpt not found")

    hscrp_raw = pd.read_sas(located_files["HSCRP_I.xpt"], format="xport")
    df = pd.DataFrame({"SEQN": hscrp_raw["SEQN"].astype(float)})

    for code, name in HSCRP_COLUMN_MAP.items():
        if code in hscrp_raw.columns:
            df[name] = _clean_nhanes_series(hscrp_raw[code])

    return df
