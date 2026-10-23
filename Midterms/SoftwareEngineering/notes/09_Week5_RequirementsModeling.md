# Week 5: Requirements Modeling

What this lecture is about: scenario-, class-, function- and behavior-based analysis, including use cases, CRC cards and UML diagrams used by the exam case studies.

Source: `Pressman_SEPA_9e_Ch008_PPT.pptx`, 43 slides. Slides 36-43 provide detailed text alternatives for the diagrams. Diagram slides 13, 21, 24, 26, 30, 31 and 33 were also inspected visually.

## 1. Purpose and kinds of models (slides 2-6)

Requirements analysis refines operational characteristics, interfaces and constraints, elaborating information gathered during earlier RE tasks. It bridges the system description and design.

| Model | Question answered |
|---|---|
| Scenario-based | How does an actor use the system? |
| Class-oriented | Which classes, attributes, operations and collaborations are needed? |
| Behavioral | How does the system react to events? |
| Data | What information and relationships form the problem domain? |
| Flow-oriented | How do functions transform and move data? |

Keep abstraction high initially. Represent information, function and behavior, partition models to reveal detail progressively, and move toward implementation detail only as understanding develops.

**Past-paper ambiguity:** 2024 Q5 asks for four key elements, but this slide explicitly lists five model types. A common four-element grouping is scenario-based, class-based, behavioral and flow-oriented (textbook/context grouping). Ask which taxonomy the course expects; do not present that grouping as the exact Ch08 s3 list.

## 2. Actors, profiles and use cases (slides 7-13)

An actor is a role or external entity exchanging information with the system. One person may play different roles. A UML profile extends modeling constructs for a particular domain/platform; it is not a user persona.

A use case is a more structured behavioral contract than a brief user story. Begin with activities/goals of a particular actor, then refine primary scenarios.

Ask at every step whether the actor can do something else, an error can occur, or an external event can trigger different behavior. These questions produce alternative/secondary scenarios.

**Writing template** (assembled from slides 8-12):

| Field | What to record |
|---|---|
| Name and goal | Actor-visible outcome |
| Primary actor | Role initiating the goal |
| Supporting actors | External roles/services involved |
| Trigger | Event starting the interaction |
| Preconditions | What must already be true |
| Main flow | Numbered actor and system actions |
| Alternatives/exceptions | Relevant decisions, failures and recovery |
| Postconditions | Success outcome and, if useful, failure guarantees |
| Open issues | Unresolved requirements |

Postconditions are standard use-case context; this exact table is a study aid, not a verbatim slide template.

## 3. Use case diagrams (slide 13)

The SafeHome example shows a system boundary, homeowner actor, camera actor and user goals inside the boundary. The diagram shows **who can do what**, not the time-ordered steps of the operation.

For a campus system, Student, Teacher and Administrator are roles; "Register for course" is a goal. The registration database is an internal design element, not automatically an external actor.

Use association lines to connect actors to goals. Do not add `include`/`extend` relationships unless their meanings are understood; the introductory diagram does not require them.

## 4. Finding analysis classes (slides 14-19)

Class-based modeling represents objects, their operations, relationships and collaborations.

Start by finding nouns/noun phrases in scenarios and recording synonyms. Candidate categories: external entities, things, events, roles, organizational units, places and structures.

Then filter candidates using retained information, needed services, multiple/common attributes, common operations and essential requirements. Not every noun is a class.

- **Attributes:** information belonging to an object in this problem.
- **Operations:** manipulate data, compute, inquire about state or monitor controlling events.
- Distinguish problem-space concepts from implementation-only solution concepts.

**Study example:** Course has courseCode, capacity and prerequisites. Enrollment records a Student-Course registration. A literal "confirmation message" might be a generated artifact rather than a persistent analysis class.

## 5. CRC modeling (slides 20-22)

A Class-Responsibility-Collaborator card has a class name at the top, responsibilities on the left and collaborators on the right.

| Class: Enrollment | Collaborators |
|---|---|
| Track enrollment status | Student, Course |
| Record accepted registration | Course |

This card is a study example. In the lecture's FloorPlan card, responsibilities include scaling/displaying the floor plan and incorporating walls/cameras; collaborators include Wall and Camera.

Review CRC cards by walking through a use case and asking card holders which responsibility fulfills each interaction. Missing responsibilities or collaborations lead to revised/new cards.

## 6. Functional and activity modeling (slides 23-24, 31)

Functional modeling addresses user-visible functions and operations within analysis classes. An activity diagram supplements a use case with the flow of processing.

Basic notation: filled circle for initial node, rounded action nodes, arrows for control flow, diamonds for decisions/merges, bull's-eye for an activity final. Guards label branches.

**Registration study flow:** authenticate → choose course → check prerequisites/seats → [eligible] register → confirm; [ineligible/full] explain problem → choose another course or stop.

Model payment only when it is in the given scenario. Do not copy steps from a different year's case.

## 7. Sequence diagrams (slides 25-26)

A sequence diagram represents participants/lifelines and messages in time order. It shows how exchanges lead to behavior across objects.

The slide's password example involves Homeowner, Control Panel, System and Sensors. It includes password entry/lookup, activation, acknowledgement and a lock after too many attempts.

Sequence is not the same as activity: sequence emphasizes **participants exchanging messages**; activity emphasizes **processing/control flow**.

## 8. Behavioral and state modeling (slides 27-30)

Read use cases, identify events and the objects affected, build sequence/state models and review them for consistency.

An event is the occurrence of an information exchange or stimulus, not the data value itself. Events can trigger state changes.

The state example uses Reading, Comparing, Locked and Selecting states. Transitions depend on password validity, number of attempts and lock time. A state describes a situation that persists; an action describes work performed.

Transition-label context: `event [guard] / action`. The full syntax is UML study context, not a complete notation specification in this deck.

## 9. Swimlanes and consistency (slides 32-33)

Swimlanes divide an activity diagram by responsibility. The lecture uses Homeowner, Camera and Interface lanes.

Check that:

- Each action has a responsible role/component.
- Decisions have meaningful conditions.
- Main flow and error flow agree with the written use case.
- The diagram stays within the selected use case's scope.
- An end state is reachable.

## Exam focus

- Extract requirements, actors and goals before drawing.
- Practice a complete use case description and its activity diagram together.
- Explain CRC with one responsibility/collaborator example.
- Draw class/state/activity notation without confusing the diagram types.
- Explain data modeling as objects, attributes and relationships in the information domain.
- Related past questions: 2023 Q3, Q5, Q7; 2024 Q5-Q7; 2025 Q7; every case study.
