# Logistic Regression (Lecture 2.2)

What this lecture is about: binary classification with logistic regression (sigmoid hypothesis, probability reading, decision boundary, log-loss cost, gradient descent with a 3-iteration hand example), one-vs-all multiclass, overfitting and L2 regularisation, and the NumPy implementation.

Deck: `2.2. Logistic Regression.pdf`, title slide "Machine Learning: Classification Algorithms" (49 pages). Verification scripts: `/home/claude/work/agents/w2l2/verify.py`, `notebook_repro.py`, `reg_exam.py`, `convex.py`.

## 1. Recap: hyperparameters and the three feature table (slide 2)

- Recap list: linear regression (gradient descent and normal equation), hyperparameters, polynomial regression. Details in 02_Week1_IntroML_LinearRegression.md and 03_Week2_MultivariateRegression_NormalEquation_Polynomial.md.
- Table shown on slide 2 (nothing is computed from it on the slide):

| $x_1$ | $x_2$ | $x_3$ | $y$ |
|---|---|---|---|
| 9 | 12 | 5 | 34 |
| 13 | 11 | 3 | 39 |
| 19 | 18 | 3 | 42 |
| 22 | 23 | 2 | 55 |
| 25 | 5 | 6 | 68 |

- (own computation, not on slides) With $x_0=1$, the normal equation $\theta=(X^TX)^{-1}X^Ty$ gives $\theta\approx[11.6186,\ 1.9503,\ -0.2643,\ 1.3954]^T$, fitted $\hat y\approx[32.98, 38.25, 48.10, 51.24, 67.43]$. Initial MSE cost at $\theta=0$: $J=\frac{1}{2\cdot5}\sum y^2=1209$.
- Hyperparameters (textbook context): values chosen before training, not learned. In this lecture: learning rate $\alpha$ (0.1), number of iterations (500 / 1000 / 5000 in code), regularisation parameter $\lambda$, choice of polynomial features. Parameters = $\theta$ (learned).

## 2. Classification vs regression (slides 4-5)

- Examples: email spam / not spam, online transaction fraud yes / no, brain tumour benign / malignant.
- Binary class: $y\in\{0,1\}$. 0 = "Negative Class" (benign tumour), 1 = "Positive Class" (malignant tumour).
- Multi-class: $y\in\{0,1,2,3\}$ on slide 5; slide 33 numbers classes from 1 ($y=1..4$). Notebook uses $0..K-1$.
- Regression predicts a continuous value, classification a discrete label (textbook context).

## 3. Why linear regression fails for classification (slides 6-9)

- Fit $h_\theta(x)=X\cdot\theta$ (a straight line) to tumour size vs malignant (0/1) and threshold at 0.5: if $h_\theta(x)\ge0.5$ predict $y=1$, if $h_\theta(x)<0.5$ predict $y=0$.
- Slide 6: on clean data the 0.5 crossing of the line separates the classes.
- Slides 7-8: add one very large malignant tumour far to the right. The least-squares line flattens, its 0.5 crossing moves right, and malignant tumours left of the new crossing are now predicted benign (yellow line on slide 8 = where the boundary should be). One correct but extreme example ruins the classifier.
- Slide 9: classification output is $y=1$ or $0$, yet a linear $h_\theta(x)$ can be $>1$ or $<0$. Logistic regression enforces $0\le h_\theta(x)\le1$.
- Despite the name, logistic regression is a classification algorithm (textbook context).

## 4. Hypothesis: the sigmoid function (slides 10, 12)

$$h_\theta(x)=g(X\cdot\theta),\qquad g(z)=\frac{1}{1+e^{-z}}\quad\Rightarrow\quad h_\theta(x)=\frac{1}{1+e^{-X\cdot\theta}}$$

- $g$ is called the "Logistic Function" = "Sigmoid function". S-shaped; $g(0)=0.5$, $g\to1$ as $z\to+\infty$, $g\to0$ as $z\to-\infty$.
- Professor's notation: $X\cdot\theta$ with a bullet dot (design matrix times column vector $\theta$); in the worked example $Z=X\cdot\theta$, $h_\theta(x)=\frac{1}{1+e^{-Z}}$ elementwise.
- Threshold (slide 12): $g(z)\ge0.5$ if $z\ge0$, $g(z)<0.5$ if $z<0$. So predict $y=1$ exactly when $X\cdot\theta\ge0$.
- Tie rule: $h_\theta(x)=0.5$ exactly goes to $y=1$ ($\ge$). The notebook also uses `h_x >= 0.5`.
- Handy facts (textbook context): $g'(z)=g(z)(1-g(z))$; $1-g(z)=g(-z)$.

