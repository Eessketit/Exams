# L05 GPIO and Interrupts: One Pin, Two Ways to Listen

What this lecture is about: every GPIO register of the STM32C031C6 with real numbers (from RM0490 or this lesson's `Main.elf`), then two buttons (A polled, B on EXTI) and the whole interrupt path: EXTICR, EXTI, NVIC, vector table, handler.

## 1. The lesson pins and the peripheral model (pin maps, slides 1-2)

| Pin | Use | Mode | | Pin | Use | Mode |
|---|---|---|---|---|---|---|
| PA0 | button A, **polled**, pull-up | in `00` | | PA5 | LD4 heartbeat (also `D13`) | out `01` |
| PA1 | button B, **EXTI line 1**, pull-up | in `00` | | PB0-PB7 | LED bar (Wokwi name `PB0.1` for PB0) | out `01` |
| PA2 / PA3 | USART2 TX / RX | AF1 `10` | | PA13 / PA14 | SWD debug lines | AF at reset |

Slide 1, the L00 model filled in for GPIO (model: see 01_Week2_L00_ProgrammersModel.md, peripheral model):

| Model slot | GPIO on this chip |
|---|---|
| clock gate | `RCC->IOPENR`, one bit per port (A, B, C, D, F) |
| control | `MODER` what, `OTYPER` how it drives, `OSPEEDR` how fast, `PUPDR` pull, `AFR[2]` which peripheral (`LCKR` freezes them) |
| data in | `IDR`: what the pin *is* now |
| data out | `ODR`: what it *should be*; `BSRR`, `BRR`: change it without reading |
| event | **not in GPIO**: a separate block, **EXTI** (Part E) |

- Slide 2: a register is **a 32-bit number at a fixed address**; writing it changes hardware, reading it reports hardware. Bits 31 (left) to 0. **One hex digit = 4 bits**: `0xEBFFFFFF` = `1110 1011 1111 ... 1111`.
- Three operations do all the work: `1u << n` (only bit n, `1u << 5` = `0x20`), `x & ~mask` (clear), `x | value` (set).

## 2. Every GPIO register: layout, reset, worked example (slides 3, 5-14)

**GPIOA base `0x50000000`, GPIOB `0x50000400`: same offsets, different base** (`GPIO_TypeDef` in `stm32c031xx.h`; `GPIOA->IDR` = member at `0x10` = `0x50000010`). Bold = used by this lesson.

| Register (offset) | Bits per pin n | Field values | Reset (GPIOA) | Slide's worked example |
|---|---|---|---|---|
| **MODER** (0x00) | 2, bits 2n+1:2n | `00` input, `01` output, `10` alternate function, `11` analog | `0xEBFFFFFF` | PA5 to output: bits 11:10 `11` -> `01`: `0xEBFFF7FF` |
| OTYPER (0x04) | 1, bit n (31:16 reserved) | `0` push-pull, `1` open-drain | `0x00000000` | left at reset: all outputs push-pull |
| OSPEEDR (0x08) | 2 | `00` very low, `01` low, `10` high, `11` very high | `0x0C000000` | all pins left very low |
| **PUPDR** (0x0C) | 2 | `00` none, `01` pull-up, `10` pull-down, `11` reserved | `0x24000000` | PA0, PA1 pull-up: `0x24000005` |
| **IDR** (0x10) | 1, read only | pin level now | depends on pins | `0x0000A001`: PA15, PA13, PA0 high; `(IDR >> 1) & 1` = 0, PA1 low |
| ODR (0x14) | 1 | 1 high, 0 low | `0x00000000` | `ODR \|= 1u << 5` = ldr, orrs, str at offset 20 |
| **BSRR** (0x18) | 1 + 1, write only | bit n = 1: high; bit n+16 = 1: low; 0: no change | write only | PA5 high `0x00000020`, low `0x00200000`; bar `leds = 0b101`: `0x00FA0005` |
| LCKR (0x1C) | bit 16 LCKK, 15:0 LCK | freeze config until reset | `0x00000000` | not used |
| **AFR[0]**, AFR[1] (0x20, 0x24) | 4, `AFR[n / 8]` | AF number from the datasheet's table, per pin | `0x00000000` | USART2 PA2, PA3 = AF1: `AFR[0]` = `0x00001100` |
| BRR (0x28) | 1, bits 15:0, write only | 1 = pin low | write only | `GPIOA->BRR = 1u << 5` (`0x20`): PA5 low |

## 3. The one rule: pin n lives at n, 2n or 4n (slide 4)

| Register kind | Bits per pin | Pin n at | Pin 0 | Pin 1 | Pin 5 | Pin 13 |
|---|---|---|---|---|---|---|
| `OTYPER`, `IDR`, `ODR` | 1 | bit n | 0 | 1 | 5 | 13 |
| `MODER`, `OSPEEDR`, `PUPDR` | 2 | bits 2n+1 : 2n | 1:0 | 3:2 | 11:10 | 27:26 |
| `AFR[n / 8]` | 4 | bits 4(n mod 8)+3 : 4(n mod 8) | AFR[0] 3:0 | AFR[0] 7:4 | AFR[0] 23:20 | AFR[1] 23:20 |
| `BSRR` | 1 + 1 | bit n sets, bit n+16 resets | 0 / 16 | 1 / 17 | 5 / 21 | 13 / 29 |

Shifts: $2n$ for 2-bit fields, $4(n \bmod 8)$ in register $\lfloor n/8 \rfloor$ for AFR, $n+16$ for BSRR reset. "This is the whole map": calculate bit positions, never memorise them.

## 4. MODER reset and the analog trap (slides 5-6)

- Reset `0xEBFFFFFF` = `11 10 10 11 11 ... 11` for pins 15..0: **every pin `11` analog except PA14 and PA13 = `10` AF**, the SWD lines (the debugger must reach the chip before any code runs).
- Analog is the safe default (nothing driven, floating input draws no current), **but an analog pin reads 0 in IDR**, whatever the voltage. For an active-low button that is "pressed, forever".
- The rule: **input mode is written, never assumed.** `gpio_init()` writes `00`; the banner prints MODER as it was at reset (Lab Part 1 deletes that line).
- PA5 to output in C: `GPIOA->MODER = (GPIOA->MODER & ~(3u << 10)) | (1u << 10);`

## 5. OTYPER, OSPEEDR and PUPDR in detail (slides 7-9)

- **Push-pull** (`0`): P-MOS (pin to 3.3 V) and N-MOS (pin to GND), drains joined at the pin, gates driven together by **NOT ODR**, so exactly one conducts (P-MOS conducts on gate **low**, N-MOS on gate **high**). ODR = 1: P on, N off, pin 1. ODR = 0: P off, N on, pin 0. Drives both ways, fast and strong.
- **Open-drain** (`1`): P-MOS off for good; pull low or let go, *high* comes from a resistor. Two open-drain outputs can **share one wire safely** (worst case both pull low); two push-pull outputs fighting short 3.3 V to GND. It is a **wired-AND** (wire = 1 only if every chip lets go): how I2C puts many chips on two wires (lesson 09 sets OTYPER).
- **OSPEEDR** "speed" = **slope of each edge**, not how often software can toggle. Sharp edges for SPI at tens of MHz; they radiate more noise and cost current. Reset `0x0C000000`: bits 27:26 = `11`, **PA13 very high** (debug line), all else very low. Rule: **choose the slowest speed that works** (the quietest).
- **PUPDR**: an undriven pin is neither 0 nor 1, it drifts and reads randomly; a pull resistor gives a default. Reset `0x24000000` = `00 10 01 00 ...`: **PA14 = `10` pull-down, PA13 = `01` pull-up** (debug lines), rest float. A button to GND needs a **pull-up**.

## 6. IDR, ODR and read-modify-write (slides 10-11)

- IDR is a live snapshot of all 16 pins; writing it does nothing. Read one pin by **shifting it to bit 0 and masking**: `(GPIOA->IDR >> 1) & 1u`, or test `GPIOA->IDR & (1u << 1)`. `0x0000A001` = `1010 0000 0000 0001`. Warnings: an **analog** pin always reads 0; an **output** pin reads what it actually does (usually, not always, what ODR asked).
- ODR: `|= (1u << 5)` high, `&= ~(1u << 5)` low, `^= (1u << 5)` toggle. Each is **three** steps on a load/store core (see 02_Week2_L01_InstructionSet_Thumb.md, load and store):

```
movs r2, #160 ; movs r3, #32 ; lsls r2, r2, #23    r2 = 160 << 23 = 0x50000000, r3 = 1 << 5
ldr  r1, [r2, #20]      1. READ ODR (offset 20 = 0x14)
orrs r3, r1             2. MODIFY
str  r3, [r2, #20]      3. WRITE back
```

## 7. BSRR, the safe one (slides 12-13)

`bits 31..16 = RESET pin 15..0 | bits 15..0 = SET pin 15..0`. Zeros mean "leave alone", so **one write sets some pins, clears others, ignores the rest**. The bar: `GPIOB->BSRR = ((uint32_t)(uint8_t)~leds << 16) | leds;` with `leds = 0000 0101`: low half `0x0005` sets PB0, PB2; `~leds = 1111 1010` gives high half `0x00FA`, resetting PB1, PB3-PB7; BSRR = `0x00FA0005`, PB8-PB15 untouched.

Slide 13: `main()` does `ODR |= 1 << 5`, a handler does `ODR |= 1 << 6`, the interrupt lands inside main's sequence:

| Step | Who | Action | ODR after |
|---|---|---|---|
| 1 | main | `ldr r1, ODR` reads `0x00` | 0x00 |
| 2 | handler | ldr, orr, str | **0x40** (PA6 on) |
| 3 | main | `orrs r3, r1`: `0x00 \| 0x20` = 0x20 | 0x40 |
| 4 | main | `str r3, ODR` | **0x20**: PA5 on, **PA6 off again** |

- main wrote back a copy read **before** the handler changed it: the **lost update** (see 05_Week4_L03_Execution_Concurrency.md, lost update).
- `GPIOA->BSRR = 1u << 5` compiles to `movs r3,#160; movs r2,#32; lsls r3,r3,#23; str r2,[r3,#24]`: **one store** (offset 24 = 0x18). An interrupt lands before or after, never inside: **atomic**. That is why BSRR exists.

## 8. AFR, which peripheral gets the pin (slide 14)

- Only meaningful when MODER = `10`. Four bits per pin, two registers: `AFR[0]` pins 0-7, `AFR[1]` pins 8-15.
- The number means nothing alone: looked up in the datasheet's AF table, **different for every pin**. USART2 TX/RX on PA2/PA3 are both AF1, so `AFR[0]` = `0x00001100` (bits 11:8 = 1, bits 15:12 = 1).
- A wrong AF number = a pin that looks configured and carries nothing; no error, no fault (lesson 06 meets it with a timer). The LEDs and buttons never touch AFR.

## 9. The helpers pin mode and pin pull, traced (slides 15-17)

`pin_mode(port, pin, mode)` is `port->MODER = (port->MODER & ~(3u << (pin * 2u))) | (mode << (pin * 2u));` and `pin_pull()` is identical on PUPDR. Enums: `MODE_INPUT 0, MODE_OUTPUT 1, MODE_AF 2, MODE_ANALOG 3`; `PULL_NONE 0, PULL_UP 1, PULL_DOWN 2`.

Slide 15, `pin_mode(GPIOA, 5, MODE_OUTPUT)`:

| Step | Expression | Value |
|---|---|---|
| where are pin 5's bits | `pin * 2` | 10, bits 11:10 |
| mask covering them | `3u << 10` | `0x00000C00` |
| everything except them | `~(3u << 10)` | `0xFFFFF3FF` |
| read the register | `port->MODER` | `0xEBFFFFFF` (reset) |
| erase pin 5's bits | `MODER & 0xFFFFF3FF` | `0xEBFFF3FF` |
| new mode in place | `1u << 10` | `0x00000400` |
| insert | `0xEBFFF3FF \| 0x400` | **`0xEBFFF7FF`** |

- Only bits 11:10 changed; the other 15 pins are exactly as they were. `MODER = 1u << 10` would make all other pins inputs, **including the debug pins**. `MODER |= 1u << 10` alone turns `11` into `11` (still analog): **OR can only turn bits on**.

Slide 16 (writes replayed on the reset value) and slide 17:

| After | GPIOA MODER | Changed | | After | GPIOA PUPDR |
|---|---|---|---|---|---|
| reset | `0xEBFFFFFF` | | | reset | `0x24000000` |
| `pin_mode(GPIOA, 5, OUTPUT)` | `0xEBFFF7FF` | PA5 `11` -> `01` | | `pin_pull(GPIOA, 0, PULL_UP)` | `0x24000001` (bits 1:0 = 01) |
| `pin_mode(GPIOA, 0, INPUT)` | `0xEBFFF7FC` | PA0 `11` -> `00` | | `pin_pull(GPIOA, 1, PULL_UP)` | **`0x24000005`** (bits 3:2 = 01) |
| `pin_mode(GPIOA, 1, INPUT)` | `0xEBFFF7F0` | PA1 `11` -> `00` | | | |
| `uart2_init()`: PA2, PA3 AF | **`0xEBFFF7A0`** | PA2, PA3 `11` -> `10` | | | |

- `0x...F7A0` low pairs, pins 7..0: `11 11 01 11 10 10 00 00` = an an out an AF AF in in. The whole pin configuration in one number; the banner prints each field read back.
- `5` = `0101`: pull-up on pins 1 and 0. Because MODER, OSPEEDR and PUPDR share the 2-bits-per-pin layout, **one line of code configures any of them for any pin**.

## 10. The clock gate comes first (slide 18)

```c
RCC->IOPENR |= RCC_IOPENR_GPIOAEN | RCC_IOPENR_GPIOBEN;   /* FIRST, always */
```

- Without it, **writes to GPIOA vanish and reads return 0**: no error, no fault (lesson 04 Lab Part 0: LED dead, both pieces of code correct). Header bits: GPIOAEN 0, GPIOBEN 1, **GPIOCEN 2** (`0x4`), GPIODEN 3, GPIOFEN 5.
- Fixed order in `gpio_init()`: 1. clock (`IOPENR`), 2. mode (`MODER`), 3. pulls, types, speeds (`PUPDR`, `OTYPER`, `OSPEEDR`), 4. only then use (`IDR`, `ODR`, `BSRR`). Course rule: **clock, configure, use.**

## 11. Buttons: pull-up, active low, bounce (slides 19-20)

| Button | Pin level | IDR bit | `button_down()` |
|---|---|---|---|
| released | high (pull-up wins) | 1 | false |
| pressed | low (switch to GND wins) | **0** | true |

- **Active low**, hidden in one place: `static inline uint32_t button_down(uint32_t pin) { return pin_read(GPIOA, pin) == 0u; }`
- Contacts bounce for **about 1 ms**. Wokwi's pushbutton by default makes **10 to 100 transitions over about 1 ms** per press (citing Horowitz and Hill); `"bounce": "0"` turns it off. Every falling edge taken as a press = **many presses from one**: debouncing is part of reading a button.

## 12. Button A: the polled debouncer (slides 21-22)

Sampled **once per ms**; a new level is believed only after holding **`DEBOUNCE_MS` = 20** samples in a row.

```c
typedef struct { uint8_t stable; uint8_t raw; uint16_t held_ms; uint32_t changes; } debounce_t;
static int debounce_step(debounce_t *d, uint8_t raw) {
    if (raw != d->raw) { d->raw = raw; d->held_ms = 0; d->changes++; return 0; }   /* moved: restart */
    if (d->held_ms < DEBOUNCE_MS) {
        d->held_ms++;
        if (d->held_ms == DEBOUNCE_MS && raw != d->stable) { d->stable = raw; return raw ? +1 : -1; }
    }
    return 0;
}
```

`stable` = accepted level (1 = pressed), `raw` = last sample, `held_ms` = samples unchanged, `changes` = raw moves including bounce (printed as "level changes seen at 1 kHz"). Returns **+1 press, -1 release, 0** otherwise; `debounce_t a = { 0 };` starts released.

Trace (slide 21 continued), `DEBOUNCE_MS` shrunk to **3**, fields after each 1 ms call:

| ms | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| raw | 0 | 0 | **1** | **0** | 1 | 1 | 1 | 1 | 1 |
| held | 1 | 2 | 0 | 0 | 0 | 1 | 2 | 3 | 3 |
| stable | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** | 1 |
| event | | | bounce, restart | bounce, restart | restart | | | **PRESS** | nothing more |

- Reported at **ms 8, not ms 3**: latency = `DEBOUNCE_MS` after the **last** bounce (the price of certainty). `changes` rose at ms 3, 4, 5: **3 level changes for one press**.
- Slide 22: **polling is a filter**: bounces are microseconds apart, samples 1 ms, so most bounces fall between samples. A shows 1-2 changes because sampling is too slow to see the mess, not because the button is clean.
- **It depends on the loop coming back**: `printf` at 115200 baud costs about **87 us per character** ($10/115200$ s). Harmless for a button; a pulse shorter than the loop is invisible. Polling is simple, cheap, predictable; wrong when you must not miss an event or the CPU has better things to do.

## 13. Button B: the three-hop interrupt path (slide 23)

**GPIO does not interrupt.** `PA1 -> EXTICR (which port?) -> EXTI line 1 (RTSR1/FTSR1, RPR1/FPR1 latch, IMR1 mask) -> NVIC IRQ 5 -> vector 21 handler`. **Every arrow has its own switch, every switch defaults to OFF; miss one and nothing happens: no error, no fault, no warning.**

EXTI (`EXTI_TypeDef`, base **`0x40021800`**) and NVIC (`NVIC_Type`, `core_cm0plus.h`, base **`0xE000E100`**), value after `button_b_irq_init()`:

| Block | Offset | Register | Job | This lesson |
|---|---|---|---|---|
| EXTI | 0x00 | **RTSR1** | rising-edge trigger enable, bit n = line n | `0x00000002` |
| EXTI | 0x04 | **FTSR1** | falling-edge trigger enable | `0x00000002` |
| EXTI | 0x08 | SWIER1 | software trigger: write 1 = an edge | debugger only |
| EXTI | 0x0C, 0x10 | **RPR1**, **FPR1** | rising / falling edge latched; write 1 to clear | hardware sets, handler clears |
| EXTI | 0x60-0x6C | **EXTICR[0]**-[3] | which port feeds each line, 4 lines per register | `EXTICR[0]` = `0x00000000` (line 1 = A) |
| EXTI | 0x80 | **IMR1** | interrupt mask, 1 = on to the NVIC | bit 1 set |
| EXTI | 0x84 | EMR1 | event mask: wake-up without interrupt | not used |
| NVIC | 0x000, 0x080 | **ISER**, ICER | set-enable / clear-enable, bit n = IRQ n; writing 0 does nothing | ISER `0x00000020` |
| NVIC | 0x100, 0x180 | ISPR, ICPR | set-pending by software / clear-pending | ISPR: debugger only |
| NVIC | 0x300-0x31C | **IPR[0]**-[7] | priority, 1 byte per IRQ, top 2 bits used | `IPR[1]` = `0x00008000` |

- EXTI reserved gaps: 0x14-0x5C and 0x70-0x7C. IMR1 bits 19, 23, 25, 31 are direct lines from other peripherals; EMR1 has the same lines plus 16-18.
- `NVIC_EnableIRQ()` / `NVIC_SetPriority()` write the NVIC for you; **every EXTI register is written by hand**.
- One switch in neither block: **PRIMASK** (core register) turns off all interrupts at once; it is the one switch that starts **on** (`0x00000000` = interrupts enabled).

## 14. Hop 1: EXTICR, which port feeds this line (slide 24)

16 GPIO lines (0-15); **line n watches pin n** of the port chosen by EXTICR. Each line is a **multiplexer**: one input through at a time. Port codes: **A = 0, B = 1, C = 2, D = 3, F = 5**.

Layout: line n -> `EXTICR[n / 4]`, bits $8(n \bmod 4)+7 : 8(n \bmod 4)$: **8 bits per line**, port code in the low 3 bits, the rest reserved (leave 0). Header mask `EXTI_EXTICR1_EXTI1_Msk` = `0x7 << 8`. `EXTICR[0]` = line 3 (31:24), line 2 (23:16), **line 1 (15:8)**, line 0 (7:0).

| Line | Register (address) | Bits | For | Code | Register value |
|---|---|---|---|---|---|
| 1 | `EXTICR[0]` (0x40021860) | 15:8 | PA1, button B | 0 | `0x00000000` |
| 13 | `EXTICR[3]` (0x4002186C) | 15:8 | PC13, Lab Part 7 | 2 | `0x00000200` |

```c
const uint32_t line = 1, shift = (line % 4u) * 8u;          /* shift = 8 */
EXTI->EXTICR[line / 4u] = (EXTI->EXTICR[line / 4u] & ~(0xFFu << shift)) | (EXTI_PORT_A << shift);
```

- **PA1 and PB1 cannot both interrupt**: they share line 1. PC1 is code 2 in the design, but this 48-pin package has no PC1 pin.
- **Port A's code is 0 = the reset value**: forget EXTICR and a port-A button works *by accident*; move it to port C and it silently stops.
- C0-specific: `EXTICR` is **in EXTI** (RM names `EXTI_EXTICR1..4`). On an STM32F4 it is `SYSCFG->EXTICR[]`: F4 tutorial code will not compile here.

## 15. Hop 2: edges, pending, mask (slide 25)

Line 1 is bit 1 in all five registers, `1u << 1` = `0x00000002`: **RTSR1** trigger on rising (release), **FTSR1** on falling (press), **RPR1 / FPR1** a rising / falling edge has happened (hardware sets), **IMR1** pass to the NVIC (unmask).

```c
EXTI->RTSR1 |= 1u << 1;   EXTI->FTSR1 |= 1u << 1;
EXTI->RPR1   = 1u << 1;   EXTI->FPR1   = 1u << 1;   /* clear anything already pending */
EXTI->IMR1  |= 1u << 1;                             /* unmask LAST, once everything is ready */
```

- Pending registers are **write 1 to clear**: `= 0x2` clears bit 1 and leaves every other line alone. **Assign, never `|=`**: `|=` reads the other lines' pending 1s and writes them back, clearing edges nobody has handled yet.
- C0-specific: rising and falling latch into **separate** RPR1 and FPR1; older STM32 families have one `PR`.

## 16. Hop 3: NVIC enable and priority (slide 26)

ARM's NVIC, identical on every Cortex-M0+. **EXTI lines 0 and 1 arrive together as IRQ 5** (`EXTI0_1_IRQn`).

| Item | Value |
|---|---|
| enable | `NVIC_EnableIRQ(EXTI0_1_IRQn)` writes `1 << 5` = `0x00000020` to ISER; zeros leave others alone (like BSRR) |
| priority | `NVIC_SetPriority(EXTI0_1_IRQn, 2)`: IRQ 5 -> `IPR[1]`, byte 1 (bits 15:8) -> `2 << 6` = `0x80` -> **`IPR1 = 0x00008000`** |
| levels | **4**: 0 most urgent to 3, in the **top 2 bits** of each byte (`__NVIC_PRIO_BITS = 2`); other bits read 0 |
| external IRQs | up to 32 on a Cortex-M0+; the C031 uses 0-28 |

- IRQ k -> `IPR[k / 4]`, byte $k \bmod 4$, value $p \ll 6$. `IPR[1]` holds IRQ 7 (31:30), IRQ 6 (23:22), **IRQ 5 (15:14)**, IRQ 4 (7:6).
- **Vectors are shared**: IRQ 5 = lines 0-1, IRQ 6 = lines 2-3 (`EXTI2_3_IRQn`), IRQ 7 = lines 4-15 (`EXTI4_15_IRQn`). A handler **must check the pending bits** to find which line fired.

## 17. The vector table and the handler (slides 27-28)

vector $= 16 + \text{IRQ} = 16 + 5 = 21$; address $=$ `0x08000000` $+ 21 \times 4 =$ **`0x08000054`** (first 16 entries belong to the core; see 04_Week3_L04_Startup_LinkerScript.md, vector table).

- From `Main.elf`: `objdump -s -j .isr_vector --start-address=0x08000054` gives bytes `3d 02 00 08`, little-endian **`0x0800023D`**; `nm Main.elf | grep EXTI0_1` gives `0800023c T EXTI0_1_IRQHandler`. The **+1 is the Thumb bit** (see 02_Week2_L01_InstructionSet_Thumb.md, Thumb bit).
- Nothing magic: the hardware loads a word from a fixed address and jumps there; your job is the right function in that word.

```c
void EXTI0_1_IRQHandler(void) {
    uint32_t mask = 1u << BTN_B_PIN;
    if ((EXTI->RPR1 | EXTI->FPR1) & mask) { EXTI->RPR1 = mask; EXTI->FPR1 = mask; b_edges++; }
}
```

- Disassembly: `ldr r3,=0x40021800; ldr r1,[r3,#12] (RPR1); ldr r2,[r3,#16] (FPR1); orrs; movs r2,#2; tst; beq done; str r2,[r3,#12]; str r2,[r3,#16]; ldr r2,=&b_edges; ldr; adds #1; str; done: bx lr`.
- **Fourteen instructions**, no special prologue or return. Uses only r1-r3, already saved by hardware (see 05_Week4_L03_Execution_Concurrency.md); `bx lr` with `lr` = special **EXC_RETURN** value. Whole visit on the order of **1 us at 48 MHz**.

## 18. Write 1 to clear, and the handler name (slides 29-30)

- Slide 29: the pending bit is EXTI's memory of the edge; the NVIC sees the line while it is set. **Not cleared: return, still pending, tail-chained straight back in, `main()` never runs again.** Symptom: works until the first press, then **freezes completely** (heartbeat stops, serial quiet). Not crashed: the handler runs flat out.
- Slide 30: `startup.c` fills vector 21 with a **weak** placeholder pointing at `Default_Handler` (infinite loop). Defining exactly `EXTI0_1_IRQHandler` makes a **strong** symbol that replaces it at link. **The name is the only connection.**

| Build | Correct name | Misspelt `EXTI0_1_IRQhandler` |
|---|---|---|
| warnings | 0 | **0** |
| FLASH | 7156 B | **7120 B**: the 36 missing bytes are your handler, deleted as dead code |
| `nm` for `EXTI0_1_IRQHandler` | `T` (yours) | **`W`** (the placeholder) |

Defences: **look** (`arm-none-eabi-nm Main.elf | findstr IRQHandler`: every handler you wrote must show `T`) and **check at run time** (the banner compares vector 21 with `Default_Handler` and prints `YOUR HANDLER IS NOT INSTALLED`).

## 19. Count in the handler, decide in main (slides 31-32)

```c
uint32_t edges = b_edges;                                  /* one read of the counter      */
if (edges != b_seen) { b_seen = edges; b_quiet_ms = 0; b_armed = 1; }   /* restart the clock */
else if (b_armed && ++b_quiet_ms >= DEBOUNCE_MS) { b_armed = 0; uint8_t down = button_down(BTN_B_PIN); /* settled? */ }
```

- Every edge **restarts a 20 ms stopwatch**; when it ends with no new edge the bouncing is over: look at the pin once and see where it settled.
- `b_edges` needs no lock: L03 slide 7's **one safe case**, a single aligned 32-bit word written by only one side (old or new value, never half). **`volatile`** so `main()` reads memory every time (see 05_Week4_L03_Execution_Concurrency.md, volatile and atomicity).
- Not in the handler: a 20 ms wait there blocks everything of equal or lower priority for 20 ms. **Handlers record; `main()` decides** (unchanged in the lesson 07 RTOS).

Slide 32, predicted counts per press (slide: predictions from Wokwi's documented behaviour, not yet watched):

| | Button A, polled | Button B, interrupt |
|---|---|---|
| bounce on (Wokwi default) | 1, occasionally 2-3 | many, tens per press |
| bounce off (`"bounce": "0"`) | 1 | **exactly 1** |

The interrupt sees what actually happened; the poll sees a sampled summary. Neither is wrong; choosing is the engineering.

## 20. Seven ways to get silence, and the debugger (slides 33, 33b)

All build with **zero warnings**:

| # | Forgot | Symptom |
|---|---|---|
| 1 | `RCC->IOPENR` for the port | writes vanish; the pin never becomes anything |
| 2 | `MODER` input mode | pin stays analog, reads 0: "pressed" forever |
| 3 | `PUPDR` pull-up | released button floats; phantom presses |
| 4 | `EXTICR` port select | works on port A by luck, dead elsewhere |
| 5 | `IMR1` unmask | edges latch in `FPR1`, never reach the NVIC |
| 6 | `NVIC_EnableIRQ` | NVIC holds it pending; handler never runs |
| 7 | handler name, exactly | vector 21 -> `Default_Handler`; hangs on first press |
| - | clearing the pending bit | the opposite: handler runs forever |

The checklist for every interrupt in the course: **walk slide 23's path hop by hop, reading each register back** (the banner does exactly that).

Slide 33b, why F5 clicks miss: a click is a press **and** a release while a halted chip freezes simulated time; a breakpoint on `b_edges++` stops once per **bounce edge**; one on `debounce_step()`'s first line stops 1000 times a second. Three rules: (1) **latch the input**: Ctrl-click a Wokwi button (stays pressed until the next click) or hold the A / B key; (2) **break where the event is decided, not where the signal arrives**: `d->stable = raw;` and `b_count++` run once per press; (3) **inject the event from the register** (Debug Console):

```
-exec set *(unsigned int *)0x40021808 = 2     EXTI->SWIER1: one rising edge on line 1 -> RPR1 bit 1, counts one clean edge
-exec set *(unsigned int *)0xE000E200 = 32    NVIC->ISPR: pend IRQ 5 with no EXTI event -> if is false, counts nothing
```

"Never trust the vector, read the pending bit." (Slide: predicted from RM0490 and Wokwi docs, not yet watched.)

## 21. What carries forward (slide 34)

- Slide 4's table works for **every pin of every port**: you calculate, never look up.
- **Read-modify-write vs a single store** is the most common embedded concurrency bug, now visible in a disassembly.
- **Poll or interrupt is a choice made on evidence**: both measured on the same button.
- **The interrupt path is the same shape everywhere** (timer, UART, ADC): pending bit, NVIC line, exactly-named vector. Lessons 06, 08, 09 reuse slide 23.
- **The polled millisecond is lying a little**: `tick_wait()` polls SysTick `COUNTFLAG`, which remembers only **one** wrap; while a `printf` blocks 5 ms, **four ticks are lost** and `ms_now` runs slow. Lesson 06 makes SysTick an interrupt (see 07_Week5_L06_Time_Timers.md).

## Lab takeaways

Baseline: **FLASH 7156 B (21.84 % of 32 KB), RAM 2008 B (16.34 % of 12 KB)**, zero warnings. No `startup.c` / `link.ld` in the folder (shared `_startup\c031c6\`); printf glue in `_lib\retarget.c` (`set LIBS=retarget`). Paste `diagram.json` into Wokwi first (the buttons live there). Put each change back before the next part.

| Part | What you break | Symptom | Why |
|---|---|---|---|
| 0 | nothing: read banner, press A and B | banner MODER should read `0xEBFFFFFF`; vector 21 = `0x0800023D`. A: 1 change per press; B: tens (e.g. 23 press, 17 release), random | same bounce on both; the 1 kHz poll is a free low-pass filter, EXTI catches edges microseconds apart |
| 1 | delete `pin_mode(GPIOA, BTN_A_PIN, MODE_INPUT)` | banner `ANALOG`; on silicon idle `A=0`: a press nobody made 20 ms after reset, LED moves left once, then A is dead | analog input buffer off, IDR = 0 = active-low "pressed" forever. Write the mode, never inherit reset (Wokwi may be kinder) |
| 2 | `"bounce": "0"` on button B (no rebuild) | exactly 1 edge per press, 1 per release | a clean switch changes once each way; every Part 0 count above 1 was bounce, now measured |
| 3 | delete `EXTI->RPR1 = mask; EXTI->FPR1 = mask;` | everything stops on the first B press: LD4 frozen, A dead, no B line | bit still set, NVIC tail-chains back in forever; starts at the first event, not at reset |
| 4 | rename to `EXTI0_1_IRQhandler` | clean build, **7120 B** (36 B smaller); `nm`: `080005d0 W EXTI0_1_IRQHandler` (same address as other unused handlers); banner `0x080005D1 Default_Handler - YOUR HANDLER IS NOT INSTALLED`; B press hangs | weak alias wins; your uncalled function removed by `--gc-sections`; `Default_Handler` loops by design so a debugger finds it parked. Habit: `nm`, look for `T` |
| 5 | comment out `NVIC_EnableIRQ(EXTI0_1_IRQn)` | banner `NVIC IRQ 5 enabled : 0`; B does nothing, A works, nothing hangs; added printf shows `FPR1 bit 1` 0 -> 1 and stays 1 | hops 1 and 2 latched the edge; NVIC blocks it; only the handler clears it. Walk the path, find where the bit stops moving |
| 6 | `bar_write()` body -> `GPIOB->ODR = leds;` | 8 B smaller, also one store (`str r0, [r3, #20]`) | but it **forces PB8-PB15 to 0**; the non-clobbering `ODR = (ODR & ~0xFF) \| leds` is load, AND, OR, store: lost-update window. BSRR version is `mvns, uxtb, ldr, lsls, orrs, str [r2,#24], bx lr`: one store, no load |
| 7 | add button C on **PC13**, interrupt sends LED home to PB0 | skip EXTICR: PC13 unheard | EXTICR reset 0 = port A, so line 13 watches **PA13** (debug pin). Steps: IOPENR bit 2, input + pull-up, `EXTICR[3]` bits 15:8 = 2, bit `0x2000` in RTSR1 / FTSR1 / RPR1 / FPR1 / IMR1, **IRQ 7 `EXTI4_15_IRQn`**, handler **`EXTI4_15_IRQHandler`** checking bit 13, LED moved in `main()`. Reference: 7316 B FLASH, 2016 B RAM, `T EXTI4_15_IRQHandler` |
| 8 | debugger (optional, unwatched) | Ctrl-click A, break on `d->stable = raw;`: hits ~20 ms later, `raw = 1`, `held_ms = 20`; break on `b_edges++`: one stop per bounce; SWIER1 write: one clean edge, but `main()` prints nothing; ISPR write: handler entered, `if` false, nothing counted | never step with the button in hand; the interrupt fired but no press happened (pin still released); never assume which line fired, or that one fired |

Where next (exam-style): `DEBOUNCE_MS` = 1 (double presses?) vs 200 (missed fast presses?); FTSR1 only (Exam focus Q12); `ms_now` drift per printed line (Q20).

## Exam focus

1. **Pin 13's bits in MODER, IDR, AFR, BSRR?** MODER 27:26; IDR bit 13; `AFR[1]` 23:20; BSRR set 13, reset 29.
2. **Decode `GPIOA->MODER = 0xEBFFF7A0`.** Pins 15..0: `11 10 10 11 11 11 11 11 11 11 01 11 10 10 00 00`: PA14/13 AF (SWD), PA5 out, PA3/2 AF, PA1/0 in, rest analog.
3. **`pin_mode(GPIOA, 4, MODE_OUTPUT)` from `0xEBFFF7A0`?** Mask `3 << 8` = `0x300`; `& ~0x300` = `0xEBFFF4A0`; `| 0x100` = **`0xEBFFF5A0`**.
4. **Spot the bug: `GPIOA->MODER |= 1u << 10;` for PA5 output.** Reset field `11` OR `01` = `11`, still analog; clear first. `MODER = 1u << 10` instead makes PA13/PA14 inputs and kills SWD.
5. **One BSRR write: PA0 high, PA5 low.** `(1 << 0) | (1 << 21)` = **`0x00200001`**. Bar with `leds = 0x81`: `0x007E0081`.
6. **Why does `ODR |= 1 << 5` in main lose PA6 set by an ISR, but BSRR cannot?** ODR is load-OR-store; an ISR between load and store is overwritten by the stale copy (ODR ends `0x20`). BSRR is one store with no read: atomic.
7. **A button reads 0 permanently.** Forgot input mode (analog reads 0) or the port clock (reads return 0). Check the MODER field and IOPENR.
8. **Handler without the pending clear: predict.** Board freezes on the first press (heartbeat stops); tail-chaining forever; not a crash.
9. **Spot the bug: `EXTI->FPR1 |= mask;`.** Writes back other lines' pending 1s, clearing unhandled edges. Write-1-to-clear wants `=`.
10. **Button on PB7 as interrupt: EXTICR value, IRQ, vector address?** Line 7 -> `EXTICR[1]` bits 31:24 = code 1 -> `0x01000000`; IRQ 7 `EXTI4_15_IRQn`; vector 23 at `0x0800005C`; ISER `0x80`. (PB1 instead: `EXTICR[0]` = `0x00000100`.)
11. **`NVIC_SetPriority(EXTI4_15_IRQn, 1)`?** IRQ 7 -> `IPR[1]` byte 3 -> `1 << 6` = `0x40` -> `0x40000000`. IRQ 5 priority 2 -> `0x00008000`.
12. **B with only FTSR1, `"bounce": "0"`?** Press: falling edge, 20 ms quiet, pin down, press reported, `b_down = 1`. Release: no falling edge, nothing arms, `b_down` stays 1; next press reads down = `b_down`, nothing reported. **Works once, then never.** With bounce, release bounces include falling edges that arm the stopwatch, so releases were seen by accident.
13. **PC13 button, EXTICR forgotten: what does line 13 watch?** PA13 (code 0 = port A = reset), the SWD pin. Port-A buttons hide this bug; PA1 and PB1 can never both interrupt.
14. **Handler misspelt: build and `nm`?** Zero warnings, 36 B smaller (7156 -> 7120), `W EXTI0_1_IRQHandler` at `Default_Handler`; banner says NOT INSTALLED; first press hangs.
15. **Interrupt never fires. FPR1 bit stays 0 vs FPR1 bit goes 1?** Stays 0: EXTI never saw an edge (EXTICR, RTSR1 / FTSR1, pin mode, clock). Goes 1 but no handler: IMR1 masked, NVIC not enabled, or PRIMASK set.
16. **Vector 21 holds `0x0800023D`, `nm` says the handler is at `0x0800023C`?** Bit 0 is the Thumb bit.
17. **Why is `b_edges` lock-free safe, why `volatile`, and why debounce in `main()`?** One aligned 32-bit word, one writer: old or new, never torn; `volatile` forces a memory read every loop; a 20 ms wait in a handler blocks every equal or lower priority interrupt. Handlers record; `main()` decides.
18. **Debounce, `DEBOUNCE_MS = 3`, samples 0,0,1,0,1,1,1,1: press reported when, `changes`?** ms 8, `changes = 3`; latency = `DEBOUNCE_MS` after the last bounce.
19. **Why do poll and interrupt counts differ for the same press?** Bounce edges are microseconds apart; a 1 kHz poll misses most (sampling filter); EXTI latches every one.
20. **A 58-character line at 115200 baud blocks how long; what does polled time lose?** $58 \times 86.8\,\mu\text{s} \approx 5.0$ ms; COUNTFLAG remembers one wrap, so 4 of the 5 ms ticks are lost per line.
