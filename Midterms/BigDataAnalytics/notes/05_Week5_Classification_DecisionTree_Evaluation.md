# Week 5: Classification: Basics, Decision Tree Induction (ID3 / Information Gain), Model Evaluation, Ensembles (Bagging)

**What this lecture is about:** how a classifier is built and used, how a decision tree picks split attributes by information gain (full buys_computer computation), and how to score a classifier (holdout/CV, confusion matrix, accuracy, sensitivity/specificity, precision/recall/F), plus bagging.

Reading: Han, Kamber, Pei, *Data Mining: Concepts and Techniques*, 3rd ed., **Ch. 8**.
The outline also lists Bayes and rule-based classification, but **this deck has no slides on them**.

---

## 1. Classification basics

| | Supervised (classification) | Unsupervised (clustering) |
|---|---|---|
| Labels | Training data comes **with class labels** | Class labels are **unknown** |
| Goal | Classify new data using the training set | Find out whether classes or clusters exist in the data |

- **Classification** predicts **categorical** class labels (discrete/nominal). It builds a model from the training set plus the class-label attribute, then classifies new data.
- **Numeric prediction** models **continuous-valued** functions, i.e. it predicts unknown or missing values.
- Typical applications: credit/loan approval, medical diagnosis (tumor cancerous or benign), fraud detection, web-page categorization.

## 2. Two-step process

1. **Model construction.** Each tuple belongs to a predefined class, given by the *class label attribute*. The tuples used are the **training set**. The model takes the form of classification rules, a decision tree, or a mathematical formula.
2. **Model usage.** The model classifies future/unknown objects.
   - First **estimate accuracy**: compare each test sample's known label with the model's output. **Accuracy rate** = % of test-set samples classified correctly.
   - The test set **must be independent** of the training set; otherwise the estimate is optimistic (overfitting).
   - If the accuracy is acceptable, use the model on new data.
   - When the test set is used to *select* models, it is called the **validation (test) set**.

**Tenure example (slides 7–8)**
- Training: Mike (Asst Prof, 3, no), Mary (Asst, 7, yes), Bill (Prof, 2, yes), Jim (Assoc, 7, yes), Dave (Asst, 6, no), Anne (Assoc, 3, no).
- Learned model: `IF rank = 'professor' OR years > 6 THEN tenured = 'yes'`.
- Test: Tom (Asst, 2, no), Merlisa (Assoc, 7, no), George (Prof, 5, yes), Joseph (Asst, 7, yes).
- Unseen tuple: (Jeff, Professor, 4). The rule gives **tenured = yes**.
- *(derived check, not on slide)* The rule gets all 6 training tuples right (100%) but only 3/4 test tuples (75%). Merlisa has years 7 > 6, so it predicts yes, but her actual label is no. This is why accuracy is measured on an independent test set.

**Loan example (slides 9–10, textbook figure)**
- Training (name, age, income → loan_decision). Learned rules: `IF age = youth THEN risky`; `IF income = high THEN safe`; `IF age = middle_aged AND income = low THEN risky`.
- Test: Juan Bello (senior, low, safe), Sylvia Crest (middle_aged, low, risky), Anne Yee (middle_aged, high, safe).
- New data (John Henry, middle_aged, low) → **risky**.

## 3. Decision tree induction: the buys_computer example

Training set: 14 tuples (Table 8.1, *AllElectronics*). The slide calls it a version of **Quinlan's ID3 "Play Tennis"** data.
Slide 12 writes age as `<=30 / 31…40 / >40`; slides 29–37 write it as `youth / middle_aged / senior`. They are the same data.

| RID | age | income | student | credit_rating | buys_computer |
|---|---|---|---|---|---|
| 1 | youth | high | no | fair | no |
| 2 | youth | high | no | excellent | no |
| 3 | middle_aged | high | no | fair | yes |
| 4 | senior | medium | no | fair | yes |
| 5 | senior | low | yes | fair | yes |
| 6 | senior | low | yes | excellent | no |
| 7 | middle_aged | low | yes | excellent | yes |
| 8 | youth | medium | no | fair | no |
| 9 | youth | low | yes | fair | yes |
| 10 | senior | medium | yes | fair | yes |
| 11 | youth | medium | yes | excellent | yes |
| 12 | middle_aged | medium | no | excellent | yes |
| 13 | middle_aged | high | yes | fair | yes |
| 14 | senior | medium | no | excellent | no |

