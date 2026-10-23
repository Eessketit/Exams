# Artificial Intelligence: Midterm Sample 1

Weeks 2-6, lectures 2.1-6.2 (not W1, W7) · Part I: 10 multiple choice × 0.5 = 5 pts · Part II: 3 open questions + 3 problem-solving questions (Q6 is a decision tree) · Answer and explanation under each question

Each answer has a **Source** line with the slide pages (L4.1 p.32 = lecture 4.1 slides, page 32) and a **Notes** link to the notes section that explains it.

## Part I: Multiple choice (10 × 0.5 = 5 pts)

**1.** A multivariate linear regression dataset has m = 5 examples and n = 3 features. After the dummy feature x0 = 1 is added, what is the shape of the matrix X used in the normal equation θ = (XᵀX)⁻¹Xᵀy?  
a) 5 × 3  
b) 3 × 5  
c) 5 × 4  
d) 4 × 4

> **Answer: c)** X has one row per example (m = 5) and one column per parameter: x0 plus the n = 3 features, so 5 × (n + 1) = 5 × 4. 4 × 4 is the shape of XᵀX, and 5 × 3 forgets the column of 1s.  
> **Source:** L2.1 p.9 dummy feature x0 = 1 · L2.1 p.10-11 h(x) = Xθ, X is m × (n + 1) · L2.1 p.40 XᵀX is 4 × 4  
> **Notes:** [L2.1 › Notation for multiple variables](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#2-notation-for-multiple-variables-slides-6-11) · [L2.1 › Normal equation](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#7-normal-equation-slides-33-41-43)

**2.** Logistic regression uses hθ(x) = g(z) with z = θᵀx and g(z) = 1 / (1 + e⁻ᶻ). When does it predict y = 1?  
a) When z ≥ 0  
b) When z ≥ 0.5  
c) When hθ(x) ≥ 0  
d) When z ≤ 0

> **Answer: a)** g(z) ≥ 0.5 exactly when z ≥ 0, because g(0) = 0.5 and g increases. So "h ≥ 0.5" and "θᵀx ≥ 0" are the same rule. b mixes up the threshold on h with a threshold on z; c is always true, since h is between 0 and 1.  
> **Source:** L2.2 p.10 sigmoid hypothesis · L2.2 p.12 g(z) ≥ 0.5 if z ≥ 0  
> **Notes:** [L2.2 › Hypothesis: the sigmoid function](../notes/04_Week2_LogisticRegression.md#4-hypothesis-the-sigmoid-function-slides-10-12)

**3.** A spam filter must avoid moving real emails (for example a job offer) into the spam folder. Which metric should it prioritise?  
a) Recall  
b) Precision  
c) Accuracy  
d) MAE

> **Answer: b)** Moving a real email to spam is a False Positive. Precision = TP / (TP + FP) answers "of all the alarms the model raised, how many were real?", so it punishes FP. Recall is for when a False Negative is the costly error (cancer screening). MAE is a regression metric.  
> **Source:** L3.1 p.21 precision formula · L3.1 p.22 precision use case: spam detection · L3.1 p.23-24 recall, cancer screening  
> **Notes:** [L3.1 › Accuracy, precision, recall, F1](../notes/05_Week3_EvaluatingLearningAlgorithms.md#8-accuracy-precision-recall-f1-slides-20-25)

**4.** Why is the Naive Bayes classifier called "naive"?  
a) It gives every class the same prior probability  
b) It uses only one feature to classify  
c) It works only on continuous data  
d) It assumes the features are independent of each other given the class

> **Answer: d)** The naive assumption is conditional independence, so P(x1, ..., xn | class) = P(x1 | class) · ... · P(xn | class). The slides list it as the main disadvantage, because it is rarely true for real data. Priors come from the class counts (10/15 and 5/15 in the shopping example), NB uses all features, and it handles continuous and discrete data.  
> **Source:** L3.2 p.23-24 product of the per-feature likelihoods · L3.2 p.27 handles continuous and discrete data · L3.2 p.28 independence assumption  
> **Notes:** [L3.2 › Naive Bayes classifier: the naive assumption](../notes/06_Week3_NaiveBayes_KNN.md#3-naive-bayes-classifier-the-naive-assumption-slides-16-23-24-28)

**5.** In KNN classification, what does the model predict if k is set equal to N, the number of training points?  
a) The majority class of the whole training set, for every query  
b) The label of the single nearest point  
c) A random class  
d) The class whose mean is nearest to the query

