# Lecture 4 (Week 2): Lossless Compression: DPCM, Entropy, RLE, Shannon Fano, Huffman, LZW

What this lecture is about: why and how data is compressed without loss: modulation and PCM recap, compression ratio, entropy as the lower bound on bits per symbol, run-length coding, the two variable-length codes (Shannon-Fano top-down, Huffman bottom-up, plus extended and adaptive Huffman), and LZW dictionary coding. Source: Li, Drew, Liu, *Fundamentals of Multimedia* 2nd ed., Chapter 7 (slide 46).

> Slide numbers = PDF page numbers (page 1 = title slide). Every number below was checked in Python (`/home/claude/work/agents/L4/verify.py`). Slide errors are marked "(slide shows X)".

## 1. Modulation: AM, FM, PM (slides 3-4)

- Definition (slide 3, highlighted): "**modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a separate signal called the modulation signal** that typically contains information to be transmitted."
- **AM**: the **height** (amplitude) of the carrier is varied to represent the data.
- **FM**: the **frequency** of the carrier is varied to reflect the frequency of the data.
- **PM**: the **phase** of the carrier is varied; "the frequency is unchanged while the phase is changed relative to the base carrier frequency. It is similar to FM."
- Slide 4: "**Modulation** is the process of encoding information in a transmitted signal, while **demodulation** is the process of extracting information from the transmitted signal."

## 2. PCM Recap and the Three Stages of Compression (slides 5-9)

- **Coder mapping** = the boundaries of quantizer input intervals that all map to the same output level. **Decoder mapping** = the representative (output) values of the quantizer (slide 5).
- Three stages of every compression scheme (slide 6): **1. Transformation** (e.g. predictive coding: predict the next signal from previous ones, transmit the prediction error), **2. Loss** (quantization is the main lossy step), **3. Coding** (fixed-length or variable-length codewords, e.g. Huffman). Details: see Lecture 3.
- Slide 7 (Figure 3.7): waveform $v(t)$ sampled, quantized and encoded by a **3-bit PCM** system: (a) input, (b) sampling pulse, (c) sampled waveform (PAM signal), (d) quantized signal, (e) PCM pulses.

| Sample | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Quantized level | 4 | 6 | 7 | 6 | 4 | 2 | 1 |
| 3-bit code | 100 | 110 | 111 | 110 | 100 | 010 | 001 |

- PCM bitstream = `100110111110100010001` (7 samples x 3 bits = 21 bits).
- Slide 8 (Fig. 6.14): (a) original signal and PCM samples on levels -4..4, (b) **decoded staircase signal**, (c) **reconstructed signal after low-pass filtering**. Slide 9 (Fig. 6.15): bandlimiting filter, μ-law/A-law compressor, linear PCM, transmission, DAC, μ-law/A-law expander, low-pass filter (see Lecture 3).

## 3. Differential Coding, Predictive Coding and DPCM (slides 2, 6)

- The PDF lists "Differential Coding of Audio", "Lossless Predictive Coding" and "DPCM" on the Content slide (slide 2), but has **no dedicated slides** for them; the only slide text is the "Transformation" stage on slide 6 ("predict the next signal from previous ones and transmit the prediction error"). Everything else in this section is (textbook context), Li and Drew sections 6.3.5-6.3.6.
- (textbook context) **Differential coding**: send $d_n = f_n - f_{n-1}$ instead of $f_n$. Differences cluster around 0, so their histogram is peaked, entropy is lower and a VLC (Huffman) gives shorter codes.
- (textbook context) **Lossless predictive coding**: prediction $\hat f_n$ from past values, error $e_n = f_n - \hat f_n$; decoder rebuilds $f_n = \hat f_n + e_n$ exactly. Example predictor $\hat f_n = \lfloor \tfrac12 (f_{n-1} + f_{n-2}) \rfloor$; invent $f_0 = f_1$ and send $f_1$ uncoded.

