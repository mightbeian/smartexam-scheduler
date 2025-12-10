import React, { useState } from 'react';
import { Upload, Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { generateSyntheticData, uploadCSV, getStatistics } from '../services/api';

const DataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState(null);

  const [generateParams, setGenerateParams] = useState({
    num_students: 500,
    num_courses: 40,
    num_rooms: 10
  });

  const [uploadFiles, setUploadFiles] = useState({
    courses: null,
    students: null,
    rooms: null,
    timeslots: null,
    enrollment: null
  });

  const handleGenerateData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await generateSyntheticData(generateParams);
      setMessage({
        type: 'success',
        text: 'Synthetic data generated successfully!'
      });
      setStats(response.data.statistics);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to generate data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (key, file) => {
    setUploadFiles({ ...uploadFiles, [key]: file });
  };

  const handleUploadCSV = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await uploadCSV(uploadFiles);
      setMessage({
        type: 'success',
        text: `Uploaded ${response.data.files.length} files successfully!`
      });
      setStats(response.data.statistics);
      
      // Clear file inputs
      setUploadFiles({
        courses: null,
        students: null,
        rooms: null,
        timeslots: null,
        enrollment: null
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to upload files'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getStatistics();
      setStats(response.data.statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="fade-in max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Management
        </h1>
        <p className="text-gray-600">
          Upload CSV files or generate synthetic data for exam scheduling
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

      {/* Current Statistics */}
      {stats && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-600">Courses</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total_courses}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-sm text-green-600">Students</p>
              <p className="text-2xl font-bold text-green-700">{stats.total_students}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-sm text-purple-600">Rooms</p>
              <p className="text-2xl font-bold text-purple-700">{stats.total_rooms}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-sm text-orange-600">Timeslots</p>
              <p className="text-2xl font-bold text-orange-700">{stats.total_timeslots}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-3 text-center">
              <p className="text-sm text-pink-600">Enrollments</p>
              <p className="text-2xl font-bold text-pink-700">{stats.total_enrollments}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-sm text-indigo-600">Schedules</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.total_schedules}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Synthetic Data */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Generate Synthetic Data</h2>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Automatically generate realistic test data for scheduling
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Students
              </label>
              <input
                type="number"
                value={generateParams.num_students}
                onChange={(e) =>
                  setGenerateParams({
                    ...generateParams,
                    num_students: parseInt(e.target.value)
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Courses
              </label>
              <input
                type="number"
                value={generateParams.num_courses}
                onChange={(e) =>
                  setGenerateParams({
                    ...generateParams,
                    num_courses: parseInt(e.target.value)
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rooms
              </label>
              <input
                type="number"
                value={generateParams.num_rooms}
                onChange={(e) =>
                  setGenerateParams({
                    ...generateParams,
                    num_rooms: parseInt(e.target.value)
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateData}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                Generate Data
              </>
            )}
          </button>
        </div>

        {/* Upload CSV Files */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Upload CSV Files</h2>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Upload your own data in CSV format
          </p>

          <div className="space-y-4 mb-6">
            {['courses', 'students', 'rooms', 'timeslots', 'enrollment'].map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key}.csv
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(key, e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleUploadCSV}
            disabled={loading || Object.values(uploadFiles).every(f => !f)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
              </>
            )}
          </button>
        </div>
      </div>

      {/* CSV Format Guide */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">CSV Format Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700 mb-1">courses.csv:</p>
            <code className="text-xs text-gray-600">course_id, course_name, professor_id</code>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">students.csv:</p>
            <code className="text-xs text-gray-600">student_id, student_name</code>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">rooms.csv:</p>
            <code className="text-xs text-gray-600">room_id, capacity</code>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">timeslots.csv:</p>
            <code className="text-xs text-gray-600">timeslot_id, day, time</code>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">enrollment.csv:</p>
            <code className="text-xs text-gray-600">student_id, course_id</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
