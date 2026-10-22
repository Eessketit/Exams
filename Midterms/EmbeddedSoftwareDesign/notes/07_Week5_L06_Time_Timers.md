# L06 Time and Timers

**What this lecture is about:** time becomes something the hardware keeps for you: SysTick as a 1 kHz interrupt (`millis()`), TIM3 drawing a 50 Hz servo PWM with no CPU, and TIM14 timestamping the HC-SR04 echo edges (input capture), all scheduled from a non-blocking superloop. The project is a parking sensor: a servo gauge plus an 8-LED proximity bar.

Deck: title, two pin-map pages, slides 1-18 (plus 5b, 13b) = 23 pages. "Every figure on these slides is real output from `06_Time_And_Timers/Main.elf`." Chip: STM32C031C6, Cortex-M0+ at **48 MHz**, 2 NVIC priority bits.

## 0. Pins used in this lesson (pin map slides)

| Pin | Mode | Job |
|---|---|---|
| PA2 / PA3 | AF1 | USART2 TX / RX, serial monitor, 115200 baud |
| PA5 | out | LD4 heartbeat (on-board) |
| PA6 | **AF1** | `TIM3_CH1` PWM to the servo |
| PA7 | **AF4** | `TIM14_CH1` capture of the echo (also EXTI line 7, slide 13b) |
| PA8 | out | HC-SR04 trigger |
| PB0-PB7 | out | proximity bar, one bit per LED (Wokwi calls PB0 `PB0.1`) |

- MODER: in 00, out 01, AF 10 (AFR = N), analog 11 (see `06_Week4_L05_GPIO_Interrupts.md`, MODER and AFR sections). Derived: `GPIOA->AFR[0]` = `0x41001100` (PA2, PA3, PA6 = 1; PA7 = 4 at bits 31:28).

## 1. The millisecond that lied, polled SysTick (slide 1)

- Lesson 05 polled: `while (!(SysTick->CTRL & SysTick_CTRL_COUNTFLAG_Msk)) { } ms_now++;`
- `COUNTFLAG` remembers **one** wrap. A 90-character `printf` at 115200 baud blocks for about 8 ms, so 7 wraps go unseen and **7 ms vanish**. Time that depends on the loop coming back is only as good as the loop.
- SysTick: four registers at **0xE000E010**, the same on every Cortex-M (`SysTick_Type`, `core_cm0plus.h`):

| Offset | Register (ARM name) | Fields | Job |
|---|---|---|---|
| 0x00 | `CTRL` (SYST_CSR) | 16 COUNTFLAG, 2 CLKSOURCE, 1 TICKINT, 0 ENABLE | on, interrupt on, clock source, wrap flag |
| 0x04 | `LOAD` (SYST_RVR) | 23:0 RELOAD | restart value = period - 1 |
| 0x08 | `VAL` (SYST_CVR) | 23:0 CURRENT | live count **down** to 0; any write clears it |
| 0x0C | `CALIB` (SYST_CALIB) | 31 NOREF, 30 SKEW, 23:0 TENMS | read-only: what the chip says 10 ms is |

- **24-bit** counter: longest period $2^{24}$ clocks = 16 777 216 / 48 MHz = **350 ms**.
- The fix is lesson 03's second rendezvous, **interrupt instead of poll**:

```c
static volatile uint32_t ms_ticks;
void SysTick_Handler(void) { ms_ticks++; }
SysTick_Config(SystemCoreClock / 1000u);   /* in main(), once */
```

## 2. SysTick Config, five readable lines (slide 2)

```c
if ((ticks - 1UL) > SysTick_LOAD_RELOAD_Msk) return 1;           /* 24 bits only */
SysTick->LOAD  = ticks - 1UL;                                     /* 47999        */
NVIC_SetPriority(SysTick_IRQn, (1UL << __NVIC_PRIO_BITS) - 1UL);  /* 3            */
SysTick->VAL   = 0UL;
SysTick->CTRL  = CLKSOURCE | TICKINT | ENABLE;
```

- Leaves `LOAD` = 47999 = `0x0000BB7F` ($48\,000\,000/1000 - 1$), `CTRL` = `0x00000007` (bit 2 core clock, bit 1 interrupt, bit 0 on), priority $(1 \ll 2) - 1 = 3$.
- **Priority 3, the lowest of 0-3:** "a late tick is caught up, a missed capture is gone" (slide 15).
- **SysTick is part of the core, not ST's silicon:** same address and registers on every Cortex-M, which is why every RTOS uses it as its heartbeat (L07 does).
- `SysTick_Handler` has **no flag to clear**, unlike every other handler in the course: its request is the wrap itself; taking the exception acknowledges it.
- 1-second tick? `ticks - 1` = 47 999 999 > `0xFFFFFF` (16 777 215), so `SysTick_Config` **returns 1 and configures nothing** (Lab, "Where to go next").

