# L03 Execution and Concurrency

**What this lecture is about:** what happens when the hardware interrupts your program. You now have two contexts sharing one memory, two hazards (the compiler and the mid-update interrupt), and two fixes that are not interchangeable.

Part 0 (Models), the last of four lessons with no code. L05 (EXTI, NVIC), L06 (SysTick, priorities) and L07 (PendSV, mutex, priority inversion) all apply this model.

## 1. Three ways to meet the hardware (slide 1)

A peripheral finishes when it finishes, and the program has to find out. There are exactly three arrangements:

| Method | What the CPU does while waiting | Note |
|---|---|---|
| **Poll** | asks "ready yet?" in a loop, nothing else | simplest to get right |
| **Interrupt** | useful work until told, then the handler runs | CPU works until told |
| **DMA** | useful work, while hardware moves the bytes | CPU not involved at all |

- From left to right, complexity rises and CPU time falls.
- **The rule:** polling is not the beginner option. It is the right answer *whenever the wait is shorter than the cost of being interrupted*.
- Example of correct polling: the 4-instruction `FLASH->ACR` LATENCY wait in clock setup (L01 slide 13, see 02_Week2_L01_InstructionSet_Thumb.md, polling loop section). It waits a few cycles, so an interrupt would cost more than it saves.

## 2. Interrupt entry and exit (slide 2)

An interrupt is a **hardware-forced function call**. There is no scheduler and no OS. The hardware does it between two instructions of whatever was running:

| Step | Who | What |
|---|---|---|
| 1 | hardware | event arrives while `main()` runs |
| 2 | hardware | **pushes 8 registers**: `R0-R3, R12, LR, PC, xPSR` (8 x 4 = 32 bytes) |
| 3 | hardware | reads the vector table to find the handler address (see 01_Week2_L00_ProgrammersModel.md, exception model) |
| 4 | your code | handler runs (always on `MSP`) |
| 5 | hardware | pops the 8 and resumes. "Your main program never knows it happened. That is the problem." |

- **Why an ISR is an ordinary C function:** the 8 stacked registers are exactly the set AAPCS lets a function clobber (caller-saved `R0-R3, R12, LR`, plus `PC` and `xPSR`). Any callee-saved register the handler uses, the compiler saves itself, as in any function. There is no special keyword and no `ISR()` macro. Define a function with the right name and the linker puts it in the vector table (weak aliases: see 04_Week3_L04_Startup_LinkerScript.md).
- **Exit:** inside a handler, `LR` holds a magic `EXC_RETURN` (`0xFFFFFFF9`, `0xFFFFFFFD`). The ordinary `bx lr` at the end is what unstacks the frame (L01 slide 20, see 02_Week2_L01_InstructionSet_Thumb.md; the PSP case is in 08_Week6_L07_RTOS.md).
- **Trap:** spell the handler name wrong and you have written an unused function. "It compiles, it links, it runs, and the interrupt does nothing. No warning, anywhere."

**The three special registers** (bit layouts from `core_cm0plus.h`; this deck uses the first two):

| Register | Bits | Job when an interrupt arrives | Slide |
|---|---|---|---|
| **`xPSR`** | 31 N, 30 Z, 29 C, 28 V, 24 T, **5:0 exception no.** | stacked with the eight. Entry writes the exception number into the low bits, and the interrupted code's flags are saved with it | 2 |
| **`PRIMASK`** | **0 PM** | bit 0 set = no configurable interrupt is taken at all | 5 |
| `CONTROL` | 1 SPSEL, 0 nPRIV | which stack Thread mode was on. A handler always uses `MSP` | L00 slide 8 |

Worked example (textbook context): a stacked xPSR of `0x21000000` decodes to C=1, T=1 and exception number 0, so the interrupted code was Thread mode. While the TIM3 handler runs (TIM3 is IRQ 16 in `stm32c031xx.h`), the live low bits read 16 + 16 = 32 = `0x20`.

## 3. Two programs sharing one memory (slide 3)

- Before interrupts there is one thread of control. After, there are two, `main()` (runs when nothing else does) and `handler()` (runs whenever it likes), and they share **every global variable**.
- Neither can see what the other is doing.
- That gives **two distinct hazards with different fixes**. Students routinely apply one fix to the other problem "and conclude the language is broken".

## 4. Hazard one: the compiler does not believe you (slide 4)

```c
while (flag == 0) { }        /* wait for the ISR to set it */
```

