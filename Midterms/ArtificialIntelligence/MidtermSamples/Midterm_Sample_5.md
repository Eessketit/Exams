# Artificial Intelligence: Midterm Sample 5

Weeks 2-6, lectures 2.1-6.2 (not W1, W7) · Part I: 10 multiple choice × 0.5 = 5 pts · Part II: 3 open questions + 3 problem-solving questions (Q6 is a decision tree) · Answer and explanation under each question

Each answer has a **Source** line with the slide pages (L4.1 p.32 = lecture 4.1 slides, page 32) and a **Notes** link to the notes section that explains it.

## Part I: Multiple choice (10 × 0.5 = 5 pts)

**1.** The model h = w₁x + w₂x² + w₃x³ + b is called polynomial regression. Why can it still be trained exactly like linear regression?  
a) Because x³ is small enough to ignore  
b) Because gradient descent works for any function  
c) Because the model is linear in the parameters w; only the features x, x², x³ are non-linear  
d) Because polynomial regression always has exactly one feature

> **Answer: c)** The core trick is to construct new features x², x³ from x and train a standard linear regression on them. The model is still linear with respect to the weights, so the same gradient descent update and the normal equation apply, with X columns [1, x, x², x³].  
> **Source:** L2.1 p.45 a line underfits curved data · L2.1 p.46 construct new features, linear in w · L2.1 p.47 PolynomialFeatures  
> **Notes:** [L2.1 › Polynomial regression](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#9-polynomial-regression-slides-45-47)  
> **Visual:** [Sample 5 › Part 1 Q1](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc1)

**2.** Logistic regression has hθ(x) = g(θ₀ + θ₁x₁ + θ₂x₂) with θ = [−3, 1, 1]ᵀ. What is its decision boundary?  
a) The line x₁ + x₂ = 3  
b) The line x₁ + x₂ = 0.5  
c) The line x₁ + x₂ = −3  
d) The circle x₁² + x₂² = 3

> **Answer: a)** Predict y = 1 when θᵀx ≥ 0, i.e. −3 + x₁ + x₂ ≥ 0, i.e. x₁ + x₂ ≥ 3. The boundary is θᵀx = 0: the line x₁ + x₂ = 3, where h = 0.5. b confuses the threshold on h with the threshold on θᵀx. A circle needs the features x₁² and x₂².  
> **Source:** L2.2 p.12 h ≥ 0.5 when z ≥ 0 · L2.2 p.13 decision boundary x₁ + x₂ = 3 · L2.2 p.42 non-linear boundary with polynomial features  
> **Notes:** [L2.2 › Decision boundary, linear and non linear](../notes/04_Week2_LogisticRegression.md#6-decision-boundary-linear-and-non-linear-slides-13-42)  
> **Visual:** [Sample 5 › Part 1 Q2](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc2)

**3.** A cancer screening test is evaluated. Which error is the most dangerous, and which metric should be prioritised?  
a) False positive; precision  
b) True negative; accuracy  
c) False positive; accuracy  
d) False negative; recall

> **Answer: d)** A false negative is a missed cancer, which can be fatal. A false positive only costs an extra test. Recall = TP/(TP + FN) measures how many real positives were caught, so doctors accept lower precision for higher recall.  
> **Source:** L3.1 p.23 recall (sensitivity), useful when a false negative is costly · L3.1 p.24 cancer screening and airport security  
> **Notes:** [L3.1 › Accuracy, precision, recall, F1](../notes/05_Week3_EvaluatingLearningAlgorithms.md#8-accuracy-precision-recall-f1-slides-20-25)  
> **Visual:** [Sample 5 › Part 1 Q3](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc3)

**4.** A KNN classifier uses two raw features: age (20 to 60 years) and salary (40,000 to 80,000). What goes wrong without feature scaling?  
a) KNN cannot compute distances on integers  
b) The distances are dominated by salary, so age has almost no influence on which neighbours are nearest  
c) The value of k must then be larger than the number of points  
d) Nothing; KNN is scale-invariant like a decision tree

