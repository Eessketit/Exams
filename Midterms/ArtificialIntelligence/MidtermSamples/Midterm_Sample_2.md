# Artificial Intelligence: Midterm Sample 2

Weeks 2-6, lectures 2.1-6.2 (not W1, W7) · Part I: 10 multiple choice × 0.5 = 5 pts · Part II: 3 open questions + 3 problem-solving questions (Q6 is a decision tree) · Answer and explanation under each question

Each answer has a **Source** line with the slide pages (L4.1 p.32 = lecture 4.1 slides, page 32) and a **Notes** link to the notes section that explains it.

## Part I: Multiple choice (10 × 0.5 = 5 pts)

**1.** Which statement about gradient descent and the normal equation is TRUE?  
a) The normal equation needs a learning rate α  
b) The normal equation needs many iterations to reach the optimum  
c) The normal equation becomes very slow when the number of features is very large, because (XᵀX)⁻¹ must be computed  
d) Gradient descent does not need a learning rate

> **Answer: c)** Slide 42: the normal equation needs no α and no iterations, but it "needs to calculate (XᵀX)⁻¹" and is "very slow if the number of features is very large". Gradient descent needs α and many iterations, and is "very good if the number of features is very large".  
> **Source:** L2.1 p.42 gradient descent vs normal equation table  
> **Notes:** [L2.1 › Gradient descent vs normal equation](../notes/03_Week2_MultivariateRegression_NormalEquation_Polynomial.md#8-gradient-descent-vs-normal-equation-slide-42)  
> **Visual:** [Sample 2 › Part 1 Q1](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc1)

**2.** For one training example with y = 1, logistic regression outputs hθ(x) = 0.1. What is the cost of this example (natural log)?  
a) 0.105  
b) 2.303  
c) 0.693  
d) 0.9

> **Answer: b)** For y = 1, Cost = −log(hθ(x)) = −ln 0.1 = 2.303. The model gave only 10% to the true class, a confident wrong answer, so the cost is large. 0.105 = −ln 0.9 is the cost when h = 0.9 (a good prediction); 0.693 is the cost at h = 0.5.  
> **Source:** L2.2 p.15 Cost = −log(h) if y = 1 and −log(1 − h) if y = 0, with the two cost curves · L2.2 p.16 compact form  
> **Notes:** [L2.2 › Cost function: log loss, and why not MSE](../notes/04_Week2_LogisticRegression.md#7-cost-function-log-loss-and-why-not-mse-slides-14-16)  
> **Visual:** [Sample 2 › Part 1 Q2](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc2)

**3.** A regression model has SS_res = Σ(y − ŷ)² = 20 and SS_tot = Σ(y − ȳ)² = 80 on the test set. What is R²?  
a) 0.25  
b) 4  
c) −3  
d) 0.75

> **Answer: d)** R² = 1 − SS_res/SS_tot = 1 − 20/80 = 0.75: the model explains 75% of the variance of the target. 0.25 is the ratio SS_res/SS_tot itself. R² = 1 is a perfect fit and R² = 0 is no better than always predicting the mean.  
> **Source:** L3.1 p.13 R² formula, close to 1 = good fit · L3.1 p.26 code uses Σ(y − y_mean)² in the denominator  
> **Notes:** [L3.1 › R-squared](../notes/05_Week3_EvaluatingLearningAlgorithms.md#5-r-squared-slide-13)  
> **Visual:** [Sample 2 › Part 1 Q3](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc3)

**4.** The Minkowski distance with p = 1 between the points (1, 2) and (4, 6) is:  
a) 7  
b) 5  
c) 4.50  
d) 25

