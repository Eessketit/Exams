# Week 2: Hadoop (HDFS, execution, partitioner, combiner), Collaborative Filtering (Jaccard), K-Means + Silhouette

**What this lecture is about:** how Hadoop stores (HDFS) and runs (JobTracker/TaskTracker, shuffle, partitioner, combiner) Map/Reduce jobs, and three analytics uses of it: Jaccard-based collaborative filtering, PageRank, and K-means clustering (evaluated with the silhouette score).

Deck map (58 slides): 1–6 repeat Week 1 (Hadoop stack, Word Count + Java code) · 7 contents · 8–13 CF motivation + Jaccard · 14–17 sample projects (churn, PageRank, ad vouchers) · 18 MNIST teaser · 19–28 Hadoop internals · 29–32 combine function · 33–57 clustering with MapReduce / K-means walkthrough · 58 silhouette.

Contents slide (7): 1. Cloud Computing, 2. Map-Reduce, 3. Hadoop, 4. Big Data Analysis → Motivation, Possible approaches, Collaborative Filtering, CF Technologies, Sample Projects.

---

## 1. Repeats from Week 1 (slides 1-6, 20)
- Hadoop = open-source Java platform; HDFS (≈ Google's GFS) + Map/Reduce on clusters of thousands of PCs. Stack, Pig/HBase/Hive origins, PC-server spec → **see Week 1**.
- Word Count dataflow (Input → Map → Shuffle & Sort → Reduce → Output; "the quick brown fox / the fox ate the mouse / how now brown cow" → the 3, brown 2, fox 2, others 1) → **see Week 1**.
- Java code (old `mapred` API): `MapClass` emits `(word, ONE)`; `ReduceClass` sums values. One new detail worth remembering for §5:
  - `conf.setCombinerClass(ReduceClass.class)` — the **reducer is reused as the combiner** (valid because summing is associative/commutative — textbook context).

---

## 2. Hadoop internals (slides 21-28)

### HDFS (slide 21)
- A file = **blocks of 128 MB**.
- Blocks **replicated on multiple DataNodes, usually 3 copies**.
- **One NameNode** stores metadata (file names, block locations, …); "usually duelize [dualize] name-node" (keep a second one for safety).
- Optimized for **huge files and sequential read**; **append-only**.
- Diagram: File1 = blocks 1–4 → DataNodes hold {1,2,4}, {2,1,3}, {1,4,3}, {3,2,4} → every block appears exactly 3 times, never twice on the same node.

### Execution principle (slide 22)
- **One master controls slaves**: client "Run Application" → **JobTracker** → many **TaskTrackers** → Tasks ("Hadoop black box").
- **Data locality:** a Mapper is placed on the node/rack that already holds its input blocks → minimizes network traffic.
- Mapper output is **saved to local disk** before being sent to reducers → if a reducer breaks, the job can be restored.
- **Task fails** → rerun the task on another node.
- **Node fails** → other nodes rerun its tasks **and rerun all map functions** that ran on the broken node (its local map outputs are lost).
- **Slow node** → another node runs the same task, take whichever result arrives first = **speculative execution**.

### MapReduce high level (slide 23)
| Component | Where | Role |
|---|---|---|
| Client | client computer | submits the MapReduce job |
| JobTracker | master node | receives job, schedules tasks |
| TaskTracker | each slave node | runs/monitors task instances |
| Task instance | slave node | an actual map or reduce task |

### Job vs data distribution (slides 24-25)
- **Job distribution:** program = Java **jar** + **XML** file with serialized configuration; running a job puts these into **HDFS** and tells TaskTrackers where to fetch the code.
- **Data distribution:** implicit in the design — all mappers are equivalent, so each maps **whatever data is local** to its node; if data piles up on one node, **nearby nodes map instead**; transfer handled implicitly by HDFS.

### Reporter (slide 26)
- Facility for Map/Reduce apps to **report progress, update counters and status**; Mapper/Reducer use it to report progress or just signal **"I'm alive"**.

### Partition and shuffle (slides 27-28)
- Each Mapper → intermediates → **its own Partitioner** → shuffling → each **Reducer** receives one partition.
- `int getPartition(key, val, numPartitions)` → returns partition number for a key; **one partition = values sent to one Reduce task**.
- **HashPartitioner** is default: uses `key.hashCode()`.
  - (textbook context) exact form: `(key.hashCode() & Integer.MAX_VALUE) % numReduceTasks` → same key always reaches the same reducer.

---

## 3. Collaborative Filtering with Jaccard (slides 8-13, 34-35)

### Motivation
- Amazon "Customers who bought this item also bought" = **book recommendation by CF** (slide 8).
- Movie site "Enjoyed by members who enjoyed" and Netflix "Because you enjoyed Billy Elliot, The Pianist, Gandhi → we think you'll enjoy Life Is Beautiful" = **movie recommendation by CF** (slides 10, 12).

### Formula
$$\text{Jaccard}(C_i, C_j)=\frac{|C_i\cap C_j|}{|C_i\cup C_j|}$$
- On 0/1 vectors: numerator = positions where **both** are 1; denominator = positions where **at least one** is 1 (0/0 positions ignored).
- (textbook context) range [0,1]; Jaccard distance $=1-J$.

### Slide data
Customer vectors = which of Movie1..4 the customer watched (slide 11 names them Customer0–3; slides 13/34/35 Customer1–4, same vectors):

| | M1 | M2 | M3 | M4 | set |
|---|---|---|---|---|---|
| C1 | 0 | 1 | 0 | 1 | {M2, M4} |
| C2 | 1 | 0 | 1 | 0 | {M1, M3} |
| C3 | 1 | 1 | 0 | 0 | {M1, M2} |
| C4 | 1 | 1 | 0 | 1 | {M1, M2, M4} |

Movie vectors (slide 13) are the **transpose** = which customers watched it: M1 {0,1,1,1}, M2 {1,0,1,1}, M3 {0,1,0,0}, M4 {1,0,0,1}. → two views: **user-based** (compare customers) and **item-based** (compare movies).

### Customer-customer Jaccard (computed from slide data)
| pair | ∩ | ∪ | J |
|---|---|---|---|
| C1,C2 | ∅ | {M1..M4} | 0 |
| C1,C3 | {M2} | {M1,M2,M4} | 1/3 |
| C1,C4 | {M2,M4} | {M1,M2,M4} | **2/3** |
| C2,C3 | {M1} | {M1,M2,M3} | 1/3 |
| C2,C4 | {M1} | {M1..M4} | 1/4 |
| C3,C4 | {M1,M2} | {M1,M2,M4} | **2/3** |

### Movie-movie Jaccard (computed from slide data)
| pair | J | | pair | J |
|---|---|---|---|---|
| M1,M2 | 2/4 = 1/2 | | M2,M3 | 0 |
| M1,M3 | 1/3 | | M2,M4 | **2/3** |
| M1,M4 | 1/4 | | M3,M4 | 0 |

### Building the recommendation list
The slides show only the vectors and the formula; the procedure below is the standard one (textbook context):
- **User-based:** (1) compute J(target, every other customer); (2) take the top-k most similar; (3) candidates = **union of movies those neighbors watched − movies target already watched**; (4) rank candidates (e.g., by sum of neighbor similarities).
- **Item-based:** for each movie the target hasn't watched, score = Σ J(candidate, each movie the target watched); recommend highest.

Top-1 user-based results on slide data:

| target | nearest neighbor (J) | neighbor's movies − target's | recommend |
|---|---|---|---|
| C1 | C4 (2/3) | {M1,M2,M4} − {M2,M4} | **M1** |
| C2 | C3 (1/3) | {M1,M2} − {M1,M3} | **M2** |
| C3 | C4 (2/3) | {M1,M2,M4} − {M1,M2} | **M4** |
| C4 | **tie** C1 = C3 (2/3) | C1 ∪ C3 = {M1,M2,M4} ⊆ C4 | nothing new; only unseen M3 comes from C2 (J = 1/4) |

Item-based gives the same picks: C1 → M1 (1/2 + 1/4 vs 0 for M3); C2 → M2 (1/2 vs 1/4 for M4); C3 → M4 (1/4 + 2/3 vs 1/3 for M3); C4 → M3 (only candidate).

### Related: frequent patterns (slide 9)
| Tid | Items bought |
|---|---|
| 10 | Beer, Nuts, Diaper |
| 20 | Beer, Coffee, Diaper |
| 30 | Beer, Diaper, Eggs |
| 40 | Nuts, Eggs, Milk |
| 50 | Nuts, Coffee, Diaper, Eggs, Milk |
- **itemset** = set of ≥1 items; **k-itemset** $X=\{x_1,\dots,x_k\}$.
- **absolute support (support count)** = number of transactions containing X.
- **relative support** $s$ = fraction of transactions containing X = P(transaction contains X).
- X is **frequent** if support ≥ **minsup**.
- Venn diagram: "customer buys beer", "buys diaper", overlap = "buys both".
- Worked (derived): {Beer, Diaper} in Tids 10, 20, 30 → count 3, $s=3/5=60\%$. Singles: Beer 3, Nuts 3, Diaper 4, Eggs 3, Coffee 2, Milk 2. With minsup 50% the only frequent 2-itemset is {Beer, Diaper}.
- (textbook context) confidence(Beer→Diaper) = 3/3 = 100%; confidence(Diaper→Beer) = 3/4 = 75%.

---

## 4. Sample projects (slides 14-18)
- **Churn management / Ad** (slide 14, section title).
- Slide 15 shows a record only: `{"S_id":"xx","R_id":"yy","S_time":"20201010150021","E_time":"20201010150313","S_cid":"aa","R_cid":"bb"}`.
  - (interpretation, not on slide) call record: sender/receiver ID, start/end time `YYYYMMDDhhmmss` (here 15:00:21→15:03:13 = 172 s), sender/receiver cell ID. Such records form a who-calls-whom graph → fits the PageRank slide that follows.
- **Google PageRank with Map-Reduce** (slide 16):
  - **Map:** distribute each page's PageRank "credit" to its link targets.
  - **Reduce:** gather the credit from multiple sources → new PageRank value.
  - **Iterate until convergence.**
  - (textbook context) $PR(p)=\frac{1-d}{N}+d\sum_{q\to p}\frac{PR(q)}{L(q)}$, $d\approx0.85$, $L(q)$ = out-links of q; mapper emits $(p,\ PR(q)/L(q))$ per out-link (plus the adjacency list so the graph is kept for the next iteration).
- **Increased Response Rate** (slide 17), advertisement:
  1. Prepare vouchers (bread, coffee) → 2. Select 5 spots in the city → 3. Send to two groups:
     - Group 1 **destination-based**: people who drive to one of the 5 locations.
     - Group 2 **segment-based**: segment "who lives in or frequently visits" one of the 5 locations.
  - Result: **group 2 had a 3× better response rate.**
- Slide 18: "What are these for?" over a grid of handwritten digits (MNIST-style) — teaser for grouping/clustering data.

---

## 5. Combine function (slides 29-32)
- Reduces the **result size of map functions**; performs a **reduce-like function on each machine**; **decreases shuffling cost**. Design MR algorithms to use combiners where possible.
- Word Count example (2 machines):

| | Machine 1 docs: "Financial, IMF, Economics, Crisis", "Financial, IMF, Crisis" | Machine 2 docs: "Economics, Harry", "Financial, Harry, Potter, Film", "Crisis, Harry, Potter" |
|---|---|---|
| Map output | 7 pairs, all `(word,1)` | 9 pairs, all `(word,1)` |
| After Combine | Financial 2, IMF 2, Economics 1, Crisis 2 | Economics 1, Harry 3, Financial 1, Potter 2, Film 1, Crisis 1 |

- **Before reduce, for each distinct key a list of its values is generated** (slide 32): Financial [2,1], IMF [2], Economics [1,1], Crisis [2,1], Harry [3], Film [1], Potter [2].
- Reduce (derived; slide leaves output blank): Financial 3, IMF 2, Economics 2, Crisis 3, Harry 3, Film 1, Potter 2.
- Shuffle volume: **16 pairs without combiner → 10 with combiner.**
- (textbook context) a combiner must give the same result regardless of how many times it runs → OK for sum/count/max; **not for mean directly** → emit (sum, count) instead (used in K-means below).

---

## 6. K-Means clustering (slides 33-57)

### Algorithm: the professor's version (slides 36, 57)
Given k, repeat:
1. **Partition objects into k nonempty subsets** (initialisation = random partition, *not* random centers).
2. **Compute centroids** of the current partition (centroid = center = **mean point** of the cluster).
3. **Assign each object to the cluster with the nearest centroid.**
4. **Stop when no more new assignments**; otherwise go back to step 2.
- The loop finds *one* clustering → **repeat many times and select the best clustering** (result depends on the start).

### Worked example, K = 2 (slides 37-56)
Points: (1,1) (2,1) (1,2) (5,5) (6,5) (5,6) (7,7).

**Start (random partition, slide 37):** A = {(1,1),(1,2),(5,5)}, B = {(2,1),(6,5),(5,6),(7,7)}
- Center A = ((1+1+5)/3, (1+2+5)/3) = **(7/3, 8/3)**; Center B = ((2+6+5+7)/4, (1+5+6+7)/4) = **(20/4, 19/4)** (slides keep the unreduced 20/4).

**Iteration 1 — assign points one by one, centers held fixed (slides 38–46)** (squared Euclidean distances, computed):

| point | d²→A (7/3, 8/3) | d²→B (5, 4.75) | goes to |
|---|---|---|---|
| (1,1) | 4.56 | 30.06 | A |
| (2,1) | 2.89 | 23.06 | **A** (moved from B) |
| (1,2) | 2.22 | 23.56 | A |
| (5,5) | 12.56 | 0.06 | **B** (moved from A) |
| (6,5) | 18.89 | 1.06 | B |
| (5,6) | 18.22 | 1.56 | B |
| (7,7) | 40.56 | 9.06 | B |

→ A = {(1,1),(2,1),(1,2)}, B = {(5,5),(6,5),(5,6),(7,7)}.
**"Update the cluster means" (slide 47):** A = (4/3, 4/3), B = (23/4, 23/4).

**Iteration 2 (slides 48–56):** re-assign every point with the new centers → same partition → **"No change ⇒ STOP"**. Final centers (4/3, 4/3) and (23/4, 23/4).

### K-means as Map/Reduce (textbook context: slide 33 is only the title "Clustering using MapReduce")
- Driver broadcasts current centers; each iteration = one MR job.
- **Map(point):** find nearest center → emit `(clusterID, (point, 1))` = slides' "assign each object" step.
- **Combine (per machine):** per clusterID emit `(clusterID, (Σpoints, count))` → small shuffle.
- **Reduce(clusterID, list):** new center = Σ(partial sums) / Σ(counts) = slides' "update the cluster means".
- Driver compares old/new centers (or assignments) → stop when nothing changes.
- Iteration 1 above with 2 mappers (M1: first 4 points, M2: last 3):

| | emits after map | after combine |
|---|---|---|
| Mapper 1 | (A,(1,1)) (A,(2,1)) (A,(1,2)) (B,(5,5)) | A → ((4,4), 3); B → ((5,5), 1) |
| Mapper 2 | (B,(6,5)) (B,(5,6)) (B,(7,7)) | B → ((18,18), 3) |
| Reducer A | | (4,4)/3 = **(4/3, 4/3)** |
| Reducer B | | (5+18, 5+18)/(1+3) = **(23/4, 23/4)** |

---

## 7. Silhouette score (slide 58)
$$s=\frac{n-i}{\max(n,\ i)}$$
- **n** = mean **nearest-cluster** distance (avg distance from the point to all points of the closest *other* cluster).
- **i** = mean **intra-cluster** distance (avg distance to the other points of its *own* cluster).
- (textbook context) usual notation $s=(b-a)/\max(a,b)$ with b = n, a = i; $s\in[-1,1]$: ≈1 well clustered, ≈0 on a boundary, <0 probably in the wrong cluster; overall score = mean $s$ over all points.
- Worked (derived) on the final K-means clusters, point (1,1):
  - i = (d to (2,1) + d to (1,2))/2 = (1 + 1)/2 = **1**
  - n = (√32 + √41 + √41 + √72)/4 = (5.657 + 6.403 + 6.403 + 8.485)/4 = **6.737**
  - s = (6.737 − 1)/6.737 = **0.85**. All 7 points: 0.85, 0.80, 0.80, 0.69, 0.74, 0.74, 0.70 → mean ≈ **0.76**.

---

## Exam focus
1. **Jaccard of two 0/1 vectors:** U = {1,0,1,1}, V = {1,1,0,1} → both 1 at positions 1,4 → ∩ = 2; ≥ one 1 at 1,2,3,4 → ∪ = 4 → J = **1/2**.
2. **User-based top-k recommendation** (slide data, target C2 = {M1,M3}, k = 2): J(C2,C3) = 1/3, J(C2,C4) = 1/4, J(C2,C1) = 0 → neighbors C3, C4 → union {M1,M2,M4} − {M1,M3} = {M2, M4} → score M2 = 1/3 + 1/4 = 7/12, M4 = 1/4 → list **M2, M4**. Watch for ties (C4's neighbors C1 and C3 are both 2/3) — say how you break them, or include both.
3. **Item-based recommendation:** target watched {M1}; unseen M2, M3, M4 → J(M1,·) = 1/2, 1/3, 1/4 → order **M2, M3, M4**.
4. **One K-means iteration (random-partition start):** 1-D points 1, 2, 6, 8, k = 2, start A = {1,6}, B = {2,8} → centers 3.5, 5 → 1→A (2.5 vs 4), 2→A (1.5 vs 3), 6→B (2.5 vs 1), 8→B (4.5 vs 3) → A = {1,2}, B = {6,8} → centers 1.5, 7 → next pass: no change ⇒ STOP. As MR: map emits (A,1),(A,2),(B,6),(B,8); reduce A = (1+2)/2 = 1.5, B = (6+8)/2 = 7.
5. **Silhouette of a point:** same clusters, point 1: i = |1−2| = 1, n = (5+7)/2 = 6 → s = (6−1)/6 = **0.83**.
6. **Combiner savings:** count map-output pairs vs post-combine pairs (slide example 16 → 10); know why sum is combinable and mean isn't.
7. **HDFS sizing:** 1 GB = 1024 MB file → 1024/128 = **8 blocks** × 3 replicas = **24 block copies** (≈3 GB raw). A 300 MB file → 3 blocks (128 + 128 + 44; last block uses only its size — textbook context).
8. **Partitioner:** 3 reducers, key hashCode 22 → 22 mod 3 = **partition 1**; all values of that key go to that one reducer.
9. **Support:** {Beer, Diaper} = 3 of 5 transactions = **60%** → frequent if minsup ≤ 60%.
10. **Concept questions:** JobTracker vs TaskTracker; data locality; why map output goes to local disk; node failure → rerun its map tasks too; speculative execution; Reporter ("alive"); job distribution (jar + XML via HDFS); destination- vs segment-based targeting (segment 3× better); PageRank map/reduce roles.
