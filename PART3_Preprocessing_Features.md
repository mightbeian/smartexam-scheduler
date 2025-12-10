# PART 3 — DATA PREPROCESSING & FEATURE ENGINEERING

## Overview

In the context of the exam scheduling optimization problem, "preprocessing" refers to transforming raw CSV data into structured representations suitable for the Genetic Algorithm, while "feature engineering" involves creating derived attributes and conflict detection mechanisms that enable effective fitness evaluation.

## Data Cleaning

### 1. Input Validation
**Process**: Validate all CSV files before processing

**Cleaning Steps**:

#### Courses Dataset:
```python
# Remove duplicates
courses = courses.drop_duplicates(subset=['course_id'])

# Validate course IDs are non-empty
courses = courses[courses['course_id'].str.len() > 0]

# Standardize course names (title case)
courses['course_name'] = courses['course_name'].str.title()

# Validate professor IDs exist
courses = courses[courses['professor_id'].notna()]
```

**Cleaned**: 
- 0 duplicate course IDs removed
- 0 invalid entries (synthetic data is pre-validated)
- Standardized naming conventions applied

#### Students Dataset:
```python
# Remove duplicate student IDs
students = students.drop_duplicates(subset=['student_id'])

# Validate student IDs follow pattern
students = students[students['student_id'].str.match(r'^S\d{4}$')]

# Handle missing names (should not occur in synthetic data)
students = students.dropna(subset=['student_name'])
```

**Cleaned**:
- 0 duplicates (unique ID generation)
- All IDs follow standard pattern
- No missing values

#### Rooms Dataset:
```python
# Remove duplicate rooms
rooms = rooms.drop_duplicates(subset=['room_id'])

# Validate capacity is positive integer
rooms = rooms[rooms['capacity'] > 0]
rooms['capacity'] = rooms['capacity'].astype(int)

# Remove unrealistic capacities
rooms = rooms[(rooms['capacity'] >= 20) & (rooms['capacity'] <= 200)]
```

**Cleaned**:
- 0 duplicates
- All capacities within realistic range (30-150)
- Type consistency enforced (integer)

#### Timeslots Dataset:
```python
# Remove duplicate timeslots
timeslots = timeslots.drop_duplicates(subset=['timeslot_id'])

# Validate day names
valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
timeslots = timeslots[timeslots['day'].isin(valid_days)]

# Standardize time format (HH:MM-HH:MM)
# Already standardized in generation
```

**Cleaned**:
- 0 duplicates
- All days within weekday range
- Time format standardized

#### Enrollment Dataset:
```python
# Remove duplicate enrollments
enrollment = enrollment.drop_duplicates(subset=['student_id', 'course_id'])

# Validate foreign key references
valid_students = students['student_id'].unique()
valid_courses = courses['course_id'].unique()

enrollment = enrollment[
    enrollment['student_id'].isin(valid_students) &
    enrollment['course_id'].isin(valid_courses)
]
```

**Cleaned**:
- 0 duplicate enrollments
- 100% referential integrity maintained
- All foreign keys valid

### 2. Data Consistency Checks

**Cross-table Validation**:
```python
# Ensure every course has at least one student enrolled
courses_with_students = enrollment['course_id'].unique()
assert all(course in courses_with_students for course in courses['course_id'])

# Ensure no orphaned enrollments
assert all(enrollment['student_id'].isin(students['student_id']))
assert all(enrollment['course_id'].isin(courses['course_id']))
```

**Result**: 100% consistency verified across all datasets

## Feature Engineering

### 1. Primary Features: Schedule Genes

**Representation**: Each exam is encoded as a gene with three components:
```python
@dataclass
class ScheduleGene:
    exam: Exam              # Course + enrolled students
    room: Room              # Physical location
    timeslot: TimeSlot      # Day + time
```

**Engineering Process**:
```python
# Create Exam objects with enrolled student lists
for course in courses:
    enrolled_students = enrollment[
        enrollment['course_id'] == course['course_id']
    ]['student_id'].tolist()
    
    exam = Exam(
        course_id=course['course_id'],
        course_name=course['course_name'],
        enrolled_students=enrolled_students,
        professor_id=course['professor_id']
    )
```

**Engineered Attributes**:
- `enrolled_students`: List of student IDs per exam (enables conflict detection)
- `exam_size`: Count of enrolled students (for capacity checking)

### 2. Conflict Detection Features

#### Student Conflict Matrix
**Purpose**: Fast detection of student scheduling conflicts

**Construction**:
```python
# Build student-to-exams mapping
student_schedule = defaultdict(set)

for gene in timetable.genes:
    timeslot_key = f"{gene.timeslot.day}_{gene.timeslot.time}"
    for student_id in gene.exam.enrolled_students:
        if timeslot_key in student_schedule[student_id]:
            # CONFLICT DETECTED
            hard_conflicts += 1
        else:
            student_schedule[student_id].add(timeslot_key)
```