| n | $f_n$ | $\hat f_n$ | $e_n$ |
|---|---|---|---|
| 1 | 21 | (sent as is) | |
| 2 | 22 | $\lfloor (21+21)/2 \rfloor = 21$ | 1 |
| 3 | 27 | $\lfloor (22+21)/2 \rfloor = 21$ | 6 |
| 4 | 25 | $\lfloor (27+22)/2 \rfloor = 24$ | 1 |
| 5 | 22 | $\lfloor (25+27)/2 \rfloor = 26$ | -4 |

- (textbook context) **DPCM** = predictive coding **plus quantization of the error**: $e_n = f_n - \hat f_n$, $\tilde e_n = Q[e_n]$, $\tilde f_n = \hat f_n + \tilde e_n$. The predictor uses **reconstructed** values $\tilde f$ (the decoder has only those), so the reconstruction error equals the quantization error $e_n - \tilde e_n$. Example: $\hat f_n = \mathrm{trunc}\big((\tilde f_{n-1} + \tilde f_{n-2})/2\big)$, $Q[e_n] = 16\,\mathrm{trunc}\big((255 + e_n)/16\big) - 256 + 8$.

| n | $f_n$ | $\hat f_n$ | $e_n$ | $\tilde e_n$ | $\tilde f_n$ | error $f_n - \tilde f_n$ |
|---|---|---|---|---|---|---|
| 1 | 130 | 130 | 0 | 0 | 130 | 0 |
| 2 | 150 | 130 | 20 | 24 | 154 | -4 |
| 3 | 140 | 142 | -2 | -8 | 134 | 6 |
| 4 | 200 | 144 | 56 | 56 | 200 | 0 |
| 5 | 230 | 167 | 63 | 56 | 223 | 7 |

## 4. Compression, Lossless vs Lossy, Compression Ratio (slides 10-11)

- "**Compression**: the process of coding that will effectively reduce the total number of bits needed to represent certain information." Fig. 7.1: input data, encoder (compression), storage or networks, decoder (decompression), output data.
- "If the compression and decompression processes induce no information loss, then the compression scheme is **lossless**; otherwise, it is **lossy**."
- $B_0$ = bits **before** compression, $B_1$ = bits **after** compression:

$$\text{compression ratio} = \frac{B_0}{B_1}$$

- Want a codec (encoder/decoder scheme) with ratio **much larger than 1.0**; higher is better "as long as it is computationally feasible".

## 5. Entropy: Basics of Information Theory (slides 12-13)

- Entropy $\eta$ of a source with alphabet $S = \{s_1, \dots, s_n\}$, Eq. (7.2) and (7.3):

$$\eta = H(S) = \sum_{i=1}^{n} p_i \log_2 \frac{1}{p_i} = -\sum_{i=1}^{n} p_i \log_2 p_i$$

- $p_i$ = probability that $s_i$ occurs in $S$. $\log_2 \frac{1}{p_i}$ = **self-information** (as defined by Shannon) of $s_i$ = "the number of bits needed to encode $s_i$". Units: bits per symbol (base-2 log).
- Fig. 7.2(a): uniform gray levels, $p_i = 1/256$ for all $i$: $\eta = \log_2 256 = 8$ bits, Eq. (7.4). No compression possible below 8 bits.
- Fig. 7.2(b): only two gray values with $p = 1/3$ and $2/3$: $\eta = \tfrac13\log_2 3 + \tfrac23\log_2 \tfrac32 = 0.918$ (slide: "0.92").
- (textbook context) Eq. (7.5), cited on slide 30 but not shown: $\eta \le \bar l$; entropy is the **lower bound** on average code length $\bar l$.

## 6. Run Length Coding, Repetition Suppression, Pattern Substitution (slides 14-18)

