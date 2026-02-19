/**
 * Phenotype Mapper Module
 * CPIC-Aligned Rule-Based Phenotype Classification
 * NO LLM involvement - Pure deterministic mapping
 * 
 * UPDATED: Uses activity-score logic for SLCO1B1 and DPYD
 * to handle allele combinations not in static lookup tables.
 */

// ============================================================================
// ALLELE FUNCTION MAPS (Activity Scores)
// Used for activity-score-based phenotype classification
// ============================================================================

/**
 * SLCO1B1 Allele Function Map
 * *1, *1A, *1B = Normal function (score 1)
 * *5, *15, *17 = Decreased/No function (score 0)
 */
const SLCO1B1_ALLELE_FUNCTION = {
  '*1': 1,
  '*1a': 1,
  '*1A': 1,
  '*1b': 1,
  '*1B': 1,
  '*5': 0,
  '*15': 0,
  '*17': 0,
};

/**
 * DPYD Allele Function Map
 * *1 = Normal function (score 1)
 * *2A = No function (score 0)
 * *5, *13 = Decreased function (score 0.5)
 */
const DPYD_ALLELE_FUNCTION = {
  '*1': 1,
  '*2A': 0,
  '*5': 0.5,
  '*13': 0.5,
};

// ============================================================================
// STEP 1: STRICT DIPLOTYPE → PHENOTYPE MAPPING TABLES (CPIC-Aligned)
// ============================================================================

/**
 * CYP2C19 Diplotype → Phenotype Mapping
 * Based on CPIC guidelines for CYP2C19
 */
const CYP2C19_PHENOTYPE_MAP = {
  '*1/*1': 'NM',    // Normal Metabolizer
  '*1/*17': 'RM',   // Rapid Metabolizer
  '*17/*17': 'UM',  // Ultra-rapid Metabolizer
  '*1/*2': 'IM',    // Intermediate Metabolizer
  '*1/*3': 'IM',    // Intermediate Metabolizer
  '*2/*17': 'IM',   // Intermediate Metabolizer (NOT RM - this was the bug)
  '*3/*17': 'IM',   // Intermediate Metabolizer
  '*2/*2': 'PM',    // Poor Metabolizer
  '*2/*3': 'PM',    // Poor Metabolizer
  '*3/*3': 'PM',    // Poor Metabolizer
};

/**
 * CYP2D6 Diplotype → Phenotype Mapping (Simplified for Hackathon)
 * Based on CPIC guidelines for CYP2D6
 */
const CYP2D6_PHENOTYPE_MAP = {
  '*1/*1': 'NM',      // Normal Metabolizer
  '*1/*2': 'NM',      // Normal Metabolizer
  '*2/*2': 'NM',      // Normal Metabolizer
  '*1/*4': 'IM',      // Intermediate Metabolizer
  '*2/*4': 'IM',      // Intermediate Metabolizer
  '*1/*5': 'IM',      // Intermediate Metabolizer
  '*4/*4': 'PM',      // Poor Metabolizer
  '*4/*5': 'PM',      // Poor Metabolizer
  '*5/*5': 'PM',      // Poor Metabolizer
  '*1/*2xN': 'UM',    // Ultra-rapid Metabolizer (gene duplication)
  '*2xN/*2xN': 'UM',  // Ultra-rapid Metabolizer
  '*1/*1xN': 'UM',    // Ultra-rapid Metabolizer (gene duplication)
};

/**
 * CYP2C9 Diplotype → Phenotype Mapping
 * Based on CPIC guidelines for CYP2C9
 */
const CYP2C9_PHENOTYPE_MAP = {
  '*1/*1': 'NM',    // Normal Metabolizer
  '*1/*2': 'IM',    // Intermediate Metabolizer
  '*1/*3': 'IM',    // Intermediate Metabolizer
  '*2/*2': 'IM',    // Intermediate Metabolizer
  '*2/*3': 'PM',    // Poor Metabolizer
  '*3/*3': 'PM',    // Poor Metabolizer
};

/**
 * SLCO1B1 Diplotype → Phenotype Mapping
 * Based on CPIC guidelines for SLCO1B1
 * rs4149056 is the key variant (521T>C)
 */
const SLCO1B1_PHENOTYPE_MAP = {
  '*1/*1': 'NM',      // Normal Function
  '*1a/*1a': 'NM',    // Normal Function
  '*1a/*1b': 'NM',    // Normal Function
  '*1b/*1b': 'NM',    // Normal Function
  '*1B/*1B': 'NM',    // Normal Function (case variation)
  '*1/*1B': 'NM',     // Normal Function
  '*1/*5': 'IM',      // Decreased Function
  '*1a/*5': 'IM',     // Decreased Function (heterozygous rs4149056)
  '*1b/*5': 'IM',     // Decreased Function
  '*1B/*5': 'IM',     // Decreased Function (case variation)
  '*1a/*15': 'IM',    // Decreased Function
  '*1b/*15': 'IM',    // Decreased Function
  '*1B/*15': 'IM',    // Decreased Function (case variation)
  '*5/*5': 'PM',      // Poor Function (homozygous rs4149056)
  '*15/*15': 'PM',    // Poor Function
  '*5/*15': 'PM',     // Poor Function
};

