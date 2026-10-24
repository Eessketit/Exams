# Week 6.1: Unsupervised Learning Part 1, K-Means Clustering

What this lecture is about: K-Means, the centroid-based clustering algorithm. It covers the assign/update loop and its objective J, the problems with K-Means (choosing K, unequal cluster sizes and densities, outliers, random initialization), K-Means++ initialization with a worked table, and the elbow curve for picking K.

Deck: `6.1. Machine Learning Unsupervised Learning-1.pdf`, 38 pages. Slides 2, 6, 11, 20, 27 and 36 repeat the agenda; slide 37 is "?", slide 38 is the end slide. Notebook: `K-Means.ipynb`. All numbers below were re-checked in Python.

## 1. Clustering and what K-Means is (slides 3-5)
- **Cluster analysis** groups similar objects into clusters. It is **unsupervised**: there are no labels $y$, only inputs $x$ (supervised vs unsupervised: `02_Week1_IntroML_LinearRegression.md`).
- **K-Means** divides a set of objects into **K clusters**, minimizing the sum of squared distances between the objects and their cluster centers. K is **predefined** (chosen by you).
- **Hierarchical clustering** (named on slide 3, not taught further) instead builds a tree-like structure of clusters and needs no K in advance.
- First property of clusters (slide 4): points inside a cluster should be similar, so the aim is to **minimize the distance between points within a cluster**.
- K-Means is **centroid-based** (distance-based): every cluster is represented by its **centroid**, and a point joins the cluster of the nearest centroid.
- Main objective (slides 5, 10): minimize the sum of (squared) distances between points and their cluster centroid. Points in one group are similar, and points in different groups are dissimilar.

## 2. The algorithm in five steps (slides 7-9)
1. **Initialization**: randomly select K points **from the dataset** as the initial centroids.
2. **Assignment**: for each point, compute the distance to each of the K centroids and assign the point to the closest one. This forms K clusters.
3. **Update centroids**: recompute every centroid as the **mean** of the points assigned to it.
4. **Repeat** steps 2 and 3 until **convergence**: the centroids no longer change significantly, or a set number of iterations is reached.
5. **Final result**: output the final centroids and the cluster of every point.

Distance is Euclidean, $d(x,\mu)=\sqrt{\sum_j (x_j-\mu_j)^2}$ (as for KNN, `06_Week3_NaiveBayes_KNN.md`).

## 3. Objective J and the centroid formula (slides 7-8)
$$J=\sum_{k=1}^{K}\sum_{x_i\in C_k}\lVert x_i-\mu_k\rVert^2 \qquad \mu_k=\frac{1}{|C_k|}\sum_{x_i\in C_k}x_i$$
- $C_k$ = set of points assigned to cluster $k$; $\mu_k$ = centroid (mean) of cluster $k$. $J$ is called **inertia** or **SSE** (sum of squared errors) on the elbow slides and in the notebook.
- (textbook context) The assignment step can only lower J for fixed centroids, and the mean is the point that minimizes the squared distance to a set of points, so the update step can only lower J too. J never increases, so K-Means always converges, but only to a **local** minimum that depends on the initial centroids.

## 4. Picture walkthrough (slides 31-35)
- Slide 31: three unlabeled groups of white points in the $(x_1, x_2)$ plane.
- Slide 32: three random centroids (stars: yellow, red, cyan) placed among the points.
- Slide 33: each point is coloured by its nearest star (assignment step). The colours cut across the real groups.
- Slide 34: the stars move to the mean of their coloured points (update step), and the points are re-coloured.
- Slide 35: converged. Each star sits in the middle of one group, and each group has one colour.

## 5. Challenges (slides 12-16)
- **Choosing K** (slide 12): the right K depends on the data structure and the problem, and is hard to find on noisy data. Too small a K **under-clusters** (merges groups), too large a K **over-clusters** (splits groups).
- **Different cluster sizes** (slides 13-14): small left and right groups beside a large central group. With $k=3$ the large group is split, and parts of it are given to the small groups' centroids.
- **Different densities** (slide 15): two tight clusters and one loose, spread-out cluster. K-Means with $k=3$ puts the two tight clusters into one cluster and splits the loose cluster into two.
- Slide 16: "tightly packed points are grouped into one cluster, while loosely spread points ... are now assigned to different clusters". K-Means implicitly prefers round clusters of similar size and spread (textbook context).

## 6. Solutions (slides 17-19)
- **Number of clusters**: use the **elbow method**, a plot of the sum of squared distances against K. Choose the K where the decrease "begins to level off" (section 8).
- **Outliers**: K-Means is sensitive to extreme values, because a single far point drags the mean. Identify and handle outliers first: remove them, transform them, or use a robust variant of K-Means. (IQR and z-score rules: `09_Week5_DataPreparation.md`.)
- **Unequal sizes or densities**: use a **higher number of clusters**, e.g. $k=10$ instead of 3, which may give more meaningful clusters.
- **Random initialization** can give different clusters on every run. Fix: **K-Means++** to choose the initial centroids.

## 7. K-Means++ initialization (slides 21-26)
Steps (slide 21):
1. Choose the **first** centroid uniformly at random from the data points (only one, not all K).
2. Compute $D(x)$, the distance of each point to the **nearest centroid already chosen**.
3. Choose the next centroid from the data points with probability **proportional to $D(x)^2$**.
4. Repeat steps 2 and 3 until K centroids are chosen. Then run normal K-Means.