## 3. millis and the wrap that does not matter (slide 3)

- `uint32_t ms_ticks` wraps after $2^{32}$ ms = **49.7 days**.

```c
if (millis() >= deadline) ...          /* WRONG at the wrap */
if (millis() - start >= period) ...    /* right, always     */
```

- Unsigned subtraction is modulo $2^{32}$, so `now - start` is the true elapsed time across the wrap. Worked (period 500 ms):

| start | now | `now >= start+500` | `now - start` | Verdict |
|---|---|---|---|---|
| `0xFFFFFF00` | `0xFFFFFF10` | deadline wrapped to 244: **true**, fires 484 ms early | 16, not yet | subtraction right |
| `0xFFFFFE00` | `0x00000004` | deadline `0xFFFFFFF4`: **false** for another 49.7 days | 516, fire | subtraction right |

- Reading `ms_ticks` needs **no lock**: one aligned word, one writer (see `05_Week4_L03_Execution_Concurrency.md`, atomicity section). `volatile` forces each `millis()` to actually load it.

## 4. Cooperative scheduling without waiting (slide 4)

```c
for (;;) {
    uint32_t now = millis();
    if (now - ping_at   >= 100)  { ping_at   += 100;  ranger_ping(); }
    if (now - report_at >= 1000) { report_at += 1000; printf(...);   }
    if (now - beat_at   >= 500)  { beat_at   += 500;  toggle LD4;    }
}
```

- Three jobs, three rates, none aware of the others: **cooperative scheduling** in its smallest form; "most small products ship exactly this".
- **`ping_at += 100`, not `ping_at = now`.** One pass 3 ms late: `= now` shifts every later ping by 3 ms and the error accumulates; `+=` stays on the 100 ms grid and absorbs the lateness.
- Weakness: every job must be quick. One 50 ms job delays all the others by 50 ms. L07 removes the limit.

## 5. The timer register map, one page (slide 5)

TIM3 at **0x40000400**, TIM14 at **0x40002000**; same `TIM_TypeDef` and offsets for every timer on the chip (TIM14 leaves most unimplemented). **Nine registers of twenty-five** do this lesson's work.

| Off | Reg | Group | Fields used (others shown on slide) | TIM3 (servo PWM) | TIM14 (echo capture) |
|---|---|---|---|---|---|
| 0x00 | `CR1` | control | **7 ARPE, 0 CEN** (11 UIFREMAP, 9:8 CKD, 6:5 CMS, 4 DIR, 3 OPM, 2 URS, 1 UDIS) | CEN, ARPE | CEN |
| 0x0C | `DIER` | events | **1 CC1IE, 0 UIE** (8 UDE, 6 TIE) | UIE | CC1IE |
| 0x10 | `SR` | events | **1 CC1IF, 0 UIF** (9 CC1OF, 6 TIF); write 0 to clear | UIF | CC1IF |
| 0x14 | `EGR` | events | **0 UG** (6 TG, 1 CC1G) | UG | UG |
| 0x18 | `CCMR1` | channel | output: 16 OC1M_3, **6:4 OC1M, 3 OC1PE**, 2 OC1FE, 1:0 CC1S; input: 7:4 IC1F, 3:2 IC1PSC, **1:0 CC1S** | OC1M, OC1PE | CC1S |
| 0x20 | `CCER` | channel | **3 CC1NP, 1 CC1P, 0 CC1E** (2 CC1NE) | CC1E | CC1E, CC1P, CC1NP |
| 0x24 | `CNT` | time base | **15:0**; bit 31 UIFCPY | counts, never read | read: the 10 us trigger's stopwatch |
| 0x28 | `PSC` | time base | 15:0, count every PSC+1 clocks | 47 | 47 |
| 0x2C | `ARR` | time base | 15:0, count 0 ... ARR then update | 19999 | 0xFFFF |
| 0x34 | `CCR1` | channel | 15:0, compare value or captured time | pulse width, us | edge time, us |

