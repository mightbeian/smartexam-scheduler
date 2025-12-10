"""
Genetic Algorithm for Exam Timetabling Optimization
Implements a metaheuristic approach to solve the university exam scheduling problem
"""

import random
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass
from copy import deepcopy


@dataclass
class Exam:
    """Represents an exam with its associated data"""
    course_id: str
    course_name: str
    enrolled_students: List[str]
    professor_id: str


@dataclass
class TimeSlot:
    """Represents a time slot"""
    slot_id: str
    day: str
    time: str


@dataclass
class Room:
    """Represents a room with its capacity"""
    room_id: str
    capacity: int


@dataclass
class ScheduleGene:
    """Represents a single scheduling decision (exam -> room + timeslot)"""
    exam: Exam
    room: Room
    timeslot: TimeSlot


class Timetable:
    """Represents a complete exam timetable (chromosome in GA terms)"""
    
    def __init__(self, genes: List[ScheduleGene]):
        self.genes = genes
        self.fitness = 0
        self.hard_conflicts = 0
        self.soft_conflict_score = 0
    
    def calculate_fitness(self) -> float:
        """
        Calculate the fitness of this timetable
        Lower score is better
        Hard constraints have extreme penalties
        """
        hard_penalty = 0
        soft_penalty = 0
        
        # Check hard constraints
        # 1. No student in two exams at the same time
        student_schedule = {}
        for gene in self.genes:
            timeslot_key = f"{gene.timeslot.day}_{gene.timeslot.time}"
            
            for student_id in gene.exam.enrolled_students:
                if student_id in student_schedule:
                    if timeslot_key in student_schedule[student_id]:
                        hard_penalty += 10000  # Massive penalty
                        self.hard_conflicts += 1
                    else:
                        student_schedule[student_id].add(timeslot_key)
                else:
                    student_schedule[student_id] = {timeslot_key}
        
        # 2. Room capacity check
        for gene in self.genes:
            if len(gene.exam.enrolled_students) > gene.room.capacity:
                hard_penalty += 5000  # Large penalty for capacity violation
        
        # 3. No room double-booking
        room_schedule = {}
        for gene in self.genes:
            key = f"{gene.room.room_id}_{gene.timeslot.day}_{gene.timeslot.time}"
            if key in room_schedule:
                hard_penalty += 8000  # Severe penalty
            else:
                room_schedule[key] = True
        
        # Check soft constraints
        # 1. Minimize back-to-back exams for students
        for student_id, slots in student_schedule.items():
            slots_list = sorted(list(slots))
            for i in range(len(slots_list) - 1):
                # Simple heuristic: if slots are on same day, check if back-to-back
                # This is simplified - in production, would parse actual times
                if slots_list[i].split('_')[0] == slots_list[i+1].split('_')[0]:
                    soft_penalty += 50
        
        # 2. Prefer filling rooms efficiently (not too empty, not overcrowded)
        for gene in self.genes:
            utilization = len(gene.exam.enrolled_students) / gene.room.capacity
            if utilization < 0.5:
                soft_penalty += 20  # Room too empty
            elif utilization > 0.95:
                soft_penalty += 30  # Room too crowded
        
        # 3. Spread exams evenly across time slots
        slot_usage = {}
        for gene in self.genes:
            key = f"{gene.timeslot.day}_{gene.timeslot.time}"
            slot_usage[key] = slot_usage.get(key, 0) + 1
        
        # Penalize overused slots
        for count in slot_usage.values():
            if count > 3:
                soft_penalty += count * 10
        
        self.hard_conflicts = hard_penalty // 10000
        self.soft_conflict_score = soft_penalty
        self.fitness = hard_penalty + soft_penalty
        
        return self.fitness


