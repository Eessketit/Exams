# Lecture 12 (Week 7): Pattern Recognition

What this lecture is about: what patterns, features and pattern classes are, the fish sorting example (features, decision boundary, cost, generalization), the **pattern recognition system flowchart** and the **design cycle**, supervised vs unsupervised and statistical vs structural PR, feature vectors, template matching, and the classifiers: discriminant functions, nearest class mean (Euclidean and std-dev scaled), nearest neighbor / k-NN and Bayesian decision making, with the Iris and multispectral examples.

**Conventions used throughout**
- "slide N" = PDF page N (slide 1 = title). Slide 49 references: "Chapter 12 Feature extraction" and *Pattern Classification* (chapter 1) by R. O. Duda, P. E. Hart and D. G. Stork, Wiley, 2000. Figures 12.x keep the source book numbers.
- Feature vectors are written $x=[x_1,x_2,\dots,x_d]$; class means $x_c$ (slide 40 notation). Every number below was checked in Python (`agents/L12/verify.py`).

## 1. Patterns, Features and Pattern Classes (slides 2-3)

- Contents (slide 2): Background; Patterns and pattern classes; Pattern classification by prototype matching; Template matching; Statistical classifier; additional details.
- Definitions (slide 3, exact wording):
  - "A **pattern** is an arrangement of **descriptors**."
  - "The name **feature** is used often in the pattern recognition literature to denote a descriptor."
  - "A **pattern class** is a family of patterns that share some common properties."

## 2. Fish Sorting Example: Problem and Preprocessing (slides 4-7)

- Task (slide 4): "Sorting incoming Fish on a conveyor according to species using optical sensing". Species: **sea bass** or **salmon**.
- Problem analysis (slide 5): "Set up a camera and take some sample images to extract features": **length, lightness, width, number and shape of fins, position of the mouth**, etc. "This is the set of all suggested features to explore for use in our classifier!"
- Preprocessing (slide 6), three steps:
  1. "Use a **segmentation** operation to isolate fishes from one another and from the background".
  2. "Information from a single fish is sent to a **feature extractor** whose purpose is to reduce the data by measuring certain features".
  3. "The features are passed to a **classifier**".
- Slide 7 diagram: camera image -> Preprocessing -> Feature extraction -> Classification -> "salmon" or "sea bass" (black arrows forward, gray arrows back up).

## 3. Choosing Features, Decision Boundary and Cost (slides 8-16)

| Slide | Feature(s) | What the figure shows | Lesson (slide wording) |
|---|---|---|---|
| 8-9 | length | histograms (count vs length); salmon mostly shorter, sea bass longer; threshold $l^*\approx 11$; big overlap | "The length is a poor feature alone! Select the lightness as a possible feature." |
| 10 | lightness | salmon at low lightness (about 1-7), sea bass at high (about 4-10); threshold $x^*\approx 5.5$; much smaller overlap | lightness separates better |
| 11 | lightness | threshold moved | "Move our decision boundary toward smaller values of lightness in order to minimize the cost (reduce the number of sea bass that are classified salmon!)" = "**Task of decision theory**" |
| 12-13 | lightness + width | $x^T=[x_1,x_2]$ = [lightness, width]; scatter plot, a **straight line** boundary | two features beat one |
| 14 | many | very wiggly boundary that separates every training sample | add features "not correlated with the ones we already have"; "A precaution should be taken not to reduce the performance by adding such **noisy features**"; "Ideally, the best decision boundary should be the one which provides an optimal performance" |
| 15-16 | lightness + width | smooth **curved** boundary | "our satisfaction is premature because the central aim of designing a classifier is to correctly classify **novel input**" = "**Issue of generalization!**" |

- Decision rule with one threshold: lightness $<x^*$ -> salmon, else sea bass. Moving $x^*$ left shrinks the salmon region, so fewer sea bass end up in the salmon cans (the costly error), at the price of more salmon labelled sea bass.
- (textbook context) The slide 14 boundary is perfect on the training data but would do badly on new fish (overfitting); slide 16 accepts a few training errors to generalize better.

## 4. Pattern Recognition System Flowchart (slides 17-19)

The exam asks to draw this (10 points). Slide 18 figure, read **bottom to top**; the classification box is highlighted in red on the slide.

```
                       decision
                           ^
                           |
              +------------------------+
              |    post-processing     |<------------- costs
              +------------------------+<---+
                  ^                :        |
                  |                v        +--------- adjustments for
              +========================+    |          context
              |     classification     |<---+
              +========================+<------------- adjustments for
                  ^                :                   missing features
                  |                v
              +------------------------+
              |   feature extraction   |
              +------------------------+
                  ^                :
                  |                v
              +------------------------+
              |      segmentation      |
              +------------------------+
                  ^                :
                  |                v
              +------------------------+
              |        sensing         |
              +------------------------+
                           ^
                           |
                         input
```

