# Supplement: WebApp Requirements and Diagram Notation

What this note is about: filling the WebApp-analysis gap in the supplied slides and collecting the notation needed for past-paper drawing questions.

**Source boundary:** the lectures are Pressman SEPA **9e**, while the textbook supplied in the archive is Pressman/Maxim **8e**. WebApp material below is explicitly textbook context from 8e Chapter 11, sections 11.5.1-11.5.5, printed pages 214-218 (PDF pages 245-249). Do not use the 8e chapter number as though it referred to the 9e lecture deck.

## 1. Why WebApps need requirements analysis (8e section 11.5)

An agile schedule does not remove uncertainty about the problem. Analysis should be lightweight or detailed according to increment complexity, stakeholders, team size/familiarity and business criticality.

Communication supplies users, business context, goals, rough requirements and scenarios. Analysis structures that information and exposes missing, ambiguous or inconsistent requirements before they cause design rework.

Not all analysis must precede all design. Analyze the requirements affecting the increment being designed, and broaden the scope when a decision affects other increments.

**Example:** "view a camera" leaves unanswered the video resolution, associated information, pan/zoom behavior and response to an alarm while viewing. These answers influence implementation and cannot all be replaced with a choice of button color.

## 2. Five WebApp analysis outputs (8e section 11.5.3)

| Model | What it identifies | Airline study example |
|---|---|---|
| Content | Information presented/manipulated | Flight details, fares, ticket, booking confirmation |
| Interaction | How the user interacts | Search, select, book, review confirmation |
| Functional | Processing on content and other needed functions | Fare calculation and booking validation |
| Navigation | How users move through the app | Search results to flight detail to checkout |
| Configuration | Required environment/infrastructure | Browser/device and service environment |

This list is specifically the textbook's Web/mobile analysis taxonomy, not a substitute for every generic requirements-model list.

## 3. Content analysis and content model (8e section 11.5.4)

Content analysis identifies the information users need and the content objects and relationships required to supply it. Content can include text, images, graphics, video, audio and dynamically generated data.

Find content objects by reading use cases and identifying direct/indirect information references. Describe each object and its structure. Use a simple list for simple content; use richer hierarchical models where relationships matter.

| Content object | Attributes or parts | Relationship |
|---|---|---|
| Flight information | Flight number, route, departure, arrival | Referenced by a booking |
| Fare | Amount, currency, class | Applies to selected itinerary |
| Booking confirmation | Reference, passenger, itinerary | Summarizes the booking |

The table is an illustrative analysis model. It does not assert extra fields in an exam condition without qualification.

The textbook's component example uses a data tree containing identifiers, type, price and composite descriptions such as image/video/text information. A data tree helps expose omissions and inconsistent relationships before content design.

**Short exam answer:** content analysis determines what information a WebApp must provide, its content objects/attributes and their relationships, using user scenarios. It produces a content model so the team can detect missing information and design suitable presentation/navigation later.

## 4. Generic analysis elements and the four-element question

2024 Q5 asks for four key elements of requirement analysis without specifying a taxonomy.

- Ch07 s9 discusses scenario-based, class-based and behavioral elements.
- Ch08 s3 lists **five** model types: scenario-based, class-oriented, behavioral, data and flow-oriented.
- A commonly taught four-element grouping is scenario-based, class-based, behavioral and flow-oriented. This grouping is contextual explanation; it is not the exact list on Ch08 s3.

For revision, know each model's purpose and the instructor's expected terminology. Do not answer with the seven RE tasks or four design levels: those are different classifications.

## 5. Use case notation (Ch07 s10 and Ch08 s13)

| Symbol | Meaning |
|---|---|
| Stick figure or named external-role box | Actor |
| Oval | Actor-visible use case/goal |
| Rectangle around use cases | System boundary |
| Solid line from actor to use case | Participation/association |

The introductory course examples are sufficient with actors, goals and clear associations. `include` and `extend` are optional additional UML concepts and are not required in the worked case diagrams here.

Actors stay outside the system boundary. Goals stay inside. A database internal to the system should not be added as an external actor just because it stores information.

## 6. Class notation (Ch07 s11 and Ch09 s11)

| Symbol | Meaning |
|---|---|
| Rectangle with compartments | Class name, attributes, operations |
| Solid line | Association |
| Multiplicity labels such as 1 and 0..* | Permitted number of related instances |
| Solid line with hollow triangular head | Generalization toward the more general class |
| Hollow diamond at whole end | Aggregation |

Standard-UML context beyond the basic slide examples: a filled diamond denotes composition; a dashed arrow denotes dependency; `+`, `-` and `#` denote public, private and protected visibility. These are notation explanations, not a claim that all are separately defined in the deck.

Study class: `Enrollment` with `status` and `confirm()`. Generalization points toward the parent class; an aggregation/composition diamond belongs at the whole, not at the part.

## 7. State and activity notation (Ch07 s12 and Ch08 s24-33)

| Symbol | Meaning |
|---|---|
| Filled circle | Initial node/pseudostate |
| Rounded rectangle | State in a state diagram; action in an activity diagram |
| Arrow | Transition or control flow |
| Bull's-eye | Final state/activity final |
| Diamond in activity flow | Decision or merge |
| Lanes | Responsibility partition |

Standard-UML context: thick bars can represent fork/join in activity diagrams. Branch guards such as `[seat available]` clarify decisions.

In a state model, `event [guard] / action` describes a transition. Entry/do/exit behavior can appear within a state.

**State example:** Draft → Submitted → Approved/Rejected. **Activity example:** enter request → validate dates → submit → notify manager. States describe a persistent situation; activity actions describe work.

## 8. Diagram self-check

- Can each symbol and arrow be explained?
- Does the system boundary match the case?
- Are responsibilities and actors correct?
- Does each branch have an understandable condition?
- Can the flow complete or recover from a failure?
- Does the diagram match the written use case?
- Have assumptions been labeled instead of silently becoming requirements?

## Exam focus

- 2023 Q6: explain requirements modeling for WebApps using content, interaction, function, navigation and configuration.
- 2024 Q3: explain content analysis using objects, attributes and relationships, with a small example.
- 2023 Q7 and 2024 Q7: draw and name the requested state/class symbols.
- Use the notation consistently in all case-study answers.
