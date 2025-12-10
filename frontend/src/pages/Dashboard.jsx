import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Play,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  DoorOpen,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getStatistics, getLatestSchedule } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [latestSchedule, setLatestSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, scheduleRes] = await Promise.all([
        getStatistics(),
        getLatestSchedule().catch(() => ({ data: { schedule: null } }))
      ]);
      setStats(statsRes.data.statistics);
      setLatestSchedule(scheduleRes.data.schedule);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const statCards = [
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: stats?.total_courses || 0,
      color: 'bg-blue-500',
      link: '/data'
    },
    {
      icon: Users,
      label: 'Total Students',
      value: stats?.total_students || 0,
      color: 'bg-green-500',
      link: '/data'
    },
    {
      icon: DoorOpen,
      label: 'Available Rooms',
      value: stats?.total_rooms || 0,
      color: 'bg-purple-500',
      link: '/data'
    },
    {
      icon: Clock,
      label: 'Time Slots',
      value: stats?.total_timeslots || 0,
      color: 'bg-orange-500',
      link: '/data'
    }
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SmartExam Scheduler Dashboard
        </h1>
        <p className="text-gray-600">
          Heuristic-based approach to university exam timetabling using Genetic Algorithms
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Latest Schedule Status */}
      {latestSchedule && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              Latest Schedule
            </h2>
            <Link
              to="/schedule"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Hard Conflicts</p>
              <p className="text-2xl font-bold text-green-700">
                {latestSchedule.hard_conflicts}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Soft Conflicts</p>
              <p className="text-2xl font-bold text-blue-700">
                {latestSchedule.soft_conflicts}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Fitness Score</p>
              <p className="text-2xl font-bold text-purple-700">
                {latestSchedule.fitness?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/data"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <Database className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Manage Data</h3>
          <p className="text-blue-100">Upload or generate synthetic data for scheduling</p>
        </Link>

        <Link
          to="/optimize"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <Play className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Run Optimizer</h3>
          <p className="text-green-100">Generate optimized exam schedule using GA</p>
        </Link>

        <Link
          to="/schedule"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <Calendar className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">View Schedule</h3>
          <p className="text-purple-100">See generated timetable and conflict analysis</p>
        </Link>
      </div>

      {/* About Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          About This Project
        </h3>
        <p className="text-gray-700 leading-relaxed">
          This system uses a <strong>Genetic Algorithm (GA)</strong> to solve the NP-hard 
          university exam timetabling problem. The algorithm evolves a population of candidate 
          schedules over multiple generations, optimizing for minimal conflicts while respecting 
          hard constraints (no student in two exams at once, room capacity) and soft constraints 
          (minimize back-to-back exams, efficient room utilization).
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
