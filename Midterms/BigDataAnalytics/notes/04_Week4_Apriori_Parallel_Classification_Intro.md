# Week 4: Frequent Patterns (Apriori, Parallel Apriori with MapReduce) & Intro to Classification

**What this lecture is about:** recap of support/confidence → Apriori (downward closure, self-join + prune, two worked examples) → how to parallelize each Apriori step with Map/Reduce → applications + "questions to ask" about a mining result → start of Classification (Ch. 8).

Readings: Han, Kamber, Pei, *Data Mining – Concepts and Techniques*, 3rd ed. — **Ch. 6** (frequent patterns), **Ch. 8** (classification).
Notation: $C_k$ = candidate k-itemsets, $L_k$ = frequent k-itemsets, $D$ / TDB = transaction database.

---

## 1. Recap: basic concepts (slides 4-6)

Running DB (used again for MapReduce):

| Tid | Items bought |
|---|---|
| 10 | Beer, Nuts, Diaper |
| 20 | Beer, Coffee, Diaper |
| 30 | Beer, Diaper, Eggs |
| 40 | Nuts, Eggs, Milk |
| 50 | Nuts, Coffee, Diaper, Eggs, Milk |

- **itemset**: set of one or more items; **k-itemset** $X=\{x_1,\dots,x_k\}$.
- **(absolute) support / support count** of X: frequency (number of occurrences) of X.
- **(relative) support** $s$: fraction of transactions containing X = probability a transaction contains X.
- X is **frequent** if its support is **no less than** minsup (i.e. $\ge$).
- **Association rule** $X \rightarrow Y$; find all rules with minimum support and confidence:

$$s(X\rightarrow Y)=P(X\cup Y)=\frac{\text{count}(X\cup Y)}{|D|}\qquad c(X\rightarrow Y)=P(Y\mid X)=\frac{\text{count}(X\cup Y)}{\text{count}(X)}$$

- Slide example, minsup = 50%, minconf = 50% (5 transactions → need count $\ge 2.5$, i.e. $\ge 3$):
  - Freq. Pat.: `Beer:3, Nuts:3, Diaper:4, Eggs:3, {Beer, Diaper}:3`
  - Rules (format **(support, confidence)**): `Beer → Diaper (60%, 100%)`, `Diaper → Beer (60%, 75%)` — "many more!"
  - Check: $s=3/5$; $c(\text{Beer}\to\text{Diaper})=3/3$; $c(\text{Diaper}\to\text{Beer})=3/4$.
- **Complexity (slide 6):** number of frequent itemsets is **sensitive to minsup**; when minsup is low there are potentially **exponentially many** frequent itemsets.
  - (textbook context) d items → $2^d-1$ possible non-empty itemsets; the slide-6 DB has 6 items → 63.

## 2. Downward closure & Apriori (slides 7-17), details in Week 3

- Scalable methods listed: **Apriori** (candidate generation-and-test), improving Apriori, **FPGrowth** (pattern growth), **ECLAT** (vertical data format). Only Apriori is covered here.
- **Downward closure:** *any subset of a frequent itemset must be frequent.* If {beer, diaper, nuts} is frequent, so is {beer, diaper} — every transaction with {beer, diaper, nuts} also contains {beer, diaper}.
  - Slide-8 DB: 1 {Beer, Diaper, Eggs}, 2 {Beer, Diaper, Nuts}, 3 {Diaper, Nuts, Eggs, Coffee}, 4 {Beer, Diaper, Nuts, Eggs, Coffee, Milk} → {beer, diaper, nuts} count 2 (T2, T4), {beer, diaper} count 3 (T1, T2, T4) (my count).
- **Apriori pruning principle:** if *any* itemset is infrequent, its supersets should **not be generated/tested** (Agrawal & Srikant @VLDB'94; Mannila et al. @KDD'94).
- **Method:**
  1. Scan DB once → frequent 1-itemsets: {Beer}, {Nuts}, {Diaper}, {Eggs} (Coffee:2, Milk:2 fail minsup 3).
  2. Generate length-(k+1) **candidates** from length-k **frequent** itemsets. Slides 10–14 build it by pairing each item with every later one: Beer→3 pairs, Nuts→2, Diaper→1 = 6 = $\binom{4}{2}$:
     {Beer, Nuts}, {Beer, Diaper}, {Beer, Eggs}, {Nuts, Diaper}, {Nuts, Eggs}, {Diaper, Eggs}
  3. **Test the candidates against DB.**
  4. **Terminate when no frequent or candidate set can be generated.**
