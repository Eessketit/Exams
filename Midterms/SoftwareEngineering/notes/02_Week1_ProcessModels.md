# Week 1.2: Process Models

What this lecture is about: generic process structure, process flows, task sets, assessment, and choosing among waterfall, prototyping, spiral and unified process.

Source: `Pressman_SEPA_9e_Ch002_PPT.pptx`, 19 slides. Slides 14-19 are text alternatives for earlier diagrams. Framework activities are introduced in [Week 1.1](01_Week1_Software_SoftwareEngineering.md#5-framework-and-umbrella-activities-slides-9-11).

## 1. Generic process and task sets (slides 2, 4, 14)

A software process contains a framework. Framework activities contain engineering actions; actions are implemented using task sets.

A task set identifies:

- Tasks to accomplish.
- Work products to produce.
- Quality assurance filters/checkpoints.

The diagram also places milestones in the task-set context.

**Study example:** a requirements-review action might require preparing a draft, checking ambiguity, reviewing it with users, recording decisions, and approving a revised requirement set. The task set makes the work concrete.

## 2. Four process flows (slides 3, 15)

| Flow | Main idea | What to remember |
|---|---|---|
| Linear | Activities primarily follow one another | Communication to deployment |
| Iterative | Earlier work is revisited | Feedback can revise analysis or design |
| Evolutionary | Repeated cycles produce increasingly complete increments | Deployment feeds another cycle |
| Parallel | Activities overlap or proceed concurrently | Coordination and dependencies still matter |

Iteration and increment are related but distinct: an iteration revisits work; an increment adds delivered capability. This distinction is explanatory context.

## 3. Assessment and prescription (slides 5-6, 11)

Having a documented process does not guarantee on-time delivery, customer satisfaction or long-term quality. Assess the process against meaningful criteria using measures and analytics.

Prescriptive models provide structure. The design question is how much structure fits a project whose requirements may change. Removing structure entirely can damage coordination; too much rigid structure can inhibit adaptation.

## 4. Waterfall (slides 7, 16)

Order shown on the slide:

**Communication → Planning → Modeling → Construction → Deployment.**

| Activity | Work shown in the diagram |
|---|---|
| Communication | Project initiation and requirements gathering |
| Planning | Estimating, scheduling, tracking |
| Modeling | Analysis and design |
| Construction | Code and test |
| Deployment | Delivery, support and feedback |

Advantages: easy to understand and plan; suitable for well-understood small projects; straightforward organization of analysis and testing.

Disadvantages: change is difficult, testing occurs late, and customer approval comes at the end.

**Exam comparison:** if requirements are stable and understood, the sequential structure helps planning. If users discover needs through feedback, late clarification causes rework in earlier stages. Do not say waterfall makes change logically impossible; the point is its cost and poor accommodation of change.

## 5. Prototyping (slides 8, 17)

Cycle: communication → quick plan → quick design/modeling → construct prototype → delivery and feedback → repeat.

Advantages:

- Early and frequent customer involvement.
- Lower impact of requirement changes.
- Lower chance of building a rejected product.
- Works well for small projects in the slide's comparison.

Risks:

- Feedback can delay work.
- Stakeholders may mistake a prototype for a finished product.
- Throwaway prototypes represent work that is not retained.
- Planning and management can be difficult.

A prototype is built to learn or validate something. Its apparent functionality alone does not establish production readiness.

## 6. Spiral (slides 9, 18)

The diagram repeats communication, planning, modeling, construction and deployment around an expanding spiral. Planning explicitly includes estimation, scheduling and **risk analysis**.

Advantages: continuous customer involvement, explicit risk management, suitability for large/complex projects and extensible products.

Risks: poor risk analysis can undermine the project; management is demanding; the approach needs an experienced team.

**What makes it special?** Repeated development cycles are guided by risk assessment and stakeholder feedback. Merely saying "it repeats" does not distinguish it well from other iterative models.

See the recommended hybrid in [Week 3.2](06_Week3_RecommendedProcess.md).

## 7. Unified Process (slides 10, 19)

The diagram groups overlapping engineering activities into:

1. **Inception:** establish the initial vision and scope.
2. **Elaboration:** refine understanding and architectural direction.
3. **Construction:** build the product.
4. **Transition:** deliver it for use.
5. **Production:** the released product operates and evolves.

The short phase explanations are study context; the names and overlap are in the diagram.

Advantages: documentation, customer involvement, support for requirements change and maintenance work.

Disadvantages: use cases may be imprecise; integrating increments is tricky; overlapping phases can complicate coordination; experience is needed.

## 8. Choosing a model (slides 6-11)

| Situation | Reasonable discussion |
|---|---|
| Small project with stable, well-understood requirements | Waterfall may be sufficient |
| Users need to explore an uncertain interface | Prototyping can expose misunderstandings early |
| Large project with serious technical uncertainty | Explain spiral's explicit risk management |
| Need an iterative, documented, use-case-oriented approach | Discuss Unified Process |

These are study scenarios inferred from the comparison, not universal selection rules.

## Exam focus

- Draw the five waterfall activities and explain when they fit.
- Explain **why changing requirements cause expensive rework** in waterfall.
- Explain spiral using **risk + repeated cycles + feedback**.
- Contrast a prototype with a complete production product.
- Know the four process flows and the Unified Process phase names.
- Related past questions: 2023 Q1; 2024 Q2; 2025 Q2 and Q4.
