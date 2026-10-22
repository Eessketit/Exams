# Week 1: Intro, Cloud Computing, Map/Reduce, Hadoop

**What this lecture is about:** why Google moved from DBMS to cloud/distributed processing, the Map/Reduce model (key-value in, key-value out) with its classic examples (Word Count, Inverted Index, PageRank, matrices), and Hadoop as the open-source implementation.

---

## 1. Course info (slides 2-5)

- **References:** Han, Kamber, Pei — *Data Mining: Concepts and Techniques*, 3rd ed.; *Neural Networks and Deep Learning* (online, "neuralnetworksanddeeplearning").
- **Grading:** Midterm **48%**, Final **50%**, 2 Homeworks **2%**.
- **Syllabus:** Big data processing (traditional → Hadoop [Word Count, PageRank, K-means] → Spark); Analytics (frequent patterns, classification, neural networks); real-world telco projects.

## 2. Motivating example and the analytics process (slides 6-10, 15-17)

- **Midnight bus routing, Seoul:** demand metric = **# people in a region − # people living in the region** (people who are there at night but don't live there need a bus). Map 1 = existing route on a hex heat-map; map 2 = improved route through the high-demand area.
- **Raw data is messy** — examples shown:
  - JSON record `{S_id, R_id, S_time: "20201010150021", E_time: "20201010150313", S_cid, R_cid}` (timestamps are `YYYYMMDDhhmmss`; field meanings not given — likely sender/receiver id, start/end time, sender/receiver cell id).
  - SMS log: the format in the spec document (XML) differs from what is actually written on the server (mixed text + XML), then re-encoded as JSON (`jobid`, `logid`, `c_msg_id`, `type: "xml-RCP-consume-REQSMS"`).
- **Big Data Analytics Process (slide 8):** Data collection (Service 1…5 data) →
  1. Transforming raw data → 2. Summary → 3. Finding variables → 4. Applying various data analytics algorithms → 5. Consolidating results → 6. Verifying results with real data
  - Steps are **inter-related & trial-and-error** (loop back to step 1).

## 3. Traditional processing vs. cloud computing (slides 11-14)

- **Traditional:** big central server + commercial DBMS (picture: IBM mainframe + DB2) → scale **up**.
- **Cloud computing (definition, slide 12):** complicated data processing needing massive computing power and storage is executed on the **central server (Cloud)** rather than on personal PCs or local servers.
- **Google's motivation (slide 13):**
  - From day one Google used **cloud platforms with distributed file systems, not commercial DBMS** → big advantage in **cost and scalability**; disadvantage: **parallel applications are very hard to develop**.
  - Concern: success = analyzing the *whole* Web; Web data **doubles every year** → need Web-scale processing; huge HW/SW cost.
  - **DBMS restrictions:** scalable only up to a point (OLTP, DW); doesn't fit big data; expensive to buy and operate; when not powerful enough you must **buy a new, more powerful server**.
  - Result: Google competed with Yahoo at much lower HW/SW cost; the only problem left = writing **scalable, fault-tolerant, parallel** software → Map/Reduce.
- **Three major challenges of parallel computing (slide 14):**
  - **Transparency** — distributed programs are hard; need a consistent, easy programming model for huge data.
  - **Fault tolerance** — lots of commodity devices → lots of failures.
  - **Scalability** — more data must be handled by adding more low-cost HW.

**Google stack (bottom → top) vs. Hadoop equivalent:**

| Google layer | Hadoop equivalent |
|---|---|
| Commodity PC server clustering | Commodity PC server clustering |
| Optimized Linux OS by Google | Linux (Redhat, CentOS, Ubuntu…) |
| **GFS** (Google File System) | **HDFS** |
| Map/Reduce engine + **BigTable** (distributed DB) | Hadoop Map/Reduce + **HBase** (+ Hive on top) |
| Google Search & services | Tera/Peta-scale applications |

- Scale numbers: **2006** ≈ 450,000 PCs; **2008** 200+ GFS clusters, 1,000–5,000 PCs per cluster; **2009** 50 billion pages indexed.

## 4. Key idea of Map/Reduce (slide 19)

