/**
 * Analysis Routes
 * Handles VCF file upload and pharmacogenomic analysis
 * 
 * ARCHITECTURE:
 * - Phenotype determination: Rule-based (phenotypeMapper.js)
 * - Risk calculation: Rule-based (riskEngine.js)
 * - Clinical recommendation: Deterministic templates (riskEngine.js)
 * - LLM: Explanation generation ONLY (llmService.js)
 */

const express = require('express');
const router = express.Router();
const { parseVCF, validateVCF } = require('../parser/vcfParser');
const { determineDiplotype, determinePhenotypeByGene, getPhenotypeDescription } = require('../services/phenotypeMapper');
const { validateDrug, parseDrugInput, getPrimaryGene, calculateRisk, getClinicalRecommendation, SUPPORTED_DRUGS } = require('../services/riskEngine');
const { generateExplanation } = require('../services/llmService');

/**
 * POST /api/analyze
 * Analyze VCF file against specified drugs
 * 
 * FLOW:
 * 1. Parse VCF → Extract variants
 * 2. Determine diplotype (rule-based)
 * 3. Determine phenotype (rule-based, gene-specific CPIC tables)
 * 4. Calculate risk (rule-based, CPIC-aligned)
 * 5. Generate recommendation (deterministic templates)
 * 6. Generate explanation (LLM - receives all pre-determined values)
 */
router.post('/analyze', async (req, res) => {
  try {
    const upload = req.app.get('upload');
    
    upload.single('vcfFile')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ error: 'No VCF file uploaded' });
      }

      // Get drug input
      const drugInput = req.body.drugs;
      if (!drugInput) {
        return res.status(400).json({ error: 'Drug name(s) required' });
      }

      // Parse and validate drugs
      const drugs = parseDrugInput(drugInput);
      const validDrugs = drugs.filter(d => d.valid);
      const invalidDrugs = drugs.filter(d => !d.valid);

      if (validDrugs.length === 0) {
        return res.status(400).json({ 
          error: 'No valid drugs specified',
          invalidDrugs: invalidDrugs.map(d => d.original),
          supportedDrugs: SUPPORTED_DRUGS
        });
      }

      // Parse VCF content
      const vcfContent = req.file.buffer.toString('utf-8');
      const validation = validateVCF(vcfContent);
      
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const parsedVCF = parseVCF(vcfContent);
      
      if (!parsedVCF.success) {
        return res.status(400).json({ error: 'Failed to parse VCF file' });
      }

      // Generate analysis for each drug
      const results = [];
      const timestamp = new Date().toISOString();
      const patientId = `PATIENT_${Date.now().toString(36).toUpperCase()}`;

      for (const drug of validDrugs) {
        const drugName = drug.normalizedName;
        const primaryGene = getPrimaryGene(drugName);
        const geneVariants = parsedVCF.geneVariants[primaryGene] || [];
        
        // STEP 1: Determine diplotype (rule-based)
        const diplotype = determineDiplotype(geneVariants);
        
        // STEP 2: Determine phenotype using GENE-SPECIFIC CPIC tables (rule-based)
        // This fixes the CYP2C19 *2/*17 → IM issue
        const phenotype = determinePhenotypeByGene(primaryGene, diplotype);
        
        // STEP 3: Calculate risk using CPIC-aligned rules (rule-based)
        const hasVariants = geneVariants.length > 0;
        const riskAssessment = calculateRisk(drugName, phenotype, hasVariants);
        
        // STEP 4: Get clinical recommendation (deterministic templates)
        const recommendation = getClinicalRecommendation(
          riskAssessment.risk_label, 
          drugName, 
          phenotype
        );
        
        // STEP 5: Generate LLM explanation
        // LLM receives ALL pre-determined values - it explains, does NOT decide
        const explanation = await generateExplanation({
          drug: drugName,
          gene: primaryGene,
          diplotype: diplotype,
          phenotype: phenotype,
          riskLabel: riskAssessment.risk_label,      // Pass pre-determined risk
          severity: riskAssessment.severity,         // Pass pre-determined severity
          variants: geneVariants
        });

        // Build result object matching exact schema (unchanged)
        const result = {
          patient_id: patientId,
          drug: drugName,
          timestamp: timestamp,
          risk_assessment: {
            risk_label: riskAssessment.risk_label,
            confidence_score: parseFloat(riskAssessment.confidence_score.toFixed(2)),
            severity: riskAssessment.severity
          },
          pharmacogenomic_profile: {
            primary_gene: primaryGene,
            diplotype: diplotype,
            phenotype: phenotype,
            detected_variants: geneVariants.map(v => ({ rsid: v.rsid }))
          },
          clinical_recommendation: {
            action: recommendation.action,
            rationale: recommendation.rationale
          },
          llm_generated_explanation: {
            summary: explanation.summary,
            mechanism: explanation.mechanism,
            clinical_impact: explanation.clinical_impact
          },
          quality_metrics: {
            vcf_parsing_success: true
          }
        };

        results.push(result);
      }

      // Return ONLY the result object(s) - no wrapper for competition schema
      const response = results.length === 1 ? results[0] : results;

      res.json(response);
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error during analysis' });
  }
});

/**
 * GET /api/supported-drugs
 * Returns list of supported drugs
 */
router.get('/supported-drugs', (req, res) => {
  res.json({
    drugs: SUPPORTED_DRUGS,
    count: SUPPORTED_DRUGS.length
  });
});

/**
 * POST /api/validate-vcf
 * Validate VCF file without full analysis
 */
router.post('/validate-vcf', (req, res) => {
  try {
    const upload = req.app.get('upload');
    
    upload.single('vcfFile')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ valid: false, error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ valid: false, error: 'No file uploaded' });
      }

      const vcfContent = req.file.buffer.toString('utf-8');
      const validation = validateVCF(vcfContent);
      
      if (!validation.valid) {
        return res.status(400).json(validation);
      }

      const parsed = parseVCF(vcfContent);
      
      res.json({
        valid: true,
        stats: {
          totalVariants: parsed.totalVariants,
          genesFound: Object.keys(parsed.geneVariants),
          variantsByGene: Object.fromEntries(
            Object.entries(parsed.geneVariants).map(([gene, variants]) => [gene, variants.length])
          )
        }
      });
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ valid: false, error: 'Internal server error' });
  }
});

module.exports = router;
