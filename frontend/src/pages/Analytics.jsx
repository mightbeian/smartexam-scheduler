import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown } from 'lucide-react';
import { getLatestSchedule } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await getLatestSchedule();
      setSchedule(response.data.schedule);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Analytics Available</h2>
        <p className="text-gray-600">Generate a schedule first to view analytics</p>
      </div>
    );
  }

  const scheduleData = schedule.schedule_data || {};
  const history = scheduleData.history || [];

  return (
    <div className="fade-in max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Optimization performance and convergence analysis</p>
      </div>

      {/* Evolution Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <TrendingDown className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Fitness Evolution</h2>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="generation"
              label={{ value: 'Generation', position: 'insideBottom', offset: -5 }}
            />
            <YAxis label={{ value: 'Fitness Score', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="best_fitness"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Best Fitness"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avg_fitness"
              stroke="#10b981"
              strokeWidth={2}
              name="Average Fitness"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Conflicts Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hard Conflicts Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="generation" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hard_conflicts"
                stroke="#ef4444"
                strokeWidth={2}
                name="Hard Conflicts"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Soft Conflicts Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="generation" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="soft_conflicts"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Soft Conflicts"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Optimization Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Generations</p>
            <p className="text-2xl font-bold text-gray-900">{history.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Initial Fitness</p>
            <p className="text-2xl font-bold text-gray-900">
              {history[0]?.best_fitness?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Final Fitness</p>
            <p className="text-2xl font-bold text-gray-900">
              {history[history.length - 1]?.best_fitness?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Improvement</p>
            <p className="text-2xl font-bold text-green-600">
              {history.length > 0
                ? (
                    ((history[0]?.best_fitness - history[history.length - 1]?.best_fitness) /
                      history[0]?.best_fitness) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
