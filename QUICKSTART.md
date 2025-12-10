# SmartExam Scheduler - Quick Start Guide

## 🚀 Running the Application

### Step 1: Start the Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend will run on: http://localhost:8000

### Step 2: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

### Step 3: Use the Application

1. **Dashboard** - View system overview and statistics
2. **Data Management** - Generate synthetic data or upload CSV files
3. **Run Optimizer** - Configure GA parameters and start optimization
4. **View Schedule** - See generated timetable with filters
5. **Analytics** - View convergence charts and metrics

## 📊 Quick Test

1. Go to Data Management
2. Click "Generate Data" with default parameters
3. Go to Run Optimizer
4. Click "Start Optimization"
5. Watch the progress
6. View results in Schedule and Analytics pages

## 🎯 Recommended Parameters

For best results:
- Population Size: 100-200
- Generations: 500-1000
- Crossover Rate: 0.8
- Mutation Rate: 0.2

## ⚡ Expected Performance

- Small datasets (40 courses): ~30-60 seconds
- Medium datasets (100 courses): ~2-5 minutes
- Hard conflicts: Usually 0
- Soft conflicts: 200-500

## 🔍 Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Ensure Python 3.9+ is installed
- Install dependencies with pip

### Frontend won't start
- Check if port 3000 is available
- Ensure Node.js 16+ is installed
- Delete node_modules and run `npm install` again

### No data available
- Generate data first from Data Management page
- Or upload your own CSV files

### Optimization fails
- Ensure data is loaded
- Check browser console for errors
- Verify backend is running

## 📞 Support

For issues or questions, check the main README.md file.