| $z$ | −2 | −1 | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|---|
| $g(z)$ | 0.1192 | 0.2689 | 0.5 | 0.7311 | 0.8808 | 0.9526 |

## 5. Interpreting the output as a probability (slide 11)

- $h_\theta(x)$ = estimated probability that $y=1$ on input $x$:  $h_\theta(x)=P(y=1\mid X;\theta)$, with $y=0$ or $1$.
- Example: $x=\begin{bmatrix}x_0\\x_1\end{bmatrix}=\begin{bmatrix}1\\ \text{tumorSize}\end{bmatrix}$, $h_\theta(x)=0.7$ → "tell patient that 70% chance of tumor being malignant".
- $P(y=0\mid X;\theta)+P(y=1\mid X;\theta)=1$, so $P(y=0\mid X;\theta)=1-P(y=1\mid X;\theta)$ (= 0.3 in the example).

## 6. Decision boundary, linear and non linear (slides 13, 42)

- $h_\theta(x)=g(\theta_0+\theta_1x_1+\theta_2x_2)$ with $\theta=[-3,\ 1,\ 1]^T$.
- Predict "$y=1$" if $-3+x_1+x_2\ge0\iff x_1+x_2\ge3$; "$y=0$" if $x_1+x_2<3$.
- Boundary: the line $x_1+x_2=3$ (hits 3 on both axes); on it $h_\theta(x)=0.5$. Crosses below the line, red circles above. (Slide spells it "Decision Boundry".)
- The boundary is a property of $\theta$, not of the training data (textbook context). In general it is $\theta^Tx=0$.

| point $(x_1,x_2)$ | $z=-3+x_1+x_2$ | $h_\theta(x)$ | prediction |
|---|---|---|---|
| (1, 1) | −1 | 0.2689 | 0 |
| (2, 2) | 1 | 0.7311 | 1 |
| (1.5, 1.5) | 0 | 0.5 | 1 (tie goes to 1) |

- Non-linear boundary (slide 42): polynomial features such as $g(\theta_0+\theta_1x_1+\theta_2x_2+\theta_3x_1^2+\theta_4x_2^2+\theta_5x_1x_2)$ give a curved boundary; very high-order terms give a contorted one (overfitting, section 11).
- Classic example (textbook context): $\theta=[-1,0,0,1,1]$ on features $[1,x_1,x_2,x_1^2,x_2^2]$ → predict 1 iff $x_1^2+x_2^2\ge1$ (outside the unit circle).

## 7. Cost function: log loss, and why not MSE (slides 14-16)

- Dataset $\{(x^{(1)},y^{(1)}),(x^{(2)},y^{(2)}),\dots,(x^{(m)},y^{(m)})\}$, $x\in[x_0,x_1,\dots,x_n]^T$, $x_0=1$, $y\in\{0,1\}$. "How do we choose $\theta$?"
- Per-example cost (slide 15):

$$\mathrm{Cost}(h_\theta(x),y)=\begin{cases}-\log(h_\theta(x)) & \text{if } y=1\\[2pt] -\log(1-h_\theta(x)) & \text{if } y=0\end{cases}$$

