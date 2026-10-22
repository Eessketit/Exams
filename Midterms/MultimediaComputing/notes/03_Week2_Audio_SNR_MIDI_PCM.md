# Lecture 3 (Week 2): Audio SNR, SQNR, Filtering, MIDI and PCM

What this lecture is about: how audio quality is measured (SNR, SQNR in dB), how bit depth, sampling rate and channels set quality and data rate, how MIDI codes music as tiny event messages (protocol, hardware, message bytes), and how PCM codes audio. Source: Li, Drew, Liu, *Fundamentals of Multimedia* 2nd ed., Chapter 6 (slide 45).

> Slide numbers = PDF page numbers (page 1 = title slide). "Highlighted" = green text on the slide, i.e. the professor's emphasis; quoted where an exam may test the wording.

## 1. Sampling Theorem and Aliasing (slide 3)

- The only example on the slide is **temporal aliasing** in western movies: stagecoach wheels first turn forward; as the coach speeds up they *appear to rotate in the opposite direction*.
- Reason (highlighted): "the movie camera has **under sampled** the wheels' motion".
- (textbook context) Nyquist rule: sample at $f_s \ge 2 f_{max}$. A tone above $f_s/2$ appears at a false (alias) frequency: the distance from $f$ to the nearest multiple of $f_s$. Every row of Table 6.2 (section 5) satisfies $f_s \ge 2 \times$ (top of signal bandwidth).

## 2. Signal to Noise Ratio (SNR) (slides 4-6)

- Definition (slide 4): "In any analog system, **random fluctuations produce noise added to the signal**, and the measured voltage is thus incorrect. **The ratio of the power of the correct signal to the noise is called the signal-to-noise ratio (SNR).**" SNR is a measure of the quality of the signal.
- Unit: decibel (dB); **1 dB = a tenth of a bel**. "Bel: a unit used for measuring sound intensity, equal to 10 decibels." SNR in dB uses base-10 logs of squared voltages.
- Eq. (6.2), slide 6 (highlighted: "the power in a signal is proportional to the square of the voltage"):

$$\mathrm{SNR} = 10\log_{10}\frac{V_{signal}^2}{V_{noise}^2} = 20\log_{10}\frac{V_{signal}}{V_{noise}}$$

- Rule: **10 log for power ratios, 20 log for voltage (amplitude) ratios.**
- Slide example: $V_{signal} = 10 \times V_{noise}$ gives $\mathrm{SNR} = 20 \times \log_{10}(10) = 20$ dB.
- Everyday "decibels" are relative to a **just-audible sound at 1 kHz** (the quietest sound we can hear = 0 dB).

Table 1 (slide 5), magnitudes of common sounds in dB:

| Sound | dB | Sound | dB |
|---|---|---|---|
| Threshold of hearing | 0 | Loud radio | 80 |
| Rustle of leaves | 10 | Train through station | 90 |
| Very quiet room | 20 | Riveter | 100 |
| Average room | 40 | Threshold of discomfort | 120 |
| Conversation | 60 | Threshold of pain | 140 |
| Busy street | 70 | Damage to eardrum | 160 |

- Reading it: +10 dB = 10x intensity (power); +20 dB = 10x amplitude.

## 3. Signal to Quantization Noise Ratio (SQNR) (slides 7-9)

- Digital signals store only quantized values; precision = **bits per sample, "typically 8 or 16"** (slide 7).
- Extra error beyond analog noise comes from quantization. Slide example: voltages in **0 to 1** with **8 bits** are forced into only **256** different values.
- This roundoff error "is not really noise", but is called **quantization noise (or quantization error)**, because the errors occur essentially randomly from sample to sample.
- Definition (slide 8): quantization noise = **difference between the value of the analog signal at the sampling time and the nearest quantization interval value**. "At most, this error can be as much as **half of the interval**."
- SQNR "reflects the relationship between the **maximum nominal signal strength** and the quantization error ... introduced in the analog-to-digital conversion".
- Formula (slide 9), $N$ = bits per sample:

