# Week 3.2: Naive Bayes and K Nearest Neighbor

What this lecture is about: two simple supervised classifiers. Naive Bayes applies Bayes theorem with a feature-independence assumption (worked "shopping" example from count tables). KNN is a lazy, distance-based method that labels a new point by majority vote of its k nearest training points (worked Iris example).

Source: `3.2. Naive Bayes and KNN.pdf`, 57 slides. Slides 56-57 are just "?" and "Thank you". Verification script: `/home/claude/work/agents/w3l2/verify.py`.

## 1. Where the two algorithms fit (slides 1-3, 10-12, 32)

- Slide 2 "Machine Learning Algorithms" shows the two parts of the lecture: Naive Bayes (what it is, its place in ML, the classifier, advantages, implementation) and KNN (intro, distance measures, how it works, choosing k, why KNN, implementation).
- Slide 11 hierarchy: Machine Learning → Supervised Learning → **Classification** → Naive Bayes Classifier (Regression and Unsupervised Learning are the other branches). Supervised vs unsupervised: see `02_Week1_IntroML_LinearRegression.md`.
- KNN does **both** classification (majority vote) and regression (average) (slide 39).

## 2. Probability basics and Bayes theorem (slides 4-9)

- Two-coin toss, sample space $\{HH, HT, TH, TT\}$ (slide 5). Values on slide 6 (all verified):

| Event | P |
|---|---|
| two heads | 1/4 |
| at least one tail | 3/4 |
| 2nd coin head, given 1st coin tail | 1/2 |
| two heads, given 1st coin head | 1/2 |

- **Bayes theorem** (slide 7), professor's form:
$$P(A\mid B)=\frac{P(B\mid A)\,P(A)}{P(B)}$$
  $P(A\mid B)$ = conditional probability of A given B; $P(B\mid A)$ = of B given A; $P(A)$, $P(B)$ = probabilities of the events.
- Coin application (slides 8-9): A = second coin is head, B = first coin is tail ("we reversed it because we want to know what the second event is going to be"):
$$P(A\mid B)=\frac{P(\text{1st tail}\mid\text{2nd head})\cdot P(\text{2nd head})}{P(\text{1st tail})}=\frac{0.5\cdot 0.5}{0.5}=0.5\ \checkmark$$
- Definition on slide 9: Bayes theorem computes the probability of an event from prior knowledge of conditions that might be related to it.

## 3. Naive Bayes classifier: the naive assumption (slides 16, 23-24, 28)

- Mapping used throughout: **A = the class** (Buy / No Buy), **B = the features** (Day, Discount, Free Delivery) (slide 16).
- "Naive" = features are assumed **independent given the class** (slide 28 lists this as the main disadvantage). So the joint likelihood factorises:
$$P(B\mid A)=P(x_1\mid A)\,P(x_2\mid A)\cdots P(x_n\mid A)$$
- Professor's posterior (slides 23-24) also writes the denominator as a product of single-feature marginals:
$$P(A\mid x_1,\dots,x_n)=\frac{P(x_1\mid A)\cdots P(x_n\mid A)\,P(A)}{P(x_1)\cdots P(x_n)}$$
- Then he **normalises** the class scores so they sum to 1 (slide 25). Decision: pick the class with the larger normalised value.
- (textbook context) The denominator is the same for every class, so it can be dropped: $\hat{y}=\arg\max_c P(c)\prod_i P(x_i\mid c)$. The slide code (section 10) does exactly this.

## 4. Shopping example: data and frequency tables (slides 13-16)

Problem (slide 13): predict whether a person buys given Day ∈ {Weekday, Weekend, Holiday}, Discount ∈ {Yes, No}, Free Delivery ∈ {Yes, No}.

Dataset (slide 14, 15 rows; re-read at high zoom):

| # | Day | Discount | Free Delivery | Purchase |
|---|---|---|---|---|
| 1 | Weekday | Yes | Yes | Yes |
| 2 | Weekday | Yes | Yes | Yes |
| 3 | Weekday | No | No | No |
| 4 | Holiday | Yes | Yes | Yes |
| 5 | Weekend | Yes | Yes | Yes |
| 6 | Holiday | No | Yes | No |
| 7 | Weekend | Yes | No | No |
| 8 | Weekday | Yes | Yes | Yes |
| 9 | Weekend | Yes | Yes | No |
| 10 | Holiday | Yes | Yes | Yes |
| 11 | Holiday | No | Yes | Yes |
| 12 | Holiday | No | No | No |
| 13 | Weekend | Yes | Yes | Yes |
| 14 | Holiday | Yes | Yes | Yes |
| 15 | Weekday | No | No | Yes |