- **Data type:** key-value *records*.
$$\textbf{Map: } (K_{in}, V_{in}) \rightarrow list(K_{inter}, V_{inter})$$
$$\textbf{Reduce: } (K_{inter}, list(V_{inter})) \rightarrow list(K_{out}, V_{out})$$
- Between them: **Shuffle & Sort** — all intermediate pairs with the same key are grouped and sent to the same reducer; keys arrive sorted.
- Hadoop platform handles node communication: **failure recovery, scalability, load balancing** (programmer writes only map + reduce).
- Contents slide also lists "Sort example" and "Impact of Map/Reduce on Google" — no slides for them in this deck.

## 5. Word Count (slides 20, 27)

- Map: for each word in line → emit `(word, 1)`. Reduce: `(word, [1,1,…])` → `(word, sum)`.

**Slide example — 3 mappers, 2 reducers:**

| Mapper input | Mapper output (as drawn) |
|---|---|
| "the quick brown fox" | (the,1) (brown,1) (fox,1) → R1; (quick,1) → R2 |
| "the fox ate the mouse" | (the,1) (fox,1) (the,1) → R1; (ate,1) (mouse,1) → R2 |
| "how now brown cow" | (how,1) (now,1) (brown,1) → R1; (cow,1) → R2 |

| Reducer | Keys received | Output (sorted by key) |
|---|---|---|
| R1 | brown, fox, how, now, the | brown,2 · fox,2 · how,1 · now,1 · the,3 |
| R2 | ate, cow, mouse, quick | ate,1 · cow,1 · mouse,1 · quick,1 |

- Note: mapper 2 emits `(the,1)` **twice** — the diagram shows no local aggregation. The Java code, however, sets a **combiner** (= ReduceClass), which would turn that into `(the,2)` on the map side.
- Each key goes to exactly one reducer (partitioning); each reducer's output is sorted by key.

## 6. Inverted Index (slide 21)

- **Input:** `(filename, text)` records. **Output:** for each word, list of files containing it.
- **Map:** `foreach word in text.split(): output(word, filename)`
- **Combine:** uniquify filenames for each word (drop duplicate `(word, file)` pairs locally).
- **Reduce:** `def reduce(word, filenames): output(word, sort(filenames))`

| File | Text | Map output (after combine) |
|---|---|---|
| H.txt | to be or not to be | (to,H.txt) (be,H.txt) (or,H.txt) (not,H.txt) — 4 pairs, "to"/"be" not repeated |
| S.txt | be not afraid of greatness | (be,S.txt) (not,S.txt) (afraid,S.txt) (of,S.txt) (greatness,S.txt) |

Reduce output: `afraid,(S.txt)` · `be,(S.txt, H.txt)` · `greatness,(S.txt)` · `not,(S.txt, H.txt)` · `of,(S.txt)` · `or,(H.txt)` · `to,(H.txt)`
- Keys come out alphabetically. (Slide lists S.txt before H.txt even though the code says `sort(filenames)`; if asked to apply `sort`, write H.txt, S.txt.)

## 7. Google PageRank (slides 22-23)

**Definition (slide 22):** $D$ = set of all Web pages; $I(p)$ = set of pages that link **to** $p$; $c_j$ = total number of links going **out of** page $p_j$; $r_i$ = PageRank of $p_i$:

$$r_i = d\left[\sum_{p_j \in I(p_i)} \frac{r_j}{c_j}\right] + (1-d)\frac{1}{|D|}$$

- **Random Surfer Model:** PageRank = the **probability distribution of a random walk** on the web graph.
- Sometimes the surfer **gets bored and jumps to a different page** ("jumping out") → the $(1-d)\frac{1}{|D|}$ term. $d$ = probability of following a link (damping factor); the slide gives no numeric value (textbook context: $d = 0.85$).
- With this $\frac{1}{|D|}$ form, ranks sum to 1 (if no dangling pages) — use initial $r_i = \frac{1}{|D|}$ unless told otherwise.

