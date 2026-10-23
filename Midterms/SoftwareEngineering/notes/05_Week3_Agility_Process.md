# Week 3.1: Agility and Process

What this lecture is about: responding to change through feedback and incremental delivery, then the distinct practices of Scrum, XP, Kanban and DevOps.

Source: `Pressman_SEPA_9e_Ch003_PPT.pptx`, 21 slides. Slides 17-21 explain diagram content. The framework descriptions below follow this course deck; they are not a claim to reproduce current official framework guides.

## 1. Agility and the cost of change (slides 2-4, 17)

Agility combines rapid/adaptive response to change, effective communication, customer participation, team control over work and rapid incremental delivery.

An agile process:

- Starts from customer scenarios.
- Receives and acts on frequent feedback.
- Recognizes that plans have a limited lifetime.
- Develops iteratively with substantial construction work.
- Delivers working increments/prototypes.
- Adapts to project and technical changes.

The cost-of-change diagram compares a sharply rising conventional curve with flatter agile curves. The point is to limit expensive late discoveries; it does not mean a change costs nothing.

**Study example:** an early booking prototype reveals that users need refundable tickets. Discovering this before completing all booking and payment logic prevents extensive later rework.

## 2. Agile principles (slides 5-6)

Value and customer satisfaction come from early working software. Changes are expected. Increments should arrive frequently enough for feedback to influence work.

Motivated individuals, rich communication, technical excellence, simple design and avoiding unnecessary work support delivery. Sustainable pace prevents short bursts that exhaust the team. Self-organization is paired with reflection and continuous improvement.

**Important distinctions:**

- Agile does not mean "no plan"; plans are revised.
- Agile does not mean "no design"; design evolves with the product.
- A release's value is judged through working behavior and feedback, not just artifact volume.

## 3. Scrum (slides 7-8, 18)

| Element | Role |
|---|---|
| Product backlog | Prioritized desired features/work |
| Backlog refinement | Developers and stakeholders clarify upcoming work |
| Sprint planning | Select and plan the next sprint |
| Sprint backlog | Work assigned to the sprint |
| Daily scrum | Short synchronization, maximum 15 minutes on the slide |
| Sprint review | Demonstrate the increment and obtain stakeholder feedback |
| Retrospective | Inspect how the team worked and identify improvements |

The slide illustration uses a 30-day cycle; use that as the diagram's example rather than treating every sprint as exactly 30 days.

Pros: product-owner priorities, team ownership, lightweight documents and frequent updates. Cons listed: controlling change cost, large-team suitability and dependence on expert members.

**Review versus retrospective:** review concerns the product/increment with stakeholders; retrospective concerns the team's process and improvement.

## 4. Extreme Programming (slides 9-10, 19)

| Activity | Practices in the deck |
|---|---|
| Planning | User stories, cost estimates, increments, delivery commitment, velocity |
| Design | Simple design, CRC cards, spike/prototype solutions, refactoring |
| Coding | Unit tests before code, pair programming |
| Testing | Frequent unit tests and customer-defined acceptance tests |

The framework connects these activities through short feedback loops and continuous integration.

Pros include customer involvement, rational planning, commitment and lower product-rejection risk. The deck warns about excessive changes, meeting overhead/cost and dependence on skilled members.

CRC is explained in [Week 5](09_Week5_RequirementsModeling.md#5-crc-modeling-slides-20-22).

## 5. Kanban (slides 11-12, 20)

Core practices:

1. Visualize workflow.
2. Limit work in progress.
3. Manage flow and reduce waste.
4. Make policies, including "done", explicit.
5. Establish feedback loops for improvement.
6. Improve collaboratively with stakeholders.

The board example has backlog, selected, analysis, development, testing and done. An expedite lane can be introduced.

**Study example:** limiting development to two active tasks reveals that testing is blocked instead of hiding ten half-finished features. WIP limits regulate flow; they do not mean an arbitrary limit on total project requirements.

Pros include early delivery and continuous improvement. Collaboration skill, business analysis, focus and willingness to use measurement remain important.

## 6. DevOps (slides 13-14, 21)

The diagram links plan, code, build, test, deploy, operate and monitor into a feedback loop.

- Continuous development: work delivered in successive increments.
- Continuous testing: automated checks before integration.
- Continuous integration: integrate new functionality with the existing code.
- Continuous deployment: deploy integrated code into production.
- Continuous monitoring: operations observe production behavior proactively.

Pros: shorter deployment time, developer/operations collaboration, end-to-end ownership and production monitoring. Risks: balancing old/new code, tool dependence and deployment effects on production.

## 7. Comparing the approaches (slides 7-14)

| Approach | Distinct emphasis |
|---|---|
| Scrum | Sprint organization, backlog priorities, team inspection |
| XP | Engineering practices such as pair programming and test-first development |
| Kanban | Visual flow and limiting WIP |
| DevOps | Development/operations collaboration and delivery feedback |

They are not interchangeable labels. A team can combine practices, but an answer should identify the practice relevant to the question.

## Exam focus

- Why collaboration? It clarifies needs and priorities and validates increments before misconceptions accumulate.
- How does Agile save time under change? Short increments expose problems early and permit reprioritization, reducing avoidable rework.
- Explain incremental delivery without promising that every project is cheaper or faster.
- Compare Scrum review/retrospective and distinguish Scrum from XP/Kanban/DevOps.
- Related past questions: 2023 Q2; 2025 Q3-Q4.