class GeneticAlgorithm:
    """
    Genetic Algorithm for Exam Timetabling
    """
    
    def __init__(
        self,
        exams: List[Exam],
        rooms: List[Room],
        timeslots: List[TimeSlot],
        population_size: int = 100,
        generations: int = 1000,
        crossover_rate: float = 0.8,
        mutation_rate: float = 0.2,
        elitism_count: int = 5
    ):
        self.exams = exams
        self.rooms = rooms
        self.timeslots = timeslots
        self.population_size = population_size
        self.generations = generations
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.elitism_count = elitism_count
        
        self.population: List[Timetable] = []
        self.best_solution: Timetable = None
        self.generation_history: List[Dict] = []
    
    def initialize_population(self):
        """Create initial random population of timetables"""
        self.population = []
        
        for _ in range(self.population_size):
            genes = []
            for exam in self.exams:
                # Randomly assign room and timeslot
                room = random.choice(self.rooms)
                timeslot = random.choice(self.timeslots)
                genes.append(ScheduleGene(exam, room, timeslot))
            
            timetable = Timetable(genes)
            self.population.append(timetable)
    
    def evaluate_population(self):
        """Calculate fitness for all timetables in population"""
        for timetable in self.population:
            timetable.calculate_fitness()
        
        # Sort by fitness (lower is better)
        self.population.sort(key=lambda t: t.fitness)
        
        # Update best solution
        if self.best_solution is None or self.population[0].fitness < self.best_solution.fitness:
            self.best_solution = deepcopy(self.population[0])
    
    def tournament_selection(self, tournament_size: int = 5) -> Timetable:
        """Select a timetable using tournament selection"""
        tournament = random.sample(self.population, tournament_size)
        return min(tournament, key=lambda t: t.fitness)
    
    def crossover(self, parent1: Timetable, parent2: Timetable) -> Tuple[Timetable, Timetable]:
        """
        Perform uniform crossover
        Randomly mix genes from both parents
        """
        if random.random() > self.crossover_rate:
            return deepcopy(parent1), deepcopy(parent2)
        
        # Uniform crossover
        child1_genes = []
        child2_genes = []
        
        for gene1, gene2 in zip(parent1.genes, parent2.genes):
            if random.random() < 0.5:
                child1_genes.append(deepcopy(gene1))
                child2_genes.append(deepcopy(gene2))
            else:
                child1_genes.append(deepcopy(gene2))
                child2_genes.append(deepcopy(gene1))
        
        return Timetable(child1_genes), Timetable(child2_genes)
    
    def mutate(self, timetable: Timetable):
        """
        Mutate a timetable by randomly changing some assignments
        """
        for gene in timetable.genes:
            if random.random() < self.mutation_rate:
                # Randomly change room or timeslot
                if random.random() < 0.5:
                    gene.room = random.choice(self.rooms)
                else:
                    gene.timeslot = random.choice(self.timeslots)
    
    def evolve(self, callback=None):
        """
        Main evolution loop
        """
        print("Initializing population...")
        self.initialize_population()
        
        print(f"Evolving for {self.generations} generations...")
        
        for generation in range(self.generations):
            # Evaluate current population
            self.evaluate_population()
            
            # Track progress
            best_fitness = self.population[0].fitness
            avg_fitness = sum(t.fitness for t in self.population) / len(self.population)
            
            self.generation_history.append({
                'generation': generation,
                'best_fitness': best_fitness,
                'avg_fitness': avg_fitness,
                'hard_conflicts': self.population[0].hard_conflicts,
                'soft_conflicts': self.population[0].soft_conflict_score
            })
            
            # Print progress
            if generation % 50 == 0:
                print(f"Generation {generation}: Best Fitness = {best_fitness:.2f}, "
                      f"Hard Conflicts = {self.population[0].hard_conflicts}, "
                      f"Soft Penalty = {self.population[0].soft_conflict_score}")
            
            # Callback for real-time updates
            if callback:
                callback(self.generation_history[-1])
            
            # Check for perfect solution
            if self.population[0].hard_conflicts == 0 and self.population[0].soft_conflict_score < 500:
                print(f"\nOptimal solution found at generation {generation}!")
                break
            
            # Create next generation
            new_population = []
            
            # Elitism: keep best solutions
            new_population.extend(deepcopy(t) for t in self.population[:self.elitism_count])
            
            # Generate rest of population through crossover and mutation
            while len(new_population) < self.population_size:
                # Selection
                parent1 = self.tournament_selection()
                parent2 = self.tournament_selection()
                
                # Crossover
                child1, child2 = self.crossover(parent1, parent2)
                
                # Mutation
                self.mutate(child1)
                self.mutate(child2)
                
                new_population.extend([child1, child2])
            
            # Trim to population size
            self.population = new_population[:self.population_size]
        
        # Final evaluation
        self.evaluate_population()
        
        print("\n" + "="*60)
        print("OPTIMIZATION COMPLETE")
        print("="*60)
        print(f"Best Fitness Score: {self.best_solution.fitness:.2f}")
        print(f"Hard Conflicts: {self.best_solution.hard_conflicts}")
        print(f"Soft Conflict Score: {self.best_solution.soft_conflict_score}")
        print("="*60)
        
        return self.best_solution
    
    def get_schedule_dict(self) -> Dict:
        """Convert best solution to dictionary format for API response"""
        if not self.best_solution:
            return {}
        
        schedule = []
        for gene in self.best_solution.genes:
            schedule.append({
                'course_id': gene.exam.course_id,
                'course_name': gene.exam.course_name,
                'professor_id': gene.exam.professor_id,
                'room_id': gene.room.room_id,
                'room_capacity': gene.room.capacity,
                'timeslot_id': gene.timeslot.slot_id,
                'day': gene.timeslot.day,
                'time': gene.timeslot.time,
                'enrolled_count': len(gene.exam.enrolled_students)
            })
        
        return {
            'schedule': schedule,
            'metrics': {
                'fitness': self.best_solution.fitness,
                'hard_conflicts': self.best_solution.hard_conflicts,
                'soft_conflict_score': self.best_solution.soft_conflict_score,
                'total_exams': len(self.exams)
            },
            'history': self.generation_history
        }