- Solid arrows `^` (black on the slide) = data flowing up. Dotted `: v` (gray on the slide) = arrows going **down** from each stage to the one below it (later stages can send information back).
- Side inputs (red arrows): **costs** -> post-processing; **adjustments for context** -> post-processing **and** classification (two arrows); **adjustments for missing features** -> classification.
- One line per stage (slide 17 and 19 wording):
  - **Sensing**: "Use of a transducer (camera or microphone)"; "PR system depends of the bandwidth, the resolution sensitivity distortion of the transducer".
  - **Segmentation and grouping**: "Patterns should be well separated and should not overlap".
  - **Feature extraction**: "Discriminative features"; "Invariant features with respect to translation, rotation and scale."
  - **Classification**: "Use a feature vector provided by a feature extractor to assign the object to a category".
  - **Post Processing**: "Exploit **context** input dependent information other than from the target pattern itself to improve performance".
- Order to memorize: input, Sensing, Segmentation, Feature extraction, Classification, Post-processing, decision.

## 5. The Design Cycle (slides 20-27)

Slide 20 lists six items: Data collection, Feature Choice, Model Choice, Training, Evaluation, Computational Complexity. Slide 21 flowchart (top to bottom, 5 boxes):

```
                           start
                             |
                             v
                  +---------------------+
                  |    collect data     |<-------------+
                  +---------------------+              |
                             |                         |
                             v                         |
 prior knowledge  +---------------------+              |
 (e.g.,  -------->|   choose features   |<-------------+
 invariances)     +---------------------+              |
         \                   |                         |
          \                  v                         |
           \      +---------------------+              |
            ----->|    choose model     |<-------------+
                  +---------------------+              |
                             |                         |
                             v                         |
                  +---------------------+              |
                  |  train classifier   |<-------------+
                  +---------------------+              |
                             |                         |
                             v                         |
                  +---------------------+              |
                  | evaluate classifier |--------------+
                  +---------------------+
                             |
                             v
                            end
```

- Feedback loop: the output of **evaluate classifier** goes back (right-hand line) into **collect data, choose features, choose model and train classifier**.
- **Prior knowledge (e.g., invariances)** (two red arrows) feeds **choose features** and **choose model**.
- Each step (slides 22-27, slide wording):
  - **Data collection**: "How do we know when we have collected an adequately large and representative set of examples for training and testing the system?"
  - **Feature choice**: "Depends on the characteristics of the problem domain. Simple to extract, invariant to irrelevant transformation insensitive to noise."
  - **Model choice**: "Unsatisfied with the performance of our fish classifier and want to jump to another class of model".
  - **Training**: "Use data to determine the classifier. Many different procedures for training classifiers and choosing models".
  - **Evaluation**: "Measure the error rate (or performance and switch from one set of features to another one".
  - **Computational complexity** (not a box in the flowchart): "What is the trade-off between computational ease and performance?"; "How an algorithm scales as a function of the number of features, patterns or categories?"

## 6. Learning, Statistical and Structural PR (slides 28-31)

- Learning and adaptation (slide 28):
  - **Supervised learning**: "A teacher provides a category label or cost for each pattern in the training set".
  - **Unsupervised learning**: "The system forms clusters or natural groupings of the input patterns".
- **Statistical PR** (slide 29): "The data is reduced to vectors of numbers and statistical techniques are used for the tasks to be performed."
- **Structural PR** (slide 30): "The data is converted to a discrete structure (such as a grammar or a graph) and the techniques are related to computer science subjects (such as parsing and graph matching)."
- Classification in statistical PR (slide 31):
  - "A **class** is a set of objects having some important properties in common".
  - "A **feature extractor** is a program that inputs the data (image) and extracts features that can be used in classification."
  - "A **classifier** is a program that inputs the feature vector and assigns it to one of a set of designated classes or to the **reject** class."

## 7. Feature Vectors, Character Features and Terminology (slides 32-34, 36)

