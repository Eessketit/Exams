# Lecture 1 (Week 1): Introduction to Multimedia Computing

What this lecture is about: course logistics, what multimedia is (text, audio, still images, animation, video, interactivity), the parts of a multimedia system, a short history, and a tour of applications of image processing, computer vision and (graph) machine learning. Almost no formulas; the exam material is definitions, lists and classifications.

> Slide numbers = PDF page numbers (page 1 = title slide). Most of slides 18-66 are pictures with a one-line caption; only what is written or clearly drawn on them is reproduced here.

## 1. Course Logistics (slides 1-6)

- Instructor: Minhaz Uddin Ahmed, PhD, Dept. of Computer Engineering, Inha University in Tashkent (slide 1).
- Textbooks (slide 2): Li, Drew, Liu, *Fundamentals of Multimedia* 2nd ed. (Springer) = multimedia; Gonzalez and Woods, *Digital Image Processing* 4th ed. (Pearson) = image processing; Szeliski, *Computer Vision: Algorithms and Applications* (Springer) = computer vision. Reference (slide 67): Havaldar and Medioni, *Multimedia Systems: Algorithms, Standards, and Industry Practices*.
- Evaluation (slide 3):

| Item | Weight |
|---|---|
| Mid term exam | 30% |
| Final exam | 30% |
| Assignment | 15% |
| Quiz | 20% |
| Attendance + class activity | 5% + 10% |

- The weights as printed sum to **110%** (30+30+15+20+5+10); ask the professor which item is off.
- "Assignments are based on **python** programming" (slide 3, "python" highlighted in green).
- Syllabus (slides 4-6). **Midterm = Week 8, so Weeks 1-7 are examined at the midterm.**

| Week | Content |
|---|---|
| 1 | Introduction to Multimedia computing |
| 2 | Audio Analysis: nature of sound, waveform, digitization |
| 3 | Audio Analysis: audio processing, audio compression, perceptually based compression |
| 4 | Image data representation: fundamental, physics of image, intensity transformation |
| 5 | Color in image processing: color image processing, feature extraction, XYZ to RGB transform |
| 6 | Fundamental concepts in video: NTSC vs PAL, 3D camera model, video compression |
| 7 | Image Processing: image pattern classification |
| 8 | **Mid-Term Exam** |
| 9 | Computer Graphics: raster images, raster devices |
| 10 | Computer Graphics: basic ray-tracing algorithm, ray-object intersection |
| 11 | Computer Vision: applications, topics, recent research work |
| 12 | Computer Vision: Canny edge detector, Harris corner detector, feature matching/analysis |
| 13 | Computer Vision: stereo, model fitting, segmentation |
| 14 | Computer Vision: recognition, classification, generative AI in CV |
| 15 | Final Exam |
| 16 | Review Class |

## 2. What Multimedia Is (slides 7-9)

- Definition (slide 7, exact): "**Multimedia is media and contents that uses a combination of different content forms.**"
- "Multimedia includes a combination of": **Text, Audio, Still Images, Animation, Video, Interactivity content forms** (slide 7; "Animation Video" is printed on one bullet line).
- Slide 9 list of everyday examples (the slide comments only on 1, 2 and 7):

| # | Slide example | Slide comment | Multimedia? (textbook context: applying the slide-7 definition) |
|---|---|---|---|
| 1 | A PowerPoint presentation | "involve all types of media and have tools to make it interactive" | Yes |
| 2 | Playing a video game | "inherently interactive" | Yes |
| 3 | Describing a picture to your friend | none | No, one medium (speech), not a media system |
| 4 | Reading the newspaper in the morning | none | Borderline: text + still images, but static and not interactive |
| 5 | Videoconferencing | none | Yes (audio + video, interactive) |
| 6 | Watching television or listening to radio | none | TV yes, radio audio only |
| 7 | TV | "comprises audio and video, with **channel surfing as interactivity**" | Yes |

## 3. Components of a Multimedia System (slide 8)

Figure 1-2 "Components of a multimedia system today", three stages left to right:

