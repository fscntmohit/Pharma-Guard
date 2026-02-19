/**
 * VCF Parser Module
 * Parses Variant Call Format (VCF) v4.2 files and extracts pharmacogenomic variants
 */

// Target genes for pharmacogenomic analysis
const TARGET_GENES = ['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD'];

/**
 * Parse VCF file content and extract pharmacogenomic variants
 * @param {string} vcfContent - Raw VCF file content
 * @returns {object} Parsed variants grouped by gene
 */
function parseVCF(vcfContent) {
  const lines = vcfContent.split('\n');
  const variants = [];
  const geneVariants = {};
  let headerFound = false;
  let columnIndices = {};

  for (const line of lines) {
    // Skip metadata lines (starting with ##)
    if (line.startsWith('##')) {
      continue;
    }

    // Parse header line (starting with #CHROM)
    if (line.startsWith('#CHROM')) {
      headerFound = true;
      const headers = line.substring(1).split('\t');
      headers.forEach((header, index) => {
        columnIndices[header.toUpperCase()] = index;
      });
      continue;
    }

    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    // Parse variant rows (tab-separated)
    if (headerFound) {
      const fields = line.split('\t');
      const infoIndex = columnIndices['INFO'];
      
      if (infoIndex === undefined || fields.length <= infoIndex) {
        continue;
      }

      const info = fields[infoIndex];
      const parsedInfo = parseINFO(info);

      // Only process variants for target genes
      if (parsedInfo.gene && TARGET_GENES.includes(parsedInfo.gene.toUpperCase())) {
        const variant = {
          chrom: fields[columnIndices['CHROM']] || '',
          pos: fields[columnIndices['POS']] || '',
          id: fields[columnIndices['ID']] || '.',
          ref: fields[columnIndices['REF']] || '',
          alt: fields[columnIndices['ALT']] || '',
          gene_symbol: parsedInfo.gene.toUpperCase(),
          rsid: parsedInfo.rs || parsedInfo.rsid || fields[columnIndices['ID']] || '',
          star_allele: parsedInfo.star || ''
        };

        variants.push(variant);

        // Group by gene
        if (!geneVariants[variant.gene_symbol]) {
          geneVariants[variant.gene_symbol] = [];
        }
        geneVariants[variant.gene_symbol].push(variant);
      }
    }
  }

  return {
    success: headerFound,
    totalVariants: variants.length,
    variants: variants,
    geneVariants: geneVariants,
    targetGenes: TARGET_GENES
  };
}

/**
 * Parse INFO field from VCF
 * Example: GENE=CYP2D6;RS=rs3892097;STAR=*4
 * @param {string} info - INFO field string
 * @returns {object} Parsed key-value pairs
 */
function parseINFO(info) {
  const result = {};
  
  if (!info || info === '.') {
    return result;
  }

  const pairs = info.split(';');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      const normalizedKey = key.toLowerCase();
      result[normalizedKey] = value;
    }
  }

  return result;
}

/**
 * Validate VCF file content
 * @param {string} vcfContent - Raw VCF file content
 * @returns {object} Validation result
 */
function validateVCF(vcfContent) {
  if (!vcfContent || typeof vcfContent !== 'string') {
    return { valid: false, error: 'Empty or invalid file content' };
  }

  const lines = vcfContent.split('\n');
  let hasMetadata = false;
  let hasHeader = false;

  for (const line of lines) {
    if (line.startsWith('##')) {
      hasMetadata = true;
    }
    if (line.startsWith('#CHROM')) {
      hasHeader = true;
      break;
    }
  }

  if (!hasHeader) {
    return { valid: false, error: 'Missing VCF header line (#CHROM)' };
  }

  return { valid: true };
}

module.exports = {
  parseVCF,
  parseINFO,
  validateVCF,
  TARGET_GENES
};