- Feature vector (slide 32): $X=[x_1,x_2,\dots,x_n]$, each $x_j$ a real number; $x_j$ may be an **object measurement** or a **count of object parts**. Example: object rep. [#holes, #strokes, moments, ...]. The slide shows two characters as 0/1 binary arrays.
- Slide 33 (Fig. 12.7): American Bankers Association **E-13B** font character set (digits 0-9 plus Transit, Amount, On Us, Dash symbols) and their corresponding **waveforms** (each character read as a 1D signal).
- Slide 34: possible features for character recognition:

| char | area | height | width | #holes | #strokes | center (cx,cy) | best axis | least inertia |
|---|---|---|---|---|---|---|---|---|
| A | medium | high | 3/4 | 1 | 3 | 1/2, 2/3 | 90 | medium |
| B | medium | high | 3/4 | 2 | 1 | 1/3, 1/2 | 90 | large |
| 8 | medium | high | 2/3 | 2 | 0 | 1/2, 1/2 | 90 | medium |
| 0 | medium | high | 2/3 | 1 | 0 | 1/2, 1/2 | 90 | large |
| 1 | low | high | 1/4 | 0 | 1 | 1/2, 1/2 | 90 | low |
| W | high | high | 1 | 0 | 4 | 1/2, 2/3 | 90 | large |
| X | high | high | 3/4 | 0 | 2 | 1/2, 1/2 | ? | large |
| `*` | medium | low | 1/2 | 0 | 0 | 1/2, 1/2 | ? | large |
| `-` | low | low | 2/3 | 0 | 1 | 1/2, 1/2 | 0 | low |
| `/` | low | high | 2/3 | 0 | 1 | 1/2, 1/2 | 60 | low |

  - The 7th character is blurry on the slide; its features (2 strokes, no single best axis) fit 'X'. '8' and 'B' share area, height, #holes = 2 and best axis; 'A' and '0' share area, height, #holes = 1 and best axis. So one feature alone cannot separate them; the vector of features can.
- Terminology (slide 36): **Classes**: set of $m$ known categories of objects, (a) might have a known description for each, (b) might have a set of samples for each. **Reject class**: "a generic class for objects not in any of the designated known classes". **Classifier**: "Assigns object to a class based on features".

## 8. Template Matching (slides 35, 48)

- Slide 35 (Fig. 12.8, "the mechanics of template matching"): template $w$ of size $m\times n$ **centered at an arbitrary location** $(x,y)$ is moved over image $f$; the image is **padded** by $(m-1)/2$ rows (top and bottom) and $(n-1)/2$ columns (left and right). Example: a $5\times3$ template needs 2 rows and 1 column of padding. Same sliding-mask mechanics as spatial filtering (see Lecture 11).
- Slide 48 (Fig. 12.9, object recognition): (a) satellite image of Hurricane Andrew (24 Aug 1992), (b) template of the eye of the storm, (c) **correlation coefficient** shown as an image (the brightest point = best match), (d) location of the best match (a single pixel, enlarged to be visible).
- (textbook context) The correlation coefficient used:
$$\gamma(x,y)=\frac{\sum_s\sum_t\,[w(s,t)-\bar w]\,[f(x+s,y+t)-\bar f_{xy}]}{\sqrt{\sum_s\sum_t[w(s,t)-\bar w]^2\;\sum_s\sum_t[f(x+s,y+t)-\bar f_{xy}]^2}}\in[-1,1]$$
  The best match is the maximum of $\gamma$; subtracting the means makes it insensitive to brightness and contrast changes (a patch $f=2w+1$ gives $\gamma=1$, an inverted patch gives $\gamma=-1$).

## 9. Discriminant Functions (slide 37)

- "Functions $f(x,K)$ perform some computation on feature vector $x$"; "Knowledge $K$ from training or programming is used"; "Final stage determines class".
- Diagram: input feature vector $x=[x_1,x_2,\dots,x_d]$ -> every component goes to each of $f_1(x,K),f_2(x,K),\dots,f_m(x,K)$ ("distance or probability computations", one per class) -> **compare and decide** -> output classification $C(x)$.
- (textbook context) With distances the class of the **smallest** $f_i$ wins; with probabilities the **largest** wins.

## 10. Nearest Class Mean and Scaling by Std Dev (slides 38-40, 43, 47)

- Slide 38: "Compute the **Euclidean distance** between feature vector $X$ and the mean of each class. Choose closest class, if close enough (**reject otherwise**)."
$$\|x-x_c\|=\sqrt{\sum_{i=1}^{d}\big(x[i]-x_c[i]\big)^2},\qquad x_c=\frac{1}{N_c}\sum_{\text{samples of }c}x$$
- Slide 39: "Nearest mean might yield poor results with complex structure". "Class 2 has **two modes**; where is its mean." Read from the figure, the modes are near (0.18, 0.83) and (0.57, 0.31), so one mean would be about (0.38, 0.57), in empty space between Class 1 and Class 3. "But if modes are detected, two **subclass mean vectors** can be used."
- Slide 40, scaled Euclidean distance: "We can compute a modified distance from feature vector $x$ to class mean vector $x_c$ by scaling by the spread, or **standard deviation**, $\sigma_i$ of class $c$ along each dimension $i$."
$$\|x-x_c\|=\sqrt{\sum_{i=1,d}\Big(\big(x[i]-x_c[i]\big)/\sigma_i\Big)^2}$$
  Slide's point: an $X$ near the top of the (tall, thin) Class 3 "will scale to be closer to the mean of Class 3 than to the mean of Class 2. Without scaling, $X$ would be closer to the mean of Class 2."
- Slide 43 (Fig. 12.1): the **Iris** data, three types (*setosa*, *versicolor*, *virginica*) described by two measurements: $x_1$ = petal length (cm), $x_2$ = petal width (cm). Setosa is far away; versicolor and virginica touch.
- Slide 47 (Fig. 12.6), decision boundary of the **minimum distance classifier** for versicolor vs setosa: $2.8x_1+1.0x_2-8.9=0$. It is the **perpendicular bisector** of the dashed line joining the two means (dark square = versicolor mean, dark dot = setosa mean); "+" side = versicolor, "-" side = setosa.
  - (textbook context) Means $m_1=(4.3,1.3)$ versicolor, $m_2=(1.5,0.3)$ setosa. Boundary $(m_1-m_2)^Tx-\tfrac12(m_1-m_2)^T(m_1+m_2)=2.8x_1+1.0x_2-8.92=0$ (slide rounds to 8.9). It passes through the midpoint (2.9, 0.8).

## 11. Nearest Neighbor and k Nearest Neighbors (slide 41)

- "Keep all the training samples in some efficient look-up structure."
- "Find the nearest neighbor of the feature vector to be classified and assign the class of the neighbor."
- "Can be extended to K nearest neighbors." (textbook context) Take the K closest samples and pick the majority class; this smooths out single outliers.
- Nearest mean stores one vector per class; NN stores **all** samples (more memory and search, but follows complex class shapes such as slide 39).

## 12. Bayesian Decision Making (slides 42, 44-46)

- Slide 42: "classify into class $\omega_i$ that is most likely based on observations $X$". The distributions needed:
  - (1) **class conditional distribution**: $p(x\mid\omega_i)$ for each class $\omega_i$ (slide shows a typo, "omegd")
  - (2) **a priori probability**: $P(\omega_i)$ for each class $\omega_i$
  - (3) **unconditional distribution**: $p(x)$
- (4) "use Bayes rule if all of the classes $\omega_i$ are disjoint":
$$P(\omega_i\mid x)=\frac{p(x\mid\omega_i)\,P(\omega_i)}{p(x)}=\frac{p(x\mid\omega_i)\,P(\omega_i)}{\sum_{i=1,m}p(x\mid\omega_i)\,P(\omega_i)}$$
- (textbook context) Choose the class with the largest posterior. $p(x)$ is the same for every class, so comparing $p(x\mid\omega_i)P(\omega_i)$ is enough.
- Slide 44, Table 12.1 "Bayes classification of multispectral image data" (3 classes). (textbook context: in Gonzalez the classes are water, urban development and vegetation; each pixel's vector holds its values in several spectral bands.)

| Set | Class | No. of samples | into 1 | into 2 | into 3 | % correct |
|---|---|---|---|---|---|---|
| Training | 1 | 484 | **482** | 2 | 0 | 482/484 = 99.6 |
| Training | 2 | 933 | 0 | **885** | 48 | 885/933 = 94.9 |
| Training | 3 | 483 | 0 | 19 | **464** | 464/483 = 96.1 |
| Independent | 1 | 483 | **478** | 3 | 2 | 478/483 = 98.96, i.e. 99.0 (slide shows 98.9) |
| Independent | 2 | 932 | 0 | **880** | 52 | 880/932 = 94.4 |
| Independent | 3 | 482 | 0 | 16 | **466** | 466/482 = 96.7 |

  - % correct = diagonal / row total. Overall: training 1831/1900 = 96.37 %, independent 1824/1897 = 96.15 %. Accuracy on **independent** (unseen) patterns is the honest measure (generalization, slide 15). Classes 2 and 3 are confused most often (48 and 52 errors).
- Slide 45 (Fig. 12.2): a noisy object and its **signature** $r(\theta)$ (distance from the centre vs angle, $0$ to $2\pi$); the noise shows as small bumps on a flat line. Slide 46 (Fig. 12.4): satellite image of Washington, D.C. (downtown and residential areas, courtesy of NASA).

## Exam focus

1. **Draw the flowchart of a pattern recognition system (10 points).** Copy section 4: input -> sensing -> segmentation -> feature extraction -> classification -> post-processing -> decision (bottom to top), with **costs** -> post-processing, **adjustments for context** -> post-processing and classification, **adjustments for missing features** -> classification. Add one line per stage. Fish example: camera (sensing), isolate each fish (segmentation), measure lightness and width (feature extraction), salmon or sea bass (classification), shift the threshold because a sea bass in a salmon can costs more (post-processing with costs).
2. **Draw the design cycle.** start -> collect data -> choose features -> choose model -> train classifier -> evaluate classifier -> end; evaluation feeds back into the first four boxes; "prior knowledge (e.g., invariances)" -> choose features and choose model. Sixth topic: computational complexity.
3. **Nearest class mean (Euclidean).** Class A = {(1,1),(2,1),(1,2),(4,4)}, class B = {(6,6),(8,6),(7,8),(7,4)}. Means: $m_A=(2,2)$, $m_B=(7,6)$. Classify $x=(5,4)$:

| class | $x-m$ | squared sum | distance |
|---|---|---|---|
| A | (3, 2) | 9 + 4 = 13 | 3.606 |
| B | (-2, -2) | 4 + 4 = 8 | 2.828 -> **B** |

   Reject case: $x=(4,10)$ gives $d_A=8.246$, $d_B=5.0$. With a "close enough" threshold of 3, $x$ goes to the **reject class**.
4. **Nearest neighbor vs k-NN** on the same data, $x=(5,4)$. Distances to all samples: (4,4) A **1.000**; (7,4) B **2.000**; (6,6) B **2.236**; (8,6) B 3.606; (2,1) A 4.243; (1,2) A 4.472; (7,8) B 4.472; (1,1) A 5.000.
   - 1-NN -> **A** (the A outlier at (4,4)). 3-NN -> votes A, B, B -> **B**. Nearest mean -> **B**. With a single noisy sample 1-NN can disagree; k-NN and nearest mean outvote it.
   - Easy check: $x=(2,3)$ gives $d_A=1.0$, $d_B=5.831$, and 1-NN (1,2) at 1.414 -> A by every rule.
5. **Scaled distance (slide 40)**, made-up numbers: $X=(0.2,0.62)$; Class 2 mean (0.2, 0.8), $\sigma=(0.1,0.1)$; Class 3 mean (0.2, 0.35), $\sigma=(0.05,0.2)$. Unscaled: $d_2=0.18<d_3=0.27$ -> Class 2. Scaled: $d_2=0.18/0.1=1.8$, $d_3=0.27/0.2=1.35$ -> **Class 3** (the slide's conclusion).
6. **Bayes rule**, made-up numbers: salmon $P(\omega_1)=0.7$, sea bass $P(\omega_2)=0.3$; at the measured lightness $p(x\mid\omega_1)=0.2$, $p(x\mid\omega_2)=0.6$. $p(x)=0.7\cdot0.2+0.3\cdot0.6=0.14+0.18=0.32$. $P(\omega_1\mid x)=0.14/0.32=0.4375$, $P(\omega_2\mid x)=0.18/0.32=0.5625$ -> **sea bass**. With priors 0.9/0.1: $p(x)=0.24$, posteriors 0.75/0.25 -> salmon. A strong prior can override the likelihood.
7. **Iris boundary (slide 47)**: classify $x=(3,1)$ with $2.8x_1+1.0x_2-8.9$: $8.4+1.0-8.9=+0.5>0$ -> **versicolor** (agrees with distances 1.334 to the versicolor mean vs 1.655 to the setosa mean). $x=(2,0.5)$: $5.6+0.5-8.9=-2.8<0$ -> setosa.
8. **% correct from a confusion table (slide 44)**: diagonal / row total, e.g. $885/933=94.9\%$; overall = sum of diagonal / all samples.
9. **Definitions** worth quoting exactly: pattern, feature, pattern class (slide 3); supervised vs unsupervised (slide 28); statistical vs structural PR (slides 29-30); class, feature extractor, classifier, reject class (slides 31, 36); generalization (slide 15).
10. **Fish reasoning**: length is a poor feature alone (histograms overlap); lightness is better; moving $x^*$ toward smaller lightness lowers the cost of sea bass sold as salmon ("task of decision theory"); a boundary that is perfect on training data does not guarantee correct classification of novel input.
