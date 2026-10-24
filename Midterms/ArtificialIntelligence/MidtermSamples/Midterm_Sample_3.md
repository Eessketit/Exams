# Artificial Intelligence: Midterm Sample 3

Weeks 2-6, lectures 2.1-6.2 (not W1, W7) · Part I: 10 multiple choice × 0.5 = 5 pts · Part II: 3 open questions + 3 problem-solving questions (Q6 is a decision tree) · Answer and explanation under each question

Each answer has a **Source** line with the slide pages (L4.1 p.32 = lecture 4.1 slides, page 32) and a **Notes** link to the notes section that explains it.

## Part I: Multiple choice (10 × 0.5 = 5 pts)

**1.** `PolynomialFeatures(degree=3)` is applied to a single input x = 2. Which feature vector does it produce?  
a) [2, 4, 6]  
b) [1, 2, 3]  
c) [2, 4, 8]  
d) [1, 2, 4, 8]

> **Answer: d)** PolynomialFeatures builds [1, x, x², x³] = [1, 2, 4, 8]. The 1 is the bias column. A standard linear regression is then trained on these columns, which is why polynomial regression is still linear in the weights.  
> **Source:** L2.1 p.46 construct x², x³ from x · L2.1 p.47 PolynomialFeatures and make_pipeline  
> **Notes:** [L2.1 › Polynomial regression](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#9-polynomial-regression-slides-45-47)  
> **Visual:** [Sample 3 › Part 1 Q1](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc1)

**2.** A one-vs-all logistic regression is used for a problem with 4 classes. How does it work?  
a) It trains 4 binary classifiers, each class against all the others, and predicts the class with the largest hθ⁽ⁱ⁾(x)  
b) It trains 1 classifier whose output is rounded to 1, 2, 3 or 4  
c) It trains 6 classifiers, one per pair of classes, and takes a vote  
d) It trains 3 classifiers and predicts the class with the smallest hθ⁽ⁱ⁾(x)

> **Answer: a)** For each class i, treat class i as positive and all the others as negative and train hθ⁽ⁱ⁾(x) = P(y = i | x; θ). On a new input, "pick the class i that maximizes" hθ⁽ⁱ⁾(x). K classes need K classifiers. c describes one-vs-one, which is not in the lecture.  
> **Source:** L2.2 p.33-34 multiclass examples · L2.2 p.35 one-vs-all · L2.2 p.36 pick the class with max hθ⁽ⁱ⁾(x)  
> **Notes:** [L2.2 › Multiclass classification: one vs all](../notes/04_Week2_LogisticRegression.md#10-multiclass-classification-one-vs-all-slides-33-38)  
> **Visual:** [Sample 3 › Part 1 Q2](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc2)

**3.** A regression model makes errors of 1, 1, 1, 1 and 6 on five test examples. What is the MSE?  
a) 2  
b) 8  
c) 2.83  
d) 40

> **Answer: b)** MSE = (1 + 1 + 1 + 1 + 36)/5 = 40/5 = 8. MAE = (1 + 1 + 1 + 1 + 6)/5 = 2 and RMSE = √8 = 2.83. The single large error contributes 36 of the 40, which shows that MSE is sensitive to large errors while MAE is less so.  
> **Source:** L3.1 p.10 MSE, sensitive to large errors · L3.1 p.11 RMSE · L3.1 p.12 MAE, less sensitive to large errors  
> **Notes:** [L3.1 › Regression metrics: MSE, RMSE, MAE](../notes/05_Week3_EvaluatingLearningAlgorithms.md#4-regression-metrics-mse-rmse-mae-slides-10-12)  
> **Visual:** [Sample 3 › Part 1 Q3](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc3)

**4.** Why is KNN called a "lazy" learner?  
a) It needs only a few training examples  
b) It always uses k = 1  
c) It stores the whole training set and does no modelling; all the distance computation happens at prediction time  
d) It learns its weights slowly with a small learning rate

