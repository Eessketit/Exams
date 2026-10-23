# Week 7.1: Component-Level Design

What this lecture is about: specifying component internals/interfaces, principles for independent components, reuse and component-based engineering risks.

Source: `Pressman_SEPA_9e_Ch011_PPT.pptx`, 32 slides. Slides 26-32 explain earlier diagrams.

## 1. Three views of a component (slides 2-4)

A component is a modular, deployable, replaceable part with encapsulated implementation and exposed interfaces.

| View | Component contains or emphasizes |
|---|---|
| Object-oriented | Collaborating classes |
| Traditional | Processing logic, local data structures and an invocation/data interface |
| Process-related | Reusable components/patterns selected to assemble systems |

The PrintJob example refines an analysis class into an implementable design class and component interfaces. The traditional example decomposes job management into smaller processing functions.

## 2. Component principles (slide 5)

| Principle | Meaning |
|---|---|
| OCP | Extend behavior while minimizing modification of existing stable code |
| LSP | Subtypes should be usable where their base type is expected |
| DIP | Depend on abstractions rather than concrete implementations |
| ISP | Prefer client-specific interfaces over one oversized general interface |
| REP | Reuse and release boundaries should align |
| CCP | Classes that change together belong together |
| CRP | Avoid grouping classes that are not reused together |

This is the slide's list. It includes four familiar SOLID principles but does not separately list SRP; do not claim it is a verbatim complete SOLID list.

**Study example:** a RegistrationService depending on a Payment interface can use a test double without changing registration logic. This illustrates DIP and testability.

## 3. Guidelines, cohesion and coupling (slides 6-8)

Use consistent names and clear interfaces. For readable diagrams, the lecture suggests dependencies left-to-right and inheritance from derived classes below toward bases above.

Cohesion means a component's responsibilities fit together. Levels discussed:

- Functional: one focused computation.
- Layer: a higher layer uses lower-layer services.
- Communicational: operations on the same data are grouped.

Coupling measures interdependence. Examples discussed:

- Content: reaching into/modifying another component's internals.
- Control: passing flags that direct alternate behavior.
- External: dependence on infrastructure or external components.

Aim for focused responsibilities and explicit limited dependencies. The lecture gives examples, not a complete taxonomy of every cohesion/coupling level.

## 4. Design steps (slides 9-14)

1. Identify problem-domain design classes.
2. Identify infrastructure classes.
3. Elaborate classes not acquired as reusable components:
   - Specify collaboration messages.
   - Define interfaces.
   - Refine attributes, data types and structures.
   - Describe operation processing.
4. Describe persistent sources and their managing classes.
5. Elaborate behavioral representations.
6. Add deployment details.
7. Refactor and consider alternatives.

The examples use ProductionJob, WorkOrder, JobQueue and PrintJob. Activity diagrams expose decision-dependent cost calculations; state models expose job-building/submission behavior.

## 5. Web and mobile components (slides 15-18)

A WebApp component may be a cohesive function operating on content or a package of content/functionality delivering a user capability.

- Content design groups content objects for presentation/manipulation: floor plan, video thumbnails, streaming window.
- Functional design implements dynamic content/navigation, computations, database access and integration.
- A thin mobile client primarily carries the interface, with business/data work in services.
- A rich client implements interface, business and data layers on the device, subject to its limitations.

**Do not confuse stages:** content **design** concerns organization/implementation. The earlier requirements content **analysis** identifies what content is needed. The textbook supplement addresses the latter.

## 6. Traditional design and CBSE (slides 19-20)

Traditional processing follows algorithm/structured-programming principles; local data follows the data model; interfaces follow required collaborations.

Before building a component, ask whether COTS or internal reusable alternatives exist and whether their interfaces fit the architecture.

CBSE can involve revising requirements in light of available components, but such revisions need stakeholder agreement rather than silently dropping needs.

## 7. Benefits, risks and refactoring (slides 21-23)

Benefits: reduced lead time, potential ROI, development cost spread across reuse, quality from repeated use/testing and replaceable obsolete components.

Risks:

| Risk | Example concern |
|---|---|
| Selection | Black-box behavior does not match needs |
| Integration | Interface incompatibility requires wrappers |
| Quality | Hidden assumptions weaken reliability/performance |
| Security | Untested component combinations expose vulnerabilities |
| Evolution | Updates introduce incompatible behavior |

Refactoring can reduce technical debt, but it costs time and carries risk. Use change history and quality evidence to select worthwhile improvements, and document changes.

## Exam focus

- Define a component and distinguish the three views.
- Explain OCP/LSP/DIP/ISP with small examples.
- Relate cohesion/coupling to isolated testing and reduced side effects.
- Explain both benefits and risks of reuse.
- Distinguish WebApp content requirements from content design.
- Related past question: 2025 Q6. WebApp design is useful supporting context for 2023 Q6 and 2024 Q3, but is not a substitute for their analysis topic.
