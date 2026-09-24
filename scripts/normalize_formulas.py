"""
normalize_formulas.py
=====================
Produces a canonical reduced Hill-sorted formula key for every material
across four datasets:
  - df_practical.csv           (Materials Project DFT, already clean)
  - magdb.json / NDJSON        (NovoMag DFT, pymatgen ComputedStructureEntry)
  - nemad_magnetic_materials.csv      (NEMAD general, LLM-extracted)
  - nemad_magnetic_anisotropy_materials.csv  (NEMAD anisotropy, LLM-extracted)

Canonical key:
  • Parse raw formula string with pymatgen Composition
  • Reduce to smallest integer stoichiometry  (e.g. Fe2O4 → FeO2 would be
    .reduced_composition; we want the *reduced* formula)
  • Re-sort in pymatgen Hill order (C, H first if present, then alphabetical)
  • Stringify with integer counts only: "Ca1Ge2Mn2" style
    (no ambiguity from reduced_formula using parentheses or omitting 1s)
  
Outputs written to data/:
  df_practical_norm.csv
  novomag_norm.csv
  nemad_materials_norm.csv
  nemad_anisotropy_norm.csv

Each output file retains all original columns plus two new ones:
  formula_key   – the canonical join key (str, or NaN if parse failed)
  formula_parse_status  – "ok" | "failed" | "unparseable_name"
"""

import json
import re
import csv
import ast
import sys
from pathlib import Path

# ── pymatgen ─────────────────────────────────────────────────────────────────
try:
    from pymatgen.core import Composition
    from pymatgen.core.periodic_table import Element
except ImportError:
    sys.exit("pymatgen not found — run via .venv/bin/python")

# ── paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
DATA = ROOT / "data"

# ─────────────────────────────────────────────────────────────────────────────
# Core normalizer
# ─────────────────────────────────────────────────────────────────────────────

# Patterns that make a formula string unparseable / ambiguous
_SKIP_PATTERNS = re.compile(
    r"""
    (?:
        \bwith\b          # "Nd4Fe77.5B18.5 with 40% Nd-Al"
      | \bwt%\b           # "0.2 wt% S"
      | \+\s*\d           # "+0.5 wt%"
      | \b[Hh]ot[-\s]     # "Hot-deformed ..."
      | \bGrain\b         # "Grain Boundary ..."
      | \bMagnet\b        # descriptive text
      | \bPhase\b
      | \bType\b
      | \bM-\w+           # "M-SrFe12O19" (M = metal, ambiguous)
      | \bδ               # non-stoichiometry delta symbol
      | −δ                # subtracted delta (unicode minus)
      | \([^)]*\bphase    # "(cubic phase)"
    )
    """,
    re.VERBOSE | re.IGNORECASE,
)

# Collapse purely element-hyphen-element system labels like "Nd-Fe-B" → keep,
# but strip processing descriptors around them.
_SYSTEM_LABEL = re.compile(
    r"^([A-Z][a-z]?)(?:-([A-Z][a-z]?))+$"   # e.g. Nd-Fe-B
)

# Replace unicode minus (U+2212) with ASCII hyphen so pymatgen doesn't choke
_UNICODE_MINUS = re.compile(r"\u2212")

# Remove additive annotations after the base formula:
#   "NdFe11TiN0.5 + small additions"  → "NdFe11TiN0.5"
_ADDITIVE_STRIP = re.compile(r"\s*[+]\s*\d.*$")

# Subscript digits (unicode subscript 0-9) → ASCII digit
_SUBSCRIPT_MAP = str.maketrans("₀₁₂₃₄₅₆₇₈₉", "0123456789")


def _canonical_key(comp: Composition) -> str:
    """Return 'El1N1 El2N2 …' Hill-sorted with integer counts, no spaces."""
    reduced = comp.reduced_composition
    # Hill order: C, H first then alphabetical
    elements = sorted(reduced.elements, key=lambda e: (
        (0 if e.symbol == "C" else 1 if e.symbol == "H" else 2),
        e.symbol
    ))
    parts = []
    for el in elements:
        amt = reduced[el]
        # Use integer if it's whole, else 2-decimal float
        if abs(amt - round(amt)) < 1e-3:
            parts.append(f"{el.symbol}{int(round(amt))}")
        else:
            parts.append(f"{el.symbol}{amt:.2f}")
    return "".join(parts)