$$SQNR = 20\log_{10}\frac{V_{signal}}{V_{\text{quan noise}}} = 20\log_{10}\frac{2^{N-1}}{\frac{1}{2}} = 20 \times N \times \log 2 = 6.02N \ \text{(dB)}$$

- (textbook context) Why $2^{N-1}$ over $\tfrac12$: N-bit signed samples span $-2^{N-1} \dots 2^{N-1}-1$, so the peak signal is $2^{N-1}$ steps and the worst error is half a step; the ratio is $2^N$. "log 2" on the slide means $\log_{10}2 = 0.30103$, so $20\log_{10}2 = 6.0206$.
- Wording: "**each bit adds about 6 dB of resolution, so 16 bits provide a maximum SQNR of 96 dB**."
- More realistic version: $SQNR = 6.02N + 1.76$ (dB), assuming the **input signal is sinusoidal**, quantization error is **statistically independent**, and its magnitude is **uniformly distributed between 0 and half the interval**.
- Slide's conclusion: "Since larger is better, this shows that a more realistic approximation gives a better characterization number for the quality of a system."

| N (bits) | Levels $2^N$ | $6.02N$ (dB) | $6.02N + 1.76$ (dB) |
|---|---|---|---|
| 8 | 256 | 48.16 | 49.92 |
| 16 | 65,536 | 96.32 (slide: "96 dB"; exact $20N\log_{10}2$ = 96.33) | 98.08 |
| 24 | 16,777,216 | 144.48 | 146.24 |

## 4. Audio Filtering (slide 10)

- Highlighted: "**The audio signal is filtered to remove unwanted frequencies.**" Which band is kept depends on the application.
- **Speech: typically 50 Hz to 10 kHz** retained. **Music: about 20 Hz up to 20 kHz.**
- Done "by a **bandpass filter, also called a band-limiting filter**, which screens out lower and higher frequencies."
- At the DA converter end the removed high frequencies **reappear in the output** (because of sampling and then quantization). So at the decoder a **low-pass filter is used after the DA circuit**, with **the same cutoff as the high-frequency end of the coder's bandpass filter**.
- Same chain appears in the PCM block diagram (section 12).

## 5. Audio Quality vs Data Rate (slides 11-12)

- Uncompressed data rate grows with bits per sample; **stereo doubles the bitrate** compared to mono.
- Bitrate $= f_s \times \text{bits per sample} \times \text{channels}$ (textbook context; it reproduces the table). **The slide's bitrate column is in kB/s (kiloBYTES)**, so divide bits by 8.

Table 6.2 (slide 11), with the recomputation:

| Quality | $f_s$ (kHz) | Bits | Channels | $f_s \cdot$ bits $\cdot$ ch (kbps) | / 8 (kB/s) | Slide (kB/s) | Bandwidth (Hz) |
|---|---|---|---|---|---|---|---|
| Telephone | 8 | 8 | Mono | 64 | 8 | 8 | 200-3,400 |
| AM radio | 11.025 | 8 | Mono | 88.2 | 11.025 | 11.0 (rounded) | 100-5,500 |
| FM radio | 22.05 | 16 | Stereo | 705.6 | 88.2 | 88.2 | 20-11,000 |
| CD | 44.1 | 16 | Stereo | 1,411.2 | 176.4 | 176.4 | 5-20,000 |
| DVD audio | 192 (max) | 24 (max) | up to 6 | 27,648 | 3,456 | 1,200.0 (max) | 0-96,000 (max) |

- DVD row: the maxima cannot all be used at once. (textbook context) 1,200 kB/s = 9.6 Mbit/s is the DVD-Audio cap; 192 kHz / 24-bit **stereo** = 1,152 kB/s fits under it.
- Slide 12: for analog devices, **bandwidth** is in **Hertz (Hz), cycles per second**; in computer networking, bandwidth means the **data rate (bps)** a link can deliver.
- Standard audio sampling frequencies (slide 12): "**5.0125 kHz, 11.025 kHz, 22.05 kHz, and 44.1 kHz**", supported by most sound cards. Correct first value: **5.5125 kHz** = 44.1/8 (slide shows 5.0125, a typo carried over from the textbook; the series halves each time).

