# L00 Architecture: What the Programmer Sees (STM32C031C6)

**What this lecture is about:** the five-part contract (registers, memory, peripheral registers, modes and stacks, exceptions) that every later lesson is an instance of. Part 0 theory, no code, no lab.

Source: `projects2026_arm/00_Architecture/Slide.md`, slides 1-17. Reference manual: ST RM0490. Core: Cortex-M0+ (ARMv6-M).

## 1. What a programmer model is, and its five parts (slides 1-2, 16)

- **Definition:** a deliberately small, published abstraction, a contract: *"here is the state you may inspect and change, and here is what happens when you do."*
- **Includes** everything software can name. The contract is "documented, stable, the same on every chip of this family".
- **Leaves out** the implementation: pipeline, bus matrix, silicon, "none of it named by your code".

| # | Part | What it is | Slide 16 summary box |
|---|---|---|---|
| 1 | Registers | working state inside the CPU | STATE YOU OWN: 16 registers + xPSR |
| 2 | Memory | one flat address space, and what lives where | STATE YOU OWN: one flat address space |
| 3 | Peripheral registers | memory-mapped controls of the hardware | STATE THE CHIP OWNS: control, status, data |
| 4 | Modes and stacks | which of two contexts you are running in | WHO IS RUNNING: thread or handler mode, MSP or PSP |
| 5 | Exceptions | how the hardware takes control away from you | HOW CONTROL IS TAKEN: vector table, NVIC, an address in a slot |

- "Everything in the next thirty lessons is one of those five."
- **The method (slide 2):** meeting a new peripheral, the first question is not *what does it do* but **"which part of the model is this?"** One peripheral model taught six times means the seventh comes free.
- Every mechanism gets two columns: **the general idea** (architecture-text name plus the known alternatives) and **this chip's answer** (which one was picked, and what it costs). The left column lets you read any processor's datasheet; the right column is what you need this term.

## 2. Registers: the register file (slide 3)

- **General idea: a register file.** Memory is slow and far away, so the CPU keeps a few locations inside, named by a few instruction bits instead of a 32-bit address.

| Machine | Working registers |
|---|---|
| 6502, 8051 | one accumulator, every result passes through it |
| JVM, Forth | none, operands sit on a stack |
| ATmega128 | 32 x 8-bit |
| **Cortex-M** | **16 x 32-bit, of which 13 are freely yours** |
| x86-64 | 16 x 64-bit |
| RISC-V | 32 x 32-bit, one hardwired to zero |

- Too few: the compiler spills to memory constantly. Too many: every instruction needs more bits to name one, and every interrupt has more state to save.
- **This chip's answer:** "sixteen, and four of those have a fixed job" (the diagram highlights SP, LR, PC and xPSR). Freely yours: R0-R12 = 13.
- The CPU **cannot compute on memory**: load into registers, operate, store back (see 02_Week2_L01_InstructionSet_Thumb.md, load/store section).
- R0-R3 arguments, locals, scratch; R4-R12 locals; R13 SP stack pointer; R14 LR return address; R15 PC "what runs next".
- "Write to PC and you have branched. It is an ordinary register."
- This is the **entire working state** of the processor (16 x 4 B = 64 B, computed). Everything else is in memory, which is why an interrupt saves and restores it in a handful of cycles.

## 3. Every core register and the special registers (slide 3b)

| Register | Its job | Covered in |
|---|---|---|
| `R0`-`R3` | arguments in, result out, scratch | 02_Week2_L01_InstructionSet_Thumb.md, calling convention |
| `R4`-`R12` | locals the compiler keeps out of memory | same |
| `R13` / `SP` | stack pointer: **one name, two registers, `MSP` and `PSP`** | section 9 here |
| `R14` / `LR` | return address | 02_Week2_L01_InstructionSet_Thumb.md |
| `R15` / `PC` | next instruction; write it and you have branched | section 2 here |
| `xPSR` | one word read three ways: `APSR` flags, `EPSR` Thumb bit, `IPSR` exception number | here, section 10 |
| `PRIMASK` | bit 0 set = every configurable interrupt masked | 05_Week4_L03_Execution_Concurrency.md |
| `CONTROL` | which stack Thread mode uses, and whether it is privileged | section 9 here |

