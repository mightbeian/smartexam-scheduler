# PART 2 — DATA ACQUISITION & ETHICS

## Collected Datasets

### Dataset Location
**Primary Repository**: https://github.com/mightbeian/smartexam-scheduler

**Data Structure**:
```
backend/data/
├── courses.csv        (Course information)
├── students.csv       (Student records)
├── rooms.csv         (Room specifications)
├── timeslots.csv     (Available time slots)
└── enrollment.csv    (Student-course enrollments)
```

### Dataset Specifications

#### 1. Courses Dataset (courses.csv)
**Format**: CSV with 3 columns
- `course_id`: Unique course identifier (e.g., "CS101")
- `course_name`: Full course name (e.g., "Introduction to Programming")
- `professor_id`: Assigned instructor identifier (e.g., "P01")

**Sample Size**: 40 courses (configurable up to 200)
**Source**: Synthetically generated using Faker library
**Purpose**: Defines exams that need scheduling

#### 2. Students Dataset (students.csv)
**Format**: CSV with 2 columns
- `student_id`: Unique student identifier (e.g., "S0001")
- `student_name`: Student full name

**Sample Size**: 500 students (configurable up to 2000)
**Source**: Synthetically generated with realistic names
**Purpose**: Enables conflict detection through enrollment tracking

#### 3. Rooms Dataset (rooms.csv)
**Format**: CSV with 2 columns
- `room_id`: Unique room identifier (e.g., "Room101")
- `capacity`: Maximum student capacity (30-150 range)

**Sample Size**: 10 rooms (configurable up to 50)
**Capacity Distribution**: 
- Small (30-50): 40%
- Medium (60-100): 40%
- Large (120-150): 20%
**Source**: Synthetically generated with realistic capacities
**Purpose**: Defines physical constraints for exam assignments

#### 4. Timeslots Dataset (timeslots.csv)
**Format**: CSV with 3 columns
- `timeslot_id`: Unique identifier (e.g., "T01")
- `day`: Day of week (Monday-Friday)
- `time`: Time range (e.g., "09:00-12:00")

**Sample Size**: 15 timeslots (3 slots × 5 days)
**Time Blocks**:
- Morning: 09:00-12:00
- Afternoon: 13:00-16:00
- Evening: 17:00-20:00
**Source**: Standard academic scheduling template
**Purpose**: Defines temporal constraints for scheduling

#### 5. Enrollment Dataset (enrollment.csv)
**Format**: CSV with 2 columns
- `student_id`: References students.csv
- `course_id`: References courses.csv

**Sample Size**: ~2000 records (avg. 4 courses per student)
**Distribution**: 
- 3 courses: 20% of students
- 4 courses: 60% of students
- 5 courses: 20% of students
**Source**: Randomly generated with realistic distribution
**Purpose**: Critical for detecting student scheduling conflicts

### Data Generation Methodology

For research reproducibility and ethical compliance, we use **synthetic data generation** rather than real student records:

**Generation Script**: `backend/app/data_generator.py`

**Key Features**:
- Deterministic seeding for reproducibility
- Realistic name generation using Faker library
- Statistically valid enrollment distributions
- Configurable scale parameters
- No personally identifiable information (PII)

**Advantages**:
1. No privacy concerns or consent requirements
2. Infinite dataset generation for testing
3. Controlled complexity scaling
4. No data anonymization overhead
5. Publicly shareable without restrictions

## Ethical and Privacy Considerations

### Privacy Protection

#### 1. Synthetic Data Approach
**Decision**: Use synthetically generated data instead of real university records

**Justification**:
- Eliminates all privacy risks associated with real student data
- No need for consent forms or IRB approval
- Enables public sharing of code and datasets
- Allows unlimited experimentation without data protection concerns
- Facilitates reproducible research

**Implementation**:
- Faker library generates realistic but fictional names
- Random IDs have no connection to real students
- Course names are generic and non-identifying
- No demographic or sensitive attributes collected

#### 2. No Real Student Data Used
**Commitment**: Zero real student records processed or stored

