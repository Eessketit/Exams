# Week 6.1: Design Concepts

What this lecture is about: transforming requirements into an implementable design using abstraction, architecture, modularity, information hiding and functional independence.

Source: `Pressman_SEPA_9e_Ch009_PPT.pptx`, 33 slides. Slides 28-33 describe earlier diagrams.

## 1. What design produces (slides 2-7)

Design principles guide the work; concepts supply the vocabulary; practices apply them. A design must satisfy explicit requirements, address relevant implicit needs, guide implementers/testers/maintainers and describe information, function and behavior from an implementation perspective.

| Design concern | Result |
|---|---|
| Data/class design | Implementation classes and data structures |
| Architecture | Major structures and their relationships |
| Interfaces | Communication among software, hardware and users |
| Components | Internal processing details |

Slide 4 maps analysis elements to design concerns: classes influence architecture/data design; behavior and scenarios inform interfaces and component processing.

Quality guidelines emphasize recognizable structure, modularity, distinct design views, sound data structures, independent functions, simple interfaces, repeatable requirements-driven work and meaningful notation.

## 2. Fundamental concepts (slides 8, 10)

| Concept | Meaning | Small study example |
|---|---|---|
| Abstraction | Keep essential meaning and suppress unnecessary detail | `calculateFee()` hides the algorithm from its caller |
| Architecture | Overall organization and interaction | Separate enrollment, payment and notification services |
| Pattern | Recurring solution structure in a context | Reuse a known separation of presentation and domain logic |
| Separation of concerns | Divide a complex problem into distinct concerns | Separate policy rules from screen rendering |
| Modularity | Partition data and behavior into units | A registration module |
| Information hiding | Control access to internal decisions/data | Expose an operation instead of mutable global records |
| Refinement | Add detail progressively | Turn a broad processing step into an algorithm |
| Refactoring | Improve internal organization without changing behavior | Extract duplicated validation logic |

The examples are explanatory context.

## 3. Modularity and cost (slides 8-10)

Dividing a system into modules reduces the difficulty of each part, but increases integration and coordination work. The graph shows falling per-module cost, rising integration cost and a minimum region for total cost.

Therefore, "more modules is always better" is false. Choose boundaries that isolate responsibilities without creating excessive communication.

**Testing/debugging explanation:** a focused module can be checked in isolation; failure can be localized; controlled interfaces reduce unrelated effects. Integration tests remain necessary.

## 4. Independence and design classes (slides 10-13)

Functional independence combines **high cohesion** and **low coupling**:

- Cohesion: a component's responsibilities belong together.
- Coupling: dependence on other components should be limited and explicit.

A design class should be complete and sufficient, with primitive/focused services, high cohesion and low coupling.

Information hiding reduces side effects, limits the reach of local decisions, discourages global data and supports encapsulation. It does not mean hiding required behavior from users or hiding defects from other developers.

The FloorPlan/Segment/Camera design example adds implementation detail to domain concepts. A class diagram can show generalization, aggregation, associations and multiplicities; see the notation supplement.

## 5. Architecture and patterns (slides 14-15)

Architectural properties include structure, extra-functional qualities such as performance/security/reliability, and patterns shared across related systems.

A design-pattern description records name, intent, aliases, motivation, applicability, structure, participants, collaborations, consequences and related patterns.

The **consequences** matter: a pattern addresses tradeoffs in context, not every problem with the same universal solution.

## 6. Design-model principles (slides 16-18)

Trace the design to requirements; consider architecture and data, design interfaces carefully, tune the UI to user needs, keep components independent/loosely coupled, communicate clearly and develop iteratively.

The model has a process dimension (architecture, interfaces, components, deployment) and an abstraction dimension from analysis-level concepts toward implementation detail.

## 7. Data and architecture elements (slides 19-20)

A data model identifies data objects, attributes and relationships independently of processing. Objects can represent external entities, things, events, places, roles, organizational units or structures.

**Study example:** Student and Course have identifiers and attributes; Enrollment relates them and may store status. A data model expresses this information domain before selecting SQL tables or indexes.

Architectural design draws on the application domain, requirements-model elements and available styles/patterns.

## 8. Interface, component and deployment elements (slides 21-25)

- Interface design includes UI, external-system interfaces and internal interfaces. Include error checking and appropriate security.
- Component design specifies local data structures, processing algorithms and exposed operations.
- Deployment design maps functionality/subsystems to the physical environment.

A descriptor deployment diagram shows the environment in general; an instance diagram identifies concrete configurations later in design.

The ControlPanel interface diagram illustrates that a component exposes operations through an interface while concealing internal implementation.

## Exam focus

- Explain abstraction versus refinement and information hiding versus modularity.
- Give the desired relationship: **high cohesion, low coupling**.
- Explain why modularity helps testing but excessive fragmentation increases integration cost.
- Explain data modeling using objects, attributes and relationships.
- Know the major design-model concerns and distinguish them from analysis models.
- Related past questions: 2023 Q5; 2025 Q6.
