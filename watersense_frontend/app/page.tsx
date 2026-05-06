'use client';

import React, { useState } from 'react';
import { Droplets, Activity, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function WaterSenseDashboard() {
  // Initializing state with default numeric values
  const [formData, setFormData] = useState({
    ph: 7.0,
    Hardness: 200.0,
    Solids: 20000.0,
    Chloramines: 7.0,
    Sulfate: 300.0,
    Conductivity: 400.0,
    Organic_carbon: 10.0,
    Trihalomethanes: 60.0,
    Turbidity: 4.0
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle changes to input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // If empty string, keep as empty to allow typing; otherwise parse to float
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Could not connect to Django server. Ensure your backend is running.");
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-12 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <Droplets className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">WaterSense AI</h1>
            <p className="text-slate-500 font-medium">Environmental Analytics & Forecasting</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Form Card */}
          <section className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Water Quality Metrics
              </h2>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-wider">
                Real-time Analysis
              </span>
            </div>

            <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(formData).map((key) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center justify-between">
                    {key.replace('_', ' ')}
                    <Info className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                  <input
                    type="number"
                    name={key}
                    step="any"
                    required
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                    value={(formData as any)[key]}
                    onChange={handleChange}
                  />
                </div>
              ))}
              
              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 mt-4 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Data...' : 'Run Diagnostics'}
              </button>
            </form>
          </section>

          {/* Results Display Section */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {result ? (
              <div className={`p-10 rounded-3xl border-2 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center text-center ${
                result.potable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
              }`}>
                <div className={`p-4 rounded-full mb-6 ${
                  result.potable ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {result.potable ? (
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                  )}
                </div>
                <h3 className={`text-3xl font-black mb-4 ${
                  result.potable ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {result.potable ? 'Potable' : 'Not Potable'}
                </h3>
                <p className={`text-lg font-medium leading-relaxed ${
                  result.potable ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
                <div className="mt-8 pt-8 border-t border-white/50 w-full">
                  <p className="text-slate-400 text-sm italic">Analysis generated by WaterSense Voting Classifier v2.0</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white rounded-3xl p-8 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-bold mb-2">Awaiting Parameters</h4>
                <p className="text-slate-400 text-sm max-w-[200px]">
                  Fill out the form to generate a water quality forecast.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}