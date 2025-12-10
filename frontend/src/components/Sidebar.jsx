import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Upload,
  Database,
  Play,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/data', icon: Database, label: 'Data Management' },
    { path: '/optimize', icon: Play, label: 'Run Optimizer' },
    { path: '/schedule', icon: Calendar, label: 'View Schedule' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen fixed left-0 top-0 shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SmartExam</h1>
            <p className="text-xs text-blue-300">Scheduler</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg mb-2
                transition-all duration-200 group
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }
              `}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
        <div className="text-xs text-blue-300 text-center">
          <p>Genetic Algorithm</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
