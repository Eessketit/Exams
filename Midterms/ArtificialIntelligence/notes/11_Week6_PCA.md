# Week 6.2: Unsupervised Learning Part 2, Principal Component Analysis (PCA)

What this lecture is about: PCA as a dimensionality-reduction method. It builds new uncorrelated variables (principal components) ordered by how much variance they explain, computed in five steps: mean, covariance matrix, eigenvalues, eigenvectors, projection. The worked 4×2 example is done by hand below.

Deck: `6.2. Machine Learning Unsupervised Learning-2.pdf`, 19 pages. Slides 3, 9 and 13 repeat the agenda; slide 18 is "?", slide 19 is "thank you". Notebook: `PCA.ipynb`. All numbers below were re-checked in Python.

## 1. What PCA is (slides 4-5)
- PCA is a **dimensionality reduction** method: it transforms a large set of variables into a smaller one that still contains **most of the information** of the large set.
- Fewer variables cost a little accuracy, but the trick is "to trade a little accuracy for simplicity". Smaller data sets are easier to explore and visualize, and faster for ML algorithms.
- One-line idea (slide 5): **reduce the number of variables while preserving as much information as possible.**
- PCA is **unsupervised**: it uses only $X$, never the labels $y$.

## 2. Principal components (slides 6-7)
- Principal components are **new variables** built as **linear combinations** of the initial variables.
- They are **uncorrelated**, and most of the information is squeezed into the **first** components.
- 10-dimensional data gives **10** principal components. PCA puts the maximum possible information into PC1, the maximum remaining into PC2, and so on.
- Slide 7 (scree plot): the percentage of explained variance falls from about 40% for PC1 to about 18%, 12%, 8% and so on. Keep the first components and discard the low-information ones.
- Principal components are **less interpretable**. They have no real meaning, because each one mixes all the original variables.

## 3. Geometric view: directions of maximum variance (slides 8, 10-12)
- Geometrically, principal components are the **directions of the data that explain a maximal amount of variance**: the lines that capture most of the information.
- Variance = information: the larger the variance along a line, the larger the dispersion of the points along it, and the more information it carries.
- Think of the PCs as **new axes** that give the best angle to see the data.
- Slide 11: PC1 is the line through the (centred) origin on which the **projections** of the points (red dots) are **most spread out**. Mathematically it maximizes the variance, the average squared distance from the projected points to the origin.
- Slide 12: PC2 is computed the same way, with the condition that it is **uncorrelated with (perpendicular to) PC1** and accounts for the next highest variance. This continues until **p components = the number of original variables**.

## 4. Step by step (slides 14-16)
1. **Mean** of each variable: $\bar X=\frac{\sum_{i=1}^{m}x_i}{m}$. Then centre the data: $X_{centered}=X-\bar X$.
2. **Covariance matrix** (2 variables):
$$S=\begin{bmatrix}Cov(X_1,X_1)&Cov(X_1,X_2)\\Cov(X_2,X_1)&Cov(X_2,X_2)\end{bmatrix},\qquad Cov(x,y)=\frac{1}{n-1}\sum_{i=1}^{n}(x_i-\bar x)(y_i-\bar y)$$
   The divisor is **n − 1** (sample covariance, the same as `np.cov`). $Cov(X_1,X_1)$ is the variance of $X_1$. $S$ is symmetric.
3. **Eigenvalues**: solve $\det(S-\lambda I)=0$, where $I$ is the $n\times n$ identity. For a 2×2 matrix $\begin{bmatrix}a&b\\b&d\end{bmatrix}$ this is $\lambda^2-(a+d)\lambda+(ad-b^2)=0$, so $\lambda=\frac{a+d}{2}\pm\sqrt{\left(\frac{a-d}{2}\right)^2+b^2}$ (textbook context for the closed form).
4. **Eigenvectors**: solve $(S-\lambda I)U=0$ with $U=[u_1,u_2]^T$, then normalize to length 1. The eigenvector of the **largest** eigenvalue is the first principal direction $u_1$.
5. **First principal component**: project the centred data, $\text{Transformed Data}=X_{centered}\cdot u_1$ (the slide writes it as $X^T_{centered}\cdot u_1$, one point per column).

- Each eigenvalue is the **variance along its eigenvector**. The share of information kept by PC1 is $\lambda_1/\sum\lambda$ (explained variance ratio, textbook context).

## 5. Worked example (slide 17)
Data: $X_1$ = 4, 8, 13, 7 and $X_2$ = 11, 4, 5, 14. Slide answer PC1 = −4.3052, 3.7361, 5.6928, −5.1238.

