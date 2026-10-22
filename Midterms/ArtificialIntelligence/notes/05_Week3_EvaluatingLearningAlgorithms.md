# Evaluating Learning Algorithms

What this lecture is about: why we evaluate models, the four regression metrics (MSE, RMSE, MAE, R²), the confusion matrix and the four classification metrics (accuracy, precision, recall, F1), with one regression and one classification worked example and their NumPy implementation.

Deck: `3.1. Evaluating Learning Algorithms.pdf`, 29 pages. Content: intro (3-6), metrics (8-25), implementation (26-27), Q&A/thanks (28-29).

## 1. Why evaluate (slides 3-6)

- Goal: not only minimise **training** error but perform well on **new, unseen data** (generalisation).
- Evaluation shows strengths, weaknesses and needed improvements.
- Five reasons the slides list (memorise the names):
  1. **Generalization ability**: will the model work on new data? Detects over/underfitting.
  2. **Model selection**: metrics give a standard way to compare candidate models.
  3. **Parameter tuning**: measure the effect of different **hyperparameter** settings.
  4. **Understanding strengths and weaknesses**: e.g. good in high-dimensional spaces but bad with noisy data.
  5. **Benchmarking**: compare against baselines, previous models, competitors.

## 2. Overfitting, underfitting and data splits (slides 4, 15)

- Slide 4 definitions (exam wording):
  - **Overfitting** = performs well on training data but poorly on test data.
  - **Underfitting** = poor performance on both.
- Slide 15: metrics are computed by feeding a **test set** to the trained model. The deck does not cover train/validation/test splits, bias-variance or cross-validation.
- Related material elsewhere:
  - Underfit = high bias, overfit = high variance, regularization: `04_Week2_LogisticRegression.md`.
  - 80/20 or 70/30 split, stratified split, k-fold cross-validation, data leakage: `09_Week5_DataPreparation.md`.
  - The polynomial notebook (code section below) uses an 80/20 train/test split and compares train vs test R² by degree.

## 3. Metric map: classification vs regression (slides 8-9)

| Supervised task | Algorithms listed (slide 8) | Metrics (slide 9) |
|---|---|---|
| Classification | Logistic Regression, Decision Tree, Naive Bayes, KNN, SVM | Confusion Matrix, Accuracy, Precision, Recall, F1-Score |
| Regression | Linear Regression, Decision Tree, SVM, Ridge Regression, Stepwise Regression | MSE, RMSE, MAE, R² |

- Decision Tree and SVM appear in **both** columns.

## 4. Regression metrics: MSE, RMSE, MAE (slides 10-12)

The professor's notation: $h_\theta(x)^{(i)}$ = prediction for example $i$, $y^{(i)}$ = actual value, $m$ = number of examples, "$\bullet$" = multiply. Error is written **prediction minus actual**.

$$MSE = \frac{1}{m}\bullet\sum_{i=1}^{m}\left(h_\theta(x)^{(i)} - y^{(i)}\right)^2$$

$$RMSE = \sqrt{MSE}$$

$$MAE = \frac{1}{m}\bullet\sum_{i=1}^{m}\left|h_\theta(x)^{(i)} - y^{(i)}\right|$$

- **MSE**: averages squared errors, so it is **sensitive to large errors** (outliers).
- **RMSE**: same **units as the target** variable.
- **MAE**: average absolute error, **less sensitive to large errors than MSE**.
- MSE here is $\frac{1}{m}$, **not** $\frac{1}{2m}$. The $\frac{1}{2m}$ belongs to the cost function $J(\theta)$ used for gradient descent (`02_Week1_IntroML_LinearRegression.md`). Do not mix them up.
- Sign order does not matter: the code uses `y - h_x`, the slides use $h - y$, and both get squared or abs'd.

## 5. R-squared (slide 13)

The formula as printed on the slide:

$$R^2 = 1 - \frac{\sum_{i=1}^{m}\left(h_\theta(x)^{(i)} - y^{(i)}\right)^2}{\sum_{i=1}^{m}\left(h_\theta(x)^{(i)} - y_{mean}\right)^2}, \qquad y_{mean} = \sum_{i=1}^{m} y^{(i)}/m$$

