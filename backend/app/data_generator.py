"""
Synthetic Data Generator for SmartExam Scheduler
Generates realistic test data for exam scheduling
"""

import csv
import random
from faker import Faker
from pathlib import Path

fake = Faker()


class DataGenerator:
    """Generate synthetic data for exam scheduling"""
    
    def __init__(
        self,
        num_students=500,
        num_courses=40,
        num_rooms=10,
        num_timeslots=15
    ):
        self.num_students = num_students
        self.num_courses = num_courses
        self.num_rooms = num_rooms
        self.num_timeslots = num_timeslots
        
        # Course subjects for realistic names
        self.subjects = [
            "Computer Science", "Mathematics", "Physics", "Chemistry",
            "Biology", "English", "History", "Psychology",
            "Economics", "Business", "Engineering", "Statistics",
            "Philosophy", "Sociology", "Political Science"
        ]
        
        self.course_levels = ["101", "201", "301", "401"]
        
        # Days and time slots
        self.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        self.times = ["09:00-12:00", "13:00-16:00", "17:00-20:00"]
    
    def generate_courses(self) -> list:
        """Generate course data"""
        courses = []
        
        for i in range(1, self.num_courses + 1):
            subject = random.choice(self.subjects)
            level = random.choice(self.course_levels)
            
            course = {
                'course_id': f"CS{i:03d}",
                'course_name': f"{subject} {level}",
                'professor_id': f"P{random.randint(1, 20):02d}"
            }
            courses.append(course)
        
        return courses
    
    def generate_students(self) -> list:
        """Generate student data"""
        students = []
        
        for i in range(1, self.num_students + 1):
            student = {
                'student_id': f"S{i:04d}",
                'student_name': fake.name()
            }
            students.append(student)
        
        return students
    
    def generate_rooms(self) -> list:
        """Generate room data with varying capacities"""
        rooms = []
        capacities = [30, 40, 50, 60, 80, 100, 120, 150]
        
        for i in range(1, self.num_rooms + 1):
            room = {
                'room_id': f"Room{i:03d}",
                'capacity': random.choice(capacities)
            }
            rooms.append(room)
        
        return rooms
    
    def generate_timeslots(self) -> list:
        """Generate timeslot data"""
        timeslots = []
        slot_id = 1
        
        for day in self.days:
            for time in self.times:
                timeslot = {
                    'timeslot_id': f"T{slot_id:02d}",
                    'day': day,
                    'time': time
                }
                timeslots.append(timeslot)
                slot_id += 1
        
        return timeslots
    
    def generate_enrollments(self, students: list, courses: list) -> list:
        """
        Generate enrollment data
        Each student enrolls in 3-5 courses
        """
        enrollments = []
        
        for student in students:
            # Each student takes 3-5 courses
            num_courses_enrolled = random.randint(3, 5)
            selected_courses = random.sample(courses, num_courses_enrolled)
            
            for course in selected_courses:
                enrollment = {
                    'student_id': student['student_id'],
                    'course_id': course['course_id']
                }
                enrollments.append(enrollment)
        
        return enrollments
    
    def save_to_csv(self, data: list, filename: str, output_dir: str = "data"):
        """Save data to CSV file"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        filepath = output_path / filename
        
        if data:
            keys = data[0].keys()
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(data)
            
            print(f"✓ Generated {filename} with {len(data)} records")
    
    def generate_all(self, output_dir: str = "data"):
        """Generate all datasets"""
        print("\n" + "="*60)
        print("GENERATING SYNTHETIC DATA")
        print("="*60)
        
        # Generate data
        print("\nGenerating datasets...")
        courses = self.generate_courses()
        students = self.generate_students()
        rooms = self.generate_rooms()
        timeslots = self.generate_timeslots()
        enrollments = self.generate_enrollments(students, courses)
        
        # Save to CSV
        print("\nSaving to CSV files...")
        self.save_to_csv(courses, 'courses.csv', output_dir)
        self.save_to_csv(students, 'students.csv', output_dir)
        self.save_to_csv(rooms, 'rooms.csv', output_dir)
        self.save_to_csv(timeslots, 'timeslots.csv', output_dir)
        self.save_to_csv(enrollments, 'enrollment.csv', output_dir)
        
        print("\n" + "="*60)
        print("DATA GENERATION COMPLETE")
        print("="*60)
        print(f"Total Students: {len(students)}")
        print(f"Total Courses: {len(courses)}")
        print(f"Total Rooms: {len(rooms)}")
        print(f"Total Time Slots: {len(timeslots)}")
        print(f"Total Enrollments: {len(enrollments)}")
        print("="*60 + "\n")
        
        return {
            'courses': courses,
            'students': students,
            'rooms': rooms,
            'timeslots': timeslots,
            'enrollments': enrollments
        }


if __name__ == "__main__":
    generator = DataGenerator(
        num_students=500,
        num_courses=40,
        num_rooms=10,
        num_timeslots=15
    )
    generator.generate_all()