- Special registers have **no number and no address**: only `mrs` and `msr` reach them.
- Bit layouts in `core_cm0plus.h`: `APSR_Type`, `IPSR_Type`, `xPSR_Type`, `CONTROL_Type`.
- A Cortex-M3 or M4 adds `BASEPRI` and `FAULTMASK`; **this core has neither**.
- `xPSR` is **one** register; APSR, EPSR, IPSR are views of it, each showing only its own bits.

| Register (view) | Bits | Field | Meaning |
|---|---|---|---|
| xPSR (APSR) | 31, 30, 29, 28 | N, Z, C, V | condition flags |
| xPSR (EPSR) | 24 | T | Thumb bit, **always 1** here |
| xPSR (IPSR) | 5:0 | ISR | **0 in `main()`**, the exception number inside a handler |
| PRIMASK | 0 | PM | 1 = all configurable interrupts masked |
| CONTROL | 1 | SPSEL | stack for Thread mode (0 = MSP at reset) |
| CONTROL | 0 | nPRIV | Thread privilege (0 = privileged at reset) |

- "Flags at the top of xPSR, the running exception's number at the bottom, and almost nothing in between."
- Why care: the debugger shows them and **a crash report is mostly their contents**.

## 4. Reaching a device: memory mapped vs port mapped IO (slide 4)

| General idea | How software reaches a device | Example |
|---|---|---|
| **Port-mapped (isolated) I/O** | separate address space, dedicated instructions | x86 `in`/`out` with a 64 K port space; **AVR `IN`/`OUT`** |
| **Memory-mapped I/O** | ordinary addresses, ordinary loads and stores; no new instructions | **this chip, with no port space at all** |

- A GPIO register and a global variable are reached by the same `ldr`; **only the address tells them apart**.

| General idea | Code and data | Example |
|---|---|---|
| **Harvard** | separate address spaces; `0x100` means two things; reading a flash constant needs its own instruction | **AVR: `LPM`, and `PROGMEM`** |
| **von Neumann** | one address space; a pointer reaches anything | **this chip: one unified space** |

- `PROGMEM` has no equivalent here and needs none: a `const` array in flash is read by the same `ldr`.
- Some Cortex-M cores fetch code and data over separate **buses**; that is implementation, the address map stays single and your code cannot tell.
- **The rule:** everything the CPU can reach, it reaches by **address**. There is no other channel.

## 5. The memory map (slide 4)

| Base | Region | Holds | Who decides |
|---|---|---|---|
| `0xE0000000` | Private peripheral bus | NVIC, SysTick, ARM's own | fixed by ARM |
| `0x40000000` | Peripheral | GPIO, USART, timers, ST's | filled in by ST |
| `0x20000000` | SRAM | variables, stack, heap | size chosen by ST |
| `0x08000000` | Code | flash | size chosen by ST |
| `0x00000000` | (alias) | flash, aliased at reset | |

- "The regions are the same on every Cortex-M. Only the contents change."
- **Flash appears twice:** really at `0x08000000`, aliased to `0x00000000` at reset, which is how the CPU finds the vector table "at address zero".
- **`0xE0000000` is not ST's:** NVIC and SysTick are identical on any vendor's chip. The address tells you which manual to open.
- This chip's numbers (textbook context, from `_startup/c031c6/link.ld` and `stm32c031xx.h`; linker details in 04_Week3_L04_Startup_LinkerScript.md):

| Item | Value |
|---|---|
| FLASH | 32K at `0x08000000` (last byte `0x08007FFF`) |
| RAM | 12K at `0x20000000` (top `0x20003000`) |
| APB peripherals / AHB peripherals | `0x40000000` / `0x40020000` (RCC `0x40021000`, FLASH regs `0x40022000`) |
| IOPORT (GPIOA) | `0x50000000`; slide 5's `0x50000014` = GPIOA base + ODR offset `0x14` |
| SCS (ARM) | `0xE000E000`: SysTick `0xE000E010`, NVIC `0xE000E100`, SCB `0xE000ED00` |

## 6. A register is not a variable (slide 5)

- "The single idea that separates embedded C from the C you have written before"; almost every beginner bug traces back to it.
- Diagram: CPU, `store` to `0x50000014` ("just an address"), and **a pin goes high, a motor turns**. "The store instruction has a side effect in the physical world. Nothing in the C language says so."

