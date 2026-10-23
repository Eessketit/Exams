# Week 4.2: Understanding Requirements

What this lecture is about: the seven requirements-engineering tasks, stakeholders, nonfunctional requirements, elicitation, use cases, negotiation, monitoring and validation.

Source: `Pressman_SEPA_9e_Ch007_PPT.pptx`, 22 slides. Slides 20-22 explain the UML examples.

## 1. Seven requirements engineering tasks (slides 2-3)

| Task | Purpose |
|---|---|
| Inception | Understand the problem, stakeholders and desired solution |
| Elicitation | Gather requirements and business goals from stakeholders |
| Elaboration | Refine information, function and behavior into a model |
| Negotiation | Agree a realistic scope and resolve competing needs |
| Specification | Record requirements using suitable representations |
| Validation | Check requirements artifacts for quality and consistency |
| Requirements management | Trace requirements and control their changes |

Specification may use documents, diagrams, mathematical models, scenarios or prototypes. It does not necessarily mean one large prose document.

**Trap:** requirements engineering is broader than elicitation. An interview gathers information; validation and management do different work afterward and throughout the project.

## 2. Functional and nonfunctional requirements (slide 4)

A functional requirement describes required behavior or a service. A nonfunctional requirement specifies a quality, performance/security attribute or general constraint.

| Study requirement | Classification | Reason |
|---|---|---|
| Let an employee submit a leave request | Functional | Describes an operation |
| Let a manager approve or reject it | Functional | Describes an operation |
| Complete critical requests within 2 seconds at peak load | Nonfunctional | Constrains performance |
| Support encrypted transmission and role-based access | Security requirement/constraint | Constrains protection and access |

Security can also imply functional operations such as checking authorization. Classify the requirement at the level expressed and explain the distinction instead of claiming that every security-related sentence has only one possible representation.

NFRs can be complementary, overlapping, conflicting or independent. The lecture uses a matrix of NFRs and engineering guidelines, followed by prioritization and decisions about compatibility.

## 3. Stakeholders and collaborative elicitation (slides 5-7)

Ask who requests the work, who uses it, which benefits are expected, and whether another solution exists. Ask each stakeholder who else should be consulted.

Recognize different viewpoints and work toward collaboration. A facilitated elicitation meeting uses participation rules, an agenda and a recording mechanism such as worksheets or a shared board.

Elicitation products include:

- Need and feasibility statement.
- Bounded scope.
- Participating stakeholders.
- Technical environment.
- Requirements and domain constraints.
- Usage scenarios in stakeholder language.

Missing a stakeholder can mean missing a whole workflow. For example, a booking interface designed only with passengers may overlook an administrator's cancellation responsibilities.

## 4. Use cases and analysis models (slides 8-12)

A use case describes a thread of system use from an actor's viewpoint. Ask:

- Who is primary and who is secondary?
- What goal is being achieved?
- Which preconditions hold?
- What tasks, information exchanges, alternatives and exceptions occur?
- What information is created, changed or obtained?
- Which unexpected changes should be reported?

The analysis model covers information, function and behavior. Slide 9 discusses scenario-based, class-based and behavioral elements, illustrated by use case, class and state diagrams on slides 10-12.

Do not confuse these **three example groups** with the five model types listed in Ch08 or the seven RE tasks.

## 5. Analysis patterns (slide 13)

An analysis pattern packages reusable problem knowledge. Its template includes name, intent, motivation, forces/context, solution, consequences, design guidance, known uses and related patterns.

An analysis pattern describes a recurring analysis problem and solution structure; a design pattern is oriented toward a recurring design solution. They can be related but are not the same artifact.

## 6. Negotiation and monitoring (slides 14-15)

Negotiation aims for a realistic win-win: stakeholders obtain a useful product while developers accept achievable commitments. Developers propose solutions and impacts; customers review gaps and clarify needs.

Monitoring during evolution includes distributed debugging, run-time verification, run-time validation, business-activity monitoring and feedback for evolution/codesign.

- Verification asks whether implementation agrees with its specification.
- Validation asks whether the evolving product meets user goals.

These explanations follow the slide's monitoring context.

## 7. Requirements validation checklist (slides 16-17)

Check necessity, consistency with objectives, appropriate abstraction, bounded and unambiguous wording, identifiable source, absence of contradictions, technical feasibility and testability.

Also check whether models cover information/function/behavior, expose detail progressively and use validated patterns appropriately.

**Study example:** "the system must be fast" lacks a testable bound. "95% of search requests finish within 2 seconds under the agreed workload" is more testable, but the numerical criterion must be agreed, not silently invented.

## Exam focus

- Know all seven RE tasks and explain why analysis prevents building the wrong solution.
- Extract FR/NFR from a case and preserve the exact conditions attached to numerical limits.
- Describe actor goals and preconditions rather than implementation details.
- State what makes a requirement clear, necessary, feasible and verifiable.
- Related past questions: 2023 Q3; 2024 Q5; the case study in all three years.
