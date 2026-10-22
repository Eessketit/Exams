# Week 1.1: Introduction to Artificial Intelligence

What this lecture is about: course logistics and grading for SOC4040, then a conceptual tour of AI: definition, history, AI vs ML vs DL, the three learning paradigms, modern systems (CV, NLP, LLMs), real-world applications, limitations, bias and trends. No formulas or worked numeric examples on these slides.

## 1. Course logistics (slides 1-10)

**Instructor.** Dr. Oybek Eraliev (footer spells it "Eraliyev"), Dept. of Computer Engineering, IUT. Email: oybekeraliev7@gmail.com. BSc + MSc Electrical Engineering (Fergana Polytechnic, 2008-2012, 2012-2014), PhD Future Vehicle Engineering, Inha University Korea (2019-2024), Associate Professor at IUT since 2024. Research: applied AI, machine/deep learning, NLP (slides 2-3).

**Contacts.**
- Educational Assistant (TA): Mr. Jasurbek Mamurov.
- Office hours: Tuesday and Thursday, 14:00-15:30 (slide 6).
- Telegram: lab channel `@machine_learning_lab` (slides 3-4); course QR `@AI_IN_IUT` (slide 10).

**References (slide 5).**
- Russell and Norvig, *Artificial Intelligence: A Modern Approach*, 3rd ed.
- Deisenroth, Faisal, Ong, *Mathematics for Machine Learning*.
- Géron, *Hands-On Machine Learning with Scikit-Learn and TensorFlow*.

**Class progress (slide 6):** PPT lectures and discussion, attendance, exams, term project (4~6 students per team).

### Evaluation (slide 7, exact)

| Component | Weight | Rule on slide |
|---|---|---|
| Attendance | 10% | "medical certificates are not accepted"; "8 and more absences automatically **Fail**" |
| Mid-Term Exams | 25% | Week 8 |
| Final Exam | 25% | Week 15 |
| Homework-Assignments | 20% | "two 10% each" |
| Term project | 20% | see below |
| Extra points (optional) | +10 points | "Taking note (checking before mid exam and final exam)" |

- Core weights sum to 100%. Extra 10 points come on top, for note-taking, checked **before** the midterm and before the final.
- Attendance: 7 absences is still allowed, the 8th absence means automatic Fail. Sick notes do not excuse absences.
- Example (verified in `agents/w1l1/verify.py`): full attendance, midterm 72%, final 80%, homework 90%, project 85% gives $10(1) + 25(0.72) + 25(0.80) + 20(0.90) + 20(0.85) = 83$, or 88 with +5 note points.

### Term project (slide 8)
- Team of 4~6, end-to-end AI project.
- Free topic, must differ from other teams. Fields: Computer Vision, NLP, Generative AI, etc.
- Week 5: choose topic. Week 6: project proposal. Then a project report.
- Presentation: Week 14, "might be in Week 16". (Slide 10 puts the Final Exam in Week 15, so Week 16 would come after the final.)

### Syllabus (slides 9-10)

| Week | Topic | Week | Topic |
|---|---|---|---|
| 1 | Introduction of AI | 9 | Natural Language Processing |
| 2 | Core ML Algorithms | 10 | NLP with Transformers |
| 3 | ML for Classification | 11 | Generative Models |
| 4 | ML for Clustering | 12 | Reinforcement Learning |
| 5 | Introduction to Deep Learning | 13 | Deep Reinforcement Learning |
| 6 | Convolutional Neural Networks | 14 | Term Project Presentation |
| 7 | Advanced CV Models | 15 | **Final Exam** |
| 8 | **Mid-Term Exam** | | |

- Note: the lectures actually delivered so far don't match this table. Week 2 covered regression plus logistic regression, Week 3 metrics plus Naive Bayes/KNN, Week 4 decision tree plus SVM, Week 5 data preparation (see notes files 02-09). Use the delivered lectures, not this table, to decide what the midterm covers.

## 2. Learning objectives and agenda (slides 11-13, 20, 26, 41)

Session objectives (slide 12):
1. **Define and distinguish:** what AI is and how it relates to ML and DL.
2. **Explain learning:** the three major ML paradigms.
3. **Describe modern systems:** how LLMs and computer vision models work, at a conceptual level.
4. **Evaluate applications:** real-world uses and their ethical implications.
5. **Discuss the future:** where the field is heading and which skills matter.