| A variable | A register |
|---|---|
| Lives in RAM | **Is** a piece of hardware |
| Reading it twice gives the same value | Reading it twice can give different values |
| Writing it changes memory | Writing it **makes something happen** |
| Reading is free of consequence | Reading can **clear a flag** or consume a byte |
| Compiler may cache, reorder or delete accesses | **Every access must happen, exactly as written** |

- The last row is why `volatile` exists (see 05_Week4_L03_Execution_Concurrency.md, volatile).

```c
/* textbook context: a register is just an address, reached through a volatile pointer */
#define GPIOA_ODR (*(volatile uint32_t *)0x50000014u)
GPIOA_ODR = 1u << 5;          /* an ordinary str, and a pin changes */
```

## 7. Every peripheral has the same three registers (slide 6)

| Role | Who writes | Diagram label |
|---|---|---|
| **CONTROL** | you write | settings |
| **STATUS** | hardware writes, you read | what happened |
| **DATA** | both ways | the payload |

- The peripheral itself is **a state machine** between those registers and the pins. "Configure with CONTROL. Watch with STATUS. Move bytes through DATA."

| Peripheral | Control | Status | Data |
|---|---|---|---|
| USART | `CR1`: baud, enable, interrupts | `ISR`: is the buffer empty? | `TDR` / `RDR` |
| SPI | `CR1`: clock speed, polarity | `SR`: transfer complete? | `DR` |
| ADC | `CFGR`: which channel, resolution | `ISR`: conversion done? | `DR` |
| Timer | `CR1`, `PSC`, `ARR` | `SR`: did it overflow? | `CNT`, `CCR` |
| GPIO | `MODER`, `PUPDR` | `IDR`: what are the pins? | `ODR`, `BSRR` |

- **"The names move between chips. The three roles never do."**

## 8. ARM peripherals vs ST peripherals, two manuals (slide 7)

| | ARM supplies | ST supplies |
|---|---|---|
| Blocks | `NVIC`, `SysTick`, `SCB`, `MPU` | `GPIO`, `USART`, `TIM`, `ADC`, `RCC` |
| Sameness | same on every Cortex-M, any vendor | different on every vendor, and between ST families |
| Header | `core_cm0plus.h` | `stm32c031xx.h` |
| Manual | ARM *Cortex-M Generic User Guide* (e.g. interrupt priorities) | ST reference manual (e.g. which pin USART2 comes out on) |
| Knowledge transfers to | every ARM microcontroller you ever use | the next STM32, and no further |

- "Opening the wrong document is the commonest way to lose an hour."

## 9. Modes and stacks: Thread, Handler, MSP, PSP (slide 8)

- **General idea: privilege.** Two or more trust levels: supervisor (may touch anything) and a lower one. Desktop: kernel mode and user mode, enforced by an **MMU**, which also gives each program a private virtual view of memory.
- **This chip: the two levels, none of the virtual memory.** One real address space shared by everything. The optional **MPU** gives permission rules over real addresses, not a private map. So **a stray pointer quietly reaches a peripheral instead of earning a segmentation fault**.

| | THREAD mode | HANDLER mode |
|---|---|---|
| What runs | your `main()` | every interrupt |
| Stack | `MSP`, or `PSP` (CONTROL.SPSEL) | **always `MSP`** |
| Privilege | need not be privileged (CONTROL.nPRIV) | **always privileged** |
| Entered by | return from an exception | an interrupt |

- The processor switches modes **without being asked**.
- `CONTROL`: two bits, the other thirty reserved, **both 0 at reset** (Thread on MSP, privileged).

| CONTROL | SPSEL | nPRIV | Thread mode runs on |
|---|---|---|---|
| `0x0` | 0 | 0 | MSP, privileged (reset state) |
| `0x1` | 0 | 1 | MSP, unprivileged |
| `0x2` | 1 | 0 | PSP, privileged |
| `0x3` | 1 | 1 | PSP, unprivileged (typical RTOS task) |

- Until the RTOS lesson, MSP serves everything. Later it matters twice: an RTOS gives each task its own stack on PSP, and unprivileged Thread mode is "how an RTOS keeps one task from corrupting another"; a **fault handler runs in Handler mode** (on MSP), so it still works when the faulting code has wrecked everything else (see 08_Week6_L07_RTOS.md).

