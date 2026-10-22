# Decision Tree and Random Forest (Lecture 4.1)

What this lecture is about: building a classification tree top-down by picking, at each node, the attribute with the highest information gain (entropy with log2), shown on the 14-day PlayTennis dataset. Then Random Forest: bootstrapped datasets, random feature subsets, and a majority vote. Deck title: "Machine Learning: Decision Tree and Random Forest", 53 pages.

## 1. Recall: Naive Bayes buy example (slide 2)

Warm-up task carried over from lecture 3.2 (see `06_Week3_NaiveBayes_KNN.md` for the method). The likelihood tables are the same as in 3.2:

| Feature | Value | P(.\|Yes) | P(.\|No) | P(value) |
|---|---|---|---|---|
| Day | Weekday | 4/10 | 1/5 | 5/15 |
| Day | Weekend | 2/10 | 2/5 | 4/15 |
| Day | Holiday | 4/10 | 2/5 | 6/15 |
| Discount | Yes / No | 8/10 / 2/10 | 2/5 / 3/5 | 10/15 / 5/15 |
| Free Delivery | Yes / No | 9/10 / 1/10 | 2/5 / 3/5 | 11/15 / 4/15 |
| Prior | | 10/15 | 5/15 | |

Question: what is P(No buy | Day=Weekday, Discount=No, Free Delivery=Yes)? The slide gives no answer. Here it is solved with the professor's 3.2 convention: divide by the product of marginals, then normalize by the sum.
- $P(\text{No}\mid X)=\frac{(1/5)(3/5)(2/5)(5/15)}{(5/15)(5/15)(11/15)}=\frac{0.0160}{0.08148}=0.196$
- $P(\text{Yes}\mid X)=\frac{(4/10)(2/10)(9/10)(10/15)}{0.08148}=\frac{0.0480}{0.08148}=0.589$
- Normalize over the sum 0.785: **No = 25%, Yes = 75%**, so the prediction is that the customer buys.

## 2. Decision tree definition and types: ID3, C4.5, CART (slides 5-8)

- A decision tree is a **non-parametric supervised** method for classification and regression. It is a hierarchy of a root, branches, internal nodes and leaf nodes. Prediction starts at the root and the leaf makes the decision.
- Strength (slide 5): easy to understand, interpret and implement.
- **ID3** chooses splits by **entropy** (information gain).
- **C4.5** is an improved ID3 that handles **missing data and continuous attributes**.
- **CART** chooses splits by **Gini impurity** and does both classification and regression.

## 3. Terminology (slides 10-13)

| Term | Meaning on the slides |
|---|---|
| Root node | First node; the whole dataset starts dividing here |
| Splitting | Dividing a node into sub-nodes (arrow in the figure) |
| Decision node | Node produced by splitting that is split further (an intermediate condition) |
| Leaf / terminal node | No further split; holds the final class |
| Sub-tree / branch | A sub-section of the tree, one path of decisions |
| Pruning | Removing nodes to **prevent overfitting** and simplify the model |
| Parent / child | A node that is split is the parent; the sub-nodes it produces are its children |

## 4. How the algorithm works and its assumptions (slides 15-20)

Steps (slide 15): **start at the root** with the full data, **ask the best question** (the feature that best separates the groups), **branch out** into subsets, then **repeat** until leaves are reached.

Assumptions and considerations (slides 16-20, examinable as a list):
- **Binary splits**, typically. Note that the worked example below uses multiway splits (Outlook has 3 branches), which is what ID3 does. CART is strictly binary (textbook context).
- **Recursive partitioning** continues until a stopping criterion is met.
- **Feature independence** is often assumed, but trees still work when features are correlated.
- **Homogeneity**: each split aims for nodes that are as pure as possible.
- **Top-down greedy**: each split maximizes IG or minimizes impurity *locally*, so the tree may not be globally optimal.
- Handles **categorical and numerical** features, with different splitting strategies for each.
- **Overfitting**: trees easily capture noise. The fixes are pruning and stopping criteria.
- **Impurity measures**: Gini or entropy, and the choice can change the tree.
- **No missing values**, or they must be imputed first.
- **Equal importance of features** unless weighting is applied. **No outliers**: trees are sensitive to them. **Sample size**: a small dataset leads to overfitting, a large one to overly complex trees.

## 5. Entropy (slides 22, 24-28)