**Map/Reduce formulation — exactly what slide 23 shows (diagram only, no pseudocode):**
- **Map: "distribute PageRank 'credit' to link targets"** — each page $p_j$ splits its current rank over its out-links: for every target $p_i$ it emits $\langle p_i,\ r_j / c_j\rangle$.
- **Reduce: "gather up PageRank 'credit' from multiple sources to compute new PageRank value"** — for key $p_i$, sum all received credits $\sum r_j/c_j$ and produce the new $r_i$.
- **"Iterate until convergence"** — output ranks feed the next Map round.
- **Not shown on the slides:** emitting the adjacency list, where $d$ / $(1-d)/|D|$ is applied, initialization, dangling pages. The only formula with $d$ is slide 22, so the natural reading is: **reducer** computes $r_i = d\cdot(\text{sum}) + (1-d)/|D|$.

**(textbook context — Lin & Dyer style pseudocode, needed to make iteration actually work):**
```
map(page p, node N):                 # N = (rank r_p, adjacency list)
    emit(p, N)                       # pass graph structure along
    for each q in N.adjList:
        emit(q, N.rank / |N.adjList|)
reduce(page q, values):
    s = 0
    for v in values:
        if v is a node: M = v        # recover adjacency list
        else: s += v                 # sum incoming credit
    M.rank = d * s + (1 - d) / |D|   # Lin & Dyer apply the jump in a separate pass
    emit(q, M)
```

## 8. Matrix operations with Map/Reduce (slide 24)

Input records: `<[A|B], i, j, value>` (matrix tag, row, column, value).

**Addition (given on slide):** A, B same size.
- Map: in `<[A|B], i, j, value>` → out **`<key={i,j}, value=[A_ij | B_ij]>`**
- Reduce: in `<key, {A_ij, B_ij}>` → out **`<key={i,j}, value=A_ij + B_ij>`**

**Multiplication (blanks on slide — fill-in exercise):** A is $n \times l$, B is $l \times m$, $C = AB$ is $n \times m$, $C_{ik} = \sum_{j=1}^{l} A_{ij} B_{jk}$.
Standard one-pass answer (textbook context, Leskovec et al. *Mining of Massive Datasets*):
- Map:
  - record `<A, i, j, a_ij>` → for **k = 1..m** emit **`<key={i,k}, value=[A, j, a_ij]>`**
  - record `<B, j, k, b_jk>` → for **i = 1..n** emit **`<key={i,k}, value=[B, j, b_jk]>`**
- Reduce: in `<key={i,k}, list of [A, j, a_ij] and [B, j, b_jk]>`; match A- and B-entries with the same $j$, multiply, sum.
  - out **`<key={i,k}, value=Σ_j a_ij · b_jk>`**
- Each $a_{ij}$ is sent to $m$ reducers, each $b_{jk}$ to $n$ reducers; one reducer per output cell $(i,k)$.

## 9. Hadoop (slides 25-26)

- **Definition:** open-source platform **based on Java**; has **HDFS** (similar to GFS); on top of HDFS, runs Map/Reduce jobs on a cluster of thousands of PCs.
- **Apache Hadoop project components:**

| Component | Initiated by | Role |
|---|---|---|
| Hadoop Core | — | Distributed File System + Map/Reduce framework |
| Pig | Yahoo! | Parallel programming language and runtime |
| HBase | Powerset | Table storage for semi-structured data (≈ BigTable) |
| Hive | Facebook | SQL-like query language & meta-store |

- Example PC server: Intel Quad Core × 2 CPU, 16 GB RAM, 500 GB × 4 HDD, Gigabit Ethernet × 2 ports.
- Inset diagram: Input domain → Map (×3) → intermediate domain → Reduce (×3) → intermediate domain → Reduce → Output domain (reduces can be chained).

## 10. Hadoop Word Count in Java (slides 28-30, old `mapred` API)