- **Memoryless source**: symbols independently distributed; current symbol does not depend on previous ones. RLC instead **exploits memory** in the source (slide 14).
- Rationale: if symbols tend to form continuous groups, code the **symbol and the length of the group**.
- RLE (slide 15): a run is coded as two entities, **count then symbol**: `aaaaa` becomes `5a`. Example: `BBBBEEEEEEEECCCCDAAAAA` (22 symbols) becomes `4B8E4C1D5A` (10 symbols); a single D still costs `1D`.
- **Repetition suppression** (slide 16): reserve a special **flag** symbol for a commonly occurring pattern. `Abdcb` followed by 44 `a`s becomes `Abdcb` + flag.
- **Pattern substitution** (slides 17-18): group symbols into strings, give each string an index; **no pre-analysis** needed, the dictionary is built while scanning. The slide-18 pseudocode (String, InputSymbol, DICTIONARY) is the same algorithm as LZW (section 11).

## 7. Shannon Fano Algorithm (slides 19-23)

- "Shannon-Fano Algorithm, a **top-down** approach": 1. **sort** symbols by frequency count; 2. **recursively divide** into two parts with approximately the same counts until every part has one symbol. Left branch = 0, right branch = 1.
- Example "HELLO": H 1, E 1, L 2, O 1 (5 symbols). $\log_2(1/p)$: L $= \log_2 2.5 = 1.32$, H/E/O $= \log_2 5 = 2.32$.
- Fig. 7.3 splits: (a) {L:2} vs {H,E,O:3}; (b) {H:1} vs {E,O:2}; (c) {E:1} vs {O:1}.

Table 7.1 (slide 21), "# of bits used" = count x code length:

| Symbol | Count | $\log_2 \frac{1}{p_i}$ | Code | # of bits used |
|---|---|---|---|---|
| L | 2 | 1.32 | 0 | 2 (slide shows 1) |
| H | 1 | 2.32 | 10 | 2 |
| E | 1 | 2.32 | 110 | 3 |
| O | 1 | 2.32 | 111 | 3 |
| | | | TOTAL | 10 |

- Fig. 7.4 (another valid split): (a) {L,H:3} vs {E,O:2}; (b) L|H and E|O. Table 7.2 (slide 23): L 00 (4 bits used), H 01 (2), E 10 (2), O 11 (2), **TOTAL 10**.
- Lesson: Shannon-Fano is **not unique** (ties in the split), but both give 10 bits = 2 bits/symbol vs entropy $\eta = 1.922$ bits/symbol (minimum $5 \times 1.922 = 9.61$ bits).

## 8. Huffman Coding (slides 24-29)

- Fixed-length coding gives every sample $\log_2 n$ bits ($n$ = number of distinct samples or quantization intervals); wasteful because some symbols occur more often (slide 24).
- Outline (slides 25-26): 1. leaves = probabilities (sorting "not necessary"); 2. the **two smallest** probabilities become siblings under a new parent with the **sum** of their probabilities; 3. repeat with the two least-probability nodes (leaves or parents) until one node (root) is left; 4. label branches **0 and 1** from the root; 5. read the code by **traversing root to leaf**.
- ALGORITHM 7.1, "a **bottom-up** approach" (slide 27): sort list by frequency; repeat until one symbol left: (1) pick two lowest counts, form subtree with a parent, (2) parent count = sum, insert keeping the order, (3) delete the children; then assign codewords by the path from the root.

Slide 24 tree (A 15, B 7, C 6, D 6, E 5; total 39), merge steps:

| Step | List after step |
|---|---|
| a | A15, B7, C6, D6, E5 |
| b | A15, B7, C6, (D,E)11 |
| c | A15, (B,C)13, (D,E)11 |
| d | A15, ((B,C),(D,E))24 |
| e | root 39 = A + 24 |

- Codes (left 0, right 1): A = 0, B = 100, C = 101, D = 110, E = 111. Total $15 \cdot 1 + 24 \cdot 3 = 87$ bits, $\bar l = 87/39 = 2.23$ bits/symbol, vs fixed 3-bit: 117 bits; $\eta = 2.186$.

