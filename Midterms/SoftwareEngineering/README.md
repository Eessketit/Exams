# Software Engineering: Midterm Preparation

Study materials for **weeks 1-8**, based on the supplied course archive: 13 Pressman SEPA 9e lecture decks and the Fall 2023, 2024 and 2025 CSE4070 midterms.

The 13 decks contain 384 slides including title, closing and accessibility/text-alternative slides. Week 8 contains past exam papers rather than a new lecture. This coverage statement does not independently establish the scope or format of the next exam.

## 1. Start here

1. Read the relevant lecture notes below.
2. Practice identifying requirements, actors and goals from a case.
3. Write a use case description and draw its matching activity diagram.
4. Attempt the past questions before reading their study answers.
5. Use the [revision checklist](Revision_Checklist.md) to identify weak areas.

Notes follow the repository's style: one file per lecture, compact explanations, slide references, examples and an **Exam focus** section. Past-paper solutions use **Source** and **Notes** references and label assumptions.

All navigation links point to Markdown, so you do not need to open a PDF to follow the explanations. Mermaid diagrams render on GitHub; local IDE support may depend on the Markdown preview. Each worked case also includes a text scenario/table for use when diagram rendering is unavailable.

## 2. Lecture notes

| Week | Chapter and source deck | Notes |
|---|---|---|
| 1 | Ch01 Software and Software Engineering | [01 Software and SE](notes/01_Week1_Software_SoftwareEngineering.md) |
| 1 | Ch02 Process Models | [02 Process models](notes/02_Week1_ProcessModels.md) |
| 2 | Ch24 Project Management Concepts | [03 Project management](notes/03_Week2_ProjectManagement.md) |
| 2 | Ch25 Creating a Viable Software Plan | [04 Planning, estimation and scheduling](notes/04_Week2_Planning_Estimation_Scheduling.md) |
| 3 | Ch03 Agility and Process | [05 Agility](notes/05_Week3_Agility_Process.md) |
| 3 | Ch04 Recommended Process Model | [06 Recommended process](notes/06_Week3_RecommendedProcess.md) |
| 4 | Ch06 Principles that Guide Practice | [07 Practice principles](notes/07_Week4_PracticePrinciples.md) |
| 4 | Ch07 Understanding Requirements | [08 Understanding requirements](notes/08_Week4_UnderstandingRequirements.md) |
| 5 | Ch08 Requirements Modeling | [09 Requirements modeling](notes/09_Week5_RequirementsModeling.md) |
| 6 | Ch09 Design Concepts | [10 Design concepts](notes/10_Week6_DesignConcepts.md) |
| 6 | Ch10 Architectural Design | [11 Architectural design](notes/11_Week6_ArchitecturalDesign.md) |
| 7 | Ch11 Component-Level Design | [12 Component-level design](notes/12_Week7_ComponentLevelDesign.md) |
| 7 | Ch12 User Experience Design | [13 UX design](notes/13_Week7_UserExperienceDesign.md) |
| Supplement | Supplied 8e textbook Ch11 section 11.5 and diagram context | [14 WebApp requirements and UML](notes/14_Supplement_WebApps_UML.md) |

Source deck filenames follow `Pressman_SEPA_9e_ChNNN_PPT.pptx`. References such as **W5 Ch08 s20-22** mean week 5, chapter 8 deck, slides 20-22, counted from the first slide. These numbers are not page numbers in the textbook.

## 3. Past-paper study answers

| Paper | Theory | Case | Study file |
|---|---|---|---|
| Fall 2023 | 7 questions, 14 marks | HRMS, 11 marks | [2023 questions and worked case](MidtermSamples/Midterm_2023_Solved.md) |
| Fall 2024 | 7 questions, 14 marks | Airline Ticket Booking, 11 marks | [2024 questions and worked case](MidtermSamples/Midterm_2024_Solved.md) |
| Fall 2025 | 10 questions, 30 marks | Smart Campus, 20 marks | [2025 questions and worked case](MidtermSamples/Midterm_2025_Solved.md) |

The supplied papers all state 60 minutes. The first two total 25 marks. The 2025 paper totals 50 and includes a /25 field, but its header is not a complete description of the grading policy.

There are **24 theory questions** and **13 case-study subquestions** across the three files. Each question has an explanatory answer or a clearly marked source limitation. The files are educational reconstructions with suggested answers, not official answer keys.

## 4. Repeated practical skills

All three cases ask for the same core skills:

