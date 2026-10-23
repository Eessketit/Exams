# Week 1.1: Software and Software Engineering

What this lecture is about: what software includes, why it changes, the meaning of software engineering, and the process and practical principles used to build useful software.

Source: `Pressman_SEPA_9e_Ch001_PPT.pptx`, 21 slides. Slides 19-21 are closing/accessibility material; slide 21 describes the graph on slide 5. Slide numbers below are positions in the supplied deck.

## 1. What software includes (slides 2-4)

Software includes three things:

| Element | Meaning | Example |
|---|---|---|
| Instructions | Programs that implement features, functions and performance | Booking service code |
| Data structures | Representations that let programs manipulate information | Booking records and indexes |
| Documentation | Descriptions of operation and use | Operator instructions and API documentation |

The examples in the last column are study examples, not examples on the slide.

- Software is **developed or engineered**, rather than manufactured in the classical sense.
- Software does not physically wear out, although it can **deteriorate** as changes introduce side effects.
- Component reuse is growing, but the slides emphasize that much software remains custom-built.

Application domains: system software, application software, engineering/scientific software, embedded software, product-line software, Web/mobile applications and AI software.

Do not confuse a domain with a process model: embedded software is a domain; waterfall is a process model.

## 2. Wear and deterioration (slides 5, 21)

The graph plots failure rate against time. An idealized software curve falls as defects are removed. The actual curve has spikes when changes introduce defects and can rise as side effects accumulate.

**Exam explanation:** the program has no physical parts to wear out, but changing code, dependencies and requirements can introduce faults and increase complexity. Therefore, "software does not wear out" does not mean "software never needs maintenance."

## 3. Legacy software and reasons for change (slide 6)

A legacy system is an existing, often long-lived system that still supports the organization. Its age alone does not prove it must be replaced.

The slide identifies four reasons for change:

1. Adapt to new computing environments or technologies.
2. Implement new business requirements.
3. Interoperate with newer systems or databases.
4. Re-architect for a network environment.

**Study example:** an old payroll system may calculate salaries correctly but lack secure integration with a new HR platform. Integration needs justify adaptation; inability to maintain it economically might justify replacement. The replacement decision is an inference, not a rule stated on slide 6.

## 4. Definition and layers of software engineering (slides 7-8)

Software engineering applies a **systematic, disciplined and quantifiable engineering approach** to development, operation and maintenance. It also studies such approaches.

Layers, from the foundation upward:

| Layer | Role |
|---|---|
| Quality focus | Continuous concern for product and process quality |
| Process | Framework that organizes work |
| Methods | Technical ways to analyze, design, implement and test |
| Tools | Automated or semi-automated support for methods and process |

The layer order comes from the picture on slide 8. Tools support engineering; buying a tool does not itself establish a sound process.

## 5. Framework and umbrella activities (slides 9-11)

The five framework activities are:

1. **Communication:** understand stakeholders and requirements.
2. **Planning:** estimate, schedule and organize work.
3. **Modeling:** requirements analysis and design.
4. **Construction:** code generation and testing.
5. **Deployment:** delivery, support and feedback.

Umbrella activities extend across the project: tracking/control, risk management, quality assurance, technical reviews, measurement, configuration management, reusability management, and work-product preparation/production.

**Difference:** construction is a framework activity; risk management accompanies several activities rather than being one isolated final phase.

Adapt the process to activity dependencies, task detail, required artifacts, QA, tracking, customer involvement, team autonomy and roles. The slide does not prescribe the same documentation or ceremony for every project.

## 6. Four practical steps (slides 12-16)

| Step | Questions to ask |
|---|---|
| Understand the problem | Who are the stakeholders? What information and functions are needed? Can the problem be partitioned or drawn? |
| Plan a solution | Have similar problems been solved? Can patterns or existing solutions be reused? Can a design model communicate the solution? |
| Carry out the plan | Does the code follow the design? Is each component reviewed and correct to the extent checked? |
| Examine the result | Are components tested? Does the result satisfy stakeholder requirements? |

Traceability connects requirements, design, code and tests. Testing is not a mathematical promise that no defect remains.

## 7. General principles and business triggers (slides 17-18)

Hooker's seven principles:

- Provide value to users.
- Keep the solution simple.
- Maintain a coherent vision.
- Remember others will consume the artifacts.
- Remain open to future change.
- Plan for reuse.
- Think before acting.

Projects can start because a defect needs correction, a legacy system needs adaptation, existing functionality needs extension, or a new product/service/system is needed.

## Exam focus

- Define software using **programs, data structures and documentation**.
- Explain physical wear versus software deterioration.
- Give reasons to modernize a legacy system without claiming every old system must be replaced.
- Reproduce the four SE layers and five framework activities in order.
- Distinguish framework activities from umbrella activities.
- For "How does SE improve reliability?", connect requirements, disciplined design, reviews, testing and controlled changes. Say it **reduces risk and defects**, not that it guarantees error-free software.
- Related past questions: 2024 Q1 and 2025 Q1.