## 6. Synthetic Sounds: FM and Wave Table (slides 13-14)

- Digitized sound must still be converted to analog for us to hear it. Two fundamentally different approaches: **FM (frequency modulation)** and **Wave Table** (or just Wave) sound.
- FM (highlighted) "refers to the means of **encoding the audio signal on the carrier frequency**." FM radio stations operate in the **88-108 MHz** band.
- Fig. 6.8 (slide 14), frequency modulation:

| Panel | Signal | Caption |
|---|---|---|
| (a) | $\cos(2\pi t)$ | a single frequency |
| (b) | $\cos(4\pi t)$ | twice the frequency |
| (c) | $\cos(\cos(4\pi t))$ | usually FM uses a sinusoid argument to a sinusoid |
| (d) | $\cos(2\pi t + \cos(4\pi t))$ | carrier frequency $2\pi t$ with modulating frequency $4\pi t$ cosine inside: a more complex form |

- Wave table = stored digital samples of real instruments; precise sound (slides 27, 29 in section 8).

## 7. MIDI Basics, Concepts and Terminology (slides 15-24)

- Definition (highlighted, slide 15): "MIDI, which dates from the **early 1980s**, is an acronym that stands for **Musical Instrument Digital Interface**. It forms a **protocol** adopted by the electronic music industry that enables computers, synthesizers, keyboards, and other musical devices to communicate with each other."
- Supported by most synthesizers; computers need a MIDI interface (built into most sound cards); the sound card must have **both DA and AD converters**.
- Slide 16: "MIDI is a **scripting language** - it codes **events** that stand for the production of certain sounds. Therefore, **MIDI files are generally very small**." An event: pitch of a note, its volume, which instrument. A .mid file holds notes played, instrument, length, loudness (slide 21 picture).
- Role of MIDI: "MIDI makes music notes, so is useful for **inventing, editing, and exchanging musical ideas** that can be encapsulated as notes"; useful vehicle for **music education**.
- Master-slave (slide 17): one MIDI instrument controls others; "daisy-chaining" a good keyboard to a better-sounding synthesizer. "Since MIDI comes with a **built-in timecode**, the master's clock can be used to synchronize all the slave timecodes." A **sequencer-sampler** reorders digital-audio samples and/or MIDI sequences; a DAW (ProTools) records multitrack, e.g. **8 vocal + 8 instrument tracks** at once.
- Concepts (slide 18): music organized into **tracks** in a sequencer (each on/off); an instrument usually tied to a **MIDI channel**; **16 channels, numbered 0 to 15**; the channel is the **last four bits (LSBs)** of the status byte. Example: **channel 1 = piano, channel 10 = drums**; instruments can be switched midstream.
- Slide 19: **channel messages** carry a channel number; **system messages** are general messages for all instruments (e.g. change in tuning or timing). An instrument **ignores any "play sound" message not for its channel**; several notes on its channel play only if it is **multi-voice**.
- Size (slide 21): **3 minutes of MIDI ≈ 3 kB**; a WAV stores **1 minute in about 10 MB** (CD quality: 44,100 x 2 bytes x 2 ch x 60 s = 10,584,000 B ≈ 10.6 MB).

| Term | Slide definition |
|---|---|
| Synthesizer | stand-alone sound generator that can vary **pitch, loudness, and tone color** (20) |
| Tone / sound module | units that generate sound (20) |
| Sequencer | began as hardware for storing and editing a sequence of musical events (MIDI data); now more often a **software music editor** (20) |
| MIDI keyboard | produces **no sound**, generates MIDI messages (may include a synthesizer) (21) |
| MIDI messages | "rather like assembler code", just a few bytes (21) |
| Timbre | quality of the sound, e.g. piano vs violin (21; first words cut off on slide) |
| Multi-timbral | plays many different sounds at the same time (piano, brass, drums) (21) |
| Voice | every different timbre and pitch the tone module can produce at the same time; typically 16, 32, 64, 256 voices (22) |
| Polyphony | number of voices that can be produced at the same time (23) |
| Patch | set of control settings that define a particular timbre (24) |
| Bank | database of patches (24) |
| General MIDI | agreed patch-to-channel mapping: **128 patches**, **channel 10 reserved for percussion** (24) |