- Graphs: $y=1$: cost $\to\infty$ as $h\to0$, cost $=0$ at $h=1$. $y=0$: cost $=0$ at $h=0$, $\to\infty$ as $h\to1$. Confident wrong answers are punished hard.
- Compact form (slide 16, boxed): $\mathrm{Cost}(h_\theta(x),y)=-y\log(h_\theta(x))-(1-y)\log(1-h_\theta(x))$.
- Total cost uses $\frac{1}{m}$, not $\frac{1}{2m}$ (linear regression's MSE has $\frac{1}{2m}$):

$$J(\theta)=-\frac{1}{m}\sum_{i=1}^{m}\Big[y^{(i)}\log\big(h_\theta(x^{(i)})\big)+(1-y^{(i)})\log\big(1-h_\theta(x^{(i)})\big)\Big]$$

- log = natural log (the example uses $\log 0.5=-0.693$). At $\theta=0$ every $h=0.5$, so $J=\ln2=0.693$ for any dataset (also the notebook's first printed loss 0.6931).
- Why not MSE (textbook context, the slides only show the log curves): sigmoid inside $\frac{1}{2m}\sum(h-y)^2$ makes $J(\theta)$ non-convex (flat regions, local minima), so gradient descent can stall; log loss is convex → one global minimum. Checked in `convex.py`: MSE+sigmoid on a 4-point 1-D set has negative second differences, log loss has none. For $y=1$, $z=-6$: MSE gradient −0.0049 (vanishes), log-loss gradient −0.9975.
- Log loss = binary cross-entropy (the notebook's name) = negative log-likelihood (textbook context).

| $h$ | Cost if $y=1$ | Cost if $y=0$ |
|---|---|---|
| 0.9 | 0.1054 | 2.3026 |
| 0.7 | 0.3567 | 1.2040 |
| 0.5 | 0.6931 | 0.6931 |
| 0.1 | 2.3026 | 0.1054 |

## 8. Gradient descent for logistic regression (slides 17, 25-26)

- Goal: $\min_\theta J(\theta)$. Repeat { $\theta_j:=\theta_j-\alpha\frac{\partial}{\partial\theta_j}J(\theta)$ }, all $j$ updated simultaneously.
- $\frac{\partial J}{\partial\theta_j}=\frac{1}{m}\sum_{i=1}^{m}\big(h_\theta(x^{(i)})-y^{(i)}\big)x_j^{(i)}$.
- **Slide error:** the boxed rule on slides 17 and 25, $\theta_j:=\theta_j-\alpha\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})\cdot x_j^{(i)}$, is missing $\frac1m$. The vectorised box on slide 26, the worked example and all code include it. Use:

$$\theta:=\theta-\alpha\cdot\frac{1}{m}\cdot X^T\cdot\big(h(x)-y\big)$$

- Without $\frac1m$ the first step of the example below would be $[0.05,-0.15,0.35]$ instead of the slide's $[0.01,-0.03,0.07]$.
- Same form as the linear regression update (02_, 03_ notes); only $h_\theta(x)=g(X\theta)$ differs.

## 9. Worked example: three iterations by hand (slides 18-31)

Dataset (slide 18), $\alpha=0.1$, $\theta=[0,0,0]^T$, $m=5$:

| $i$ | $x_0$ | $x_1$ | $x_2$ | $y$ |
|---|---|---|---|---|
| 1 | 1 | 2 | 3 | 1 |
| 2 | 1 | 3 | 2 | 0 |
| 3 | 1 | 3 | 1 | 0 |
| 4 | 1 | 1 | 3 | 1 |
| 5 | 1 | 0 | 4 | 1 |

Iteration 1 (slides 19-29):
- $Z=X\cdot\theta=[0,0,0,0,0]^T$ → $h_\theta(x)=[0.5,0.5,0.5,0.5,0.5]^T$.
- Cost (slides 21-24): $y\cdot\log h=[-0.693,0,0,-0.693,-0.693]$, $(1-y)\cdot\log(1-h)=[0,-0.693,-0.693,0,0]$, sum per row $=-0.693$ → $J=-\frac15\sum(-0.693)=0.693$.
- Gradient (slides 27-29):

| $i$ | $h$ | $y$ | $h-y$ |
|---|---|---|---|
| 1 | 0.5 | 1 | −0.5 |
| 2 | 0.5 | 0 | 0.5 |
| 3 | 0.5 | 0 | 0.5 |
| 4 | 0.5 | 1 | −0.5 |
| 5 | 0.5 | 1 | −0.5 |

- $X^T(h-y)=[-0.5,\ 1.5,\ -3.5]^T$; $\alpha\cdot\frac15=0.02$ → $[-0.01,\ 0.03,\ -0.07]$; $\theta=[0,0,0]-[-0.01,0.03,-0.07]=[0.01,\ -0.03,\ 0.07]^T$.

Summary (slide 30, every value verified):

| Iteration | $\theta$ used | $h_\theta(x)$ for rows 1-5 | $J(\theta)$ |
|---|---|---|---|
| 1 | [0, 0, 0] | [0.5, 0.5, 0.5, 0.5, 0.5] | 0.693 |
| 2 | [0.01, −0.03, 0.07] | [0.54, 0.515, 0.498, 0.547, 0.572] | 0.638 |
| 3 | [0.017, −0.063, 0.128] | [0.568, 0.521, 0.489, 0.584, 0.63] | 0.595 |

- Exact: iteration 2 $h=[0.5399, 0.5150, 0.4975, 0.5474, 0.5720]$, $J=0.6379$; iteration 3 $\theta=[0.016565,-0.063293,0.128454]$, $h=[0.5684,0.5209,0.4888,0.5839,0.6296]$, $J=0.5945$. Slide values are correct roundings (slide typo "Iterartion").
- By iteration 3, row 3 ($y=0$, $h=0.489$) is classified correctly; row 2 ($y=0$, $h=0.521$) is still wrong.
- Slide 31: the same loop in NumPy for 500 iterations; loss plot falls from 0.69 to about 0.03. Reproduced: $\theta\approx[0.0139,-2.5904,2.5848]$, $J=0.0313$, all 5 points classified correctly.

## 10. Multiclass classification: one vs all (slides 33-38)

- Examples (slide 33): email foldering Work / Friends / Family / Hobby ($y=1..4$); medical Not ill / Cold / Flu ($y=1..3$); weather Sunny / Cloudy / Rain / Snow ($y=1..4$).
- Slide 34: binary (two groups, one line) vs multi-class (three clusters: triangles, circles, crosses).
- One-vs-all (slide 35): for each class $i$, treat class $i$ as positive and all others as negative, and train $h_\theta^{(i)}(x)=P(y=i\mid x;\theta)$, $(i=1,2,3)$. Class 1 = triangle, Class 2 = circle, Class 3 = cross; three binary boundaries.
- Prediction (slide 36): "on a new input $x$, pick the class $i$ that maximizes" $\max_i h_\theta^{(i)}(x)$, i.e. $\hat y=\arg\max_i h_\theta^{(i)}(x)$.
- $K$ classes → $K$ binary classifiers. The $K$ outputs need not sum to 1 (textbook context).
- Slides 37-38 code: 10-point toy set, 3 classes (0, 1, 2), 2 features, $\alpha=0.1$, 1000 iterations per class. Final losses on the plot ≈ class 0: 0.18, class 1: 0.38, class 2: 0.48 (reproduced 0.1757 / 0.3815 / 0.4832). Test $x=[1,3,3]$ → reproduced $h=[0.0785, 0.4976, 0.1883]$ → class 1.

## 11. Overfitting (slides 40-43)

- Housing prices, linear regression (slide 40): $\theta_0+\theta_1x$ → "Underfit → High bias"; $\theta_0+\theta_1x+\theta_2x^2$ → good fit; $\theta_0+\theta_1x+\dots+\theta_4x^4$ → "Overfit → High variance".
- Definition (slide 41): with too many features the hypothesis fits the training set very well ($J(\theta)=\frac{1}{2m}\sum(h_\theta(x^{(i)})-y^{(i)})^2\approx0$) but fails to generalize to new examples.
- Logistic version (slide 42): $g(\theta_0+\theta_1x_1+\theta_2x_2)$ underfits; adding $x_1^2, x_2^2, x_1x_2$ fits well; terms like $x_1^2x_2, x_1^2x_2^2, x_1^2x_2^3,\dots$ overfit.
- Addressing overfitting (slide 43): (1) reduce number of features: manually select, or model selection algorithm (later in course); (2) regularization: keep all features but reduce the magnitude of $\theta_j$; works well when there are many features, each contributing a bit to predicting $y$.

## 12. Regularisation, L1 and L2 (slides 44-46)

- Definition (slide 44): prevents overfitting by penalising complex models; adds a penalty term to the cost that keeps the weights $\theta$ small → better generalisation to unseen data.
- L1 (Lasso): $\lambda\sum_{j=1}^{n}|\theta_j|$. L2 (Ridge): $\lambda\sum_{j=1}^{n}\theta_j^2$.
- Linear regression with L2 = Ridge regression (slide 45, as written): $J(\theta)=\frac{1}{2m}\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})^2+\lambda\sum_{j=1}^{n}\theta_j^2$.
- Logistic regression with L2 (slide 46):