```java
public class MapClass extends MapReduceBase
    implements Mapper<LongWritable, Text, Text, IntWritable> {   // <K_in, V_in, K_inter, V_inter>
  private final static IntWritable ONE = new IntWritable(1);
  public void map(LongWritable key, Text value,
                  OutputCollector<Text, IntWritable> out, Reporter reporter) throws IOException {
    String line = value.toString();
    StringTokenizer itr = new StringTokenizer(line);
    while (itr.hasMoreTokens()) out.collect(new Text(itr.nextToken()), ONE);  // slide typo: "new text"
  }
}
public class ReduceClass extends MapReduceBase
    implements Reducer<Text, IntWritable, Text, IntWritable> {   // <K_inter, V_inter, K_out, V_out>
  public void reduce(Text key, Iterator<IntWritable> values,
                     OutputCollector<Text, IntWritable> out, Reporter reporter) throws IOException {
    int sum = 0;
    while (values.hasNext()) sum += values.next().get();
    out.collect(key, new IntWritable(sum));
  }
}
// main: JobConf conf = new JobConf(WordCount.class); conf.setJobName("wordcount");
//   setMapperClass(MapClass), setCombinerClass(ReduceClass), setReducerClass(ReduceClass)
//   FileInputFormat.setInputPaths(conf, args[0]); FileOutputFormat.setOutputPath(conf, new Path(args[1]));
//   setOutputKeyClass(Text) // words;  setOutputValueClass(IntWritable) // counts;  JobClient.runJob(conf);
```
- Type mapping: $K_{in}$ = `LongWritable` (byte offset of the line — textbook context), $V_{in}$ = `Text` (line), $K_{inter}=K_{out}$ = `Text` (word), $V_{inter}=V_{out}$ = `IntWritable` (count).
- The **reducer is reused as the combiner** — valid because summing is associative and commutative.

---

## Exam focus

**1. Trace Word Count** (mapper outputs → shuffle → reducer outputs). Input split 1 = "a b a", split 2 = "b c":

| Stage | Split 1 | Split 2 |
|---|---|---|
| Map | (a,1) (b,1) (a,1) | (b,1) (c,1) |
| With combiner | (a,2) (b,1) | (b,1) (c,1) |
| Shuffle | a:[1,1] or [2] · b:[1,1] · c:[1] | |
| Reduce | **a,2 · b,2 · c,1** | |

**2. Trace Inverted Index.** D1 = "cat dog cat", D2 = "dog bird":
- Map D1: (cat,D1) (dog,D1) (cat,D1) → combine → (cat,D1) (dog,D1); Map D2: (dog,D2) (bird,D2)
- Reduce: **bird,(D2) · cat,(D1) · dog,(D1, D2)**

**3. One PageRank iteration (Map/Reduce).** Graph: A→B, A→C, B→C, C→A; $|D|=3$, $d=0.85$, $r^{(0)} = 1/3$ each.

| Mapper (page, rank, outdeg) | Emits |
|---|---|
| A, 1/3, 2 | ⟨B, 1/6⟩, ⟨C, 1/6⟩ |
| B, 1/3, 1 | ⟨C, 1/3⟩ |
| C, 1/3, 1 | ⟨A, 1/3⟩ |

| Reducer key | Credits summed | $r^{(1)} = 0.85\cdot s + 0.15/3$ |
|---|---|---|
| A | 1/3 | 0.85(0.3333) + 0.05 = **0.3333** |
| B | 1/6 | 0.85(0.1667) + 0.05 = **0.1917** |
| C | 1/6 + 1/3 = 1/2 | 0.85(0.5) + 0.05 = **0.4750** |

- Check: sum = 1.0000. Without damping ($d=1$): A = 1/3, B = 1/6, C = 1/2.
- Iteration 2 (same steps): A = 0.45375, B = 0.1917, C = 0.3546.

**4. Matrix Map/Reduce.** $A=\begin{pmatrix}1&2\\3&4\end{pmatrix}$, $B=\begin{pmatrix}5&6\\7&8\end{pmatrix}$.
- Addition: key {1,1} gets {1, 5} → 6; full result $\begin{pmatrix}6&8\\10&12\end{pmatrix}$.
- Multiplication: key {1,1} gets [A,1,1], [A,2,2] and [B,1,5], [B,2,7] → $1\cdot5 + 2\cdot7 = 19$; full $C=\begin{pmatrix}19&22\\43&50\end{pmatrix}$. Map emits $2nlm = 16$ pairs.

**5. Short-answer favorites:** Map/Reduce type signatures; why Google avoided commercial DBMS (cost, scalability, scale-up limit); the 3 parallel-computing challenges (transparency, fault tolerance, scalability); GFS↔HDFS, BigTable↔HBase; Pig/HBase/Hive and who started them; why the reducer can be the combiner in Word Count.