Class counts: Buy = Yes 10, No 5. Frequency tables (slide 15), all recounted from the data and correct:

| Feature | Value | Buy Yes | Buy No | Row total |
|---|---|---|---|---|
| Discount | Yes | 8 | 2 | 10 |
| Discount | No | 2 | 3 | 5 |
| Free Delivery | Yes | 9 | 2 | 11 |
| Free Delivery | No | 1 | 3 | 4 |
| Day | Weekday | 4 | 1 | 5 |
| Day | Weekend | 2 | 2 | 4 |
| Day | Holiday | 4 | 2 | 6 |
| | Column total | 10 | 5 | 15 |

## 5. Likelihood tables (slides 17, 21)

Each cell is $P(\text{value}\mid\text{class})$ = cell count / class total. The right column is the marginal $P(\text{value})$ = row total / 15, the bottom row is the prior $P(\text{class})$. The professor writes the fractions **unreduced** (4/10, 1/5, 2/5, ...).

| Feature | Value | $P(\cdot\mid\text{Yes})$ | $P(\cdot\mid\text{No})$ | $P(\text{value})$ |
|---|---|---|---|---|
| Day | Weekday | 4/10 | 1/5 | 5/15 |
| Day | Weekend | 2/10 | 2/5 | 4/15 |
| Day | Holiday | 4/10 | 2/5 | 6/15 |
| Discount | Yes | 8/10 | 2/5 | 10/15 |
| Discount | No | 2/10 | 3/5 | 5/15 |
| Free Delivery | Yes | 9/10 | 2/5 | 11/15 |
| Free Delivery | No | 1/10 | 3/5 | 4/15 |
| Prior | | 10/15 | 5/15 | |

All entries verified.

## 6. One feature: P(No Buy given Weekday) (slides 18-20)

- $P(B)=P(\text{Weekday})=5/15=0.33$; $P(A)=P(\text{No Buy})=5/15=0.33$; $P(B\mid A)=P(\text{Weekday}\mid\text{No Buy})=1/5=0.20$.
$$P(\text{No Buy}\mid\text{Weekday})=\frac{0.2\cdot 0.33}{0.33}=0.20\ \checkmark$$
- Since 0.20 < 0.5 the customer will most likely **buy** on a weekday (slide 20). Exact check: $P(\text{Buy}\mid\text{Weekday})=4/5=0.8$.
- **Slide 19 error.** It says "the probability of purchasing on the weekday = 5/15" and "out of the 30 people who came into the store ... 10 of those purchases were made on weekdays". That is wrong. 5/15 is $P(\text{Weekday})$, the share of all 15 visits that fell on a weekday. There are 15 records, not 30. 4 of the 10 purchases happened on weekdays ($P(\text{Weekday}\mid\text{Buy})=4/10$), and $P(\text{Buy}\mid\text{Weekday})=4/5$. The other line, "no purchase = 5/15 = 33 % regardless of day", is just the prior and is correct.

## 7. Full query: Holiday, Discount Yes, Free Delivery Yes (slides 22-25)

B = (Day = Holiday, Discount = Yes, Free Delivery = Yes). Shared denominator: $\frac{10}{15}\cdot\frac{11}{15}\cdot\frac{6}{15}=\frac{44}{225}=0.1956$.

| Class | Numerator (slide form) | Value | ÷ 0.1956 (slide) | Normalised |
|---|---|---|---|---|
| No Buy (slide 23) | $\frac25\cdot\frac25\cdot\frac25\cdot\frac{5}{15}$ | 0.0213 (exact 8/375) | 0.109 | 0.109/1.09 = **10 %** |
| Buy (slide 24) | $\frac{8}{10}\cdot\frac{9}{10}\cdot\frac{4}{10}\cdot\frac{10}{15}$ | 0.192 (exact 24/125) | 0.982 | 0.982/1.09 = **90 %** |

- Slide 25: sum = 0.982 + 0.109 = 1.09 (more precisely 1.091). Normalised: purchase 90 %, no purchase 10 %. So an average customer **buys** on a holiday with discount and free delivery. All values verified. The exact normalised values are 9/10 and 1/10.
- Why the two "probabilities" add up to 1.09 instead of 1: the product of marginals in the denominator is not the true evidence $P(B)$. Under the naive model the evidence is $0.192+0.0213=0.2133$, which gives 0.9 / 0.1 directly. That is why the normalisation step is needed. Normalising, or dropping the denominator altogether, gives the same decision.
- The slide calls the normalised values the "likelihood of purchase". In standard terms they are posteriors.
- Sanity check: rows 4, 10 and 14 match B exactly, and all three are buys.