- **Candidate generation = Step 1 self-joining $L_k$ + Step 2 pruning** (slide 17):
  - $L_3=\{abc, abd, acd, ace, bcd\}$; self-join $L_3 * L_3$: **abcd** from abc & abd; **acde** from acd & ace.
  - Pruning: **acde removed because ade is not in $L_3$** → $C_4=\{abcd\}$.
  - (textbook context) join condition: two k-itemsets join iff their first $k-1$ items are equal (items sorted). Prune: keep $c\in C_{k+1}$ iff **every** k-subset of c is in $L_k$.
- **TDB example, Sup_min = 2 (slides 18–26)** — fully in Week 3. Summary: TDB {10: A,C,D; 20: B,C,E; 30: A,B,C,E; 40: B,E} → 1st scan $C_1$ (D:1 dropped) → $L_1$={A,B,C,E} → $C_2$ (6 pairs) → 2nd scan (AB:1, AE:1 dropped) → $L_2$={AC:2, BC:2, BE:3, CE:2} → $C_3$={B,C,E} → 3rd scan → $L_3$={B,C,E}:2. (Slide 26 highlights the infrequent rows in blue.)

## 3. Apriori: Another Example with Supmin 2 (slides 27-35)

Source: textbook **AllElectronics** branch data (9 transactions, 5 items). Slides build the figure left→right, top→bottom.

| TID | List of item_IDs |
|---|---|
| T100 | I1, I2, I5 |
| T200 | I2, I4 |
| T300 | I2, I3 |
| T400 | I1, I2, I4 |
| T500 | I1, I3 |
| T600 | I2, I3 |
| T700 | I1, I3 |
| T800 | I1, I2, I3, I5 |
| T900 | I1, I2, I3 |

**Level 1.** "Scan D for count of each candidate" → $C_1$; "Compare candidate support count with minimum support count" → $L_1$.

| Itemset | $C_1$ Sup. count | in $L_1$? |
|---|---|---|
| {I1} | 6 | ✔ |
| {I2} | 7 | ✔ |
| {I3} | 6 | ✔ |
| {I4} | 2 | ✔ |
| {I5} | 2 | ✔ |

→ All 5 survive ($2 \ge 2$): $L_1 = C_1$.

**Level 2.** "Generate $C_2$ candidates from $L_1$" (itemset list, no counts) → "Scan D for count of each candidate" ($C_2$ with Sup. count) → compare with min support → $L_2$.

| $C_2$ Itemset | Sup. count | in $L_2$? |
|---|---|---|
| {I1, I2} | 4 | ✔ |
| {I1, I3} | 4 | ✔ |
| {I1, I4} | 1 | ✘ |
| {I1, I5} | 2 | ✔ |
| {I2, I3} | 4 | ✔ |
| {I2, I4} | 2 | ✔ |
| {I2, I5} | 2 | ✔ |
| {I3, I4} | 0 | ✘ |
| {I3, I5} | 1 | ✘ |
| {I4, I5} | 0 | ✘ |

- $C_2$ = all $\binom{5}{2}=10$ pairs (no pruning possible at k=2: every 1-subset is in $L_1$).
- $L_2$ = {I1,I2}:4, {I1,I3}:4, {I1,I5}:2, {I2,I3}:4, {I2,I4}:2, {I2,I5}:2 (**6** itemsets).

**Level 3.** "Generate $C_3$ candidates from $L_2$" → **slides show only the final $C_3$ = {I1, I2, I3}, {I1, I2, I5}** (join + prune already applied) → scan → $L_3$.

- (textbook context) Self-join $L_2 * L_2$ (same first item) gives 6 itemsets; pruning removes 4:

| Self-join result | 2-subset not in $L_2$ | Kept in $C_3$? |
|---|---|---|
| {I1, I2, I3} | — | ✔ |
| {I1, I2, I5} | — | ✔ |
| {I1, I3, I5} | {I3, I5} | ✘ pruned |
| {I2, I3, I4} | {I3, I4} | ✘ pruned |
| {I2, I3, I5} | {I3, I5} | ✘ pruned |
| {I2, I4, I5} | {I4, I5} | ✘ pruned |

| $C_3$ Itemset | Sup. count | $L_3$ |
|---|---|---|
| {I1, I2, I3} | 2 (T800, T900) | ✔ 2 |
| {I1, I2, I5} | 2 (T100, T800) | ✔ 2 |

**Level 4** (not on slides; textbook context): join {I1,I2,I3} ⋈ {I1,I2,I5} → {I1,I2,I3,I5}; pruned since {I2,I3,I5} ∉ $L_3$ → $C_4=\emptyset$ → **terminate**.

