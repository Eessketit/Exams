# Week 5.2: Preparing Datasets for ML Model Training

What this lecture is about: turning raw data into a reliable training set (inspect, clean missing values, duplicates and outliers, scale, encode, rebalance, engineer and select features) without leaking test information, plus the Titanic notebook that runs every step and measures its effect on accuracy.

Deck: `5.2 Data preparation fo ML models.pdf`, 39 pages (38 to 39 are a question slide and a thank-you slide). Most of the deck is concept cards. The only formulas are on slides 13, 14, 16 and 18 to 20, and the only numeric example is on slide 24.

## 1. Foundations of data (slides 3-6)
- **Data** = any recorded fact, measurement or observation a system can process and learn from. For an ML model it is "the only source of experience".
- Slide 4 numbers: **2.5 EB** generated per day (1 EB = $10^9$ GB, checked); **80%** of enterprise data is unstructured or poorly organised; **60 to 70%** of a data scientist's time goes into preparation; **\$3.1T** lost yearly in the US to poor-quality data (IBM). "Garbage in, garbage out."
- **Structured** data (slide 5) is rows × columns: tabular/CSV (one row = one observation, one column = one feature), relational DBs, **time series** (split chronologically, not randomly). Linear models, trees and gradient boosting take it with little preprocessing.
- **Unstructured** data (slide 6), over 80% of new data: text (needs tokenization and embeddings), images/video (resizing, normalization, augmentation), audio (sampling, spectrograms, denoising). **Semi-structured** data: JSON, XML, logs (flexible schema).

## 2. The preparation pipeline and inspection (slides 7-9)
- 6 steps: **Collect → Inspect → Clean → Transform → Store → Visualize**.
- Principles: *inspect early*, *automate* (pandas or sklearn `Pipeline`, not manual edits), *version everything*.
- Collection sources: APIs, IoT/logs/event streams, web scraping, public datasets/surveys/partner data.
- Five-minute inspection habit: `df.shape`, `df.dtypes`, `df.head()`, `df.describe()`.
- **Six problems every raw dataset has** (slide 9): missing values (NULL/NaN, typically **5 to 20%**), duplicates (ETL bugs), wrong format (dates as text, numbers as strings), outliers, inconsistency ('Tashkent'/'tashkent'/'TASHKENT'), broken relationships (a foreign key pointing to a deleted record).

## 3. Missing values (slides 10-11)
| Mechanism | Meaning | Slide example |
|---|---|---|
| **MCAR**, Missing Completely At Random | not related to any variable, observed or not | a sensor briefly went offline |
| **MAR**, Missing At Random | related to *other observed* variables | older respondents skip income questions |
| **MNAR**, Missing Not At Random | depends on the *missing value itself* (the hardest case) | high earners hide their income |

| Method | Code | Use |
|---|---|---|
| Drop | `dropna()` | remove the row or column |
| Mean/Median | `mean()` / `median()` | numeric columns |
| Mode | `mode()` | categorical columns |
| KNN Imputer | `KNNImputer` | learn from the nearest neighbours |
| Iterative Imputer | `IterativeImputer` | predict each value from the other columns (**MICE**) |

- Modern approach: deep-learning imputers such as **GAIN** (Generative Adversarial Imputation Nets) and **datawig**.
- Slide 36 mistake: dropping every row with a missing value. Diagnose the mechanism first, then choose a strategy.

## 4. Duplicates (slide 12)
- Example table: ID 001 Alice 25 alice@mail.com appears twice (rows 1 and 3). The highlighted row 3 is the duplicate of row 1. Fix: `df.drop_duplicates(inplace=True)`.
- Exact duplicates have the same values in every column. **Near-duplicates** (typos, reformatted addresses, capitalization) need similarity-based **record linkage** (libraries `recordlinkage`, `dedupe`).

