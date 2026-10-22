# Lecture 2 (Week 1): Sound, Analog to Digital Conversion, Signals and Systems, Sampling Theorem and Aliasing

What this lecture is about: what sound is, how an analog signal becomes digital (sampling in time, quantization in amplitude, the resulting bit rate), the signal-processing basics behind it (sine-wave parameters, LTI systems, convolution, useful signals, Fourier transform), and the Nyquist sampling theorem with aliasing in space and time. Sources (slide 56): Havaldar and Medioni, *Multimedia Systems: Algorithms, Standards, and Industry Practices* (Ch. 2, figure numbers "2-x"); Li, Drew, Liu, *Fundamentals of Multimedia* 2nd ed. (figures "6.x").

> Slide numbers = PDF page numbers (page 1 = title slide). "Highlighted" = coloured text on the slide (the professor's emphasis). Contents slide (2) lists the sections 2.1 Sampling, 2.2 Quantization, 2.3 Bit Rate (typed "Bit Rat"), 3.1-3.4 Signals and Systems, 4.1-4.2 Aliasing.

## 1. What is Sound (slides 3-4)

- "Sound is a **wave phenomenon** like light, but it is **macroscopic** and involves **molecules of air being compressed and expanded** under the action of some physical device."
- A speaker vibrates back and forth and produces a **longitudinal pressure wave** that we perceive as sound. "Without air there is no sound" (example: in space).
- Being a pressure wave, sound takes **continuous values**, as opposed to digitized ones with a finite range.
- Highlighted: although longitudinal, sound has ordinary wave behaviour: **reflection (bouncing)**, **refraction** (change of angle when entering a medium with a different density), **diffraction** (bending around an obstacle). This makes **"surround sound"** possible.
- Sound is measurable pressure at any 3D point, so it is detected with a **transducer** that converts **pressure to voltage levels**.

## 2. Digital Data Acquisition, Analog vs Digital Signals (slides 5-11)

- Multimedia systems have **three major components** (slide 5): a) multimedia **content creation**, b) **compression/storage**, c) **delivery or distribution**.
- Content creation = recording each medium into digital form so heterogeneous media are easy to combine. Digitizing is **1D (audio)**, **2D (images)**, **3D (video)** (slide 6).
- **Analog** signal: can be represented by a **continuous function** (e.g. amplitude vs an input dimension). **Digital** signal: a **discrete set of values** defined at specific (most often regular) instances of the input domain: time, space, or both (slide 7; Fig. 2-1, slide 8).
- Periodic analog signals are **simple** (a sine wave, cannot be decomposed) or **composite** (made of multiple sine waves); signals can also be periodic or nonperiodic (slide 10).
- Advantages of digital over analog (slides 9, 11):
  - Complex, interactive content; easy access to a pixel, a region, or a section of a sound track; per-region operations (enhance image quality, remove noise).
  - Stored digital signals **do not degrade over time or distance**; analog example: **ghosting** on broadcast VHS video, tapes degrade with repeated use.
  - Efficient **compression and transmission** (digital cable, video on demand; passive: DVD).
  - Easy storage on magnetic (hard drive) or solid-state media (flash, memory cards): all data types are just binary values.
  - Better quality and higher fidelity; compressed, distributed, stored, retrieved easily.

## 3. Building Complex Signals and the Digitization Process (slides 12-15)

- Fig. 6.1 (slide 12): a complex signal is built by superposing sinusoids: fundamental, $+0.5\times(2\times$fundamental$)$, $+0.33\times(3\times$fundamental$)$, $+0.25\times(4\times$fundamental$)$, $+0.5\times(5\times$fundamental$)$.
- Definition (slide 12): "using measurements only at **evenly spaced time intervals** is simply called **sampling**, and the rate at which it is performed is called the **sampling frequency**."
- Typical audio sampling rates: **8 kHz** (8,000 samples per second) **to 48 kHz**. Human hearing: about **20 Hz to 20 kHz** (above = ultrasound). Human voice reaches approximately **4 kHz** (slide 13).
- Fig. 6.3 (slide 14): (a) **sampling** = sampling the analog signal in the **time** dimension; (b) **quantization** = sampling the analog signal in the **amplitude** dimension.
- A/D conversion = **sampling + quantization**. The reverse, digital to analog, is called **interpolation**. Most desirable property: **no artifacts** in the digital data, so the signal converted back looks the same as the original (slide 15).

## 4. Sine Wave Parameters: Amplitude, Frequency, Period, Phase, Wavelength (slides 16-18, 21-26)