| Step | Result |
|---|---|
| Mean | $\bar X_1$ = 32/4 = 8, $\bar X_2$ = 34/4 = 8.5 |
| Centred rows | (−4, 2.5), (0, −4.5), (5, −3.5), (−1, 5.5) |
| Cov($X_1$,$X_1$) | (16 + 0 + 25 + 1)/3 = **14** |
| Cov($X_2$,$X_2$) | (6.25 + 20.25 + 12.25 + 30.25)/3 = **23** |
| Cov($X_1$,$X_2$) | (−10 + 0 − 17.5 − 5.5)/3 = **−11** |
| Characteristic equation | $(14-\lambda)(23-\lambda)-121=\lambda^2-37\lambda+201=0$ |
| Eigenvalues | $\lambda=(37\pm\sqrt{565})/2$ = **30.3849** and **6.6151** |
| Eigenvector of 30.3849 | $(14-30.3849)u_1-11u_2=0\Rightarrow u_2=-1.4895\,u_1$; normalized $u_1$ = **(0.5574, −0.8303)** |
| PC1 = centred row · $u_1$ | row 1: −4(0.5574) + 2.5(−0.8303) = **−4.3052**; then **3.7361, 5.6928, −5.1238** |

- PC1 keeps 30.3849/37 = **82.1%** of the total variance. PC2 (eigenvector (0.8303, 0.5574), variance 6.6151) keeps 17.9%.
- **Sign:** an eigenvector is only defined up to sign. The notebook's `eigh` returns (−0.5574, 0.8303), so its PC1 is 4.3052, −3.7361, −5.6928, 5.1238, the slide's values with the opposite sign. Both are correct.

## 6. Code from the course notebook (PCA)
File `PCA.ipynb`.
- **By hand with NumPy** on the slide 17 data: `X_mean = np.mean(X, axis=0)` gives [8, 8.5]; `np.cov(X_centered, rowvar=False)` gives [[14, −11], [−11, 23]]; `np.linalg.eigh` (for symmetric matrices, real output) gives eigenvalues [30.3849, 6.6151] after sorting in descending order; `PC = X_centered.dot(components)` gives [4.305, −3.736, −5.693, 5.124]. The plot shows PC1 as an arrow from the mean, with each point's projection onto it.
- **`class PCA`**: `fit` centres, takes `np.cov`, `eigh`, sorts descending and keeps the top `n_components` eigenvectors; `transform` returns `(X - mean_) @ components_`. The class has no `fit_transform`, so call `fit` and then `transform`. Cell 14's `pca.fit_transform(X_train)` only runs if sklearn's `PCA` is the one in scope.
- **Effect on a model**: `make_classification(n_samples=1000, n_features=800, n_informative=10, n_redundant=5)`, 80/20 split. Accuracy with all 800 features: SVM (linear) **0.73**, Random Forest **0.745**. After PCA to **50** components: SVM **0.805**, RF **0.785**. Removing noise dimensions helped both models.
- PCA is fit on the **training** data only, and the test data is only transformed (the cell comment says this avoids data leakage, see `09_Week5_DataPreparation.md`).

## 7. Extra context (textbook context)
- **Standardize first** when the variables have different units. Otherwise the large-range variable dominates the variance and PC1.
- How many components: keep enough for, e.g., 90 to 95% cumulative explained variance, or cut at the elbow of the scree plot (slide 7).
- PCA vs feature selection: PCA **creates** new combined features (feature extraction), while selection **keeps** a subset of the original ones (`09_Week5_DataPreparation.md`).

## Exam focus
1. **PCA by hand, nice numbers.** Points (1, 2), (4, 2), (4, 5), (5, 5).
   - Mean (3.5, 3.5). Centred (−2.5, −1.5), (0.5, −1.5), (0.5, 1.5), (1.5, 1.5).
   - $S=\begin{bmatrix}3&2\\2&3\end{bmatrix}$, so $\lambda^2-6\lambda+5=0$, giving $\lambda$ = 5 and 1.
   - $u_1=(1,1)/\sqrt2=(0.7071, 0.7071)$, and PC1 = −2.828, −0.707, 1.414, 2.121 (variance 5). PC1 keeps 5/6 = 83.3%.
2. **Slide 17 example**: mean (8, 8.5), $S$ = [[14, −11], [−11, 23]], $\lambda_1$ = 30.385, $u_1$ = (0.5574, −0.8303), PC1 = −4.3052, 3.7361, 5.6928, −5.1238.
3. **Facts to state**: p variables give p components; the PCs are uncorrelated (perpendicular); PC1 has the largest variance; the covariance uses n − 1; the PCs are linear combinations, so they are hard to interpret.
4. **Why PCA?** Fewer variables, so data is faster to train on, easier to visualize, and has less noise (notebook: 800 features to 50 raised SVM accuracy from 0.73 to 0.805). The cost is a little lost information.
