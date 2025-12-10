import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { getLatestSchedule } from '../services/api';

const ScheduleViewer = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ day: 'all', search: '' });
  const [groupBy, setGroupBy] = useState('day'); // 'day', 'room', 'course'

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
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Schedule Available</h2>
        <p className="text-gray-600 mb-4">
          Generate a schedule first by running the optimizer
        </p>
      </div>
    );
  }

  const scheduleData = schedule.schedule_data || {};
  const scheduleItems = scheduleData.schedule || [];
  const metrics = scheduleData.metrics || {};

  // Filter schedules
  const filteredSchedules = scheduleItems.filter((item) => {
    const matchesDay = filter.day === 'all' || item.day === filter.day;
    const matchesSearch =
      !filter.search ||
      item.course_name.toLowerCase().includes(filter.search.toLowerCase()) ||
      item.course_id.toLowerCase().includes(filter.search.toLowerCase()) ||
      item.room_id.toLowerCase().includes(filter.search.toLowerCase());
    return matchesDay && matchesSearch;
  });

  // Group schedules
  const groupedSchedules = {};
  filteredSchedules.forEach((item) => {
    const key =
      groupBy === 'day'
        ? item.day
        : groupBy === 'room'
        ? item.room_id
        : item.course_name;
    if (!groupedSchedules[key]) {
      groupedSchedules[key] = [];
    }
    groupedSchedules[key].push(item);
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="fade-in max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Schedule</h1>
        <p className="text-gray-600">View and analyze the generated timetable</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600 mb-1">Hard Conflicts</p>
          <p className="text-3xl font-bold text-green-700">{metrics.hard_conflicts || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Soft Conflicts</p>
          <p className="text-3xl font-bold text-blue-700">
            {metrics.soft_conflict_score || 0}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-600 mb-1">Fitness Score</p>
          <p className="text-3xl font-bold text-purple-700">
            {metrics.fitness?.toFixed(2) || 0}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-sm text-orange-600 mb-1">Total Exams</p>
          <p className="text-3xl font-bold text-orange-700">{metrics.total_exams || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, rooms..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filter.day}
              onChange={(e) => setFilter({ ...filter, day: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Days</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="day">Group by Day</option>
              <option value="room">Group by Room</option>
              <option value="course">Group by Course</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-6">
        {Object.entries(groupedSchedules).map(([group, items]) => (
          <div key={group} className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-bold">{group}</h3>
              <p className="text-sm text-blue-100">{items.length} exam(s)</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 text-sm">{item.course_id}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {item.enrolled_count} students
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{item.course_name}</p>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Day:</span>
                        <span className="font-semibold text-gray-900">{item.day}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-semibold text-gray-900">{item.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Room:</span>
                        <span className="font-semibold text-gray-900">{item.room_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="font-semibold text-gray-900">
                          {item.room_capacity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Professor:</span>
                        <span className="font-semibold text-gray-900">
                          {item.professor_id}
                        </span>
                      </div>
                    </div>

                    {/* Utilization bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Room Utilization</span>
                        <span className="font-semibold text-gray-900">
                          {((item.enrolled_count / item.room_capacity) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (item.enrolled_count / item.room_capacity) * 100 > 95
                              ? 'bg-red-500'
                              : (item.enrolled_count / item.room_capacity) * 100 < 50
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${(item.enrolled_count / item.room_capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No exams match your filters</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleViewer;