- **Peak amplitude (A)**: maximum strength of signal, in **volts**. **Frequency (f)**: rate of change of signal, **Hertz (Hz)** or cycles per second. **Period (T)**: time for one repetition. **Phase ($\phi$)**: relative position in time (slide 16).
- Frequency and period are inverses (slide 21):

$$f = \frac{1}{T} \qquad T = \frac{1}{f}$$

- Slide 18 example: 12 periods in 1 s means **12 Hz**, period $\frac{1}{12}$ s (83.3 ms); 6 periods in 1 s means **6 Hz**, period $\frac{1}{6}$ s (166.7 ms). Slide 17: same phase and frequency, different peak amplitudes.
- Units table (slide 21): s, ms $10^{-3}$, $\mu$s $10^{-6}$, ns $10^{-9}$, ps $10^{-12}$; Hz, kHz $10^{3}$, MHz $10^{6}$, GHz $10^{9}$, THz $10^{12}$.
- Wording (slides 22-23): frequency is the rate of change with respect to time; change in a short span of time = **high** frequency, over a long span = **low** frequency. **No change at all: frequency is zero. Instantaneous change: frequency is infinite.** Phase describes the position of the waveform relative to time 0.
- Phase (slide 24): **0 degrees**; **90 degrees = $\pi/2$ rad** (wave shifted by $\frac14 T$); **180 degrees = $\pi$ rad** (shifted by $\frac12 T$). Phase unit: degree (360 degrees) or radians ($2\pi$ rad).
- Wavelength $\lambda$ (slides 25-26): distance occupied by one cycle, i.e. the distance a simple signal travels in one period; measured between two points of corresponding phase in two consecutive cycles. With signal velocity $v$: $\lambda = vT$ ($= v/f$). Unit: **meter (m)**.
  - (textbook context) sound in air $v \approx 343$ m/s: 1 kHz gives $\lambda = 0.343$ m; 20 Hz gives 17.15 m; 20 kHz gives 1.7 cm.

## 5. Sampling (slides 19-20)

- Start from a 1D analog signal $x(t)$ in the time domain. The **sampled signal** (slide 19):

$$x_s(n) = x(nT), \quad T = \text{sampling period}, \quad f = 1/T = \text{sampling frequency}$$

- Fig. 2-2: analog signal, then samples (A/D), then interpolation back to analog (D/A).
- Sampling dimensions (slide 20): **1D** time (sound); **2D** spatial x, y (images); **3D** x, y, time (video) or x, y, z (3D ranges). "**Practical sampling involves averaging**, either in time or space."
- Worked example (verified): $x(t) = \sin(2\pi \cdot 1000\,t)$, $f = 8$ kHz, so $T = 1/8000 = 125\ \mu$s, 8 samples per cycle. Sample $n$ sits at time $t = nT$ (this is the time axis for a waveform plot).

| n | $t = nT$ | $x_s(n) = \sin(2\pi \cdot 1000 \cdot nT)$ |
|---|---|---|
| 0 | 0 $\mu$s | 0.0000 |
| 1 | 125 $\mu$s | 0.7071 |
| 2 | 250 $\mu$s | 1.0000 |
| 3 | 375 $\mu$s | 0.7071 |
| 4 | 500 $\mu$s | 0.0000 |
| 5 | 625 $\mu$s | -0.7071 |
| 6 | 750 $\mu$s | -1.0000 |
| 7 | 875 $\mu$s | -0.7071 |

## 6. Time Domain vs Frequency Domain (slides 27-28)

- A complete sine wave in the time domain = **one single spike** in the frequency domain. Slide 27: peak value **5 V**, frequency **6 Hz** becomes a spike of height 5 at 6 Hz.
- Highlighted: "**The frequency domain is more compact and useful when we are dealing with more than one sine wave.**" Slide 28: three sine waves with frequencies **0, 8, 16 Hz** and amplitudes **15, 10, 5** are three spikes (0 Hz = a constant level of 15). Verified with an FFT of $15 + 10\sin(2\pi 8t) + 5\sin(2\pi 16t)$: amplitudes 15, 10, 5 at 0, 8, 16 Hz.

## 7. Quantization (slides 29-33)

- Definition (slide 29): "Quantization deals with encoding the signal value at every sampled location with a **predefined precision, defined by a number of levels**." The entire range $R$ of the signal is represented by a finite number of bits $b$:

$$x_q(n) = Q[x_s(n)], \quad Q = \text{rounding function}$$

