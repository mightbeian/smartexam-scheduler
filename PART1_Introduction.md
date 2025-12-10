# PART 1 — INTRODUCTION, SCOPE & HYPOTHESIS

## Introduction

The university exam timetabling problem represents a critical challenge in educational administration, where the scheduling of examinations must satisfy multiple competing constraints while optimizing resource utilization. This NP-hard combinatorial optimization problem becomes increasingly complex as the number of courses, students, rooms, and time slots grows, making traditional manual scheduling approaches impractical and error-prone.

SmartExam Scheduler addresses this challenge by implementing a metaheuristic approach using Genetic Algorithms (GA) to evolve optimal exam schedules. The system treats exam timetabling as a Constraint Satisfaction Optimization Problem (CSOP), where the goal is to minimize conflicts while respecting both hard constraints (absolute requirements that cannot be violated) and soft constraints (preferences that should be optimized when possible).

## Problem Statement

Manual exam scheduling is time-consuming, error-prone, and often produces suboptimal solutions. Universities face recurring challenges including:
1. Student schedule conflicts (same student assigned to multiple exams simultaneously)
2. Room capacity violations and double-booking
3. Inefficient resource utilization
4. Back-to-back examination stress on students
5. Unbalanced distribution of exams across available time slots

Traditional heuristic methods and manual approaches struggle to find globally optimal solutions in reasonable time frames, particularly as problem size scales.

## Research Question

**Primary Question**: Can a Genetic Algorithm effectively solve the university exam timetabling problem to produce conflict-free schedules that optimize resource utilization and minimize student examination stress?

**Sub-questions**:
1. How do GA parameters (population size, crossover rate, mutation rate) affect solution quality and convergence speed?
2. What fitness function design best balances hard and soft constraints?
3. How does the algorithm perform across different problem sizes and constraint complexities?

## Hypothesis

**Main Hypothesis**: A properly configured Genetic Algorithm with tournament selection, uniform crossover, and adaptive mutation will consistently produce exam schedules with zero hard conflicts (perfect feasibility) and minimized soft constraint violations (high quality) within 500-1000 generations.

**Supporting Hypotheses**:
- H1: Population size of 100-200 will provide sufficient diversity for exploration while maintaining computational efficiency
- H2: Tournament selection with size 5 will balance selection pressure with population diversity
- H3: Uniform crossover at 80% rate will effectively recombine parent solutions
- H4: Mutation rate of 20% will prevent premature convergence
- H5: Elitism (preserving top 5 solutions) will ensure monotonic improvement in best fitness

## Target Metrics

### Primary Metrics:
1. **Hard Conflict Score**: Number of constraint violations (Target: 0)
   - Student double-booking conflicts
   - Room capacity violations
   - Room double-booking conflicts

2. **Soft Conflict Score**: Weighted penalty sum (Target: < 500)
   - Back-to-back exam penalties
   - Room utilization efficiency
   - Time slot distribution balance

3. **Overall Fitness Score**: Combined metric (Target: < 500)
   - Fitness = (Hard_Conflicts × 10000) + Soft_Conflicts

### Secondary Metrics:
4. **Convergence Speed**: Generations to reach zero hard conflicts (Target: < 800)
5. **Solution Quality**: Final soft conflict score at convergence
6. **Computational Efficiency**: Time to optimal solution (Target: < 5 minutes for 40 courses)
7. **Success Rate**: Percentage of runs achieving zero hard conflicts (Target: > 95%)

## Mapping to Computational Science Learning Outcomes

### 1. Feature Extraction and Engineering
**Application**: We transform raw scheduling data (courses, students, enrollments, rooms, timeslots) into structured "genes" (exam assignments) that form the solution space. Feature engineering occurs through:
- Encoding exam assignments as (course, room, timeslot) tuples
- Computing student-course enrollment matrices for conflict detection
- Creating room utilization features for capacity constraint checking
- Designing timeslot usage features for distribution analysis

### 2. Model Evaluation and Tuning
**Application**: We demonstrate model evaluation through:
- Fitness function as evaluation metric (quantifies solution quality)
- Cross-validation via multiple algorithm runs with different random seeds
- Hyperparameter tuning of GA parameters (population size, crossover/mutation rates)
- Performance comparison against baseline methods (random, greedy)
- Convergence analysis across generations (analogous to training epochs)

### 3. Regularization Techniques
**Application**: We implement regularization through:
- Elitism as a form of regularization (prevents loss of best solutions)
- Mutation rate control to prevent overfitting to local optima
- Population diversity maintenance (analogous to dropout in neural networks)
- Constraint penalty weighting (similar to L1/L2 regularization in balancing objectives)

### 4. Model Robustness and Generalization
**Application**: We ensure robustness by:
- Testing across different problem sizes (40-100 courses)
- Evaluating performance on synthetic and real-world data
- Analyzing failure modes and edge cases
- Validating solution feasibility through constraint verification
- Measuring consistency across multiple independent runs

## Scope and Limitations

### In Scope:
- Single-semester exam scheduling
- Fixed room capacities and timeslots
- Hard constraints: no student conflicts, room capacity, no double-booking
- Soft constraints: minimize back-to-back exams, optimize room utilization
- Datasets: 40-100 courses, 500-1000 students, 10-20 rooms

### Out of Scope:
- Multi-semester or year-long scheduling
- Dynamic room capacity changes
- Instructor availability constraints
- Exam duration variations within time slots
- Physical accessibility requirements
- Special accommodations scheduling

### Expected Contributions:
1. **Algorithmic**: Optimized GA parameter configuration for exam scheduling
2. **Practical**: Deployable web-based scheduling system
3. **Empirical**: Performance benchmarks across problem sizes
4. **Theoretical**: Constraint satisfaction framework for educational scheduling
