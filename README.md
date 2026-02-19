# PharmaGuard 🧬💊

**CPIC-Aligned Pharmacogenomic Risk Prediction Platform**
---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| 🌐 **Live Demo** | [https://pharma-guard-ten.vercel.app/]|
| 🎥 **Demo Video (LinkedIn)** | [] |
| 📂 **GitHub Repository** | [https://github.com/Riyansh-adi/Pharma-Guard-.git] |

---

## 🎯 Overview

PharmaGuard is a precision medicine web application that analyzes patient genetic data (VCF files) to predict drug-gene interaction risks using **CPIC-aligned rule-based logic**. The system provides clinically actionable recommendations with AI-powered explanations.

### Key Differentiators

- **Rule-Based Phenotype Classification**: Deterministic CPIC-aligned diplotype → phenotype mapping (no LLM guessing)
- **CPIC-Aligned Risk Engine**: Drug-specific risk rules following clinical guidelines
- **LLM for Explanation Only**: AI generates explanations but never makes clinical decisions
- **Consistent Clinical Output**: Phenotype → Risk → Recommendation are always internally consistent

## ✨ Features

- 🧬 **VCF File Upload** - Drag & drop or file picker with validation
- 💊 **6 Critical Drug-Gene Pairs** - CPIC Level A evidence drugs
- 🎯 **CPIC-Aligned Phenotyping** - Strict rule-based diplotype interpretation
- ⚠️ **Risk Stratification** - Safe, Adjust Dosage, Toxic, Ineffective classifications
- 🤖 **AI Explanations** - GPT-powered clinical context (explanation only, not decision)
- 📊 **JSON Export** - Competition-compliant schema output
- 📱 **Responsive Design** - Modern healthcare UI with Tailwind CSS

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Tailwind CSS 3.4 |
| Backend | Node.js + Express |
| AI/LLM | OpenAI API (GPT-3.5-turbo) |
| Parsing | Custom VCF Parser |
| Logic | CPIC-Aligned Rule Engines |

## 📁 Project Structure

```
PharmaGuard/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── logo.png
│   ├── src/
│   │   ├── App.js              # Main app with landing page
│   │   ├── index.js
│   │   ├── index.css           # Tailwind directives
│   │   └── components/
│   │       ├── FileUpload.js   # VCF upload component
│   │       ├── DrugInput.js    # Drug selection
│   │       └── Results.js      # Analysis results display
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── server.js               # Express server
│   ├── routes/
│   │   └── analyze.js          # API endpoints
│   ├── services/
│   │   ├── phenotypeMapper.js  # CPIC phenotype tables
│   │   ├── riskEngine.js       # Drug risk rules
│   │   └── llmService.js       # OpenAI explanation
│   ├── parser/
│   │   └── vcfParser.js        # VCF file parser
│   ├── .env                    # API keys (not committed)
│   └── package.json
│
├── sample.vcf                  # Test VCF file
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/PharmaGuard.git
cd PharmaGuard
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "PORT=3001" >> .env

# Start server
npm start
```

Backend runs on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## 📡 API Endpoints

### POST `/api/analyze`

Analyze VCF file against specified drugs.

**Request:** `multipart/form-data`
- `vcfFile`: VCF file
- `drugs`: Comma-separated drug names (e.g., "CLOPIDOGREL,CODEINE")

**Response:** Competition-compliant JSON schema

### GET `/api/supported-drugs`

Returns list of supported drugs.

### POST `/api/validate-vcf`

Validate VCF file without full analysis.

## 💊 Supported Drugs & Genes

| Drug | Gene | Key Variants |
|------|------|--------------|
| CLOPIDOGREL | CYP2C19 | rs4244285 (*2), rs12248560 (*17) |
| CODEINE | CYP2D6 | rs3892097 (*4), rs5030655 (*6) |
| WARFARIN | CYP2C9 | rs1799853 (*2), rs1057910 (*3) |
| SIMVASTATIN | SLCO1B1 | rs4149056 (*5) |
| AZATHIOPRINE | TPMT | rs1800462 (*2), rs1142345 (*3A) |
| FLUOROURACIL | DPYD | rs3918290 (*2A), rs67376798 |

## 🧬 CPIC Phenotype Classification

### CYP2C19 (Clopidogrel)
| Diplotype | Phenotype |
|-----------|-----------|
| *1/*1 | Normal Metabolizer (NM) |
| *1/*17 | Rapid Metabolizer (RM) |
| *17/*17 | Ultra-rapid Metabolizer (UM) |
| *1/*2, *1/*3, **\*2/\*17** | Intermediate Metabolizer (IM) |
| *2/*2, *2/*3, *3/*3 | Poor Metabolizer (PM) |

> ⚠️ Note: `*2/*17` is correctly classified as **IM** (not RM) per CPIC guidelines

### CYP2D6 (Codeine)
| Diplotype | Phenotype |
|-----------|-----------|
| *1/*1 | NM |
| *1/*4 | IM |
| *4/*4 | PM |
| *1/*2xN | UM |

## ⚠️ Risk Classification

| Risk Label | Severity | Clinical Meaning |
|------------|----------|------------------|
| 🟢 Safe | none | Standard dosing appropriate |
| 🟡 Adjust Dosage | moderate | Dose modification per CPIC |
| 🔴 Toxic | critical | High toxicity risk, avoid or reduce significantly |
| 🔴 Ineffective | high | Therapeutic failure expected |
| ⚪ Unknown | low | Insufficient data |

## 📤 JSON Output Schema

```json
{
  "patient_id": "PATIENT_XXX",
  "drug": "CLOPIDOGREL",
  "timestamp": "2026-02-19T10:30:00.000Z",
  "risk_assessment": {
    "risk_label": "Adjust Dosage",
    "confidence_score": 0.90,
    "severity": "moderate"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2C19",
    "diplotype": "*2/*17",
    "phenotype": "IM",
    "detected_variants": [
      { "rsid": "rs4244285" },
      { "rsid": "rs12248560" }
    ]
  },
  "clinical_recommendation": {
    "action": "Dose modification recommended...",
    "rationale": "Reduced CYP2C19 function may decrease..."
  },
  "llm_generated_explanation": {
    "summary": "...",
    "mechanism": "...",
    "clinical_impact": "..."
  },
  "quality_metrics": {
    "vcf_parsing_success": true
  }
}
```

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │FileUpload│  │DrugInput │  │ Results  │                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                   │
└───────┼─────────────┼─────────────┼─────────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  /api/analyze                        │    │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │    │
│  │  │VCF Parser│→ │Phenotype   │→ │Risk Engine      │  │    │
│  │  │          │  │Mapper      │  │(CPIC Rules)     │  │    │
│  │  └──────────┘  │(CPIC Rules)│  └────────┬────────┘  │    │
│  │                └────────────┘           │           │    │
│  │                                         ▼           │    │
│  │                              ┌─────────────────────┐│    │
│  │                              │ LLM Service        ││    │
│  │                              │ (Explanation Only) ││    │
│  │                              └─────────────────────┘│    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📖 Usage Examples

### Example 1: Analyzing Clopidogrel Risk

1. Upload a VCF file containing CYP2C19 variants
2. Select "CLOPIDOGREL" from the drug list
3. Click "Analyze"

**Sample Input:**
```
Variants: rs4244285 (CYP2C19*2), rs12248560 (CYP2C19*17)
Drug: CLOPIDOGREL
```

**Expected Output:**
```json
{
  "diplotype": "*2/*17",
  "phenotype": "IM",
  "risk_label": "Adjust Dosage",
  "severity": "moderate"
}
```

### Example 2: Codeine Ultra-Rapid Metabolizer Detection

**Sample Input:**
```
Variants: rs1080985 (CYP2D6*2xN duplication)
Drug: CODEINE
```

**Expected Output:**
```json
{
  "diplotype": "*1/*2xN",
  "phenotype": "UM",
  "risk_label": "Toxic",
  "severity": "critical"
}
```

### Example 3: Testing via cURL

```bash
curl -X POST http://localhost:3001/api/analyze \
  -F "vcfFile=@sample.vcf" \
  -F "drugs=CLOPIDOGREL,CODEINE"
```

### Example 4: Multiple Drug Analysis

```bash
# Analyze multiple drugs at once
curl -X POST http://localhost:3001/api/analyze \
  -F "vcfFile=@patient_data.vcf" \
  -F "drugs=CLOPIDOGREL,WARFARIN,SIMVASTATIN"
```

---

## 👥 Team Members

| Name | Role | LinkedIn |
|------|------|----------|
| **Mohit** | Full Stack Developer | [LinkedIn Profile](https://linkedin.com/in/YOUR_PROFILE) |
| *Add Team Member* | *Role* | *LinkedIn* |
| *Add Team Member* | *Role* | *LinkedIn* |

> 📝 *Update with your actual team member information*

---

## 🙏 Acknowledgments

- [CPIC (Clinical Pharmacogenetics Implementation Consortium)](https://cpicpgx.org/) for pharmacogenomic guidelines
- [PharmGKB](https://www.pharmgkb.org/) for drug-gene interaction data
- [OpenAI](https://openai.com/) for GPT API
- RIFT 2026 Hackathon organizers

---

## ⚠️ Disclaimer

**FOR DEMONSTRATION AND EDUCATIONAL PURPOSES ONLY**

This application is a hackathon project. While it implements CPIC-aligned logic, it:
- Has NOT been clinically validated
- Should NOT be used for actual patient care
- Is NOT a substitute for professional medical advice

Always consult qualified healthcare professionals for pharmacogenomic guidance.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---