| Stage | What is in it |
|---|---|
| Multimedia content creation | Media acquisition (camera, camcorder, microphone, graphics) into S/W and H/W assembly |
| Compression and media encoding | Encoding hardware, with **storage** (disks) attached |
| Distribution via networks | Media server, then satellite, cable, DSL modem, wireless; end devices: Wi-Fi hotspots, television, computer, game console, cell phone, PDA |

- Services feeding the media server: **advertising, digital rights management, subscriber management, watermarking, encryption**.

## 4. History of Multimedia (slides 10-11)

| Year | Event (slide wording) |
|---|---|
| 1877 | Thomas Alva **Edison's phonograph**, "the first device that was able to record and reproduce sound" (slide 10) |
| c. 1890 | Vintage dry-plate camera, E and H T Anthony model Champion (Fig. 1.1, slide 10) |
| 1967 | Nicholas **Negroponte** formed the Architecture Machine Group at MIT |
| 1969 | **Nelson and van Dam** at Brown University created an early hypertext editor called **FRESS**; its descendant is the Intermedia project (IRIS, Brown) |
| 1976 | MIT Architecture Machine Group proposed "Multiple Media", which resulted in the **Aspen Movie Map, the first videodisk, in 1978** |
| 1982 | The **Compact Disc (CD)** made commercially available by **Philips and Sony**, replacing analog magnetic tape for digital audio |

- Evolution of audio storage media, left to right (Fig. 1.3, slide 11): **Edison cylinder record, flat vinyl record, reel-to-reel magnetic tape, cassette tape, CD**.

## 5. The Media Types: Text, Hypermedia, Audio, Images, Video (slides 12-16)

- **Text** (slide 12): "the most widely used and flexible means of presenting information on screen and conveying ideas"; effective use of text can either direct the reader's attention or divert it.
- **Hypermedia** (slide 13): first introduced by **Ted Nelson**; went beyond text-only, includes graphics, images and especially the **continuous media, sound and video**, and links them together. "The **World Wide Web** is the best example of a hypermedia application."
- **Audio** (slide 14): refers to sound; audio songs, audio tracks in presentations, music players on phones; software examples VLC media player, Real player.
- **Images** (slide 15): a two-dimensional screen display, and also three-dimensional (statue, hologram); graphs, pie charts, paintings; formats **.jpg, .png, .gif**.
- **Video** (slide 16): "unedited material as it had been originally filmed by movie camera or recorded by a video camera"; adds a personal element other media lack; advantage: conveys "a great deal of information in the least amount of time".
- Details of digital audio: see Lecture 2 and Lecture 3; digital images: see Lecture 6.

## 6. Digital Image Processing: Why, Steps, Levels (slides 17-20)

- **Necessity of digital image processing** (slide 17), three reasons:
  1. Improvement of pictorial information for human perception
  2. Image processing for autonomous machine application
  3. Efficient storage and transmission
- **Fundamental steps** (slide 18, Gonzalez diagram), all connected to a central **Knowledge Base**, starting from the Problem Domain:
  - "Outputs of these processes generally are **images**": Image Acquisition, Image Enhancement, Image Restoration, Colour Image Processing, Wavelets and Multiresolution processing, Image Compression, Morphological Processing.
  - "Outputs of these processes generally are **image attributes**": Segmentation, Representation and Description, Object Recognition.
- **Levels of processing in computer vision** (slide 19):

| Level | Slide example |
|---|---|
| Low level | Noise removal, image sharpening (picture: noisy Lena vs cleaned) |
| Mid level | Object segmentation (street scenes with colour-coded segments) |
| High level | Scene understanding |

- Improvement for human perception (slide 20): noise filtering; content enhancement (contrast enhancement, deblurring); remote sensing.

## 7. Image Processing Applications (slides 21-34)