$$J(\theta)=-\frac{1}{m}\sum_{i=1}^{m}\Big[y^{(i)}\log h_\theta(x^{(i)})+(1-y^{(i)})\log\big(1-h_\theta(x^{(i)})\big)\Big]+\frac{\lambda}{2m}\sum_{j=1}^{n}\theta_j^2$$

- Gradient descent (same structure on both slides). $\theta_0$ is **not** regularised (penalty sum starts at $j=1$):

$$\theta_0:=\theta_0-\alpha\frac{1}{m}\sum_{i=1}^{m}\big(h_\theta(x^{(i)})-y^{(i)}\big)x_0^{(i)}$$

$$\theta_j:=\theta_j-\alpha\Big[\frac{1}{m}\sum_{i=1}^{m}\big(h_\theta(x^{(i)})-y^{(i)}\big)x_j^{(i)}+\frac{\lambda}{m}\theta_j\Big],\qquad j=1,\dots,n$$

- $\lambda$ = "regularization parameter" (a hyperparameter). Large $\lambda$ → $\theta_j\to0$ → underfit; $\lambda=0$ → plain logistic regression (textbook context).
- Equivalent weight-decay form (textbook context): $\theta_j:=\theta_j\big(1-\alpha\frac{\lambda}{m}\big)-\alpha\frac1m\sum(h_\theta(x^{(i)})-y^{(i)})x_j^{(i)}$.
- **Slide errors:**
  - Slides 45-46 write $\alpha\cdot\frac1m\big(\sum\dots+\frac{\lambda}{m}\theta_j\big)$, which literally gives $\frac{\lambda}{m^2}\theta_j$. The derivative of $\frac{\lambda}{2m}\sum\theta_j^2$ is $\frac{\lambda}{m}\theta_j$, so it should be $\frac1m\big(\sum\dots+\lambda\theta_j\big)$, i.e. the form above. The notebook implements the correct version.
  - Slide 45: the penalty $\lambda\sum\theta_j^2$ lacks the $\frac{1}{2m}$ its own gradient assumes; standard is $\frac{1}{2m}\big[\sum(h-y)^2+\lambda\sum_{j=1}^n\theta_j^2\big]$ (textbook context). It also has the index typo $\sum_{i=1}^{n}\theta_j^2$.

