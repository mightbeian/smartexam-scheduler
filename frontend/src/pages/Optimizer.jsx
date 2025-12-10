import React, { useState, useEffect, useRef } from 'react';
import { Play, Settings, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { startOptimization, getOptimizationStatus } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Optimizer = () => {
  const [optimizing, setOptimizing] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const [params, setParams] = useState({
    population_size: 100,
    generations: 500,
    crossover_rate: 0.8,
    mutation_rate: 0.2
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    checkInitialStatus();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkInitialStatus = async () => {
    try {
      const response = await getOptimizationStatus();
      if (response.data.running) {
        setOptimizing(true);
        startPolling();
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const startPolling = () => {
    intervalRef.current = setInterval(async () => {
      try {
        const response = await getOptimizationStatus();
        setStatus(response.data);

        if (!response.data.running) {
          setOptimizing(false);
          clearInterval(intervalRef.current);
          
          if (response.data.message.includes('complete')) {
            setMessage({
              type: 'success',
              text: 'Optimization completed successfully!'
            });
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 1000);
  };

  const handleStartOptimization = async () => {
    setMessage(null);
    setChartData([]);
    setOptimizing(true);

    try {
      await startOptimization(params);
      startPolling();
    } catch (error) {
      setOptimizing(false);
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to start optimization'
      });
    }
  };

  const progressPercentage = status?.progress || 0;

  return (
    <div className="fade-in max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Run Optimizer
        </h1>
        <p className="text-gray-600">
          Configure and execute the Genetic Algorithm for exam scheduling
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Algorithm Parameters</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Population Size
              </label>
              <input
                type="number"
                value={params.population_size}
                onChange={(e) =>
                  setParams({ ...params, population_size: parseInt(e.target.value) })
                }
                disabled={optimizing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                min="10"
                max="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of candidate solutions in each generation (50-200 recommended)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generations
              </label>
              <input
                type="number"
                value={params.generations}
                onChange={(e) =>
                  setParams({ ...params, generations: parseInt(e.target.value) })
                }
                disabled={optimizing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                min="100"
                max="2000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of evolution iterations (500-1000 recommended)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crossover Rate
              </label>
              <input
                type="number"
                step="0.1"
                value={params.crossover_rate}
                onChange={(e) =>
                  setParams({ ...params, crossover_rate: parseFloat(e.target.value) })
                }
                disabled={optimizing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                min="0.5"
                max="1.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Probability of combining parent solutions (0.7-0.9 recommended)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mutation Rate
              </label>
              <input
                type="number"
                step="0.1"
                value={params.mutation_rate}
                onChange={(e) =>
                  setParams({ ...params, mutation_rate: parseFloat(e.target.value) })
                }
                disabled={optimizing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                min="0.1"
                max="0.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Probability of random changes (0.1-0.3 recommended)
              </p>
            </div>

            <button
              onClick={handleStartOptimization}
              disabled={optimizing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
            >
              {optimizing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Optimization
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Optimization Status</h2>

          {optimizing || status ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Progress</span>
                  <span className="text-blue-600 font-bold">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  {status?.message || 'Initializing...'}
                </p>
              </div>

              {/* Algorithm Info */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  Algorithm Configuration
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Population:</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {params.population_size}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Generations:</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {params.generations}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Crossover:</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {params.crossover_rate}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mutation:</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {params.mutation_rate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Ready to optimize</p>
              <p className="text-sm text-gray-400">
                Configure parameters and click "Start Optimization"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">How the Genetic Algorithm Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
            <h4 className="font-semibold text-gray-900 mb-1">Initialize</h4>
            <p className="text-xs text-gray-600">
              Create random population of candidate schedules
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 mb-2">2</div>
            <h4 className="font-semibold text-gray-900 mb-1">Evaluate</h4>
            <p className="text-xs text-gray-600">
              Score each schedule based on conflicts and constraints
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
            <h4 className="font-semibold text-gray-900 mb-1">Evolve</h4>
            <p className="text-xs text-gray-600">
              Select best solutions and create offspring through crossover
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600 mb-2">4</div>
            <h4 className="font-semibold text-gray-900 mb-1">Mutate</h4>
            <p className="text-xs text-gray-600">
              Apply random changes to maintain diversity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optimizer;