- **Slide error:** the denominator should be $\sum (y^{(i)} - y_{mean})^2$, the total sum of squares $SS_{tot}$, not $\sum(h_\theta(x)^{(i)} - y_{mean})^2$. The slide's own code (slide 26) and both notebooks use `(y - y_mean)**2`. On the slide 26 data the printed formula gives 0.98590 and the correct one gives 0.98614.
- Correct form: $R^2 = 1 - \dfrac{SS_{res}}{SS_{tot}}$ with $SS_{res}=\sum(y-\hat y)^2$ and $SS_{tot}=\sum(y-\bar y)^2$.
- Meaning: the proportion of variance in the target that the model explains. **Close to 1 = good fit.**
- R² = 1 is a perfect fit. R² = 0 means no better than always predicting the mean (polynomial notebook). R² < 0 means worse than the mean (textbook context).
- R² has no units. MSE, RMSE and MAE are in target units (squared units for MSE).

## 6. Regression worked example (slide 26)

`h_x = [11,19,28,35,48,60,66,78,91,99]`, `y = [10,20,30,40,40,60,70,80,90,100]`, m = 10, $y_{mean} = 54$.

| i | h | y | h − y | (h − y)² | \|h − y\| | y − 54 | (y − 54)² |
|---|---|---|---|---|---|---|---|
| 1 | 11 | 10 | 1 | 1 | 1 | −44 | 1936 |
| 2 | 19 | 20 | −1 | 1 | 1 | −34 | 1156 |
| 3 | 28 | 30 | −2 | 4 | 2 | −24 | 576 |
| 4 | 35 | 40 | −5 | 25 | 5 | −14 | 196 |
| 5 | 48 | 40 | 8 | 64 | 8 | −14 | 196 |
| 6 | 60 | 60 | 0 | 0 | 0 | 6 | 36 |
| 7 | 66 | 70 | −4 | 16 | 4 | 16 | 256 |
| 8 | 78 | 80 | −2 | 4 | 2 | 26 | 676 |
| 9 | 91 | 90 | 1 | 1 | 1 | 36 | 1296 |
| 10 | 99 | 100 | −1 | 1 | 1 | 46 | 2116 |
| **Σ** | | | | **117** | **25** | | **8440** |

- MSE = 117/10 = **11.7**
- RMSE = √11.7 = **3.4205**
- MAE = 25/10 = **2.5**
- R² = 1 − 117/8440 = 1 − 0.01386 = **0.98614**
- Matches the notebook output (MSE 11.7, RMSE 3.420526…, MAE 2.5, R² 0.986137…).
- Example 5 (error 8) contributes 64 of the 117 to MSE but only 8 of the 25 to MAE. This shows MSE's outlier sensitivity.

## 7. Confusion matrix and axis layout (slides 14-19)

- Definition (slide 14): a table of **predicted vs actual** values, broken into TP, FP, TN, FN.
- **Slide 14 layout (the definition slide): columns = Actuals, rows = Predicted.**

| | Actual Positive | Actual Negative |
|---|---|---|
| **Predicted Positive** | True Positives | False Positives |
| **Predicted Negative** | False Negatives | True Negatives |

- How to read the names: the second word is what the model **predicted**, the first word says whether that prediction was right.
  - FP = predicted positive, actually negative (false alarm).
  - FN = predicted negative, actually positive (a miss).
- Slides 15-18 walk through a fruit example: test set of bananas and apples → model → predictions. **Banana = positive, Apple = negative.**
- **Slide 18 layout flips the axes: columns = Predictions, rows = Actuals.**

| Slide 18 | Pred Banana | Pred Apple |
|---|---|---|
| **Actual Banana** | 4 | 2 |
| **Actual Apple** | 1 | 3 |

- Slide 17 picture agrees with slide 18:
  - "Banana" prediction pile: 4 bananas + 1 apple marked ✗.
  - "Apple" prediction pile: 3 apples + 2 bananas marked ✗.