Slide 26 table (8 symbols):

| Symbol | Probability | Huffman code | Code length |
|---|---|---|---|
| A | 0.28 | 00 | 2 (slide shows 1) |
| B | 0.2 | 10 | 2 (slide shows 3) |
| C | 0.17 | 010 | 3 |
| D | 0.17 | 011 | 3 |
| E | 0.1 | 110 | 3 |
| F | 0.05 | 1110 | 4 |
| G | 0.02 | 11110 | 5 |
| H | 0.01 | 11111 | 5 |

- Average symbol length $\bar l = \sum p_i l_i = 2.63$; entropy $\eta = 2.575$ (slide shows 2.574); **efficiency** $= \eta / \bar l = 0.9792$ (matches slide).
- "HELLO" by Huffman, Fig. 7.5 (slide 28): P1 = E + O (2), P2 = H + P1 (3), P3 = L + P2 (5). Codes: L = 0, H = 10, E = 110, O = 111, total 10 bits.
- List contents (slide 29): initialization `L H E O`; after (a) `L P1 H`; after (b) `L P2`; after (c) `P3`.

## 9. Properties of Huffman Coding and Extended Huffman (slides 30-32)

- **Unique prefix property**: no Huffman code is a prefix of any other, so decoding is unambiguous.
- **Optimality**: "minimum redundancy code", proved optimal for a given, accurate probability model: the **two least frequent** symbols have the **same length**, differing only in the **last bit**; more frequent symbols get **shorter** codes; average length is **strictly less than $\eta + 1$**. With Eq. (7.5), Eq. (7.6):

$$\eta \le \bar l < \eta + 1$$

- **Extended Huffman** motivation (slide 31): codewords have integer lengths, wasteful when $p_i$ is very large so $\log_2 \frac{1}{p_i}$ is close to 0. Group $k$ symbols: extended alphabet $S^{(k)} = \{s_1 s_1 \cdots s_1, \dots, s_n s_n \cdots s_n\}$ of size $n^k$.
- Eq. (7.7), average bits **per original symbol**: $\eta \le \bar l < \eta + \frac{1}{k}$. "An improvement over the original Huffman coding, but not much." Problem: for $k \ge 3$ and $n \gg 1$, $n^k$ is a huge symbol table, impractical.

## 10. Adaptive Huffman Coding (slides 33-36)

- Statistics are **gathered and updated dynamically** as the data stream arrives (no prior frequency knowledge).
- Encoder: `Initial_code(); while not EOF { get(c); encode(c); update_tree(c); }`. Decoder: `Initial_code(); while not EOF { decode(c); output(c); update_tree(c); }`.
- `Initial_code` assigns symbols initially agreed-upon codes. `update_tree` (a) **increments the counts** (including new symbols), (b) **updates the tree configuration**. Encoder and decoder must use **exactly the same** `initial_code` and `update_tree`.
- Nodes are numbered **left to right, bottom to top**; parentheses = count. **Sibling property**: all nodes (internal and leaf) are in order of increasing counts. If it is about to be violated, **swap**: "the **farthest node with count N** is swapped with the node whose count has just been increased to **N+1**."

Fig. 7.6 (slide 36), nodes as `number.symbol:(count)`:

| Stage | Event | Tree after the stage |
|---|---|---|
| (a) | start | 9.(9) = [7.(4), 8.P:(5)]; 7 = [5.(2), 6.(2)]; 5 = [1.A:(1), 2.B:(1)]; 6 = [3.C:(1), 4.D:(1)] |
| (b) | 2nd A | A (count 1 to 2) swaps with farthest count-1 node 4.D: 1.D:(1), 2.B:(1), 3.C:(1), 4.A:(2); 6.(3), 7.(5), root 9.(10) |
| (c-1) | 3rd A | A (2 to 3) swaps with farthest count-2 node, internal 5.(2): A becomes 5.A:(3); node 4.(2) now holds D, B |
| (c-2) | parent update | 7.(5+1) would exceed 8.P:(5), so swap nodes 7 and 8 |
| (c-3) | final | 9.(11) = [7.P:(5), 8.(6)]; 8 = [5.A:(3), 6.(3)]; 6 = [3.C:(1), 4.(2)]; 4 = [1.D:(1), 2.B:(1)] |