- Slide 23 example: "**64 voices of polyphony**" = 64 different notes at once; "**16-part multi-timbral**" = sounds like 16 different instruments at once.

## 8. MIDI Bytes, Envelope and Sequencers (slides 22, 25-30)

- Slide 25: **status byte 128-255**, **data bytes 0-127**. "Actual MIDI bytes are 8 bit, plus a 0 start and stop bit, making them **10-bit bytes**." (textbook context: in real serial framing the stop bit is 1; quote the slide in the exam.)
- Fig. 6.9 (slide 22): stream of 10-bit bytes; a typical message is {status byte, data byte, data byte} = **{Note On, Note Number, Note Velocity}**.
- **Programmability**: filters to change bass and treble response, and the **envelope** (how the amplitude of a sound changes over time).
- Fig. 6.10 (slide 26), amplitude vs time of a note: **Note On -> Attack -> Decay -> Sustain -> (Note Off) -> Release** (ADSR).
- Slide 27: sequencers work in standard notation or raw data; **MIDI files can also store wave table data**; "the advantage of wave-table data (WAV files) is that it much more precisely stores the exact sound of an instrument". A **sampler** samples audio (a drum machine stores wave table data of real drums); MIDI on one track + vocals on another.
- Slide 28: full messaging protocol usable for anything, e.g. **controlling lights in a theater**; one message type sends any kind and number of bytes (textbook context: System Exclusive, &HF0 ... ended by EOX &HF7).
- Sequencer tricks: **looping** a few bars; volume controlled over time = **time varying amplitude modulation**; **time compression or expansion with no pitch change**.
- Slide 29: big pitch shifts of a sample sound displeasing, so samplers use **multisampling**: record with several **bandpass filters** and assign the recordings to different keys (less shift per note).
- Slide 30: **MIDI Machine Control (MMC)** = subset of the MIDI spec for controlling recording equipment (multitrack recorders); most common use: press "Play" on a remote device (e.g. start a device with a poor timer at the right time). MIDI also controls synthesizers, recorders, lighting.

## 9. Hardware Aspects of MIDI (slides 31-34)

- "The MIDI hardware setup consists of a **31.25 kbps serial connection**, with the 10-bit bytes including a 0 start and stop bit." MIDI units are usually **either input or output devices, not both**.
- Fig. 6.11: **modulation wheel adds vibrato**; **pitch bend alters the frequency** (like pulling a guitar string).
- Ports: **5-pin connectors IN and OUT**, optional third **THRU** that simply **copies data entering IN**. MIDI communication is **half-duplex**. IN receives all MIDI data; OUT transmits all MIDI data the device generates itself.
- Fig. 6.12 (slides 32-33): master keyboard **OUT -> module A IN**; **A THRU -> module B IN**; B THRU -> etc. Recording: the keyboard synthesizer sends messages to a sequencer, which records them. Playback: sequencer sends to all sound modules and the synthesizer.

Worked example, slide 34 ("the 31.25 kbps data rate is actually quite restrictive"):

| Step | Computation | Result |
|---|---|---|
| One Note On message | 3 bytes x 10 bits | 30 bits |
| Chord with all ten fingers | 10 notes x 30 bits | 300 bits |
| Time for the chord | 300 / 31,250 | 0.0096 s ≈ **0.01 s** |
| Time per note | 30 / 31,250 | 0.00096 s ≈ **0.001 s** |
| Not counted | 10 Note Off messages (another 300 bits) | total 0.0192 s |

- Pitch bend and modulation wheels can also generate many messages.