Class counts: **9 yes, 5 no**.

**Resulting tree (slide 12):**
```
age?
├─ <=30 (youth)        → student?        no → NO     | yes → YES
├─ 31..40 (middle_aged) → YES
└─ >40 (senior)        → credit_rating?  excellent → NO | fair → YES
```

## 4. Algorithm `Generate_decision_tree` (slides 13-25)

**Basic idea**
- Greedy, **top-down, recursive, divide-and-conquer**.
- All training tuples start at the root.
- Attributes are **categorical**; continuous attributes are discretized in advance.
- Tuples are partitioned recursively on the selected attribute.
- The test attribute is chosen by a heuristic/statistical measure, e.g. **information gain**.

**Inputs**
- *D*: data partition (training tuples + labels).
- *attribute_list*: the candidate attributes.
- *Attribute_selection_method*: returns the "best" splitting criterion, which is a *splitting_attribute* plus possibly a *split-point* or a *splitting subset*.

**Output:** a decision tree.

**Pseudocode**
```
(1)  create a node N
(2)  if tuples in D are all of the same class C then
(3)      return N as a leaf labeled with class C
(4)  if attribute_list is empty then
(5)      return N as a leaf labeled with the majority class in D   // majority voting
(6)  apply Attribute_selection_method(D, attribute_list) to find the "best" splitting_criterion
(7)  label node N with splitting_criterion
(8)  if splitting_attribute is discrete-valued and multiway splits allowed then  // not restricted to binary trees
(9)      attribute_list ← attribute_list − splitting_attribute                     // remove it
(10) for each outcome j of splitting_criterion       // partition tuples, grow subtrees
(11)     let Dj = tuples in D satisfying outcome j
(12)     if Dj is empty then
(13)         attach a leaf labeled with the majority class in D to node N
(14)     else attach the node returned by Generate_decision_tree(Dj, attribute_list) to N
     endfor
(15) return N
```

**Stopping conditions** (slide 25). Know all three and the leaf label each one gives:
1. All samples at the node belong to the **same class**. The leaf gets that class (steps 2–3).
2. **No remaining attributes**. The leaf gets the **majority vote** of D (steps 4–5).
3. **No samples left** (Dj is empty). The leaf gets the **majority class of the parent D** (steps 12–13).

## 5. Entropy review (slide 26)

- Entropy is a **measure of uncertainty** of a random variable. For a discrete Y with *m* values: $H(Y) = -\sum_{i=1}^{m} p_i \log(p_i)$, where $p_i = P(Y=y_i)$.
- Higher entropy means higher uncertainty; lower entropy means lower uncertainty.
- **Conditional entropy:** $H(Y\mid X) = \sum_x p(x)\, H(Y\mid X=x)$.
- The plot for *m* = 2 shows H against Pr(X=1). H is **0 at p = 0 or 1** and reaches its **maximum 1 bit at p = 0.5**.
- *(textbook context)* The maximum for *m* classes is $\log_2 m$. In ID3 terms, $Info_A(D)$ is the conditional entropy $H(\text{class}\mid A)$, and Gain is the drop in entropy.

## 6. Information gain (ID3, C4.5): formulas (slide 27)

- **Choose the attribute with the highest information gain.**
- $p_i = |C_{i,D}| / |D|$ is the probability that a tuple belongs to class $C_i$.
- Expected information (entropy) of D: $$Info(D) = -\sum_{i=1}^{m} p_i \log_2(p_i)$$
- Information still needed after splitting D on A into *v* partitions: $$Info_A(D) = \sum_{j=1}^{v} \frac{|D_j|}{|D|} \times Info(D_j)$$
- Information gain: $$Gain(A) = Info(D) - Info_A(D)$$
- Units are **bits** (log base 2). Convention: $0\log_2 0 = 0$, so a pure partition has Info = 0.

