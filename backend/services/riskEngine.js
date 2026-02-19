/**
 * Drug Risk Engine Module
 * CPIC-Aligned Rule-Based Drug Risk Prediction
 * NO LLM involvement in decision making - Pure deterministic logic
 */

// ============================================================================
// DRUG-GENE MAPPING
// ============================================================================

const DRUG_GENE_MAP = {
  'CODEINE': 'CYP2D6',
  'CLOPIDOGREL': 'CYP2C19',
  'WARFARIN': 'CYP2C9',
  'SIMVASTATIN': 'SLCO1B1',
  'AZATHIOPRINE': 'TPMT',
  'FLUOROURACIL': 'DPYD',
  '5-FLUOROURACIL': 'DPYD',
  '5-FU': 'DPYD',
};

const SUPPORTED_DRUGS = Object.keys(DRUG_GENE_MAP);

// ============================================================================
// STEP 2: CPIC-ALIGNED DRUG RISK RULES
// Risk labels: Safe, Adjust Dosage, Toxic, Ineffective, Unknown
// ============================================================================

/**
 * CLOPIDOGREL Risk Rules (CYP2C19)
 * CPIC Level A - Strong recommendation
 */
const CLOPIDOGREL_RISK = {
  'PM': { risk: 'Ineffective', severity: 'high', confidence: 0.95 },
  'IM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.90 },
  'NM': { risk: 'Safe', severity: 'none', confidence: 0.95 },
  'RM': { risk: 'Safe', severity: 'none', confidence: 0.90 },
  'UM': { risk: 'Safe', severity: 'none', confidence: 0.90 },
  'Unknown': { risk: 'Unknown', severity: 'low', confidence: 0.50 },
};

/**
 * CODEINE Risk Rules (CYP2D6)
 * CPIC Level A - Strong recommendation
 */
const CODEINE_RISK = {
  'PM': { risk: 'Ineffective', severity: 'high', confidence: 0.95 },
  'IM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.90 },
  'NM': { risk: 'Safe', severity: 'none', confidence: 0.95 },
  'RM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.85 },
  'UM': { risk: 'Toxic', severity: 'critical', confidence: 0.95 },
  'Unknown': { risk: 'Unknown', severity: 'low', confidence: 0.50 },
};

/**
 * WARFARIN Risk Rules (CYP2C9)
 * CPIC Level A - Strong recommendation
 */
const WARFARIN_RISK = {
  'PM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.95 },
  'IM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.90 },
  'NM': { risk: 'Safe', severity: 'none', confidence: 0.95 },
  'RM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'UM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'Unknown': { risk: 'Unknown', severity: 'low', confidence: 0.50 },
};

/**
 * SIMVASTATIN Risk Rules (SLCO1B1)
 * CPIC Level A - Strong recommendation
 */
const SIMVASTATIN_RISK = {
  'PM': { risk: 'Toxic', severity: 'critical', confidence: 0.95 },
  'IM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.90 },
  'NM': { risk: 'Safe', severity: 'none', confidence: 0.95 },
  'RM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'UM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'Unknown': { risk: 'Unknown', severity: 'low', confidence: 0.50 },
};

/**
 * AZATHIOPRINE Risk Rules (TPMT)
 * CPIC Level A - Strong recommendation
 */
const AZATHIOPRINE_RISK = {
  'PM': { risk: 'Toxic', severity: 'critical', confidence: 0.95 },
  'IM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.90 },
  'NM': { risk: 'Safe', severity: 'none', confidence: 0.95 },
  'RM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'UM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'Unknown': { risk: 'Unknown', severity: 'low', confidence: 0.50 },
};

/**
 * FLUOROURACIL Risk Rules (DPYD)
 * CPIC Level A - Strong recommendation
 */
const FLUOROURACIL_RISK = {
  'PM': { risk: 'Toxic', severity: 'critical', confidence: 0.95 },
  'IM': { risk: 'Adjust Dosage', severity: 'moderate', confidence: 0.90 },
  'NM': { risk: 'Safe', severity: 'none', confidence: 0.95 },
  'RM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'UM': { risk: 'Safe', severity: 'none', confidence: 0.85 },
  'Unknown': { risk: 'Unknown', severity: 'low', confidence: 0.50 },
};

/**
 * Master Drug Risk Rules Table
 */
