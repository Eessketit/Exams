# Week 4.1: Principles that Guide Practice

What this lecture is about: principles connecting communication, planning, modeling, construction, testing and deployment.

Source: `Pressman_SEPA_9e_Ch006_PPT.pptx`, 31 slides. Slides 26-31 are text alternatives for diagrams.

## 1. Process principles (slides 2-3)

- Be agile and ready to adapt the process.
- Focus on quality at every activity's exit condition.
- Build an effective, self-organizing team.
- Establish communication and coordination mechanisms.
- Manage requests for change through assessment, approval and implementation.
- Assess risks and prepare contingency plans.
- Produce artifacts that provide value for other work.

**Study example:** a change request should identify the new requirement, its impact and the decision taken. Simply editing code can leave tests, documentation and stakeholder expectations inconsistent.

## 2. Practice principles (slides 4-6)

| Principle | Meaning |
|---|---|
| Divide and conquer | Separate concerns so a complex problem can be handled in parts |
| Abstraction | Represent essential meaning without irrelevant detail |
| Consistency | Use predictable conventions across the product |
| Information transfer | Design and test interfaces carefully |
| Modularity | Organize responsibilities into manageable components |
| Patterns | Reuse knowledge of recurring problems and solutions |
| Multiple viewpoints | Examine information, function and behavior |
| Artifact consumers | Design for future developers and maintainers too |

Modularity does not eliminate integration work. See [Design concepts](10_Week6_DesignConcepts.md#3-modularity-and-cost-slides-8-10).

## 3. Communication (slides 7-9)

Listen before preparing a response. Understand the problem before a meeting. Appoint a facilitator, use rich/face-to-face communication when useful, and record important decisions.

Collaborate, keep discussion focused, use drawings to clarify uncertainty, and negotiate for mutual benefit. If a topic cannot be resolved immediately, record it and move on rather than derailing the whole meeting.

The effectiveness diagram orders paper, text, email, telephone, videoconference and face-to-face communication by increasing richness/effectiveness. It is an illustration; the best channel also depends on task and context.

**Exam mechanism:** unclear communication produces different assumptions. Those assumptions produce inconsistent implementations, integration defects and rework. Recording an agreed interface or requirement prevents the same confusion recurring.

## 4. Planning (slides 10-12)

Understand scope, involve the customer, recognize planning as iterative, estimate using current knowledge, consider risk, adjust granularity, define quality work, manage change and track the plan frequently.

The printed list skips principle #6. Do not invent a missing principle and present it as source text.

The iterative-planning picture starts with scope/risk analysis, identifies the most serious risks, plans/develops, assesses outcomes and revises risk and project plans as needed.

Contingencies should explain what happens if a risk materializes. A vague statement that "risks will be managed" is not a useful plan.

## 5. Agile modeling (slides 13-15)

Build software as the objective, not models for their own sake. Travel light, choose the simplest useful representation, make it changeable and give each model an explicit purpose.

Adapt models to the system, favor useful over perfect models, avoid arguing about notation at the expense of meaning, and obtain feedback early.

For an exam diagram, use the requested notation clearly: the principle of useful modeling does not excuse confusing actors, states and actions.

## 6. Construction and coding (slides 16-18)

Before coding: understand the problem/design, choose a suitable language and environment, and prepare unit tests.

During coding: use structured algorithms, consider pairing, choose appropriate data structures, and preserve architectural/interface consistency.

After coding: perform walkthroughs where useful, execute unit tests, fix uncovered errors and refactor for quality.

Refactoring should preserve behavior. A feature change may accompany refactoring, but it is a different purpose and needs its own validation.

## 7. Testing (slides 19-21)

Tests should trace to requirements and be planned early. A useful test has a good chance of uncovering a previously unknown defect.

- Start with small units and progress toward the integrated system.
- Exhaustive testing is not possible for realistic systems.
- Allocate effort according to expected fault density and risk.
- Use static checks/reviews as well as execution.
- Track defects and look for recurring patterns.
- Include tests demonstrating correct expected behavior too.

The Pareto principle on the slide suggests defects often cluster; it is not a guarantee that every product has exactly 80% of its faults in 20% of its modules.

## 8. Deployment (slides 22-23)

Manage customer expectations, assemble and test the delivery package, establish support before delivery, provide instructions and correct serious defects before shipping.

Deployment therefore includes making the product usable and supportable, not only copying a binary to a server.

## Exam focus

- Explain how communication and planning reduce rework and uncertainty.
- Explain why modularity improves local reasoning, testing and debugging.
- Explain how reviews, tests and controlled changes improve reliability without guaranteeing zero defects.
- For technical uncertainty, describe risk assessment, investigation/prototyping, contingency and tracking.
- Related past questions: 2025 Q1, Q6, Q8-Q10.