| Skill | 2023 | 2024 | 2025 |
|---|---|---|---|
| Extract requirements | FR and NFR together: 4 | FR and NFR together: 4 | FR: 4, NFR: 2 |
| Use case diagram | 4 | 4 | 8 |
| Use case description | Leave Request: 2 | Book Ticket: 2 | Register for Course: 2 |
| Activity diagram | Employee request: 1 | Book Ticket: 1 | Register for Course: 4 |

The case accounts for 44% in 2023/2024 and 40% in 2025. This is evidence from three papers, not a guarantee about a future exam.

Suggested preparation order, based on that evidence:

- Requirements and case modeling: notes 08-09, supplement and all three cases.
- Process models, Agile and increments: notes 01-02 and 05-06.
- Teams, communication, estimates and risks: notes 03-04 and 07.
- Design, architecture, components and UX: notes 10-13, which remain within the supplied week scope even when less prominent in these papers.

## 5. Source boundaries and known traps

- **Edition mismatch:** lecture decks are 9e, while the supplied textbook is 8e. The supplement explicitly cites 8e chapter/section and printed/PDF pages. It closes the old papers' WebApp-analysis gap without pretending that content was in the 9e slides.
- **Four analysis elements:** 2024 Q5 asks for four, whereas Ch08 s3 lists five model types and Ch07 s9 illustrates three groups. A conditional four-element study grouping is explained; the instructor's expected taxonomy is not established by these materials alone.
- **UCP example:** Ch25 s19's formula includes 16 complex use cases not mentioned in its introductory prose.
- **Rounding:** some cost examples use rounded size, productivity or unit cost. The notes separate exact multiplication from the slide's rounded result.
- **Cost inconsistency:** Ch25 s20's $552,000 does not follow from its stated size/productivity/labor rate; the notes show the independently computed value and distinguish this from ordinary rounding.
- **NFRs:** HRMS has explicit numerical limits. Airline/Smart Campus do not inherit those limits. Derived qualities and proposed acceptance targets must be labeled as assumptions.
- **Diagram scope:** a use case diagram shows actors/goals; an activity diagram shows a scenario's workflow; a state diagram shows state changes. They are not interchangeable.
- **Reliability:** SE and tests reduce defects; they do not guarantee absolutely error-free software.

## 6. Original source inventory

The lecture notes identify their source filename and slide count. Original decks, textbook scans and blank exam DOCX files are not duplicated in this documentation addition; use the supplied course archive for the originals.

| Archive folder | Source files |
|---|---|
| Week_01 | `Pressman_SEPA_9e_Ch001_PPT.pptx`, `Pressman_SEPA_9e_Ch002_PPT.pptx` |
| Week_02 | `Pressman_SEPA_9e_Ch024_PPT.pptx`, `Pressman_SEPA_9e_Ch025_PPT.pptx` |
| Week_03 | `Pressman_SEPA_9e_Ch003_PPT.pptx`, `Pressman_SEPA_9e_Ch004_PPT.pptx` |
| Week_04 | `Pressman_SEPA_9e_Ch006_PPT.pptx`, `Pressman_SEPA_9e_Ch007_PPT.pptx` |
| Week_05 | `Pressman_SEPA_9e_Ch008_PPT.pptx` |
| Week_06 | `Pressman_SEPA_9e_Ch009_PPT.pptx`, `Pressman_SEPA_9e_Ch010_PPT.pptx` |
| Week_07 | `Pressman_SEPA_9e_Ch011_PPT.pptx`, `Pressman_SEPA_9e_Ch012_PPT.pptx` |
| Week_08_Midterm_Exam_Sample_Previous_Year_ExamPaper | `Fall 2023-SE-MID TERM.docx`, `Fall 2024-SE-MID TERM (1).docx`, `Fall 2025-SE-MID TERM (1).docx` |

Textbook reference: Pressman and Maxim, *Software Engineering: A Practitioner's Approach*, **8th edition**, Chapter 11 section 11.5, supplied in the archive's textbook folder. The WebApp supplement uses printed pp214-218 (PDF pp245-249).

## 7. Using the worked diagrams

Mermaid has no native UML use-case diagram type in these files. Its external actor boxes and rounded goal nodes are an approximation for Markdown. In a handwritten UML answer, draw stick figures, use-case ovals and a rectangular system boundary. Activity flowcharts likewise require standard initial/final symbols when drawn as UML.

The solution files identify assumptions about role assignments, validation, failure handling and payment completion. Alternative models can be valid if they preserve the case requirements and remain internally consistent.
