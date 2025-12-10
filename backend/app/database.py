"""
Database models and operations for SmartExam Scheduler
Uses SQLite for data persistence
"""

import sqlite3
import csv
from pathlib import Path
from typing import List, Dict
import json


class Database:
    """Handle all database operations"""
    
    def __init__(self, db_path: str = "database/scheduler.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = None
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        if not self.conn:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
        return self.conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Courses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                course_id TEXT PRIMARY KEY,
                course_name TEXT NOT NULL,
                professor_id TEXT NOT NULL
            )
        ''')
        
        # Students table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                student_name TEXT NOT NULL
            )
        ''')
        
        # Rooms table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rooms (
                room_id TEXT PRIMARY KEY,
                capacity INTEGER NOT NULL
            )
        ''')
        
        # Timeslots table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS timeslots (
                timeslot_id TEXT PRIMARY KEY,
                day TEXT NOT NULL,
                time TEXT NOT NULL
            )
        ''')
        
        # Enrollment table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS enrollment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                course_id TEXT NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (course_id) REFERENCES courses(course_id)
            )
        ''')
        
        # Generated schedules table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                schedule_name TEXT NOT NULL,
                schedule_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fitness REAL,
                hard_conflicts INTEGER,
                soft_conflicts INTEGER
            )
        ''')
        
        conn.commit()
        print("Database initialized successfully")
    
    def clear_all_data(self):
        """Clear all data from tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        tables = ['enrollment', 'courses', 'students', 'rooms', 'timeslots']
        for table in tables:
            cursor.execute(f'DELETE FROM {table}')
        
        conn.commit()
        print("All data cleared from database")
    
    def import_csv_data(self, csv_dir: str = "data"):
        """Import data from CSV files into database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        csv_path = Path(csv_dir)
        
        # Import courses
        with open(csv_path / 'courses.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute('''
                    INSERT OR REPLACE INTO courses (course_id, course_name, professor_id)
                    VALUES (?, ?, ?)
                ''', (row['course_id'], row['course_name'], row['professor_id']))
        
        # Import students
        with open(csv_path / 'students.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute('''
                    INSERT OR REPLACE INTO students (student_id, student_name)
                    VALUES (?, ?)
                ''', (row['student_id'], row['student_name']))
        
        # Import rooms
        with open(csv_path / 'rooms.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute('''
                    INSERT OR REPLACE INTO rooms (room_id, capacity)
                    VALUES (?, ?)
                ''', (row['room_id'], int(row['capacity'])))
        
        # Import timeslots
        with open(csv_path / 'timeslots.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute('''
                    INSERT OR REPLACE INTO timeslots (timeslot_id, day, time)
                    VALUES (?, ?, ?)
                ''', (row['timeslot_id'], row['day'], row['time']))
        
        # Import enrollments
        with open(csv_path / 'enrollment.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute('''
                    INSERT INTO enrollment (student_id, course_id)
                    VALUES (?, ?)
                ''', (row['student_id'], row['course_id']))
        
        conn.commit()
        print("CSV data imported successfully")
    
    def get_all_courses(self) -> List[Dict]:
        """Get all courses"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM courses')
        return [dict(row) for row in cursor.fetchall()]
    
    def get_all_students(self) -> List[Dict]:
        """Get all students"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students')
        return [dict(row) for row in cursor.fetchall()]
    
    def get_all_rooms(self) -> List[Dict]:
        """Get all rooms"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM rooms')
        return [dict(row) for row in cursor.fetchall()]
    
    def get_all_timeslots(self) -> List[Dict]:
        """Get all timeslots"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM timeslots')
        return [dict(row) for row in cursor.fetchall()]
    
    def get_enrollments_by_course(self, course_id: str) -> List[str]:
        """Get all student IDs enrolled in a specific course"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT student_id FROM enrollment
            WHERE course_id = ?
        ''', (course_id,))
        return [row['student_id'] for row in cursor.fetchall()]
    
    def get_all_enrollments(self) -> List[Dict]:
        """Get all enrollments"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM enrollment')
        return [dict(row) for row in cursor.fetchall()]
    
    def save_schedule(self, schedule_name: str, schedule_data: Dict):
        """Save generated schedule to database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        metrics = schedule_data.get('metrics', {})
        
        cursor.execute('''
            INSERT INTO schedules (
                schedule_name, schedule_data, fitness, 
                hard_conflicts, soft_conflicts
            )
            VALUES (?, ?, ?, ?, ?)
        ''', (
            schedule_name,
            json.dumps(schedule_data),
            metrics.get('fitness', 0),
            metrics.get('hard_conflicts', 0),
            metrics.get('soft_conflict_score', 0)
        ))
        
        conn.commit()
        return cursor.lastrowid
    
    def get_latest_schedule(self) -> Dict:
        """Get the most recently generated schedule"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM schedules
            ORDER BY created_at DESC
            LIMIT 1
        ''')
        
        row = cursor.fetchone()
        if row:
            schedule = dict(row)
            schedule['schedule_data'] = json.loads(schedule['schedule_data'])
            return schedule
        return None
    
    def get_all_schedules(self) -> List[Dict]:
        """Get all saved schedules"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, schedule_name, created_at, fitness, 
                   hard_conflicts, soft_conflicts
            FROM schedules
            ORDER BY created_at DESC
        ''')
        return [dict(row) for row in cursor.fetchall()]
    
    def get_schedule_by_id(self, schedule_id: int) -> Dict:
        """Get a specific schedule by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM schedules
            WHERE id = ?
        ''', (schedule_id,))
        
        row = cursor.fetchone()
        if row:
            schedule = dict(row)
            schedule['schedule_data'] = json.loads(schedule['schedule_data'])
            return schedule
        return None
    
    def get_statistics(self) -> Dict:
        """Get database statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        stats = {}
        
        cursor.execute('SELECT COUNT(*) as count FROM courses')
        stats['total_courses'] = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM students')
        stats['total_students'] = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM rooms')
        stats['total_rooms'] = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM timeslots')
        stats['total_timeslots'] = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM enrollment')
        stats['total_enrollments'] = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM schedules')
        stats['total_schedules'] = cursor.fetchone()['count']
        
        return stats
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()


# Singleton instance
db = Database()
