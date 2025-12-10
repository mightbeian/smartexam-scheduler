# SmartExam Scheduler

**A Heuristic-Based Approach to University Exam Timetabling Using Genetic Algorithms**

![SmartExam Scheduler](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.9+-green.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal.svg)

## 📋 Project Overview

SmartExam Scheduler is a sophisticated web-based application designed to solve the university exam timetabling problem using Genetic Algorithms. This system optimizes exam schedules by minimizing conflicts while respecting hard constraints (no student in two exams simultaneously, room capacity limits) and soft constraints (reducing back-to-back exams, efficient room utilization).

## 🎯 Features

- **Intelligent Scheduling**: Uses Genetic Algorithm to evolve optimal exam schedules
- **Constraint Satisfaction**: Handles both hard and soft constraints effectively
- **Data Management**: Upload CSV files or generate synthetic test data
- **Real-time Optimization**: Monitor optimization progress with live updates
- **Visual Analytics**: Interactive charts showing algorithm convergence
- **Schedule Visualization**: View timetables grouped by day, room, or course
- **Modern UI**: Clean, responsive interface with sidebar navigation

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Algorithm**: Genetic Algorithm with tournament selection, uniform crossover, and mutation
- **Database**: SQLite for data persistence
- **API**: RESTful endpoints for all operations

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## 📊 ML Research Documentation

This project includes comprehensive ML research documentation:

- 📄 **[PART 1: Introduction](PART1_Introduction.md)** - Problem statement, hypothesis, scope
- 📄 **[PART 2: Data & Ethics](PART2_Data_Ethics.md)** - Dataset specifications, privacy considerations  
- 📄 **[PART 3: Preprocessing & Features](PART3_Preprocessing_Features.md)** - Feature engineering, data preparation
- 📄 **[PART 4: Development & Evaluation](PART4_Development_Evaluation.md)** - Baseline models, GA implementation, evaluation with 95% CI
- 📄 **[PART 5: Discussion](PART5_Discussion.md)** - Feature analysis, limitations, domain transfer, novel contributions
- 📄 **[PART 6: Video Demonstration](PART6_Video_Script.md)** - Complete demonstration script and guidelines

## 🚀 Quick Start

See **[QUICKSTART.md](QUICKSTART.md)** for detailed setup instructions.

### Quick Commands

```bash
# Backend
cd backend && pip install -r requirements.txt && python main.py

# Frontend  
cd frontend && npm install && npm run dev
```

## 📐 How It Works

The Genetic Algorithm optimizes exam schedules through evolution:

1. **Initialize** population of random schedules
2. **Evaluate** fitness (minimize conflicts)
3. **Select** best candidates via tournament selection  
4. **Crossover** parents to create offspring (80%)
5. **Mutate** for diversity (20%)
6. **Iterate** for 500-1000 generations

### Fitness Function

**Hard Constraints** (must satisfy):
- No student conflicts: 10,000 penalty
- No room double-booking: 8,000 penalty
- Room capacity respected: 5,000 penalty

**Soft Constraints** (should optimize):
- Minimize back-to-back exams: 50 penalty
- Optimize room utilization: 20-30 penalty
- Balance time slot distribution: 10 penalty/excess

## 📊 Performance Metrics

- ✅ **100% Success Rate** - Zero hard conflicts
- ✅ **342.7 ± 48.3 Soft Conflicts** - Superior quality
- ✅ **287 Generations Average** - Fast convergence
- ✅ **< 60 seconds** - Quick optimization

## 👥 Team

- Christian Paul Cabrera (BCS43)
- Vanjo Geraldez
- Yuri Luis E. Gler

## 📝 License

MIT License - University Finals Laboratory Project

---

**🎓 Computational Science Project | 🧬 Genetic Algorithm | 📅 Exam Scheduling**