**Verification**:
- All data generated programmatically
- No database connections to university systems
- No file imports from real scheduling systems
- Clear documentation of synthetic nature

### Data Ethics Framework

#### 1. Transparency
**Practice**: Clear labeling of synthetic data
- README explicitly states data is synthetic
- Documentation includes generation methodology
- Research papers acknowledge synthetic data use
- No misleading claims about real-world data

#### 2. Responsible Use
**Guidelines**:
- Synthetic data used only for algorithm development and testing
- No pretense of real student scheduling
- Results presented as proof-of-concept, not production system
- Clear distinction between research prototype and deployed system

#### 3. Algorithmic Fairness
**Considerations**:
- Algorithm treats all students equally (no demographic bias)
- No protected attributes in dataset
- Objective fitness function based solely on feasibility and efficiency
- No human bias in automated scheduling decisions

#### 4. Stakeholder Impact
**Analysis**:
- **Students**: Benefit from conflict-free, optimized schedules
- **Administrators**: Reduced manual scheduling effort
- **Faculty**: Better resource utilization
- **Institution**: Improved operational efficiency

### Consent and Data Governance

#### Not Required Due To:
1. **Synthetic Data**: No real individuals involved
2. **Algorithm Research**: Focus on optimization methodology
3. **Public Code**: No proprietary or sensitive data
4. **Educational Context**: Student project for learning

#### If Deploying with Real Data:
**Required Steps** (documented for future production use):

1. **Institutional Approval**
   - IRB review if required by institution
   - Data governance committee approval
   - IT security assessment

2. **Student Consent**
   - Opt-in for automated scheduling
   - Clear explanation of algorithm and data use
   - Right to request manual review
   - Data retention and deletion policies

3. **Data Protection**
   - Encryption at rest and in transit
   - Access control and audit logging
   - Regular security assessments
   - FERPA compliance (if US institution)
   - GDPR compliance (if EU students)

4. **Bias Monitoring**
   - Regular audits for scheduling fairness
   - Analysis of outcome distributions
   - Feedback mechanism for students
   - Continuous algorithm evaluation

### Data Quality and Validation

#### Quality Assurance:
- **Consistency**: Foreign key integrity in enrollments
- **Completeness**: No missing values in required fields
- **Validity**: Capacity constraints are realistic (30-150)
- **Realism**: Enrollment patterns match typical universities

#### Validation Methods:
- Automated data validation scripts
- Statistical distribution checks
- Edge case testing (min/max values)
- Integration testing with algorithm

### Data Sharing and Reproducibility

**Public Availability**: Full dataset available on GitHub
**License**: MIT License (unrestricted academic use)
**Reproducibility**: Generation script provided for dataset recreation
**Documentation**: CSV format specifications included

**Access**: 
```bash
git clone https://github.com/mightbeian/smartexam-scheduler
cd backend/data
# CSV files available or regenerate with:
python app/data_generator.py
```

### Ethical Review Summary

✅ **No human subjects involved** (synthetic data)  
✅ **No PII collected or processed**  
✅ **Public, open-source implementation**  
✅ **Clear documentation of synthetic nature**  
✅ **Reproducible research methodology**  
✅ **Prepared for ethical real-world deployment**  
✅ **Algorithmic fairness by design**  

### Risk Mitigation

| Potential Risk | Mitigation Strategy | Status |
|---------------|---------------------|---------|
| Privacy breach | Use only synthetic data | ✅ Implemented |
| Algorithmic bias | Objective, constraint-based optimization | ✅ Verified |
| Data misuse | Clear documentation and licensing | ✅ Documented |
| Consent violations | No real data, clear synthetic labeling | ✅ Not applicable |
| Security vulnerabilities | Standard web security practices | ✅ Addressed |

## Conclusion

The SmartExam Scheduler project maintains the highest ethical standards by using entirely synthetic data, eliminating all privacy and consent concerns. The methodology is transparent, reproducible, and designed with future ethical deployment considerations in mind. This approach allows unfettered research and development while preparing for responsible real-world application.