- Not used: `CR2` 0x04, `SMCR` 0x08, `CCMR2` 0x1C, `CCR2-4` 0x38-0x40, and 0x30, 0x44-0x68 (`RCR`, `BDTR`, `DCR`, `DMAR`, `CCMR3`, `CCR5`, `CCR6`, `AF1`, `AF2`, `TISEL`: TIM1 extras, DMA bursts, input selection).
- Four groups, the same in every timer: **time base** (PSC, ARR, CNT), **events** (EGR, DIER, SR), **channel** (CCMR1, CCER, CCR1), **control** (CR1: preload on, then run). `CCMR1` is **one register, two layouts**: `CC1S` (bits 1:0) decides; 00 = output, 01 = input from TI1.
- TIM3 and TIM14 are **16-bit**; the header masks are 32 bits because they also serve the 32-bit TIM2 of other STM32s. `UIFCPY` (CNT bit 31) is a copy of UIF, readable in the same load as the count when `UIFREMAP` is set. Example: `TIM3->CCR1` = 0x40000434.

## 6. Time base: PSC, ARR, CNT (slide 5b)

$$f_{update} = \frac{f_{clk}}{(PSC+1)\,(ARR+1)} = \frac{48\,000\,000}{48 \times 20\,000} = 50\ \text{Hz}$$

- 48 MHz, divide by PSC+1 = 48, CNT +1 every **1 us**; at CNT == ARR an **update event**: CNT goes to 0, UIF = 1. "Both registers hold N-1: a count of N steps runs from 0 to N-1." PSC = 47 = `0x002F`, ARR = 19999 = `0x4E1F`.

| PSC | ARR | Tick | Update | Note |
|---|---|---|---|---|
| 47 | 19999 | 1 us | **50 Hz** (20 ms) | the lesson |
| 48 | 19999 | 1.0208 us | **48.98 Hz** | forgot the -1: nothing complains (Lab Part 2) |
| 23 | 19999 | 0.5 us | **100 Hz** (10 ms) | 2 MHz count (T9) |
| 47 | 0xFFFF | 1 us | wrap every **65.5 ms** | TIM14 free-run |

## 7. Shadow registers, and why UG comes first (slide 6)

- `PSC`, `ARR` and `CCR1` are **double-buffered**: a write lands in the *preload* register; the counter uses the *shadow* copy until the next update event copies it across. That lets you change a PWM duty mid-flight without a malformed pulse, and why a fresh timer can ignore you.

```c
TIM3->PSC  = 47;              /* sits in preload...                       */
TIM3->ARR  = 19999;
TIM3->EGR  = TIM_EGR_UG;      /* ...until this forces an update right now */
TIM3->SR   = ~TIM_SR_UIF;     /* UG also raised UIF: clear it, or the     */
TIM3->DIER |= TIM_DIER_UIE;   /* first interrupt is a phantom             */
```

- **Skip UG:** the prescaler is still 0 for the first period: 20000 counts at 48 MHz = **0.4 ms instead of 20 ms**. `ARR` took effect at once only because it was written before `ARPE` turned its preload on. On a one-shot timer that is a bug you will see; on one that runs forever, a glitch you probably will not.

## 8. TIM3 IRQHandler and write 0 to clear (slide 7)

```c
void TIM3_IRQHandler(void) { if (TIM3->SR & TIM_SR_UIF) { TIM3->SR = ~TIM_SR_UIF; /* write 0 to clear */ ... } }
```

- The name works because it overrides the weak alias in the vector table (see `04_Week3_L04_Startup_LinkerScript.md`, weak aliases section).
- **Timer flags clear by writing 0. EXTI flags clear by writing 1.** ST's own LL driver shows both: `WRITE_REG(TIMx->SR, ~(TIM_SR_UIF))` and `WRITE_REG(EXTI->FPR1, ExtiLine)`.
- `~TIM_SR_UIF` compiles to `movs r2, #2 ; negs r2, r2` = `0xFFFFFFFE` and one `str`. The 1s leave every other flag alone, so the clear touches only UIF and needs **no read**.
- The EXTI way, `TIM3->SR = TIM_SR_UIF` (`0x00000001`), clears **every other** flag and leaves UIF set: the handler **re-enters forever**. Zero warnings (Lab Part 1).

| Peripheral | Flag | How it clears |
|---|---|---|
| TIM3 / TIM14 `SR` | UIF, CC1IF | write **0** (`SR = ~flag`) |
| EXTI `RPR1`, `FPR1` | pending bit | write **1** (`RPR1 = mask`) |
| TIM14 capture | CC1IF | **reading `CCR1`** (a third convention, no write at all; per the SVD) |
| SysTick | none | taking the exception |

## 9. Output compare, the timer draws a waveform (slide 8)

