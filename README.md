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

## 🔬 How It Works

### Genetic Algorithm Implementation

1. **Initialization**: Create a population of random exam schedules
2. **Evaluation**: Calculate fitness score based on conflicts
3. **Selection**: Use tournament selection to choose parent schedules
4. **Crossover**: Combine parents to create offspring (80% probability)
5. **Mutation**: Apply random changes to maintain diversity (20% probability)
6. **Elitism**: Preserve best solutions across generations
7. **Iteration**: Repeat for specified number of generations

### Fitness Function

The fitness function evaluates schedules based on:

**Hard Constraints (Heavy Penalties):**
- No student in multiple exams simultaneously (10,000 penalty)
- No room double-booking (8,000 penalty)
- Room capacity not exceeded (5,000 penalty)

**Soft Constraints (Light Penalties):**
- Minimize back-to-back exams for students (50 penalty)
- Optimize room utilization (20-30 penalty)
- Balance exam distribution across time slots (10 penalty per excess)

## 🚀 Getting Started

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📊 Datasets

### Required CSV Files

The system expects the following CSV files:

1. **courses.csv**
   ```
   course_id,course_name,professor_id
   CS101,Intro to Programming,P01
   MATH201,Calculus II,P02
   ```

2. **students.csv**
   ```
   student_id,student_name
   S0001,John Doe
   S0002,Jane Smith
   ```

3. **rooms.csv**
   ```
   room_id,capacity
   Room101,50
   Room102,80
   ```

4. **timeslots.csv**
   ```
   timeslot_id,day,time
   T01,Monday,09:00-12:00
   T02,Monday,13:00-16:00
   ```

5. **enrollment.csv**
   ```
   student_id,course_id
   S0001,CS101
   S0001,MATH201
   ```

### Generate Synthetic Data

The system can automatically generate realistic test data:
- 500 students
- 40 courses
- 10 rooms
- 15 time slots
- ~2000 enrollment records

## 🎛️ Algorithm Parameters

### Configurable Parameters

- **Population Size** (50-200 recommended): Number of candidate solutions per generation
- **Generations** (500-1000 recommended): Number of evolution iterations
- **Crossover Rate** (0.7-0.9 recommended): Probability of combining parent solutions
- **Mutation Rate** (0.1-0.3 recommended): Probability of random changes

### Typical Results

With recommended parameters:
- **Hard Conflicts**: 0 (perfect solution)
- **Soft Conflict Score**: 200-500 (good quality)
- **Convergence**: Usually within 500-800 generations

## 📐 Mathematical Model

The exam timetabling problem is formulated as a **Constraint Satisfaction Optimization Problem (CSOP)**:

**Decision Variables:**
- Assignment of exam *e* to room *r* and timeslot *t*

**Objective:**
- Minimize: `Fitness = Hard_Penalty × 10000 + Soft_Penalty`

**Subject to:**
- ∀ student *s*: No overlapping exams
- ∀ room *r*, timeslot *t*: At most one exam
- ∀ exam *e*: Enrolled students ≤ Room capacity

## 🛣️ API Endpoints

### Data Management
- `POST /api/generate-data` - Generate synthetic data
- `POST /api/upload-csv` - Upload CSV files
- `GET /api/data/{entity}` - Get courses, students, rooms, etc.

### Optimization
- `POST /api/optimize` - Start optimization
- `GET /api/optimize/status` - Get current status

### Schedules
- `GET /api/schedules` - List all schedules
- `GET /api/schedules/latest` - Get most recent schedule
- `GET /api/schedules/{id}` - Get specific schedule

## 🎓 Academic Context

This project demonstrates key computational science principles:

1. **Mathematical Modeling**: Translating real-world scheduling into formal CSOP
2. **Combinatorial Optimization**: Solving NP-hard problem with heuristics
3. **Metaheuristic Algorithms**: Using Genetic Algorithm for complex search
4. **Simulation & Evaluation**: Iterative compute-evaluate-refine methodology

## 👥 Team

- Christian Paul Cabrera (BCS43)
- Vanjo Geraldez
- Yuri Luis E. Gler

## 📝 License

This project is part of a university finals laboratory project.

## 🙏 Acknowledgments

- Inspired by research in exam timetabling and constraint satisfaction
- Built with modern web technologies and computational science principles
- Uses established Genetic Algorithm methodologies

---

**Project Type**: Computational Science - Resource Scheduling  
**Algorithm**: Genetic Algorithm with Constraint Satisfaction  
**Domain**: University Exam Timetabling  
**Status**: Production Ready v1.0.0