- The compiler reasons, correctly by C's rules: "this loop does not modify `flag`, so `flag` cannot change. Read it once and loop on a register." The result is an infinite loop.
- **The as-if rule:** the compiler need not do what you wrote. It must produce a program that *behaves as if* it had, judged only by the observable behaviour the language defines. How many reads, in what order, and whether a variable exists at all are free to change. This is not an embedded matter; the same rule governs your laptop's compiler.
- **Why hardware breaks it:** *the hardware is an observer the language does not know about.* A pin that changes, a status bit that clears when read, another context writing a variable: none of these are observable in C's account, so optimising them away is not misbehaviour.
- **Fix: `volatile uint8_t flag;`** extends what counts as observable. Every access written must actually happen, all of them, in the order written.
- **`volatile` is about the compiler.** It is not a lock, it does not make anything atomic, and it does not help with hazard two.
- CMSIS already declares every peripheral register `__IO` (= `volatile`). Your own shared globals are your job (L01 slide 21; symptom "works at -O0, hangs at -Os").

Compiled output (textbook context, verified: clang -Os for cortex-m0plus, gcc -Os on the host):

| `flag` declared | Code | Behaviour |
|---|---|---|
| plain `uint8_t` | gcc: one load, then a branch to itself (`b .`). clang: deletes the loop | hangs, or never waits. Both are legal |
| `volatile uint8_t` | `1: ldrb r1,[r0]` / `cmp r1,#0` / `beq 1b` | re-reads memory every pass |

## 5. Hazard two: the interrupt lands mid-update (slide 5)

Touching memory is always three instructions (load, modify, store; L01). `counter++` in `main()` is interrupted after the load:

| # | `main()` | `handler()` | `counter` in RAM |
|---|---|---|---|
| 1 | `ldr r0, [counter]` reads 5 | | 5 |
| 2 | interrupted here | `ldr` reads 5 | 5 |
| 3 | | `adds` gives 6 | 5 |
| 4 | | `str` writes 6 | 6 |
| 5 | `adds r0, #1` gives 6 | | 6 |
| 6 | `str r0, [counter]` writes 6 | | **6** (should be 7) |

"Two increments happened. The counter went from 5 to 6. One update vanished." `volatile` does not help: every access *did* happen, in order. The **sequence** was not indivisible.

**The four standard words** (not embedded-specific):

| Term | Definition |
|---|---|
| **race condition** | the result depends on the relative timing of two contexts |
| **critical section** | a region of code that must not be interleaved |
| **mutual exclusion** | the guarantee over it: at most one context inside at a time |
| **atomic** | a sequence that cannot be observed half-done |

Only *how* mutual exclusion is obtained changes between systems:

| Contexts | How you get mutual exclusion |
|---|---|
| ISR vs `main()`, one core | **turn interrupts off**. The other context cannot run if it cannot start |
| two threads, one OS | a mutex, which asks the scheduler not to switch |
| two cores | neither works. You need an atomic read-modify-write instruction: `ldrex`/`strex` (larger ARM), `lock cmpxchg` (x86) |

- Masking stops the other context *on this core* and does nothing to a second core, which keeps running.
- **A Cortex-M0+ is single-core and has neither `ldrex` nor `strex`.** That is exactly why masking is the right tool here and would be the wrong tool on a phone.

**This chip's answer, a critical section by masking:**

```c
__disable_irq();   /* cpsid i : PRIMASK.PM = 1 */
counter++;         /* ldr, adds, str: now indivisible */
__enable_irq();    /* cpsie i : PRIMASK.PM = 0 */
```

- Each call is one instruction and changes a single bit, PRIMASK bit 0.
- **Keep it short.** For every cycle that interrupts are off, the chip cannot respond to anything.
- (Textbook context) `__enable_irq()` re-enables unconditionally. If the code may already run with interrupts masked, save `__get_PRIMASK()` first and restore it with `__set_PRIMASK()`.

> **The rule:** `volatile` makes accesses *real*; a critical section makes a sequence *indivisible*. Most concurrency bugs in this course come from using the first where the second was needed.

## 6. A bug that only appears sometimes (slide 6)

- The interrupt must land in a **two-instruction window**: about 40 ns at 48 MHz (2 cycles x 20.8 ns = 41.7 ns).

| Interrupt rate | The bug appears |
|---|---|
| 1000 per second | roughly once every 7 hours |
| 10000 per second | roughly once every 40 minutes |

