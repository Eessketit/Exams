# Week 7.2: User Experience Design

What this lecture is about: UX elements, usability/accessibility, interface principles, personas, customer journeys, design sprints and evaluation.

Source: `Pressman_SEPA_9e_Ch012_PPT.pptx`, 37 slides. Slides 32-37 describe figures.

## 1. Five UX elements (slides 2-3)

| From abstract to concrete | Concern |
|---|---|
| Strategy | User needs and business goals |
| Scope | Required functions and content |
| Structure | Interaction design and information architecture |
| Skeleton | Information, interface and navigation design |
| Surface | Visual appearance |

The order matters. Attractive surface design cannot compensate for a product whose underlying goals and workflows are wrong.

## 2. Architecture, interaction and usability (slides 4-7)

Information architecture organizes, labels and supports navigation/search of content. Content architecture structures material for presentation. Software architecture supports interactions, navigation and content delivery.

Interaction design explains how users perform actions and how the system responds. The interface should present enough information for users to choose the next action toward their goal.

Usability engineering specifies, designs and tests human-computer interaction. Ease of learning, use and later recall can be measured. Accessibility enables people with special needs to perceive, understand, navigate and interact.

Visual design supports appearance and experience, but is only one part of UX.

## 3. Three golden rules (slides 8-10)

| Rule | Practices |
|---|---|
| Place the user in control | Flexible interaction, interrupt/undo, customization, direct manipulation, hidden technical internals |
| Reduce memory load | Meaningful defaults, intuitive shortcuts, familiar metaphors, progressive disclosure |
| Make the interface consistent | Coherent task context and stable conventions within/across products |

**Study example:** show the selected course and fee on a confirmation screen rather than requiring a student to remember them from an earlier page. Allow correction before final submission.

## 4. Four interface models (slide 11)

- **User model:** profile of intended users.
- **Design model:** designer's realization based on that understanding.
- **Mental model:** how the user believes the interface/system works.
- **Implementation model:** actual interface appearance/behavior and supporting explanations.

Reconcile them. If users expect a reversible draft but submission is irreversible, an attractive button does not remove the underlying mismatch.

## 5. Interface process and analysis (slides 12-14)

Iterate through interface analysis/modeling, design, construction/prototyping and validation.

Analysis considers users, tasks, presented content and operating environment. Design defines objects/actions. Construction produces prototypes. Validation checks task correctness, usability/learnability and user acceptance.

An interface can execute correctly yet remain difficult to learn; functional correctness and usability are related but distinct concerns.

## 6. Customer journeys and personas (slides 15-18)

Journey-map process: gather stakeholders, research experiences, define touchpoints, visualize/refine the model, identify gaps and assign responsibility for improvements.

Persona process: collect/analyze user data, describe representative users, develop scenarios, and validate them with stakeholders, e.g. a cognitive walkthrough.

| Artifact | Main purpose |
|---|---|
| Persona | Representative user goals, context and relevant characteristics |
| Journey map | Experience across touchpoints and pain points |
| Use case | Interaction toward a particular system goal |

The lecture's persona example includes computer familiarity and constraints relevant to the system. A persona should not be an arbitrary biography unrelated to design choices.

## 7. Task analysis and iteration (slides 19-20)

Identify what users do, their tasks/subtasks, manipulated domain objects, workflow order and task hierarchy.

The iterative UX diagram cycles research, design and build, validating needs and ideas and adjusting to constraints throughout.

## 8. Five-day design sprint (slides 21-22)

1. **Understand:** research user needs/business goals and display supporting evidence.
2. **Sketch:** individuals propose inexpensive visual solutions.
3. **Decide:** compare proposals and choose what to prototype.
4. **Prototype:** build enough of the selected workflow to test its assumptions.
5. **Validate:** observe relevant users and learn from their behavior.

Prototype scope may be a portion of a journey rather than the entire product. Test cases should be prepared as it is built.

## 9. Evaluation and usability guidelines (slides 23-27)

Evaluation cycles through prototype construction, user evaluation, designer assessment and revision.

Early models can reveal learning demands, number of task actions, efficiency and memory load. Help/error handling/style influence acceptance.

Usability guidelines include anticipation, status communication, consistency, controlled autonomy, efficiency, flexibility, focus, familiar interface objects, latency reduction, learnability, metaphors, readability, saved interaction state and visible navigation.

**Study example:** show progress during a long operation, prevent duplicate submission, and let the user recover their place later. A status message should be truthful; displaying success before completion can mislead users.

## 10. Accessibility and operational concerns (slides 28-29)

Consider access mechanisms for people with different needs, response-time length and variability, integrated help and constructive error recovery.

Error messages should use understandable language, explain recovery/consequences, provide an appropriate cue and avoid blaming the user.

Menu/command labels should be clear and consistent. Internationalization needs explicit effort and language/locale expertise; it is not just replacing visible strings.

## Exam focus

- Reproduce the five UX levels and three golden rules.
- Distinguish usability from visual appeal and accessibility from general convenience.
- Compare personas, journeys and use cases.
- Know the four interface models and the five sprint stages.
- Translate a vague usability wish into a measurable requirement, clearly labeling any proposed numerical target as an assumption.
- This chapter remains in the requested scope even though the three supplied past papers contain no dedicated UX theory question.
