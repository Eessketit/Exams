# Artificial Intelligence: Midterm Sample 4

Weeks 2-6, lectures 2.1-6.2 (not W1, W7) · Part I: 10 multiple choice × 0.5 = 5 pts · Part II: 3 open questions + 3 problem-solving questions (Q6 is a decision tree) · Answer and explanation under each question

Each answer has a **Source** line with the slide pages (L4.1 p.32 = lecture 4.1 slides, page 32) and a **Notes** link to the notes section that explains it.

## Part I: Multiple choice (10 × 0.5 = 5 pts)

**1.** Linear regression with the loss J(θ) = (1/2m) Σ(hθ(x) − y)² is trained on x = [1, 2, 3], y = [2, 4, 6]. What is J at the initial θ = [0, 0]?  
a) 9.333  
b) 18.667  
c) 56  
d) 4.667

> **Answer: a)** With θ = 0 every prediction is 0, so the errors are −2, −4, −6 and their squares add up to 4 + 16 + 36 = 56. J = 56/(2 × 3) = 9.333. 18.667 = 56/3 is the MSE with 1/m; the loss in this lecture has the extra ½.  
> **Source:** L2.1 p.7 loss J(θ) = (1/2m)Σ(h − y)² · L2.1 p.19 loss computed at θ = 0  
> **Notes:** [L2.1 › Loss and the vectorised gradient descent update](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#3-loss-and-the-vectorised-gradient-descent-update-slides-7-20-22)  
> **Visual:** [Sample 4 › Part 1 Q1](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc1)

**2.** In regularized logistic regression, the penalty is (λ/2m) Σⱼ θⱼ². Which parameter is NOT regularized?  
a) θ₁  
b) The parameter of the largest feature  
c) All parameters are regularized equally  
d) θ₀, the bias

> **Answer: d)** The penalty sum runs from j = 1 to n, so θ₀ keeps the plain update θ₀ := θ₀ − α(1/m)Σ(h − y)x₀. For j ≥ 1 the gradient gets the extra term (λ/m)θⱼ. θ₀ only shifts the boundary; it does not make the model more complex.  
> **Source:** L2.2 p.44 L1 and L2 penalties · L2.2 p.45-46 regularized cost and gradient descent, θ₀ updated separately  
> **Notes:** [L2.2 › Regularisation, L1 and L2](../notes/04_Week2_LogisticRegression.md#12-regularisation-l1-and-l2-slides-44-46)  
> **Visual:** [Sample 4 › Part 1 Q2](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc2)

**3.** A classifier has TP = 30, FP = 10, FN = 20, TN = 40. What is its recall?  
a) 0.75  
b) 0.70  
c) 0.60  
d) 0.667

> **Answer: c)** Recall = TP/(TP + FN) = 30/(30 + 20) = 0.60. Precision = 30/40 = 0.75 (a), accuracy = 70/100 = 0.70 (b) and F1 = 0.667 (d). Recall looks only at the actual positives.  
> **Source:** L3.1 p.20 accuracy · L3.1 p.21 precision · L3.1 p.23 recall · L3.1 p.25 F1  
> **Notes:** [L3.1 › Accuracy, precision, recall, F1](../notes/05_Week3_EvaluatingLearningAlgorithms.md#8-accuracy-precision-recall-f1-slides-20-25)  
> **Visual:** [Sample 4 › Part 1 Q3](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc3)

**4.** In Naive Bayes, a feature value never appears together with one class in the training data, so the whole product for that class becomes 0. What fixes this zero-frequency problem?  
a) Feature scaling  
b) Laplace smoothing  
c) Removing the class  
d) Using a larger k

> **Answer: b)** Laplace smoothing adds a small count (α = 1) to every value, so no likelihood is exactly 0: P(v | c) = (count + 1)/(N_c + K). Scaling and k belong to distance-based methods such as KNN.  
> **Source:** L3.2 p.28 zero-frequency problem, fix: Laplace smoothing  
> **Notes:** [L3.2 › Advantages and disadvantages of Naive Bayes](../notes/06_Week3_NaiveBayes_KNN.md#8-advantages-and-disadvantages-of-naive-bayes-slides-27-28) · [L3.2 › Types of Naive Bayes and Laplace smoothing](../notes/06_Week3_NaiveBayes_KNN.md#9-types-of-naive-bayes-and-laplace-smoothing-textbook-context)  
> **Visual:** [Sample 4 › Part 1 Q4](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc4)

**5.** How does a random forest make each of its trees different?  
a) Each tree is trained on a bootstrapped sample of the rows (with replacement) and considers only a random subset of the features; the trees then vote  
b) Each tree uses a different impurity measure  
c) Each tree is trained on the same data with a different maximum depth  
d) Each tree is trained on the errors of the previous tree