## Code from the course notebook (logistic regression)

File `logistic_regression.ipynb`, three parts. Values marked "reproduced" were not saved in the notebook and were recomputed (`notebook_repro.py`); the saved printouts (loss values, first predictions) match the reproduction exactly.

Part 1, binary from scratch:
- Data: `make_classification(n_samples=500, n_features=20, n_classes=2, random_state=42)`; bias column `np.hstack((np.ones((m,1)), X))` → X (500, 21), y reshaped to (500, 1); `train_test_split(test_size=0.2, random_state=4)` → 400 / 100. The plot title "Three normally-distributed clusters" is wrong (2 classes; plot shows the first 2 of 20 features).
- Training loop, $\alpha=0.1$, 5000 iterations, `theta = np.zeros((21, 1))`:

```python
Z = np.dot(X_train, theta); h_x = sigmoid(Z); error = h_x - y_train
loss = -np.sum(y_train*np.log(h_x) + (1-y_train)*np.log(1-h_x))/m
theta = theta - (alpha*np.dot(X_train.T, error))/m
```

- Printed loss: iteration 0 → 0.6931, 100 → 0.2778, 1000 → 0.2401, converges to ≈ 0.23988.
- `prediction()` returns 1 if `h_x >= 0.5` else 0, one test sample at a time.
- Evaluation (reproduced): accuracy 0.82, macro precision 0.8211, recall 0.8242, F1 0.8197; confusion matrix `[[43, 12], [6, 39]]` (rows = true 0 / 1). Metrics explained in 05_Week3_EvaluatingLearningAlgorithms.md.

Part 2, multiclass:
- `make_classification(n_samples=500, n_features=2, n_informative=2, n_redundant=0, n_classes=3, n_clusters_per_class=1, random_state=42)`, bias column, 80/20 split (`random_state=42`).
- sklearn `LogisticRegression()` and `KNeighborsClassifier()` are fitted, but only KNN is scored: macro F1 0.9613, accuracy 0.96 (reproduced). sklearn logistic regression accuracy would be 0.91 (reproduced, not in notebook). Arguments are passed as `f1_score(pred, y_test)` (swapped), harmless for accuracy and F1.
- From-scratch one-vs-all, $\alpha=0.1$, 1000 iterations per class → 84 / 100 test correct (reproduced):

```python
y_c = np.where(y == c, 1, 0).reshape(-1, 1)            # class c vs rest
theta[c, :] = theta_c.T                                  # one row of theta per class
return np.argmax(sigmoid(np.dot(X, theta.T)), axis=1)    # predict: max h over classes
```