| Slide | Application | What is shown or stated |
|---|---|---|
| 21 | Image enhancement | Low contrast aerial image vs enhanced; chest X-ray enhanced (see Lecture 9) |
| 22 | Thresholding | Grayscale apple turned into a two-level (object vs background) image (see Lecture 9) |
| 23 | Edge detection | Demo windows "img" (colour shapes) to "grayimg" to "binaryimg" with white shape outlines (see Lecture 11) |
| 24 | Imaging in astronomy | Nebula NGC 1514 in visible (left) and infrared (right) |
| 25 | Ultrasound imaging | Sonography "uses high-frequency sound waves to produce dynamic visual images of organs, tissues or blood flow"; based on sonar |
| 26 | Industrial inspection | "Human operators are expensive, slow and unreliable"; "Make machines do the job instead" |
| 27 | X-Ray imaging (medical) | Picture shows axial head scans (CT, which is X-ray based: textbook context) |
| 28 | Law enforcement | Car number plate recognition, fingerprint enhancement |
| 29 | PCB inspection | Machine inspection checks "all components are present and all solder joints are acceptable"; both conventional and x-ray imaging |
| 30 | Special effects | Artistic effects for visual appeal, special effects, composite images |
| 31 | Remote sensing | Satellite image (false colour) |
| 32 | Use of histogram | "Histograms can be used to characterize the image's content and to detect specific objects or textures" (see Lecture 9) |
| 33 | Track colour object | Demo "CamShiftDemo" tracks a red circle with a hue histogram window |
| 34 | Detected face | Face detection boxes on a grid of face images |

## 8. Motion Detection (slides 35-38)

- Definition (slide 35): "**Action of sensing physical movement in a given area**"; motion can be detected by measuring change in speed or vector of an object.
- Goals (slide 36): identify moving objects; detect unusual activity patterns; compute trajectories of moving objects.
- Applications (slide 36): indoor/outdoor security, real time crime detection, traffic monitoring. "Many intelligent video analysis systems are based on motion detection."
- **Two popular approaches** (slide 37, both titles in red):

| Approach | What it does |
|---|---|
| A. **Change detection** | Detect objects within a scene; track object across a number of frames |
| B. **Optical flow** | Compute motion within region or the frame as a whole |

- Slide 38: input video (people walking) to detected motion (moving blobs circled).

## 9. Computer Vision, Faces and Human Action Recognition (slides 39-47)

- **Computer vision** (slide 39, exact): "a field of computer science that works on enabling computers to see, identify and process images in the same way that human vision does and then provide appropriate output."
- **Facial expression recognition** (slides 40-41; "face expression recognition in wild", ITLab face dataset):
  - Applications: HCI (human computer interaction), identity confirmation, person's emotion recognition, different access control.
  - Challenges: face dissimilarity in **pose, ages, lighting condition, occlusion and face motion**.
- **Human action** (slide 42): human physical body movement (running, walking, reading); interaction with the environment or an object for a specific purpose (using a computer, taking a photograph).
- **Applications of HAR** (slide 43): security surveillance (airport, bus station); content-based browsing (fast-forward to the next goal scoring scene); helping elderly people; video recycling (eliminating harmful video content from children).
- **Challenges for HAR** (slide 44): variation in pose, complex background, object scale, occlusion, camera motion, large number of unlabeled data, easy to misinterpret the action.
- **Traditional methods** (slide 45): hand-crafted space-time features.
  - **HOG** = histograms of **oriented gradient**, with **4 gradient orientation bins**; **HOF** = histograms of **optic flow**, with **4 OF direction bins + 1 bin for no motion**.
  - About $10^7$ cuboid features, choosing $10^3$ randomly.
  - Challenges: rely on human domain knowledge much more than data; feature design is separate from training the classifier; hand-crafted features with many parameters are hard to tune manually; developing features for new applications is slow.
- **Deep learning approach** (slide 46): learn transformations of the data that make it easier to extract useful information when building classifiers; jointly learning feature transformations and classifiers makes their integration optimal; learn a huge number of parameters; make better use of large data; faster to get feature representations for new applications.
- Neuron model on slide 46 (inputs $x_1,x_2,x_3$, weights $w_1,w_2,w_3$, output $g(\mathbf{x})$):

$$g(\mathbf{x}) = f\Big(\sum_{i=1}^{d} x_i w_i + w_0\Big) = f(\mathbf{w}^t\mathbf{x})$$