- Check (c-3): counts by node number 1..9 = 1, 1, 1, 2, 3, 3, 5, 6, 11 (non-decreasing). Reading left = 0: A goes from `000` in (a) to `10` in (c-3); P from `1` to `0`.

## 11. LZW Dictionary Coding (slides 37-45)

- LZW uses **fixed-length codewords** for **variable-length strings** that commonly occur together (e.g. words in English text). Encoder and decoder **build the same dictionary dynamically**; longer and longer repeated entries are added and the **code** is emitted instead of the string.
- Advantages over Huffman (slide 38): no prior knowledge of the input stream; "**60 - 70% compression ratio** for some text files"; better for highly repetitive data; **single pass**.
- ALGORITHM 7.2 (slide 39): `s = next char; while not EOF { c = next char; if s+c in dict: s = s+c; else { output code(s); add s+c with new code; s = c; } } output code(s);`

Example 7.2 (slides 40-41), initial dictionary 1 = A, 2 = B, 3 = C, input `ABABBABCABABBA`:

| S | C | Output | Code | String |
|---|---|---|---|---|
| A | B | 1 | 4 | AB |
| B | A | 2 | 5 | BA |
| A | B | | | |
| AB | B | 4 | 6 | ABB |
| B | A | | | |
| BA | B | 5 | 7 | BAB |
| B | C | 2 | 8 | BC |
| C | A | 3 | 9 | CA |
| A | B | | | |
| AB | A | 4 | 10 | ABA |
| A | B | | | |
| AB | B | | | |
| ABB | A | 6 | 11 | ABBA |
| A | EOF | 1 | | |

- Output **1 2 4 5 2 3 4 6 1**: 9 codes instead of 14 characters, compression ratio $= 14/9 = 1.56$ (slide counts symbols, not bits).
- ALGORITHM 7.3, decompression simple version (slide 42): `s = NIL; while not EOF { k = next code; entry = dict[k]; output entry; if s != NIL: add s + entry[0]; s = entry; }`

Example 7.3 (slide 43), input codes 1 2 4 5 2 3 4 6 1:

| S | K | Entry/output | Code | String |
|---|---|---|---|---|
| NIL | 1 | A | | |
| A | 2 | B | 4 | AB |
| B | 4 | AB | 5 | BA |
| AB | 5 | BA | 6 | ABB |
| BA | 2 | B | 7 | BAB |
| B | 3 | C | 8 | BC |
| C | 4 | AB | 9 | CA |
| AB | 6 | ABB | 10 | ABA |
| ABB | 1 | A | 11 | ABBA |
| A | EOF | | | |

- Output `ABABBABCABABBA`, "a truly lossless result!" The decoder adds each entry **one step later** than the encoder.
- ALGORITHM 7.4, modified (slide 44): **exception handler** `if (entry == NULL) entry = s + s[0];` for a code the decoder has not created yet. (textbook context: the encoder used a string right after adding it, as in patterns like cScSc; see Exam focus 10.)
- Real applications (slide 45): code length $l \in [l_0, l_{max}]$; dictionary starts with $2^{l_0}$ entries; when full, $l$ grows by 1, until $l_{max}$. Then the dictionary is **flushed** (Unix `compress`) or **LRU** (least recently used) entries are removed.

## Exam focus