> **Answer: c)** KNN has no training phase: `fit` only stores X_train and y_train. Every prediction computes the distance to all training points. It is also non-parametric: it learns no parameters. That is why it is hard to scale to big data.  
> **Source:** L3.2 p.33 non-parametric, memorizes the training set · L3.2 p.41 lazy learner · L3.2 p.52 difficult to scale · L3.2 p.55 fit only stores the data  
> **Notes:** [L3.2 › KNN: idea and properties](../notes/06_Week3_NaiveBayes_KNN.md#11-knn-idea-and-properties-slides-33-39-41)  
> **Visual:** [Sample 3 › Part 1 Q4](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc4)

**5.** A node with 6 Yes and 4 No (entropy 0.971) is split into two children: 4 Yes / 0 No and 2 Yes / 4 No (entropy 0.918). What is the information gain of this split?  
a) 0.420  
b) 0.551  
c) 0.971  
d) 0.053

> **Answer: a)** Weight each child by its share of the rows: E_children = (4/10)·0 + (6/10)·0.918 = 0.551. IG = 0.971 − 0.551 = 0.420. 0.551 is the weighted child entropy, and 0.053 = 0.971 − 0.918 forgets the weights.  
> **Source:** L4.1 p.22 entropy · L4.1 p.29 IG = E(Y) − E(Y | X) · L4.1 p.31 weighted sum Σ |Sᵥ|/|S| · Entropy(Sᵥ)  
> **Notes:** [L4.1 › Information gain](../notes/07_Week4_DecisionTree.md#6-information-gain-slides-29-31)  
> **Visual:** [Sample 3 › Part 1 Q5](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc5)

**6.** A linear SVM has the weight vector w = (3, 4). What is the width d of its margin (the distance between the lines w·x + b = 1 and w·x + b = −1)?  
a) 0.2  
b) 0.4  
c) 2.5  
d) 5

> **Answer: b)** d = 2/‖w‖ and ‖w‖ = √(9 + 16) = 5, so d = 2/5 = 0.4. 0.2 = 1/‖w‖ is the distance from the hyperplane to one margin line. A smaller ‖w‖ means a wider margin, which is why SVM minimizes ½‖w‖².  
> **Source:** L4.2 p.26 margin lines w·x + b = ±1 · L4.2 p.31-35 derivation of d = 2/‖w‖ · L4.2 p.36 maximize 2/‖w‖  
> **Notes:** [L4.2 › Hard margin: constraints and margin 2 over norm w](../notes/08_Week4_SVM.md#8-hard-margin-constraints-and-margin-2-over-norm-w-slides-27-37)  
> **Visual:** [Sample 3 › Part 1 Q6](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc6)

**7.** A dataset has a nominal feature City ∈ {Tashkent, Samarkand, Bukhara} with no natural order. Which encoding should be used for a linear model?  
a) Label encoding (0, 1, 2)  
b) Drop the column  
c) Min-max scaling of the city names  
d) One-hot encoding (one 0/1 column per city)

> **Answer: d)** One-hot encoding is best for nominal categories with a manageable number of values. Label encoding is for ordinal categories (small < medium < large); on nominal data it "invents a false numeric relationship" (Bukhara = 2 > Tashkent = 0).  
> **Source:** L5.2 p.21 label vs one-hot encoding · L5.2 p.22 target encoding and embeddings · L5.2 p.36 label-encoding unordered categories is a common mistake  
> **Notes:** [L5.2 › Categorical encoding](../notes/09_Week5_DataPreparation.md#8-categorical-encoding-slides-21-22)  
> **Visual:** [Sample 3 › Part 1 Q7](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc7)

**8.** How should a StandardScaler be used with a train/test split?  
a) Fit it on the whole dataset, then split  
b) Fit it separately on the training set and on the test set  
c) Fit it on the training set only, then transform both the training and the test set with the training mean and std  
d) Fit it on the test set only, so that the test values are exactly standardized