/**
 * TPMT Diplotype → Phenotype Mapping
 * Based on CPIC guidelines for TPMT
 */
const TPMT_PHENOTYPE_MAP = {
  '*1/*1': 'NM',      // Normal Metabolizer
  '*1/*2': 'IM',      // Intermediate Metabolizer
  '*1/*3A': 'IM',     // Intermediate Metabolizer
  '*1/*3B': 'IM',     // Intermediate Metabolizer
  '*1/*3C': 'IM',     // Intermediate Metabolizer
  '*2/*2': 'PM',      // Poor Metabolizer
  '*3A/*3A': 'PM',    // Poor Metabolizer
  '*3B/*3B': 'PM',    // Poor Metabolizer
  '*3C/*3C': 'PM',    // Poor Metabolizer
  '*2/*3A': 'PM',     // Poor Metabolizer
  '*3B/*3C': 'PM',    // Poor Metabolizer
};

/**
 * DPYD Diplotype → Phenotype Mapping
 * Based on CPIC guidelines for DPYD
 */
const DPYD_PHENOTYPE_MAP = {
  '*1/*1': 'NM',                   // Normal Metabolizer
  'Normal/Normal': 'NM',           // Normal Metabolizer (no variants)
  '*1/*2A': 'PM',                  // Poor Metabolizer (c.1905+1G>A - no function)
  '*2A/*2A': 'PM',                 // Poor Metabolizer
  '*1/*5': 'IM',                   // Intermediate Metabolizer (decreased function)
  '*5/*5': 'PM',                   // Poor Metabolizer (two decreased = PM)
  '*2A/*5': 'PM',                  // Poor Metabolizer (no + decreased = PM)
  '*1/*13': 'IM',                  // Intermediate Metabolizer (c.1679T>G)
  '*1/*rs67376798': 'IM',          // Intermediate Metabolizer (c.2846A>T)
  'Decreased/Normal': 'IM',        // One decreased-function allele
  'Decreased/Decreased': 'PM',     // Two decreased-function alleles
  'NoFunction/Normal': 'PM',       // One no-function allele (treat as PM per CPIC)
};

/**
 * Master gene → phenotype mapping table
 */
const GENE_PHENOTYPE_MAPS = {
  'CYP2C19': CYP2C19_PHENOTYPE_MAP,
  'CYP2D6': CYP2D6_PHENOTYPE_MAP,
  'CYP2C9': CYP2C9_PHENOTYPE_MAP,
  'SLCO1B1': SLCO1B1_PHENOTYPE_MAP,
  'TPMT': TPMT_PHENOTYPE_MAP,
  'DPYD': DPYD_PHENOTYPE_MAP,
};

// ============================================================================
// ACTIVITY SCORE FUNCTIONS
// ============================================================================

/**
 * Calculate phenotype from activity score for SLCO1B1
 * 
 * Rules:
 * - total >= 2 → NM (Normal Function)
 * - total == 1 → IM (Intermediate/Decreased Function)
 * - total == 0 → PM (Poor Function)
 * 
 * @param {string} allele1 - First allele (e.g., "*1B")
 * @param {string} allele2 - Second allele (e.g., "*5")
 * @returns {string|null} Phenotype or null if allele unknown
 */
function calculateSLCO1B1Phenotype(allele1, allele2) {
  const score1 = SLCO1B1_ALLELE_FUNCTION[allele1];
  const score2 = SLCO1B1_ALLELE_FUNCTION[allele2];
  
  // If either allele is unknown, return null (will fall back to Unknown)
  if (score1 === undefined || score2 === undefined) {
    return null;
  }
  
  const total = score1 + score2;
  
  if (total >= 2) return 'NM';
  if (total >= 1) return 'IM';
  return 'PM';
}

/**
 * Calculate phenotype from activity score for DPYD
 * 
 * Rules (per CPIC):
 * - total >= 2 → NM (Normal Metabolizer)
 * - total >= 1 and < 2 → IM (Intermediate Metabolizer)
 * - total < 1 → PM (Poor Metabolizer)
 * 
 * @param {string} allele1 - First allele (e.g., "*2A")
 * @param {string} allele2 - Second allele (e.g., "*5")
 * @returns {string|null} Phenotype or null if allele unknown
 */