### log2 lookup table (slide 28): expect it on the exam
The slide header says "log_y n" (a typo); the values are **log₂ n for n = 1…18, rounded to 1 decimal**:

| n | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| log₂n | 0 | 1 | 1.6 | 2 | 2.3 | 2.6 | 2.8 | 3 | 3.2 | 3.3 | 3.5 | 3.6 | 3.7 | 3.8 | 3.9 | 4 | 4.1 | 4.2 |

- To use the table, rewrite each term as $-\frac{a}{n}\log_2\frac{a}{n} = \frac{a}{n}\,(\log_2 n - \log_2 a)$.
- The table only goes to n = 18, which suggests exam datasets of **≤ 18 tuples**.

### Worked example (slides 29-37), verified in Python

**Step 1 — Info(D)** with 9 yes and 5 no:
$$Info(D) = -\tfrac{9}{14}\log_2\tfrac{9}{14} - \tfrac{5}{14}\log_2\tfrac{5}{14} = 0.410 + 0.530 = \mathbf{0.940\ bits}$$

**Step 2 — Info_age(D).** The partitions are youth (2 yes / 3 no), middle_aged (4 / 0), senior (3 / 2):
$$\tfrac{5}{14}\left(-\tfrac{2}{5}\log_2\tfrac{2}{5}-\tfrac{3}{5}\log_2\tfrac{3}{5}\right) + \tfrac{4}{14}\left(-\tfrac{4}{4}\log_2\tfrac{4}{4}\right) + \tfrac{5}{14}\left(-\tfrac{3}{5}\log_2\tfrac{3}{5}-\tfrac{2}{5}\log_2\tfrac{2}{5}\right) = \tfrac{5}{14}(0.971) + 0 + \tfrac{5}{14}(0.971) = \mathbf{0.694\ bits}$$

**Step 3 — Gain(age)** = 0.940 − 0.694 = **0.246 bits**. The exact value is 0.2467; the slide subtracts the already-rounded numbers.

**Step 4 — Gains for the other attributes.** The slide gives only the final gains. The partition counts and Info_A values come from my recomputation.

| Attribute | Partitions (yes / no) | Info_A(D) | **Gain** (slide) | Gain using the log table |
|---|---|---|---|---|
| **age** | youth 2/3, middle_aged 4/0, senior 3/2 | 0.694 | **0.246** | 0.250 |
| income | high 2/2, medium 4/2, low 3/1 | 0.911 | **0.029** | 0.007 |
| student | no 3/4, yes 6/1 | 0.789 | **0.151** | 0.150 |
| credit_rating | fair 6/2, excellent 3/3 | 0.892 | **0.048** | 0.036 |

→ **age has the highest gain, so it becomes the root split.**

With the 1-decimal log table, Info(D) comes out as ≈ 0.921 (not 0.940). The absolute numbers shift, but the **ranking and the chosen attribute stay the same**.

**Step 5 — Split on age (slide 37).**
- The middle_aged partition is all "yes", so it becomes a **pure leaf: yes**.
- Youth partition: income/student/credit/class = high/no/fair/no, high/no/exc/no, medium/no/fair/no, low/yes/fair/yes, medium/yes/exc/yes.
- Senior partition: medium/no/fair/yes, low/yes/fair/yes, low/yes/exc/no, medium/yes/fair/yes, medium/no/exc/no.

**Step 6 — Next level** *(derived, not on slides; it explains the slide-12 tree)*.
- **Youth**: Info = 0.971. Gain(student) = **0.971**, because student splits youth perfectly. Gain(income) = 0.571 and Gain(credit) = 0.020. → split on **student**.
- **Senior**: Info = 0.971. Gain(credit_rating) = **0.971** (perfect split: fair → yes, excellent → no). Gain(income) = Gain(student) = 0.020. → split on **credit_rating**.