> **Answer: a)** With k = N every training point is a neighbour, so the vote is the same for every query: the most frequent class in the dataset (slide 46). k = 1 gives b, the label of the single closest point. Small k overfits, large k smooths, and k = N ignores the query completely.  
> **Source:** L3.2 p.39 majority vote of the k nearest · L3.2 p.46 k ranges from 1 to N · L3.2 p.53 low k overfits, high k smooths  
> **Notes:** [L3.2 › Choosing k](../notes/06_Week3_NaiveBayes_KNN.md#14-choosing-k-slides-46-49)

**6.** A decision-tree node holds 7 "Yes" and 7 "No" examples. Its entropy (log base 2) is:  
a) 0  
b) 0.5  
c) 1  
d) 0.940

> **Answer: c)** E = −0.5 log₂ 0.5 − 0.5 log₂ 0.5 = 0.5 + 0.5 = 1, the maximum for two classes: a 50/50 node is the least pure. 0 is a pure node; 0.940 is the PlayTennis root with 9 Yes / 5 No.  
> **Source:** L4.1 p.22 entropy formula · L4.1 p.24-28 entropy measures impurity, pure node = leaf  
> **Notes:** [L4.1 › Entropy](../notes/07_Week4_DecisionTree.md#5-entropy-slides-22-24-28)

**7.** Which training points determine the separating hyperplane of an SVM?  
a) All training points, each with equal weight  
b) The mean point of each class  
c) The points farthest from the hyperplane  
d) Only the support vectors, the points closest to the hyperplane

> **Answer: d)** "The SVM is defined only by the support vectors". The other points can move (without crossing the margin) and the hyperplane does not change. Logistic regression, by contrast, is defined over all points (option a).  
> **Source:** L4.2 p.8 support vectors are the points closest to the hyperplane · L4.2 p.11 SVM uses only the support vectors, logistic regression uses all points  
> **Notes:** [L4.2 › Important terms](../notes/08_Week4_SVM.md#3-important-terms-slides-8-9-12) · [L4.2 › How SVM works](../notes/08_Week4_SVM.md#4-how-svm-works-slides-10-13)

**8.** In a salary survey, high earners often leave the income question blank. This type of missing data is:  
a) MCAR (Missing Completely At Random)  
b) MNAR (Missing Not At Random)  
c) MAR (Missing At Random)  
d) A duplicate record

> **Answer: b)** The value is missing because of the missing value itself (high income), which is MNAR, the hardest case. This is the slide example. MCAR is unrelated to any variable (a sensor briefly went offline). MAR depends on another observed variable (older respondents skip income questions).  
> **Source:** L5.2 p.10 MCAR, MAR, MNAR with examples  
> **Notes:** [L5.2 › Missing values](../notes/09_Week5_DataPreparation.md#3-missing-values-slides-10-11)

**9.** In the K-Means algorithm, what happens in the "update centroids" step?  
a) Each point moves to the nearest centroid  
b) A new centroid is picked at random from the data  
c) Each centroid becomes the mean of all points assigned to its cluster  
d) The centroid with the most points is split in two

> **Answer: c)** Step 3 recalculates each centroid as μₖ = (1/|Cₖ|) Σ xᵢ over its cluster. Points do not move; a is the assignment step, where each point is assigned to the nearest centroid. Random picks happen only at initialization.  
> **Source:** L6.1 p.7 initialization and assignment · L6.1 p.8 update centroids, μₖ formula · L6.1 p.9 repeat until convergence  
> **Notes:** [L6.1 › The algorithm in five steps](../notes/10_Week6_KMeans_Clustering.md#2-the-algorithm-in-five-steps-slides-7-9) · [L6.1 › Objective J and the centroid formula](../notes/10_Week6_KMeans_Clustering.md#3-objective-j-and-the-centroid-formula-slides-7-8)

**10.** The first principal component of a dataset is the direction that:  
a) maximizes the variance of the data projected onto it  
b) minimizes the variance of the data projected onto it  
c) is always parallel to the x1 axis  
d) passes through the point farthest from the origin