## 5. Outliers: IQR, Z score, ML detectors (slides 13-15)
**IQR rule** (slide 13), "robust, distribution-free":
$$IQR = Q3 - Q1,\qquad \text{lower} = Q1 - 1.5\times IQR,\qquad \text{upper} = Q3 + 1.5\times IQR$$
- Q1 = 25th percentile and Q3 = 75th percentile (`df.quantile(0.25)`, `df.quantile(0.75)`). A value is an outlier if it lies **strictly outside** the bounds. The slide code keeps `>= lower` and `<= upper`.
- **Slide code bug:** `df[(df >= Q1-1.5*IQR) & (df <= Q3+1.5*IQR)]` uses a DataFrame mask. That keeps every row and turns outlier cells into NaN. To actually drop rows, write `df[mask.all(axis=1)]`. Checked: a 5-row frame stays 5 rows with a NaN; with `.all(axis=1)` it becomes 4 rows.

**Z-score rule** (slide 14):
$$z = \frac{x-\mu}{\sigma}$$
- μ = column mean, σ = standard deviation. **|z| > 3** is the common outlier cutoff. The code `z = np.abs(stats.zscore(df)); df_clean = df[(z < 3).all(axis=1)]` keeps rows where every feature has |z| < 3.
- It assumes roughly normal data, and an extreme value inflates μ and σ (masking). Slide advice: "combine with IQR when in doubt".
- `scipy.stats.zscore` uses the population σ (ddof=0) by default. With that σ, |z| can never exceed $\sqrt{n-1}$, so for n ≤ 10 the strict |z| > 3 rule can never flag anything (checked: n = 9 gives 2.83, n = 10 gives exactly 3). (textbook context)

**ML-based detectors** (slide 15):
- **Isolation Forest** makes random splits. Anomalies need far fewer splits to isolate. Code: `IsolationForest(contamination=0.1)`, `df['anomaly'] = model.fit_predict(df)`.
- **Local Outlier Factor** is density-based: it compares a point's local density with its neighbours' density. Code: `LocalOutlierFactor(n_neighbors=20)`, `lof.fit_predict(df)`.
- `fit_predict` returns −1 for an anomaly and +1 for an inlier. (textbook context)
- **Autoencoders**: a high reconstruction error flags an anomaly. Good for high-dimensional data such as images and signals.
- Checklist (slide 37): after detecting an outlier, decide whether to **fix, cap or keep** it.

## 6. Data quality metrics and profiling (slides 16-17)
| Dimension | Question | Formula |
|---|---|---|
| Completeness | Are all required values present? | Available / Expected × 100% |
| Accuracy | Do values reflect the real world? | Correct / Total × 100% |
| Consistency | Is the same fact recorded the same way everywhere? | Consistent / Total × 100% |
| Timeliness | Is the data current? | Up-to-date / Total × 100% |
| Uniqueness | Are there duplicates? | Unique / Total × 100% |
| Validity | Are values within the allowed range or format? | Valid format / Total × 100% |

- Profiling tools: **ydata-profiling** (`ProfileReport(df).to_file('report.html')`: per-column statistics, correlations, missing-value plots), **Great Expectations** (data-quality rules, CI/CD, data contracts), **Apache Griffin** (real-time monitoring, batch and streaming, Hadoop/Spark).

## 7. Feature scaling (slides 18-20)
Why scale: features on very different ranges (age in years vs income in dollars) get implicitly weighted unequally.

| Method | Formula | Output | Based on | Outlier sensitivity | Best for |
|---|---|---|---|---|---|
| Min-Max (`MinMaxScaler`) | $x'=\dfrac{x-\min}{\max-\min}$ | [0, 1] | min / max | very sensitive | neural networks, KNN, SVM |
| Z-score standardization (`StandardScaler`) | $x'=\dfrac{x-\mu}{\sigma}$ | mean 0, std 1, unbounded | mean / std | sensitive | linear and logistic regression, PCA, models that assume normal inputs |
| Robust (`RobustScaler`) | $x'=\dfrac{x-Q2}{Q3-Q1}$ | median-centred, IQR-scaled | median / IQR | resistant | data with many outliers |

- Standardization does **not** bound the output, so new values outside the training range are handled "more gracefully". It also does **not remove outliers**.
- Rule of thumb (slide 20): start with standardization for linear models. Switch to Robust as soon as a boxplot or IQR check shows heavy outliers you don't want to delete.
- **Critical rule** (slides 18, 19): fit the scaler **only on training data**. On the test set call `transform()` only, never `fit()` again.
- Tree models (07_Week4_DecisionTree.md) are scale-invariant. Scale-sensitive models: KNN (06_Week3_NaiveBayes_KNN.md), SVM (08_Week4_SVM.md) and gradient-descent models (02, 03, 04).