> **Answer: b)** A difference of 1,000 in salary outweighs a difference of 20 years in age. Features on very different ranges are implicitly weighted unequally, so scale first (min-max is listed as best for KNN). Decision trees are scale-invariant; KNN is not.  
> **Source:** L5.2 p.18 why scale: features on different ranges · L5.2 p.19 Min-Max best for neural networks, KNN, SVM · L3.2 p.35 Euclidean distance  
> **Notes:** [L3.2 › Ties and feature scaling](../notes/06_Week3_NaiveBayes_KNN.md#15-ties-and-feature-scaling-textbook-context) · [L5.2 › Feature scaling](../notes/09_Week5_DataPreparation.md#7-feature-scaling-slides-18-20)  
> **Visual:** [Sample 5 › Part 1 Q4](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc4)

**5.** A decision-tree node holds 3 "Yes" and 1 "No" examples. Its entropy (log base 2) is approximately:  
a) 0.25  
b) 0.5  
c) 0.811  
d) 1.0

> **Answer: c)** E = −(3/4) log₂(3/4) − (1/4) log₂(1/4) = 0.311 + 0.5 = 0.811. 1.0 is a 50/50 node and 0 a pure node, so a 3:1 node lies in between.  
> **Source:** L4.1 p.22 entropy formula · L4.1 p.26-27 entropy computed for 5/2 and 3/2 nodes · L4.1 p.28 lower entropy = purer node  
> **Notes:** [L4.1 › Entropy](../notes/07_Week4_DecisionTree.md#5-entropy-slides-22-24-28)  
> **Visual:** [Sample 5 › Part 1 Q5](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc5)

**6.** In a soft-margin SVM, a training point has y = +1 and w·x + b = 0.5. What is its slack ζ = max(0, 1 − y(w·x + b))?  
a) 0.5  
b) 0  
c) 1.5  
d) −0.5

> **Answer: a)** ζ = max(0, 1 − 1 · 0.5) = 0.5. The point is on the correct side of the hyperplane but inside the margin, so 0 < ζ ≤ 1. ζ = 0 is for a point on or beyond its margin line; ζ > 1 (e.g. 1.5) means misclassified. ζ is never negative.  
> **Source:** L4.2 p.40 soft-margin cost with the max(0, 1 − y(wᵀx + b)) term · L4.2 p.42 what ζ means  
> **Notes:** [L4.2 › Soft margin: slack zeta, C and hinge loss](../notes/08_Week4_SVM.md#9-soft-margin-slack-zeta-c-and-hinge-loss-slides-38-42)  
> **Visual:** [Sample 5 › Part 1 Q6](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc6)

**7.** A feature has mean μ = 50 and standard deviation σ = 10. What is the z-score of x = 70, and is it an outlier by the |z| > 3 rule?  
a) 0.2; no  
b) 20; yes  
c) 3.5; yes  
d) 2; no

> **Answer: d)** z = (x − μ)/σ = (70 − 50)/10 = 2. |z| = 2 is below the cutoff 3, so it is not flagged. The same formula is the standardization scaler: the feature gets mean 0 and std 1.  
> **Source:** L5.2 p.14 Z-score rule, |z| > 3 · L5.2 p.18-19 standardization (x − μ)/σ  
> **Notes:** [L5.2 › Outliers: IQR, Z score, ML detectors](../notes/09_Week5_DataPreparation.md#5-outliers-iqr-z-score-ml-detectors-slides-13-15)  
> **Visual:** [Sample 5 › Part 1 Q7](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc7)

**8.** Running K-Means several times on the same data gives different clusters each time. What causes this, and what does the lecture suggest?  
a) The data has missing values; impute them  
b) The initial centroids are chosen at random; use K-Means++ to choose them  
c) K is too large; always use K = 2  
d) The distance is Euclidean; use Manhattan

> **Answer: b)** Random initialization "is also potentially problematic because we might get different clusters every time". K-Means++ picks the first centroid at random and every next one with probability proportional to D(x)², which spreads the starting centroids. In the course notebook, random seed 42 ends at cost 8979.85, while K-Means++ reaches 611.62 on the same data.  
> **Source:** L6.1 p.19 random initialization problem, K-Means++ · L6.1 p.21 K-Means++ steps · L6.1 p.26 better clusters, faster convergence  
> **Notes:** [L6.1 › Solutions](../notes/10_Week6_KMeans_Clustering.md#6-solutions-slides-17-19) · [L6.1 › Code from the course notebook: K-Means](../notes/10_Week6_KMeans_Clustering.md#9-code-from-the-course-notebook-k-means)  
> **Visual:** [Sample 5 › Part 1 Q8](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc8)

**9.** A fraud dataset has 9,980 normal and 20 fraud transactions. A model that always predicts "Normal" has:  
a) accuracy 0.2% and recall 100%  
b) accuracy 50% and recall 50%  
c) accuracy 99.8% and fraud recall 0  
d) accuracy 99.8% and fraud recall 99.8%

