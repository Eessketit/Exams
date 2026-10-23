# Week 2.1: Project Management Concepts

What this lecture is about: people, product, process and project; leadership, team structure, communication, scope and conditions for successful projects.

Source: `Pressman_SEPA_9e_Ch024_PPT.pptx`, 20 slides. Slide 20 explains the diagram on slide 13.

## 1. The four Ps (slide 2)

| P | Meaning | Management question |
|---|---|---|
| People | Stakeholders and the team | Who has the skills and responsibility? |
| Product | Software to be built | What problem and scope are we addressing? |
| Process | Framework activities and engineering tasks | How will the team work? |
| Project | Work required to make the product real | How will resources and progress be managed? |

The slides call people the most important element of success. The questions above are explanatory study prompts.

## 2. Stakeholders (slide 3)

- **Senior managers:** define business issues that influence the project.
- **Project/technical managers:** plan, motivate, organize and control work.
- **Practitioners:** supply technical skills and build the product.
- **Customers:** specify requirements and have product interests.
- **End users:** interact with the released product.

Customer and end user can be different people. A university administrator may buy a registration system while students and teachers use it.

## 3. Leadership and motivation (slide 4)

The five practices on the slide:

1. **Model the way:** demonstrate the behavior and commitment expected of the team.
2. **Inspire a shared vision:** connect personal aspirations to a common goal.
3. **Challenge the process:** encourage experiments and learning through manageable successes and failures.
4. **Enable others to act:** share decisions and goal setting; develop competence.
5. **Encourage the heart:** recognize contributions and celebrate shared progress.

**Short-answer pattern:** name a practice, explain the mechanism, then give a small example. "Give developers ownership of a feature and acknowledge its successful delivery" explains motivation more concretely than "be a good leader."

## 4. Choosing a team structure (slide 5)

Consider seven factors:

- Difficulty of the problem.
- Product size, measured for example in LOC or function points.
- Team lifetime.
- Degree of modularization possible.
- Required quality and reliability.
- Rigidity of the delivery date.
- Communication and sociability required.

**Study scenario:** a safety-critical system with tightly connected components requires strong coordination and reliability expertise. A set of independent tools might permit more independent subteams. Team size alone is not enough to choose a structure.

## 5. Team toxicity and agile teams (slides 6-7)

Toxicity sources include a frenzied atmosphere, persistent frustration, fragmented procedures, unclear roles and repeated failure. Their effects include wasted effort, conflict, blame and falling confidence.

Agile teams need trust, skills matched to the problem, cohesion, self-organization and adaptability. They choose an approach within business requirements and organizational standards.

The slide's "planning kept to a minimum" should be read as avoiding unnecessary planning overhead; it is not permission to abandon coordination or estimates.

## 6. Coordination and communication (slides 8-9)

Three pressures make coordination difficult:

| Pressure | Consequence |
|---|---|
| Scale | Complexity and confusion increase |
| Uncertainty | Changes continuously affect the team |
| Interoperability | The product must fit existing systems and constraints |

Formal channels include written records, structured meetings and documented decisions. Informal channels allow quick questions, shared ideas and day-to-day help.

Use both: an informal conversation may resolve a problem quickly, while recording its decision prevents other team members working from an outdated assumption.

Related communication practices: [Week 4.1](07_Week4_PracticePrinciples.md#3-communication-slides-7-9).

## 7. Scope and problem decomposition (slides 10-11)

Scope must be understandable to management and technical stakeholders.

- **Context:** where the software fits and which constraints follow.
- **Information objectives:** visible outputs and required inputs.
- **Function and performance:** transformations and performance requirements.

Decompose scope into functions, visible data objects or problem classes, then refine until the work can be understood and estimated.

Do not equate decomposition with immediately selecting a database or programming language. Analysis can describe the problem before committing to implementation choices.

## 8. Process selection and product-process mapping (slides 12-13, 20)

Choose a process appropriate to the customers, team, product and project environment. A preliminary project plan then guides process decomposition.

The product-process matrix puts product functions on one axis and framework activities on the other. It reminds the planner that each feature may need communication, planning, modeling, construction and deployment work.

## 9. Successful projects and critical practices (slides 14-17)

Success characteristics include understood requirements, active users, leadership, a shared plan, skilled and engaged people, compatible collaboration, realistic monitored estimates, satisfied needs and a working product with the intended scope and quality.

**W5HH:** Why? What? When? Who? Where? How? How much?

Critical practices: formal risk management, empirical cost/schedule estimation, metrics-based management, earned-value tracking, defect tracking against quality targets and attention to people.

## Exam focus

- Reproduce the **four Ps** and distinguish customers from end users.
- Explain motivation through the five leadership practices.
- List team-selection factors, connecting each to the project context.
- Explain how poor communication causes inconsistent assumptions, rework and delay.
- Name concrete causes of project problems, not just "bad management."
- Related past questions: 2023 Q4; 2024 Q4; 2025 Q5 and Q8.