> **Answer: a)** Random rows (bootstrap = sampling with replacement) plus a few random features at the splits keep the trees different; the final answer is the majority vote (or the average for regression). d describes boosting, which is not the random forest.  
> **Source:** L4.1 p.37 definition · L4.1 p.39-40 algorithm · L4.1 p.42-45 three bootstrapped datasets  
> **Notes:** [L4.1 › Random forest](../notes/07_Week4_DecisionTree.md#10-random-forest-slides-36-50)  
> **Visual:** [Sample 4 › Part 1 Q5](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc5)

**6.** What happens when the hyperparameter C of a soft-margin SVM is made very large?  
a) The margin gets wider and more training errors are allowed  
b) The SVM ignores the support vectors  
c) The kernel becomes linear  
d) Margin violations are penalised strongly: the margin gets smaller, there are fewer training errors, and the model may overfit

> **Answer: d)** In J = ½‖w‖² + C Σζᵢ a large C makes every violation expensive, so the SVM narrows the margin to classify the training points correctly, with a risk of overfitting. a describes a small C, which risks underfitting.  
> **Source:** L4.2 p.40 soft-margin cost with C · L4.2 p.41 large C vs small C  
> **Notes:** [L4.2 › Soft margin: slack zeta, C and hinge loss](../notes/08_Week4_SVM.md#9-soft-margin-slack-zeta-c-and-hinge-loss-slides-38-42)  
> **Visual:** [Sample 4 › Part 1 Q6](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc6)

**7.** For the data 2, 4, 4, 5, 6, 7, 8, 8, 30 we have Q1 = 4 and Q3 = 8. Which value is an outlier by the IQR rule?  
a) 2  
b) 30  
c) 8  
d) None of them

> **Answer: b)** IQR = 8 − 4 = 4. The bounds are Q1 − 1.5·IQR = −2 and Q3 + 1.5·IQR = 14. Only 30 lies outside [−2, 14].  
> **Source:** L5.2 p.13 IQR rule, bounds Q1 − 1.5·IQR and Q3 + 1.5·IQR  
> **Notes:** [L5.2 › Outliers: IQR, Z score, ML detectors](../notes/09_Week5_DataPreparation.md#5-outliers-iqr-z-score-ml-detectors-slides-13-15)  
> **Visual:** [Sample 4 › Part 1 Q7](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc7)

**8.** A fraud dataset is heavily imbalanced, and SMOTE is used to create synthetic fraud examples. Where should SMOTE be applied?  
a) On the whole dataset before splitting  
b) On the test set only  
c) On the training data only  
d) On both the training and the test set

> **Answer: c)** "SMOTE only on TRAINING data. Never resample the test set." The test set must keep the real class balance, or the scores are inflated by synthetic points (data leakage). SMOTE creates a point by interpolating between a minority point and one of its k nearest minority neighbours.  
> **Source:** L5.2 p.24 class imbalance, accuracy paradox · L5.2 p.25 SMOTE steps, training data only · L5.2 p.36 applying SMOTE to the test set is a common mistake  
> **Notes:** [L5.2 › Big data and class imbalance](../notes/09_Week5_DataPreparation.md#9-big-data-and-class-imbalance-slides-23-25)  
> **Visual:** [Sample 4 › Part 1 Q8](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc8)

**9.** What does the K-Means algorithm minimize?  
a) The sum of squared distances between each point and the centroid of its cluster  
b) The number of clusters K  
c) The distance between the centroids of different clusters  
d) The number of points in the largest cluster