- Ten times the rate makes the bug about ten times as frequent (7 h / 10 = 42 min). Both rows work out to about 1 hit per 24-25 million interrupts (computed).
- These bugs survive your testing and the demo, then appear in the field. **You cannot find them by running the program more.** You find them by reasoning about which variables are shared, and protecting those.
- **Discipline:** for every global, write down which contexts touch it. If more than one, it needs `volatile`, and probably a critical section too.

## 7. What needs protecting, and tearing (slide 7)

| Situation | Safe? |
|---|---|
| ISR writes a `uint8_t`, main only reads it | **Yes**: single aligned access, one writer |
| ISR sets a flag, main reads and clears it | **Usually**, but the clear is read-modify-write |
| main does `counter++`, ISR also increments | **No**: the lost update of slide 5 |
| main reads a `uint64_t` the ISR writes | **No**: more than one bus access, so you can read half |
| either side touches a multi-field struct | **No**: the reader can see it half-updated |

- **The pattern:** a single aligned word written by exactly one context is safe. Everything else needs thought.
- **Tearing** (rows 4 and 5): a reader that needs two bus accesses to collect one logical value can be interrupted between them and end up with half old and half new, *a number that was never stored by anybody*. The same hazard makes a 64-bit counter unsafe on any 32-bit machine, in any language or OS, and makes a struct of small fields need protecting.

Worked examples (textbook context, values computed):

| Case | Sequence | Result |
|---|---|---|
| `uint64_t` goes `0x0000_0000_FFFF_FFFF` to `0x0000_0001_0000_0000` | reader loads low word (old `0xFFFFFFFF`), ISR increments, reader loads high word (new `1`) | `0x1_FFFF_FFFF` = 8589934591, about double |
| same, high word first | high (old `0`), ISR, low (new `0`) | `0`: the counter appears to go backwards |
| packed flags, main clears BIT0 with `flags &= ~1` | main loads `0b01`, ISR sets BIT1 (`0b11`), main stores `0b00` | BIT1 lost |

Even `volatile uint64_t` compiles to two separate `ldr`s (clang: `ldr r1,[r0,#4]` then `ldr r0,[r0]`). The fix is a critical section around the copy.

## 8. Priority: which interrupt wins (slide 8)

- When several peripherals want attention, the **NVIC** decides by priority. A more urgent interrupt can also **preempt a handler that is already running**. On the slide's timeline, main is interrupted by the timer, then the timer handler is itself interrupted by the higher-priority uart, which returns to the timer, which returns to main. "Everything it shares is now at risk too."
- Priority is one byte per IRQ in the NVIC `IPR` registers, four bytes to a word. **This chip implements only the top two bits of each byte**, so there are **4 levels, and 0 is the most urgent.**

| `NVIC->IPR[0]` bits | 31:30 | 23:22 | 15:14 | 7:6 |
|---|---|---|---|---|
| field | IRQ3 | IRQ2 | IRQ1 | IRQ0 |

| Level | 0 (most urgent) | 1 | 2 | 3 (least) |
|---|---|---|---|---|
| byte in IPR | `0x00` | `0x40` | `0x80` | `0xC0` |

- General mapping: IRQ n lives in `IPR[n / 4]`, bits `8(n mod 4)+7 : 8(n mod 4)+6`. Example (textbook context): TIM3 = IRQ 16 is in `IPR[4]`, bits 7:6. For `NVIC_SetPriority` (shift by 8 - 2 = 6) and the `EXTI0_1` worked example, see 06_Week4_L05_GPIO_Interrupts.md.
- **Handlers must be short.** Anything slow in a handler delays every interrupt of *equal or lower* priority. The usual shape is to set a flag or push to a buffer, return, and let `main()` do the work.
- **Preemption multiplies the sharing problem**: it is no longer only main against ISR, but ISR against ISR.

| OS term (same problem) | Meaning here |
|---|---|
| **preemption** | one runnable context displacing another mid-execution |
| **interrupt latency** | gap from the hardware event to your handler's first instruction. **The longest critical section anywhere in the program sets its worst case** |
| **priority inversion** | a high-priority task waits on something a low-priority one holds. It made Mars Pathfinder keep resetting on the surface in 1997 (see 08_Week6_L07_RTOS.md) |

## 9. The Part 0 model, complete (slide 9)