- The plotted activation $f(net)$ is S-shaped from $-1$ to $+1$, i.e. tanh-like. The second form treats $w_0$ as a weight on a constant input $x_0 = 1$ (textbook context).
- Slide 47: pose-skeleton action recognition; Microsoft Kinect "can sense the user's position and gestures", so the data view is adjusted by "body language", without a mouse or keyboard.

## 10. Other Computer Vision Applications (slides 48-53)

- Self-driving cars; robotic surgery and medical diagnosis (slide 48).
- Robots that navigate our cluttered world: robotic chefs, farmers, assistants (slide 49).
- Intelligent surveillance and drones; indoor navigation (slide 50).
- Creation of art (style transfer onto the Eiffel Tower photo); social and fun applications such as Instagram filters (slide 51).
- 3D reconstruction (slide 52); augmented reality (slide 53).

## 11. Machine Learning Setup (slides 54-55)

- Slide 54, "a model for how a viewer rates a movie": a **viewer** vector (likes comedy? likes action? prefers blockbusters? likes Tom Cruise?) is matched with a **movie** vector (comedy content, action content, blockbuster?, Tom Cruise in it?); "add contributions from each factor" gives the **predicted rating**.
- Slide 55, "basic setup of the learning problem" (credit approval example):

| Box | Symbol | Credit example |
|---|---|---|
| Unknown target function | $f: \mathcal{X} \to \mathcal{Y}$ | ideal credit approval formula |
| Training examples | $(\mathbf{x}_1,y_1),\dots,(\mathbf{x}_N,y_N)$ | historical records of credit customers |
| Hypothesis set | $\mathcal{H}$ | set of candidate formulas |
| Learning algorithm | $\mathcal{A}$ | takes the examples and $\mathcal{H}$ |
| Final hypothesis | $g \approx f$ | learned credit approval formula |

## 12. Graph ML Tasks (slides 56-66)

- Levels (slide 56): **node level, edge level, community (subgraph) level, graph level** (graph-level prediction, graph generation).
- Task definitions (slide 57, exact):
  - **Node classification**: predict a property of a node. Example: categorize online users / items.
  - **Link prediction**: predict whether there are missing links between two nodes. Example: knowledge graph completion.
  - **Graph classification**: categorize different graphs. Example: molecule property prediction.
  - **Clustering**: detect if nodes form a community. Example: social circle detection.
  - Other: **graph generation** (drug discovery), **graph evolution** (physical simulation).
- Examples and the level the slides put them at:

| Slides | Example | Level on slide | Nodes and edges |
|---|---|---|---|
| 58-59 | Protein folding: "computationally predict a protein's 3D structure based solely on its amino acid sequence" | Node level | amino acids form alpha helix and pleated sheet, then the full 3D structure |
| 60 | Recommender system: goal "recommend items users might like" | Edge level | nodes: users and items; edges: user-item interactions |
| 61 | Drug side effect: "given a pair of drugs predict adverse side effects" | Edge level | drug pair to side effects (30% prob., 65% prob.) |
| 62 | Bio-medical graph link prediction | Edge level | nodes: drugs and proteins; edges: interactions |
| 63-65 | Traffic prediction (Tashkent map, Google Maps) | Subgraph level | nodes: road segments; edges: connectivity between road segments; prediction: ETA |
| 66 | Drug discovery: "antibiotics are small molecular graphs" | Graph level | nodes: atoms; edges: chemical bonds |

- Slide 58 steps: amino acids bonded together, then local shapes (helices, sheets), then the full 3D protein, then interaction with other proteins. Slide 59 results: T1037/6vr4 **90.7 GDT** (RNA polymerase domain), T1049/6y4f **93.3 GDT** (adhesin tip); green = experimental, blue = computational prediction (DeepMind).
- Slide 61 facts: "46% of people ages 70-79 take more than 5 drugs"; many patients take more than 20 drugs (heart disease, depression, insomnia).
- Slide 62 query: "How likely will **Simvastatin and Ciprofloxacin**, when taken together, break down muscle tissue?" Legend: $r_1$ gastrointestinal bleed side effect, $r_2$ bradycardia side effect.
- Slide 65 pipeline, "Predicting Time of Arrival with Graph Neural Networks": anonymised travel data, analysed into supersegments, training data, graph neural network, predictions, routes ranked by ETA (with candidate user routes A to B from the Google Maps routing system), surfaced to the Google Maps API and app. "Used in Google Maps."

