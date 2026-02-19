/**
 * LLM Explanation Service
 * Generates pharmacogenomic explanations using OpenAI API
 * 
 * IMPORTANT: LLM is used ONLY for explanation generation.
 * All decisions (phenotype, risk, recommendation) are made by rule engines.
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate LLM explanation for pharmacogenomic risk
 * LLM receives pre-determined values from rule engine - it does NOT make decisions
 * 
 * @param {object} params - Parameters for explanation
 * @param {string} params.drug - Drug name
 * @param {string} params.gene - Gene symbol
 * @param {string} params.diplotype - Diplotype (determined by rule engine)
 * @param {string} params.phenotype - Phenotype (determined by rule engine)
 * @param {string} params.riskLabel - Risk label (determined by rule engine)
 * @param {string} params.severity - Severity (determined by rule engine)
 * @param {Array} params.variants - Detected variants
 * @returns {object} LLM generated explanation
 */
async function generateExplanation(params) {
  const { drug, gene, diplotype, phenotype, riskLabel, severity, variants = [] } = params;

  const rsids = variants.map(v => v.rsid).filter(r => r).join(', ') || 'None detected';

  // LLM receives ALL pre-determined values - it explains, not decides
  const prompt = `You are explaining a pharmacogenomic analysis result. The following has been determined by CPIC-aligned clinical rules:

PATIENT DATA:
- Gene: ${gene}
- Diplotype: ${diplotype}
- Phenotype: ${phenotype} (rule-based determination)
- Variants detected: ${rsids}

CLINICAL DECISION (pre-determined by CPIC rules):
- Drug: ${drug}
- Risk Assessment: ${riskLabel}
- Severity: ${severity}

Your task is to EXPLAIN why this ${riskLabel} assessment is clinically appropriate for a ${phenotype} patient taking ${drug}. Do NOT contradict or change the pre-determined risk assessment.

Provide:
1. Summary: One sentence explaining the drug-gene interaction and the ${riskLabel} classification
2. Mechanism: How ${phenotype} status specifically affects ${drug} metabolism/action (2-3 sentences)
3. Clinical Impact: What ${riskLabel} means for this patient's treatment (2-3 sentences)

Be concise and clinically accurate.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a clinical pharmacogenomics expert. Your role is to EXPLAIN pre-determined clinical decisions based on CPIC guidelines. Never contradict the provided risk assessment - only explain why it is appropriate. Focus on clinical relevance and actionable information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5, // Lower temperature for more consistent explanations
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content || '';
    return parseExplanation(content, drug, gene, phenotype, riskLabel);

  } catch (error) {
    console.error('OpenAI API error:', error.message);
    // Return fallback explanation with pre-determined values
    return getFallbackExplanation(drug, gene, diplotype, phenotype, riskLabel);
  }
}

/**
 * Parse LLM response into structured format
 * @param {string} content - Raw LLM response
 * @param {string} drug - Drug name
 * @param {string} gene - Gene symbol
 * @param {string} phenotype - Phenotype
 * @param {string} riskLabel - Pre-determined risk label
 * @returns {object} Structured explanation
 */
function parseExplanation(content, drug, gene, phenotype, riskLabel = 'Unknown') {
  // Try to extract sections
  let summary = '';
  let mechanism = '';
  let clinicalImpact = '';

  // Split by numbered sections or keywords
  const summaryMatch = content.match(/(?:1\.|Summary:?)\s*([^2\n]+(?:\n(?![2-3]\.)[^\n]+)*)/i);
  const mechanismMatch = content.match(/(?:2\.|Mechanism:?)\s*([^3\n]+(?:\n(?![1-3]\.)[^\n]+)*)/i);
  const impactMatch = content.match(/(?:3\.|Clinical Impact:?)\s*(.+)/is);

  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  }
  if (mechanismMatch) {
    mechanism = mechanismMatch[1].trim();
  }
  if (impactMatch) {
    clinicalImpact = impactMatch[1].trim();
  }

  // Fallback: if parsing fails, use the whole content
  if (!summary && !mechanism && !clinicalImpact) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    summary = sentences[0]?.trim() || `${gene} affects ${drug} metabolism, resulting in ${riskLabel} assessment.`;
    mechanism = sentences[1]?.trim() || `Genetic variation in ${gene} alters drug processing.`;
    clinicalImpact = sentences.slice(2).join('. ').trim() || `${phenotype} phenotype with ${riskLabel} risk requires clinical consideration.`;
  }

  return {
    summary: summary || `${gene} genetic variation affects ${drug} metabolism.`,
    mechanism: mechanism || `The ${gene} gene encodes an enzyme involved in ${drug} metabolism.`,
    clinical_impact: clinicalImpact || `Patients with ${phenotype} phenotype may experience altered drug response.`
  };
}

/**
 * Get fallback explanation when LLM is unavailable
 * Uses pre-determined values from rule engine
 * @param {string} drug - Drug name
 * @param {string} gene - Gene symbol
 * @param {string} diplotype - Diplotype
 * @param {string} phenotype - Phenotype
 * @param {string} riskLabel - Pre-determined risk label
 * @returns {object} Fallback explanation
 */
function getFallbackExplanation(drug, gene, diplotype, phenotype, riskLabel = 'Unknown') {
  const explanations = {
    'CYP2D6': {
      summary: `CYP2D6 ${phenotype} status results in ${riskLabel} assessment for ${drug} due to altered codeine-to-morphine conversion.`,
      mechanism: `The ${diplotype} diplotype results in ${phenotype} enzyme activity, affecting codeine-to-morphine conversion.`,
      clinical_impact: getPhenotypeImpact(phenotype, 'CYP2D6', drug, riskLabel)
    },
    'CYP2C19': {
      summary: `CYP2C19 ${phenotype} status results in ${riskLabel} assessment for ${drug} due to altered prodrug activation.`,
      mechanism: `The ${diplotype} diplotype results in ${phenotype} enzyme activity, affecting clopidogrel activation.`,
      clinical_impact: getPhenotypeImpact(phenotype, 'CYP2C19', drug, riskLabel)
    },
    'CYP2C9': {
      summary: `CYP2C9 ${phenotype} status results in ${riskLabel} assessment for ${drug} due to altered drug clearance.`,
      mechanism: `The ${diplotype} diplotype results in ${phenotype} enzyme activity, affecting warfarin metabolism.`,
      clinical_impact: getPhenotypeImpact(phenotype, 'CYP2C9', drug, riskLabel)
    },
    'SLCO1B1': {
      summary: `SLCO1B1 ${phenotype} function results in ${riskLabel} assessment for ${drug} due to altered hepatic uptake.`,
      mechanism: `Variants in SLCO1B1 alter hepatic uptake of simvastatin, increasing systemic exposure.`,
      clinical_impact: getPhenotypeImpact(phenotype, 'SLCO1B1', drug, riskLabel)
    },
    'TPMT': {
      summary: `TPMT ${phenotype} status results in ${riskLabel} assessment for ${drug} due to altered thiopurine metabolism.`,
      mechanism: `The ${diplotype} diplotype results in ${phenotype} enzyme activity, affecting thiopurine metabolism.`,
      clinical_impact: getPhenotypeImpact(phenotype, 'TPMT', drug, riskLabel)
    },
    'DPYD': {
      summary: `DPYD ${phenotype} status results in ${riskLabel} assessment for ${drug} due to altered fluoropyrimidine clearance.`,
      mechanism: `The ${diplotype} diplotype results in ${phenotype} enzyme activity, affecting fluorouracil clearance.`,
      clinical_impact: getPhenotypeImpact(phenotype, 'DPYD', drug, riskLabel)
    }
  };

  return explanations[gene] || {
    summary: `${gene} ${phenotype} status results in ${riskLabel} assessment for ${drug}.`,
    mechanism: `The ${diplotype} diplotype indicates ${phenotype} enzyme/transporter activity.`,
    clinical_impact: `${riskLabel} assessment requires appropriate clinical management for ${drug}.`
  };
}

/**
 * Get phenotype-specific clinical impact text aligned with risk label
 * @param {string} phenotype - Phenotype code
 * @param {string} gene - Gene symbol
 * @param {string} drug - Drug name
 * @param {string} riskLabel - Pre-determined risk label
 * @returns {string} Clinical impact text
 */
function getPhenotypeImpact(phenotype, gene, drug, riskLabel = 'Unknown') {
  // Risk-label aligned impact statements
  const riskImpacts = {
    'Safe': `Standard ${drug} dosing should be effective with typical safety profile for ${phenotype} patients.`,
    'Adjust Dosage': `${phenotype} status requires dose adjustment for ${drug} to optimize therapeutic effect and minimize adverse effects per CPIC guidelines.`,
    'Toxic': `${phenotype} status significantly increases toxicity risk with ${drug}. Alternative therapy or major dose reduction strongly recommended.`,
    'Ineffective': `${phenotype} status leads to reduced or no therapeutic effect with ${drug}. Alternative medication recommended.`,
    'Unknown': `Unknown metabolizer status requires additional clinical assessment for ${drug}.`
  };

  return riskImpacts[riskLabel] || riskImpacts['Unknown'];
}

module.exports = {
  generateExplanation,
  getFallbackExplanation,
  parseExplanation
};