## 8. Categorical encoding (slides 21-22)
| City | Label code (slide) | Tsh | Smk | Bkh |
|---|---|---|---|---|
| Tashkent | 0 | 1 | 0 | 0 |
| Samarkand | 1 | 0 | 1 | 0 |
| Bukhara | 2 | 0 | 0 | 1 |

- **Label encoding** (`LabelEncoder().fit_transform(df['city'])`). Best for **ordinal** categories (small < medium < large). On nominal data it "invents a false numeric relationship".
- **One-hot** (`pd.get_dummies(df, columns=['city'])`). Best for **nominal** categories with a manageable number of unique values.
- **Slide inconsistency:** sklearn's `LabelEncoder` sorts classes alphabetically, so the shown code gives **Bukhara 0, Samarkand 1, Tashkent 2**, not the 0/1/2 in the table (checked). It also ignores real order (low/medium/high → 1/2/0), so for ordinal features use `OrdinalEncoder(categories=[[...]])`, which slide 36 calls "an ordinal encoder". (textbook context for the class name)
- `pd.get_dummies` names columns `city_Bukhara`, `city_Samarkand`, `city_Tashkent` (alphabetical) with **bool** dtype in pandas 2 and later.
- **Target encoding** (slide 22): replace each category with the **mean of the target** for that category. Example: Tashkent \$85k, Samarkand \$62k, Bukhara \$71k average salary. Code: `ce.TargetEncoder(cols=['city']).fit_transform(df, df['salary'])`. Best for high cardinality (hundreds of categories). It must be fit on train only, because it uses y. (textbook context)
- **Entity embeddings**: a neural network learns a dense vector per category (used in TabNet, FT-Transformer, recommenders). Similar cities end up with similar vectors.

## 9. Big data and class imbalance (slides 23-25)
- **5 Vs**: Volume (Google processes over 20 PB/day), Velocity (hundreds of thousands of events/s), Variety (over 80% unstructured), Veracity (noisy, uncertain), Value.
- **Fraud example** (slide 24): Normal 9,980 (99.8%), Fraud 20 (0.2%), total 10,000. A model that always predicts "Normal" gets accuracy 9980/10000 = **99.8%** but fraud recall 0/20 = **0**. Checked. Evaluate with precision, recall, F1 or PR-AUC instead (see 05_Week3_EvaluatingLearningAlgorithms.md).
- **SMOTE** (Synthetic Minority Oversampling Technique), 4 steps: (1) pick a minority-class point, (2) find its **k nearest minority-class neighbours**, (3) **interpolate** a new point between them, (4) add it to the training set.
  - Interpolation: $x_{new} = x_i + \lambda\,(x_{nn} - x_i)$ with $\lambda\sim U[0,1]$ (textbook context).
  - Code: `SMOTE(random_state=42).fit_resample(X_train, y_train)`.
- Alternatives: **ADASYN** (more synthetic points for harder examples), **Borderline-SMOTE** (samples near the decision boundary), **class weighting / focal loss** (`class_weight='balanced'`).
- **SMOTE only on TRAINING data. Never resample the test set.**

