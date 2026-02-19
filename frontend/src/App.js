import React, { useState, useCallback, useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload';
import DrugInput from './components/DrugInput';
import Results from './components/Results';

// ✅ Production-ready API base
const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://pharma-guard-uwje.onrender.com";
  
function App() {
  const [vcfFile, setVcfFile] = useState(null);
  const [drugs, setDrugs] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const analysisRef = useRef(null);
  const resultsRef = useRef(null);

  const handleFileChange = useCallback((file) => {
    setVcfFile(file);
    setError(null);
    setResults(null);
  }, []);

  const handleDrugChange = useCallback((drugValue) => {
    setDrugs(drugValue);
    setError(null);
  }, []);

  const handleAnalyze = async () => {
    if (!vcfFile) {
      setError('Please upload a VCF file');
      return;
    }
    if (!drugs.trim()) {
      setError('Please enter at least one drug name');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('vcfFile', vcfFile);
      formData.append('drugs', drugs);

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
      // Scroll to results after analysis
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVcfFile(null);
    setDrugs('');
    setResults(null);
    setError(null);
  };

  const scrollToAnalysis = () => {
    analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="w-full px-0">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center pl-0">
              <img src="/logo.png" alt="PharmaGuard Logo" className="h-[60px] w-auto object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-8 pr-6">
              <a href="#about" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">About</a>
              <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Features</a>
              <a href="#analysis" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Analysis</a>
              <button 
                onClick={scrollToAnalysis}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2532&auto=format&fit=crop"
            alt="DNA Helix Background"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-cyan-800/85 to-emerald-900/90"></div>
        </div>
        
        {/* DNA Helix Animation Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="animate-slideUp">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-teal-200 text-sm font-medium mb-6 border border-white/20">
              🔬 CPIC-Aligned Pharmacogenomics
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Precision Medicine
              <span className="block bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed">
              PharmaGuard analyzes pharmacogenomic variants to deliver CPIC-aligned drug safety predictions with explainable AI insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={scrollToAnalysis}
                className="group bg-white text-teal-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Start Analysis</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <a 
                href="#about"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-2 h-3 bg-white/60 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About/Trust Section */}
      <section id="about" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-on-scroll opacity-0">
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                Why It Matters
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Why Pharmacogenomics
                <span className="text-teal-600"> Matters</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Genetic variations affect how patients metabolize medications. Understanding these differences enables healthcare providers to prescribe the right drug at the right dose for each individual patient.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: '🛡️', title: 'Reduce Adverse Drug Reactions', desc: 'Prevent harmful side effects before they occur' },
                  { icon: '⚖️', title: 'Improve Dosing Accuracy', desc: 'Optimize medication dosage based on genetic profile' },
                  { icon: '🎯', title: 'Personalized Treatment Plans', desc: 'Tailor therapy to individual patient needs' },
                  { icon: '🧠', title: 'Explainable AI Insights', desc: 'Understand the reasoning behind each prediction' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-on-scroll opacity-0 delay-200">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl transform rotate-3 opacity-20"></div>
                <div className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-3xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">6+</div>
                      <div className="text-teal-100 text-sm">Critical Genes</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">CPIC</div>
                      <div className="text-teal-100 text-sm">Aligned Guidelines</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">AI</div>
                      <div className="text-teal-100 text-sm">Powered Analysis</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">XAI</div>
                      <div className="text-teal-100 text-sm">Explainable Output</div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🧬</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Evidence-Based</div>
                        <div className="text-teal-100 text-sm">Clinical pharmacogenomics research</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by Cutting-Edge Technology
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our platform combines genomic analysis with AI to deliver actionable insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📁',
                title: 'VCF File Parsing',
                desc: 'Advanced parsing engine that extracts and analyzes genetic variants from standard VCF files with high accuracy and reliability.',
                color: 'teal'
              },
              {
                icon: '⚙️',
                title: 'CPIC-Aligned Risk Engine',
                desc: 'Risk assessment based on Clinical Pharmacogenetics Implementation Consortium guidelines for evidence-based recommendations.',
                color: 'cyan'
              },
              {
                icon: '🤖',
                title: 'Explainable AI Insights',
                desc: 'Transparent AI explanations that break down complex pharmacogenomic interactions into understandable clinical insights.',
                color: 'emerald'
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="animate-on-scroll opacity-0 bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section id="analysis" ref={analysisRef} className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {!results ? (
            <div className="animate-on-scroll opacity-0">
              <div className="text-center mb-12">
                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                  Get Started
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Run Pharmacogenomic Risk Analysis
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Upload your VCF file and enter drug names to generate personalized risk assessment powered by AI.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
                <FileUpload 
                  onFileChange={handleFileChange} 
                  currentFile={vcfFile}
                />

                <DrugInput 
                  value={drugs} 
                  onChange={handleDrugChange}
                />

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mt-6">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <button 
                  className={`w-full mt-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 ${
                    (loading || !vcfFile || !drugs.trim()) ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={handleAnalyze}
                  disabled={loading || !vcfFile || !drugs.trim()}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing Genetic Data...</span>
                    </>
                  ) : (
                    <>
                      <span>🔬</span>
                      <span>Analyze Risk</span>
                    </>
                  )}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  Your data is processed securely and not stored after analysis.
                </p>
              </div>
            </div>
          ) : (
            <div ref={resultsRef}>
              <Results 
                data={results} 
                onReset={handleReset}
              />
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-teal-700 via-cyan-700 to-emerald-600">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            {[
              { number: '6', label: 'Critical Genes Analyzed', icon: '🧬' },
              { number: 'CPIC', label: 'Evidence-Based Guidelines', icon: '📋' },
              { number: 'XAI', label: 'Explainable AI Output', icon: '🤖' }
            ].map((stat, i) => (
              <div key={i} className="animate-on-scroll opacity-0 p-8">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <span className="text-4xl">{stat.icon}</span>
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-teal-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🧬</span>
                </div>
                <span className="text-xl font-bold">PharmaGuard</span>
              </div>
              <div className="text-gray-400 text-center md:text-left">
                <p className="font-medium text-white">RIFT 2026 Hackathon | Pharmacogenomics & Explainable AI</p>
                <p className="text-sm mt-1">For demonstration purposes only. Not for clinical use.</p>
              </div>
              <div className="flex gap-4">
                <a href="#about" className="text-gray-400 hover:text-teal-400 transition-colors">About</a>
                <a href="#features" className="text-gray-400 hover:text-teal-400 transition-colors">Features</a>
                <a href="#analysis" className="text-gray-400 hover:text-teal-400 transition-colors">Analysis</a>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            © 2026 PharmaGuard. Built with precision for precision medicine.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