## 10. The exception model: vectored dispatch (slide 9)

- An interrupt is a **hardware-forced function call**. How does the hardware find the function?

| General idea | Mechanism | Cost |
|---|---|---|
| **Non-vectored** | every interrupt enters at one fixed address; software interrogates hardware to find who called | cheap silicon, slower and wordier software |
| **Vectored** | the source has a number, the number indexes a table, hardware goes straight to the handler | nearly everything modern |

- Vectored machines differ in what the table holds: **AVR: jump instructions; x86: descriptors; this chip: plain addresses**.
- The NVIC does not search for your handler; it **indexes a table of addresses at the start of flash** (`0x08000000`).

$$\text{exception number} = 16 + \text{IRQn}, \qquad \text{slot address} = \texttt{0x08000000} + 4\,(16 + \text{IRQn})$$

| Slot | Offset | Address | Contents |
|---|---|---|---|
| 0 | `0x00` | `0x08000000` | initial stack pointer |
| 1 | `0x04` | `0x08000004` | `Reset_Handler` |
| 2-15 | | | ARM's: reset and faults |
| 16 + 28 = 44 | `0xB0` | `0x080000B0` | `USART2_IRQHandler` (USART2 = IRQ 28) |

- "The first 16 slots are ARM's, reset and faults. Vendor interrupts start at 16."
- **The table is built by your own code** (first coding lesson; see 04_Week3_L04_Startup_LinkerScript.md). No registration call: a handler is connected **because its address sits in the right slot**.
- "Put the wrong address in a slot and the chip jumps there anyway."
- The CPU records which slot it took: inside `USART2_IRQHandler`, IPSR = 16 + 28 = 44 = `0x0000002C`.

## 11. The data model: width, alignment, byte order (slide 10)

- **Word size 32 bits:** registers, ALU and bus agree on it. Narrower types are emulated on top, so `uint8_t` is **not cheaper** than `uint32_t`, often more expensive (mask and shift). Do not reach for `uint8_t` out of AVR habit.
- **Natural alignment:** an $n$-byte access wants $\text{addr} \bmod n = 0$.

| Machine | Unaligned access |
|---|---|
| x86 | permitted, charges cycles |
| classic SPARC | refuses outright |
| **Cortex-M0+** | **faults immediately: HardFault** |
| Cortex-M3 / M4 | works for ordinary loads and stores, slower |

- The bite: casting a `uint8_t*` buffer to `uint32_t*` when parsing packets is "a reliable crash on an M0+".
- **Little-endian:** `0x12345678` stored at address 0 puts `0x78` at byte 0, least significant byte first.

| Address | +0 | +1 | +2 | +3 |
|---|---|---|---|---|
| Little-endian (every STM32) | `0x78` | `0x56` | `0x34` | `0x12` |
| Big-endian | `0x12` | `0x34` | `0x56` | `0x78` |

- Big-endian shipped too: 68000, classic SPARC, and **every internet protocol header** ("network byte order", `htonl()`). ARM can be built either way; **every STM32 is little-endian**, and the other convention reaches you only when bytes arrive from elsewhere.

## 12. Two gates: clock gate and pin multiplexer (slide 11)

- "The model says a peripheral has registers. It does not promise they answer." Two gates are shut at power-on; **opening them is your job**.
- Path: clock, **GATE (`RCC`, off by default)**, peripheral, **MUX (pin, one pin many owners)**, pin.
- **Clock gate:** every peripheral powers up switched off to save energy. Write its control register first and the write goes nowhere: no error, the register reads back zero. "A peripheral with no clock reads back as zero and ignores every write." The single most common first-week failure.
- **Pin multiplexer:** more peripherals than pins, so you must say which owner each pin belongs to. Choose wrong and the pin is electrically healthy and carries no signal.
- **The rule:** "Both look identical from outside: correct code that does nothing. Neither produces an error message. **Suspect them first.**"
- Textbook context: on this chip GPIO ports gate through `RCC->IOPENR`, others through `RCC->AHBENR`, `APBENR1`, `APBENR2` (see 06_Week4_L05_GPIO_Interrupts.md, clock gate and AFR).

## 13. The clock is yours too (slide 12)