Agenda: Part 1 Foundations of AI, Part 2 How Machines Learn, Part 3 Modern AI Systems and Applications, Part 4 Responsible AI and The Future. The agenda slide comes back before each part.

## 3. What is AI (slides 14-16)

- **Artificial:** "made or produced by human beings rather than occurring naturally, especially as a copy of something natural."
- **Intelligence:** "the ability to acquire and apply knowledge and skills."
- **Artificial Intelligence (slide 16 definition):** "the field of building systems that perform tasks which normally require human intelligence: perceiving, reasoning, learning, and acting."

| # | Capability | Meaning | Slide example |
|---|---|---|---|
| 1 | Perceive | Interpret images, sound and text | Recognizing a face in a photo |
| 2 | Reason | Draw conclusions and solve problems | Diagnosing a fault from symptoms |
| 3 | Learn | Improve performance from experience | Spam filter that gets sharper over time |
| 4 | Act | Take actions in the world | Self-driving car steering and braking |

## 4. A brief history of AI (slide 17)

| Year | Event |
|---|---|
| 1950 | Turing proposes the "Imitation Game" |
| 1956 | Dartmouth Workshop coins the term "Artificial Intelligence" |
| 1970s-80s | Two "AI Winters": funding and hype collapse |
| 1997 | Deep Blue defeats world chess champion Kasparov |
| 2012 | AlexNet starts the deep learning boom |
| 2016 | AlphaGo defeats Go champion Lee Sedol |
| 2022 | ChatGPT brings generative AI to the mainstream |

- Imitation Game = the Turing test: a machine counts as intelligent if a human interrogator can't tell it apart from a human in text conversation (textbook context).

## 5. AI, ML and DL (slide 18)

Nested sets: $\text{DL} \subset \text{ML} \subset \text{AI}$.
- **AI:** "The broadest goal: building systems that behave intelligently, however that's achieved, including hand-coded rules."
- **Machine Learning:** "A subset of AI: systems that learn patterns from data instead of following explicit, hand-written rules."
- **Deep Learning:** "A subset of ML: uses multi-layer neural networks to learn increasingly abstract representations from data."

"The AI Universe" diagram on the same slide has 5 nested rings (outer to inner), with sample items in each:

| Ring | Items shown |
|---|---|
| Artificial Intelligence | Planning and scheduling, knowledge representation, speech recognition, NLP, computer vision, expert systems, robotics, automated reasoning, fuzzy logic, AI ethics, cognitive computing |
| Machine Learning | Unsupervised, semi-supervised, reinforcement learning; classification, regression, clustering; decision trees, SVM, ensemble learning, dimensionality reduction, feature engineering |
| Neural Networks | Perceptrons, MLP, backpropagation, activation functions, CNNs, RNN, LSTM, GAN, SOMs, dropout |
| Deep Learning | DNNs, deep CNNs, transfer learning, GANs, DBNs, attention mechanisms, deep RL, capsule networks |
| Generative AI | Language modeling, transformer architecture, self-attention, NLU, text generation, summarization, dialogue systems |

- Key point: a rule-based expert system is AI but **not** ML; logistic regression is ML but **not** DL; a transformer LLM is AI, ML, DL and generative AI.

## 6. Six disciplines of AI (slide 19)

"These six disciplines compose most of AI":
1. Natural language processing
2. Knowledge representation
3. Automated reasoning
4. Machine learning
5. Computer vision and speech recognition
6. Robotics

- Textbook context (Russell and Norvig): items 1-4 are what a machine needs to pass the Turing test. Adding 5 and 6 is what the *total* Turing test needs (perception plus physical manipulation).

## 7. The machine learning pipeline (slide 21)

| Step | Name | What happens |
|---|---|---|
| 1 | Collect Data | Gather labeled or unlabeled examples |
| 2 | Train a Model | Algorithm finds patterns in the data |
| 3 | Evaluate | Test performance on **unseen** data |
| 4 | Deploy and Predict | Model makes predictions on new inputs |
| 5 | Monitor and Retrain | Track performance and improve over time |

- Slide note: "this loop repeats": production models are continuously monitored and retrained as new data arrives.
- Evaluation details are in `05_Week3_EvaluatingLearningAlgorithms.md`, data preparation in `09_Week5_DataPreparation.md`.

## 8. Three learning paradigms (slides 22-24)