$$E(S) = -\,p_{(+)}\log p_{(+)} - p_{(-)}\log p_{(-)}$$
- $p_{(+)}$ is the probability of the positive class, $p_{(-)}$ of the negative class, and $S$ is the subset of training examples at the node.
- **Log base is 2.** Slide 22 just writes "log", but the computations on slides 26-27 use $\log_2$. So binary entropy lies in $[0,1]$: it is 0 for a pure node and 1 for a 50/50 node. Take $0\log 0 = 0$ (textbook context). For $k$ classes the general form is $-\sum_i p_i\log_2 p_i$ with maximum $\log_2 k$ (textbook context).
- Entropy measures **impurity**, the degree of randomness. "Higher entropy means lower purity and higher impurity." A pure sub-split contains only "yes" or only "no".

Slides 25-27 example: Feature 1 holds 8 yes / 4 no. It splits into a left node with 5 yes / 2 no (Feature 2) and a right node with 3 yes / 2 no (Feature 3). Each child then splits into pure leaves. "When purity is 100%, we make it a leaf node."

| Node | Slide working | Slide value | Exact (Python) |
|---|---|---|---|
| Left 5/2 | $-(0.71\cdot -0.49) - (0.28\cdot -1.83) = 0.34+0.51$ | 0.85 | **0.8631** |
| Right 3/2 | $-(0.6\cdot -0.73) - (0.4\cdot -1.32) = 0.438+0.528$ | 0.966 | **0.9710** |
| Parent 8/4 | not computed | | 0.9183 |

- **Slide rounding errors:** on slide 26, 2/7 = 0.2857 (not 0.28) and $\log_2(2/7) = -1.807$ (not -1.83), so the exact value is 0.863, not 0.85. On slide 27, $\log_2 0.6 = -0.737$, which gives 0.971, not 0.966. The conclusion still holds: the left node has lower entropy and is purer (slide 28).
- IG of this Feature 1 split (not on the slide): $0.9183 - (\tfrac{7}{12}0.8631 + \tfrac{5}{12}0.9710) = 0.0102$.

## 6. Information gain (slides 29, 31)

- Entropy alone only tells you how impure a node is. **Information gain** says how much the parent entropy *decreased* after splitting on a feature. It decides which attribute becomes the root or decision node, and the highest IG wins.

$$\text{Information Gain} = E(Y) - E(Y\mid X)$$
$$I.G(S,a) = Entropy(S) - \sum_{v\in values(a)} \frac{|S_v|}{|S|}\,Entropy(S_v)$$
- In words: the entropy of the full dataset minus the entropy of the dataset given the feature, where each child is **weighted by its share of the rows**.

## 7. Worked example: PlayTennis tree built with ID3 (slides 32-34)

Dataset (slides 32 and 41), 14 rows, 9 Yes / 5 No:

| Day | Outlook | Temp | Humidity | Wind | PlayTennis |
|---|---|---|---|---|---|
| D1 | Sunny | Hot | High | Weak | No |
| D2 | Sunny | Hot | High | Strong | No |
| D3 | Overcast | Hot | High | Weak | Yes |
| D4 | Rain | Mild | High | Weak | Yes |
| D5 | Rain | Cool | Normal | Weak | Yes |
| D6 | Rain | Cool | Normal | Strong | No |
| D7 | Overcast | Cool | Normal | Strong | Yes |
| D8 | Sunny | Mild | High | Weak | No |
| D9 | Sunny | Cool | Normal | Weak | Yes |
| D10 | Rain | Mild | Normal | Weak | Yes |
| D11 | Sunny | Mild | Normal | Strong | Yes |
| D12 | Overcast | Mild | High | Strong | Yes |
| D13 | Overcast | Hot | Normal | Weak | Yes |
| D14 | Rain | Mild | High | Strong | No |

**Step 1, root.** $E(S) = -\tfrac{9}{14}\log_2\tfrac{9}{14} - \tfrac{5}{14}\log_2\tfrac{5}{14} = 0.940$. The slides show only the final tree; the numbers below are computed and verified.

| Attribute | Value: Yes/No (entropy) | Weighted child E | **IG** |
|---|---|---|---|
| **Outlook** | Sunny 2/3 (0.971), Overcast 4/0 (0), Rain 3/2 (0.971) | 0.694 | **0.247** |
| Humidity | High 3/4 (0.985), Normal 6/1 (0.592) | 0.788 | 0.152 |
| Wind | Weak 6/2 (0.811), Strong 3/3 (1.000) | 0.892 | 0.048 |
| Temp | Hot 2/2 (1.000), Mild 4/2 (0.918), Cool 3/1 (0.811) | 0.911 | 0.029 |

Outlook becomes the root. The **Overcast** branch is pure (4/0), so it is a **Yes leaf**.

**Step 2, Sunny branch** (slide 33 "left node": D1, D2, D8, D9, D11; 2 Yes / 3 No; E = 0.971):