## Exam focus

1. **Define multimedia and list its content forms** (slide 7). Answer: "media and contents that uses a combination of different content forms": text, audio, still images, animation, video, interactivity. Mini example: a recorded lecture with slides = video + audio + text; adding an in-player quiz adds interactivity.
2. **Which slide-9 items are multimedia, and why?** PowerPoint (all media + interactive tools), video game (inherently interactive), videoconferencing, TV ("channel surfing as interactivity"): yes. Describing a picture, radio: one medium. Newspaper: text + images but no interactivity.
3. **Three stages of a multimedia system** (slide 8): content creation, then compression and media encoding (with storage), then distribution via networks (media server, satellite, cable, DSL, wireless). Server services: advertising, DRM, subscriber management, watermarking, encryption.
4. **History dates** (slides 10-11). Order of audio media: cylinder, vinyl, reel-to-reel tape, cassette, CD. Phonograph 1877 to CD 1982 = $1982-1877 = 105$ years. Aspen Movie Map (first videodisk) 1978, 2 years after the 1976 "Multiple Media" proposal.
5. **Hypermedia**: Ted Nelson; links text with graphics, images and continuous media (sound, video); best example = the WWW.
6. **Why digital image processing?** Better pictures for human perception, autonomous machine applications, efficient storage and transmission. **Classify by level** (slide 19): denoising = low; segmenting pedestrians = mid; "describe this street scene" = high.
7. **Fundamental steps of DIP** (slide 18): acquisition, enhancement, restoration, colour, wavelets, compression, morphology output **images**; segmentation, representation and description, object recognition output **image attributes**; all linked to the knowledge base.
8. **Two motion detection approaches** (slide 37): change detection (detect objects, track them across frames) vs optical flow (motion within a region or the whole frame).
9. **Compute the neuron output** (slide 46). Example: $\mathbf{x}=(1,2,-1)$, $\mathbf{w}=(0.5,-0.25,1)$, $w_0=0.1$.

| Step | Value |
|---|---|
| $x_1w_1 + x_2w_2 + x_3w_3$ | $0.5 - 0.5 - 1 = -1.0$ |
| $net = \sum x_i w_i + w_0$ | $-1.0 + 0.1 = -0.9$ |
| Same with $\mathbf{w}^t\mathbf{x}$, $\mathbf{x}=(1,1,2,-1)$, $\mathbf{w}=(0.1,0.5,-0.25,1)$ | $-0.9$ |
| $g = \tanh(-0.9)$ (range $-1$ to $1$, as plotted) | $-0.7163$ |

10. **HOG vs HOF** (slide 45): HOG uses 4 gradient-orientation bins; HOF uses $4 + 1 = 5$ bins (4 directions + no motion). Sampling $10^3$ of about $10^7$ cuboids keeps $10^3/10^7 = 10^{-4}$ (0.01%) of them. Also know the 4 drawbacks of hand-crafted features vs the 5 benefits of deep learning.
11. **Learning setup** (slide 55): name the five boxes: target $f: \mathcal{X}\to\mathcal{Y}$, training data $(\mathbf{x}_n,y_n)$, hypothesis set $\mathcal{H}$, algorithm $\mathcal{A}$, final hypothesis $g\approx f$. Slide-54 rating = sum of factor contributions; toy example (textbook context): viewer $(1,3,2,0)$, movie $(0,2,1,1)$ gives $0+6+2+0 = 8$.
12. **Map an application to a graph task level** (slides 56-66): protein folding = node; recommender, drug side effects, drug-protein links = edge; traffic ETA = subgraph; antibiotic molecules = graph. Road graph on slide 64: 8 nodes (road segments), 7 edges (a tree), path A to B passes 6 segments; ETA is the predicted output.
13. **Challenges lists**: face expression recognition (pose, age, lighting, occlusion, face motion); HAR (pose, complex background, object scale, occlusion, camera motion, many unlabeled data, misinterpretation).