const RISK_RULES = {
  'CODEINE': CODEINE_RISK,
  'CLOPIDOGREL': CLOPIDOGREL_RISK,
  'WARFARIN': WARFARIN_RISK,
  'SIMVASTATIN': SIMVASTATIN_RISK,
  'AZATHIOPRINE': AZATHIOPRINE_RISK,
  'FLUOROURACIL': FLUOROURACIL_RISK,
  '5-FLUOROURACIL': FLUOROURACIL_RISK,
  '5-FU': FLUOROURACIL_RISK,
};

// ============================================================================
// STEP 3: SEVERITY MAPPING (Aligned with risk labels)
// ============================================================================

const SEVERITY_MAP = {
  'Safe': 'none',
  'Adjust Dosage': 'moderate',
  'Ineffective': 'high',
  'Toxic': 'critical',
  'Unknown': 'low',
};

// ============================================================================
// STEP 4: CLINICAL RECOMMENDATIONS (Deterministic Templates)
// ============================================================================

/**
 * Clinical action templates - NO LLM involvement
 */
const CLINICAL_ACTIONS = {
  'Safe': 'Standard dosing recommended. No pharmacogenomic adjustments required.',
  'Adjust Dosage': 'Dose modification recommended based on pharmacogenomic profile. Consult CPIC guidelines for specific dosing recommendations.',
  'Toxic': 'High risk of severe toxicity. Avoid use or consider significant dose reduction (>50%) under specialist supervision. Alternative therapy strongly recommended.',
  'Ineffective': 'Reduced or no therapeutic effect expected due to altered metabolism. Consider alternative medication with different metabolic pathway.',
  'Unknown': 'Insufficient pharmacogenomic data for recommendation. Standard clinical monitoring advised.',
};

/**
 * Drug-specific clinical rationale templates
 */
