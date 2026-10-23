# Week 6.2: Architectural Design

What this lecture is about: architecture as a requirements-driven representation, architectural styles, contextual refinement, quality tradeoffs and reviews.

Source: `Pressman_SEPA_9e_Ch010_PPT.pptx`, 36 slides. Slides 27-36 describe diagrams. The standards reference on slide 4 is the version cited by the lecture, not a statement that it is the latest edition.

## 1. Architecture and its purpose (slides 2-3)

Architecture represents the system's important structures, components and interactions. It enables analysis against requirements, comparison of alternatives while change is relatively inexpensive, and reduction of construction risks.

It provides a shared description for stakeholders and records early decisions that strongly influence later work.

An architectural model is not the operational software itself. A diagram can be internally consistent while its implementation is still incomplete or incorrect.

## 2. Descriptions and decisions (slides 4-6)

The lecture's architecture-description discussion identifies stakeholders and their concerns: purpose, suitability, construction/deployment feasibility, risks/impacts, maintainability and evolvability.

Record significant decisions, their requirements, prerequisite decisions, affected views, current status and reasons. Update the record when alternatives are reconsidered.

Agile architecture evolves a walking skeleton alongside stories and increments. Architectural documentation and quality review can be part of each sprint rather than a one-time up-front exercise.

## 3. What a style defines (slide 7)

A style identifies a family of components, their connectors, integration constraints and semantic properties. Its value is in explaining how the system works and the tradeoffs it creates.

## 4. Architectural styles (slides 8-13)

| Style | Structure | Study situation |
|---|---|---|
| Data-centered | Components share a central repository/blackboard | Several tools work on common records |
| Data-flow | Filters transform data passed through pipes | A processing pipeline |
| Call-return | Main program invokes subordinate processing | A hierarchical application |
| Object-oriented | Objects collaborate using operations/messages | Domain objects coordinate behavior |
| Layered | Services organized into levels | UI uses application services and lower-level support |
| MVC | Model, View and Controller have distinct roles | Web interaction and presentation |

The situation column is study context. The architecture pictures on slides 8-13 were viewed directly.

For MVC, Controller handles requests and selects behavior/view; Model encapsulates content/functionality/state; View prepares and presents model data. The database is not itself the entire Model.

## 5. Refining control and data (slides 14-16)

Control questions: hierarchy, transfer of control, shared control, topology and synchronous/asynchronous operation.

Data questions: transfer between components, continuous versus occasional flow, passive/active data components, and the relationship between data and control.

Architectural considerations on the slide: economy, visibility of decisions, spacing/separation of concerns, symmetry/consistency and emergence. These terms describe design qualities, not a separate lifecycle.

## 6. Context, archetypes and components (slides 17-21)

1. Put the system into context and identify external systems, devices and people.
2. Identify architectural archetypes: abstractions of system behavior.
3. Refine the components implementing those archetypes.

The SafeHome context includes homeowner, control panel, sensors, related product/functions and internet-based systems. Archetypes include Detector, Indicator, Node and Controller.

Top-level architecture separates security, surveillance, home management and communications. Refinement exposes control-panel processing, detector management, alarm processing and lower-level services.

**Difference from a use case diagram:** context emphasizes external entities and interactions; a use case diagram expresses actor goals. Their boundaries should agree but their purposes differ.

## 7. Tradeoff analysis (slide 22)

Collect scenarios, requirements/constraints/environment, and candidate styles. Evaluate quality attributes, identify sensitivity to architectural decisions, then critique alternatives.

**Study example:** centralizing data can simplify consistency but concentrate availability concerns. Replication can improve availability while complicating coordination. This is an illustrative tradeoff, not a mandated solution in the deck.

Do not choose an architecture merely because its name is familiar; connect it to the case's constraints and qualities.

## 8. Reviews (slides 23-24)

Reviews assess quality requirements and risks early. They can use experience, prototypes, scenarios and checklists.

Pattern-based review walks through use cases, compares architecture to requirements, identifies patterns and their effects, records issues and revises the walking skeleton.

The desired output is a reasoned assessment and actionable issues, not a claim that one meeting proves the system correct.

## Exam focus

- Explain the purpose of architecture and why early decisions matter.
- Recognize and sketch all six styles.
- Explain Model, View and Controller without reducing Model to a database.
- Distinguish context, archetype and refined component representations.
- Practice explaining how a quality requirement changes an architecture choice.
- This chapter is within weeks 1-7 even though the supplied past papers emphasize requirements and processes more strongly.