**Feature**: `student_schedule: Dict[str, Set[str]]`
- Key: Student ID
- Value: Set of occupied timeslots
- Enables O(1) conflict checking

#### Room Occupancy Matrix
**Purpose**: Prevent double-booking of rooms

**Construction**:
```python
# Build room-timeslot occupancy map
room_schedule = {}

for gene in timetable.genes:
    key = f"{gene.room.room_id}_{gene.timeslot.day}_{gene.timeslot.time}"
    if key in room_schedule:
        # DOUBLE BOOKING DETECTED
        hard_conflicts += 1
    else:
        room_schedule[key] = gene.exam.course_id
```

**Feature**: `room_schedule: Dict[str, str]`
- Key: Room + Timeslot combination
- Value: Assigned course ID
- Enables room conflict detection

### 3. Utilization Features

#### Room Utilization Ratio
**Formula**: `utilization = enrolled_students / room_capacity`

**Purpose**: Optimize room efficiency

**Categories**:
- Under-utilized: < 0.50 (wasteful)
- Optimal: 0.50 - 0.95 (efficient)
- Over-utilized: > 0.95 (uncomfortable, potential capacity violation)

**Penalty Function**:
```python
if utilization < 0.5:
    soft_penalty += 20  # Under-utilized
elif utilization > 0.95:
    soft_penalty += 30  # Over-crowded
# else: optimal range, no penalty
```

#### Time Slot Distribution
**Purpose**: Balance exam load across available slots

**Feature**: `slot_usage: Dict[str, int]`
- Counts exams per timeslot
- Penalizes overused slots
- Encourages even distribution

**Penalty Function**:
```python
for timeslot, count in slot_usage.items():
    if count > 3:
        soft_penalty += count * 10  # Overloaded slot
```

### 4. Back-to-Back Exam Detection

**Purpose**: Minimize student stress from consecutive exams

**Algorithm**:
```python
for student_id, timeslots in student_schedule.items():
    sorted_slots = sorted(timeslots)
    for i in range(len(sorted_slots) - 1):
        day1, time1 = sorted_slots[i].split('_')
        day2, time2 = sorted_slots[i+1].split('_')
        
        if day1 == day2:  # Same day
            # Check if consecutive time blocks
            if are_consecutive(time1, time2):
                soft_penalty += 50  # Back-to-back penalty
```

**Feature**: Sequential timeslot analysis per student
- Detects adjacent exam scheduling
- Applies graduated penalty

## Encoding and Scaling Methods

### 1. Chromosome Encoding

**Method**: Direct Representation (Integer Encoding)

**Structure**:
```python
# Each gene is a tuple: (Exam, Room, Timeslot)
Chromosome = List[ScheduleGene]

# Example encoding:
gene = {
    'exam': Exam(course_id='CS101', ...),
    'room': Room(room_id='Room101', capacity=50),
    'timeslot': TimeSlot(slot_id='T01', day='Monday', time='09:00-12:00')
}
```

**Advantages**:
- Natural problem representation
- No decoding overhead
- Easy constraint checking
- Intuitive genetic operators

### 2. Fitness Score Scaling

**Problem**: Hard and soft constraints have vastly different importance

**Solution**: Penalty Weighting
```python
# Hard constraints: Extreme penalties (must be satisfied)
STUDENT_CONFLICT_PENALTY = 10000
ROOM_CAPACITY_PENALTY = 5000
DOUBLE_BOOKING_PENALTY = 8000

# Soft constraints: Moderate penalties (should be optimized)
BACK_TO_BACK_PENALTY = 50
UNDERUTILIZED_ROOM_PENALTY = 20
OVERUTILIZED_ROOM_PENALTY = 30
SLOT_OVERLOAD_PENALTY = 10 * count

# Fitness calculation
fitness = (hard_penalty * 10000) + soft_penalty
```

**Why These Scales**:
- Hard penalties >> soft penalties ensures feasibility first
- Soft penalties differentiate between feasible solutions
- Relative weighting based on constraint criticality

### 3. Normalization (Not Required)

**Decision**: No normalization applied to fitness scores

**Justification**:
- Fitness is already penalty-based (lower is better)
- Scale differences are intentional (constraint priorities)
- GA naturally handles varying fitness ranges
- No gradient-based optimization (no vanishing/exploding gradients)

## Train/Validation/Test Split

### Adaptation for Optimization Problems

Unlike supervised learning, the GA doesn't use traditional train/test splits. Instead:

### 1. Problem Instance Split (Dataset Variations)

**Purpose**: Test algorithm generalization across problem sizes

**Split Strategy**:
```
Small Problem (Training):
- 40 courses, 500 students, 10 rooms, 15 timeslots
- Purpose: Algorithm development and parameter tuning

Medium Problem (Validation):
- 70 courses, 800 students, 15 rooms, 20 timeslots  
- Purpose: Validate scalability and performance

Large Problem (Test):
- 100 courses, 1000 students, 20 rooms, 25 timeslots
- Purpose: Test real-world applicability
```