def parse_formula(raw: str) -> tuple[str | None, str]:
    """
    Attempt to parse *raw* formula string into a canonical key.
    Returns (key_or_None, status_str).
    """
    if not raw or not isinstance(raw, str):
        return None, "failed"

    s = raw.strip()
    s = _UNICODE_MINUS.sub("-", s)
    s = s.translate(_SUBSCRIPT_MAP)

    # Strip additive annotations first
    s = _ADDITIVE_STRIP.sub("", s).strip()

    # Check for unparseable descriptive text
    if _SKIP_PATTERNS.search(s):
        return None, "unparseable_name"

    # Handle purely hyphenated system labels "Nd-Fe-B" → cannot reduce without
    # stoichiometry, mark as unparseable (they are system labels, not formulas)
    if _SYSTEM_LABEL.match(s):
        return None, "unparseable_name"

    # Remove trailing parenthetical notes like "(at 300 K)" or "(x=0.3)"
    s = re.sub(r"\s*\(.*?\)\s*$", "", s).strip()
    # Remove leading modifiers like "nano-", "α-", "β-", etc.
    s = re.sub(r"^(?:nano|α|β|γ|δ|ε|θ|κ|λ)-", "", s, flags=re.IGNORECASE)

    try:
        comp = Composition(s)
        if len(comp) == 0:
            return None, "failed"
        return _canonical_key(comp), "ok"
    except Exception:
        return None, "failed"


# ─────────────────────────────────────────────────────────────────────────────
# 1. df_practical.csv  (Materials Project)
# ─────────────────────────────────────────────────────────────────────────────