- Slide 19 switches back to **columns = Actuals, rows = Predictions** but keeps the numbers in the same cells, labelled TP = 4, FP = 2, FN = 1, TN = 3. See section 9 for why this matters.
- Slides 20-25 draw a small matrix with **columns = Predictions, rows = Actuals** and cell labels TP 4 | FP 2 / FN 1 | TN 3, i.e. slide 14's labels placed under slide 18's axes.
- Notebook (slide 27) layout: `[[TN, FP], [FN, TP]]`. Rows = actual (0, 1), columns = predicted (0, 1), **negative class first**. This is also scikit-learn's convention (textbook context).
- **Exam rule:** always find which axis is "Actual" before reading off FP/FN. If the cells are labelled, trust the labels.

## 8. Accuracy, precision, recall, F1 (slides 20-25)

Formulas exactly as written on the slides (full words, accuracy given as a percentage):

$$Accuracy = \frac{Correct\ Predictions}{Total\ Predictions}\bullet 100\% = \frac{TP+TN}{TP+TN+FP+FN}\bullet 100\%$$

$$Precision = \frac{True\ Positive}{True\ Positive + False\ Positive} \qquad Recall = \frac{True\ Positive}{True\ Positive + False\ Negative}$$

$$F1 = 2\bullet\frac{Precision\bullet Recall}{Precision + Recall}$$

| Metric | Question it answers (slide wording) | Looks only at | Prioritise when |
|---|---|---|---|
| Accuracy | share correctly classified over all instances | everything | classes balanced, errors equally costly |
| Precision | "Of all the alarms the model raised, how many were real?" | predicted positives (ignores negative predictions) | **FP is expensive, embarrassing or harmful** |
| Recall (= **Sensitivity**) | "Of all the real positives out there, how many did the model actually catch?" | actual positives (ignores FP) | **FN is dangerous, costly or irreversible** |
| F1 | harmonic mean, a single number balancing P and R | P and R | need one measure accounting for both |

- Slide examples:
  - **Precision: spam detection** (slide 22). An FP buries a real email such as a job offer, and users stop trusting the filter.
  - **Recall: cancer/disease screening** (slides 22, 24). Missing a cancer (FN) can be fatal, while a false alarm only costs an extra test. Doctors accept lower precision for higher recall.
  - **Recall: airport security / weapon detection** (slide 24). Missing a threat is catastrophic, while flagging a bag is an inconvenience.
- The slides give recall the alternate name **Sensitivity** (slide 23 title).
- Harmonic mean punishes imbalance (textbook context). With P = 1 and R = 0.01, F1 = 0.0198, but the arithmetic mean is 0.505.

## 9. Fruit example: the axis inconsistency (slides 17-25)

The professor's worked numbers use TP = 4, FP = 2, FN = 1, TN = 3:

| Metric | Slide computation | Exact | Slide value |
|---|---|---|---|
| Accuracy | (4+3)/10 · 100% | 0.70 | **70%** |
| Precision | 4/(4+2) | 0.6667 | **0.667** |
| Recall | 4/(4+1) | 0.8 | **0.8** |
| F1 | 2·0.667·0.8/(0.667+0.8) | 8/11 = 0.7273 | **0.73** |

- **Slide inconsistency.** By slides 17-18:
  - 1 apple (negative) was predicted banana, so **FP = 1**.
  - 2 bananas (positive) were predicted apple, so **FN = 2**.
  - The true values are then Precision = 4/5 = **0.8** and Recall = 4/6 = **0.667**.
- Slide 19 swapped the axis titles but not the off-diagonal numbers, so precision and recall come out **swapped**.
- Accuracy (70%) and F1 (0.727) are unaffected, because F1 is symmetric in P and R.
- On the exam, if the slide 20-25 matrix is reproduced with cell labels, give the professor's answers (P = 0.667, R = 0.8). If raw data is given, apply the definitions.