## 10. Structure of MIDI Messages (slides 35-39)

- Fig. 6.13 taxonomy: **Channel messages** (Voice, Mode) and **System messages** (Common, Real-time, Exclusive).
- Channel message (highlighted): "can have **up to 3 bytes**; the first is the **status byte** and has its **most significant bit set to 1**. The **four low order bits** identify which of the 16 possible channels ..., with the **three remaining bits holding the message**. For a data byte, the most significant bit is set to zero."
- Layout: status = `1 t t t n n n n` (t = type, n = channel), data = `0 d d d d d d d`.
- Voice messages: which note to play or turn off, key pressure, and controller effects (**sustain, vibrato, tremolo, pitch wheel**).

Table 6.3, voice messages (&H = hex, n = channel; all values 0...127 except Controller number 0...120):

| Voice message | Status byte | Data byte 1 | Data byte 2 |
|---|---|---|---|
| Note off | &H8n | Key number | Note off velocity |
| Note on | &H9n | Key number | Note on velocity |
| Polyphonic key pressure | &HAn | Key number | Amount |
| Control change | &HBn | Controller number | Controller value |
| Program change | &HCn | Program number | None |
| Channel pressure | &HDn | Pressure value | None |
| Pitch bend | &HEn | MSB | LSB |

- (textbook context) The real MIDI spec sends pitch bend LSB first; use the table order in the exam.
- Table 6.4, mode messages (first data byte, meaning): &H79 reset all controllers; &H7A local control (2nd byte 0 = off, 127 = on); &H7B all notes off; &H7C omni mode off; &H7D omni mode on; &H7E mono mode on (poly off; 2nd byte = controller number); &H7F poly mode on (mono off). Other 2nd bytes: none, set to 0. (textbook context: sent with status &HBn; &H79-&H7F = 121-127, just above controller numbers 0-120.)
- Table 6.5, system common (status, number of data bytes): MIDI timing code &HF1 (1); song position pointer &HF2 (2); song select &HF3 (1); tune request &HF6 (none); EOX terminator &HF7 (none).
- Table 6.6, system real-time (status byte): timing clock &HF8; start sequence &HFA; continue sequence &HFB; stop sequence &HFC; active sensing &HFE; system reset &HFF.

## 11. General MIDI and MIDI to WAV Conversion (slides 40-41)

- Goal: same patch numbers = same instruments on every machine: "**patch 1 should always be a piano, not a flugelhorn**".
- Standard percussion map: **47 percussion sounds**; where a "note" sits on the score selects the percussion element.
- A GM device must: support **all 16 channels**; be **multi-timbral** (each channel a different instrument/program); be **polyphonic** (each channel many voices); have **at least 24 dynamically allocated voices**.
- MIDI to WAV (slide 41): early Adobe Premiere accepts only WAV; shareware converters are **large lookup files** substituting predefined or shifted WAV output for MIDI messages, "with **inconsistent success**".

## 12. Coding of Audio and PCM (slides 42-44)

- Highlighted: "**Quantization and transformation of data are collectively known as coding of the data.**" For audio, the **μ-law** companding technique is usually combined with a simple algorithm exploiting the **temporal redundancy** in audio.
- Slide's own gloss: "companding (reduce the SNR of (a signal) using a compander.)". (textbook context: compander = compressor + expander; non-uniform quantization with finer steps for small amplitudes.)
- PCM = **Pulse Code Modulation** (slide 2 lists it as "PCM code modulation").
- "Every compression scheme has **three stages**" (slide 43):
  1. **Transformation**: new representation that is easier/more efficient to compress. Example: **predictive coding** predicts the next signal from previous ones and transmits the **prediction error**.
  2. **Loss**: **quantization is the main lossy step**: fewer reconstruction levels than in the original signal, so some information is lost.
  3. **Coding**: assign a **codeword** (binary bitstream) to each output level or symbol: **fixed-length** or **variable-length** (e.g. **Huffman**).
