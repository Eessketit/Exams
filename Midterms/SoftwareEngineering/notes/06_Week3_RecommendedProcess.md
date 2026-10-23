# Week 3.2: A Recommended Process Model

What this lecture is about: tailoring a process to the project and combining incremental prototypes, architecture, stakeholder evaluation, estimation and risk decisions.

Source: `Pressman_SEPA_9e_Ch004_PPT.pptx`, 32 slides. Slides 28-32 describe the diagrams.

## 1. Tailoring and organization (slides 2-3)

Every project needs a roadmap, but no single framework suits every team, product and user community. Adapt a generic process using the project's constraints and best practices.

The organizing principles discourage linear work without feedback and excessive up-front specification that delays construction. They favor evolving documents, appropriate management, frequent stakeholder participation and testers involved before coding.

These principles do not say "never analyze requirements". They argue for timely analysis and feedback rather than pretending the entire product is perfectly knowable at the start.

## 2. Incremental and spiral prototypes (slides 4-7, 28-29)

The incremental diagram cycles through planning, requirements, analysis/design, implementation, testing and evaluation. Implementation can also lead to deployment.

The spiral prototype diagram revisits objectives, risks, development/testing and planning for the next iteration as prototypes grow.

| Agile characteristics in the deck | Spiral characteristics in the deck |
|---|---|
| Minimal rules and documentation | More up-front steps and documentation |
| Early partial solutions | Repeated risk-oriented prototypes |
| Informal risk management | Explicit risk assessment and coordination |
| Easy adaptation through stakeholder feedback | Formal project management; project end may be less obvious |

The suitability statements are the lecture's comparison, not universal prohibitions on using agile practices in high-risk organizations.

## 3. Agile requirements and architecture (slides 8-11)

Requirements practices:

- Encourage participation according to stakeholder availability.
- Use accessible models, sketches and stories.
- Explain representation methods before expecting stakeholders to read them.
- Use stakeholder terminology.
- Establish the big picture breadth-first, then refine details just in time.
- Keep a prioritized feature list and implement important stories first.
- Retain documents that help future work; avoid unused artifacts.

Architectural work identifies objectives and key scenarios, outlines the application, identifies issues and evaluates candidate solutions. Prototypes need both visible functions and supporting infrastructure.

Quality attributes should shape prototypes from the beginning. Synchronize functional and architectural dependencies so later increments remain feasible.

## 4. Estimates and the first prototype (slides 12-14)

Use historical data to estimate story effort; group stories into sprints and estimate project duration. Revise estimates when requirements change or prototypes are accepted.

First-prototype guidance: move from paper models to software, prototype the interface, implement input/output and algorithms, test, and consider deployment.

During evaluation, give users useful scaffolding, recruit relevant users, ask appropriate questions, stay neutral and accept new ideas. A demonstration designed only to obtain praise does not reveal usability problems.

## 5. Go or no-go (slide 15)

After evaluation:

1. Assess the current prototype's quality.
2. Revise time and cost estimates.
3. Assess budget, schedule and unmet-expectation risks.
4. Discuss risks with stakeholders/management.
5. Obtain a resource commitment to continue, or end the project.

Risk management is therefore part of the decision to evolve, not merely a list written at project initiation.

## 6. Recommended end-to-end sequence (slides 16-20, 31)

Project conception → requirements engineering → preliminary architecture → resource estimates → first prototype → evaluation → go/no-go.

If continuing: refine scope → construct the next prototype → evaluate again. A prototype may become a release; maintenance can lead to another evolution cycle.

| Stage | Main output or concern |
|---|---|
| Requirements | Stories and acceptance criteria |
| Preliminary architecture | Models and documented decisions |
| Resources | Estimates and sprint grouping |
| Construction | Selected important stories implemented |
| Evaluation | Tests and stakeholder feedback |
| Decision | Continued commitment and revised risk assessment |
| Release | Accepted increment and recorded defects |
| Maintenance | Understood, tested and documented changes |

## 7. Testing and release candidates (slides 21-23)

Design tests while designing the prototype. Acceptance criteria guide test cases; test defects and performance as well as the main flow.

**Regression testing** checks that adding features has not broken previously working behavior. **User acceptance testing** checks stakeholder acceptance criteria, not merely that code runs.

If a release candidate changes after feedback, verify those changes with another acceptance round. Record unresolved issues and lessons learned for later development and better estimation.

## 8. Maintenance categories (slides 24-25, 32)

| Category | Intent | Study example |
|---|---|---|
| Corrective | Repair discovered problems | Fix incorrect tax calculation |
| Adaptive | Keep working in a changed environment | Support a new OS/API |
| Perfective | Improve features, structure or documentation | Add a useful reporting feature |
| Preventive | Remove faults before users encounter them | Eliminate a known latent failure condition |

The diagram's effort distribution is perfective 50%, adaptive 25%, corrective 21%, preventive 4%. Treat these as the illustration's figures, not a forecast for every product.

## Exam focus

- Explain why stepwise development allows early value and feedback while limiting the scope of each change.
- Distinguish risk evaluation from testing: each informs the other, but they answer different questions.
- Explain architectural preparation within an adaptive process.
- Know acceptance versus regression testing and the four maintenance categories.
- Related past questions: 2023 Q1-Q2; 2025 Q3-Q4 and Q10.