- **PWM mode 1** (`OC1M = 110`): PA6 **high while CNT < CCR1**, low after, until ARR. One 20 ms frame per counter ramp.
- With a 1 us tick, **`CCR1` is the pulse width in microseconds**. No CPU per edge; the ISR only *changes* `CCR1`, and `OC1PE` makes each change wait for the next frame boundary, so a pulse is never cut in half.
- Four writes turn the channel on: `CCMR1` (mode, preload), `CCER.CC1E` (to the pin), `CR1.ARPE`, and the pin's AF. Code: clear `CC1S | OC1M`, set `OC1M_2 | OC1M_1 | OC1PE`; `CCR1` starts at 1500.

| Register | Value | Bits |
|---|---|---|
| `TIM3->CCMR1` | `0x00000068` | OC1M 6:4 = 110 (0x60), OC1PE bit 3 (0x08); OC1M is 4 bits, its top bit OC1M_3 sits at 16 |
| `TIM3->CR1` | `0x0081` | ARPE bit 7, CEN bit 0 |
| `TIM3->CCER` | `0x0001` | CC1E |

## 10. The signal a servo reads (slide 9)

- A hobby servo reads **the width of a pulse, repeated every 20 ms**: nominal **1.0 ms one end, 1.5 ms centre, 2.0 ms other end**.
- "Nominal" matters: real servos differ; Arduino's `Servo` uses **544-2400 us** for 0-180 degrees; Wokwi documents **no pulse range**, so Lab Part 4 measures it. The frame rate is not critical (servos accept a wide range around 50 Hz); the **pulse width is the whole message**. Hence one count = 1 us, `CCR1 = 1500` = exactly 1.5 ms.

## 11. Getting the signal out, the AF table (slide 10)

| Signal | PA6 | PB4 | PB6 | PB7 | PC6 |
|---|---|---|---|---|---|
| `TIM3_CH1` | **AF1** | AF1 | AF12 | AF11 | AF1 |