## 8. Advantages and disadvantages of Naive Bayes (slides 27-28)

Advantages (slide 27): simple and easy to implement; needs less training data; handles continuous and discrete data; highly scalable with the number of predictors and data points; fast, so suitable for real-time prediction; not sensitive to irrelevant features.

Disadvantages (slide 28):
- **Independence assumption**: rarely true for real data.
- **Zero-frequency problem**: an unseen categorical value gets probability 0 and wipes out the whole product. Fix: **Laplace smoothing**.
- **Poor probability calibration**: use the scores for ranking or classifying, not as true confidence.
- **Imbalanced-data bias**: skews toward the majority class.

## 9. Types of Naive Bayes and Laplace smoothing (textbook context)

The slides name Laplace smoothing only (slide 28) and do not list NB variants.

| Variant (sklearn) | Feature type | $P(x_i\mid c)$ |
|---|---|---|
| Gaussian NB | continuous | $\frac{1}{\sqrt{2\pi\sigma_c^2}}\exp\!\big(-\frac{(x_i-\mu_c)^2}{2\sigma_c^2}\big)$, with per-class mean and variance |
| Multinomial NB | counts (word frequencies, text) | (count of feature $i$ in $c$ + α) / (total count in $c$ + α·V) |
| Bernoulli NB | binary present/absent | $p_{ic}^{x_i}(1-p_{ic})^{1-x_i}$ (absence also counts) |
| Categorical NB | categorical, like the shopping data | count table, as in section 5 |

- Laplace (add-α, α = 1) smoothing for a categorical feature with K possible values:
$$P(x_i=v\mid c)=\frac{\text{count}(v,c)+\alpha}{N_c+\alpha K}$$
- Applied to the slide query (α = 1; K = 3 for Day, 2 for the others): Buy 25/156 = 0.1603, No 9/392 = 0.0230, normalised **87.5 % vs 12.5 %**. The decision is unchanged.

## 10. Naive Bayes implementation (slides 30-31)

- `likelihood(df, feature_name, feature_value, target_name, target_value)`: filter rows of the class, then return count(feature = value) / count(class). It returns 0 if the class is empty.
- `prior(df, target_name, target_value)`: count(class) / len(df).
- `naive_bayes(df, features, target_name, target_value)`: `prob = prior(...)`, then `prob *= likelihood(...)` for each feature. **No division by the evidence.**
- Driver (slide 31): `conditions = {'Day':'Holiday','Discount':'Yes','Free Delivery':'Yes'}`, then `prob_yes`, `prob_no`, `total_prob = prob_yes + prob_no`, normalise, print with `:.2f`, and predict 'Yes' if `prob_yes_normalized > prob_no_normalized`.
- Re-run on the slide data: `prob_yes = 0.192`, `prob_no = 0.02133`, which prints **Purchase 90.00 %, No Purchase 10.00 %** and "The customer will purchase the product." There is no smoothing, so it has the zero-frequency problem.

## 11. KNN: idea and properties (slides 33, 39-41)

- KNN predicts a new (test) point from its **similarity** to known training samples. Assumption: similar data sit close together; distance measures are at its core (slide 33).
- **Non-parametric**: it learns no parameters or discriminative function and just memorises the training set (slide 33).
- **Lazy**: it stores the whole dataset and does no modelling. All the work (distance computation) happens at prediction time (slide 41).
- Algorithm (slide 39 plus the 3-step example):
  1. Choose k and a distance function.
  2. Compute the distance from the new point to **every** training point.
  3. Rank the distances and take the k closest ("k-neighbors").
  4. Classification: the **most frequent** label among the k. Regression: the **average** of their values.
- Slide 40: the Wikimedia animation of the decision surface with k = 3.

## 12. Distance measures (slides 35-37)

| Metric | Formula (slide form) | When to use (slide) |
|---|---|---|
| Euclidean (slide 35) | $d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$ | shortest straight line (Pythagoras); continuous features (height, weight, salary); the "default" for KNN |
| Manhattan (slide 36) | $d(x,y)=\sum_{i=1}^{m}\lvert x_i-y_i\rvert$ | grid-like path; features that are whole integers |
| Minkowski (slide 37) | $\Big(\sum_{i=1}^{n}\lvert x_i-y_i\rvert^{p}\Big)^{1/p}$ | generalisation: p = 1 gives Manhattan, p = 2 gives Euclidean |