def process_df_practical():
    src = DATA / "df_practical.csv"
    dst = DATA / "df_practical_norm.csv"
    ok = fail = 0

    with open(src, newline="", encoding="utf-8-sig") as fin, \
         open(dst, "w", newline="", encoding="utf-8") as fout:

        reader = csv.DictReader(fin)
        fieldnames = reader.fieldnames + ["formula_key", "formula_parse_status"]
        writer = csv.DictWriter(fout, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            raw = row.get("formula", "")
            key, status = parse_formula(raw)
            row["formula_key"] = key or ""
            row["formula_parse_status"] = status
            writer.writerow(row)
            if status == "ok":
                ok += 1
            else:
                fail += 1

    print(f"df_practical     : {ok} ok  |  {fail} failed  → {dst.name}")


# ─────────────────────────────────────────────────────────────────────────────
# 2. magdb.json  (NovoMag NDJSON)
# ─────────────────────────────────────────────────────────────────────────────

def process_novomag():
    src = DATA / "magdb.json"
    dst = DATA / "novomag_norm.csv"
    ok = fail = skip = 0

    fieldnames = [
        "entry_id", "reduced_formula", "nelem", "spacegroup_symbol",
        "crystal_system",
        "magnetic_ordering",
        "magnetic_polarization_T",       # J_s  in Tesla
        "total_magnetic_moment_uB",      # μB / cell
        "mae_energy_da_meV_cell",        # MAE (d-a axis) meV/cell
        "mae_constant_da_MJ_m3",         # K  MJ/m³
        "easy_axis", "kappa",
        "curie_temperature_K",
        "formation_energy_meV_atom",
        "above_hull_meV_atom",
        "formula_key", "formula_parse_status",
    ]

    def _get(d, *keys):
        cur = d
        for k in keys:
            if not isinstance(cur, dict) or k not in cur:
                return None
            cur = cur[k]
        return cur

    with open(src, encoding="utf-8") as fin, \
         open(dst, "w", newline="", encoding="utf-8") as fout:

        writer = csv.DictWriter(fout, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for line in fin:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            data = rec.get("data")
            if not data:
                skip += 1
                continue

            # Prefer reduced_formula; fall back to top-level composition
            raw_formula = _get(data, "system", "reduced_formula")
            if not raw_formula:
                comp_dict = rec.get("composition", {})
                raw_formula = "".join(
                    f"{el}{int(v) if float(v) == int(float(v)) else v}"
                    for el, v in comp_dict.items()
                ) if comp_dict else ""

            key, status = parse_formula(raw_formula)
            if status == "ok":
                ok += 1
            else:
                fail += 1

            row = {
                "entry_id":                    rec.get("entry_id", _get(rec, "_id", "$oid")),
                "reduced_formula":             raw_formula,
                "nelem":                       _get(data, "system", "nelem"),
                "spacegroup_symbol":           _get(data, "spacegroup", "symbol"),
                "crystal_system":              _get(data, "spacegroup", "crystal_system"),
                "magnetic_ordering":           _get(data, "magnetic_moment", "magnetic_ordering"),
                "magnetic_polarization_T":     _get(data, "magnetic_moment", "magnetic_polarization", "value"),
                "total_magnetic_moment_uB":    _get(data, "magnetic_moment", "total_magnetic_moment", "value"),
                "mae_energy_da_meV_cell":      _get(data, "magnetic_anisotropy", "energy", "d-a"),
                "mae_constant_da_MJ_m3":       _get(data, "magnetic_anisotropy", "constant", "d-a"),
                "easy_axis":                   _get(data, "magnetic_anisotropy", "easy_axis"),
                "kappa":                       _get(data, "magnetic_anisotropy", "parameters", "kappa"),
                "curie_temperature_K":         _get(data, "critical_temperature", "Curie_temperature", "value"),
                "formation_energy_meV_atom":   _get(data, "formation_energy", "decomposition", "value"),
                "above_hull_meV_atom":         _get(data, "formation_energy", "above_hull", "value"),
                "formula_key":                 key or "",
                "formula_parse_status":        status,
            }
            writer.writerow(row)

    print(f"novomag          : {ok} ok  |  {fail} failed  |  {skip} skipped → {dst.name}")


# ─────────────────────────────────────────────────────────────────────────────
# 3. nemad_magnetic_materials.csv  (NEMAD general)
# ─────────────────────────────────────────────────────────────────────────────

def process_nemad_materials():
    src = DATA / "nemad_magnetic_materials.csv"
    dst = DATA / "nemad_materials_norm.csv"
    ok = fail = unparse = 0

    with open(src, newline="", encoding="utf-8-sig") as fin, \
         open(dst, "w", newline="", encoding="utf-8") as fout:

        reader = csv.DictReader(fin)
        fieldnames = reader.fieldnames + ["formula_key", "formula_parse_status"]
        writer = csv.DictWriter(fout, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for row in reader:
            raw = row.get("Material_Name", "").strip()
            key, status = parse_formula(raw)
            row["formula_key"] = key or ""
            row["formula_parse_status"] = status
            writer.writerow(row)
            if status == "ok":
                ok += 1
            elif status == "unparseable_name":
                unparse += 1
            else:
                fail += 1

    print(f"nemad_materials  : {ok} ok  |  {fail} failed  |  {unparse} unparseable → {dst.name}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. nemad_magnetic_anisotropy_materials.csv  (NEMAD anisotropy)
# ─────────────────────────────────────────────────────────────────────────────

def process_nemad_anisotropy():
    src = DATA / "nemad_magnetic_anisotropy_materials.csv"
    dst = DATA / "nemad_anisotropy_norm.csv"
    ok = fail = unparse = 0

    with open(src, newline="", encoding="utf-8-sig") as fin, \
         open(dst, "w", newline="", encoding="utf-8") as fout:

        reader = csv.DictReader(fin)
        fieldnames = reader.fieldnames + ["formula_key", "formula_parse_status"]
        writer = csv.DictWriter(fout, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for row in reader:
            raw = row.get("Material_Name", "").strip()
            key, status = parse_formula(raw)
            row["formula_key"] = key or ""
            row["formula_parse_status"] = status
            writer.writerow(row)
            if status == "ok":
                ok += 1
            elif status == "unparseable_name":
                unparse += 1
            else:
                fail += 1

    print(f"nemad_anisotropy : {ok} ok  |  {fail} failed  |  {unparse} unparseable → {dst.name}")


# ─────────────────────────────────────────────────────────────────────────────
# QA: verify round-trip on known tricky cases
# ─────────────────────────────────────────────────────────────────────────────

def qa_check():
    cases = [
        # (input,                   expected_key_or_None)
        ("Ca(MnGe)2",               "Ca1Ge2Mn2"),
        ("CaMn2Ge2",                "Ca1Ge2Mn2"),
        ("Fe3O4",                   "Fe3O4"),
        ("FeO",                     "Fe1O1"),
        ("Nd2Fe14B",                "B1Fe14Nd2"),
        ("Pr2Fe14B",                "B1Fe14Pr2"),
        ("Nd0.5Sr0.5MnO3",          "Mn1Nd0.50O3Sr0.50"),   # non-integer ok
        ("NdFe11TiN0.5",            "Fe11N0.50Nd1Ti1"),
        ("Nd-Fe-B",                 None),    # system label → unparseable
        ("Nd4Fe77.5B18.5 with 40%", None),    # additive → unparseable
        ("Hot-deformed Nd-Fe-B",    None),    # descriptor → unparseable
        ("Fe2B",                    "B1Fe2"),
        ("SrFe12O19",               "Fe12O19Sr1"),
        ("Ni49.6Mn21.9Ga28.5",      "Ga28.50Mn21.90Ni49.60"),
        ("Fe",                      "Fe1"),
        ("BaTi1.2Co1.2Fe9O19",      "Ba1Co1.20Fe9O19Ti1.20"),
    ]
    print("\n── QA round-trip checks ──")
    passes = failures = 0
    for raw, expected in cases:
        key, status = parse_formula(raw)
        match = (key == expected)
        sym = "✓" if match else "✗"
        if not match:
            failures += 1
        else:
            passes += 1
        print(f"  {sym}  {raw!r:40s} → {key!r}  (expected {expected!r})")
    print(f"\n  {passes}/{passes+failures} passed\n")


# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Running QA first …")
    qa_check()
    print("Processing datasets …\n")
    process_df_practical()
    process_novomag()
    process_nemad_materials()
    process_nemad_anisotropy()
    print("\nDone. Normalised files written to data/")