- $Q$ maps the continuous value $x_s(n)$ to the **nearest digital value using $b$ bits**. $b$ bits give

$$N = 2^b \text{ levels}, \qquad \text{quantization step } \delta = \frac{R}{2^b}$$

- Note the professor's form: step $= R/2^b$ (not $R/(2^b-1)$).
- Fig. 2-3 (slide 30): same sampling, quantized with **8 bits (256 levels), 4 bits (16 levels), 3 bits (8 levels)**. Slide 31's text says "4 or 2" bits; the figure caption (8, 4, 3) is the consistent one.
- Each sample has finitely many bits, so the quantized value **always introduces an error** (slide 31). How many bits depends on signal type and use. Highlighted: "**Audio signals, which represent music, must be quantized on 16 bits, whereas speech only requires 8 bits.**"
- **Uniform (linear) quantization**: output range divided into fixed, uniformly separated intervals; works well when all values are **equally likely**, so the quantization error is equally distributed (slide 31).
- Fig. 2-4 (slide 32): an 8-bit image re-quantized to 6, 5, 4, 3, 2, 1 bits per pixel; few bits give visible flat bands of grey, 1 bit is pure black and white.
- Fig. 2-5 (slide 33): **nonlinear quantization**: original (left), linear quantization (centre), **logarithmically quantized interval scale** (right). (textbook context) log scale = finer steps for small amplitudes; mu-law and A-law and SQNR: see Lecture 3.
- Worked example (verified): $R = 0$ to $8$ V, $b = 3$, $N = 8$ levels, $\delta = 8/2^3 = 1$ V; round to nearest level. (textbook context) max rounding error $= \delta/2 = 0.5$ V.

| Sample $x_s(n)$ (V) | $x_s/\delta$ | $x_q(n)$ (V) | 3-bit code | Error (V) |
|---|---|---|---|---|
| 0.2 | 0.2 | 0 | 000 | 0.2 |
| 2.6 | 2.6 | 3 | 011 | 0.4 |
| 5.3 | 5.3 | 5 | 101 | 0.3 |
| 6.8 | 6.8 | 7 | 111 | 0.2 |
| 3.9 | 3.9 | 4 | 100 | 0.1 |

| $b$ (bits) | 1 | 2 | 3 | 4 | 8 | 16 |
|---|---|---|---|---|---|---|
| Levels $2^b$ | 2 | 4 | 8 | 16 | 256 | 65,536 |
| $\delta$ for $R = 2$ V | 1 | 0.5 | 0.25 | 0.125 | 0.0078 | 0.0000305 |

## 8. Bit Rate (slides 34-35)

- Definition (slide 34): "the **number of bits being produced per second**"; critical for storing a digital signal or transmitting it over networks with high, low or varying bandwidth. Measured in **bits per second**:

$$\text{Bit rate} = \frac{\text{Bits}}{\text{Second}} = \frac{\text{Samples produced}}{\text{Second}} \times \frac{\text{Bits}}{\text{Sample}} = \text{Sampling rate} \times \text{Quantization bits per sample}$$

- The stereo rows of Fig. 2-6 are exactly 2x the mono rows, so with channels: bit rate $= f_s \times b \times \text{channels}$. For images the table gives **bits per frame** = width x height x bits per pixel.
- Fig. 2-6 (slide 35), every row recomputed (k = 1000, M = $10^6$):

| Signal | Sampling rate | Quantization | Computation | Bit rate (slide) |
|---|---|---|---|---|
| Speech | 8 kHz | 8 bits/sample | 8000 x 8 = 64,000 | 64 Kbps |
| Audio CD | 44.1 kHz | 16 bits/sample | 44,100 x 16 = 705,600; x 2 = 1,411,200 | 706 Kbps (mono), 1.4 Mbps (stereo) |
| Teleconferencing | 16 kHz | 16 bits/sample | 16,000 x 16 = 256,000 | 256 Kbps |
| AM Radio | 11 kHz | 8 bits/sample | 11,000 x 8 = 88,000 | 88 Kbps |
| FM Radio | 22 kHz | 16 bits/sample | 22,000 x 16 = 352,000; x 2 = 704,000 | 352 Kbps (mono), 704 Kbps (stereo) |
| NTSC TV image frame | "Width 486, Height 720" | 16 bits/sample | 486 x 720 x 16 = 5,598,720 | 5.6 Mbits per frame |
| HDTV (1080i) | Width 1920, Height 1080 | 12 bits/pixel on average | 1920 x 1080 x 12 = 24,883,200 | 24.88 Mbits per frame |