## 13. KNN worked example: Iris (slides 42-44)

Query (5.2, 3.1). Distance written as $D(\text{Sepal Length},\text{Sepal Width})=\sqrt{(x-a)^2+(y-b)^2}$, e.g. $\sqrt{(5.2-5.3)^2+(3.1-3.7)^2}=0.608$.

| Sepal L | Sepal W | Species | Distance (slide) | Exact | Rank |
|---|---|---|---|---|---|
| 5.3 | 3.7 | Setosa | 0.608 | 0.6083 | 3 |
| 5.1 | 3.8 | Setosa | 0.707 | 0.7071 | 5 |
| 7.2 | 3.0 | Virginica | 2.002 | 2.0025 | 10 |
| 5.4 | 3.4 | Setosa | 0.36 | 0.3606 | 2 |
| 5.1 | 3.3 | Setosa | 0.22 | 0.2236 | 1 |
| 5.4 | 3.9 | Setosa | 0.82 | 0.8246 | 6 |
| 7.4 | 2.8 | Virginica | 2.22 | 2.2204 | 12 |
| 6.1 | 2.8 | Versicolor | 0.94 | 0.9487 | 8 |
| 7.3 | 2.9 | Virginica | 2.1 | 2.1095 | 11 |
| 6.0 | 2.7 | Versicolor | 0.89 | 0.8944 | 7 |
| 5.8 | 2.8 | Virginica | 0.67 | 0.6708 | 4 |
| 6.3 | 2.3 | Versicolor | 1.36 | 1.3601 | 9 |

- Steps on the slides: 1. find distances, 2. find rank (1 = closest), 3. find nearest neighbours.
- With **k = 3**, ranks 1-3 are all Setosa, so the prediction is **Setosa** ✓ (slide 44).
- Small slide slips: 0.9487 is written 0.94 (rounds to 0.95), and 2.1095 is written 2.1 (rounds to 2.11). The ranks are unaffected. The slides spell it "Vercicolor" (correct: Versicolor) and "Distence".
- Extra checks: k = 5 gives Setosa 4 : Virginica 1. With k = 12 = N the prediction is the majority class of the whole dataset, Setosa (5 vs 4 vs 3) (slide 46). Manhattan distance also gives Setosa for k = 3.

## 14. Choosing k (slides 46-49)

