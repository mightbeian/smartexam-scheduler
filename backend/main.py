"""
FastAPI Backend for SmartExam Scheduler
Provides REST API endpoints for exam scheduling optimization
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import csv
import io
from pathlib import Path
import shutil

from app.database import db
from app.data_generator import DataGenerator
from app.genetic_algorithm import (
    GeneticAlgorithm, Exam, Room, TimeSlot
)

app = FastAPI(
    title="SmartExam Scheduler API",
    description="Heuristic-based approach to university exam timetabling",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptimizationRequest(BaseModel):
    """Request model for optimization"""
    population_size: int = 100
    generations: int = 1000
    crossover_rate: float = 0.8
    mutation_rate: float = 0.2


class OptimizationStatus(BaseModel):
    """Status of optimization process"""
    status: str
    message: str
    progress: Optional[float] = None


# Global variable to track optimization status
optimization_status = {
    "running": False,
    "progress": 0,
    "message": "Ready"
}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SmartExam Scheduler API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    stats = db.get_statistics()
    return {
        "status": "healthy",
        "database": "connected",
        "statistics": stats
    }


@app.post("/api/generate-data")
async def generate_synthetic_data(
    num_students: int = 500,
    num_courses: int = 40,
    num_rooms: int = 10
):
    """Generate synthetic test data"""
    try:
        generator = DataGenerator(
            num_students=num_students,
            num_courses=num_courses,
            num_rooms=num_rooms
        )
        
        data = generator.generate_all("backend/data")
        
        # Import into database
        db.clear_all_data()
        db.import_csv_data("backend/data")
        
        stats = db.get_statistics()
        
        return {
            "success": True,
            "message": "Synthetic data generated successfully",
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-csv")
async def upload_csv(
    courses: UploadFile = File(None),
    students: UploadFile = File(None),
    rooms: UploadFile = File(None),
    timeslots: UploadFile = File(None),
    enrollment: UploadFile = File(None)
):
    """Upload CSV files"""
    try:
        data_dir = Path("backend/data")
        data_dir.mkdir(parents=True, exist_ok=True)
        
        files = {
            'courses.csv': courses,
            'students.csv': students,
            'rooms.csv': rooms,
            'timeslots.csv': timeslots,
            'enrollment.csv': enrollment
        }
        
        uploaded = []
        for filename, file in files.items():
            if file:
                content = await file.read()
                with open(data_dir / filename, 'wb') as f:
                    f.write(content)
                uploaded.append(filename)
        
        # Import into database
        if uploaded:
            db.import_csv_data("backend/data")
        
        stats = db.get_statistics()
        
        return {
            "success": True,
            "message": f"Uploaded {len(uploaded)} files",
            "files": uploaded,
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/data/courses")
async def get_courses():
    """Get all courses"""
    try:
        courses = db.get_all_courses()
        return {"success": True, "data": courses, "count": len(courses)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/data/students")
async def get_students():
    """Get all students"""
    try:
        students = db.get_all_students()
        return {"success": True, "data": students, "count": len(students)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/data/rooms")
async def get_rooms():
    """Get all rooms"""
    try:
        rooms = db.get_all_rooms()
        return {"success": True, "data": rooms, "count": len(rooms)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/data/timeslots")
async def get_timeslots():
    """Get all timeslots"""
    try:
        timeslots = db.get_all_timeslots()
        return {"success": True, "data": timeslots, "count": len(timeslots)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/data/enrollments")
async def get_enrollments():
    """Get all enrollments"""
    try:
        enrollments = db.get_all_enrollments()
        return {"success": True, "data": enrollments, "count": len(enrollments)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/data/statistics")
async def get_statistics():
    """Get data statistics"""
    try:
        stats = db.get_statistics()
        return {"success": True, "statistics": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def run_optimization_task(params: OptimizationRequest):
    """Background task for optimization"""
    global optimization_status
    
    try:
        optimization_status["running"] = True
        optimization_status["message"] = "Loading data..."
        optimization_status["progress"] = 0
        
        # Load data from database
        courses_data = db.get_all_courses()
        rooms_data = db.get_all_rooms()
        timeslots_data = db.get_all_timeslots()
        
        # Build Exam objects with enrolled students
        exams = []
        for course in courses_data:
            enrolled = db.get_enrollments_by_course(course['course_id'])
            exam = Exam(
                course_id=course['course_id'],
                course_name=course['course_name'],
                enrolled_students=enrolled,
                professor_id=course['professor_id']
            )
            exams.append(exam)
        
        # Build Room objects
        rooms = [
            Room(room_id=r['room_id'], capacity=r['capacity'])
            for r in rooms_data
        ]
        
        # Build TimeSlot objects
        timeslots = [
            TimeSlot(
                slot_id=t['timeslot_id'],
                day=t['day'],
                time=t['time']
            )
            for t in timeslots_data
        ]
        
        optimization_status["message"] = "Initializing Genetic Algorithm..."
        optimization_status["progress"] = 10
        
        # Create and run GA
        ga = GeneticAlgorithm(
            exams=exams,
            rooms=rooms,
            timeslots=timeslots,
            population_size=params.population_size,
            generations=params.generations,
            crossover_rate=params.crossover_rate,
            mutation_rate=params.mutation_rate
        )
        
        optimization_status["message"] = "Evolving solutions..."
        
        # Run optimization with progress callback
        def progress_callback(stats):
            gen = stats['generation']
            total = params.generations
            optimization_status["progress"] = 10 + (gen / total * 80)
            optimization_status["message"] = f"Generation {gen}/{total}"
        
        best_solution = ga.evolve(callback=progress_callback)
        
        optimization_status["message"] = "Saving results..."
        optimization_status["progress"] = 95
        
        # Save to database
        schedule_data = ga.get_schedule_dict()
        schedule_id = db.save_schedule(
            f"Schedule_{params.generations}gen",
            schedule_data
        )
        
        optimization_status["running"] = False
        optimization_status["progress"] = 100
        optimization_status["message"] = "Optimization complete!"
        
    except Exception as e:
        optimization_status["running"] = False
        optimization_status["message"] = f"Error: {str(e)}"
        optimization_status["progress"] = 0


@app.post("/api/optimize")
async def optimize_schedule(
    params: OptimizationRequest,
    background_tasks: BackgroundTasks
):
    """Start optimization process"""
    global optimization_status
    
    if optimization_status["running"]:
        raise HTTPException(
            status_code=400,
            detail="Optimization is already running"
        )
    
    # Check if data exists
    stats = db.get_statistics()
    if stats['total_courses'] == 0:
        raise HTTPException(
            status_code=400,
            detail="No data available. Please upload or generate data first."
        )
    
    # Start optimization in background
    background_tasks.add_task(run_optimization_task, params)
    
    return {
        "success": True,
        "message": "Optimization started",
        "status": "running"
    }


@app.get("/api/optimize/status")
async def get_optimization_status():
    """Get current optimization status"""
    return optimization_status


@app.get("/api/schedules")
async def get_all_schedules():
    """Get all saved schedules"""
    try:
        schedules = db.get_all_schedules()
        return {"success": True, "schedules": schedules, "count": len(schedules)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/schedules/latest")
async def get_latest_schedule():
    """Get the most recent schedule"""
    try:
        schedule = db.get_latest_schedule()
        if not schedule:
            raise HTTPException(status_code=404, detail="No schedules found")
        return {"success": True, "schedule": schedule}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/schedules/{schedule_id}")
async def get_schedule(schedule_id: int):
    """Get a specific schedule by ID"""
    try:
        schedule = db.get_schedule_by_id(schedule_id)
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        return {"success": True, "schedule": schedule}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