const DRUG_RATIONALES = {
  'CLOPIDOGREL': {
    'Safe': 'CYP2C19 metabolizer status indicates normal conversion of clopidogrel to its active metabolite. Standard antiplatelet effect expected.',
    'Adjust Dosage': 'Reduced CYP2C19 function may decrease conversion to active metabolite. Consider prasugrel or ticagrelor as alternatives per CPIC guidelines.',
    'Ineffective': 'Poor CYP2C19 metabolism significantly impairs clopidogrel activation. High risk of treatment failure. Use alternative P2Y12 inhibitor (prasugrel/ticagrelor).',
    'Unknown': 'Unable to determine CYP2C19 metabolizer status. Monitor for adequate antiplatelet response.',
  },
  'CODEINE': {
    'Safe': 'CYP2D6 normal metabolizer status indicates appropriate conversion of codeine to morphine. Standard analgesic effect expected.',
    'Adjust Dosage': 'Altered CYP2D6 function affects morphine formation. Consider dose adjustment or alternative analgesic.',
    'Toxic': 'Ultra-rapid CYP2D6 metabolism causes excessive morphine formation. HIGH RISK of respiratory depression and death. AVOID codeine. Use alternative analgesic.',
    'Ineffective': 'Poor CYP2D6 metabolism prevents conversion to morphine. No analgesic effect expected. Use alternative pain medication.',
    'Unknown': 'Unable to determine CYP2D6 metabolizer status. Monitor closely for efficacy and adverse effects.',
  },
  'WARFARIN': {
    'Safe': 'CYP2C9 normal function indicates standard warfarin metabolism. Standard dosing algorithm appropriate.',
    'Adjust Dosage': 'Reduced CYP2C9 function decreases warfarin metabolism. Initiate with lower dose and monitor INR closely. Use CPIC/IWPC dosing algorithm.',
    'Unknown': 'Unable to determine CYP2C9 metabolizer status. Initiate therapy cautiously with frequent INR monitoring.',
  },
  'SIMVASTATIN': {
    'Safe': 'SLCO1B1 normal function indicates standard hepatic uptake of simvastatin. Standard dosing appropriate.',
    'Adjust Dosage': 'Decreased SLCO1B1 function increases systemic simvastatin exposure. Limit dose to 20mg/day or consider alternative statin (pravastatin, rosuvastatin).',
    'Toxic': 'Poor SLCO1B1 function significantly increases myopathy risk. AVOID simvastatin >20mg. Consider pravastatin or rosuvastatin which are less SLCO1B1-dependent.',
    'Unknown': 'Unable to determine SLCO1B1 function status. Consider lower starting dose with monitoring for muscle symptoms.',
  },
  'AZATHIOPRINE': {
    'Safe': 'TPMT normal activity indicates standard thiopurine metabolism. Standard immunosuppressive dosing appropriate.',
    'Adjust Dosage': 'Intermediate TPMT activity increases risk of myelosuppression. Reduce dose by 30-70% per CPIC guidelines. Monitor CBC weekly initially.',
    'Toxic': 'Deficient TPMT activity causes severe, life-threatening myelosuppression. Reduce dose by 90% or AVOID. If used, requires intensive monitoring.',
    'Unknown': 'Unable to determine TPMT activity. Consider lower starting dose with frequent CBC monitoring.',
  },
  'FLUOROURACIL': {
    'Safe': 'DPYD normal activity indicates standard fluoropyrimidine metabolism. Standard oncology dosing appropriate.',
    'Adjust Dosage': 'Decreased DPYD activity increases toxicity risk. Reduce starting dose by 25-50% per CPIC guidelines. Monitor closely for toxicity.',
    'Toxic': 'Deficient DPYD activity causes severe, potentially fatal toxicity (mucositis, myelosuppression, neurotoxicity). AVOID fluoropyrimidines or reduce dose by ≥50%.',
    'Unknown': 'Unable to determine DPYD activity. Consider phenotyping or cautious dosing with close toxicity monitoring.',
  },
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate drug name against supported drugs
 * @param {string} drugName - Drug name to validate
 * @returns {object} Validation result
 */
function validateDrug(drugName) {
  if (!drugName || typeof drugName !== 'string') {
    return { valid: false, error: 'Drug name is required' };
  }

  const normalized = drugName.trim().toUpperCase();
  
  if (!SUPPORTED_DRUGS.includes(normalized)) {
    return { 
      valid: false, 
      error: `Unsupported drug: ${drugName}. Supported drugs: ${SUPPORTED_DRUGS.join(', ')}`,
      supportedDrugs: SUPPORTED_DRUGS
    };
  }

  return { valid: true, normalizedName: normalized };
}

/**
 * Parse drug input (single or comma-separated)
 * @param {string} drugInput - Drug input string
 * @returns {Array} Array of validated drug objects
 */
function parseDrugInput(drugInput) {
  if (!drugInput || typeof drugInput !== 'string') {
    return [];
  }

  const drugs = drugInput.split(',').map(d => d.trim().toUpperCase()).filter(d => d);
  const results = [];

  for (const drug of drugs) {
    const validation = validateDrug(drug);
    results.push({
      original: drug,
      ...validation
    });
  }

  return results;
}

/**
 * Get primary gene for a drug
 * @param {string} drug - Drug name (uppercase)
 * @returns {string} Gene symbol
 */
function getPrimaryGene(drug) {
  return DRUG_GENE_MAP[drug] || null;
}

// ============================================================================
// STEP 5: RISK CALCULATION - PURE RULE ENGINE (NO LLM)
// ============================================================================

/**
 * Calculate risk assessment for a drug-phenotype combination
 * THIS IS THE CORE RULE-BASED FUNCTION - NO LLM INVOLVEMENT
 * 
 * @param {string} drug - Drug name (uppercase)
 * @param {string} phenotype - Phenotype code (PM, IM, NM, RM, UM, Unknown)
 * @param {boolean} hasVariants - Whether variants were detected (for fallback)
 * @returns {object} Risk assessment with consistent severity mapping
 */
function calculateRisk(drug, phenotype, hasVariants = false) {
  const normalizedDrug = drug.toUpperCase().trim();
  const drugRules = RISK_RULES[normalizedDrug];
  
  // STEP 6: Fallback for unknown drug
  if (!drugRules) {
    return {
      risk_label: 'Unknown',
      confidence_score: 0.0,
      severity: 'low' // Aligned severity for Unknown
    };
  }

  // STEP 6: Fallback for unknown phenotype
  if (!phenotype || phenotype === 'Unknown') {
    return {
      risk_label: 'Unknown',
      confidence_score: 0.50,
      severity: 'low' // Aligned severity for Unknown
    };
  }

  // Direct lookup in CPIC-aligned rules
  const riskData = drugRules[phenotype];
  
  if (!riskData) {
    // Phenotype not in rules - return Unknown (NEVER guess)
    return {
      risk_label: 'Unknown',
      confidence_score: 0.50,
      severity: 'low'
    };
  }

  // STEP 3: Ensure severity is aligned with risk label
  const alignedSeverity = SEVERITY_MAP[riskData.risk] || riskData.severity;
  
  return {
    risk_label: riskData.risk,
    confidence_score: riskData.confidence,
    severity: alignedSeverity
  };
}

// ============================================================================
// CLINICAL RECOMMENDATION - DETERMINISTIC TEMPLATE (NO LLM)
// ============================================================================

/**
 * Get clinical recommendation based on risk
 * THIS IS DETERMINISTIC - NO LLM INVOLVEMENT
 * 
 * @param {string} riskLabel - Risk label from calculateRisk
 * @param {string} drug - Drug name
 * @param {string} phenotype - Phenotype code
 * @returns {object} Clinical recommendation with action and rationale
 */
function getClinicalRecommendation(riskLabel, drug, phenotype) {
  const normalizedDrug = drug.toUpperCase().trim();
  
  // Get generic action
  const action = CLINICAL_ACTIONS[riskLabel] || CLINICAL_ACTIONS['Unknown'];
  
  // Get drug-specific rationale if available
  const drugRationales = DRUG_RATIONALES[normalizedDrug];
  let rationale;
  
  if (drugRationales && drugRationales[riskLabel]) {
    rationale = drugRationales[riskLabel];
  } else {
    // Fallback to generic rationale
    const gene = DRUG_GENE_MAP[normalizedDrug] || 'relevant gene';
    const phenotypeDesc = phenotype || 'Unknown';
    
    switch (riskLabel) {
      case 'Safe':
        rationale = `${phenotypeDesc} phenotype for ${gene} indicates standard ${normalizedDrug} metabolism. No dose adjustment required.`;
        break;
      case 'Adjust Dosage':
        rationale = `${phenotypeDesc} phenotype for ${gene} indicates altered ${normalizedDrug} metabolism. Dose modification per CPIC guidelines recommended.`;
        break;
      case 'Toxic':
        rationale = `${phenotypeDesc} phenotype for ${gene} indicates significantly altered metabolism with high toxicity risk for ${normalizedDrug}.`;
        break;
      case 'Ineffective':
        rationale = `${phenotypeDesc} phenotype for ${gene} indicates reduced drug activation, leading to therapeutic failure with ${normalizedDrug}.`;
        break;
      default:
        rationale = `Unable to determine ${gene} metabolizer status. Clinical monitoring recommended before ${normalizedDrug} administration.`;
    }
  }

  return {
    action: action,
    rationale: rationale
  };
}

/**
 * Get complete risk assessment with all aligned fields
 * Ensures phenotype → risk → recommendation consistency
 * 
 * @param {string} drug - Drug name
 * @param {string} gene - Gene symbol
 * @param {string} diplotype - Diplotype string
 * @param {string} phenotype - Phenotype code
 * @returns {object} Complete aligned risk assessment
 */
function getCompleteRiskAssessment(drug, gene, diplotype, phenotype) {
  const normalizedDrug = drug.toUpperCase().trim();
  
  // Calculate risk using rule engine
  const riskAssessment = calculateRisk(normalizedDrug, phenotype);
  
  // Get clinical recommendation (deterministic)
  const recommendation = getClinicalRecommendation(
    riskAssessment.risk_label, 
    normalizedDrug, 
    phenotype
  );
  
  // Return fully aligned assessment
  return {
    drug: normalizedDrug,
    gene: gene,
    diplotype: diplotype,
    phenotype: phenotype,
    risk_assessment: riskAssessment,
    clinical_recommendation: recommendation,
    // Metadata for LLM explanation generation (LLM receives, doesn't decide)
    llm_context: {
      gene: gene,
      diplotype: diplotype,
      phenotype: phenotype,
      drug: normalizedDrug,
      risk_label: riskAssessment.risk_label,
      severity: riskAssessment.severity,
    }
  };
}

module.exports = {
  validateDrug,
  parseDrugInput,
  getPrimaryGene,
  calculateRisk,
  getClinicalRecommendation,
  getCompleteRiskAssessment,
  DRUG_GENE_MAP,
  SUPPORTED_DRUGS,
  RISK_RULES,
  SEVERITY_MAP,
  CLINICAL_ACTIONS,
};