function calculateDPYDPhenotype(allele1, allele2) {
  const score1 = DPYD_ALLELE_FUNCTION[allele1];
  const score2 = DPYD_ALLELE_FUNCTION[allele2];
  
  // If either allele is unknown, return null (will fall back to Unknown)
  if (score1 === undefined || score2 === undefined) {
    return null;
  }
  
  const total = score1 + score2;
  
  if (total >= 2) return 'NM';
  if (total >= 1) return 'IM';
  return 'PM';  // total < 1 (e.g., 0.5, 0)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize diplotype string for consistent lookup
 * Ensures consistent ordering (lower allele first) and formatting
 * @param {string} diplotype - Raw diplotype string
 * @returns {string} Normalized diplotype
 */
function normalizeDiplotype(diplotype) {
  if (!diplotype || diplotype === 'Unknown') {
    return 'Unknown';
  }

  // Split and clean
  const parts = diplotype.split('/').map(p => p.trim());
  if (parts.length !== 2) {
    return diplotype; // Return as-is if not standard format
  }

  // Sort alleles for consistent lookup (handle *1, *2, *17, *2xN etc.)
  const sortedParts = parts.sort((a, b) => {
    // Extract numeric part for sorting
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    if (numA !== numB) return numA - numB;
    // If same number, sort alphabetically (e.g., *3A before *3B)
    return a.localeCompare(b);
  });

  return `${sortedParts[0]}/${sortedParts[1]}`;
}

/**
 * Determine diplotype from detected star alleles
 * 
 * DIPLOTYPE CONSTRUCTION RULES:
 * - Two identical alleles (e.g., [*4, *4]) → "*4/*4" (homozygous)
 * - Two different alleles (e.g., [*2, *4]) → "*2/*4" (compound heterozygous)
 * - One allele detected (e.g., [*4]) → "*1/*4" (assume *1 reference)
 * - No alleles → "*1/*1" (assume wild-type)
 * - Diplotype is always sorted lexicographically
 * 
 * @param {Array} variants - Array of variants for a gene
 * @returns {string} Diplotype string (e.g., "*4/*4")
 */
function determineDiplotype(variants) {
  // No variants = assume wild-type *1/*1
  if (!variants || variants.length === 0) {
    return '*1/*1';
  }

  // Extract all star alleles (DO NOT deduplicate - we need to count occurrences)
  const starAlleles = variants
    .map(v => v.star_allele)
    .filter(s => s && s.startsWith('*'));

  // No star alleles found = assume wild-type
  if (starAlleles.length === 0) {
    return '*1/*1';
  }

  // Count occurrences of each star allele
  const alleleCounts = {};
  for (const allele of starAlleles) {
    alleleCounts[allele] = (alleleCounts[allele] || 0) + 1;
  }

  // Get unique alleles sorted lexicographically
  const uniqueAlleles = Object.keys(alleleCounts).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

  // Build diplotype based on allele counts
  let allele1, allele2;

  if (uniqueAlleles.length === 1) {
    // Only one unique allele detected
    const allele = uniqueAlleles[0];
    const count = alleleCounts[allele];

    if (count >= 2) {
      // Two or more of the same allele → homozygous (e.g., *4/*4)
      allele1 = allele;
      allele2 = allele;
    } else {
      // Only one variant allele → heterozygous with *1 (e.g., *1/*4)
      if (allele === '*1') {
        allele1 = '*1';
        allele2 = '*1';
      } else {
        allele1 = '*1';
        allele2 = allele;
      }
    }
  } else if (uniqueAlleles.length >= 2) {
    // Two or more different alleles → compound heterozygous
    // Take the two most frequent, or first two if equal frequency
    allele1 = uniqueAlleles[0];
    allele2 = uniqueAlleles[1];
  }

  // Sort the diplotype lexicographically for consistency
  const sortedDiplotype = [allele1, allele2].sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

  return `${sortedDiplotype[0]}/${sortedDiplotype[1]}`;
}

// ============================================================================
// MAIN PHENOTYPE DETERMINATION - PURE RULE-BASED (NO LLM)
// ============================================================================

/**
 * Determine phenotype from gene and diplotype using CPIC tables
 * Falls back to activity-score calculation for SLCO1B1 and DPYD
 * when diplotype not found in static lookup.
 * 
 * This is the CORE rule-based function - NO LLM involvement
 * 
 * @param {string} gene - Gene symbol (e.g., "CYP2C19")
 * @param {string} diplotype - Diplotype string (e.g., "*2/*17")
 * @returns {string} Phenotype (PM, IM, NM, RM, UM, Unknown)
 */
function determinePhenotypeByGene(gene, diplotype) {
  // Validate inputs
  if (!gene || !diplotype || diplotype === 'Unknown') {
    return 'Unknown';
  }

  const normalizedGene = gene.toUpperCase().trim();
  const normalizedDiplotype = normalizeDiplotype(diplotype);

  // Get the phenotype map for this gene
  const phenotypeMap = GENE_PHENOTYPE_MAPS[normalizedGene];
  
  if (!phenotypeMap) {
    // Gene not in our CPIC tables
    return 'Unknown';
  }

  // Direct lookup in the CPIC table
  const phenotype = phenotypeMap[normalizedDiplotype];
  
  if (phenotype) {
    return phenotype;
  }

  // Try reverse order lookup (e.g., "*17/*2" → "*2/*17")
  const parts = normalizedDiplotype.split('/');
  if (parts.length === 2) {
    const reverseDiplotype = `${parts[1]}/${parts[0]}`;
    const reversePhenotype = phenotypeMap[reverseDiplotype];
    if (reversePhenotype) {
      return reversePhenotype;
    }
  }

  // =========================================================================
  // ACTIVITY SCORE FALLBACK FOR SLCO1B1 AND DPYD
  // If diplotype not in static table, calculate from allele function scores
  // =========================================================================
  
  if (parts.length === 2) {
    const [allele1, allele2] = parts;
    
    // SLCO1B1: Use activity score calculation
    if (normalizedGene === 'SLCO1B1') {
      const activityPhenotype = calculateSLCO1B1Phenotype(allele1, allele2);
      if (activityPhenotype) {
        return activityPhenotype;
      }
    }
    
    // DPYD: Use activity score calculation
    if (normalizedGene === 'DPYD') {
      const activityPhenotype = calculateDPYDPhenotype(allele1, allele2);
      if (activityPhenotype) {
        return activityPhenotype;
      }
    }
  }

  // Diplotype not found in table AND not calculable - return Unknown
  return 'Unknown';
}

/**
 * Legacy function for backward compatibility
 * Determines phenotype without gene context (less accurate)
 * @deprecated Use determinePhenotypeByGene instead
 * @param {string} diplotype - Diplotype string
 * @returns {string} Phenotype
 */
function determinePhenotype(diplotype) {
  // This is kept for backward compatibility but should not be used
  // for CPIC-aligned analysis. Always use determinePhenotypeByGene.
  
  if (!diplotype || diplotype === 'Unknown') {
    return 'Unknown';
  }

  // Try each gene's table (not ideal, but provides fallback)
  for (const [gene, phenotypeMap] of Object.entries(GENE_PHENOTYPE_MAPS)) {
    const normalizedDiplotype = normalizeDiplotype(diplotype);
    if (phenotypeMap[normalizedDiplotype]) {
      return phenotypeMap[normalizedDiplotype];
    }
  }

  return 'Unknown';
}

/**
 * Get full phenotype description
 * @param {string} phenotype - Phenotype code
 * @returns {string} Full description
 */
function getPhenotypeDescription(phenotype) {
  const descriptions = {
    'PM': 'Poor Metabolizer',
    'IM': 'Intermediate Metabolizer',
    'NM': 'Normal Metabolizer',
    'RM': 'Rapid Metabolizer',
    'UM': 'Ultra-rapid Metabolizer',
    'Unknown': 'Unknown Phenotype'
  };
  return descriptions[phenotype] || 'Unknown Phenotype';
}

/**
 * Validate that a phenotype is clinically meaningful for a gene
 * @param {string} gene - Gene symbol
 * @param {string} phenotype - Phenotype code
 * @returns {boolean} Whether the phenotype is valid for the gene
 */
function isValidPhenotypeForGene(gene, phenotype) {
  const validPhenotypes = {
    'CYP2C19': ['PM', 'IM', 'NM', 'RM', 'UM', 'Unknown'],
    'CYP2D6': ['PM', 'IM', 'NM', 'UM', 'Unknown'],
    'CYP2C9': ['PM', 'IM', 'NM', 'Unknown'],
    'SLCO1B1': ['PM', 'IM', 'NM', 'Unknown'],
    'TPMT': ['PM', 'IM', 'NM', 'Unknown'],
    'DPYD': ['PM', 'IM', 'NM', 'Unknown'],
  };

  const allowed = validPhenotypes[gene] || ['Unknown'];
  return allowed.includes(phenotype);
}

module.exports = {
  determineDiplotype,
  determinePhenotype,
  determinePhenotypeByGene,
  getPhenotypeDescription,
  normalizeDiplotype,
  isValidPhenotypeForGene,
  // Export tables for testing
  CYP2C19_PHENOTYPE_MAP,
  CYP2D6_PHENOTYPE_MAP,
  CYP2C9_PHENOTYPE_MAP,
  SLCO1B1_PHENOTYPE_MAP,
  TPMT_PHENOTYPE_MAP,
  DPYD_PHENOTYPE_MAP,
  GENE_PHENOTYPE_MAPS,
};