Totals (my count): frequent itemsets = 5 + 6 + 2 = **13**; longest = 3-itemsets {I1,I2,I3}, {I1,I2,I5}; DB scans = 3.

**Rules (textbook context; slides show no rules for this example).** For each frequent itemset $l$ and each non-empty proper subset $s$: output $s \rightarrow (l-s)$ if $\frac{\text{count}(l)}{\text{count}(s)} \ge$ minconf. A frequent k-itemset yields $2^k-2$ rules. From $l=\{I1,I2,I5\}$ (count 2, support $2/9\approx22\%$):

| Rule | Confidence |
|---|---|
| {I1, I2} → I5 | 2/4 = 50% |
| {I1, I5} → I2 | 2/2 = 100% |
| {I2, I5} → I1 | 2/2 = 100% |
| I1 → {I2, I5} | 2/6 = 33% |
| I2 → {I1, I5} | 2/7 = 29% |
| I5 → {I1, I2} | 2/2 = 100% |

minconf = 70% → only the three 100% rules survive.

## 4. Parallelizing Apriori with Map/Reduce (slides 36-43)

"Parallelize?" — Apriori has **three steps**, each parallelized separately:
1. **Frequent 1-itemsets** (example DB: Beer/Diaper table of §1)
2. **Generating candidate "k+1-itemsets"** (self-join and pruning) (example: $L_3=\{abc, abd, acd, ace, bcd\}$)
3. **Generating frequent "k+1-itemsets"** (consult DB)

(Slides 40–42 only show the headings + example data; the scheme is on slide 43.)

### Phase 1: Frequent 1-itemsets via word count with combine
- (word-count pattern from earlier weeks) Map: input a transaction (split of DB) → emit `<item, 1>` per item. Combiner: local sum per mapper. Reduce: `<item, list of partial counts>` → `<item, sum>`; keep items with sum ≥ minsup → $L_1$.
- Trace (my split, minsup 3): M1 = Tid 10–30 → combine: Beer 3, Diaper 3, Nuts 1, Coffee 1, Eggs 1. M2 = Tid 40–50 → Nuts 2, Eggs 2, Milk 2, Diaper 1, Coffee 1. Reduce: Beer 3, Nuts 3, Diaper 4, Eggs 3, Coffee 2, Milk 2 → $L_1$ = {Beer, Nuts, Diaper, Eggs}.

### Phase 2: Self-join and pruning to get k+1 candidates

| | Broadcast | Input | Work | Output |
|---|---|---|---|---|
| **Map** | frequent k-itemsets ($L_k$) | `<"self-join", (partial k-itemsets)>` | self-join each k-itemset with the broadcast k-itemsets | `<"k+1-itemset", 1>` |
| **Reduce** | frequent k-itemsets ($L_k$) | `<"k+1-itemset", "list of 1's">` | prune based on broadcast k-itemsets | `<"candidate k+1-itemset", 1>` |

- Each mapper holds only a **part** of $L_k$; joins it against the **whole** $L_k$ (broadcast).
- Reducer groups identical (k+1)-itemsets (the "list of 1's" = same itemset produced by several joins/mappers → emitted once; interpretation) and checks every k-subset is in broadcast $L_k$.
- Trace (illustrative split): M1 = {abc, abd, acd}, M2 = {ace, bcd}, broadcast $L_3$ = all 5.
  - Map out: `<abcd,1>` (abc⋈abd), `<acde,1>` (acd⋈ace) (+ duplicates if both orders are joined).
  - Reduce: abcd → subsets abc, abd, acd, bcd all in $L_3$ → `<abcd,1>`; acde → ade ∉ $L_3$ → dropped. ⇒ $C_4$ = {abcd}.

### Phase 3: Generating frequent "k+1-itemsets" (consult DB)

| | Input | Work | Output |
|---|---|---|---|
| **Map** | `<"candidate", "list of candidate k+1-itemsets">` | read **partial DB** (its own split), count each candidate | `<"k+1-itemset", "no of occurrences in partial DB">` |
| **Reduce** | `<"k+1-itemset", "list of no of occurrences in partial DB">` | sum | `<"k+1-itemset", "addition of occurrences">` |

- Then keep itemsets with total ≥ minsup → $L_{k+1}$, which becomes the broadcast set of the next Phase 2 (implied). Loop Phase 2 → Phase 3 until no candidates.
- Trace (AllElectronics $C_3$, my 3 splits of 3 transactions):

| Candidate | P1 (T100–T300) | P2 (T400–T600) | P3 (T700–T900) | Reduce sum |
|---|---|---|---|---|
| {I1, I2, I3} | 0 | 0 | 2 | **2** ✔ |
| {I1, I2, I5} | 1 | 0 | 1 | **2** ✔ |