> **Answer: a)** J = Σₖ Σ_{xᵢ ∈ Cₖ} ‖xᵢ − μₖ‖². Points within a cluster should be similar, so the distance from each point to its own centroid is made small. K is chosen beforehand, not minimized.  
> **Source:** L6.1 p.5 main objective · L6.1 p.7 J formula · L6.1 p.10 objective of K-Means  
> **Notes:** [L6.1 › Objective J and the centroid formula](../notes/10_Week6_KMeans_Clustering.md#3-objective-j-and-the-centroid-formula-slides-7-8)  
> **Visual:** [Sample 4 › Part 1 Q9](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc9)

**10.** Which statement about principal components is correct?  
a) They are a subset of the original variables  
b) Each one keeps the same amount of information  
c) They are always easy to interpret, like the original variables  
d) They are new uncorrelated variables built as linear combinations of the original variables

> **Answer: d)** PCs are linear combinations (mixtures) of the initial variables, constructed to be uncorrelated, with most information in the first ones. Because they mix variables they are less interpretable. Choosing a subset of the original variables (a) is feature selection.  
> **Source:** L6.2 p.6 PCs are uncorrelated linear combinations · L6.2 p.7 less interpretable, no real meaning  
> **Notes:** [L6.2 › Principal components](../notes/11_Week6_PCA.md#2-principal-components-slides-6-7)  
> **Visual:** [Sample 4 › Part 1 Q10](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-mc10)

## Part II: Open questions and problem solving

### Q1. Logistic regression (open)

(a) Why does linear regression fail for classification? Use the tumour-size example.

(b) Write the hypothesis of logistic regression and explain how its output is interpreted and how it gives a decision boundary.

(c) Write the cost function of logistic regression. Why is the squared-error cost of linear regression not used?

**Answer**

**Source:** L2.2 p.6-8 linear regression with threshold 0.5 and the extreme tumour · L2.2 p.9 h can be > 1 or < 0 · L2.2 p.10 sigmoid · L2.2 p.11 probability · L2.2 p.12-13 threshold and decision boundary · L2.2 p.14-16 cost  
**Notes:** [L2.2 › Why linear regression fails for classification](../notes/04_Week2_LogisticRegression.md#3-why-linear-regression-fails-for-classification-slides-6-9) · [L2.2 › Hypothesis: the sigmoid function](../notes/04_Week2_LogisticRegression.md#4-hypothesis-the-sigmoid-function-slides-10-12) · [L2.2 › Decision boundary, linear and non linear](../notes/04_Week2_LogisticRegression.md#6-decision-boundary-linear-and-non-linear-slides-13-42) · [L2.2 › Cost function: log loss, and why not MSE](../notes/04_Week2_LogisticRegression.md#7-cost-function-log-loss-and-why-not-mse-slides-14-16)  
**Visual:** [Sample 4 › Part 2 Q1 Logistic regression](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-w1)

**(a)**
- Fit a straight line hθ(x) = Xθ to tumour size vs malignant (0/1) and predict y = 1 when h ≥ 0.5.
- On clean data the 0.5 crossing separates the classes. Add one very large malignant tumour far to the right: the least-squares line flattens, its 0.5 crossing moves right, and some malignant tumours are now predicted benign. One correct but extreme example ruins the classifier.
- Also, y is 0 or 1, but a straight line can output values > 1 or < 0. Logistic regression keeps 0 ≤ hθ(x) ≤ 1.

**(b)**
- **hθ(x) = g(θᵀx), g(z) = 1/(1 + e⁻ᶻ)** (the sigmoid / logistic function). g(0) = 0.5, g → 1 as z → ∞, g → 0 as z → −∞.
- Interpretation: hθ(x) = P(y = 1 | x; θ). If h = 0.7, tell the patient there is a 70% chance the tumour is malignant; P(y = 0 | x; θ) = 0.3.
- Decision: predict y = 1 if h ≥ 0.5, which happens exactly when θᵀx ≥ 0. The **decision boundary** is θᵀx = 0. Example θ = [−3, 1, 1]: predict 1 when x₁ + x₂ ≥ 3, so the boundary is the line x₁ + x₂ = 3. Polynomial features (x₁², x₂², ...) give a curved boundary.

**(c)**
- Per example: Cost = −log(hθ(x)) if y = 1, and −log(1 − hθ(x)) if y = 0. Compact form: −y log h − (1 − y) log(1 − h).
- J(θ) = −(1/m) Σ [y⁽ⁱ⁾ log hθ(x⁽ⁱ⁾) + (1 − y⁽ⁱ⁾) log(1 − hθ(x⁽ⁱ⁾))].
- A confident wrong answer is punished hard: for y = 1 the cost → ∞ as h → 0, and it is 0 at h = 1.
- Why not MSE (textbook context): with the sigmoid inside, (h − y)² gives a **non-convex** J with flat regions and local minima, so gradient descent can get stuck. The log loss is convex, with one global minimum.

---

### Q2. K-nearest neighbours (open)

(a) Describe the KNN algorithm for classification and for regression. Why is it called lazy and non-parametric?

(b) Give the Euclidean, Manhattan and Minkowski distances, and when each is used.

(c) How is k chosen, and what happens when k is very small or very large? Give the advantages and limitations of KNN.

**Answer**

**Source:** L3.2 p.33 similarity, non-parametric · L3.2 p.35-37 distance measures · L3.2 p.39 classification and regression · L3.2 p.41 lazy · L3.2 p.46-49 choosing k · L3.2 p.51-53 pros and cons  
**Notes:** [L3.2 › KNN: idea and properties](../notes/06_Week3_NaiveBayes_KNN.md#11-knn-idea-and-properties-slides-33-39-41) · [L3.2 › Distance measures](../notes/06_Week3_NaiveBayes_KNN.md#12-distance-measures-slides-35-37) · [L3.2 › Choosing k](../notes/06_Week3_NaiveBayes_KNN.md#14-choosing-k-slides-46-49) · [L3.2 › KNN pros and cons](../notes/06_Week3_NaiveBayes_KNN.md#16-knn-pros-and-cons-slides-51-53)  
**Visual:** [Sample 4 › Part 2 Q2 KNN](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-w2)

**(a)**
1. Choose k and a distance function.
2. Compute the distance from the new point to **every** training point.
3. Rank the distances and take the k closest points.
4. Classification: the **most frequent** label among the k neighbours. Regression: the **average** of their values.
- Assumption: similar data points lie close together.
- **Non-parametric**: it learns no parameters, it memorizes the training set. **Lazy**: no modelling at training time; all the work happens at prediction time.

**(b)**

| Distance | Formula | Use |
|---|---|---|
| Euclidean | √((x₂ − x₁)² + (y₂ − y₁)²) | straight line; continuous features (height, salary); the default |
| Manhattan | Σ\|xᵢ − yᵢ\| | grid-like paths; integer features |
| Minkowski | (Σ\|xᵢ − yᵢ\|ᵖ)^(1/p) | general form: p = 1 Manhattan, p = 2 Euclidean |

**(c)**
- Split the data into train and test, try different k, and plot the error rate against k. Choose the **elbow**, where a larger k barely lowers the error (k = 5 on slide 49).
- Small k (k = 1) follows single noisy points: it **overfits**. Large k smooths the prediction; k = N always predicts the majority class.
- Advantages: simple, adaptable (new samples are used at once), easy to program (only k and a distance metric to set).
- Limitations: difficult to scale (stores all the data, scans it for every prediction), curse of dimensionality (distances grow with the number of dimensions), overfitting with small k.

---

### Q3. Kernels in SVM (open)

(a) When is a linear SVM enough, and when is a non-linear SVM needed? Explain the idea of a kernel with an example.

(b) Name the kernels from the lecture with their formulas and hyperparameters.

(c) List the advantages and disadvantages of SVM.

**Answer**

**Source:** L4.2 p.6-7 linear vs non-linear SVM · L4.2 p.44 data no line can split · L4.2 p.45-46 map to a higher dimension · L4.2 p.47 polynomial kernel · L4.2 p.48 sigmoid kernel · L4.2 p.49 advantages, disadvantages, C and gamma  
**Notes:** [L4.2 › Types: linear vs non-linear SVM](../notes/08_Week4_SVM.md#2-types-linear-vs-non-linear-svm-slides-6-7) · [L4.2 › Kernels and the kernel trick](../notes/08_Week4_SVM.md#10-kernels-and-the-kernel-trick-slides-43-48) · [L4.2 › Advantages and disadvantages](../notes/08_Week4_SVM.md#11-advantages-and-disadvantages-slide-49)  
**Visual:** [Sample 4 › Part 2 Q3 SVM kernels](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-w3)

**(a)**
- **Linear SVM**: the data is linearly separable, one straight line (hyperplane) splits the two classes.
- **Non-linear SVM**: no straight line separates them, e.g. 1D data green-red-green, or a green disk inside a red ring (slide 44).
- Kernel idea: **map the data to a higher dimension** where a hyperplane does separate the classes. Example: points x = −3 ... 3, class + when |x| ≥ 2. No threshold on x works, but with φ(x) = x² the values become 9, 4, 1, 0, 1, 4, 9, and x² = 2.5 separates the classes. In 2D, adding x₁² + x₂² lifts the inner disk below the ring, and a flat plane cuts them apart (slide 46).
- Kernel trick (textbook context): the SVM needs only dot products, so K(xᵢ, xⱼ) gives φ(xᵢ)·φ(xⱼ) directly, without ever computing φ.

**(b)**

| Kernel | Formula | Hyperparameters |
|---|---|---|
| Linear | K(x, z) = xᵀz | C |
| Polynomial (slide 47) | (X1ᵀ · X2 + 1)^d | degree d (set manually), C |
| Sigmoid (slide 48) | tanh(α xᵀy + c) | α, c; "a proxy for neural networks" |
| RBF / Gaussian | exp(−γ‖x − z‖²) | γ and C |

- Which kernel to use is decided by **hyperparameter tuning**. A large γ gives a wiggly boundary that overfits; a small γ gives a smooth, almost linear one.

**(c)**

| Advantages | Disadvantages |
|---|---|
| Works well when the data is linear | Choosing a good kernel is not easy |
| More effective in high dimensions | Does not give good results on big datasets |
| The kernel trick solves complex problems | Hyperparameters C and γ are hard to tune and their effect is hard to visualize |
| Not sensitive to outliers (only the support vectors matter) | |
| Useful for image classification | |

---

### Q4. Evaluating a classifier and a regressor (problem)

(a) A classifier is tested on 12 examples (1 = positive):

| Example | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Actual | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| Predicted | 1 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1 |

Build the confusion matrix and compute accuracy, precision, recall and F1.

(b) A regression model predicts h = [2.5, 5.5, 7, 8, 12] for the targets y = [3, 5, 7, 9, 11]. Compute MSE, RMSE, MAE and R².

**Answer**

**Source:** L3.1 p.14 confusion matrix · L3.1 p.20-25 accuracy, precision, recall, F1 · L3.1 p.10-12 MSE, RMSE, MAE · L3.1 p.13 R² · L3.1 p.26-27 implementation  
**Notes:** [L3.1 › Confusion matrix and axis layout](../notes/05_Week3_EvaluatingLearningAlgorithms.md#7-confusion-matrix-and-axis-layout-slides-14-19) · [L3.1 › Accuracy, precision, recall, F1](../notes/05_Week3_EvaluatingLearningAlgorithms.md#8-accuracy-precision-recall-f1-slides-20-25) · [L3.1 › Regression metrics: MSE, RMSE, MAE](../notes/05_Week3_EvaluatingLearningAlgorithms.md#4-regression-metrics-mse-rmse-mae-slides-10-12) · [L3.1 › R-squared](../notes/05_Week3_EvaluatingLearningAlgorithms.md#5-r-squared-slide-13)  
**Visual:** [Sample 4 › Part 2 Q4 Evaluation metrics](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-w4)

**(a)** Label each example:

| Example | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Outcome | TP | TP | FN | TP | FN | TN | FP | TN | TN | TN | TN | TP |

TP = 4, FN = 2, FP = 1, TN = 5 (total 12).

| | Actual Positive | Actual Negative |
|---|---|---|
| **Predicted Positive** | TP = 4 | FP = 1 |
| **Predicted Negative** | FN = 2 | TN = 5 |

- Accuracy = (4 + 5)/12 = **75%**
- Precision = 4/(4 + 1) = **0.80**
- Recall = 4/(4 + 2) = **0.667**
- F1 = 2 · 0.8 · 0.667/(0.8 + 0.667) = **0.727**
- The model raises few false alarms (high precision) but misses a third of the positives (lower recall).

**(b)** Errors h − y = [−0.5, 0.5, 0, −1, 1]; ȳ = 35/5 = 7.

| i | h | y | h − y | (h − y)² | \|h − y\| | (y − ȳ)² |
|---|---|---|---|---|---|---|
| 1 | 2.5 | 3 | −0.5 | 0.25 | 0.5 | 16 |
| 2 | 5.5 | 5 | 0.5 | 0.25 | 0.5 | 4 |
| 3 | 7 | 7 | 0 | 0 | 0 | 0 |
| 4 | 8 | 9 | −1 | 1 | 1 | 4 |
| 5 | 12 | 11 | 1 | 1 | 1 | 16 |
| Σ | | | | 2.5 | 3 | 40 |

- MSE = 2.5/5 = **0.5**
- RMSE = √0.5 = **0.707** (in the units of y)
- MAE = 3/5 = **0.6**
- R² = 1 − 2.5/40 = **0.9375**: the model explains about 94% of the variance.

---

### Q5. K-Means++ and the elbow method (problem)

Points A(1, 2), B(2, 1), C(5, 4), D(6, 5), E(9, 8). Use squared Euclidean distance.

(a) K-Means++ picks C(5, 4) as the first centroid. Compute D(x)² for every point and the probability of each point becoming the second centroid.

(b) Suppose the second centroid is E. Run K-Means with K = 2 from centroids C and E until convergence. Give the clusters and J.

(c) Repeat (b) with the second centroid A instead. Which result is better, and what does this show?

(d) The best possible J for K = 1 to 5 is 71.2, 18.33, 2.0, 1.0 and 0. Which K does the elbow method choose?

**Answer**

**Source:** L6.1 p.7-9 K-Means steps and J · L6.1 p.19 random initialization problem · L6.1 p.21 K-Means++ steps · L6.1 p.22-23 worked table on the same five points · L6.1 p.28-30 elbow curve  
**Notes:** [L6.1 › K-Means++ initialization](../notes/10_Week6_KMeans_Clustering.md#7-k-means-initialization-slides-21-26) · [L6.1 › The algorithm in five steps](../notes/10_Week6_KMeans_Clustering.md#2-the-algorithm-in-five-steps-slides-7-9) · [L6.1 › Choosing the right K: the elbow curve](../notes/10_Week6_KMeans_Clustering.md#8-choosing-the-right-k-the-elbow-curve-slides-28-30)  
**Visual:** [Sample 4 › Part 2 Q5 K-Means++](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-w5)

**(a)**

| Point | D(x)² to C(5, 4) | Probability |
|---|---|---|
| A (1, 2) | 16 + 4 = 20 | 20/72 = 0.278 |
| B (2, 1) | 9 + 9 = 18 | 18/72 = 0.250 |
| C (5, 4) | 0 | 0 |
| D (6, 5) | 1 + 1 = 2 | 2/72 = 0.028 |
| E (9, 8) | 16 + 16 = 32 | 32/72 = **0.444** |
| sum | 72 | 1 |

E is the most likely second centroid, A the second most likely.

**(b)** Centroids C(5, 4) and E(9, 8):
- Iteration 1 (squared distances to C / to E): A 20 / 100, B 18 / 98, C 0 / 32, D 2 / 18, E 32 / 0. Clusters **{A, B, C, D}** and **{E}**.
- New centroids: (14/4, 12/4) = **(3.5, 3)** and **(9, 8)**.
- Iteration 2: A 7.25 / 100, B 6.25 / 98, C 3.25 / 32, D 10.25 / 18, so nothing changes: **converged**.
- J = 7.25 + 6.25 + 3.25 + 10.25 + 0 = **27**.

**(c)** Centroids C(5, 4) and A(1, 2):
- Iteration 1: A and B go to A (0 and 2 vs 20 and 18); C, D, E go to C (0, 2, 32 vs 20, 34, 100). Clusters **{A, B}** and **{C, D, E}**.
- New centroids: **(1.5, 1.5)** and **(6.667, 5.667)**. Iteration 2: no change, so converged.
- J = (0.5 + 0.5) + (5.556 + 0.889 + 10.889) = **18.33**.
- **(c) is better** (18.33 < 27). K-Means only finds a local minimum, and the result depends on the initial centroids. K-Means++ makes good starts likely but not certain; in practice K-Means is run several times and the lowest J is kept (textbook context).

**(d)** The drops are 71.2 → 18.33 (−52.9), → 2.0 (−16.3), → 1.0 (−1.0), → 0 (−1.0). After K = 3 the curve flattens, so the elbow is **K = 3**: clusters {A, B}, {C, D}, {E}.

---

### Q6. Decision tree with ID3 (problem)

Is an email spam?

| # | Link | Known sender | Attachment | Spam |
|---|---|---|---|---|
| 1 | Yes | No | No | Yes |
| 2 | Yes | No | Yes | Yes |
| 3 | Yes | Yes | No | No |
| 4 | No | No | No | No |
| 5 | No | Yes | Yes | No |
| 6 | Yes | No | No | Yes |
| 7 | No | No | No | No |
| 8 | No | Yes | No | No |
| 9 | Yes | Yes | Yes | No |
| 10 | No | No | Yes | Yes |
| 11 | Yes | No | Yes | Yes |
| 12 | No | Yes | No | No |

(a) Compute the entropy of the dataset and the information gain of each attribute. Choose the root.

(b) Find the best attribute for the impure branch of the root, and continue until all leaves are pure.

(c) Draw the final tree.

(d) Classify {Link = No, Known = No, Attachment = Yes} and {Link = Yes, Known = Yes, Attachment = Yes}.

**Answer**

**Source:** L4.1 p.15 how the tree is built · L4.1 p.22 entropy · L4.1 p.25-28 pure node = leaf · L4.1 p.29-31 information gain · L4.1 p.32-34 PlayTennis worked example  
**Notes:** [L4.1 › Entropy](../notes/07_Week4_DecisionTree.md#5-entropy-slides-22-24-28) · [L4.1 › Information gain](../notes/07_Week4_DecisionTree.md#6-information-gain-slides-29-31) · [L4.1 › Worked example: PlayTennis tree built with ID3](../notes/07_Week4_DecisionTree.md#7-worked-example-playtennis-tree-built-with-id3-slides-32-34)  
**Visual:** [Sample 4 › Part 2 Q6 Decision tree](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s4-w6)

**(a)** 5 Yes, 7 No: E(S) = −(5/12) log₂(5/12) − (7/12) log₂(7/12) = **0.980**.

| Attribute | Value: Yes/No (entropy) | Weighted E | **IG** |
|---|---|---|---|
| **Known** | No 5/2 (0.863), Yes 0/5 (0) | 7/12·0.863 = 0.503 | **0.476** |
| Link | Yes 4/2 (0.918), No 1/5 (0.650) | 0.784 | 0.196 |
| Attachment | No 2/5 (0.863), Yes 3/2 (0.971) | 0.908 | 0.072 |

**Known sender** is the root. Known = Yes is pure (0/5), so it becomes a **No leaf**.

**(b)** Branch **Known = No** (rows 1, 2, 4, 6, 7, 10, 11: 5 Yes / 2 No, E = 0.863):
- Link: Yes 4/0 (0), No 1/2 (0.918); weighted 3/7·0.918 = 0.394; IG = **0.470**.
- Attachment: No 2/2 (1), Yes 3/0 (0); weighted 4/7·1 = 0.571; IG = 0.292.
- Split on **Link**. Both attributes give one pure child, but Link's pure child is bigger (4 rows vs 3) and its impure child smaller, so it removes more entropy.

Branch **Known = No, Link = No** (rows 4, 7, 10: 1 Yes / 2 No, E = 0.918):
- Attachment: No 0/2, Yes 1/0, IG = **0.918** (perfect). Split on **Attachment**.

**(c)**

```
Known [Yes=5, No=7]
|- Yes -> No [0/5]
|- No  -> Link [Yes=5, No=2]
            |- Yes -> Yes [4/0]
            |- No  -> Attachment [Yes=1, No=2]
                        |- Yes -> Yes [1/0]
                        |- No  -> No  [0/2]
```

**(d)**
- {Link = No, Known = No, Attachment = Yes}: Known = No, then Link = No, then Attachment = Yes, so **Spam**.
- {Link = Yes, Known = Yes, Attachment = Yes}: Known = Yes, so **Not spam**. One question is enough.