> **Answer: c)** "Fit the scaler only on training data"; the test set is only transformed. Fitting on the whole data or on the test set lets test information leak into training (data leakage): the metrics look great, but the model fails in production.  
> **Source:** L5.2 p.18-19 fit only on training data · L5.2 p.34 split, fit on train, transform test · L5.2 p.36 fitting a scaler on test data is a common mistake  
> **Notes:** [L5.2 › Feature scaling](../notes/09_Week5_DataPreparation.md#7-feature-scaling-slides-18-20) · [L5.2 › Splitting and data leakage](../notes/09_Week5_DataPreparation.md#13-splitting-and-data-leakage-slides-34-36)  
> **Visual:** [Sample 3 › Part 1 Q8](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc8)

**9.** K-Means is run for K = 1 to 6, giving inertia (SSE) values 1000, 400, 150, 120, 100, 90. Using the elbow method, which K should be chosen?  
a) 3  
b) 1  
c) 6  
d) 2

> **Answer: a)** The drops are 600, 250, 30, 20, 10. After K = 3 adding clusters barely lowers the inertia, so the curve bends at K = 3. K = 6 has the lowest inertia, but inertia always falls as K grows, so the lowest value is not the goal.  
> **Source:** L6.1 p.17 elbow method · L6.1 p.28 elbow curve: K on the x-axis, metric on the y-axis · L6.1 p.29-30 inertia curve, elbow circled  
> **Notes:** [L6.1 › Choosing the right K: the elbow curve](../notes/10_Week6_KMeans_Clustering.md#8-choosing-the-right-k-the-elbow-curve-slides-28-30)  
> **Visual:** [Sample 3 › Part 1 Q9](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc9)

**10.** A dataset has 10 variables. How many principal components does PCA produce, and how is the information distributed among them?  
a) 2, and they share the information equally  
b) 5, one for every pair of variables  
c) 10, and they share the information equally  
d) 10, with the maximum possible information in the first component, then the maximum remaining in the second, and so on