## 5. Applications of frequent pattern analysis (slides 44-45)
- **Basket data analysis** (what is bought together).
- **Web log (click stream) analysis** (pages visited together/in sessions).

## 6. "Questions to ask" about a frequent-pattern result (slides 46-56)
Checklist (built one per slide): 1) Number of transactions? 2) Minimum support? 3) Number of total items? 4) Number of frequent 1-itemsets? 5) Number of frequent 2-itemsets? 6) What's the longest frequent itemset? 7) Number of total frequent itemsets? 8) Number of total rules? 9) Confidence? 10) How long does it take to compute all the frequent itemsets?

Applied (my answers; rules = all $X\to Y$ from frequent itemsets, before minconf):

| Question | Beer DB (§1) | AllElectronics (§3) |
|---|---|---|
| Transactions | 5 | 9 |
| Min support | 50% (count ≥ 3) | 2 (≈22%) |
| Total items | 6 | 5 |
| Frequent 1-itemsets | 4 | 5 |
| Frequent 2-itemsets | 1 ({Beer, Diaper}) | 6 |
| Longest frequent itemset | {Beer, Diaper} (k=2) | {I1,I2,I3}, {I1,I2,I5} (k=3) |
| Total frequent itemsets | 5 | 13 |
| Total rules | 2 | 6·2 + 2·6 = 24 |
| With minconf 50% / 70% | 2 / 2 | 16 / 6 |

## 7. Classification: basic concepts (slides 57-61, Ch. 8)
Ch. 8 outline: basic concepts, decision tree induction, Bayes classification, rule-based classification, model evaluation & selection, ensemble methods.

- **Supervised learning (classification):** training data (observations, measurements…) are accompanied by **labels** indicating the class; new data is classified based on the training set.
- **Unsupervised learning (clustering):** class labels of training data are **unknown**; given measurements/observations, aim to establish the **existence of classes or clusters**.
- **Classification:** predicts **categorical** class labels (discrete or nominal); constructs a model from the training set and the values (**class labels**) of a classifying attribute, then uses it to classify new data.
- **Numeric prediction:** models **continuous-valued** functions, i.e. predicts unknown or missing values.
- Typical applications: credit/loan approval; medical diagnosis (tumor cancerous or benign); fraud detection (is a transaction fraudulent); web page categorization (which category).

---

## Exam focus

- Know both conventions: **relative** minsup (50% → convert to count, round **up**: 5 tx → ≥3) and **absolute** Sup_min = 2.
- Distinguish **self-join result → $C_{k+1}$ (after prune) → $L_{k+1}$ (after DB scan)**. Pruning needs only $L_k$ (no DB scan); counting needs the DB.
- Rule notation as on slide 5: `X → Y (support%, confidence%)`. Confidence denominator = count of the **left** side.
- MapReduce Apriori: which phase is word count (1-itemsets), what is broadcast ($L_k$ in both map & reduce of the self-join phase), what each mapper reads (partial $L_k$ vs partial DB), and that reducers **prune** (phase 2) or **sum** (phase 3).

**Mini drill (Sup_min = 2).** DB: T1 {A,B,C}, T2 {A,B,C,D}, T3 {A,B,D}, T4 {B,C,E}, T5 {A,C}.

| Step | Result |
|---|---|
| $C_1$ | A:4, B:4, C:4, D:2, E:1 |
| $L_1$ | A, B, C, D (E out) |
| $C_2$ (= $L_1$ join, no prune) | AB:3, AC:3, AD:2, BC:3, BD:2, CD:1 |
| $L_2$ | AB, AC, AD, BC, BD (CD out) |
| Self-join $L_2 * L_2$ | ABC, ABD, ACD, BCD |
| Prune → $C_3$ | ACD ✘ (CD ∉ $L_2$), BCD ✘ (CD) → $C_3$ = {ABC, ABD} |
| Scan → $L_3$ | ABC:2, ABD:2 |
| $C_4$ | ABC⋈ABD = ABCD; ACD ∉ $L_3$ → pruned → ∅ → stop |

Total frequent itemsets = 4 + 5 + 2 = 11. Rules from {A,B,D} (support 2/5 = 40%):
`D → {A,B} (40%, 100%)`, `{A,D} → B (40%, 100%)`, `{B,D} → A (40%, 100%)`, `{A,B} → D (40%, 67%)`, `A → {B,D} (40%, 50%)`, `B → {A,D} (40%, 50%)` → with minconf 70%: first three.