> **Answer: a)** Minkowski with p = 1 is the Manhattan distance: |1 − 4| + |2 − 6| = 3 + 4 = 7. p = 2 gives the Euclidean distance √(9 + 16) = 5; p = 3 gives (27 + 64)^(1/3) = 4.50; 25 is the squared Euclidean distance.  
> **Source:** L3.2 p.35 Euclidean · L3.2 p.36 Manhattan · L3.2 p.37 Minkowski, p = 1 Manhattan, p = 2 Euclidean  
> **Notes:** [L3.2 › Distance measures](../notes/06_Week3_NaiveBayes_KNN.md#12-distance-measures-slides-35-37)  
> **Visual:** [Sample 2 › Part 1 Q4](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc4)

**5.** Bayes theorem, as used by the Naive Bayes classifier, states that P(A | B) =  
a) P(A) · P(B)  
b) P(B | A) · P(B) / P(A)  
c) P(B | A) · P(A) / P(B)  
d) P(A | B) · P(B)

> **Answer: c)** P(A | B) = P(B | A) P(A) / P(B). In the classifier A is the class (Buy / No Buy) and B is the features. a holds only for independent events, and b swaps the prior and the evidence.  
> **Source:** L3.2 p.7 Bayes theorem · L3.2 p.16 A = class, B = features  
> **Notes:** [L3.2 › Probability basics and Bayes theorem](../notes/06_Week3_NaiveBayes_KNN.md#2-probability-basics-and-bayes-theorem-slides-4-9)  
> **Visual:** [Sample 2 › Part 1 Q5](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc5)

**6.** Which decision tree algorithm chooses splits by Gini impurity and can be used for both classification and regression?  
a) ID3  
b) CART  
c) C4.5  
d) KNN

> **Answer: b)** CART uses the Gini impurity and does both classification and regression. ID3 uses entropy (information gain). C4.5 is an improved ID3 that handles missing data and continuous attributes. KNN is not a tree.  
> **Source:** L4.1 p.6-8 types of decision trees: ID3, C4.5, CART  
> **Notes:** [L4.1 › Decision tree definition and types: ID3, C4.5, CART](../notes/07_Week4_DecisionTree.md#2-decision-tree-definition-and-types-id3-c45-cart-slides-5-8)  
> **Visual:** [Sample 2 › Part 1 Q6](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc6)

**7.** Using the polynomial kernel K(x, z) = (xᵀz + 1)^d with d = 2, x = (1, 2) and z = (3, −1), the kernel value is:  
a) 1  
b) 2  
c) 9  
d) 4

> **Answer: d)** xᵀz = 1·3 + 2·(−1) = 1, so K = (1 + 1)² = 4. 1 is the plain dot product (linear kernel), 2 forgets the square, and 9 squares the wrong sum.  
> **Source:** L4.2 p.47 polynomial kernel (X1ᵀ·X2 + 1)^d  
> **Notes:** [L4.2 › Kernels and the kernel trick](../notes/08_Week4_SVM.md#10-kernels-and-the-kernel-trick-slides-43-48)  
> **Visual:** [Sample 2 › Part 1 Q7](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc7)

**8.** A feature has min = 20 and max = 80 in the training set. Min-max scaling maps the value x = 35 to:  
a) 0.25  
b) 0.35  
c) 0.44  
d) −0.25

> **Answer: a)** x′ = (x − min)/(max − min) = (35 − 20)/(80 − 20) = 15/60 = 0.25. Min-max scaling maps the training range to [0, 1]. 0.44 would be 35/80, which skips subtracting the min.  
> **Source:** L5.2 p.18-19 Min-Max scaling (x − min)/(max − min), output [0, 1]  
> **Notes:** [L5.2 › Feature scaling](../notes/09_Week5_DataPreparation.md#7-feature-scaling-slides-18-20)  
> **Visual:** [Sample 2 › Part 1 Q8](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc8)

**9.** K-Means++ on the points A(1, 2), B(2, 1), C(5, 4), D(6, 5), E(9, 8). The first centroid is A. Squared distances to A are 0, 2, 20, 34, 100. What is the probability that E becomes the second centroid?  
a) 0.2  
b) 1.0  
c) 0.641  
d) 0.218