| | Supervised | Unsupervised | Reinforcement |
|---|---|---|---|
| Definition | Learns from **labeled** examples: inputs paired with the correct answer | Finds patterns and structure in data with **no labels**: no "correct answer" given | An **agent** takes **actions** in an **environment** and receives **rewards or penalties** |
| How it works | Show many (input, correct output) pairs → learn the mapping → predict labels for new, unseen inputs | Feed in unlabeled data → group or compress by similarity → patterns emerge without predefined categories | Observe current **state** → take action and receive reward → update strategy to **maximize reward** |
| Slide examples | Spam detection (email → spam/not spam); price prediction (house features → sale price); medical diagnosis (X-ray → disease present/absent) | Customer segmentation; anomaly detection (network traffic, transactions); topic discovery in documents | Game-playing agents (AlphaGo, Atari); robots learning to walk/balance/grasp; data-center cooling to cut energy use |

- Spam and diagnosis are classification (discrete label); price prediction is regression (continuous). See `02_Week1_IntroML_LinearRegression.md`.

## 9. Deep learning: why now (slide 25)

Three factors came together around **2012**:
1. **Data:** explosion of digital images, text and sensor data.
2. **Compute:** GPUs and TPUs make training large networks practical.
3. **Algorithms:** better architectures (CNNs, Transformers) and training tricks.

- "The idea is old": deep learning has existed in theory since the **1980s**. It became practical only when all three factors came together (AlexNet, 2012, slide 17).
- Hardware (slide 31, "How can we build an efficient computer?"): CPU → GPU → TPU → Quantum Computing.

## 10. Modern AI systems: CV, NLP, generative AI (slides 27-29)

| Field | Slide definition | 4 examples |
|---|---|---|
| Computer Vision | Teaches machines to interpret and understand visual information (images and video) | Facial recognition (phone unlock); medical imaging (tumors, fractures); self-driving perception (pedestrians, lanes, signs in real time); quality inspection (defects on production lines) |
| NLP | Enables machines to understand, interpret and generate human language, written or spoken | Machine translation (Google Translate); sentiment analysis (reviews positive/negative); voice assistants (Siri, Alexa); chatbots and support |
| Generative AI | Creates **new content** (text, images, audio, code) instead of just classifying or predicting a label | Text generation (chat assistants); image generation (**diffusion models** from a prompt); code generation; summarization |

- **LLMs** (e.g. GPT) are trained on massive text corpora to generate human-like language.

## 11. How LLMs actually work, simplified (slide 30)

1. **Tokenize:** text is broken into "tokens", word pieces the model can process.
2. **Predict the next token:** the model is trained to predict the next token given everything before it.
3. **Learn from scale:** trained on enormous text corpora, it learns grammar, facts and patterns.
4. **Generate:** at use time it produces text **one token at a time, sampling from predicted probabilities**.

- Caveat: LLMs predict *plausible* text. They don't "know" facts the way a database does, so they can confidently state wrong information. This failure mode is called **hallucination**.

## 12. State of the art: what AI can do today (slides 32-40)

Slide 32 lists the dimensions used to track the state of the art: publications, human benchmarks, students, industry, sentiment, vision, diversity, speed, conferences, language.

| Area | Slide claim |
|---|---|
| Robotic vehicles (33) | 2018: Waymo test vehicles passed 10 million miles on public roads without a serious accident; the human driver took over only once every 6,000 miles |
| Legged locomotion (34) | Atlas humanoid robot walks on uneven terrain, jumps onto boxes, does backflips |
| Planning and scheduling (35) | Uber, Yandex, Google Maps plot optimal routes for hundreds of millions of users daily, using current and predicted traffic |
| Machine translation (36) | Over 100 languages, covering native languages of over 99% of humans; hundreds of billions of words per day |
| Speech recognition (37) | Alexa, Siri, Cortana, Google assistants; Google Duplex uses speech recognition and synthesis to book restaurants by phone |
| Recommendations (38) | Amazon, Facebook, Netflix, Spotify, YouTube, Walmart recommend from your history and that of similar users |
| Medicine (39) | AI equals or exceeds expert doctors on many image-based diagnoses: Alzheimer's (Ding 2018), metastatic cancer (Liu 2017, Esteva 2017), ophthalmic disease (Gulshan 2016), skin disease (Liu 2019c) |
| Law (40) | "Our national product": wakil.ai by HumblebeeAI |

## 13. Limitations, bias and fairness (slides 42-43)

Four limitations of today's AI (slide 42):
1. **Hallucination:** confident, fluent statements that are simply false.
2. **Lack of true understanding:** pattern matching, not genuine comprehension or reasoning.
3. **Brittleness:** small, unexpected input changes cause surprisingly large errors.
4. **Data dependency:** models inherit the biases, gaps and blind spots of their training data.