- Fig. 6.15 (slide 44), PCM encoding and decoding:
  - Encoder: input analog speech -> **bandlimiting filter** -> **μ-law or A-law compressor** -> **linear PCM** -> transmission.
  - Decoder: **digital-to-analog converter** -> **μ-law or A-law expander** -> **low-pass filter** -> output analog speech.
- Lossy compression and entropy/arithmetic coding in depth: see Lecture 5.

## Exam focus

All numbers below verified in Python (`/home/claude/work/agents/L3/verify.py`).

1. **SNR from voltages vs powers.** $V_s = 5$ V, $V_n = 0.05$ V: $20\log_{10}(100) = 40$ dB. Power ratio 100: $10\log_{10}(100) = 20$ dB. Voltage ratio 2: 6.02 dB.
2. **Compare sounds in Table 1.** Busy street (70) vs average room (40): 30 dB = $10^{3}$ = 1000x intensity (amplitude $10^{1.5} \approx 31.6$x). Conversation vs threshold: 60 dB = $10^6$x intensity.
3. **SQNR of N bits.** 8 bits: $6.02 \times 8 = 48.16$ dB (realistic 49.92 dB). 16 bits: 96.32 dB, "96 dB" (realistic 98.08 dB). Show the derivation $20\log_{10}(2^{N-1}/\tfrac12) = 20N\log_{10}2$.
4. **Bits for a target SQNR.** Need 90 dB: $N \ge 90/6.02 = 14.95$, so **15 bits**. Need 80 dB: $80/6.02 = 13.29$, so 14 bits with $6.02N$, but $(80-1.76)/6.02 = 12.997$, so 13 bits with $6.02N+1.76$; state which formula you use.
5. **Quantization levels and error.** 0 to 1 V, 8 bits: $2^8 = 256$ levels; (textbook context) step $= 1/256 = 0.0039$ V, max error = half interval $= 0.00195$ V.
6. **Uncompressed bitrate and size (kB/s vs kbps trap).** CD: $44{,}100 \times 16 \times 2 = 1{,}411.2$ kbps = 176.4 kB/s; 3 min = 176.4 x 180 = 31,752 kB ≈ 31.75 MB. Telephone 1 min: 8 kB/s x 60 = 480 kB. Mono to stereo doubles it.
7. **MIDI vs WAV size.** 3 min MIDI ≈ 3 kB vs 3 min CD WAV ≈ 31.75 MB: about 10,000x smaller.
8. **MIDI transmission time.** 31.25 kbps, 10-bit bytes: 3,125 bytes/s, ≈ 1,042 three-byte messages/s. Ten-note chord: 300 bits / 31,250 = 0.0096 s; with Note Offs 0.0192 s. Program change (2 bytes): 20 bits = 0.00064 s.
9. **Build or decode a status byte.** Note On, channel n = 3: &H93 = 147 = `1001 0011` (MSB 1 = status, `001` = Note On, `0011` = channel 3). Full message, key 60, velocity 100: `&H90 &H3C &H64` = 144, 60, 100. (textbook context) "Channel 10 = drums" in 1-based naming is nibble n = 9, status &H99 = 153. Status bytes are always 128-255, data bytes 0-127.
10. **Nyquist check (textbook context).** CD: $2 \times 20$ kHz = 40 kHz ≤ 44.1 kHz; telephone: $2 \times 3.4 = 6.8 \le 8$ kHz. Undersampling = aliasing (stagecoach wheels, slide 3).
11. **Definitions to reproduce:** SNR (power ratio of correct signal to noise), quantization noise (difference to nearest quantization value, at most half an interval), band-limiting filter + low-pass filter after DA with the same cutoff, MIDI (protocol, early 1980s), voice vs polyphony vs multi-timbral, patch vs bank, General MIDI (128 patches, channel 10 percussion, 47 percussion sounds, 16 channels, at least 24 voices), MIDI IN/OUT/THRU and half-duplex, 31.25 kbps and 10-bit bytes, ADSR, PCM three stages and the Fig. 6.15 block order.