> **Answer: d)** "10-dimensional data gives you 10 principal components, but PCA tries to put maximum possible information in the first component, then maximum remaining information in the second and so on." Reducing the dimension means keeping only the first few.  
> **Source:** L6.2 p.6 10 dimensions give 10 components · L6.2 p.7 explained-variance plot · L6.2 p.12 p components for p variables  
> **Notes:** [L6.2 › Principal components](../notes/11_Week6_PCA.md#2-principal-components-slides-6-7)  
> **Visual:** [Sample 3 › Part 1 Q10](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-mc10)

## Part II: Open questions and problem solving

### Q1. Gradient descent, the normal equation and polynomial regression (open)

(a) Write the vectorized gradient descent update and the normal equation for multivariate linear regression.

(b) Compare the two methods (the four points of the comparison table).

(c) How can linear regression fit a curved relationship? Why is polynomial regression still a linear model, and what is its main hyperparameter?

**Answer**

**Source:** L2.1 p.3 two approaches · L2.1 p.7 loss J(θ) · L2.1 p.20 vectorized update · L2.1 p.33-41 normal equation · L2.1 p.42 comparison table · L2.1 p.45-47 polynomial regression  
**Notes:** [L2.1 › Loss and the vectorised gradient descent update](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#3-loss-and-the-vectorised-gradient-descent-update-slides-7-20-22) · [L2.1 › Normal equation](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#7-normal-equation-slides-33-41-43) · [L2.1 › Gradient descent vs normal equation](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#8-gradient-descent-vs-normal-equation-slide-42) · [L2.1 › Polynomial regression](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#9-polynomial-regression-slides-45-47)  
**Visual:** [Sample 3 › Part 2 Q1 Polynomial regression](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-w1)

**(a)**
- Loss: J(θ) = (1/2m) Σ (hθ(x⁽ⁱ⁾) − y⁽ⁱ⁾)², with h = Xθ and x₀ = 1 for every example.
- Gradient descent (repeat): **θ := θ − α · (1/m) · Xᵀ(Xθ − y)**. All θⱼ are updated simultaneously.
- Normal equation (one step): **θ = (XᵀX)⁻¹ · Xᵀy**.

**(b)**

| Gradient descent | Normal equation |
|---|---|
| Need to choose the learning rate α | No need to choose α |
| Needs many iterations | No iterations |
| Works well even when the number of features is very large | Very slow when the number of features is very large |
| | Needs to compute (XᵀX)⁻¹ |

- Rule of thumb: few features (n = 3): normal equation, exact and fast. Very many features (n = 10⁶): gradient descent. (Inverting an (n + 1) × (n + 1) matrix costs about n³ operations, textbook context.)

**(c)**
- On curved data a straight line y = ax + b underfits. **Construct new features** from x (x², x³, ...) and train a standard linear regression on them: h = w₁x + w₂x² + w₃x³ + b.
- The model is still **linear in the parameters w**. "Polynomial" refers only to the shape of the features, so the gradient descent update and the normal equation work unchanged with X columns [1, x, x², x³].
- In code: `make_pipeline(PolynomialFeatures(degree=2), LinearRegression())`. The main hyperparameter is the **degree**: too low underfits, too high overfits.

---

### Q2. Naive Bayes classifier (open)

(a) State Bayes theorem and explain each term. In the classifier, what are A and B?

(b) What is the "naive" assumption, and how does it change the formula for P(class | x₁, ..., xₙ)? How is the class decided?

(c) Give three advantages and three disadvantages of Naive Bayes.

**Answer**

**Source:** L3.2 p.7 Bayes theorem · L3.2 p.9 definition · L3.2 p.16 A = class, B = features · L3.2 p.23-25 posterior and normalization · L3.2 p.27 advantages · L3.2 p.28 disadvantages  
**Notes:** [L3.2 › Probability basics and Bayes theorem](../notes/06_Week3_NaiveBayes_KNN.md#2-probability-basics-and-bayes-theorem-slides-4-9) · [L3.2 › Naive Bayes classifier: the naive assumption](../notes/06_Week3_NaiveBayes_KNN.md#3-naive-bayes-classifier-the-naive-assumption-slides-16-23-24-28) · [L3.2 › Advantages and disadvantages of Naive Bayes](../notes/06_Week3_NaiveBayes_KNN.md#8-advantages-and-disadvantages-of-naive-bayes-slides-27-28)  
**Visual:** [Sample 3 › Part 2 Q2 Naive Bayes](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-w2)

**(a)**

$$P(A\mid B)=\frac{P(B\mid A)\,P(A)}{P(B)}$$

- P(A | B): probability of A given B (the posterior). P(B | A): probability of B given A (the likelihood). P(A), P(B): the probabilities of the events (prior and evidence).
- Bayes theorem gives the probability of an event from prior knowledge of conditions related to it.
- In the classifier: **A = the class** (Buy / No Buy), **B = the features** (Day, Discount, Free Delivery).

**(b)**
- Naive assumption: the features are **independent of each other given the class**. So P(x₁, ..., xₙ | A) = P(x₁ | A) · P(x₂ | A) · ... · P(xₙ | A).
- Posterior (lecture form): P(A | x₁, ..., xₙ) = P(x₁ | A) ⋯ P(xₙ | A) · P(A) / (P(x₁) ⋯ P(xₙ)).
- Compute it for every class, **normalize** the values so they add up to 1, and pick the class with the larger value. The denominator is the same for every class, so the decision is the same as argmax P(A) Π P(xᵢ | A).

**(c)**

| Advantages (slide 27) | Disadvantages (slide 28) |
|---|---|
| Simple and easy to implement | Independence assumption: rarely true for real data |
| Needs less training data | Zero-frequency problem: an unseen value gets probability 0 and wipes out the product; fix with Laplace smoothing |
| Handles continuous and discrete data | Poor probability calibration: use the scores to rank, not as true confidence |
| Highly scalable; fast, so good for real-time prediction | Biased toward the majority class on imbalanced data |
| Not sensitive to irrelevant features | |

---

### Q3. Missing values and outliers (open)

(a) Name and explain the three mechanisms of missing data, with an example of each.

(b) List the methods for handling missing values and when each is used.

(c) Explain the IQR rule and the Z-score rule for detecting outliers. Apply both to the data 2, 4, 4, 5, 6, 7, 8, 8, 30 (Q1 = 4, Q3 = 8, μ = 8.22, σ = 7.93).

**Answer**

**Source:** L5.2 p.9 six problems of raw data · L5.2 p.10 MCAR, MAR, MNAR · L5.2 p.11 handling methods · L5.2 p.13 IQR rule · L5.2 p.14 Z-score rule · L5.2 p.15 ML-based detectors · L5.2 p.36 dropping every row with a NaN is a mistake  
**Notes:** [L5.2 › Missing values](../notes/09_Week5_DataPreparation.md#3-missing-values-slides-10-11) · [L5.2 › Outliers: IQR, Z score, ML detectors](../notes/09_Week5_DataPreparation.md#5-outliers-iqr-z-score-ml-detectors-slides-13-15)  
**Visual:** [Sample 3 › Part 2 Q3 Missing values, outliers](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-w3)

**(a)**

| Mechanism | Meaning | Slide example |
|---|---|---|
| **MCAR**, Missing Completely At Random | not related to any variable | a sensor briefly went offline |
| **MAR**, Missing At Random | related to other observed variables | older respondents skip income questions |
| **MNAR**, Missing Not At Random | depends on the missing value itself (hardest) | high earners hide their income |

**(b)**

| Method | Code | Use |
|---|---|---|
| Drop | `dropna()` | remove the row or the column (e.g. a column that is mostly empty) |
| Mean / Median | `mean()` / `median()` | numeric columns |
| Mode | `mode()` | categorical columns |
| KNN Imputer | `KNNImputer` | fill from the nearest neighbours |
| Iterative Imputer | `IterativeImputer` (MICE) | predict each missing value from the other columns |

- Diagnose the mechanism first. Dropping every row with a missing value is a common mistake.

**(c)**
- **IQR rule** ("robust, distribution-free"): IQR = Q3 − Q1, lower bound = Q1 − 1.5·IQR, upper bound = Q3 + 1.5·IQR. Values outside the bounds are outliers.
  - Here IQR = 8 − 4 = 4, bounds = [4 − 6, 8 + 6] = **[−2, 14]**, so **30 is an outlier**.
- **Z-score rule**: z = (x − μ)/σ, and |z| > 3 is an outlier. It assumes roughly normal data.
  - Here z(30) = (30 − 8.22)/7.93 = **2.75 < 3**, so 30 is **not flagged**. The outlier itself inflates μ and σ (masking).
- That is why the slide says to "combine with IQR when in doubt". After detection, decide whether to fix, cap or keep the outlier. ML-based detectors: Isolation Forest, Local Outlier Factor, autoencoders.

---

### Q4. Linear regression: gradient descent and normal equation (problem)

Data: x = [1, 2, 4], y = [3, 5, 9]. Model hθ(x) = θ₀ + θ₁x. Start at θ = [0, 0]ᵀ with α = 0.05.

(a) Write X (with x₀) and compute the loss J(θ) = (1/2m) Σ(h − y)² at the start.

(b) Do one gradient descent update and give the new θ.

(c) Compute J at the new θ.

(d) Solve the same problem with the normal equation and predict y for x = 5.

**Answer**

**Source:** L2.1 p.7 loss with 1/2m · L2.1 p.10-11 X with the column of 1s · L2.1 p.19-23 worked first update · L2.1 p.33-41 normal equation · L2.1 p.43 code  
**Notes:** [L2.1 › Loss and the vectorised gradient descent update](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#3-loss-and-the-vectorised-gradient-descent-update-slides-7-20-22) · [L2.1 › Worked example: first update from zero theta](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#4-worked-example-first-update-from-zero-theta-slides-12-23) · [L2.1 › Normal equation](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#7-normal-equation-slides-33-41-43)  
**Visual:** [Sample 3 › Part 2 Q4 Linear regression](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-w4)

**(a)** X = [[1, 1], [1, 2], [1, 4]], y = [3, 5, 9]ᵀ. With θ = 0, h = [0, 0, 0] and h − y = [−3, −5, −9].
- J = (9 + 25 + 81)/(2 × 3) = 115/6 = **19.167**.

**(b)**
- Xᵀ(h − y) = [−3 − 5 − 9, −3 − 10 − 36] = [−17, −49].
- (1/m)Xᵀ(h − y) = [−5.667, −16.333].
- θ = [0, 0] − 0.05 · [−5.667, −16.333] = **[0.2833, 0.8167]**.

**(c)** h = 0.2833 + 0.8167x = [1.100, 1.917, 3.550]; h − y = [−1.900, −3.083, −5.450].
- J = (3.610 + 9.507 + 29.703)/6 = 42.819/6 = **7.137**. The loss fell from 19.167 to 7.137 in one step.

**(d) Normal equation:**
- XᵀX = [[3, 7], [7, 21]] (m, Σx; Σx, Σx²), det = 63 − 49 = 14, (XᵀX)⁻¹ = (1/14)[[21, −7], [−7, 3]].
- Xᵀy = [Σy, Σxy] = [17, 3 + 10 + 36] = [17, 49].
- θ = (1/14)[21·17 − 7·49, −7·17 + 3·49] = (1/14)[14, 28] = **[1, 2]**, so **h = 1 + 2x**. It fits all three points exactly (J = 0).
- Prediction for x = 5: 1 + 2·5 = **11**.
- Gradient descent would reach [1, 2] only after many iterations; the normal equation gets it in one step, with no α.

---

### Q5. K-nearest neighbours (problem)

Eight training points of classes A and B. Query point Q = (3, 3).

| Point | x1 | x2 | Class |
|---|---|---|---|
| P1 | 4 | 0 | A |
| P2 | 3 | 0 | A |
| P3 | 6 | 0 | A |
| P4 | 4 | 4 | A |
| P5 | 3 | 1 | B |
| P6 | 0 | 5 | B |
| P7 | 1 | 5 | B |
| P8 | 7 | 6 | B |

(a) Compute the Euclidean distance from Q to every point and rank them.

(b) Classify Q with k = 1, k = 3 and k = 5.

(c) Repeat the k = 3 classification with the Manhattan distance. Does the answer change?

(d) A test of k gives these error rates: k = 1: 0.30, k = 3: 0.22, k = 5: 0.18, k = 7: 0.17, k = 9: 0.17. Which k should be chosen, and why?

**Answer**

**Source:** L3.2 p.35 Euclidean · L3.2 p.36 Manhattan · L3.2 p.39 KNN steps · L3.2 p.42-44 Iris worked example (distance, rank, nearest neighbours) · L3.2 p.47 the answer depends on k · L3.2 p.48-49 choose k at the elbow of the error rate  
**Notes:** [L3.2 › Distance measures](../notes/06_Week3_NaiveBayes_KNN.md#12-distance-measures-slides-35-37) · [L3.2 › KNN worked example: Iris](../notes/06_Week3_NaiveBayes_KNN.md#13-knn-worked-example-iris-slides-42-44) · [L3.2 › Choosing k](../notes/06_Week3_NaiveBayes_KNN.md#14-choosing-k-slides-46-49)  
**Visual:** [Sample 3 › Part 2 Q5 KNN](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-w5)

**(a)** d = √((x1 − 3)² + (x2 − 3)²):

| Point | Class | Euclidean | Rank | Manhattan |
|---|---|---|---|---|
| P4 (4, 4) | A | √2 = 1.414 | 1 | 2 |
| P5 (3, 1) | B | √4 = 2.000 | 2 | 2 |
| P7 (1, 5) | B | √8 = 2.828 | 3 | 4 |
| P2 (3, 0) | A | √9 = 3.000 | 4 | 3 |
| P1 (4, 0) | A | √10 = 3.162 | 5 | 4 |
| P6 (0, 5) | B | √13 = 3.606 | 6 | 5 |
| P3 (6, 0) | A | √18 = 4.243 | 7 | 6 |
| P8 (7, 6) | B | √25 = 5.000 | 8 | 7 |

**(b)**
- k = 1: nearest is P4 (A), so **A**.
- k = 3: P4 (A), P5 (B), P7 (B): 2 B vs 1 A, so **B**.
- k = 5: add P2 (A) and P1 (A): 3 A vs 2 B, so **A**.
- The prediction depends on k (as in the slide 47 star example).

**(c)** Manhattan |x1 − 3| + |x2 − 3|: the three smallest are P4 (2, A), P5 (2, B) and P2 (3, A). Vote 2 A vs 1 B, so **A**. The answer changes from B to A: P7 is close in a straight line (2.83) but 4 blocks away on the grid, and P2 replaces it.

**(d)** Choose **k = 5**, the elbow point. The error drops quickly from k = 1 to k = 5 (0.30 to 0.18), then almost stops improving (0.17). Very small k overfits; larger k smooths and costs more computation without gaining accuracy.

---

### Q6. Decision tree with ID3 (problem)

Will a customer wait for a table at a restaurant?

| # | Patrons | Hungry | Price | Wait |
|---|---|---|---|---|
| 1 | None | Yes | Cheap | No |
| 2 | None | No | Expensive | No |
| 3 | Some | Yes | Cheap | Yes |
| 4 | Some | No | Expensive | Yes |
| 5 | Some | No | Cheap | Yes |
| 6 | Full | Yes | Cheap | Yes |
| 7 | Full | No | Cheap | No |
| 8 | Full | Yes | Expensive | Yes |
| 9 | Full | No | Expensive | No |
| 10 | None | Yes | Expensive | No |
| 11 | Full | Yes | Cheap | Yes |
| 12 | Some | Yes | Expensive | Yes |

(a) Compute the entropy of the dataset.

(b) Compute the information gain of Patrons, Hungry and Price, and choose the root.

(c) Which branches become leaves right away? Finish the tree.

(d) Predict Wait for {Full, Hungry = No, Cheap} and for {Some, Hungry = No, Expensive}.

**Answer**

**Source:** L4.1 p.15 how the tree is built · L4.1 p.22 entropy · L4.1 p.25-28 pure node = leaf · L4.1 p.29-31 information gain · L4.1 p.32-34 PlayTennis worked example  
**Notes:** [L4.1 › Entropy](../notes/07_Week4_DecisionTree.md#5-entropy-slides-22-24-28) · [L4.1 › Information gain](../notes/07_Week4_DecisionTree.md#6-information-gain-slides-29-31) · [L4.1 › Worked example: PlayTennis tree built with ID3](../notes/07_Week4_DecisionTree.md#7-worked-example-playtennis-tree-built-with-id3-slides-32-34)  
**Visual:** [Sample 3 › Part 2 Q6 ID3](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s3-w6)

**(a)** 7 Yes, 5 No: E(S) = −(7/12) log₂(7/12) − (5/12) log₂(5/12) = **0.980**.

**(b) Root:**

| Attribute | Value: Yes/No (entropy) | Weighted E | **IG** |
|---|---|---|---|
| **Patrons** | None 0/3 (0), Some 4/0 (0), Full 3/2 (0.971) | 5/12·0.971 = 0.405 | **0.575** |
| Hungry | Yes 5/2 (0.863), No 2/3 (0.971) | 7/12·0.863 + 5/12·0.971 = 0.908 | 0.072 |
| Price | Cheap 4/2 (0.918), Expensive 3/3 (1) | 0.959 | 0.021 |

**Patrons** has by far the largest IG and becomes the root.

**(c)**
- **None** (0/3) is pure, so it becomes a **No leaf**. **Some** (4/0) is pure, so it becomes a **Yes leaf**.
- **Full** (rows 6, 7, 8, 9, 11: 3 Yes / 2 No, E = 0.971) needs another split:
  - Hungry: Yes 3/0, No 0/2, IG = **0.971** (perfect).
  - Price: Cheap 2/1 (0.918), Expensive 1/1 (1), weighted 0.951, IG = 0.020.
  - Split on **Hungry**.

```
Patrons [Yes=7, No=5]
|- None -> No  [0/3]
|- Some -> Yes [4/0]
|- Full -> Hungry [Yes=3, No=2]
             |- Yes -> Yes [3/0]
             |- No  -> No  [0/2]
```

Price is never used.

**(d)**
- {Full, Hungry = No, Cheap}: Patrons = Full, then Hungry = No, so **No**.
- {Some, Hungry = No, Expensive}: Patrons = Some, so **Yes** (no more questions).