- k = the number of neighbours examined. It ranges from 1 (only the closest point) to N (always predicts the dataset's majority class) (slide 46).
- Slide 47 figure: star query. **k = 3** gives 2 purple vs 1 yellow, so **class B**. **k = 6** gives 4 yellow vs 2 purple, so **class A**. The prediction depends on k.
- How to pick k (slide 48): split into train and test sets, try different k, and measure the error. Choose the **"elbow point"**, where increasing k barely lowers the error but decreasing k raises it sharply.
- Slide 49 plot "Error Rate vs. K Value" (k = 1..39): the error drops from about 0.29 at k = 1 to about 0.18 at k = 5, then stays almost constant, so **k = 5** is chosen.
- Small k overfits; large k smooths the prediction (slide 53).

## 15. Ties and feature scaling (textbook context)

The slides do not cover ties or scaling explicitly.

- **Vote ties**: use an odd k for 2 classes, use distance-weighted voting, or fall back to the nearest neighbour or k−1. The slide code uses `np.bincount(labels).argmax()`, which breaks ties toward the **lowest class index** (e.g. labels [2,0,2,0] → 0).
- **Distance ties**: in the Iris data under Manhattan distance, (6.1, 2.8) and (6.0, 2.7) are both at 1.2. `np.argsort` then picks by array order.
- **Scaling**: distances are dominated by large-range features, so scale before KNN (min-max or z-score; see `09_Week5_DataPreparation.md`). Example in the Exam focus. NB does not need scaling.

## 16. KNN pros and cons (slides 51-53)

- Advantages (slide 51): **Simple** (often the first classifier people learn); **Adaptable** (new training samples are used immediately); **Easily programmable** (only k and a distance metric to set).
- Limitations (slides 52-53):
  - **Difficult to scale**: memory and storage hungry and computationally intensive, since every prediction scans all the data.
  - **Curse of dimensionality**: with more dimensions, distances to "similar" points grow, so accuracy drops.
  - **Overfitting**: low k overfits; high k smooths.

## 17. KNN implementation (slide 55)

- `class KNN`: `__init__(k=3)`; `fit` only **stores** `X_train`, `y_train` (lazy); `euclidean_distance` returns `np.sqrt(np.sum((x1 - x2) ** 2))`.
- `_predict(x)`: computes distances to every training point, `k_indices = np.argsort(distances)[:self.k]`, collects the neighbour labels, and returns `np.bincount(k_nearest_labels).argmax()`. Labels must be non-negative integers.
- Usage: `knn = KNN(k=3)`, `fit`, `predict(X_test)`, then `accuracy_score` and `confusion_matrix` (metrics in `05_Week3_EvaluatingLearningAlgorithms.md`). The dataset is not shown. Re-run on the Iris table it predicts Setosa.

## Exam focus

1. **State Bayes theorem and the naive assumption.** $P(A\mid B)=P(B\mid A)P(A)/P(B)$, with A = class and B = features; $P(B\mid A)=\prod_i P(x_i\mid A)$.
2. **Build a likelihood table from counts.** For example $P(\text{FD}=\text{Yes}\mid\text{No})=2/5$ and $P(\text{FD}=\text{Yes})=11/15$. Remember the No column divides by 5, not 15.
3. **New query, professor's method: Weekday, Discount No, Free Delivery No.** Denominator $\frac{5}{15}\cdot\frac{5}{15}\cdot\frac{4}{15}=0.02963$.
   - Buy: $\frac{4}{10}\cdot\frac{2}{10}\cdot\frac{1}{10}\cdot\frac{10}{15}=0.00533$, which is 0.18 after dividing.
   - No: $\frac15\cdot\frac35\cdot\frac35\cdot\frac{5}{15}=0.024$, which is 0.81 after dividing.
   - Sum 0.99, so normalised **Buy 18.2 %, No 81.8 %**: predict **No Buy**.
4. **Normalised P(Buy) for all 12 combinations** (useful for spotting answers; NB scores from section 5):

| Day | Disc Yes, FD Yes | Disc Yes, FD No | Disc No, FD Yes | Disc No, FD No |
|---|---|---|---|---|
| Weekday | 0.947 | 0.571 | 0.750 | 0.182 |
| Weekend | 0.818 | 0.250 | 0.429 | 0.053 |
| Holiday | 0.900 | 0.400 | 0.600 | 0.100 |

5. **Zero frequency and Laplace.** 4 spam and 6 ham emails; "free" appears in 3 spam and 0 ham.
   - Without smoothing: $P(\text{free}\mid\text{ham})=0$, so P(spam | free) = 1.0.
   - With α = 1 (K = 2): spam $\frac{4}{6}\cdot\frac{4}{10}=0.2667$; ham $\frac{1}{8}\cdot\frac{6}{10}=0.075$; so P(spam | free) = **0.780**.
6. **Distances between (1, 2) and (4, 6).** Manhattan 3 + 4 = **7**; Euclidean $\sqrt{9+16}=$ **5**; Minkowski p = 3: $(27+64)^{1/3}=91^{1/3}=$ **4.498**. Ordering: Manhattan ≥ Minkowski(p = 3) ≥ Euclidean.
7. **KNN classification by hand.** Use the Iris table: rank the distances and take the top k. For k = 3 the answer is Setosa (3 : 0); for k = 5, Setosa 4 : Virginica 1.
8. **KNN regression.** Training points (x, y): (1, 10), (2, 12), (4, 15), (7, 30), (9, 33). For x = 3 and k = 3 the neighbours are x = 2, 4, 1, so ŷ = (12 + 15 + 10)/3 = **12.33**.
9. **Why scale.** A = (age 25, salary 50000), B = (45, 51000), C = (26, 60000).
   - Raw Euclidean: d(A,B) = 1000.2 and d(A,C) = 10000, so B is nearest (salary dominates).
   - After min-max scaling (age 20-60, salary 40k-80k): d(A,B) = 0.5006 and d(A,C) = 0.2512, so **C is nearest**.
10. **Concept one-liners.**
    - Why "naive": conditional independence of the features.
    - Why normalise: the two scores do not sum to 1.
    - Why KNN is "lazy" and "non-parametric": no training phase and no learned parameters.
    - Effect of k: small k overfits, large k smooths; k = N gives the majority class.
    - Choose k by the elbow of the test error (k = 5 on slide 49).
    - Minkowski: p = 1 is Manhattan, p = 2 is Euclidean.