## 10. Not in the deck: specificity, ROC, cross validation (textbook context)

- None of these appear in this deck. Quick reference in case they come up:
- **Specificity** = TN/(TN+FP), the true negative rate. Notebook data: 5/6 = 0.833.
- **ROC curve**: TPR (recall) vs FPR = FP/(FP+TN) as the classification threshold varies. **AUC** = area under it; 0.5 = random, 1 = perfect.
- **k-fold CV**: split the data into k folds, train on k−1, test on 1, and average over the k runs. Mentioned in the 5.2 deck (`09_Week5_DataPreparation.md`).

## Code from the course notebook (Evaluating ML Models)

File `Evaluating_ML_Models.ipynb`. It is identical to the code on slides 26-27 and uses NumPy only.

- **Regression cell:** `mse = np.mean((y - h_x)**2)`, `rmse = np.sqrt(mse)`, `mae = np.mean(np.abs(y - h_x))`, `r_squared = 1 - ss_residual/ss_total` with `ss_total = np.sum((y - y_mean)**2)`. The correct $SS_{tot}$, unlike slide 13.
  - Printed: `MSE: 11.7`, `RMSE: 3.420526275297414`, `MAE: 2.5`, `R-squared: 0.9861374407582938` (see section 6).
- **Classification cell:** counts with boolean masks, then guards against division by zero.

```python
true_positive  = np.sum((h_x_binary == 1) & (y_binary == 1))
false_positive = np.sum((h_x_binary == 1) & (y_binary == 0))
precision = TP / (TP + FP) if (TP + FP) > 0 else 0   # 0/0 -> 0
confusion_matrix = np.array([[TN, FP], [FN, TP]])
```

- Data `h = [0,0,0,1,1,1,0,0,0,0]`, `y = [0,0,1,1,1,0,0,0,1,0]`:

| idx | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| h (pred) | 0 | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| y (actual) | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 1 | 0 |
| outcome | TN | TN | FN | TP | TP | FP | TN | TN | FN | TN |

- TP = 2, TN = 5, FP = 1, FN = 2.
  - Printed: `Accuracy: 0.7`, `Precision: 0.6666…`, `Recall: 0.5`, `F1 Score: 0.5714…` (= 4/7).
  - Matrix printed `[[5 1] [2 2]]` = [[TN, FP], [FN, TP]].
- Same accuracy (0.7) as the fruit example but much lower recall. Accuracy alone hides this.

## Code from the course notebook (polynomial regression numpy)

File `polynomial_regression_numpy.ipynb`: polynomial regression from scratch (NumPy + matplotlib, no scikit-learn). It ties this lecture's metrics to `03_Week2_MultivariateRegression_NormalEquation_Polynomial.md`.

- **Metrics:** `mse(y_true, y_pred) = np.mean((y_true - y_pred)**2)` (1/m) and `r2_score = 1 - ss_res/ss_tot`.
  - Sanity check: y = [3, 5, 2], ŷ = [2.5, 5, 4] → MSE **1.4167**, R² **0.0893**.
- **Data:** seed 42, n = 150, x ~ U(−3, 3), y = 0.5x³ − x² + 2x + 5 + N(0, σ = 3).
- **`polynomial_features(x, d)`** builds columns `[1, x, x², …, x^d]` via `np.column_stack`. The column of 1s is the bias. Shape for d = 3 is (150, 4).
- **`normal_equation(X, y)`** computes `w = inv(X.T @ X) @ (X.T @ y)`, i.e. $w = (X^TX)^{-1}X^Ty$ in one step with no gradient descent. The notebook writes the weights as $w$ and the prediction as $\hat y$.
- **Split:** random permutation, then 80/20 (120 train, 30 test).
- **Degree 3:** learned w = [5.128, 1.85, −0.944, 0.528], close to the true [5, 2, −1, 0.5]. Test **MSE 15.917, R² 0.8909**.
- **Degree comparison** (cell 18 has no saved output; re-run with the same seed and NumPy 2.5.3, all other saved outputs reproduced exactly):