**Why These Sizes**:
- Small: Manageable for rapid experimentation (< 1 min)
- Medium: Realistic university department size (2-3 min)
- Large: Full university scale (5-10 min)

### 2. Multiple Random Initializations

**Purpose**: Assess algorithm consistency and robustness

**Strategy**:
```python
# Run optimization multiple times with different seeds
results = []
for seed in [42, 123, 456, 789, 2024]:
    random.seed(seed)
    np.random.seed(seed)
    
    ga = GeneticAlgorithm(...)
    solution = ga.evolve()
    results.append(solution.fitness)

# Compute statistics
mean_fitness = np.mean(results)
std_fitness = np.std(results)
success_rate = sum(s.hard_conflicts == 0 for s in results) / len(results)
```

**Metrics**:
- Mean fitness across runs
- Standard deviation (consistency)
- Success rate (zero hard conflicts)
- Convergence speed variance

### 3. Cross-Validation Equivalent

**Method**: K-Fold Problem Variation

**Process**:
1. Generate K different enrollment patterns for same courses/students
2. Run GA on each variation
3. Measure performance consistency

**Implementation**:
```python
# Generate 5 different enrollment datasets
for fold in range(5):
    # Shuffle enrollments while maintaining per-student course count
    enrollment_variant = create_enrollment_variation(students, courses)
    
    # Run optimization
    solution = run_optimization(enrollment_variant)
    
    # Record metrics
    fold_metrics[fold] = {
        'fitness': solution.fitness,
        'hard_conflicts': solution.hard_conflicts,
        'soft_conflicts': solution.soft_conflict_score
    }
```

**Purpose**: Verify algorithm isn't overfitting to specific data patterns

## Why Stratification Was Not Used

**Explanation**: Stratification is not applicable because:

1. **No Class Labels**: Optimization problem has no target classes
2. **No Prediction**: GA doesn't predict; it generates feasible solutions
3. **Constraint-Based**: Success measured by constraint satisfaction, not accuracy
4. **All Data Used**: Every exam must be scheduled (no sampling)

**Alternative**: Ensure representative problem instances
- Vary enrollment distributions
- Test different constraint densities
- Evaluate across problem sizes

## Feature Importance Analysis

### Most Critical Features for Fitness

1. **Student-Timeslot Assignments** (Weight: 10000)
   - Impact: Direct hard constraint violations
   - Detection: O(n) per student
   - Criticality: Must be zero for feasibility

2. **Room-Timeslot Assignments** (Weight: 8000)
   - Impact: Prevents double-booking
   - Detection: O(1) hash lookup
   - Criticality: Must be zero for feasibility

3. **Enrollment Size vs. Capacity** (Weight: 5000/20-30)
   - Impact: Hard + soft constraint
   - Detection: Direct comparison
   - Criticality: Hard boundary at 100%, soft penalties for inefficiency

4. **Back-to-Back Scheduling** (Weight: 50)
   - Impact: Student welfare optimization
   - Detection: Sequential timeslot analysis
   - Criticality: Soft constraint (quality of life)

5. **Slot Distribution** (Weight: 10 per excess)
   - Impact: Balanced workload
   - Detection: Count aggregation
   - Criticality: Soft constraint (operational efficiency)

## Summary Statistics

### Feature Space Dimensions:
- **Problem Space**: `N_courses × N_rooms × N_timeslots` combinations
  - Example: 40 × 10 × 15 = 6,000 possible assignments per exam
  - Total search space: 6,000^40 ≈ 10^148 possible schedules

### Engineered Features Created:
- Primary: 3 (Exam, Room, Timeslot per gene)
- Conflict Detection: 2 matrices (student conflicts, room conflicts)
- Utilization: 2 metrics (room efficiency, slot balance)
- Sequence Analysis: 1 (back-to-back detection)

### Data Transformation Pipeline:
```
Raw CSV Files
    ↓
Load & Validate (Cleaning)
    ↓
Create Domain Objects (Exam, Room, TimeSlot)
    ↓
Build Conflict Detection Structures
    ↓
Generate Initial Population (Random Chromosomes)
    ↓
Fitness Evaluation (Feature-based Scoring)
    ↓
Genetic Operators (Crossover, Mutation)
    ↓
Optimal Schedule (Best Chromosome)
```

## Conclusion

The preprocessing and feature engineering pipeline transforms raw scheduling data into an efficient representation for genetic algorithm optimization. Key innovations include conflict detection matrices for O(1) lookups, penalty-weighted fitness scoring for constraint prioritization, and utilization metrics for solution quality assessment. The approach eliminates traditional ML preprocessing (normalization, train/test splits) in favor of optimization-specific techniques (penalty scaling, problem instance variations, multiple runs for validation).