## 10. Augmentation (slides 26-27)
- Image (Albumentations): rotation **±30°**, horizontal flip, random crop, brightness/contrast shift, Gaussian noise, zoom. Modern methods: AutoAugment/RandAugment (learned policy), Mixup & CutMix (blend two images and their labels), diffusion-based synthesis.
- Audio: time stretching (speed changes, pitch doesn't), pitch shift, background noise, volume change, **SpecAugment** (mask time and frequency bands on the spectrogram), reverb/echo.

## 11. Feature engineering and selection (slides 28-29)
- FE families: **time** features (day, hour, weekday, season, is_weekend; e.g. Friday evenings are busier), **mathematical transforms** (log x, √x, x², binning; log(income) tames skew), **combined** features (ratios, products, group aggregations; `debt_to_income = debt ÷ income`), **text** features (word count, length, keyword flags, sentiment).

| Filter (model-independent) | Wrapper (retrain on subsets) | Embedded (inside training) |
|---|---|---|
| Pearson correlation, Chi-square, ANOVA F-test, mutual information | RFE, forward/backward selection, exhaustive search, BORUTA | LASSO (L1), Ridge (L2), Random Forest importance, Gradient Boosting importance |

- Code: `SelectKBest(f_classif, k=10).fit_transform(X, y)` (filter, ANOVA F).
- Strictly, Ridge (L2) shrinks weights but never zeroes them, so it does not select features by itself. LASSO does. (textbook context)

## 12. Modern techniques (slides 30-33)
- **Data-centric AI** (Andrew Ng): keep the architecture (roughly) fixed and iterate on data quality, labels and coverage. Model-centric work hits diminishing returns. Loop: error analysis → trace errors to a data slice → fix that slice → retrain. Tools: **Cleanlab** (finds label errors), **Snorkel** (programmatic labeling), Encord/Labelbox.
- **Synthetic data**: GANs/VAEs (CTGAN for tabular data), LLM-generated text, simulation (robotics, driving), privacy-preserving synthesis (differential privacy).
- **Foundation-model embeddings** as features: text BERT/Sentence-Transformers, images CLIP/ResNet, audio Whisper/wav2vec. This cuts the labeled data needed (transfer learning). Store vectors in FAISS, Pinecone or Weaviate.
- **Trustworthy pipelines**: automated validation (Great Expectations, Evidently AI, Deequ) blocks bad batches; **data contracts** break loudly when an upstream team changes a column; **feature stores** (Feast, Tecton) keep training and serving features consistent ("the #1 cause of 'it worked in training but not in production'"); **data versioning** (DVC, MLflow).

## 13. Splitting and data leakage (slides 34, 36)
- Splits: **80/20 or 70/30** to start; **stratified** split for imbalanced classes; **time-based split without shuffling** for time series; **k-fold CV** for a more robust estimate.
```python
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
scaler.fit(X_train)                  # fit on TRAIN only
X_train = scaler.transform(X_train)
X_test  = scaler.transform(X_test)   # transform only
```
- **Data leakage**: any scaler, encoder, imputer or SMOTE call must be fit only on the training set. Otherwise metrics look great and the model fails in production.
- Common mistakes (slide 36): fitting a scaler or encoder on test data; dropping every row with a NaN; label-encoding unordered categories; applying SMOTE to the test set.

## 14. Tooling and readiness checklist (slides 35, 37)
| Library | Data size | Best for |
|---|---|---|
| pandas | < 1 GB | small to medium data, prototyping |
| Dask | 1 to 100 GB | parallelizing pandas code |
| Polars | < 50 GB | raw speed, 5 to 10× faster than pandas |
| PySpark | 100 GB+ | enterprise big data, streaming, Hadoop |
| DuckDB | < 100 GB | SQL directly on CSV/Parquet |
| SQLAlchemy | database | DB integration, ORM |

(The "Speed" column on slide 35 is empty.)
- Checklist (slide 37):
  - Inspection: shape, dtypes, head, describe, units and ranges.
  - Missing values: `isnull().sum()` and % missing, diagnose MCAR/MAR/MNAR, drop or impute deliberately.
  - Duplicates: `duplicated().sum()`, `drop_duplicates()`, near-duplicates.
  - Outliers: IQR or z check, boxplot, then fix, cap or keep.
  - Consistency: `nunique()`, `value_counts()`, normalise text, validate foreign keys.
  - Model readiness: encode, scale, fit on train only, split and cross-validate.

## 15. Code from the course notebook (titanic data preparation)
Source: `titanic_data_preparation` notebook. It uses `sns.load_dataset('titanic')`: 891 rows × 15 columns, target `survived` (549 died, 342 survived = 61.6% / 38.4%). This seaborn version has **no `name`, `ticket` or `PassengerId` columns**. Every stage is scored with `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` + `RandomForestClassifier(n_estimators=100, random_state=42)` + `cross_val_score(..., scoring='accuracy')` and stored in `results[...]`.

- **EDA output.**
  - Missing values: deck 688 (77.2%), age 177 (19.9%), embarked 2 (0.2%), embark_town 2 (0.2%).
  - Survival rate: female 74.2% vs male 18.9%; class 1/2/3 = 63.0 / 47.3 / 24.2%; port C/Q/S = 55.4 / 39.0 / 33.7%.
  - The notebook's rule: drop a column above roughly 20 to 30% missing (deck at 77%), impute below that (age at 20%).

| Stage | Exact steps | CV acc | Δ |
|---|---|---|---|
| 0 Raw | cols `pclass, age, sibsp, parch, fare`; per-column median `fillna` | **69.80% ± 4.07** (printed) | |
| 1 Missing | drop `deck`; `embarked`/`embark_town` ← mode ('S'); `fare` ← median; `KNNImputer(n_neighbors=5)` on `[age, pclass, fare, sibsp, parch]` | 69.80% | 0.00 |
| 2 Encoding | drop `class, alive, who, embark_town` (redundant copies of other columns); `LabelEncoder` on sex (female 0, male 1); `pd.get_dummies(embarked, prefix='emb', drop_first=True)` → `emb_Q, emb_S` (C is the reference); exclude `adult_male, alone` | 81.37% | +11.56 |
| 3 Scaling | `RobustScaler` on fare → `fare_scaled`; `StandardScaler` on `age, sibsp, parch, pclass` | 81.59% | +0.23 |
| 4 Outliers | IQR on raw fare: Q1 = 7.9104, Q3 = 31.00, IQR = 23.0896, bounds [−26.72, 65.63], **116 outliers**; **clip** (not delete, since first-class fares are real) `fare_scaled` to scaled bounds [−1.7834, 2.2166] | 81.70% | +0.11 |
| 5 FE (from df1) | `family_size = sibsp+parch+1`; `is_alone`; `family_cat` (1 alone, ≤3 small, ≤5 medium, else large); `title`; `fare_per_person = fare/family_size`; `age_group = pd.cut(bins=[0,12,18,35,60,100])`; `age_x_class`, `fare_x_class`; then encode | 81.70% | 0.00 |
| 6 Selection | RF(200) `feature_importances_` → top 12; `SelectKBest(f_classif, k=12)` shown for comparison | 81.37% | −0.34 |
| 7 SMOTE | `SMOTE(k_neighbors=5)` gives 549/549; CV with `imblearn.Pipeline([('smote', SMOTE), ('model', RF)])`, so SMOTE runs on train folds only | 81.37% | 0.00 |
| 8 Full pipeline | FE + encode → `KNNImputer(5)` → RF(100) importance top 12 → `Pipeline([('scaler', RobustScaler()), ('model', m)])` | RF **83.39 ± 1.45**, GB 83.05 ± 2.66, LR 80.02 ± 1.89 | +2.02 |

- Stage 8 models: `RandomForestClassifier(200, max_depth=8, min_samples_leaf=2)`, `GradientBoostingClassifier(200, learning_rate=0.05, max_depth=4)`, `LogisticRegression(max_iter=500, C=0.5)`. Total gain 69.80 → 83.39 = **+13.58 points**.
- Detailed evaluation: GB on a stratified 80/20 hold-out (179 test rows) gives accuracy 0.80 (144/179), confusion matrix [[97, 13], [22, 47]], Survived precision 0.78, recall 0.68, F1 0.73. The notebook hardcodes GB as "best" even though RF had the higher CV mean.
- Only the Stage 0 output is saved in the notebook. The other numbers are my reproduction with the same seeds (pandas 3.0.5, sklearn 1.9.1). Stage 0 matches the printed 0.6980 ± 0.0407 exactly.

**Pitfalls I found in the code** (these explain the flat stages and are worth avoiding in the homework):
1. `df[col].fillna(x, inplace=True)` is chained assignment. Under pandas copy-on-write it changes nothing: Stage 0 prints "Missing values: 177", and `embarked` keeps its 2 NaN. Write `df[col] = df[col].fillna(x)`. RF still ran because sklearn 1.4 and later accept NaN natively.
2. `pd.get_dummies` returns **bool** columns, and `select_dtypes(include='number')` silently drops them. So `emb_*`, `ttl_*`, `fam_*` and `ag_*` were never used, and Stage 5 trained on 11 numeric features only. "Top 12" in Stages 6 and 8 therefore kept all 11 (or 10) features. Fix: `pd.get_dummies(..., dtype=int)`.
3. `title_from_row` builds the title from sex and age (Mr 577, Mrs 254, Miss 60; "Master" never occurs), because seaborn has no `name`. The commented-out Kaggle version is `name.str.extract(r',\s*([^.]+)\.')`.
4. Leakage in Stages 3 and 8: the imputer, scalers and RF feature selection are fit on all 891 rows before CV. Only the scaler (Stage 8) and SMOTE (Stage 7) sit inside the CV pipeline. A fully leak-free `ColumnTransformer` version (median imputer + StandardScaler on numeric columns, most-frequent imputer + OneHotEncoder on sex and embarked, inside `Pipeline`) scores RF 83.50% / GB 83.73% (my check).
5. The conclusion table's claim that FE gives +3 to 6% and is the "MOST POWERFUL STEP" is not supported by the reproduced run. The big jump is Stage 2 (+11.56, driven by `sex`), and FE adds 0.00 here. Normalization ±0.5% agrees with the theory that trees don't need scaling.

**Pipeline pattern for the Kaggle homework** (professor's order, made leak-free):
1. EDA: missing-value % table, target balance, survival rate per category.
2. Drop columns that are mostly empty or redundant copies of others.
3. Row-wise FE (family_size, is_alone, fare_per_person, title). This is safe to do before the split because it uses no statistics from other rows.
4. Put imputation, encoding and scaling in a `ColumnTransformer` inside a `Pipeline` with the model.
5. Compare models with `cross_val_score(StratifiedKFold(5, shuffle=True, random_state=42))`.
6. `fit` on the full train set, then `predict` on the Kaggle test set (transform only) and write the submission file. (textbook context for steps 4 and 6)

## Exam focus
1. **IQR**: data 2, 4, 4, 5, 6, 7, 8, 8, 30. Q1 = 4, Q3 = 8 (numpy linear and median-of-halves agree), IQR = 4, bounds [4 − 6, 8 + 6] = [−2, 14], so **30 is an outlier**.
2. **Z-score on the same data**: μ = 8.222, σ = 7.927 (population), z(30) = (30 − 8.222)/7.927 = **2.75 < 3, so not flagged**. The outlier inflates σ. With n = 9, max |z| = √8 = 2.83, so the rule cannot fire. This is why slide 14 says to combine it with IQR.
3. **Scaling 20, 30, 40, 50, 60**:
   - Min-max: 0, 0.25, 0.5, 0.75, 1.
   - Standard: μ = 40, σ = 14.142, giving −1.414, −0.707, 0, 0.707, 1.414.
   - Robust: Q1 = 30, Q2 = 40, Q3 = 50, giving −1, −0.5, 0, 0.5, 1.
4. **Fit on train only**: train 20, 30, 40, 50; test value 60.
   - Min-max: (60 − 20)/(50 − 20) = **1.333**. This is outside [0, 1], which is expected; don't refit.
   - Standard: μ = 35, σ = 11.180, so z = **2.236**.
5. **Quality metrics**: 1,000 records, 950 have all required fields → completeness 95%. 980 unique → uniqueness 98%. 970 in a valid format → validity 97%.
6. **Imbalance**: 9,980 vs 20. Always predicting Normal gives accuracy 99.8% but recall 0. Use precision, recall, F1 or PR-AUC, a stratified split, and SMOTE or class weights on train only.
7. **SMOTE point**: $x_i=(1,2)$, neighbour $(3,6)$, λ = 0.5 gives (2, 4); λ = 0.25 gives (1.5, 3).
8. **Target encoding**: city T with y = 1, 0 → 0.5; S with y = 1, 1 → 1.0; B with y = 0 → 0.0.
9. **Concept questions**:
   - Pick the missingness mechanism from an example (sensor offline = MCAR, older people skip = MAR, rich hide income = MNAR).
   - Pick a scaler: Min-Max for NN/KNN/SVM, Standard for linear/logistic/PCA, Robust when there are outliers.
   - Pick an encoding: one-hot for nominal, ordinal for ordered, target encoding or embeddings for high cardinality.
   - Name the filter, wrapper and embedded selection methods.
   - Why is fitting a scaler or SMOTE on test data leakage?
   - Why must time series be split chronologically?