*(textbook context, not on slides)* Information gain favours attributes with many values. **C4.5** corrects for this with $GainRatio(A) = Gain(A)/SplitInfo_A(D)$, where $SplitInfo_A(D) = -\sum_j \frac{|D_j|}{|D|}\log_2\frac{|D_j|}{|D|}$. For income: 0.029 / 1.557 ≈ 0.019. **CART** uses the Gini index instead: $1-\sum p_i^2$.

## 7. Model evaluation and selection (slides 38-39)

- Assess accuracy on a **validation/test set** of class-labeled tuples, **not on the training set**.
- **Holdout**: randomly split the data into two independent sets. The training set (e.g. **2/3**) builds the model; the test set (e.g. **1/3**) estimates accuracy.
- **Random (sub)sampling**: a variation of holdout. Repeat the holdout *k* times; accuracy = **average** of the *k* accuracies.
- **k-fold cross-validation**, with **k = 10 most popular**:
  - Randomly partition the data into *k* **mutually exclusive** subsets of about equal size, $D_1 \dots D_k$.
  - At iteration *i*, use $D_i$ as the test set and the rest as training.
  - *(textbook context)* Accuracy = total correct over all *k* folds / total tuples. Each tuple is used for testing exactly once.

## 8. Confusion matrix (slide 40)

**Layout convention: rows = ACTUAL class, columns = PREDICTED class** (header "Actual class\Predicted class"). The positive class C₁ comes first.

| Actual \ Predicted | C₁ | ¬C₁ | |
|---|---|---|---|
| **C₁** | **TP** | **FN** | P |
| **¬C₁** | **FP** | **TN** | N |
| | P′ | N′ | All |

- $CM_{i,j}$ = number of tuples of **actual class i** that the classifier labeled **class j**. Correct predictions lie on the diagonal.
- Totals: P = TP + FN (actual positives, row total); N = FP + TN; P′ = TP + FP (predicted positives, column total); N′ = FN + TN.
- The matrix may have extra rows/columns for totals.

**Slide example** (positive = buys_computer = yes):

| Actual \ Predicted | yes | no | Total |
|---|---|---|---|
| yes | **6954** (TP) | **46** (FN) | 7000 (P) |
| no | **412** (FP) | **2588** (TN) | 3000 (N) |
| Total | 7366 (P′) | 2634 (N′) | 10000 |

## 9. Evaluation metrics (slides 41-42), applied to the example

| Metric | Formula | Example (verified) |
|---|---|---|
| **Accuracy** (recognition rate) | $(TP+TN)/All$ | (6954 + 2588) / 10000 = **0.9542 (95.42%)** |
| **Error rate** | $1-\text{acc} = (FP+FN)/All$ | (412 + 46) / 10000 = **0.0458 (4.58%)** |
| **Sensitivity** (true-positive recognition rate) | $TP/P$ | 6954 / 7000 = **0.9934 (99.34%)** |
| **Specificity** (true-negative recognition rate) | $TN/N$ | 2588 / 3000 = **0.8627 (86.27%)** |
| **Precision** (exactness: % of tuples labeled positive that really are positive) | $TP/(TP+FP)$ | 6954 / 7366 = **0.9441 (94.41%)** |
| **Recall** (completeness: % of positives labeled positive) | $TP/(TP+FN)$ (= sensitivity) | **0.9934** |
| **F-measure** (F₁, F-score) = harmonic mean of P and R | $\dfrac{2\cdot prec\cdot rec}{prec+rec}$ | 2(0.9441)(0.9934) / (0.9441 + 0.9934) = **0.9681** |

- Perfect score = **1.0**. There is an **inverse relationship between precision and recall**.
- **Class imbalance problem**: one class is **rare** (e.g. fraud, HIV-positive), so there is a significant majority of the negative class and a minority of the positive class. Accuracy is then dominated by the negatives. Report **sensitivity/specificity** or **precision/recall/F** instead.
- *(textbook context)* In the example, the minority **no** class is recognized at only 86.27% (specificity), well below the 95.42% overall accuracy. The minority class does worse than the headline number suggests.

## 10. Ensemble methods (slides 44-46)