> **Answer: a)** PC1 is "the line in which the projection of the points is the most spread out", i.e. the line that maximizes the variance. Larger variance means more information. PC2 is perpendicular to PC1 and carries the next highest variance.  
> **Source:** L6.2 p.8 PCs are the directions of maximal variance · L6.2 p.11 PC1 maximizes the variance of the projections · L6.2 p.12 PC2 is perpendicular to PC1  
> **Notes:** [L6.2 › Geometric view: directions of maximum variance](../notes/11_Week6_PCA.md#3-geometric-view-directions-of-maximum-variance-slides-8-10-12)

## Part II: Open questions and problem solving

### Q1. Overfitting and regularization (open)

(a) Define underfitting and overfitting. Use the housing-price example with hypotheses of increasing polynomial degree, and name the bias/variance term for each case.

(b) Give the two ways to address overfitting from the lecture.

(c) Write the cost function of logistic regression with L2 regularization. What does λ control, and which parameter is not regularized?

**Answer**

**Source:** L3.1 p.4 overfitting vs underfitting · L2.2 p.40-42 underfit / good fit / overfit · L2.2 p.43 two ways to address overfitting · L2.2 p.44 L1 and L2 · L2.2 p.46 regularized logistic regression  
**Notes:** [L2.2 › Overfitting](../notes/04_Week2_LogisticRegression.md#11-overfitting-slides-40-43) · [L2.2 › Regularisation, L1 and L2](../notes/04_Week2_LogisticRegression.md#12-regularisation-l1-and-l2-slides-44-46) · [L3.1 › Overfitting, underfitting and data splits](../notes/05_Week3_EvaluatingLearningAlgorithms.md#2-overfitting-underfitting-and-data-splits-slides-4-15)

**(a) Write:**
- **Underfitting** = poor performance on both training and test data. The model is too simple: θ₀ + θ₁x (a straight line) on curved housing data. This is **high bias**.
- **Good fit**: θ₀ + θ₁x + θ₂x² follows the trend and generalizes.
- **Overfitting** = performs well on training data but poorly on test data. With too many features (θ₀ + θ₁x + ... + θ₄x⁴) the hypothesis fits the training set very well, J(θ) ≈ 0, "but fails to generalize to new examples". This is **high variance**.
- Logistic version (slide 42): g(θ₀ + θ₁x₁ + θ₂x₂) underfits; adding x₁², x₂², x₁x₂ fits well; many high-order terms give a contorted boundary that overfits.

**(b) Two ways (slide 43):**
1. **Reduce the number of features**: select manually which features to keep, or use a model selection algorithm.
2. **Regularization**: keep all the features but reduce the magnitude of the parameters θⱼ. It works well when there are many features and each contributes a bit to predicting y.

**(c)**

$$J(\theta)=-\frac{1}{m}\sum_{i=1}^{m}\Big[y^{(i)}\log h_\theta(x^{(i)})+(1-y^{(i)})\log\big(1-h_\theta(x^{(i)})\big)\Big]+\frac{\lambda}{2m}\sum_{j=1}^{n}\theta_j^2$$

- λ is the regularization parameter (a hyperparameter). A larger λ pushes the θⱼ toward 0, which gives a simpler model. Too large a λ underfits; λ = 0 is plain logistic regression.
- The penalty sum starts at j = 1, so **θ₀ is not regularized**. Its update is the plain one; for j ≥ 1 the gradient gets the extra term (λ/m)θⱼ.
- L1 (Lasso) penalty: λ Σ|θⱼ|. L2 (Ridge) penalty: λ Σθⱼ².

---

### Q2. SVM: hard margin and soft margin (open)

(a) Define the hyperplane, the support vectors and the margin of an SVM.

(b) Write the hard-margin constraints and optimization problem, and show that the margin width is d = 2/‖w‖.

(c) Why do we need a soft margin? Explain the slack variable ζ and the effect of a large and a small C.

**Answer**

**Source:** L4.2 p.8-9 hyperplane, support vectors, margin · L4.2 p.24-26 w·x + b = 0 and margin lines ±1 · L4.2 p.28-30 constraints · L4.2 p.31-35 d = 2/‖w‖ · L4.2 p.36-37 hard margin · L4.2 p.38-42 soft margin, ζ and C  
**Notes:** [L4.2 › Important terms](../notes/08_Week4_SVM.md#3-important-terms-slides-8-9-12) · [L4.2 › Hard margin: constraints and margin 2 over norm w](../notes/08_Week4_SVM.md#8-hard-margin-constraints-and-margin-2-over-norm-w-slides-27-37) · [L4.2 › Soft margin: slack zeta, C and hinge loss](../notes/08_Week4_SVM.md#9-soft-margin-slack-zeta-c-and-hinge-loss-slides-38-42)

**(a) Write:**
- **Hyperplane**: the decision boundary w·x + b = 0 (a line in 2D). Predict y = +1 if w·x + b ≥ 0, else −1.
- **Support vectors**: the points closest to the hyperplane. They alone define it.
- **Margin**: the distance between the hyperplane and the closest points (the support vectors). SVM picks the hyperplane with the **maximum margin**.

**(b) Hard margin:**
- Margin lines: L1: w·x + b = 1 (positive side), L2: w·x + b = −1 (negative side).
- Constraints: positive points w·x + b ≥ 1, negative points w·x + b ≤ −1. Multiplying by yᵢ (+1 or −1) gives one constraint: **yᵢ(w·xᵢ + b) ≥ 1**.
- Margin: take support vectors x₁ (positive) and x₂ (negative) and project x₁ − x₂ on the unit normal w/‖w‖. From w·x₁ = 1 − b and w·x₂ = −1 − b:
  d = (w·x₁ − w·x₂)/‖w‖ = ((1 − b) − (−1 − b))/‖w‖ = **2/‖w‖**.
- Problem: maximize 2/‖w‖ subject to yᵢ(w·xᵢ + b) ≥ 1, which is the same as **minimize ½‖w‖²** subject to the same constraints.

**(c) Soft margin:**
- Real data is rarely perfectly separable, so the hard margin has no solution. The soft margin allows some violations.
- Cost: J(w, b) = ½‖w‖² + C Σ ζᵢ with ζᵢ = max(0, 1 − yᵢ(wᵀxᵢ + b)) (the hinge loss).
- ζ = 0 for a point on the correct side of its margin line; 0 < ζ ≤ 1 for a correct point inside the margin; ζ > 1 for a misclassified point.
- **Large C**: violations are penalised strongly, giving a smaller margin and fewer training errors, with a risk of **overfitting**.
- **Small C**: more violations are allowed, giving a wider margin and more training errors, with a risk of **underfitting**.

---

### Q3. K-Means clustering (open)

(a) List the steps of the K-Means algorithm. Write its objective function J and the centroid formula.

(b) Name three challenges of K-Means and the solution the lecture gives for each.

(c) Explain how K-Means++ chooses the initial centroids and why it is used.

**Answer**

**Source:** L6.1 p.4-5 centroid-based, minimize the sum of distances · L6.1 p.7-9 the five steps, J and μₖ · L6.1 p.12-16 challenges · L6.1 p.17-19 solutions · L6.1 p.21 K-Means++ steps · L6.1 p.26 K-Means++ converges faster  
**Notes:** [L6.1 › The algorithm in five steps](../notes/10_Week6_KMeans_Clustering.md#2-the-algorithm-in-five-steps-slides-7-9) · [L6.1 › Challenges](../notes/10_Week6_KMeans_Clustering.md#5-challenges-slides-12-16) · [L6.1 › Solutions](../notes/10_Week6_KMeans_Clustering.md#6-solutions-slides-17-19) · [L6.1 › K-Means++ initialization](../notes/10_Week6_KMeans_Clustering.md#7-k-means-initialization-slides-21-26)

**(a) Steps:**
1. **Initialization**: randomly select K points from the dataset as the initial centroids.
2. **Assignment**: compute the distance from each point to each centroid, and assign the point to the closest centroid.
3. **Update centroids**: each centroid becomes the mean of the points assigned to it.
4. **Repeat** 2 and 3 until convergence: the centroids stop changing significantly, or a set number of iterations is reached.
5. **Final result**: the final centroids and the cluster of every point.

$$J=\sum_{k=1}^{K}\sum_{x_i\in C_k}\lVert x_i-\mu_k\rVert^2 \qquad \mu_k=\frac{1}{|C_k|}\sum_{x_i\in C_k}x_i$$

**(b) Challenges and solutions:**

| Challenge | Solution |
|---|---|
| Choosing K: too small under-clusters, too large over-clusters | Elbow method: plot inertia (J) against K and pick the K where the drop levels off |
| Clusters of different sizes or densities: dense groups are merged, loose groups are split | Use a higher number of clusters (e.g. k = 10 instead of 3) |
| Outliers drag the centroids (the mean is sensitive to extreme values) | Find and handle outliers first: remove, transform, or use a robust variant |
| Random initialization gives different clusters on every run | K-Means++ initialization |

**(c) K-Means++:**
1. Pick the first centroid uniformly at random from the data points.
2. For each point x compute D(x), the distance to the nearest centroid already chosen.
3. Pick the next centroid from the data points with probability proportional to D(x)².
4. Repeat 2-3 until K centroids are chosen, then run normal K-Means.
- Far-away points are likely to become centroids, so the starting centroids are spread out. This gives better clusters, and K-Means then often converges faster, even though the initialization itself costs more.

---

### Q4. Logistic regression: one gradient descent step (problem)

Training data (x0 = 1 is already added), learning rate α = 0.5, initial θ = [0, 0, 0]ᵀ:

| i | x0 | x1 | x2 | y |
|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 0 |
| 2 | 1 | 2 | 1 | 0 |
| 3 | 1 | 1 | 2 | 0 |
| 4 | 1 | 3 | 3 | 1 |
| 5 | 1 | 4 | 2 | 1 |

(a) Compute hθ(x) for every example and the cost J(θ) at the initial θ.

(b) Perform one gradient descent update, θ := θ − α(1/m)Xᵀ(h − y). Give the new θ.

(c) Compute the new predictions and the new cost. Did the cost go down?

(d) Write the decision boundary for the new θ, and classify x = (4, 4) and x = (0, 0).

**Answer**

**Source:** L2.2 p.10 hθ(x) = g(Xθ) · L2.2 p.12 predict 1 when h ≥ 0.5 · L2.2 p.13 decision boundary · L2.2 p.16 cost J(θ) · L2.2 p.18-30 worked three-iteration example · L2.2 p.26 vectorized update  
**Notes:** [L2.2 › Cost function: log loss, and why not MSE](../notes/04_Week2_LogisticRegression.md#7-cost-function-log-loss-and-why-not-mse-slides-14-16) · [L2.2 › Gradient descent for logistic regression](../notes/04_Week2_LogisticRegression.md#8-gradient-descent-for-logistic-regression-slides-17-25-26) · [L2.2 › Worked example: three iterations by hand](../notes/04_Week2_LogisticRegression.md#9-worked-example-three-iterations-by-hand-slides-18-31)

**(a)** With θ = 0: Z = Xθ = [0, 0, 0, 0, 0] and h = g(0) = **0.5 for every row**.
- Every row costs −log(0.5) = 0.693, whatever its label, so **J = 0.693** (= ln 2).

**(b)** h − y = [0.5, 0.5, 0.5, −0.5, −0.5].

| row of Xᵀ | dot product with h − y | Xᵀ(h − y) | ÷ m = 5 |
|---|---|---|---|
| x0: 1 1 1 1 1 | 0.5 + 0.5 + 0.5 − 0.5 − 0.5 | 0.5 | 0.1 |
| x1: 1 2 1 3 4 | 0.5 + 1 + 0.5 − 1.5 − 2 | −1.5 | −0.3 |
| x2: 1 1 2 3 2 | 0.5 + 0.5 + 1 − 1.5 − 1 | −0.5 | −0.1 |

θ = [0, 0, 0] − 0.5 · [0.1, −0.3, −0.1] = **[−0.05, 0.15, 0.05]**.

**(c)** z = −0.05 + 0.15x₁ + 0.05x₂:

| i | z | h = g(z) | y | row cost |
|---|---|---|---|---|
| 1 | 0.15 | 0.5374 | 0 | −ln(1 − 0.5374) = 0.7710 |
| 2 | 0.30 | 0.5744 | 0 | 0.8544 |
| 3 | 0.20 | 0.5498 | 0 | 0.7981 |
| 4 | 0.55 | 0.6341 | 1 | −ln 0.6341 = 0.4555 |
| 5 | 0.65 | 0.6570 | 1 | 0.4201 |

- **J = (0.7710 + 0.8544 + 0.7981 + 0.4555 + 0.4201)/5 = 0.6598**, down from 0.693. The step went in the right direction.
- Rows 1-3 still have h > 0.5, so they are still predicted 1 (wrong). More iterations are needed, as in the lecture example.

**(d)** Boundary: θᵀx = 0, i.e. **−0.05 + 0.15x₁ + 0.05x₂ = 0**, or 3x₁ + x₂ = 1.
- x = (4, 4): z = −0.05 + 0.6 + 0.2 = 0.75, h = 0.679 ≥ 0.5, so **y = 1**.
- x = (0, 0): z = −0.05, h = 0.4875 < 0.5, so **y = 0**.

---

### Q5. K-Means by hand (problem)

Seven points, K = 2, Euclidean distance. The initial centroids are B and D.

| Point | A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|---|
| (x1, x2) | (1, 1) | (1.5, 2) | (3, 4) | (5, 7) | (3.5, 5) | (4.5, 5) | (3.5, 4.5) |

(a) Iteration 1: compute the distance of every point to both centroids, assign the points and compute the new centroids.

(b) Continue until convergence. Give the final clusters and centroids.

(c) Compute the final value of the objective J (sum of squared distances to the own centroid).

**Answer**

**Source:** L6.1 p.7 assignment and J · L6.1 p.8 μₖ = mean of the cluster · L6.1 p.9 repeat until the centroids stop changing · L6.1 p.31-35 picture walkthrough  
**Notes:** [L6.1 › The algorithm in five steps](../notes/10_Week6_KMeans_Clustering.md#2-the-algorithm-in-five-steps-slides-7-9) · [L6.1 › Objective J and the centroid formula](../notes/10_Week6_KMeans_Clustering.md#3-objective-j-and-the-centroid-formula-slides-7-8) · [L6.1 › Exam focus](../notes/10_Week6_KMeans_Clustering.md#exam-focus)

**(a) Iteration 1**, μ₁ = B(1.5, 2), μ₂ = D(5, 7):

| Point | d to μ₁ | d to μ₂ | Cluster |
|---|---|---|---|
| A (1, 1) | 1.118 | 7.211 | 1 |
| B (1.5, 2) | 0 | 6.103 | 1 |
| C (3, 4) | 2.500 | 3.606 | 1 |
| D (5, 7) | 6.103 | 0 | 2 |
| E (3.5, 5) | 3.606 | 2.500 | 2 |
| F (4.5, 5) | 4.243 | 2.062 | 2 |
| G (3.5, 4.5) | 3.202 | 2.915 | 2 |

- Example: d(C, μ₁) = √((3 − 1.5)² + (4 − 2)²) = √6.25 = 2.5.
- Clusters {A, B, C} and {D, E, F, G}.
- New centroids: μ₁ = ((1 + 1.5 + 3)/3, (1 + 2 + 4)/3) = **(1.833, 2.333)**; μ₂ = ((5 + 3.5 + 4.5 + 3.5)/4, (7 + 5 + 5 + 4.5)/4) = **(4.125, 5.375)**.

**(b) Iteration 2**, μ₁ = (1.833, 2.333), μ₂ = (4.125, 5.375):

| Point | d to μ₁ | d to μ₂ | Cluster |
|---|---|---|---|
| A | 1.572 | 5.376 | 1 |
| B | 0.471 | 4.276 | 1 |
| C | 2.034 | **1.777** | **2** (moved) |
| D | 5.640 | 1.846 | 2 |
| E | 3.145 | 0.729 | 2 |
| F | 3.771 | 0.530 | 2 |
| G | 2.734 | 1.075 | 2 |

- C is now closer to μ₂, so it switches cluster: {A, B} and {C, D, E, F, G}.
- New centroids: μ₁ = **(1.25, 1.5)**; μ₂ = ((3 + 5 + 3.5 + 4.5 + 3.5)/5, (4 + 7 + 5 + 5 + 4.5)/5) = **(3.9, 5.1)**.
- **Iteration 3**: no point changes cluster (C: 3.052 vs 1.421), so the centroids stay the same and the algorithm has **converged**.
- **Final clusters: {A, B} with centroid (1.25, 1.5), and {C, D, E, F, G} with centroid (3.9, 5.1).**

**(c)** Squared distances to the own centroid:
- Cluster 1: A (0.0625 + 0.25) + B (0.0625 + 0.25) = 0.625.
- Cluster 2: C 2.02, D 4.82, E 0.17, F 0.37, G 0.52, total 7.9.
- **J = 0.625 + 7.9 = 8.525.** (After iteration 1 it was 12.208, so J went down, as it must.)

---

### Q6. Decision tree with ID3 (problem)

Will a student pass the exam?

| # | Study | Sleep | Attendance | Pass |
|---|---|---|---|---|
| 1 | Low | Enough | Poor | No |
| 2 | Low | Little | Poor | No |
| 3 | Low | Enough | Good | Yes |
| 4 | Low | Little | Poor | No |
| 5 | Medium | Enough | Poor | Yes |
| 6 | Medium | Little | Good | No |
| 7 | Medium | Enough | Good | Yes |
| 8 | Medium | Little | Poor | No |
| 9 | High | Little | Poor | Yes |
| 10 | High | Enough | Good | Yes |
| 11 | High | Little | Good | Yes |
| 12 | Medium | Enough | Poor | Yes |

(a) Compute the entropy of the whole dataset.

(b) Compute the information gain of each attribute and choose the root.

(c) Build the complete tree with ID3 (show the information gains at the second level).

(d) Predict Pass for {Study = Medium, Sleep = Little, Attendance = Good} and for {Study = Low, Sleep = Enough, Attendance = Good}.

**Answer**

**Source:** L4.1 p.15 how the tree is built · L4.1 p.22 entropy · L4.1 p.25-28 pure node = leaf · L4.1 p.29-31 information gain · L4.1 p.32-34 PlayTennis worked example  
**Notes:** [L4.1 › Entropy](../notes/07_Week4_DecisionTree.md#5-entropy-slides-22-24-28) · [L4.1 › Information gain](../notes/07_Week4_DecisionTree.md#6-information-gain-slides-29-31) · [L4.1 › Worked example: PlayTennis tree built with ID3](../notes/07_Week4_DecisionTree.md#7-worked-example-playtennis-tree-built-with-id3-slides-32-34)

**Formulas:** E(S) = −p₊ log₂ p₊ − p₋ log₂ p₋ and IG(S, a) = E(S) − Σ (|Sᵥ|/|S|) E(Sᵥ).

**(a)** 7 Yes, 5 No: E(S) = −(7/12) log₂(7/12) − (5/12) log₂(5/12) = 0.4537 + 0.5262 = **0.980**.

**(b) Root:**

| Attribute | Value: Yes/No (entropy) | Weighted E | **IG** |
|---|---|---|---|
| **Study** | Low 1/3 (0.811), Medium 3/2 (0.971), High 3/0 (0) | 4/12·0.811 + 5/12·0.971 = 0.675 | **0.305** |
| Sleep | Enough 5/1 (0.650), Little 2/4 (0.918) | 0.784 | 0.196 |
| Attendance | Poor 3/4 (0.985), Good 4/1 (0.722) | 0.876 | 0.104 |

**Study** has the highest IG, so it is the root. Study = High is pure (3/0), so it becomes a **Yes leaf**.

**(c) Second level:**
- **Study = Low** (rows 1-4, 1 Yes / 3 No, E = 0.811): Attendance gives Poor 0/3 and Good 1/0, IG = **0.811** (perfect). Sleep gives Enough 1/1 and Little 0/2, IG = 0.311. Split on **Attendance**.
- **Study = Medium** (rows 5, 6, 7, 8, 12, 3 Yes / 2 No, E = 0.971): Sleep gives Enough 3/0 and Little 0/2, IG = **0.971** (perfect). Attendance gives Poor 2/1 and Good 1/1, IG = 0.020. Split on **Sleep**.

```
Study [Yes=7, No=5]
|- Low    -> Attendance [Yes=1, No=3]
|              |- Poor   -> No  [0/3]
|              |- Good   -> Yes [1/0]
|- Medium -> Sleep [Yes=3, No=2]
|              |- Enough -> Yes [3/0]
|              |- Little -> No  [0/2]
|- High   -> Yes [3/0]
```

All leaves are pure, and the tree classifies all 12 rows correctly.

**(d)**
- {Medium, Little, Good}: Study = Medium, then Sleep = Little, so **No**. Attendance is not asked on this path.
- {Low, Enough, Good}: Study = Low, then Attendance = Good, so **Yes**.