| Attribute | Split | Weighted E | IG |
|---|---|---|---|
| **Humidity** | High 0/3, Normal 2/0 | 0 | **0.971** |
| Temp | Hot 0/2, Mild 1/1, Cool 1/0 | 0.400 | 0.571 |
| Wind | Weak 1/2, Strong 1/1 | 0.951 | 0.020 |

**Step 3, Rain branch** (slide 33 "right node": D4, D5, D6, D10, D14; 3 Yes / 2 No; E = 0.971):

| Attribute | Split | Weighted E | IG |
|---|---|---|---|
| **Wind** | Weak 3/0, Strong 0/2 | 0 | **0.971** |
| Temp | Mild 2/1, Cool 1/1 | 0.951 | 0.020 |
| Humidity | High 1/1, Normal 2/1 | 0.951 | 0.020 |

Final tree (slide 34), shown with the professor's "Yes=, No=" node labels:
```
Outlook [Yes=9, No=5]
|- Sunny    -> Humidity [Yes=2, No=3]
|              |- High   -> [Yes=0, No=3]  No
|              |- Normal -> [Yes=2, No=0]  Yes
|- Overcast -> [Yes=4, No=0]  Yes
|- Rain     -> Wind [Yes=3, No=2]
               |- Strong -> [Yes=0, No=2]  No
               |- Weak   -> [Yes=3, No=0]  Yes
```
- Temp is never used. The tree classifies all 14 training rows correctly, and every leaf is pure.
- **Slide 34 question:** X_test = {Outlook: Sunny, Hum: High, Temp: Hot, Wind: Weak} (the slide misspells it "Tep"). The path is Sunny, then Humidity High, giving **No**.

## 8. Gini index and gain ratio (textbook context, Gini named on slides 8, 19)

- **Gini impurity** (used by CART): $Gini(S) = 1 - \sum_i p_i^2$. For two classes it lies in $[0, 0.5]$. Choose the split with the lowest weighted Gini, i.e. the highest Gini gain.
- **Gain ratio** (used by C4.5): $GR = \dfrac{IG}{SplitInfo}$, where $SplitInfo(S,a) = -\sum_v \frac{|S_v|}{|S|}\log_2\frac{|S_v|}{|S|}$. It penalizes attributes with many values.

PlayTennis root (Gini(S) = 0.459):

| Attribute | Weighted Gini | Gini gain | SplitInfo | Gain ratio |
|---|---|---|---|---|
| Outlook | 0.343 | **0.116** | 1.577 | **0.156** |
| Humidity | 0.367 | 0.092 | 1.000 | 0.152 |
| Wind | 0.429 | 0.031 | 0.985 | 0.049 |
| Temp | 0.440 | 0.019 | 1.557 | 0.019 |

- All three measures pick Outlook here.
- Why IG is biased: splitting on **Day** (14 unique values) gives IG = 0.940, the maximum possible, but the tree is useless. Its gain ratio is $0.940/\log_2 14 = 0.247$, which still beats Outlook. That is why C4.5 also considers only attributes with above-average gain.

## 9. Stopping, overfitting and pruning (slides 12, 16, 19-20, 25)

- On the slides: stop when a node is 100% pure (it becomes a leaf, slide 25), or when "a stopping criterion is met" (slide 16). Overfitting is addressed with **pruning and appropriate stopping criteria** (slide 19).
- The usual criteria (textbook context): pure node, no attributes left (then predict the majority class), max depth reached, min samples per node or leaf, or IG below a threshold.
- Pre-pruning means stopping early with those limits. Post-pruning means growing the full tree and then cutting sub-trees that do not improve validation accuracy, e.g. CART cost-complexity pruning (textbook context).
- Cons from the slides: prone to overfitting, greedy rather than globally optimal, sensitive to outliers and sample size, and needs missing values handled first.

## 10. Random forest (slides 36-50)

- **Definition (slide 37):** an ensemble of many decision trees. Each tree sees a random part of the data. Predictions are combined by **majority voting** for classification and **averaging** for regression.
- **Algorithm (slides 39-40):** (1) build many trees, each on a random sample of rows (bootstrap = sampling rows *with replacement*); (2) at splits, look at only a **few random features**; (3) each tree predicts; (4) combine by vote or average. The randomness keeps the trees different, which reduces overfitting.

Slides 42-45: three bootstrapped datasets of 14 rows each, made from the original. Red rows are the duplicates, and the blanked column is the dropped feature:

