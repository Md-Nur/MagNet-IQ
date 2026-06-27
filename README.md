# 🧲 MagNet-IQ — Magnetic Material Intelligence System

> **ML-based permanent magnet material prediction and rare-earth-free candidate discovery using the Materials Project database**

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Model](https://img.shields.io/badge/HuggingFace-MagNet--IQ-yellow?logo=huggingface)](https://huggingface.co/nur9211/MagNet-IQ)
[![R²](https://img.shields.io/badge/Model%20R²-0.8903-brightgreen)]()
[![License](https://img.shields.io/badge/License-MIT-purple)]()

---

## 📌 Overview

MagNet-IQ is an ML-based Permanent Magnet Material Intelligence System that:

- Screens **52,205 ferromagnetic materials** from the [Materials Project](https://materialsproject.org) database
- Identifies **28,472 stable permanent magnet candidates** after thermodynamic filtering
- Predicts **total magnetization (μB)** from crystal structure and compositional features using a trained Random Forest model (R² = 0.8903, MAE = 2.36 μB)
- Ranks candidates by a composite **MagNet-IQ Score** combining magnetization, stability, and density
- Provides dedicated **rare-earth-free filtering** — directly addressing the global RE supply chain problem relevant to EV motors and wind turbines

This project is developed as part of an undergraduate thesis in Electrical and Electronic Engineering (EEE) at the University of Rajshahi, Bangladesh, under the supervision of a faculty member in the Department of EEE.

---

## 🎯 Research Motivation

High-performance permanent magnets containing rare earth (RE) elements such as Nd, Sm, Dy are critical components in electric vehicles, wind turbines, MRI machines, and industrial motors. However:

- RE elements are expensive and geopolitically concentrated (China controls ~60% of global supply)
- Experimental discovery of new PM materials takes months and costs millions
- Existing ML studies screen at most 686–2,000 materials and focus on narrow material families

**MagNet-IQ addresses these gaps** by applying ML screening to the full ferromagnetic subset of the Materials Project (52,205 materials) with integrated rare-earth-free candidate discovery — a scale and scope not attempted in prior literature.

### Key Referenced Papers

| # | Paper | Journal | Year | DOI / URL |
|---|-------|---------|------|-----------|
| 1 | Prediction of Large Magnetic Moment Materials With Graph Neural Networks and Random Forests | Physical Review Materials (APS, Q1) | 2023 | https://arxiv.org/abs/2111.14712 |
| 2 | Machine learning-accelerated discovery of iron cobalt phosphides as rare-earth-free magnets | Physical Review Materials (APS, Q1) | 2024 | https://doi.org/10.1103/physrevmaterials.8.104404 |
| 3 | Accurate Machine Learning Predictions of Coercivity in High-Performance Permanent Magnets | Physical Review Applied (APS, Q1) | 2024 | https://arxiv.org/abs/2312.02475 |
| 4 | Leveraging available data for efficient exploration of materials space using ML: rare earth-free permanent magnets | Journal of Magnetism and Magnetic Materials (Elsevier, Q1) | 2023 | https://www.sciencedirect.com/science/article/abs/pii/S0304885323012404 |
| 5 | Data-driven high-throughput search for the accelerated discovery of rare-earth-free permanent magnets | Physical Review Materials (APS, Q1) | 2025 | https://arxiv.org/abs/2507.01849 |
| 6 | A data-driven approach to predict the saturation magnetization for magnetic 14:2:1 phases | AIP Advances (Q2) | 2024 | https://pubs.aip.org/aip/adv/article/14/1/015060 |

### Research Gap Filled

> Prior work (Papers 1–6) screens at most 686 materials, focuses on binary alloys or single material families, and predicts only one property at a time. No existing study performs large-scale ML screening across the full ferromagnetic Materials Project subset (50,000+) with integrated rare-earth-free candidate ranking and an interactive deployed tool. MagNet-IQ addresses all three gaps.

---

## 🗂️ Project Structure

```
MagNet-IQ/
│
├── data_collection.ipynb       # Materials Project API fetch
├── EDA.ipynb                   # Exploratory Data Analysis
├── feature_engineering.ipynb   # Feature construction
└── ml_training.ipynb           # Model training + evaluation
│
├── data/
│   ├── magnet_dataset.csv             # Raw fetched data (52,205 materials)
│   ├── magnet_pm_filtered.csv         # Filtered PM candidates (28,472)
│   └── magnet_features_v2.csv         # Feature-engineered dataset
│
├── models/
│   ├── magnet_model_rf_v2.pkl         # Best model (hosted on HuggingFace)
│   ├── feature_cols_v2.pkl            # Feature column list
│   └── crystal_system_encoder.pkl     # LabelEncoder for crystal system
│
├── website/
│   ├── client/                        # Next.js 14 frontend (Vercel)
│   └── server/                        # FastAPI backend (HuggingFace Spaces)
```

---

## 🔬 Dataset

| Property | Value |
|----------|-------|
| Source | [Materials Project](https://materialsproject.org) via `mp-api` |
| Total FM materials fetched | 52,205 |
| Filter: Ferromagnetic ordering | `Ordering.FM` |
| Filter: Stable candidates | `energy_above_hull < 0.1 eV/atom` |
| Filter: Meaningful magnetization | `total_magnetization > 0.5 μB` |
| Final PM candidates | 28,472 |
| Train / Test split | 80% / 20% |

### Features Used (25 total)

**Structural:** `nelements`, `nsites`, `volume`, `density`, `crystal_system_enc`, `spacegroup_number`

**Thermodynamic:** `energy_above_hull`, `formation_energy`, `band_gap`

**Magnetic:** `num_magnetic_sites`

**Element flags:** `has_Fe`, `has_Co`, `has_Ni`, `has_Mn`, `has_Nd`, `has_Sm`, `has_Gd`, `has_Eu`, `has_O`, `has_Li`

**Engineered:** `sites_per_element`, `mag_sites_ratio`, `volume_per_site`, `density_x_mag_sites`, `has_rare_earth`, `num_transition_metals`

**Target:** `total_magnetization` (μB) — log-transformed during training

---

## 🤖 ML Models

| Model | R² | MAE (μB) | Notes |
|-------|----|----------|-------|
| Random Forest v2 ✅ | **0.8903** | **2.36** | Best model — deployed |
| XGBoost v2 | 0.8871 | 2.68 | Second best |
| Random Forest (base) | 0.8817 | 2.49 | No engineered features |
| Gradient Boosting | 0.8646 | 3.04 | Weakest |

### Feature Importance (RF v2 — Fair Model)

| Feature | Importance |
|---------|-----------|
| num_magnetic_sites | 49.0% |
| has_Fe | 8.0% |
| has_Mn | 7.0% |
| formation_energy | 6.8% |
| band_gap | 4.8% |
| has_Eu | 4.5% |
| has_Gd | 3.8% |
| volume | 3.3% |
| density | 3.0% |
| nsites | 2.8% |

> **Note:** `magnetization_norm_vol` was excluded from the fair model as it is a derived feature from the target variable (data leakage). The reported R² = 0.8903 reflects genuine predictive ability from structural and compositional features only.

---

## 🏆 Top Permanent Magnet Candidates

| Rank | Formula | Magnetization (μB) | MagNet-IQ Score | Crystal System | Stability | RE-Free |
|------|---------|-------------------|----------------|----------------|-----------|---------|
| 1 | Ba3Fe26O41 | 256.2 | 212.7 | Hexagonal | 0.050 | ✅ |
| 2 | Zn(Fe2O3)4 | 228.1 | 201.5 | Triclinic | 0.050 | ✅ |
| 3 | Mn2O3 | 256.0 | 200.1 | Tetragonal | 0.079 | ✅ |
| 4 | Gd2Fe14C | 171.8 | 195.8 | Tetragonal | 0.036 | ❌ |
| 5 | Fe41O56 | 194.0 | 190.5 | Trigonal | 0.085 | ✅ |

> Gd2Fe14C appearing in the top 5 validates the model — this is a well-known industrial magnet compound confirmed in literature.

---

## 🚀 Deployment

### Backend — FastAPI on HuggingFace Spaces

```
Space URL : https://nur9211-magnet-iq.hf.space
Model Repo: https://huggingface.co/nur9211/MagNet-IQ
```

**Run locally:**
```bash
cd website/server
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check + model info |
| POST | `/predict` | Predict magnetization for a material |
| GET | `/recommend` | Filter and rank PM candidates |
| GET | `/stats` | Dataset and model statistics |
| GET | `/top-materials` | Top candidates by MagNet-IQ score |

### Frontend — Next.js on Vercel

```
Live URL: https://magnet-iq.vercel.app
```

**Run locally:**
```bash
cd website/client
npm install
npm run dev
# Visit http://localhost:3000
```

**Pages:**

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with stats and overview |
| Predict | `/predict` | Manual material property input → ML prediction |
| Recommend | `/recommend` | Element-based filtering with RE-free toggle |
| Explore | `/explore` | Dataset charts and model comparison |
| About | `/about` | Project info and research direction |

---

## 🔧 Local Setup (Full Project)

### Prerequisites

- Python 3.11
- [uv](https://docs.astral.sh/uv/) package manager
- Node.js 18+
- Materials Project API key from [materialsproject.org](https://materialsproject.org)

### 1. Clone the repository

```bash
git clone https://github.com/nur9211/MagNet-IQ.git
cd MagNet-IQ
```

### 2. Data Collection

```bash
cd notebooks
# Set your API key in 01_data_collection.ipynb
jupyter notebook 01_data_collection.ipynb
```

### 3. Run Backend

```bash
cd website/server
uv sync
uv run uvicorn app.main:app --reload
```

### 4. Run Frontend

```bash
cd website/client
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install && npm run dev
```

---

## 📊 EDA Highlights

- **Magnetization distribution:** Heavily right-skewed — most materials have 0–10 μB; a few outliers exceed 250 μB
- **Dominant crystal systems:** Monoclinic (9,324) > Triclinic (6,604) > Orthorhombic (5,108)
- **Top elements:** O (21,533), Li (9,875), Mn (7,005), Fe (5,472)
- **Key correlation:** `num_magnetic_sites` ↔ `total_magnetization` = 0.74 (strongest predictor)
- **Rare earth presence:** Nd and Sm appear in <2% of candidates — underrepresented in DFT databases but critical in real magnets

---

## 📝 MagNet-IQ Composite Score Formula

```
MagNet-IQ Score = (total_magnetization × 0.5)
                + (magnetization_norm_vol × 500)
                + (max(0, 0.1 − energy_above_hull) × 100)
                + (density × 0.5)
```

Higher score = stronger, more stable, denser magnet candidate.

---

## 📌 Limitations

1. **Rare earth underrepresentation:** Nd and Sm are rare in the Materials Project database, limiting the model's ability to learn RE-material patterns
2. **High-magnetization outliers:** Model performance degrades for materials with >100 μB due to sparse training data in that range
3. **Missing key PM metrics:** Coercivity (Hc), Curie temperature (Tc), and energy product (BHmax) are not predicted — these require experimental data or separate DFT calculations
4. **DFT accuracy:** All training data originates from DFT simulations; real experimental values may differ

---

## 🔭 Future Work

- [ ] Predict coercivity (Hc) and Curie temperature (Tc) as additional targets
- [ ] Incorporate Graph Neural Networks (CGCNN, MEGNet) for crystal-structure-aware prediction
- [ ] Extend dataset with experimental magnetization data from AFLOW and OQMD
- [ ] Add uncertainty quantification (Bayesian RF or conformal prediction)
- [ ] Target journal: **IEEE Transactions on Magnetics** / **npj Computational Materials**

---

## 👤 Author

**Md. Nur E Alam Siddiquee**
B.Sc. in Electrical and Electronic Engineering
University of Rajshahi, Bangladesh

- HuggingFace: [nur9211](https://huggingface.co/nur9211)
- Model Repo: [nur9211/MagNet-IQ](https://huggingface.co/nur9211/MagNet-IQ)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Materials Project](https://materialsproject.org) for the open DFT database and API
- University of Rajshahi, Department of EEE, for academic supervision

## Next Changes

| Current MagNet-IQ | Next Roadmap |
|----------------|----------------|
| Materials Project DFT data | Experimental + DFT Both |
| Magnetization predict | (BH)max, Coercivity, Tc, Remanence - all |
| 52,000+ general FM materials | Specific RE-Free systems: FeNi, MnAl, MnBi, Fe16N2 |
| Random Forest only | XGBoost, CatBoost, LightGBM, GPR, NN compare |