1. **Entropy.** Use $\eta = \sum p_i \log_2 (1/p_i)$. Fig. 7.2(b) ($1/3$, $2/3$): 0.918. Uniform 256 levels: 8. $\{0.5, 0.25, 0.125, 0.125\}$: 1.75 bits, and Huffman codes 0, 10, 110, 111 give $\bar l = 1.75$ exactly (efficiency 1).
2. **Compression ratio $B_0/B_1$.** RLE `BBBBEEEEEEEECCCCDAAAAA` to `4B8E4C1D5A`: 22/10 = 2.2 (in symbols). LZW Example 7.2: 14/9 = 1.56.
3. **Shannon-Fano vs Huffman** (textbook context, slide 24 data). Shannon-Fano split {A,B | C,D,E}: A 00, B 01, C 10, D 110, E 111, total 89 bits. Huffman: 87 bits. Huffman is never worse.
4. **Build a Huffman code.** `AAABBC` (A3, B2, C1): merge C+B = 3, then A + 3 = 6. A = 0, C = 10, B = 11: total $3 + 4 + 2 = 9$ bits, $\bar l = 1.5$, $\eta = 1.459$; fixed 2-bit = 12 bits (ratio 1.33), 8-bit ASCII = 48 bits (ratio 5.33).
5. **Average length and efficiency** (slide 26): $\bar l = 0.28 \cdot 2 + 0.2 \cdot 2 + 0.17 \cdot 3 \cdot 2 + 0.1 \cdot 3 + 0.05 \cdot 4 + 0.02 \cdot 5 + 0.01 \cdot 5 = 2.63$; efficiency $\eta/\bar l = 2.575/2.63 = 0.9792$. A fixed 3-bit code would have efficiency 0.858. Watch for the slide's wrong code-length column.
6. **Bounds.** Huffman: $\eta \le \bar l < \eta + 1$. Extended (group $k$): $\eta \le \bar l < \eta + 1/k$, alphabet $n^k$. Own example: $p = 0.9/0.1$, $\eta = 0.469$; plain Huffman 1 bit/symbol; $k = 2$ (aa 0.81, ab 0.09, ba 0.09, bb 0.01, codes 1, 011, 00, 010) gives 0.645 bits/symbol.
7. **Huffman properties to state:** unique prefix; two least frequent symbols same length, differ in last bit; frequent symbols shorter; code not unique under ties (HELLO: Fig. 7.5 lengths 1, 2, 3, 3 or all 2, both 10 bits).
8. **Adaptive Huffman:** define sibling property and the swap rule (farthest node with count N swaps with the node going to N+1); redo Fig. 7.6 (section 10). Same `initial_code`/`update_tree` on both sides.
9. **LZW encode.** Own example, dictionary 1 = A, 2 = B, input `ABABABA`: (A,B) out 1 add 3 = AB; (B,A) out 2 add 4 = BA; (AB,A) out 3 add 5 = ABA; (ABA,EOF) out 5. **Output 1 2 3 5** (7 chars in 4 codes, ratio 1.75).
10. **LZW decode with the exception.** Decode 1 2 3 5: A; B (add 3 = AB); AB (add 4 = BA); code 5 is not in the dictionary yet, so entry = s + s[0] = AB + A = ABA, add 5 = ABA. Output `ABABABA`. Only Algorithm 7.4 handles this.
11. **DPCM / predictive coding** (textbook context, section 3): simple difference coding of 100, 102, 105, 105, 103 sends 100, 2, 3, 0, -2. Know $e_n = f_n - \hat f_n$, $\tilde f_n = \hat f_n + \tilde e_n$, and why the predictor uses reconstructed $\tilde f$.
12. **Definitions to reproduce:** modulation (carrier varied by modulation signal; AM height, FM frequency, PM phase), lossless vs lossy, coder vs decoder mapping, three stages of compression, memoryless source, self-information, RLE "count then symbol", Shannon-Fano top-down vs Huffman bottom-up, LZW fixed-length codes for variable-length strings, $l_0$ to $l_{max}$ and flushing/LRU.