| Set | Duplicated rows | Rows left out (OOB) | Features used | Root counts | Tree |
|---|---|---|---|---|---|
| 1 | D5, D7 (replace D4, D11) | D4, D11 | Outlook, Humidity, Wind (no Temp) | 9/5 | Outlook root, then Sunny: Humidity, Rain: Wind |
| 2 | D3, D8, D6 (replace D1, D10, D13) | D1, D10, D13 | all four | 8/6 | Temp root, then Hot: Outlook, Mild: Humidity, Cool: Wind |
| 3 | D1, D9 (replace D3, D8) | D3, D8 | Outlook, Temp, Humidity (no Wind) | 9/5 | Humidity root, then High: Outlook, Normal: Temp |

- All node counts in trees 1 and 3 check out against their datasets.
- **Slide 44 error:** in tree 2, the Temp=Mild node is Yes=3/No=3, but its "High" child is drawn as Yes=3, No=2. Recounting the bootstrap (D4 Y, D8 N, D8 N, D12 Y, D14 N) gives **Yes=2, No=3**, so that leaf should predict No. As drawn, its children's Yes counts (3+1=4) exceed the parent's 3.
- Trees 2 and 3 are not the IG-best trees over all features. In set 2, IG(Outlook) = 0.292 but the root is Temp with IG 0.013. In tree 3's Normal branch, Outlook has IG 0.199 versus Temp's 0.092. This is consistent with random feature choice per split.
- **Slide 46 test:** x = {Outlook=Sunny, Temp=Cool, Humidity=High, Wind=Strong}. DT1 says No (Sunny, High), DT2 says No (Cool, Strong 1/2), DT3 says No (High, Sunny 0/3). The vote is unanimous, so the **final answer is No**. The slide spells it "Testting".
- **Key features (slide 48):** handles missing data, gives feature importance, works with big and complex data, and does both classification and regression.
- **Assumptions (slide 50):** trees decide independently, they are built on random rows and features, enough data is needed for the trees to differ, and diverse predictions improve accuracy.

## 11. Implementation (slide 51, no code in deck)

The deck stops at the "Implementing Random Forest" content slide, so the code below is textbook context, verified on the PlayTennis data:
```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
X = pd.get_dummies(df[["Outlook","Temp","Humidity","Wind"]]); y = df["PlayTennis"]
dt = DecisionTreeClassifier(criterion="entropy").fit(X, y)   # default criterion is "gini"
rf = RandomForestClassifier(n_estimators=100, max_features="sqrt", bootstrap=True).fit(X, y)
```
- sklearn's tree is binary CART, so on one-hot columns it builds a different shape: depth 4, 7 leaves. It still fits the training data 100% and predicts **No** for the slide 34 X_test.

## Exam focus

1. **Entropy of a node, with log2.** 9/5 gives 0.940. 7/7 and 4/4 give 1. 14/0 gives 0. 3/1, 1/3 and 6/2 all give 0.811. Three equal classes (2/2/2) give $\log_2 3 = 1.585$.
2. **Choose the root.** Compute IG for each attribute and take the largest: Outlook 0.247 > Humidity 0.152 > Wind 0.048 > Temp 0.029. Remember to **weight** each child by $|S_v|/|S|$.
3. **Toy split.** Parent 6 Yes / 4 No becomes children 4/0 and 2/4. $E_{parent} = 0.971$, $E_{children} = 0.4\cdot 0 + 0.6\cdot 0.918 = 0.551$, so **IG = 0.420**. With Gini: $0.48 - 0.6\cdot 0.444 = 0.213$.
4. **Predict with the slide 34 tree.** Sunny/High/Hot/Weak gives No. Rain/High/Mild/Weak gives Yes (Wind Weak). Overcast/High/Hot/Strong gives Yes (Overcast is always Yes). Sunny/Normal/Cool/Strong gives Yes.
5. **Sub-tree choice.** On the Sunny subset, Humidity has IG 0.971 (perfect split), above Temp 0.571 and Wind 0.020. On the Rain subset, Wind has IG 0.971.
6. **Random forest vote.** x = {Sunny, Hot, Normal, Weak}: DT1 says Yes (Sunny, Normal), DT2 says No (Hot, Sunny 0/1), DT3 says Yes (Normal, Hot 1/0). Majority 2-1, so **Yes**.
7. **Conceptual questions.** ID3 uses entropy/IG, C4.5 handles missing and continuous values (gain ratio), CART uses Gini and is binary and also does regression. Pruning prevents overfitting. The greedy split is locally, not globally, optimal. Higher entropy means lower purity.
8. **Naive Bayes recall (slide 2):** P(No | Weekday, Discount=No, FreeDelivery=Yes) = 25% after normalization (0.196 vs 0.589).