- All slide values check out (rounded). (textbook context) NTSC is really 720 wide x 486 high; the slide swaps the labels, the product is the same.

## 9. Signals and Systems: Signal Properties (slides 36-37)

- Fig. 2-7: continuous and smooth (**sinusoid**); continuous but not smooth (**saw tooth**); neither smooth nor continuous (**step edge**); **finite support**; **periodic**. Real signals combine several properties.
- **Symmetric**: **odd** ($y = \sin(x)$) or **even** ($y = \cos(x)$); any signal = sum of an odd and an even part.
- **Finite support**: defined for a finite interval and zero outside it.
- **Periodic**: period $T$ if $f(x + T) = f(x)$. For any $f(t)$ a periodic version is $g(t) = \sum_k f(t - kT)$.

## 10. Linear Time Invariant Systems (slides 38-41)

- "Any operation that transforms a signal is called a **system**." LTI theory explains how practical systems sample and digitize (slide 38).
- **Linearity** (slide 38), system maps $x(t) \to y(t)$:

$$\text{If } x(t) = c_1x_1(t) + c_2x_2(t) \text{ then } y(t) = c_1y_1(t) + c_2y_2(t)$$

  where $y_k(t)$ is the sole output resulting from $x_k(t)$. (textbook context) time invariant: input delayed by $t_0$ gives the same output delayed by $t_0$.
- **Convolution** $f*g$ (slide 39): "the integral of the first signal multiplied with the other signal **reversed and shifted**":

$$(f*g)(t) = \int_{-\infty}^{\infty} f(\tau)\,g(t-\tau)\,d\tau = \int_{-\infty}^{\infty} f(t-\tau)\,g(\tau)\,d\tau$$

- (textbook context) discrete analogue: $[1,2,3]*[1,1] = [1,3,5,3]$. Image convolution kernels: see Lecture 11.
- Fundamental results (slides 40-41): any LTI system is **fully characterized by its impulse response** $h(t)$; output = **convolution of input with impulse response** (the **time domain** point of view). Frequency domain: the **transfer function is the Fourier transform of the impulse response**.
- Fig. 2-8 (slide 41): $x(t) \to h(t) \to y(t) = h(t) * x(t)$; Fourier transform each: $X(s) \to H(s) \to Y(s) = H(s) \times X(s)$; inverse Fourier transform of $Y(s)$ gives $y(t)$. So **convolution in time = multiplication in frequency**.

## 11. Useful Signals (slides 42, 44)

- Delta, box, step functions matter for **sampling, filtering, convolution** (slide 42).
- **Dirac delta** $\delta(x)$ (introduced by physicist **Paul Dirac**): a sharp peak bounding a unit area; zero everywhere except at $x = 0$ where it is infinite; its integral is 1.
- Fig. 2-9 (slide 44):
  - **Comb**: $\Delta_T(t) \stackrel{\text{def}}{=} \sum_{k=-\infty}^{\infty} \delta(t - kT)$ (a train of impulses every $T$: the sampling pattern).
  - **Step**: $H(x) = \int_{-\infty}^{x} \delta(t)\,dt$.
  - **Box**: rect$(t) = \Pi(t)$ below.
  - **Sinc**: $\mathrm{Sa}(x) = \mathrm{sinc}(x) = \dfrac{\sin(\pi x)}{\pi x}$; sinc(0) = 1, zero at every nonzero integer.

$$\mathrm{rect}(t) = \Pi(t) = \begin{cases} 0 & \text{if } |t| > \tfrac12 \\ \tfrac12 & \text{if } |t| = \tfrac12 \\ 1 & \text{if } |t| < \tfrac12 \end{cases}$$

## 12. The Fourier Transform (slides 43, 49)

- Due to **Joseph Fourier (1768-1830)**, initial results published **1807**.
- Highlighted: "Fourier proposed to represent **any periodic, continuous signal as a sum of individual complex sinusoids** (a **Fourier series expansion**)." That is, a weighted combination of sine and cosine waves; the weights are the **Fourier series coefficients**, or **spectral components**.
- Fig. 2-11 (slide 49): two signals $x_1(t)$, $x_2(t)$ and their Fourier transforms, which "show the **amount of energy at all frequencies**". Each has just one frequency (one spike); $x_1$'s is lower than $x_2$'s.

## 13. Sampling Theorem and Nyquist (slides 45-50)