- AF numbers come from the **datasheet**, not the reference manual (here via Zephyr `hal_stm32` `stm32c031c(4-6)tx-pinctrl.dtsi`, generated from ST's database). Same signal, **different AF on different pins**: `TIM14_CH1` is **AF4 on PA7** but AF0 on PB1.
- Wrong AF: pin electrically fine, driven by another peripheral or nothing. Timer counts, IRQ fires, report says 50/s, **servo does not move** (Lab Part 5: "the timer works, the pin doesn't").

## 12. The smallest control loop, a rate limiter (slide 11)

```c
uint32_t now = TIM3->CCR1, want = servo_target_us;
if (want > now + SLEW) now += SLEW;  else if (want + SLEW < now) now -= SLEW;  else now = want;
TIM3->CCR1 = now;                    /* preloaded: takes effect next frame */
```

- At most `SERVO_SLEW_US` = **20 us per frame** x 50 frames/s = **1000 us per second** of travel: the servo glides instead of snapping.
- Measure, compare, correct, once per period, in an interrupt tied to the rate the output is consumed. Every Part 3 controller (line follower to drone attitude) has this shape.

| Slew (us/frame) | Frames 1000 to 2000 us | Time |
|---|---|---|
| 20 | 50 | 1 s |
| 200 (T4) | 5 | 0.1 s |
| 1000 (Lab Part 3) | 1 | 20 ms, snaps, passes echo noise |
| 2 (Lab Part 3) | 500 | 10 s, smooth and useless |

## 13. Input capture, the hardware takes the timestamp (slide 12)

- The reverse of compare: not "make an edge at this time" but "**what time was this edge?**" Chain: PA7 edge, then **CCR1 = CNT in hardware, at the edge**, then CC1IF, then the ISR reads it.
- "The timestamp is taken before the interrupt is even requested. ISR latency, 1 us or 100 us, changes when you READ it, not what it SAYS." EXTI plus `millis()` would include the interrupt latency, which varies with whatever else runs. **The ISR is a courier, not a stopwatch.**

## 14. Measuring the echo with TIM14 (slide 13)

- HC-SR04: a 10 us trigger, answered by a high pulse whose width is the sound's round trip: **58 us per cm** (Wokwi part docs; range 2-400 cm).
- TIM14 free-runs at 1 MHz (PSC 47, ARR 0xFFFF) and captures **both** edges, `CC1P = CC1NP = 1`.

| Register | Value | Bits |
|---|---|---|
| `TIM14->CCMR1` | `0x0001` | CC1S = 01: input, TI1 |
| `TIM14->CCER` | `0x000B` | CC1NP bit 3, CC1P bit 1, CC1E bit 0 |

```c
uint16_t t = (uint16_t)TIM14->CCR1;          /* reading CCR1 clears CC1IF */
if (pin_read(GPIOA, ECHO_PIN)) echo_rise = t;                   /* rising  */
else { echo_us = (uint16_t)(t - echo_rise); echo_count++; }     /* falling */
```

- **16-bit subtraction is right across one wrap.** TIM14 wraps every 65.5 ms; the longest echo, 400 cm, is 23.2 ms. Example: rise 60000, fall 17664 (wrapped), `(uint16_t)(17664 - 60000)` = **23200**. Same modular trick as `millis()`, in 16 bits.
- The edge is identified by reading the pin, valid while the pulse outlasts the ISR latency; the shortest echo (2 cm) is 116 us.
- The trigger also uses TIM14: `CNT` already counts microseconds, so `ranger_ping()` holds PA8 high until `(uint16_t)(CNT - t0) >= 12`.

## 15. Wokwi has no input capture, so EXTI (slide 13b)

- First watched in Wokwi on 2026-10-04: every line read `echo 0 us = 0 cm`. **Wokwi does not implement timer input capture** (its board page lists STM32 timers as "used by analogWrite()", PWM out only). CC1IF never set.
- PA7 now also feeds **EXTI line 7**, both edges (`RTSR1`, `FTSR1`; `EXTICR[1]` bits 31:24 = 0 for port A; see `06_Week4_L05_GPIO_Interrupts.md`, EXTI section). Its handler stamps `TIM14->CNT` itself, "already late":

```c
uint16_t t = (uint16_t)TIM14->CNT;
if (EXTI->RPR1 & mask) { EXTI->RPR1 = mask; exti_rise = t; ... }
if (EXTI->FPR1 & mask) { EXTI->FPR1 = mask; exti_us = (uint16_t)(t - exti_rise); ... }
```

- Capture is used whenever it has produced a pulse; EXTI only while capture has produced none. Each line names its source and counts both paths' edges. Measured:

```
t=  9000 ms  TIM3 50/s  echo  5882 us = 101 cm (EXTI)  servo 1495 us  edges cap 0 exti 161
```

| Reading | Why |
|---|---|
| `cap 0`, `exti` +20/s | 2 edges per ping x 10 pings/s |
| 5882 us at slider 100 cm | **58.8 us per cm** = sound at 340 m/s, there and back |
| 101 cm | 5882 / 58 = 101 (integer) |
| servo **1495 us** | 2000 - 101 x 1000 / 200 |
| **3 LEDs** | (200 - 101) x 8 / 200 = 3.96, truncated |

- Both EXTI timestamps are late by about the same latency, so the width is right to a microsecond or two, **only while nothing delays one of the two interrupts**. On silicon, slide 12's case for capture stands.
- Main.c fallback: after 10 pings with no edge on either path, PA7 becomes a plain input (EXTI only); after 20 with none, it prints "check the ECHO and TRIG wires".

## 16. The gauge and the bar, integer mapping (Main.c)

```c
cm = pulse / 58u;                                               /* HC-SR04 */
gauge_us(cm) = SERVO_MAX_US - clamp(cm) * (SERVO_MAX_US - SERVO_MIN_US) / FAR_CM;
lit = (FAR_CM - clamp(cm)) * 8u / FAR_CM;  bar = (1u << lit) - 1u;  /* 0..8 LEDs */
GPIOB->BSRR = ((uint32_t)(uint8_t)~leds << 16) | leds;          /* one store  */
```

- Constants: `SERVO_MIN_US` 1000, `SERVO_MAX_US` 2000, `SERVO_SLEW_US` 20, `FAR_CM` 200, `PING_MS` 100, `REPORT_MS` 1000, `HEARTBEAT_MS` 500, `TICK_HZ` 1 000 000. Near = full deflection; integer only, "this core has no FPU".

| cm | Servo target (us) | LEDs lit | bar | `GPIOB->BSRR` |
|---|---|---|---|---|
| 0 | 2000 | 8 | `0xFF` | `0x000000FF` |
| 20 | 1900 | 7 | `0x7F` | `0x0080007F` |
| 50 | 1750 | 6 | `0x3F` | `0x00C0003F` |
| 100 | 1500 | 4 | `0x0F` | `0x00F0000F` |
| 101 | 1495 | 3 | `0x07` | `0x00F80007` |
| 150 | 1250 | 2 | `0x03` | `0x00FC0003` |
| 176-200+ | 1120-1000 | 0 | `0x00` | `0x00FF0000` |

- LED thresholds: n LEDs lit at cm <= 200 - 25n (175, 150, ... 25); all 8 only at 0 cm (never, minimum range 2 cm).
- Wokwi's slider is 58.8 us/cm, so the program's cm reads about **1.4 % high**: slider 100 gives 101, slider 150 gives 152, slider 151 gives 153. This bites exactly at the 25 cm boundaries.

## 17. Tearing, two variables from one interrupt (slide 14)

```c
__disable_irq();  uint32_t n = echo_count;  uint32_t us = echo_us;  __enable_irq();
```

- Without it, a capture between the two loads pairs a **new count with an old width**: L03's tearing in real code (see `05_Week4_L03_Execution_Concurrency.md`, tearing section).
- The window is two loads, a fraction of a microsecond. **The capture itself is not delayed**: the hardware already took the timestamp; the interrupt is only held pending until `__enable_irq()`.

## 18. Three interrupts, three priorities (slide 15)

| Source | IRQ | Priority | Why |
|---|---|---|---|
| TIM14 capture | 19 | **1** | its *read* must happen before the next edge overwrites `CCR1` |
| TIM3 update | 16 | **2** | must set `CCR1` within the 20 ms frame: generous |
| SysTick | exception 15 | **3** (lowest) | a late tick is still counted; nothing is lost |

- Main.c also sets `EXTI4_15_IRQn` (IRQ 7) to priority 1. Where they live, 2 bits at the top of each byte:

| Register | Value | Fields |
|---|---|---|
| NVIC `IPR4` (IRQs 16-19) | `0x40000080` | bits 31:30 TIM14 = 01, bits 7:6 TIM3 = 10 |
| SCB `SHPR3` | `0xC0000000` | bits 31:30 SysTick = 11, bits 23:22 PendSV = 00 |

- Vectors (README): SysTick 15 at `0x0800003C`, TIM3 32 at `0x08000080`, TIM14 35 at `0x0800008C` (= 4 x exception number).
- On M0+, a higher priority **preempts** a running lower-priority handler. Equal priorities never preempt; they queue, and the NVIC takes the higher priority, then the **lower IRQ number**, first.
- **"Priority follows deadline, not significance."** The servo matters more to a viewer than the clock but has 20 ms of slack. Named *deadline-monotonic* (*rate-monotonic* when each deadline is the job's own period). L07 builds a scheduler on it.

## 19. Two clocks checking each other (slide 16)

```
t=  5000 ms  TIM3 50/s  echo  5800 us = 100 cm  servo 1500 us  (last line took 8 ms)
```

- TIM3 updates counted per second of SysTick time. Same 48 MHz, different dividers: if PSC and ARR are right the answer is **exactly 50**. A **self-test**: arithmetic in two independent places that must agree.
- `took`: about 88 characters x **86.8 us** (10 bits at 115200) = 7-8 ms, and `t=` still advances by exactly 1000. Lesson 05 would have lost 7 of those ms.
- Measured in **Renode**, whose platform clocks timers at 10 MHz: the first run read `TIM3 10/s`. "The self-test caught the simulator." If `took` reads 0 in Wokwi, its UART is faster than silicon's.

## 20. Silent failure checklist, timer edition (slide 17)

| Forgot | Symptom |
|---|---|
| `RCC->APBENR1/2` clock gate (TIM3EN in APBENR1, TIM14EN in APBENR2) | registers read 0, nothing counts |
| `EGR = UG` after PSC/ARR | first period at the wrong rate |
| `-1` in PSC or ARR | 2 % off; only a cross-check notices |
| clearing UIF by writing **1** | handler re-enters forever |
| the pin's AF number | timer runs, pin is dead |
| `CCER.CC1E` | same: the channel never reaches the pin |
| both capture edges | rising only: no widths, ever |
| handler name, exactly | vector stays `Default_Handler` |

- The banner prints PSC, ARR, the computed rate, both AF fields, the capture polarity bits and whether each of the three handlers is installed, **read back from hardware**.

## 21. What carries forward (slide 18)

- **Time is now an interrupt**, and `now - then` is the only comparison you write.
- **Timers are one model, many instances.** TIM3 made a waveform, TIM14 measured one; TIM1, TIM16, TIM17 are the same registers with more features.
- **The superloop has a ceiling**: every job must finish quickly. L07 lifts it: SysTick becomes a scheduler's heartbeat that can *interrupt a job*, and `delay_ms()` returns without stopping anything else (see `08_Week6_L07_RTOS.md`).

## Lab takeaways

- **Part 0, build and run:** zero warnings, FLASH 7340 B, RAM 2040 B. Banner: `LOAD = 47999 -> 1000 interrupts/s`, `PSC = 47 ARR = 19999 -> 50 Hz`, TIM14 `ARR = 65535`, wraps every 65.5 ms, `CC1P/CC1NP = 1/1`. At 20 cm: 7 LEDs, target 1900 us, reached in 20 frames = 0.4 s.
- **Part 1, clear UIF the EXTI way:** the banner stops part-way (it takes about 60 ms), the handler tail-chains into itself forever, SysTick (prio 3) is starved so time stops, and **the servo holds position**: PWM is hardware.
- **Part 2, drop the -1 from PSC:** 48.98 Hz; Renode read 48/s, then 49/s; the banner says 48 Hz (integer division); `CCR1 = 1500` gives 1531 us. Only the cross-check catches it.
- **Part 3, slew 1000 then 2:** snaps and jitters, or 500 frames = 10 s. Responsiveness against smoothness.
- **Part 4, measure the servo:** `servo_target_us = 400u + cm * 10u` (400 us at 0 cm, 2600 us at 220 cm, unclamped). Find where the horn stops, then set `SERVO_MIN_US`/`SERVO_MAX_US`. No answer is given, on purpose.
- **Part 5, `AF_TIM3 = 2`:** `TIM3 50/s`, `CCR1` moves, the servo does not; the banner shows `AF2`.
- **Part 6, which path:** `(EXTI)`, `cap 0`, `exti` +20/s, 5882 us = 58.8 us/cm. Delete the `FTSR1` line: `exti` +10/s, `echo 0 us = 0 cm (none)` forever, bar dark, servo stays at 1500. A width needs both edges (two capture channels, one per edge, is ST's *PWM input mode*).
- **Part 7, parking beeper:** LD4 period `cm x 5` ms, solid below 10 cm, only `millis()` and `now - then`; the other three jobs untouched. (Its quoted 6796 B predates the EXTI path.)
- **Where next:** `ping_at = now` drift; PB0 is `TIM3_CH3` on AF1 (brightness via `CCR3`); `SysTick_Config` for 1 s returns 1.

### Lab check T1-T10 (Main.c header)

Procedure: predict, change only that, run, explain in one sentence, show `git diff Main.c` (`git checkout Main.c` restores). Pass also needs the register or variable the change ends up in.

| Task | Change | Predicted effect | Why (lands in) |
|---|---|---|---|
| T1 | bar fills from PB7 down: `return (uint8_t)(0xFF00u >> lit);` | at 150 cm: PB7, PB6 (`0xC0`); at 50 cm: PB7-PB2 (`0xFC`). Slider 150 reads 152 cm, so PB7 alone | same `lit`, mask taken from the top bits (`GPIOB->BSRR`) |
| T2 | `gauge_us = SERVO_MIN_US + clamp(cm) * 1000 / FAR_CM` | servo column 1000 us at 0 cm, 2000 us at 200 cm (was 2000 / 1000); still glides | the mapping's slope flips sign (`servo_target_us`, then `TIM3->CCR1`) |
| T3 | `PING_MS` 50 | `exti` grows **40/s** (was 20); TIM3 still 50/s | 20 pings/s x 2 edges each; below the HC-SR04's >= 60 ms advice on silicon (`ping_at` grid) |
| T4 | `SERVO_SLEW_US` 200 | 1000 to 2000 us in **5 frames = 0.1 s** (was 50 = 1 s): near snap, echo noise reaches the horn | limiter moves 200 us per 20 ms frame (`TIM3->CCR1`) |
| T5 | `FAR_CM` 100 | first LED at cm <= **87**, 4 at <= 50, 7 at <= 12, all 8 only at 0 cm (never); servo pinned at 1000 us beyond 100 cm | thresholds every 12.5 cm: $(100-cm) \cdot 8/100$ (bar, `servo_target_us`) |
| T6 | dot: `return lit ? (uint8_t)(1u << (lit - 1u)) : 0u;` | 100 cm: **PB3 only** (`0x08`); slider 100 reads 101 cm, so **PB2** (`0x04`) | tip bit of the old bar; guard `lit == 0`, else the shift count is `0xFFFFFFFF` (UB) (`GPIOB->BSRR`) |
| T7 | heartbeat block: LD4 high when `beat_on` is set or `cm < 20u`, low otherwise | 25 cm: blinks (1 Hz); 15 cm: solid on; 25 cm again: blinking resumes | `cm` overrides the toggle; inside the 500 ms block the change shows at the next tick (`GPIOA->BSRR` bit 5) |
| T8 | `REPORT_MS` 250 | 4 lines/s, `TIM3` reads **12, 13, 12, 13** | timer unchanged, the label is wrong: 50 x 0.25 = 12.5 updates per window, printed as "/s" (`updates - last_updates`) |
| T9 | `TIM3->PSC = SystemCoreClock / 2000000u - 1u` (23) | `TIM3 100/s`; banner 100 Hz, still says "1 count = 1 us"; report still prints CCR1 1500 but the real pulse is **750 us** (range 500-1000 us); the gauge is squeezed into the 1.0 ms end of travel or onto the stop (Part 4's range decides) | ARR unchanged, so frame 10 ms; `TIM3->CCR1` holds the width **in counts**, now 0.5 us each |
| T10 | `cm = pulse * 10u / 588u;` | slider 151 cm (8882 us): **153 before, 151 after**; slider 100: 101 to 100, so 4 LEDs and 1500 us | integer maths, no overflow (65535 x 10 fits in 32 bits); `us / 58.8` is a double on an FPU-less M0+, pulling in software floating point (textbook context) (`cm`) |

## Exam focus

1. **Compute PSC and ARR** for a 1 us tick and a 20 ms frame at 48 MHz. PSC = 48 - 1 = **47**, ARR = 20000 - 1 = **19999**. For 2 MHz: PSC = 23. For a 10 ms frame at 1 us: ARR = 9999.
2. **SysTick LOAD for 1 ms?** 47999 (`0xBB7F`). Longest period? $2^{24}$ clocks = 350 ms. 1 s tick? `SysTick_Config` returns 1 (47 999 999 > `0xFFFFFF`).
3. **millis wrap:** `start = 0xFFFFFF00`, `now = 0x00000064`. Elapsed = `now - start` = **356 ms**. Wrap period: 49.7 days.
4. **Spot the bug:** `if (millis() >= deadline)`. Fails at the wrap: early fire, or never fires for 49.7 days. Use `millis() - start >= period`.
5. **Spot the bug:** `TIM3->SR = TIM_SR_UIF;` in the handler. UIF never clears (timer flags clear on 0), the handler re-enters forever, SysTick (lower priority) starves, the PWM keeps running. Fix: `TIM3->SR = ~TIM_SR_UIF;` (`0xFFFFFFFE`).
6. **Predict:** PSC = 48. **48.98 Hz**, every pulse 2 % long (1500 counts = 1531 us); only the TIM3-vs-SysTick count notices.
7. **Predict:** no `EGR = UG`. First period runs with prescaler 0: **0.4 ms**, not 20 ms. And with UG but no `SR = ~UIF`: a phantom first interrupt.
8. **Predict:** PA6 set to AF2. Report `TIM3 50/s`, `CCR1` moves, servo dead. Also forgetting `CCER.CC1E`: same symptom.
9. **Why input capture, not EXTI plus a timer read?** The hardware copies CNT into CCR1 at the edge, before the interrupt is requested; latency changes when you read it, not what it says. EXTI works only while both edges see equal latency.
10. **Echo across the 16-bit wrap:** rise 60000, fall 17664. `(uint16_t)(17664 - 60000)` = 23200 us = **400 cm** at 58 us/cm.
11. **Register values:** TIM3 `CCMR1 = 0x68` (OC1M 110, OC1PE), `CR1 = 0x81`, `CCER = 0x1`; TIM14 `CCMR1 = 0x1` (CC1S 01), `CCER = 0xB` (CC1NP, CC1P, CC1E: both edges). Rising only (`CCER = 0x1`): no widths, ever.
12. **Priority question:** why is TIM14 1, TIM3 2, SysTick 3? Deadline: the next edge overwrites CCR1; TIM3 has 20 ms; a late tick is still counted. `IPR4 = 0x40000080`, `SHPR3 = 0xC0000000`. Equal priorities: no preemption, lower IRQ number first.
13. **Clear conventions:** timer SR write 0, EXTI RPR1/FPR1 write 1, CC1IF by reading CCR1, SysTick nothing. **Schedules:** `ping_at += 100` holds the grid; `= now` accumulates every late pass.
14. **Tearing:** why `__disable_irq()` around reading `echo_count` and `echo_us`? So a capture cannot pair a new count with an old width. It does not delay the measurement: the timestamp is already in CCR1; the IRQ just stays pending.
15. **Servo maths:** cm = 101, target = 2000 - 101 x 1000 / 200 = **1495 us**, LEDs = 99 x 8 / 200 = **3**. `REPORT_MS = 250` shows `TIM3 12/s` or `13/s`: the count is per window, not per second.