| THE MACHINE (L00) | THE PROGRAM (L01, L02) |
|---|---|
| one bus, one address space | load, modify, store |
| peripherals = control, status, data | sections placed by a linker |
| guarded by a clock gate and a mux | startup code before `main()` |

**And they meet asynchronously:** volatile makes accesses real, and critical sections make them indivisible. "Everything from here is an instance of this."

From here on, every lesson follows **Model, then Map, then Measure**: Model asks which part of Part 0 this is, Map puts it onto this chip's registers by reading the reference manual (RM0490), and Measure is writing it, running it and watching it work. The first coding lesson is `04_Startup_And_Linker`.

## 10. What you should be able to say (slide 10)

1. **Three ways:** polling, interrupt, DMA. Poll when the wait is shorter than the cost of being interrupted, e.g. the `FLASH->ACR` latency acknowledge.
2. **ISR as a plain C function:** the hardware stacks `R0-R3, R12, LR, PC, xPSR`, which is exactly the AAPCS clobber set, and `bx lr` with `EXC_RETURN` unstacks it. Naming the function correctly puts it in the vector table.
3. **`volatile`** prevents the compiler from caching, merging, deleting or reordering the accesses you wrote. It does **not** make anything atomic and is not a lock.
4. **Lost update:** main `ldr` (5), ISR does `ldr`/`adds`/`str` (6), main `adds`/`str` (6). The table in section 5.
5. **Single aligned `uint8_t`, ISR writes, main reads:** no critical section is needed. It is one indivisible access with one writer, so nothing can tear or interleave. It still needs `volatile`.
6. **Short handlers:** a slow handler delays every interrupt of equal or lower priority and inflates latency. Set a flag or buffer, return, and let main work.
7. **Works for hours, fails once:** a race condition. The window is about 40 ns, so a failure is a rare timing coincidence; running more only resamples timing. Find it by listing shared variables and protecting them.
8. **As-if rule:** the compiler may change anything as long as the program behaves as if it ran as written, judged by C's observable behaviour. Hardware is an observer C does not know about.
9. **Definitions:** see the four-term table in section 5.
10. **Dual core:** `__disable_irq()` masks only this core's interrupts, and the other core keeps running. It is replaced by atomic read-modify-write instructions (`ldrex`/`strex`, `lock cmpxchg`).
11. **Tearing:** a multi-access read that sees half old and half new. Rows 4 (`uint64_t`) and 5 (multi-field struct).

## Exam focus

- **Predict:** `uint8_t ready;` set by an ISR, main does `while (!ready) {}` at -Os. *It hangs* (read once, spin on a register), or the loop is deleted. Fix: `volatile`.
- **Predict:** `volatile uint32_t n;` both main and ISR do `n++`, 1000 times each. *Final value is at most 2000 and sometimes less*: volatile gives no atomicity.
- **Compute:** counter = 5, the ISR increments between main's `ldr` and `str`. Final value? *6* (expected 7).
- **Compute:** the size of the hardware-stacked frame? *8 words = 32 bytes.* Which registers? *R0-R3, R12, LR, PC, xPSR.*
- **Compute:** the IPR byte for priority 2? *2 << 6 = `0x80`.* How many levels? *4 (top 2 bits), 0 most urgent.* Where is IRQ 1? *IPR[0] bits 15:14.*
- **Compute:** the two-instruction window at 48 MHz? *2 / 48 MHz = 41.7 ns, about 40 ns.*
- **Spot the bug:** `volatile uint64_t ms;` incremented in the SysTick handler and read in main without masking. *Tearing*: two `ldr`s. Copy it inside `__disable_irq()`/`__enable_irq()`.
- **Spot the bug:** `void TIM3_IRQhandler(void)` (lowercase h). *An unused function: it builds and links with no warning, and the interrupt does nothing.*
- **Spot the bug:** `volatile` added to "fix" a lost update. *Wrong fix, since volatile makes accesses real, not indivisible.* Use a critical section.
- **Spot the bug:** a long loop or printing inside a handler, or a long masked region. *It raises latency for every equal or lower priority interrupt; the longest critical section sets the worst case.*
- **Short answer:** why masking is fine on the M0+ but wrong on a phone. *The M0+ is single-core with no `ldrex`/`strex`. Masking stops only this core's other context.*
- **Short answer:** which special registers matter here? *xPSR (stacked; bits 5:0 = exception number) and PRIMASK (bit 0 = 1 masks all configurable interrupts; `cpsid i`/`cpsie i`).*