Bias (slide 43): AI can **learn and amplify** unfair patterns already present in training data.
- *Facial recognition:* higher error rates for women and darker skin tones, largely because they are underrepresented in training data.
- *Hiring algorithms:* tools trained on historical resumes downgraded candidates based on gender-correlated signals.
- Takeaway: fair AI needs **diverse data, testing across subgroups, and ongoing auditing after deployment**.

## 14. Trends, careers, key takeaways (slides 44-46)

- **Trends (44):** multimodal AI (text, image, audio, video in one system); autonomous agents (plan and run multi-step tasks with less supervision); smaller efficient models (run locally on devices); growing regulation (EU AI Act).
- **Careers (45):** ML Engineer (builds and deploys models into production); Data Scientist (analyzes data, builds predictive models); AI/ML Researcher (advances the state of the art); AI Ethicist/Policy Analyst (societal impact); AI Product/Prompt roles (applies AI in products). Skills: Python, statistics and linear algebra, critical thinking about responsible use.
- **Key takeaways (46):**
  - AI is the broad goal; ML and DL are the main tools used to reach it today.
  - Machines learn through supervised, unsupervised and reinforcement paradigms.
  - Transformers plus large-scale data and compute unlocked today's generative AI boom.
  - AI creates enormous value, with real risks around bias, privacy and misuse.
  - Responsible use means knowing what AI can do and where it falls short.

## 15. Approaches to AI (textbook context)

Not on the slides, but this is the standard framing in the course textbook (Russell and Norvig, ch. 1):

| | Human-like | Rational |
|---|---|---|
| Thinking | Thinking humanly (cognitive modeling) | Thinking rationally ("laws of thought", logic) |
| Acting | Acting humanly (Turing test) | Acting rationally (**rational agent**: R&N's preferred approach) |

- Also common: narrow/weak AI (one task) vs general/strong AI (human-level across tasks).

## Exam focus

1. **Define AI and name its four capabilities.** Answer: building systems that do tasks normally needing human intelligence: perceive, reason, learn, act (slide 16). Give one slide example for each (table in section 3).
2. **Relation of AI, ML, DL.** $\text{DL} \subset \text{ML} \subset \text{AI}$. ML learns from data instead of hand-written rules; DL uses multi-layer neural networks. Trap: "every AI system learns from data" is **false** (hand-coded rules still count as AI).
3. **Classify the paradigm.** Typical short question:

| Scenario | Paradigm | Why |
|---|---|---|
| Emails labeled spam/not spam, build a filter | Supervised (classification) | Labeled pairs |
| Predict house price from size, rooms | Supervised (regression) | Labeled, continuous output |
| Group shoppers by purchase behavior, no labels | Unsupervised (clustering) | No correct answer given |
| Flag unusual bank transactions | Unsupervised (anomaly detection) | No labels; find outliers |
| Robot learns to walk by trial and error | Reinforcement | Agent, actions, rewards |
| Cut data-center cooling energy | Reinforcement | Maximize reward over actions |

4. **Order the timeline:** 1950 Turing → 1956 Dartmouth → 1970s-80s AI winters → 1997 Deep Blue → 2012 AlexNet → 2016 AlphaGo → 2022 ChatGPT. Gaps: 1956 to 1997 = 41 years; Dartmouth to ChatGPT = 66 years (verified).
5. **Why did deep learning take off around 2012 if the idea is from the 1980s?** Data + compute (GPU/TPU) + algorithms (CNNs, Transformers, training tricks), all three together.
6. **ML pipeline order:** Collect data → Train → Evaluate (on unseen data) → Deploy and predict → Monitor and retrain (loop).
7. **How does an LLM generate text, and why does it hallucinate?** Tokenize → next-token prediction → scale → generate token by token by sampling from probabilities. It optimizes plausibility, not truth, so it has no database of facts.
8. **List the four limitations** (hallucination, lack of understanding, brittleness, data dependency) and **one bias example** with its cause (underrepresentation in training data) and fix (diverse data, subgroup testing, auditing).
9. **Six disciplines of AI:** NLP, knowledge representation, automated reasoning, ML, computer vision and speech recognition, robotics.
10. **Generative vs discriminative (classification):** generative AI creates new content; a classifier predicts a label. Image generation example on the slide: diffusion models.