- Every timed thing derives from **one oscillator by division**; nothing picks the divisions for you.
- Diagram: oscillator **48 MHz**, divider, then CPU core, fast bus (GPIO, DMA) and slow bus (USART, timers), **each with its own prescaler**.
- **A baud rate is a division.** The USART does not know what 115200 means; you give it a divisor computed from **its own bus clock, not the CPU clock**. Wrong, and the output is garbage while the code is perfect.
- **A delay is a count.** There is no `sleep()`; one millisecond means counting a known number of ticks.

$$\text{divisor} = \frac{f_\text{bus}}{\text{baud}}, \qquad \text{ticks} = f \cdot t$$

| Example (textbook context, computed) | Result |
|---|---|
| 48 MHz / 115200 | divisor 417, actual 115108 baud (-0.08 %) |
| divisor 417 used on a 12 MHz bus | 12e6 / 417 = 28777 baud: garbage |
| 1 ms at 48 MHz | 48 000 ticks |

- See 04_Week3_L04_Startup_LinkerScript.md (clock to 48 MHz) and 07_Week5_L06_Time_Timers.md (SysTick, millis).

## 14. Where the implementation leaks through (slides 13-14)

- The *only* implementation details the course asks you to care about:

| Leak | General name | Visible in code as |
|---|---|---|
| PIPELINE | **pipelining**: overlapping fetch, decode, execute | PC reads ahead of the executing instruction; a taken branch throws away started work (branches cost extra) |
| TWO BUSES | fast AHB, slow APB | enable the clock on the right bus: `RCC->AHBENR`, `RCC->APBENR1` |
| FLASH IS SLOW | **processor-memory speed gap** | `FLASH->ACR` wait states |

- **The rule:** set the flash wait state **before you raise the clock, never after**. It is the first of many "ordering requirements the compiler knows nothing about": the code compiles identically either way round, only one order works.
- The core will run at 48 MHz and the flash will not. Large machines answer the gap with **caches**; a 32 KB microcontroller cannot spend the transistors, so it uses **wait states and a prefetch buffer**, and hands you the register.
- Slide 14, the implementation once (never programmed directly):

| Left of the bus matrix (ARM's, identical on every Cortex-M) | Right of it (ST's) |
|---|---|
| Cortex-M core: `R0-R15`, `NVIC`, `SysTick`; oscillators | FLASH + wait states; SRAM; **AHB, fast: GPIO, DMA, RCC**; APB bridge; **APB, slow: USART, SPI, I2C, TIM, ADC**; pin mux, pins |

## 15. Coming from 8 bits: AVR vs this chip (slide 15)

| | AVR (8-bit) | Cortex-M (32-bit) |
|---|---|---|
| Registers | 32 x 8-bit | 16 x 32-bit |
| Reaching a peripheral | **port-mapped I/O**: own space, `IN`, `OUT` | **memory-mapped I/O**: ordinary `LDR`/`STR` |
| Code and data | **Harvard**: `LPM`, `PROGMEM` to read flash | **von Neumann**: one space, a pointer reaches anything |
| Interrupt vectors | vectored: fixed table of **jump instructions** | vectored: table of **addresses**, built by your code |

- On AVR, `PORTB` was a special kind of thing. Here there is no such category: "that uniformity is both the gift and the trap. Nothing stops a stray pointer landing on a peripheral."

## 16. What you should be able to say (slide 17)

