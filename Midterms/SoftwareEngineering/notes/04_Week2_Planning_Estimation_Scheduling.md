# Week 2.2: Planning, Estimation and Scheduling

What this lecture is about: establishing feasible scope, estimating resources/cost/effort, constructing a schedule and tracking progress.

Source: `Pressman_SEPA_9e_Ch025_PPT.pptx`, 37 slides. Slides 33-37 provide diagram descriptions. Formula images on slides 15 and 24 and the tables were inspected visually.

## 1. Planning starts with uncertainty (slides 2-6)

Estimation requires experience, historical metrics and willingness to make quantitative predictions despite uncertainty. Complexity, size and unstable requirements increase estimation risk.

Planning task set:

1. Establish scope.
2. Determine feasibility.
3. Analyze risks.
4. Identify human, reusable-software and environmental resources.
5. Estimate cost/effort using decomposition and at least two approaches; reconcile them.
6. Develop the initial schedule, dependencies and tracking mechanisms.
7. Repeat/refine the plan for each prototype as its scope becomes known.

Scope covers functions/features, inputs/outputs, presented content, performance, constraints, interfaces and reliability. It can be expressed as a stakeholder-agreed narrative or use cases.

**Feasibility:** can the scope be delivered with available technology, money, time and other resources, and does a business need exist? Technically possible does not necessarily mean useful or affordable.

## 2. Resources and estimation accuracy (slides 7-11, 33)

Resource groups: people (number, skills, location), environment (tools, hardware, networks) and reusable software (COTS, experienced components, partly experienced components, new components).

Estimation approaches include analogy with similar projects, decomposition and empirical cost models. Waiting until completion would reveal actual effort but would not support an initial commitment.

Reconcile independent estimates. Large disagreement can signal misunderstood scope or inappropriate historical productivity data.

For problem-based estimation:

- Decompose scope into functions.
- Estimate size for each function, e.g. LOC or FP.
- Apply productivity from comparable projects.
- Calculate effort and cost per function and add them.
- Include infrastructure work, not just user-visible features.

## 3. LOC estimation and units (slides 12-13)

$$\text{effort} = \frac{\text{estimated LOC}}{\text{LOC per person-month}}$$

$$\text{cost} = \text{effort}\times\text{cost per person-month}$$

The slide table totals 33,200 LOC. At 620 LOC/person-month:

- Effort = 33,200 / 620 = **53.55 person-months**, rounded to 54.
- At $8,000/person-month, direct multiplication gives **$428,387** approximately.
- The slide also rounds unit cost to about $13/LOC and reports about **$431,000**.

These are slightly different results because of intermediate rounding. State the method and round at the end when doing a new exercise.

**Trap:** 54 person-months is effort, not a guaranteed 54-month calendar duration. Dividing by the headcount is only a crude scheduling approximation; dependencies and communication overhead matter.

## 4. Function points (slides 14-15)

Weighted counts shown: external inputs 96, outputs 70, enquiries 100, internal logical files 40 and external interface files 14. Total = **320**.

$$FP=\text{count total}\,[0.65+0.01\sum F_i]$$

For the slide's sum of 14 factors, $\sum F_i=52$:

- Adjustment = 0.65 + 0.52 = **1.17**.
- FP = 320 × 1.17 = **374.4**, shown approximately as 375.
- With $1,230/FP, using 374.4 gives **$460,512**, about $461,000.
- At $8,000/person-month, this is about **57.56**, rounded to 58 person-months.

Do not confuse the **count total** with the adjusted FP estimate.

## 5. Process-based estimation (slides 16-17, 34)

Put functions in rows and activities/tasks in columns. Each cell estimates effort for performing that activity on that function. Sum the effort, then apply the appropriate labor rate.

The slide's process table totals **46 person-months**. At $8,000/month, cost is **$368,000**.

This estimate differs from the LOC and FP estimates. Reconciliation is part of planning; multiple estimates are not necessarily supposed to be identical.

## 6. Use case points (slides 18-20)

$$UCP=(UUCW+UAW)\times TCF\times ECF$$

| Term | Meaning |
|---|---|
| UUCW | Unadjusted use case weights |
| UAW | Unadjusted actor weights |
| TCF | Technical complexity factor, based on 13 factors |
| ECF | Environmental complexity factor, based on 8 factors |

The slide's formula uses 16 complex cases ×15, 14 average ×10, 8 simple ×5 and another 10 simple ×5:

- UUCW = 240 + 140 + 40 + 50 = **470**.
- UAW = 8×1 + 12×2 + 4×3 = **44**.
- UCP = 514 × 1.04 × 0.96 = **513.1776**, approximately 513.
- At 85 LOC/UCP, size ≈ **43,620 LOC**, approximately 43,600.

**Source omission:** slide 19's introductory prose does not mention the 16 complex use cases that appear in its formula. Do not infer that they came from the 14 average cases.

**Source inconsistency:** slide 20 reports $552,000. Its stated rounded size of 43,600 LOC, productivity of 620 LOC/person-month and rate of $8,000/person-month instead give about **$562,581**. This difference is not explained by simply rounding 513.1776 UCP to 513. Preserve the source figure when discussing the slide, but use a consistent equation and stated inputs for a fresh calculation.

## 7. Agile estimation and late projects (slides 21-22)

Estimate each story, decompose it into tasks, estimate the tasks (history, model, experience or planning poker), then sum for the story and increment. Alternatively, estimate story volume and translate it to effort using historical data.

Reasons for lateness: externally imposed unrealistic deadline; changed requirements without schedule revision; underestimated effort/resources; unconsidered risks; technical/human difficulties; miscommunication; failure to detect and correct slippage.

## 8. Scheduling and tracking (slides 23-30)

Scheduling principles: compartmentalization, interdependency, time allocation, effort validation, assigned responsibilities, defined outcomes and milestones.

The delivery-date graph warns that compressing a schedule can require disproportionately greater effort and eventually becomes infeasible. Its illustrative boundary is $T_{min}=0.75T_d$; this is the lecture's model, not a universal deadline rule.

The concept-development task set covers scoping, preliminary planning, technology risk assessment, proof of concept, concept implementation and customer reaction. Task refinement decomposes a task into smaller tasks and review points.

- **Task network:** dependency and parallelism.
- **Gantt chart:** task timing on a calendar.
- **Tracking table:** planned/actual start and completion, assignee, effort and notes.
- Track using status meetings, reviews, milestone completion, actual versus planned dates, informal discussion and project velocity.

## Exam focus

- Explain **why estimates are needed before committing resources**.
- Distinguish scope, feasibility, size, effort, duration and cost.
- Be able to explain LOC, FP, process-based and UCP estimation.
- Know the formulas and why intermediate rounding changes an example's answer.
- Describe risk identification, contingency planning, proof of concept and monitoring as preparation for technical problems.
- Related past questions: 2023 Q4; 2025 Q9-Q10.