| Degree | Train R² | Test R² | Train MSE | Test MSE |
|---|---|---|---|---|
| 1 | 0.7633 | 0.7466 | 18.910 | 36.992 |
| 2 | 0.8450 | 0.8447 | 12.385 | 22.665 |
| 3 | 0.9010 | 0.8909 | 7.912 | 15.917 |
| 5 | 0.9068 | 0.8942 | 7.446 | 15.441 |
| 9 | 0.9131 | 0.9008 | 6.943 | 14.481 |

- **Takeaways:**
  - Degrees 1-2 **underfit**: low R² on both train and test, which is slide 4's definition.
  - Degree 3 matches the true cubic.
  - Above 3, train R² keeps rising while test gains are marginal. That is the notebook's overfitting warning. In this run test R² does **not** actually drop at degree 9 (the train-test gap stays about 0.01), so the overfitting effect is weak with 120 points.
  - The notebook says more noise or less data makes it visible.

## Exam focus

1. **Compute all four classification metrics.** TP = 30, FP = 10, FN = 20, TN = 40 (n = 100).
   - Accuracy = 70/100 = **70%**
   - Precision = 30/40 = **0.75**
   - Recall = 30/50 = **0.60**
   - F1 = 2·0.75·0.6/1.35 = **0.667**
   - Specificity (textbook) = 40/50 = 0.80
   - Axis trap: swapping FP and FN gives P = 0.60, R = 0.75. Accuracy and F1 stay the same.
2. **Count from vectors** (like the notebook). Pred `[1,0,1,1,0,1,0,0]`, actual `[1,0,0,1,1,1,0,1]`.
   - TP = 3, TN = 2, FP = 1, FN = 2.
   - Accuracy 5/8 = **0.625**, P = 3/4 = **0.75**, R = 3/5 = **0.6**, F1 = **0.667**.
   - Notebook-layout matrix `[[2,1],[2,3]]`.
3. **Regression metrics by hand.** y = [3, 5, 2], h = [2.5, 5, 4]. Errors −0.5, 0, 2.
   - MSE = (0.25+0+4)/3 = **1.4167**
   - RMSE = **1.1902**
   - MAE = 2.5/3 = **0.8333**
   - $y_{mean}$ = 3.333, $SS_{tot}$ = 4.667, $SS_{res}$ = 4.25, so R² = 1 − 4.25/4.667 = **0.0893** (a poor fit)
4. **Why MSE vs MAE?** Errors [1,1,1,1,10] give MSE **20.8**, MAE **2.8**, RMSE 4.56. With all errors equal to 1, MSE = MAE = 1.
   - One outlier inflates MSE 20.8× but MAE only 2.8×.
   - MSE is sensitive to large errors, MAE is less so. RMSE puts the error back in target units.
5. **Accuracy paradox** (textbook context). 95 negatives and 5 positives, with a model that always says negative.
   - Accuracy = **95%**, Recall = 0/5 = **0**.
   - Precision is 0/0 (the notebook code returns 0).
   - So use precision/recall/F1 when classes are imbalanced.
6. **R² can be negative** (textbook context). y = [1, 2, 3] predicted as [3, 3, 3]: $SS_{res}$ = 5, $SS_{tot}$ = 2, R² = **−1.5**. Predicting the mean [2, 2, 2] gives R² = 0.
7. **Which metric?**
   - Spam filter: **precision**, since FP buries real mail.
   - Cancer screening and airport weapons: **recall**, since an FN is catastrophic.
   - Need one balanced number: **F1**.
8. **Definitions to state verbatim:**
   - Overfitting: good on training, poor on test.
   - Underfitting: poor on both.
   - The five reasons for evaluation (section 1).
   - The slide 14 confusion-matrix layout (columns = Actuals, rows = Predicted, TP top-left, FP top-right).
9. **Spot the error:** slide 13's R² denominator should use $y^{(i)}$, not $h_\theta(x)^{(i)}$. MSE in this lecture has $\frac{1}{m}$, not $\frac{1}{2m}$.
