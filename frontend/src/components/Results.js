import React, { useState } from 'react';

function Results({ data, onReset }) {
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    explanation: true,
    recommendation: true,
    json: false
  });

  // Handle both old format (data.results) and new format (direct result or array)
  let results;
  if (data.results) {
    // Old format with wrapper
    results = Array.isArray(data.results) ? data.results : [data.results];
  } else if (Array.isArray(data)) {
    // New format: direct array
    results = data;
  } else if (data.risk_assessment) {
    // New format: single result object
    results = [data];
  } else {
    // Fallback
    results = [];
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRiskStyles = (riskLabel) => {
    switch (riskLabel) {
      case 'Safe':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          icon: 'bg-emerald-100',
          badge: 'bg-emerald-600'
        };
      case 'Adjust Dosage':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          icon: 'bg-amber-100',
          badge: 'bg-amber-500'
        };
      case 'Toxic':
      case 'Ineffective':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: 'bg-red-100',
          badge: 'bg-red-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: 'bg-gray-100',
          badge: 'bg-gray-600'
        };
    }
  };

  const getRiskIcon = (riskLabel) => {
    switch (riskLabel) {
      case 'Safe':
        return (
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Adjust Dosage':
        return (
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'Toxic':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      case 'Ineffective':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadJSON = (result) => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaguard_${result.drug}_${result.patient_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-gray-500 mt-1">Pharmacogenomic risk assessment complete</p>
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          onClick={onReset}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Analysis
        </button>
      </div>

      {/* Metadata Bar */}
      {data.metadata && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-teal-50 rounded-xl mb-8 border border-teal-100">
          <div className="flex items-center gap-2 text-teal-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="font-medium">{data.metadata.totalDrugsAnalyzed} drug(s) analyzed</span>
          </div>
          <div className="w-px h-4 bg-teal-200 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-teal-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">{data.metadata.totalVariantsInFile} variants in file</span>
          </div>
        </div>
      )}

      {/* Results */}
      {results.map((result, index) => {
        const styles = getRiskStyles(result.risk_assessment.risk_label);
        
        return (
          <div key={index} className="mb-8 last:mb-0">
            {/* Risk Summary Card */}
            <div className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 mb-6`}>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`${styles.icon} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  {getRiskIcon(result.risk_assessment.risk_label)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{result.drug}</h3>
                    <span className={`${styles.badge} text-white px-4 py-1.5 rounded-full text-sm font-semibold`}>
                      {result.risk_assessment.risk_label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Primary Gene:</span>
                      <span className="ml-2 font-semibold text-gray-900">{result.pharmacogenomic_profile.primary_gene}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Confidence:</span>
                      <span className="ml-2 font-semibold text-gray-900">{(result.risk_assessment.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Severity:</span>
                      <span className={`ml-2 font-semibold capitalize ${
                        result.risk_assessment.severity === 'high' ? 'text-red-600' :
                        result.risk_assessment.severity === 'moderate' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {result.risk_assessment.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Detail Cards */}
            <div className="space-y-4">
              {/* Pharmacogenomic Profile */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('profile')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧬</span>
                    <span className="font-semibold text-gray-900">Pharmacogenomic Profile</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.profile ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.profile && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-500 mb-1">Diplotype</div>
                        <div className="font-mono text-lg font-semibold text-teal-700">{result.pharmacogenomic_profile.diplotype}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-500 mb-1">Phenotype</div>
                        <div className="text-lg font-semibold text-gray-900">{result.pharmacogenomic_profile.phenotype}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-2">Detected Variants</div>
                      <div className="flex flex-wrap gap-2">
                        {result.pharmacogenomic_profile.detected_variants.length > 0 ? (
                          result.pharmacogenomic_profile.detected_variants.map((v, i) => (
                            <span key={i} className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-mono">
                              {v.rsid}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">No variants detected</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Explanation */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('explanation')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <span className="font-semibold text-gray-900">AI Explanation</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.explanation ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.explanation && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="space-y-4 mt-4">
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4">
                        <h4 className="font-semibold text-teal-800 mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Summary
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{result.llm_generated_explanation.summary}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Mechanism
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{result.llm_generated_explanation.mechanism}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Clinical Impact
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{result.llm_generated_explanation.clinical_impact}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clinical Recommendation */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('recommendation')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <span className="font-semibold text-gray-900">Clinical Recommendation</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.recommendation ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.recommendation && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-teal-600 font-medium">Action</div>
                          <div className="text-gray-900 font-medium">{result.clinical_recommendation.action}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 font-medium">Rationale</div>
                          <div className="text-gray-700">{result.clinical_recommendation.rationale}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Raw JSON */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('json')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ }</span>
                    <span className="font-semibold text-gray-900">Raw JSON Data</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.json ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.json && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="flex gap-2 mt-4 mb-3">
                      <button 
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy JSON
                      </button>
                      <button 
                        className="flex items-center gap-2 px-4 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => downloadJSON(result)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download JSON
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="flex flex-wrap items-center gap-4 mt-6 p-4 bg-gray-50 rounded-xl text-sm">
              <span className={`flex items-center gap-2 ${result.quality_metrics.vcf_parsing_success ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.quality_metrics.vcf_parsing_success ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                VCF Parsing
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {result.quality_metrics.variants_detected} variants detected
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Results;