- Fig. 2-10 (slides 45-46): constant signal (zero frequency) needs **one sample**; a straight ramp needs **two**; a wiggly signal needs many. More frequency content means more samples.
- History (slide 47): established in the **late 1920s by Henry Nyquist**, formalized by **Claude Shannon in 1950** (slide's date).
- Highlighted rule: sample at a frequency **greater than twice the maximal frequency occurring in the signal**:

$$f_s > 2 f_{max}$$

- Formal statement (slide 48): 1. A bandlimited signal $f(t)$ with max frequency $\omega_F$ is fully determined from its samples $f(nT)$ if $2\pi/T > 2\omega_F$ (angular form of $f_s > 2f_{max}$). 2. The continuous signal can be reconstructed from $f(nT)$ by convolution with the filter $r(t) = \mathrm{sinc}(\omega_F(t - nT)/2\pi)$.
- Slide example: max frequency **10 kHz**, sample at **more than 20 kHz**; "20 kHz is known as the **Nyquist sampling frequency** for that signal".
- Terminology trap: the professor's "Nyquist frequency" (slides 48, 50-51) = $2f_{max}$, the minimum sampling rate. (textbook context) Many books call that the Nyquist *rate* and use "Nyquist frequency" for $f_s/2$; in this course's exam use the slide's meaning and say which one you mean.
- Links to slide numbers: voice about 4 kHz gives 8 kHz (speech row of Fig. 2-6); hearing up to 20 kHz needs more than 40 kHz (CD 44.1 kHz).
- **Oversampling** ($f_s$ higher than the Nyquist frequency), slide 50: "**nothing special**": all needed frequencies are present and the same signal is reproduced, **but** more digital data than necessary, which increases **storage and transmission overhead**.

## 14. Aliasing: Undersampling, Spatial and Temporal (slides 51-55)

- $f_s$ **lower** than the Nyquist frequency (slide 51): not all frequency content is captured; when heard, viewed or converted back to analog, the signal no longer matches the original.
- Highlighted definition: "**Aliasing is the term used to describe loss of information during digitization.**"
- (textbook context, Li and Drew Ch. 6) the false (alias) frequency is the distance from $f$ to the nearest multiple of $f_s$; for $f_s/2 < f < f_s$: $f_{alias} = f_s - f$. Examples (verified): 6 kHz sampled at 8 kHz appears as 2 kHz; 15 kHz at 22.05 kHz appears as 7.05 kHz; 1 kHz at 1.5 kHz appears as 0.5 kHz.
- **Spatial aliasing** (slides 52-54), "seen in all dimensions". 1D figure "Undersampling": original signal, sampled points, and a **reconstructed signal of much lower frequency**. 2D (Fig. 2-12): original image **750 samples in x and 620 in y**; reconstructions at reduced sampling resolution in both directions look blocky because not all original frequencies are captured. Image resampling: see Lecture 6.
- **Temporal aliasing** (slide 55): western movies, **stagecoach wheels** first rotate forward, then as the coach speeds up appear to rotate in the **opposite direction**. Highlighted: "This occurs because the movie camera has **under sampled** the wheels' motion." (textbook context) a spoke pattern repeating 23 times per second filmed at 24 frames/s appears to turn backwards once per second.

## 15. Halving the Sample Rate, Homework Link (slides 19, 34, 47-51)

Applying the slides' formulas to "reduce the sample rate by 2" (e.g. keeping every second sample, $x'(n) = x_s(2n)$, so $T' = 2T$, $f_s' = f_s/2$). Example: 44.1 kHz, 16-bit, stereo WAV, 10 s (verified):

| Quantity | Original | After halving | Slide basis |
|---|---|---|---|
| Sampling frequency $f = 1/T$ | 44,100 Hz | 22,050 Hz | slide 19 |
| Sampling period $T$ | 22.68 $\mu$s | 45.35 $\mu$s | slide 21 |
| Highest frequency captured ($f_{max} < f_s/2$ from $f_s > 2f_{max}$) | < 22.05 kHz | < 11.025 kHz | slides 47-48 |
| Bit rate $f_s \times b \times$ channels | 1,411,200 bps | 705,600 bps | slide 34 |
| Data for 10 s (bit rate x 10 / 8) | 1,764,000 bytes | 882,000 bytes | slide 34 |
| Quantization (bits per sample) | 16 | 16 (unchanged) | slide 29 |