Part 3, one-vs-all with L2 regularisation:
- Same 10-point toy data as slide 37; `reg_lambda = 1`, $\alpha=0.1$, 1000 iterations.

```python
regularization_term = (reg_lambda/(2*m))*np.sum(np.square(theta[1:]))   # theta_0 excluded
grad = (1/m)*np.dot(X.T, error)
grad[1:] = grad[1:] + (reg_lambda/m)*theta_c[1:]
```

- Test $x=[1,3,3]$ → class 1 (reproduced $h=[0.1916, 0.4467, 0.2241]$; without regularisation $[0.0785, 0.4976, 0.1883]$). Regularisation shrinks $\theta$ (class 0: $[4.76,-1.82,-0.59]\to[3.34,-1.03,-0.57]$) and raises final training losses (0.31 / 0.46 / 0.52 vs 0.18 / 0.38 / 0.48).

## Exam focus

1. **Predict with given $\theta$.** $\theta=[-3,1,1]$, $x=(2,2)$: $z=1$, $h=0.7311$ → $y=1$. $x=(1,1)$: $z=-1$, $h=0.2689$ → $y=0$. On the boundary $h=0.5$ → $y=1$.
2. **Boundary equation.** Set $\theta^Tx=0$: $\theta=[-3,1,1]$ → $x_1+x_2=3$. $\theta=[-1,0,0,1,1]$ on $[1,x_1,x_2,x_1^2,x_2^2]$ → circle $x_1^2+x_2^2=1$; $(0.5,0.5)$: $z=-0.5$, $h=0.3775$ → 0; $(1,1)$: $z=1$ → 1.
3. **Probability.** $h=0.7$ → $P(y=1\mid x;\theta)=0.7$, $P(y=0\mid x;\theta)=0.3$.
4. **Single-example cost.** $y=1,h=0.9$: $-\ln0.9=0.1054$. $y=0,h=0.9$: $-\ln0.1=2.3026$. Any data at $\theta=0$: $J=\ln2=0.693$.
5. **One GD step (new data).** $X=[[1,1],[1,2],[1,3],[1,4]]$, $y=[0,0,1,1]$, $\theta=0$, $\alpha=0.5$: $h=0.5$ each, $h-y=[0.5,0.5,-0.5,-0.5]$, $X^T(h-y)=[0,-2]$, $\div m=4$ → $[0,-0.5]$, $\theta:=[0,0.25]$. $J$: 0.6931 → 0.6250; new $h=[0.5622,0.6225,0.6792,0.7311]$.
6. **Continue the slide example.** From $\theta=[0.01,-0.03,0.07]$: $h-y=[-0.4601,0.5150,0.4975,-0.4526,-0.4280]$, $\frac1mX^T(h-y)=[-0.06565,0.33293,-0.58454]$ → $\theta=[0.0166,-0.0633,0.1285]$ (matches slide 30).
7. **Regularised version of 6, $\lambda=1$.** $J_{reg}=0.637875+\frac{1}{10}(0.03^2+0.07^2)=0.638455$. Add $\frac{\lambda}{m}\theta_j=0.2\theta_j$ for $j\ge1$: gradient $[-0.06565,0.32693,-0.57054]$ → $\theta=[0.0166,-0.0627,0.1271]$. $\theta_0$ same as unregularised.
8. **One-vs-all.** $\theta^{(1)}=[-1,2,-1]$, $\theta^{(2)}=[0.5,-1,1]$, $\theta^{(3)}=[-2,0.5,0.5]$, $x=[1,2,1]$: $z=[2,-0.5,-0.5]$, $h=[0.8808,0.3775,0.3775]$ → class 1 (outputs sum to 1.64, which is fine).
9. **Conceptual.** Why linear regression fails (an outlier shifts the 0.5 crossing; $h$ outside $[0,1]$). Why log loss, not MSE (non-convex with sigmoid). Underfit = high bias, overfit = high variance. Two fixes: fewer features, regularisation. $\theta_0$ not regularised (it only shifts the boundary, textbook context). L1 = $\lambda\sum|\theta_j|$, L2 = $\lambda\sum\theta_j^2$.
10. **Formula forms to reproduce.** Logistic $J$ has $-\frac1m$ (linear: $\frac{1}{2m}$); update $\theta:=\theta-\alpha\frac1mX^T(h-y)$; penalty $\frac{\lambda}{2m}\sum_{j=1}^n\theta_j^2$; extra gradient term $\frac{\lambda}{m}\theta_j$.