> **Answer: c)** The next centroid is chosen with probability proportional to D(x)²: P(E) = 100/(0 + 2 + 20 + 34 + 100) = 100/156 = 0.641. 0.218 = 34/156 is P(D). K-Means++ does not always take the farthest point (b); it only makes it the most likely choice.  
> **Source:** L6.1 p.21 K-Means++ steps, probability proportional to D(x)² · L6.1 p.22 worked table with the probabilities  
> **Notes:** [L6.1 › K-Means++ initialization](../notes/10_Week6_KMeans_Clustering.md#7-k-means-initialization-slides-21-26)  
> **Visual:** [Sample 2 › Part 1 Q9](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc9)

**10.** In the step-by-step PCA, which step comes right after computing the covariance matrix S?  
a) Projecting the centred data on u₁  
b) Computing the eigenvalues from det(S − λI) = 0  
c) Computing the mean of each variable  
d) Computing the eigenvectors from (S − λI)U = 0

> **Answer: b)** The order is: 1 mean, 2 covariance matrix, 3 eigenvalues from det(S − λI) = 0, 4 eigenvectors from (S − λI)U = 0, 5 projection of the centred data on the first eigenvector. The eigenvectors need λ first, so d is step 4.  
> **Source:** L6.2 p.14 steps 1-2 · L6.2 p.15 steps 3-4 · L6.2 p.16 step 5  
> **Notes:** [L6.2 › Step by step](../notes/11_Week6_PCA.md#4-step-by-step-slides-14-16)  
> **Visual:** [Sample 2 › Part 1 Q10](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-mc10)

## Part II: Open questions and problem solving

### Q1. Classification metrics (open)

(a) Draw the confusion matrix of a binary classifier and define TP, FP, FN and TN.

(b) Give the formulas of accuracy, precision, recall and F1-score, and the question that precision and recall each answer.

(c) Which metric should a spam filter prioritise, and which one a cancer screening test? Why can accuracy be misleading?

**Answer**

**Source:** L3.1 p.14 confusion matrix layout · L3.1 p.20 accuracy · L3.1 p.21-22 precision, spam detection · L3.1 p.23-24 recall, cancer screening and airport security · L3.1 p.25 F1  
**Notes:** [L3.1 › Confusion matrix and axis layout](../notes/05_Week3_EvaluatingLearningAlgorithms.md#7-confusion-matrix-and-axis-layout-slides-14-19) · [L3.1 › Accuracy, precision, recall, F1](../notes/05_Week3_EvaluatingLearningAlgorithms.md#8-accuracy-precision-recall-f1-slides-20-25)  
**Visual:** [Sample 2 › Part 2 Q1 Classification metrics](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-w1)

**(a) Draw** (slide 14 layout: columns = actual, rows = predicted):

| | Actual Positive | Actual Negative |
|---|---|---|
| **Predicted Positive** | TP | FP |
| **Predicted Negative** | FN | TN |

- **TP**: predicted positive, actually positive. **TN**: predicted negative, actually negative.
- **FP**: predicted positive, actually negative (a false alarm). **FN**: predicted negative, actually positive (a miss).
- Read the name as: second word = what the model predicted, first word = whether that prediction was right. On the exam, always check which axis is "Actual" before reading off FP and FN.

**(b)**
- Accuracy = (TP + TN)/(TP + TN + FP + FN) · 100%: the share of all predictions that are correct.
- Precision = TP/(TP + FP): "Of all the alarms the model raised, how many were real?" It looks only at the positive predictions.
- Recall (sensitivity) = TP/(TP + FN): "Of all the real positives out there, how many did the model actually catch?" It looks only at the actual positives.
- F1 = 2 · Precision · Recall / (Precision + Recall): the harmonic mean, one number that balances both.

**(c)**
- **Spam filter: precision.** An FP puts a real email (a job offer) into spam, and users stop trusting the filter.
- **Cancer screening: recall.** An FN (a missed cancer) can be fatal, while a false alarm only costs an extra test. Airport weapon detection is the same case.
- **Accuracy misleads on imbalanced data.** With 95 negatives and 5 positives, a model that always says "negative" has 95% accuracy but recall 0: it never finds a positive. Use precision, recall and F1 instead.

---

### Q2. Random forest (open)

(a) What is a random forest?

(b) Describe the steps used to build a random forest and to make a prediction with it.

(c) Why does a random forest overfit less than a single decision tree? List its key features.

**Answer**

**Source:** L4.1 p.37 definition · L4.1 p.39-40 algorithm · L4.1 p.42-46 three bootstrapped trees and the vote · L4.1 p.48 key features · L4.1 p.50 assumptions · L4.1 p.19 single trees overfit  
**Notes:** [L4.1 › Random forest](../notes/07_Week4_DecisionTree.md#10-random-forest-slides-36-50) · [L4.1 › Stopping, overfitting and pruning](../notes/07_Week4_DecisionTree.md#9-stopping-overfitting-and-pruning-slides-12-16-19-20-25)  
**Visual:** [Sample 2 › Part 2 Q2 Random forest](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-w2)

**(a)** A random forest is an **ensemble of many decision trees**. Each tree sees a random part of the data, and the predictions are combined: **majority voting** for classification, **averaging** for regression.

**(b) Steps:**
1. Build many trees, each on a **bootstrapped dataset**: rows sampled from the original **with replacement**, same size as the original. Some rows appear twice, others are left out.
2. At each split, look at only a **few random features**, not all of them (e.g. one tree on Outlook, Humidity, Wind; another on Outlook, Temp, Humidity).
3. Each tree makes its own prediction for the new example.
4. Combine: majority vote (classification) or average (regression). In the slide 46 example all three trees say No, so the forest says **No**.

**(c)**
- A single deep tree learns the noise in its training data (overfitting). The trees of a forest are built on different rows and different features, so they make different errors. The vote averages those errors out. The slide's assumption: "diverse predictions improve accuracy".
- Key features (slide 48): handles missing data, gives feature importance, works with big and complex data, and does both classification and regression.
- Assumptions (slide 50): trees decide independently, they are built on random rows and features, and there must be enough data for the trees to differ.

---

### Q3. Principal component analysis (open)

(a) What is PCA, and why do we use it?

(b) What are principal components? Explain how the first and second principal components are constructed.

(c) List the five steps of PCA, with their formulas.

**Answer**

**Source:** L6.2 p.4-5 what PCA is · L6.2 p.6-7 principal components · L6.2 p.8 directions of maximal variance · L6.2 p.10-12 PC1 and PC2 · L6.2 p.14-16 the five steps  
**Notes:** [L6.2 › What PCA is](../notes/11_Week6_PCA.md#1-what-pca-is-slides-4-5) · [L6.2 › Principal components](../notes/11_Week6_PCA.md#2-principal-components-slides-6-7) · [L6.2 › Geometric view: directions of maximum variance](../notes/11_Week6_PCA.md#3-geometric-view-directions-of-maximum-variance-slides-8-10-12) · [L6.2 › Step by step](../notes/11_Week6_PCA.md#4-step-by-step-slides-14-16)  
**Visual:** [Sample 2 › Part 2 Q3 PCA concepts](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-w3)

**(a)**
- PCA is a **dimensionality reduction** method: it transforms a large set of variables into a smaller one that still contains most of the information.
- Why: smaller data sets are easier to explore and visualize, and faster for ML algorithms. We trade a little accuracy for simplicity. The idea: reduce the number of variables while preserving as much information as possible.

**(b)**
- Principal components are **new variables built as linear combinations** of the initial variables. They are **uncorrelated**, and most of the information is squeezed into the first ones. p variables give p components.
- Geometrically they are the **directions of maximal variance**. More variance along a line means more spread, which means more information.
- **PC1**: the line through the centred data on which the projected points are the most spread out, i.e. that maximizes the variance of the projections.
- **PC2**: computed the same way, with the condition that it is **uncorrelated with (perpendicular to) PC1** and carries the next highest variance. This continues until all p components are found.
- The components have no real meaning (they are less interpretable), because each one mixes all the original variables.

**(c) Steps:**
1. Mean of each variable: X̄ = Σxᵢ/m, then centre the data (subtract the mean).
2. Covariance matrix S = [[Cov(X₁,X₁), Cov(X₁,X₂)], [Cov(X₂,X₁), Cov(X₂,X₂)]], with Cov(x, y) = (1/(n − 1)) Σ(xᵢ − x̄)(yᵢ − ȳ).
3. Eigenvalues: solve det(S − λI) = 0.
4. Eigenvectors: solve (S − λI)U = 0 and normalize. The eigenvector of the largest eigenvalue is u₁.
5. First principal component: transformed data = X_centered · u₁.

---

### Q4. Naive Bayes: the shopping dataset (problem)

The lecture's shopping dataset has 15 records, 10 Buy = Yes and 5 Buy = No. Frequency table:

| Feature | Value | Buy = Yes | Buy = No | Total |
|---|---|---|---|---|
| Day | Weekday | 4 | 1 | 5 |
| Day | Weekend | 2 | 2 | 4 |
| Day | Holiday | 4 | 2 | 6 |
| Discount | Yes | 8 | 2 | 10 |
| Discount | No | 2 | 3 | 5 |
| Free Delivery | Yes | 9 | 2 | 11 |
| Free Delivery | No | 1 | 3 | 4 |

(a) Build the likelihood table: P(value | Yes), P(value | No) and P(value), plus the priors.

(b) A customer comes on a **Weekend**, with **Discount = Yes** and **Free Delivery = No**. Using the lecture's method, compute P(Buy | X) and P(No Buy | X), normalize them, and predict.

(c) Using Bayes theorem with one feature only, compute P(No Buy | Weekend).

(d) What is the zero-frequency problem of Naive Bayes, and how is it fixed?

**Answer**

**Source:** L3.2 p.14-15 dataset and frequency tables · L3.2 p.17, 21 likelihood tables · L3.2 p.18-20 one-feature example · L3.2 p.22-25 full query, divide and normalize · L3.2 p.28 zero-frequency problem and Laplace smoothing  
**Notes:** [L3.2 › Likelihood tables](../notes/06_Week3_NaiveBayes_KNN.md#5-likelihood-tables-slides-17-21) · [L3.2 › Full query: Holiday, Discount Yes, Free Delivery Yes](../notes/06_Week3_NaiveBayes_KNN.md#7-full-query-holiday-discount-yes-free-delivery-yes-slides-22-25) · [L3.2 › Types of Naive Bayes and Laplace smoothing](../notes/06_Week3_NaiveBayes_KNN.md#9-types-of-naive-bayes-and-laplace-smoothing-textbook-context)  
**Visual:** [Sample 2 › Part 2 Q4 Naive Bayes](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-w4)

**(a)** Divide each count by its class total (10 for Yes, 5 for No); P(value) = row total / 15.

| Feature | Value | P(· \| Yes) | P(· \| No) | P(value) |
|---|---|---|---|---|
| Day | Weekday | 4/10 | 1/5 | 5/15 |
| Day | Weekend | 2/10 | 2/5 | 4/15 |
| Day | Holiday | 4/10 | 2/5 | 6/15 |
| Discount | Yes | 8/10 | 2/5 | 10/15 |
| Discount | No | 2/10 | 3/5 | 5/15 |
| Free Delivery | Yes | 9/10 | 2/5 | 11/15 |
| Free Delivery | No | 1/10 | 3/5 | 4/15 |
| Prior | | 10/15 | 5/15 | |

**(b)** X = (Weekend, Discount = Yes, Free Delivery = No).
- Denominator (product of the marginals): (4/15)(10/15)(4/15) = **0.04741**.
- Buy: (2/10)(8/10)(1/10)(10/15) = 0.01067, divided by 0.04741 = **0.225**.
- No Buy: (2/5)(2/5)(3/5)(5/15) = 0.03200, divided by 0.04741 = **0.675**.
- The two values add up to 0.9, not 1, so normalize: Buy = 0.225/0.9 = **25%**, No Buy = 0.675/0.9 = **75%**.
- **Prediction: the customer will not buy.** The single strongest factor is Free Delivery = No: P(FD = No | Yes) is only 1/10.

**(c)** P(No Buy | Weekend) = P(Weekend | No Buy) · P(No Buy) / P(Weekend) = (2/5)(5/15)/(4/15) = 0.1333/0.2667 = **0.5**. On a weekend, buying and not buying are equally likely (2 of the 4 weekend visits were buys).

**(d)**
- **Zero-frequency problem**: if a feature value never appears with a class in the training data, its likelihood is 0, and the whole product for that class becomes 0, whatever the other features say.
- **Fix: Laplace smoothing** (textbook context for the formula): add α = 1 to every count, P(v | c) = (count + 1)/(N_c + K), where K = number of values of the feature. Applied to (b) it gives Buy 38.6%, No Buy 61.4%: the decision (No Buy) is the same.

---

### Q5. PCA by hand (problem)

Find the first principal component of the dataset below.

| Point | X1 | X2 |
|---|---|---|
| 1 | 1 | 2 |
| 2 | 4 | 2 |
| 3 | 4 | 5 |
| 4 | 5 | 5 |

(a) Compute the mean of each variable and the centred data.

(b) Compute the covariance matrix S (divide by n − 1).

(c) Compute the eigenvalues of S and the unit eigenvector of the largest eigenvalue.

(d) Project the centred data on it to get PC1. What share of the total variance does PC1 keep?

**Answer**

**Source:** L6.2 p.14 mean and covariance (n − 1) · L6.2 p.15 det(S − λI) = 0 and (S − λI)U = 0 · L6.2 p.16 transformed data = X_centered · u₁ · L6.2 p.17 worked example  
**Notes:** [L6.2 › Step by step](../notes/11_Week6_PCA.md#4-step-by-step-slides-14-16) · [L6.2 › Worked example](../notes/11_Week6_PCA.md#5-worked-example-slide-17) · [L6.2 › Exam focus](../notes/11_Week6_PCA.md#exam-focus)  
**Visual:** [Sample 2 › Part 2 Q5 PCA by hand](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-w5)

**(a)** X̄₁ = (1 + 4 + 4 + 5)/4 = **3.5**, X̄₂ = (2 + 2 + 5 + 5)/4 = **3.5**.

Centred data: (−2.5, −1.5), (0.5, −1.5), (0.5, 1.5), (1.5, 1.5).

**(b)**
- Cov(X₁, X₁) = (6.25 + 0.25 + 0.25 + 2.25)/3 = 9/3 = **3**
- Cov(X₂, X₂) = (2.25 + 2.25 + 2.25 + 2.25)/3 = 9/3 = **3**
- Cov(X₁, X₂) = (3.75 − 0.75 + 0.75 + 2.25)/3 = 6/3 = **2**

S = [[3, 2], [2, 3]].

**(c)**
- det(S − λI) = (3 − λ)² − 4 = 0, so 3 − λ = ±2, giving **λ₁ = 5** and **λ₂ = 1**.
- Eigenvector of λ₁ = 5: (3 − 5)u₁ + 2u₂ = 0, so u₂ = u₁. Normalized: **u₁ = (1/√2, 1/√2) = (0.7071, 0.7071)**.
- (The eigenvector of λ₂ = 1 is (0.7071, −0.7071), perpendicular to u₁.)

**(d)** PC1 = centred row · u₁ = (x̃₁ + x̃₂)/√2:

| Point | centred | PC1 |
|---|---|---|
| 1 | (−2.5, −1.5) | −4/√2 = **−2.828** |
| 2 | (0.5, −1.5) | −1/√2 = **−0.707** |
| 3 | (0.5, 1.5) | 2/√2 = **1.414** |
| 4 | (1.5, 1.5) | 3/√2 = **2.121** |

- Check: the variance of the PC1 values is (8 + 0.5 + 2 + 4.5)/3 = 5 = λ₁.
- PC1 keeps λ₁/(λ₁ + λ₂) = 5/6 = **83.3%** of the total variance, so the 2D data can be reduced to 1D with little loss.

---

### Q6. Decision tree with ID3 (problem)

Should the bank approve the loan?

| # | Income | Credit | Employed | Approve |
|---|---|---|---|---|
| 1 | High | Good | Yes | Yes |
| 2 | High | Bad | Yes | Yes |
| 3 | High | Good | No | Yes |
| 4 | Medium | Good | Yes | Yes |
| 5 | Medium | Bad | No | No |
| 6 | Medium | Good | No | Yes |
| 7 | Medium | Bad | Yes | No |
| 8 | Low | Good | No | No |
| 9 | Low | Bad | No | No |
| 10 | Low | Good | Yes | Yes |
| 11 | Low | Bad | Yes | Yes |
| 12 | High | Bad | No | Yes |

(a) Compute the entropy of the dataset.

(b) Compute the information gain of Income, Credit and Employed, and choose the root.

(c) Build the complete tree. Show the information gains used at the second level.

(d) Predict Approve for {Low, Good, No} and for {Medium, Bad, Yes}.

**Answer**

**Source:** L4.1 p.15 how the tree is built · L4.1 p.22 entropy · L4.1 p.25-28 pure node = leaf · L4.1 p.29-31 information gain · L4.1 p.32-34 PlayTennis worked example  
**Notes:** [L4.1 › Entropy](../notes/07_Week4_DecisionTree.md#5-entropy-slides-22-24-28) · [L4.1 › Information gain](../notes/07_Week4_DecisionTree.md#6-information-gain-slides-29-31) · [L4.1 › Worked example: PlayTennis tree built with ID3](../notes/07_Week4_DecisionTree.md#7-worked-example-playtennis-tree-built-with-id3-slides-32-34)  
**Visual:** [Sample 2 › Part 2 Q6 Decision tree](https://claude.ai/artifact/NEzuNxcuxexbHSV5zDe7cn#s2-w6)

**(a)** 8 Yes, 4 No: E(S) = −(8/12) log₂(8/12) − (4/12) log₂(4/12) = 0.390 + 0.528 = **0.918**.

**(b) Root:**

| Attribute | Value: Yes/No (entropy) | Weighted E | **IG** |
|---|---|---|---|
| **Income** | High 4/0 (0), Medium 2/2 (1), Low 2/2 (1) | 4/12·1 + 4/12·1 = 0.667 | **0.252** |
| Credit | Good 5/1 (0.650), Bad 3/3 (1) | 6/12·0.650 + 6/12·1 = 0.825 | 0.093 |
| Employed | Yes 5/1 (0.650), No 3/3 (1) | 0.825 | 0.093 |

**Income** wins and becomes the root. Income = High is pure (4/0), so it is a **Yes leaf**.

**(c) Second level:**
- **Income = Medium** (rows 4-7, 2 Yes / 2 No, E = 1): Credit gives Good 2/0 and Bad 0/2, IG = **1.0**. Employed gives Yes 1/1 and No 1/1, IG = 0. Split on **Credit**.
- **Income = Low** (rows 8-11, 2 Yes / 2 No, E = 1): Employed gives No 0/2 and Yes 2/0, IG = **1.0**. Credit gives Good 1/1 and Bad 1/1, IG = 0. Split on **Employed**.

```
Income [Yes=8, No=4]
|- High   -> Yes [4/0]
|- Medium -> Credit [Yes=2, No=2]
|              |- Good -> Yes [2/0]
|              |- Bad  -> No  [0/2]
|- Low    -> Employed [Yes=2, No=2]
               |- Yes -> Yes [2/0]
               |- No  -> No  [0/2]
```

Each branch asks a different second question; ID3 picks the attribute separately in every subset.

**(d)**
- {Low, Good, No}: Income = Low, then Employed = No, so **No**.
- {Medium, Bad, Yes}: Income = Medium, then Credit = Bad, so **No**.