- Content between 11.025 and 22.05 kHz is now **undersampled**, so it **aliases** (slide 51): verified, a 15 kHz tone in a 44.1 kHz file appears at **7.05 kHz** after dropping every second sample; a 5 kHz tone stays at 5 kHz.
- (textbook context) To avoid aliasing, low-pass filter below the new $f_s/2$ before dropping samples (band-limiting filter, see Lecture 3); `scipy.signal.decimate` or `resample_poly(x, 1, 2)` do this. Write the new rate into the WAV header: same duration, half the file size. Playing the halved data at the old 44.1 kHz rate would last half as long and sound one octave higher.
- Waveform plot: time axis $t = nT = n/f_s$ (slide 19); after halving, use the new $f_s$.

## Exam focus

All numbers below verified in Python (`/home/claude/work/agents/L2/verify.py`).

1. **Definitions to reproduce.** Sampling = sampling in time; quantization = sampling in amplitude; A/D = sampling + quantization; D/A = interpolation; aliasing = loss of information during digitization; transfer function = Fourier transform of impulse response; Dirac delta (zero except at 0, integral 1); spectral components = Fourier series coefficients.
2. **Period, frequency, phase.** 12 Hz: $T = 1/12$ s = 83.3 ms. $T = 5$ ms: $f = 200$ Hz. 90 degrees = $\pi/2$ = 1.5708 rad = shift of $T/4$ (6 Hz: 41.7 ms); 180 degrees = $\pi$ rad = $T/2$.
3. **Minimum sampling rate (Nyquist).** $f_{max} = 10$ kHz: sample at more than 20 kHz (20 kHz = Nyquist sampling frequency). Voice 4 kHz: 8 kHz. Hearing 20 kHz: more than 40 kHz (CD 44.1). Slide 28 signal (0, 8, 16 Hz): more than 32 Hz.
4. **Alias frequency (textbook context).** 6 kHz at $f_s = 8$ kHz: $8 - 6 = 2$ kHz. 15 kHz at 22.05 kHz: 7.05 kHz. Stagecoach: 23 Hz pattern at 24 frames/s: 1 Hz, backwards.
5. **Quantization levels and step.** $b = 3$: $2^3 = 8$ levels; $R = 8$ V: $\delta = 8/2^3 = 1$ V, max rounding error 0.5 V. 8 bits: 256 levels; 16 bits: 65,536. Music 16 bits, speech 8 bits.
6. **Bit rate from the table.** Teleconferencing $16{,}000 \times 16 = 256$ kbps; CD stereo $44{,}100 \times 16 \times 2 = 1{,}411{,}200$ bps (about 1.4 Mbps); HDTV frame $1920 \times 1080 \times 12 = 24.88$ Mbit.
7. **File size (bits vs bytes).** 1 min CD stereo: $1{,}411{,}200 \times 60 / 8 = 10{,}584{,}000$ bytes (about 10.58 MB). 5 s of 16 kHz, 16-bit mono: 160,000 bytes.
8. **Halve the sample rate.** 44.1 kHz to 22.05 kHz: max frequency without aliasing drops from 22.05 to 11.025 kHz, bit rate and size halve (1,411.2 to 705.6 kbps stereo); 5 s 16 kHz mono file: 160,000 to 80,000 bytes, highest frequency 8 kHz to 4 kHz. Above-limit content aliases (15 kHz becomes 7.05 kHz).
9. **Over- vs undersampling.** Over: nothing special, same signal back, but extra storage and transmission overhead. Under: frequency content lost, reconstruction differs (aliasing); spatial (blocky 750 x 620 image; halving both directions keeps $375 \times 310 = 116{,}250$ samples = 1/4) and temporal (stagecoach wheels).
10. **LTI.** State linearity ($c_1x_1 + c_2x_2 \to c_1y_1 + c_2y_2$); write both convolution integrals; draw Fig. 2-8 ($y = h*x$, $Y(s) = H(s) \times X(s)$).
11. **Useful signals.** Write comb $\sum_k \delta(t - kT)$, step $\int_{-\infty}^{x}\delta(t)dt$, rect (0, 1/2, 1 cases), sinc $= \sin(\pi x)/(\pi x)$ (sinc(0) = 1, sinc(0.5) = 0.6366, zero at integers).
12. **Time vs frequency domain.** 6 Hz, 5 V sine: one spike of height 5 at 6 Hz. Slide 28: spikes 15, 10, 5 at 0, 8, 16 Hz; frequency domain is more compact for more than one sine wave. Fourier: 1768-1830, published 1807, periodic continuous signal = sum of complex sinusoids.