- **Ensemble**: combine *k* learned models $M_1, \dots, M_k$ into an improved composite model **M\***. Each classifier $C_1 \dots C_T$ votes on a new data sample, and the votes are combined into the class prediction.
- **Bagging** averages the predictions over a collection of classifiers (equal weights).
- **Boosting** takes a **weighted vote** over a collection of classifiers. The slides give only this one line.

**Bagging = Bootstrap AGGregatING**
- Analogy: a diagnosis decided by the **majority vote of several doctors**.
- *Training*: at each iteration *i*, sample a training set $D_i$ of *d* tuples from D (|D| = d) **with replacement**; this is a **bootstrap** sample. Learn a model $M_i$ on each $D_i$.
- *Classification*: each $M_i$ votes, and M\* assigns the class with the **most votes**.
- *Prediction* (continuous target): **average** the individual predictions.
- *Accuracy*: often **significantly better than a single classifier** built from D. On noisy data it is not considerably worse and is **more robust**. Improved accuracy in prediction has been proved.

**Algorithm: Bagging (slide 46)**
- Input: D (d training tuples), k (number of models), and a learning scheme (decision tree, naïve Bayes, …).
- Output: the composite model M\*. Each model gives an **equally weighted** prediction.
```
for i = 1 to k do                    // create k models
    create bootstrap sample Di by sampling D with replacement
    use Di and the learning scheme to derive model Mi
endfor
```
- To classify X: each $M_i$ votes, and the majority wins.

---

## Exam focus

**Likely asks**
- Compute Info(D), Info_A(D), and Gain for every attribute (possibly with the log table), then pick the split. Possibly the next level too.
- Draw the resulting tree.
- State the 3 stopping conditions.
- Fill in or interpret a confusion matrix, then compute accuracy / error / sensitivity / specificity / precision / recall / F.
- Explain class imbalance.
- Compare holdout vs k-fold CV.
- Describe bagging (bootstrap + majority vote) vs boosting (weighted vote).

**Tiny example 1 — information gain.** 8 tuples, 4 yes / 4 no. Attribute A has a₁ = 3 yes, 1 no and a₂ = 1 yes, 3 no. Attribute B has b₁ = 2/2 and b₂ = 2/2.
- Info(D) = 1.000.
- Info(3,1) = ¾(log₂4 − log₂3) + ¼(log₂4 − log₂1) = 0.311 + 0.5 = **0.811**. With the table: 0.75(2 − 1.6) + 0.25(2) = 0.80.
- Info_A = (4/8)(0.811) + (4/8)(0.811) = 0.811, so **Gain(A) = 0.189** (table: 0.20).
- Info_B = 1, so **Gain(B) = 0**. **Split on A.**
- Values worth memorizing: Info(1,1) = 1, Info(2,3) = 0.971, Info(3,1) = 0.811, Info(4,2) = 0.918, Info(9,5) = 0.940, pure node = 0.

**Tiny example 2 — confusion matrix with imbalance.** 1000 tuples, 10 positive. TP = 8, FN = 2, FP = 40, TN = 950.
- Accuracy = 958/1000 = **0.958**; error rate = **0.042**.
- Recall/sensitivity = 8/10 = **0.80**; specificity = 950/990 = **0.960**.
- Precision = 8/48 = **0.167**; F₁ = 2(0.167)(0.8) / (0.967) = **0.276**.
- Accuracy looks great, but only 1 in 6 positive alarms is real.

**Why accuracy misleads.** A classifier that always says "negative" on the same 1000 tuples scores **99% accuracy**, yet has **sensitivity = 0**, recall = 0 and F₁ = 0, and finds no frauds. With rare classes, use sensitivity, specificity, precision, recall and F.

**Traps**
- Check the layout: rows = actual. FN is in the **actual-positive row**, FP in the **actual-negative row**.
- Recall = sensitivity = TP/P, where P is the **actual** positives (row total). Precision divides by P′, the **predicted** positives (column total).
- Error rate = 1 − accuracy.
- An empty partition gets a leaf with the **parent's** majority class.
- Gain is computed **after** splitting; the attribute with the **highest** gain wins.
