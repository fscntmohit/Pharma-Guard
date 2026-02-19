import React, { useState } from 'react';

const SUPPORTED_DRUGS = [
  'CODEINE',
  'WARFARIN',
  'CLOPIDOGREL',
  'SIMVASTATIN',
  'AZATHIOPRINE',
  'FLUOROURACIL'
];

function DrugInput({ value, onChange }) {
  const [inputMode, setInputMode] = useState('dropdown'); // 'dropdown' or 'text'

  const handleTextChange = (e) => {
    onChange(e.target.value);
  };

  const handleDrugClick = (drug) => {
    // Add to comma-separated list if not already present
    const currentDrugs = value.split(',').map(d => d.trim().toUpperCase()).filter(d => d);
    
    if (currentDrugs.includes(drug)) {
      // Remove drug
      const newDrugs = currentDrugs.filter(d => d !== drug);
      onChange(newDrugs.join(', '));
    } else {
      // Add drug
      currentDrugs.push(drug);
      onChange(currentDrugs.join(', '));
    }
  };

  const isSelected = (drug) => {
    const currentDrugs = value.split(',').map(d => d.trim().toUpperCase()).filter(d => d);
    return currentDrugs.includes(drug);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <label className="block text-gray-900 font-semibold text-lg">
          Select Drug(s)
        </label>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputMode === 'dropdown'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setInputMode('dropdown')}
          >
            Quick Select
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setInputMode('text')}
          >
            Text Input
          </button>
        </div>
      </div>

      {inputMode === 'dropdown' ? (
        <div className="flex flex-wrap gap-3">
          {SUPPORTED_DRUGS.map((drug) => (
            <button
              key={drug}
              className={`
                px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                flex items-center gap-2 border-2
                ${isSelected(drug)
                  ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50'
                }
              `}
              onClick={() => handleDrugClick(drug)}
            >
              {isSelected(drug) && (
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {drug}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all duration-200 text-gray-900"
            placeholder="Enter drug name(s), comma-separated (e.g., CODEINE, WARFARIN)"
            value={value}
            onChange={handleTextChange}
          />
          <p className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Supported:</span> {SUPPORTED_DRUGS.join(', ')}
          </p>
        </div>
      )}

      {value && (
        <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-teal-700">Selected:</span>
            <div className="flex flex-wrap gap-2">
              {value.split(',').map(d => d.trim()).filter(d => d).map((drug, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg font-medium"
                >
                  {drug}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrugInput;