> **Answer: c)** Accuracy = 9,980/10,000 = 99.8%, but it catches 0 of the 20 frauds, so recall = 0/20 = 0. On imbalanced data accuracy is misleading: use precision, recall, F1 or PR-AUC, a stratified split, and SMOTE or class weights on the training data.  
> **Source:** L5.2 p.24 fraud example, 99.8% accuracy but 0 recall · L5.2 p.25 SMOTE  
> **Notes:** [L5.2 › Big data and class imbalance](../notes/09_Week5_DataPreparation.md#9-big-data-and-class-imbalance-slides-23-25)  
> **Visual:** [Sample 5 › Part 1 Q9](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc9)

**10.** A 2D dataset has covariance-matrix eigenvalues λ₁ = 30.38 and λ₂ = 6.62. What share of the total variance does the first principal component keep?  
a) About 82%  
b) About 18%  
c) 50%  
d) 100%

> **Answer: a)** Each eigenvalue is the variance along its principal direction, so PC1 keeps λ₁/(λ₁ + λ₂) = 30.38/37 = 0.821. These are the eigenvalues of the slide 17 example, so reducing that dataset to PC1 keeps about 82% of the information. 18% is the share of PC2.  
> **Source:** L6.2 p.6-7 most information in the first components · L6.2 p.15 eigenvalues of S · L6.2 p.17 worked example  
> **Notes:** [L6.2 › Step by step](../notes/11_Week6_PCA.md#4-step-by-step-slides-14-16) · [L6.2 › Worked example](../notes/11_Week6_PCA.md#5-worked-example-slide-17)  
> **Visual:** [Sample 5 › Part 1 Q10](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-mc10)

## Part II: Open questions and problem solving

### Q1. Evaluating learning algorithms (open)

(a) Why do we evaluate machine learning models? Give the five reasons from the lecture.

(b) Define overfitting and underfitting in terms of training and test performance.

(c) Give the formulas of MSE, RMSE, MAE and R², and say what each one tells you.

**Answer**

**Source:** L3.1 p.3-6 why evaluate, five reasons · L3.1 p.4 overfitting and underfitting · L3.1 p.10-13 MSE, RMSE, MAE, R² · L3.1 p.26 worked regression example  
**Notes:** [L3.1 › Why evaluate](../notes/05_Week3_EvaluatingLearningAlgorithms.md#1-why-evaluate-slides-3-6) · [L3.1 › Regression metrics: MSE, RMSE, MAE](../notes/05_Week3_EvaluatingLearningAlgorithms.md#4-regression-metrics-mse-rmse-mae-slides-10-12) · [L3.1 › R-squared](../notes/05_Week3_EvaluatingLearningAlgorithms.md#5-r-squared-slide-13)  
**Visual:** [Sample 5 › Part 2 Q1 Model evaluation](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-w1)

**(a)** The goal is not only a low training error but good performance on **new, unseen data**. Five reasons:
1. **Generalization ability**: will the model work on new data? Detects over- and underfitting.
2. **Model selection**: a standard way to compare candidate models.
3. **Parameter tuning**: measure the effect of different hyperparameter settings.
4. **Understanding strengths and weaknesses**: e.g. good in high dimensions but bad with noisy data.
5. **Benchmarking**: compare with baselines, previous models and competitors.

**(b)**
- **Overfitting**: the model performs well on training data but poorly on test data.
- **Underfitting**: the model performs poorly on both.

**(c)**
- MSE = (1/m) Σ (hθ(x)⁽ⁱ⁾ − y⁽ⁱ⁾)²: average squared error; **sensitive to large errors** (outliers).
- RMSE = √MSE: the error in the **same units as the target**.
- MAE = (1/m) Σ |hθ(x)⁽ⁱ⁾ − y⁽ⁱ⁾|: average absolute error; **less sensitive to large errors** than MSE.
- R² = 1 − Σ(y − ŷ)²/Σ(y − ȳ)²: the share of the target's variance the model explains; **close to 1 = good fit**, 0 = no better than predicting the mean.
- Slide 26 example: MSE 11.7, RMSE 3.42, MAE 2.5, R² 0.986. One error of 8 gives 64 of the 117 in the MSE sum but only 8 of the 25 in the MAE sum.
- MSE here uses 1/m. The cost J(θ) used for gradient descent has 1/2m.

---

### Q2. Decision trees (open)

(a) Explain the terms root node, decision node, leaf node, splitting, sub-tree, pruning, and parent and child node.

(b) Compare the decision tree algorithms ID3, C4.5 and CART.

(c) Define entropy and information gain. How does the tree pick the attribute for a node? What are the main problems of decision trees, and how are they handled?

**Answer**

**Source:** L4.1 p.5 definition · L4.1 p.6-8 ID3, C4.5, CART · L4.1 p.10-13 terminology · L4.1 p.15-20 how it works and assumptions · L4.1 p.22-31 entropy and information gain  
**Notes:** [L4.1 › Decision tree definition and types: ID3, C4.5, CART](../notes/07_Week4_DecisionTree.md#2-decision-tree-definition-and-types-id3-c45-cart-slides-5-8) · [L4.1 › Terminology](../notes/07_Week4_DecisionTree.md#3-terminology-slides-10-13) · [L4.1 › How the algorithm works and its assumptions](../notes/07_Week4_DecisionTree.md#4-how-the-algorithm-works-and-its-assumptions-slides-15-20) · [L4.1 › Stopping, overfitting and pruning](../notes/07_Week4_DecisionTree.md#9-stopping-overfitting-and-pruning-slides-12-16-19-20-25)  
**Visual:** [Sample 5 › Part 2 Q2 Decision trees](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-w2)

**(a)**

| Term | Meaning |
|---|---|
| Root node | the first node; the whole dataset starts dividing here |
| Splitting | dividing a node into sub-nodes |
| Decision node | a sub-node that is split further |
| Leaf / terminal node | not split any more; holds the final class |
| Sub-tree / branch | a sub-section of the tree |
| Pruning | removing nodes to prevent overfitting and simplify the model |
| Parent / child | a node that is split is the parent of the sub-nodes it produces |

**(b)**
- **ID3**: chooses splits by **entropy / information gain**.
- **C4.5**: improved ID3; handles **missing data and continuous attributes** (gain ratio, textbook context).
- **CART**: chooses splits by **Gini impurity**; binary splits; does **classification and regression**.

**(c)**
- Entropy E(S) = −p₊ log₂ p₊ − p₋ log₂ p₋ measures impurity: 0 for a pure node, 1 for a 50/50 node. Higher entropy = lower purity.
- Information gain IG(S, a) = E(S) − Σᵥ (|Sᵥ|/|S|) E(Sᵥ): how much the entropy decreases after splitting on a. At each node the attribute with the **highest IG** is chosen; a node that is 100% pure becomes a leaf. Then repeat on every branch.
- Problems: trees **overfit** easily (they capture noise), the greedy split is only locally optimal, they are sensitive to outliers and to the sample size, and missing values must be imputed first.
- Handling: **pruning** and stopping criteria (max depth, min samples per node, IG threshold, textbook context for the list); or a **random forest** of many trees.

---

### Q3. Feature scaling, encoding and data leakage (open)

(a) Give the formulas of min-max scaling, standardization and robust scaling, and when to use each.

(b) Compare label encoding, one-hot encoding and target encoding.

(c) What is data leakage, and how is it avoided? How should a heavily imbalanced dataset be handled?

**Answer**

**Source:** L5.2 p.18-20 scaling methods · L5.2 p.21-22 encodings · L5.2 p.24-25 class imbalance and SMOTE · L5.2 p.34 splitting · L5.2 p.36 common mistakes  
**Notes:** [L5.2 › Feature scaling](../notes/09_Week5_DataPreparation.md#7-feature-scaling-slides-18-20) · [L5.2 › Categorical encoding](../notes/09_Week5_DataPreparation.md#8-categorical-encoding-slides-21-22) · [L5.2 › Big data and class imbalance](../notes/09_Week5_DataPreparation.md#9-big-data-and-class-imbalance-slides-23-25) · [L5.2 › Splitting and data leakage](../notes/09_Week5_DataPreparation.md#13-splitting-and-data-leakage-slides-34-36)  
**Visual:** [Sample 5 › Part 2 Q3 Scaling and leakage](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-w3)

**(a)**

| Method | Formula | Output | Use |
|---|---|---|---|
| Min-Max | (x − min)/(max − min) | [0, 1] | neural networks, KNN, SVM; very sensitive to outliers |
| Standardization (z-score) | (x − μ)/σ | mean 0, std 1, unbounded | linear and logistic regression, PCA |
| Robust | (x − Q2)/(Q3 − Q1) | median-centred, IQR-scaled | data with many outliers |

- Why scale: features on very different ranges (age vs income) are weighted unequally. Start with standardization for linear models; switch to Robust when a boxplot shows heavy outliers you want to keep. Trees do not need scaling.

**(b)**
- **Label encoding** (0, 1, 2): for **ordinal** categories (small < medium < large). On nominal data it invents a false order.
- **One-hot encoding** (one 0/1 column per category): for **nominal** categories with a manageable number of values (Tashkent / Samarkand / Bukhara).
- **Target encoding**: replace each category by the **mean of the target** for it (e.g. average salary per city); for high cardinality (hundreds of categories). It uses y, so it must be fit on the training data only.

**(c)**
- **Data leakage**: information from the test set gets into training, e.g. a scaler, encoder, imputer or SMOTE fit on the whole data. The metrics look great and the model fails in production.
- Avoid it: **split first**, then fit every preprocessing step on the **training set only**, and only `transform` the test set. Use a time-based split without shuffling for time series.
- **Imbalance** (e.g. 9,980 normal vs 20 fraud): a model that always says "normal" gets 99.8% accuracy and recall 0. Use precision, recall, F1 or PR-AUC; a **stratified** split; and **SMOTE** (synthetic minority points interpolated between a minority point and its nearest minority neighbours) or class weights, **on the training data only**.

---

### Q4. Support vector machine by hand (problem)

Training data: negative class (y = −1): (1, 2), (0, 1), (1, 0); positive class (y = +1): (3, 4), (4, 3), (5, 5). A linear SVM gives w = (0.5, 0.5), b = −2.5.

(a) Check that every point satisfies the hard-margin constraint yᵢ(w·xᵢ + b) ≥ 1. Which points are the support vectors?

(b) Write the decision boundary and the two margin lines, and compute the margin width.

(c) Classify the new points (2, 2) and (4, 4) and give their distance to the hyperplane.

(d) Two more training points are added: (3, 3) with y = −1 and (2, 3) with y = +1. Keeping the same w and b, compute their slack ζ and the soft-margin cost J = ½‖w‖² + C Σζᵢ for C = 1 and C = 10.

**Answer**

**Source:** L4.2 p.8-9 support vectors and margin · L4.2 p.24-25 hyperplane and decision rule · L4.2 p.26 margin lines ±1 · L4.2 p.28-30 combined constraint · L4.2 p.31-36 d = 2/‖w‖ · L4.2 p.40-42 soft-margin cost and ζ  
**Notes:** [L4.2 › Hyperplane, decision rule and margin lines](../notes/08_Week4_SVM.md#7-hyperplane-decision-rule-and-margin-lines-slides-23-26) · [L4.2 › Hard margin: constraints and margin 2 over norm w](../notes/08_Week4_SVM.md#8-hard-margin-constraints-and-margin-2-over-norm-w-slides-27-37) · [L4.2 › Soft margin: slack zeta, C and hinge loss](../notes/08_Week4_SVM.md#9-soft-margin-slack-zeta-c-and-hinge-loss-slides-38-42) · [L4.2 › Exam focus](../notes/08_Week4_SVM.md#exam-focus)  
**Visual:** [Sample 5 › Part 2 Q4 SVM by hand](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-w4)

**(a)** f(x) = 0.5x₁ + 0.5x₂ − 2.5:

| Point | y | f(x) | y·f(x) | Status |
|---|---|---|---|---|
| (1, 2) | −1 | −1 | 1 | on L2, **support vector** |
| (0, 1) | −1 | −2 | 2 | beyond the margin |
| (1, 0) | −1 | −2 | 2 | beyond the margin |
| (3, 4) | +1 | 1 | 1 | on L1, **support vector** |
| (4, 3) | +1 | 1 | 1 | on L1, **support vector** |
| (5, 5) | +1 | 2.5 | 2.5 | beyond the margin |

All values are ≥ 1, so the constraints hold. The support vectors are the points with y·f(x) = 1, the ones closest to the hyperplane: **(1, 2), (3, 4), (4, 3)**.

**(b)**
- Boundary: 0.5x₁ + 0.5x₂ − 2.5 = 0, i.e. **x₁ + x₂ = 5**.
- L1 (positive margin line): w·x + b = 1, i.e. x₁ + x₂ = 7. L2 (negative): w·x + b = −1, i.e. x₁ + x₂ = 3.
- ‖w‖ = √(0.25 + 0.25) = 0.7071, so **d = 2/‖w‖ = 2.828**. Check: the support vectors (1, 2) and (3, 4) are √(4 + 4) = 2.828 apart along the direction of w.

**(c)** Distance to the hyperplane = |f(x)|/‖w‖.
- (2, 2): f = 1 + 1 − 2.5 = −0.5 < 0, so **y = −1**; distance 0.5/0.7071 = **0.707** (inside the margin).
- (4, 4): f = 4 − 2.5 = 1.5 ≥ 0, so **y = +1**; distance 1.5/0.7071 = **2.121**.

**(d)**
- (3, 3), y = −1: f = 0.5, y·f = −0.5, **ζ = 1.5** (> 1: misclassified, it is on the positive side).
- (2, 3), y = +1: f = 0, y·f = 0, **ζ = 1** (on the hyperplane, inside the margin).
- ½‖w‖² = ½ · 0.5 = 0.25 and Σζ = 2.5.
- C = 1: J = 0.25 + 2.5 = **2.75**. C = 10: J = 0.25 + 25 = **25.25**.
- With a large C the violations dominate the cost, so training would push w and b to fix them, narrowing the margin.

---

### Q5. PCA: the lecture example (problem)

Find the first principal component of the dataset below (the slide 17 example).

| Point | X1 | X2 |
|---|---|---|
| 1 | 4 | 11 |
| 2 | 8 | 4 |
| 3 | 13 | 5 |
| 4 | 7 | 14 |

(a) Compute the means and the centred data.

(b) Compute the covariance matrix (divide by n − 1).

(c) Compute the eigenvalues and the unit eigenvector of the largest eigenvalue.

(d) Compute PC1 for every point and the share of variance it keeps.

**Answer**

**Source:** L6.2 p.14 mean and covariance · L6.2 p.15 eigenvalues and eigenvectors · L6.2 p.16 projection · L6.2 p.17 worked example, answer −4.3052, 3.7361, 5.6928, −5.1238  
**Notes:** [L6.2 › Step by step](../notes/11_Week6_PCA.md#4-step-by-step-slides-14-16) · [L6.2 › Worked example](../notes/11_Week6_PCA.md#5-worked-example-slide-17)  
**Visual:** [Sample 5 › Part 2 Q5 PCA](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-w5)

**(a)** X̄₁ = (4 + 8 + 13 + 7)/4 = **8**, X̄₂ = (11 + 4 + 5 + 14)/4 = **8.5**.

Centred data: (−4, 2.5), (0, −4.5), (5, −3.5), (−1, 5.5).

**(b)**
- Cov(X₁, X₁) = (16 + 0 + 25 + 1)/3 = **14**
- Cov(X₂, X₂) = (6.25 + 20.25 + 12.25 + 30.25)/3 = **23**
- Cov(X₁, X₂) = (−10 + 0 − 17.5 − 5.5)/3 = **−11**

S = [[14, −11], [−11, 23]].

**(c)**
- det(S − λI) = (14 − λ)(23 − λ) − 121 = λ² − 37λ + 201 = 0.
- λ = (37 ± √(1369 − 804))/2 = (37 ± √565)/2 = (37 ± 23.770)/2, so **λ₁ = 30.385** and **λ₂ = 6.615**.
- Eigenvector of λ₁: (14 − 30.385)u₁ − 11u₂ = 0, so u₂ = −1.4895u₁. Length √(1 + 1.4895²) = 1.7941, so **u₁ = (0.5574, −0.8303)**.

**(d)** PC1 = centred row · u₁:

| Point | centred | PC1 |
|---|---|---|
| 1 | (−4, 2.5) | −2.2296 − 2.0757 = **−4.3052** |
| 2 | (0, −4.5) | 0 + 3.7361 = **3.7361** |
| 3 | (5, −3.5) | 2.7869 + 2.9059 = **5.6928** |
| 4 | (−1, 5.5) | −0.5574 − 4.5664 = **−5.1238** |

- These match the slide. (The notebook prints the same numbers with the opposite sign, because its eigenvector is (−0.5574, 0.8303). Both are correct.)
- PC1 keeps 30.385/37 = **82.1%** of the variance.

---

### Q6. Decision tree and random forest (problem)

Will a customer buy a computer?

| # | Age | Student | Credit | Buy |
|---|---|---|---|---|
| 1 | Youth | No | Fair | No |
| 2 | Youth | No | Excellent | No |
| 3 | Middle | No | Fair | Yes |
| 4 | Senior | No | Fair | Yes |
| 5 | Senior | Yes | Fair | Yes |
| 6 | Senior | Yes | Excellent | No |
| 7 | Middle | Yes | Excellent | Yes |
| 8 | Youth | No | Fair | No |
| 9 | Youth | Yes | Fair | Yes |
| 10 | Senior | No | Fair | Yes |
| 11 | Youth | Yes | Excellent | Yes |
| 12 | Middle | No | Excellent | Yes |
| 13 | Middle | Yes | Fair | Yes |
| 14 | Senior | No | Excellent | No |

(a) Compute the entropy of the dataset.

(b) Compute the information gain of Age, Student and Credit, and choose the root.

(c) Build the complete tree with ID3.

(d) Classify x = {Age = Youth, Student = No, Credit = Fair} with your tree.

(e) A random forest uses your tree as T1 and two more trees built on bootstrapped data:
- T2: Student? Yes → Yes; No → Credit? (Fair → Yes, Excellent → No)
- T3: Credit? Fair → Yes; Excellent → Age? (Youth → Yes, Middle → Yes, Senior → No)

What does the forest predict for x?

**Answer**

**Source:** L4.1 p.22 entropy · L4.1 p.29-31 information gain · L4.1 p.32-34 PlayTennis worked example · L4.1 p.37-40 random forest · L4.1 p.46 testing: majority vote of the trees  
**Notes:** [L4.1 › Information gain](../notes/07_Week4_DecisionTree.md#6-information-gain-slides-29-31) · [L4.1 › Worked example: PlayTennis tree built with ID3](../notes/07_Week4_DecisionTree.md#7-worked-example-playtennis-tree-built-with-id3-slides-32-34) · [L4.1 › Random forest](../notes/07_Week4_DecisionTree.md#10-random-forest-slides-36-50)  
**Visual:** [Sample 5 › Part 2 Q6 Tree and forest](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s5-w6)

**(a)** 9 Yes, 5 No: E(S) = −(9/14) log₂(9/14) − (5/14) log₂(5/14) = 0.410 + 0.530 = **0.940**.

**(b) Root:**

| Attribute | Value: Yes/No (entropy) | Weighted E | **IG** |
|---|---|---|---|
| **Age** | Youth 2/3 (0.971), Middle 4/0 (0), Senior 3/2 (0.971) | 10/14·0.971 = 0.694 | **0.247** |
| Student | No 4/4 (1), Yes 5/1 (0.650) | 8/14·1 + 6/14·0.650 = 0.850 | 0.090 |
| Credit | Fair 6/2 (0.811), Excellent 3/3 (1) | 8/14·0.811 + 6/14·1 = 0.892 | 0.048 |

**Age** is the root. Age = Middle is pure (4/0), so it is a **Yes leaf**.

**(c) Second level:**
- **Youth** (rows 1, 2, 8, 9, 11: 2 Yes / 3 No, E = 0.971): Student gives No 0/3 and Yes 2/0, IG = **0.971**; Credit gives Fair 1/2 and Excellent 1/1, IG = 0.020. Split on **Student**.
- **Senior** (rows 4, 5, 6, 10, 14: 3 Yes / 2 No, E = 0.971): Credit gives Fair 3/0 and Excellent 0/2, IG = **0.971**; Student gives No 2/1 and Yes 1/1, IG = 0.020. Split on **Credit**.

```
Age [Yes=9, No=5]
|- Youth  -> Student [Yes=2, No=3]
|              |- No  -> No  [0/3]
|              |- Yes -> Yes [2/0]
|- Middle -> Yes [4/0]
|- Senior -> Credit [Yes=3, No=2]
               |- Fair      -> Yes [3/0]
               |- Excellent -> No  [0/2]
```

**(d)** x = {Youth, No, Fair}: Age = Youth, then Student = No, so T1 says **No**.

**(e)**
- T1: **No** (Youth, Student = No).
- T2: Student = No, then Credit = Fair, so **Yes**.
- T3: Credit = Fair, so **Yes**.
- Majority vote 2 to 1: the forest predicts **Yes**. The forest can disagree with any single tree; the vote of several different trees is what reduces overfitting.