1. **Model includes / leaves out:** everything software can name (registers, memory, peripheral registers, modes, exceptions); leaves out pipeline, bus matrix, silicon.
2. **Five parts:** registers, memory, peripheral registers, modes and stacks, exceptions.
3. **One mechanism to reach outside:** an **address** (load/store). No other channel.
4. **Register vs variable:** two reads can differ; a write makes something happen; a read can clear a flag or consume a byte; every access must happen as written (no caching, reordering, deleting).
5. **Three roles:** control (you write), status (hardware writes, you read), data (both ways).
6. **ARM vs ST:** ARM: NVIC, SysTick, SCB, MPU (Generic User Guide, `core_cm0plus.h`); ST: GPIO, USART, TIM, ADC, RCC (reference manual, `stm32c031xx.h`). Each vendor documents its own blocks.
7. **Reads back as zero:** the **clock gate** (RCC enable not set).
8. **Garbage serial, code right:** baud divisor computed from the CPU clock instead of the USART's own bus clock; the clock tree is not what you assumed (nothing picks the divisions or prescalers for you).
9. **`uint8_t*` to `uint32_t*` HardFault:** the pointer is not 4-byte aligned and the M0+ faults on any unaligned access. A Cortex-M3 would not fault for ordinary loads and stores, just run slower.
10. **Three leaks:** pipeline (PC reads ahead, branches cost), two buses (enable clock on the right one), slow flash (wait states in `FLASH->ACR`).
11. **USART2 handler:** USART2 is IRQ 28; NVIC indexes the vector table at slot 16 + 28 = 44 (`0x080000B0`), reads the address there, and jumps. Your code put the address there.
12. **Two ways to reach a device:** port-mapped and memory-mapped I/O. AVR: port-mapped (`IN`/`OUT`). This chip: memory-mapped, no port space.
13. **Harvard:** separate code and data address spaces; `PROGMEM` (with `LPM`) existed only because of it.
14. **Segfault hardware:** the **MMU**. This chip has no MMU, only an optional **MPU** (permission rules over real addresses). A bad pointer here quietly reads or writes whatever is at that address, possibly a peripheral (an unaligned one HardFaults).

## Exam focus

**Compute the vector slot.** IRQn = 28 (USART2): exception 44, offset $4 \times 44 = 176 =$ `0xB0`, slot `0x080000B0` (also visible at `0x000000B0` through the alias). Vendor IRQ 0 sits at offset `0x40`.

**Decode xPSR.**

| Value | N Z C V | T | ISR | Meaning |
|---|---|---|---|---|
| `0x01000000` | 0 0 0 0 | 1 | 0 | Thread mode, in `main()` |
| `0x0100002C` | 0 0 0 0 | 1 | 44 | inside `USART2_IRQHandler` (44 - 16 = IRQ 28) |
| `0xA1000000` | 1 0 1 0 | 1 | 0 | in `main()`, last result negative, carry set |

**Decode CONTROL.** `0x3`: Thread mode uses PSP and is unprivileged. An interrupt still runs on MSP, privileged. Reset value `0x0`.

**Classify an address (which region, which manual).**

| Address | Region | Owner, manual |
|---|---|---|
| `0xE000E010` | private peripheral bus (SysTick) | ARM, Generic User Guide |
| `0x40004400` | peripheral (USART2) | ST, reference manual |
| `0x50000014` | peripheral (GPIOA ODR) | ST |
| `0x20000400` | SRAM | variables, stack |
| `0x00000004` | flash alias: reset vector slot | your vector table |

**Endianness.** `uint32_t x = 0xAABBCCDD;` at `0x20000000`: `*(uint8_t*)0x20000000` = `0xDD`. For `0x12345678`, the halfword at +2 is `0x1234`.

**Spot the bug: alignment.**

```c
uint8_t buf[8];                       /* say buf = 0x20000100 */
uint32_t v = *(uint32_t *)(buf + 1);  /* 0x20000101: addr % 4 = 1 -> HardFault on M0+ */
```

Works (slower) on M3/M4. Fix (textbook context): `memcpy(&v, buf + 1, 4);` or assemble from bytes. Aligned: word at `...0`, `...4`; halfword at any even address.

**Predict the behaviour.**

- Write `USART2->CR1` before enabling its clock, read it back: **0, no error**. First suspect: clock gate.
- Peripheral clocked and configured, pin shows nothing: **pin mux** (wrong owner).
- Raise the clock to 48 MHz, then set `FLASH->ACR`: wrong order; **wait states first**, then the clock. Compiles identically either way.
- Wrong address in a vector slot: the chip **jumps there anyway**, no check.
- Stray pointer to `0x5000xxxx`: no segfault, it **writes a GPIO register** (no MMU).
- `uint8_t` loop counter "to save cycles": no gain on a 32-bit core, often extra mask and shift.

**Short answers.**

- Interrupt saves state in a few cycles because the whole CPU state is 16 registers + xPSR. Freely yours: 13 (R0-R12).
- M0+ lacks `BASEPRI` and `FAULTMASK`; special registers are reached only by `mrs` / `msr`.
- Vector table "at zero": flash at `0x08000000` is aliased to `0x00000000` at reset.
- Fault handler survives a wrecked task: Handler mode, always MSP, always privileged.