Worked example (slides 22-23), squared Euclidean distance. Points A(1, 2), B(2, 1), C(5, 4), D(6, 5), E(9, 8). Suppose the first pick is $C_1$ = A.

| Point | $D^2$ to $C_1$=A | Probability | then $D^2$ to $C_2$=E | $\min D^2$ |
|---|---|---|---|---|
| A | 0 | 0 | 100 | 0 |
| B | 2 | 2/156 = 0.013 | 85 | 2 |
| C | 20 | 20/156 = 0.128 | 25 | 20 |
| D | 34 | 34/156 = 0.218 | 18 | 18 |
| E | 100 | 100/156 = 0.641 | 0 | 0 |
| sum | 156 | 1 | | 40 |

- E is the most likely second centroid (0.641), and slide 23 takes $C_2$ = E. With two centroids each point uses its **minimum** $D^2$. The sum is 40, so the third pick is C with 20/40 = 0.5, D with 18/40 = 0.45 or B with 2/40 = 0.05. Slide 23: "the next centroid will likely be C(5,4) or D(6,5)".
- Slides 24-25 picture: first green centroid at random, lines to every point, the farthest point (red) becomes the second centroid, then the point far from both (blue) becomes the third.
- Slide 26: K-Means++ usually gives better clusters. It costs more than random initialization, but the K-Means that follows often **converges faster**.

## 8. Choosing the right K: the elbow curve (slides 28-30)
- Plot K (number of clusters) on the x-axis against an evaluation metric, **inertia** (= J), on the y-axis.
- Inertia always falls as K grows. It reaches 0 when K equals the number of points, so the lowest inertia is **not** the goal.
- Slide 29: inertia about 1000 at K = 2, 200 at 4, 80 at 6, 60 at 8, 45 at 10, then nearly flat.
- Slide 30 circles **K = 6 to 10**, where the curve bends and flattens. That is the **elbow**: after it, extra clusters buy very little reduction in inertia.

## 9. Code from the course notebook (K-Means)
File `K-Means.ipynb`, NumPy from scratch plus sklearn for comparison.
- Data: `make_blobs(n_samples=500, centers=3, cluster_std=0.8, random_state=42)`.
- Loop: `distances = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)`, `cluster_idx = np.argmin(distances, axis=1)`, `cost = np.sum((X - centroids[cluster_idx])**2)`, new centroids = per-cluster `mean(axis=0)`, stop when `np.allclose(centroids, new_centroids)`. Initial centroids: `X[np.random.choice(n, K, replace=False)]`.
- **Seed 11** (random init): cost 34104.09, 5675.38, 611.62, converged at iteration 3. This is the good solution.
- **Seed 42** (random init): cost 18728.63, then about 8985 to 8979.85, converged after 11 iterations. This is a **bad local minimum**, 14.7 times the good cost. It is the slide 19 random-initialization problem.
- **K-Means++** (`kmeans_plus_plus_init`, seed 42): initial centroids (-1.24, 8.02), (4.22, 1.34), (-3.29, 9.38); cost 31932.26, ..., 617.51, **611.62**, converged at iteration 6. The same data and seed now reach the good solution.
- **Elbow** on a harder set (`make_blobs(500, centers=5, cluster_std=[1.0, 2.5, 0.5, 1.5, 0.8])`), K-Means++ cost for K = 1..9: 31369.00, 15962.09, 4726.76, 3735.78, **1584.62**, 1373.63, 1212.56, 1136.06, 981.48. The notebook picks `best_K = 5`: the drop 3735.78 to 1584.62 is the last large one.
- sklearn: `KMeans(n_clusters=3, random_state=42).fit_predict(X)`. sklearn's default initialization is already `k-means++` (textbook context).

## 10. Extra context (textbook context)
- Scale the features before K-Means, since distances are dominated by large-range features (same reason as KNN).
- K-Means vs KNN: K-Means is **unsupervised** clustering with K = number of clusters; KNN is **supervised** classification with k = number of neighbours.
- Other ways to pick K: the silhouette score (cohesion vs separation, from -1 to 1).

## Exam focus
1. **Run K-Means by hand.** Points A(1, 1), B(1.5, 2), C(3, 4), D(5, 7), E(3.5, 5), F(4.5, 5), G(3.5, 4.5), K = 2, initial centroids B and D.
   - Iteration 1: C is 2.500 from B and 3.606 from D, so the clusters are {A, B, C} and {D, E, F, G}. New centroids (1.833, 2.333) and (4.125, 5.375).
   - Iteration 2: C is now 2.034 vs 1.777, so C **moves** to cluster 2. Clusters {A, B} and {C, D, E, F, G}; centroids (1.25, 1.5) and (3.9, 5.1).
   - Iteration 3: no point changes, so it has converged. J = 8.525.
2. **K-Means++ probabilities.** Same 5 points as the slide, first centroid C(5, 4): $D^2$ = 20, 18, 0, 2, 32 (sum 72). P(E) = 32/72 = 0.444, P(A) = 0.278, P(B) = 0.25, P(D) = 0.028.
3. **Elbow.** Best SSE on those 5 points for K = 1..5: 71.2, 18.33, 2.0, 1.0, 0. The big drops stop after K = 3, so the elbow is K = 3.
4. **Definitions to state.** Centroid = mean of the cluster's points. Convergence = centroids stop changing. J = sum of squared distances to the own centroid. The four challenges and their fixes (sections 5-6).
5. **Why K-Means++?** Random initialization can converge to a bad local minimum (notebook seed 42: 8979.85 vs 611.62). Spreading the starting centroids with $D^2$ sampling avoids that.
