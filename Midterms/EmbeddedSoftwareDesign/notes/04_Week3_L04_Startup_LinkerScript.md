# L04 Startup and the Linker Script (Week 3)

What this lecture is about: the code that runs before `main()` (vector table, `Reset_Handler`, `.data` copy, `.bss` zero, 12 to 48 MHz clock) and the `link.ld` that decides where every byte lives. Every number comes from this lesson's own `Main.elf` on the Nucleo-C031C6.

## 1. The board, the pins, and Wokwi (pin map slides, slide 18)

STM32C031C6, Cortex-M0+, **48 MHz, 32 KB flash, 12 KB RAM**. Wokwi part `board-st-nucleo-c031c6`; the real board's manual is **UM2953** (MB1717).

| Pin | MODER | Wired to | Used by |
|---|---|---|---|
| PB0-PB7 | 01 out | 8 LEDs from `diagram.json`, anode to pin, cathode to GND (HIGH = lit) | `ledbar_init()`, one byte to `GPIOB->ODR` per frame |
| PA5 | 01 out | on-board user LED, Wokwi label **LD4** (also header D13) | `led_init()`, heartbeat toggled once per frame |
| PA2 | 10, AF1 | USART2 TX | `printf` to the serial monitor |
| PA3 | 10, AF1 | USART2 RX | not used this week |

- "Eleven pins": PB0-PB7 are the lesson's only choice; the board fixed the other three. PA13 and PA14 are SWD. The outer header rows are ST **morpho** (every pin), the inner rows are **Arduino** (A0-A5, D0-D15). Pin n is bit n of `IDR`/`ODR` and bits 2n+1:2n of `MODER`. MODER codes: in `00`, out `01`, AF `10` (with AFR = N), analog `11`.
- **Wokwi pin names are not datasheet names.** `led0` is on `nucleo:PB0.1`, because PB0 reaches two header positions and plain `PB0` does not exist. Check the Board pins page before adding a wire.
- Wokwi **does not implement DMA, RTC, IWDG, PWR, SYSCFG or DBG**, and I2C and SPI are master-only. The EXTI lesson still works because on the STM32C0 the pin select is `EXTI->EXTICR[]`, not the F4's `SYSCFG->EXTICR[]`. The low-power lesson moves to another simulator (no PWR). "A simulator is an *instrument*, and every instrument has a stated range."

## 2. Why main is not where the program starts (slides 1-2)

On a laptop the OS quietly does four jobs: **it finds RAM, gives you a stack, zeroes your globals, then opens stdout and calls `main()`**. On this chip *nobody* does them, "unless you write it". The lesson asks: what are the four jobs, who does them here, and what breaks when one is missing?

| File | Answers |
|---|---|
| `link.ld` (about 70 lines) | **Where** everything goes: which addresses are FLASH or RAM, which section lands in each (the *layout*) |
| `startup.c` (about 140 lines) | **What runs first**: the vector table, and the code that makes RAM match what C promises (makes the *hardware match the layout*) |

`startup.c` does four jobs, in order: **(1) vector table, (2) copy `.data` FLASH to RAM, (3) zero `.bss`, (4) clock 12 to 48 MHz**. "Neither one is optional, and neither one is magic." See 03_Week3_L02_Development_Toolchain.md (before main).

## 3. The memory map with real numbers (slide 3)

| Region | Base | Extent | Holds | Defined by |
|---|---|---|---|---|
| FLASH | `0x08000000` | 32 KB, to `0x08007FFF` | `.isr_vector`, `.text`, `.rodata` | ST; aliased at `0x00000000` on reset |
| SRAM | `0x20000000` | 12 KB, to `0x20002FFF` | `.data`, `.bss`, heap, stack | architectural, same on every Cortex-M |
| Peripherals | `0x40000000` | RCC `0x40021000` (AHB), USART2 `0x40004400` (APB) | | ST fills in |
| IOPORT | `0x50000000` | GPIOA `0x50000000` ... GPIOD | GPIO | **not in the peripheral region** |
| SCS | `0xE000E000` | NVIC, SysTick | | ARM, identical on every Cortex-M |

- **32 KB and 12 KB sit in a flat 4 GB space.** "Addressability is not memory": reading an unmapped address is a **fault, not a zero**. **`link.ld`'s `MEMORY` block is two rows of this picture**, and nothing else. **GPIO is at `0x50000000`, not `0x40000000`.** The STM32C0 gives the I/O ports their own port (faster to reach). Code copied from an F1/F4 tutorial has the wrong address, and the chip will not tell you.
- Every address was verified with `_Static_assert(...)` against ST's CMSIS header: "If a number here were wrong, this lesson would not compile." The abstract regions are in 01_Week2_L00_ProgrammersModel.md (memory map).

## 4. The IO map, CMSIS, and base plus offset (slide 4)

- There is **no I/O instruction and no I/O address space**: peripherals are reached by ordinary loads and stores. "A register is an address with a side effect."
- **CMSIS** (Common Microcontroller Software Interface Standard) is ARM's core header `core_cm0plus.h` (NVIC, SysTick) plus ST's device header `stm32c031xx.h`, both vendored in `tools/cmsis/`. **It is headers, not a library**: `#define`s and structs, nothing linked, no function called. It is *not* ST's HAL, which is a real library (lesson 11 compares them).
- `GPIOA` is a pointer to a struct at a fixed address, so `->` is just **base + offset, computed at compile time**: `0x50000000 + 0x14 = 0x50000014` (ODR).

| `-Os` | `GPIOA->ODR ^= (1u<<5);` | `*(volatile uint32_t *)0x50000014UL ^= (1u<<5);` |
|---|---|---|
| base | `movs r2,#160` then `lsls r2,r2,#23` gives `0x50000000` | `ldr r2,[pc,#8]` from the literal pool |
| access | `ldr r1,[r2,#20]` ... `str r3,[r2,#20]` (#20 = 0x14) | `ldr r1,[r2,#0]` ... `str r3,[r2,#0]` |
| size | **14 bytes**, no literal pool | 12 + 4 = **16 bytes** |

**The named version is smaller.** One base register serves `MODER`, `ODR` and `BSRR` through constant offsets; the raw version needs a fresh literal for every register (addressing modes: 02_Week2_L01_InstructionSet_Thumb.md).

| Block | Base | Job here | Slide |
|---|---|---|---|
| `RCC` | `0x40021000` | clock gates, the 48 MHz switch | 4a |
| `GPIOA`, `GPIOB` | `0x50000000`, `0x50000400` | LEDs; PA2/PA3 handed to the UART | 4b |
| `USART2` | `0x40004400` | where `printf` ends up | 4c |
| `FLASH` | `0x40022000` | one register, `ACR`: the wait state | 16 |
| `SysTick` | `0xE000E010` | the frame delay in `Main.c` | lesson 06 |

**Two habits:** (1) when a peripheral does not respond, ask *which address did that actually write to*; (2) **a peripheral with no clock reads back zero and ignores writes, silently.**

## 5. RCC, every register on one page (slide 4a)

`RCC_TypeDef` at **0x40021000**. Map: **CR** 0x00 (oscillators, HSI divider, ready flags), ICSCR 0x04 (HSI trim), CFGR 0x08 (clock source, bus prescalers, MCO), CIER/CIFR/CICR 0x18-0x20 (clock interrupts), IOPRSTR to APBRSTR2 0x24-0x30 (hold in reset), **IOPENR** 0x34 (GPIO gates), AHBENR 0x38 (DMA, flash, CRC), **APBENR1** 0x3C (TIM3, USART2, I2C1, PWR), APBENR2 0x40 (TIM1, SPI1, USART1, ADC), IOPSMENR to APBSMENR2 0x44-0x50 (sleep-mode gates), CCIPR 0x54 (kernel clock choice), CSR1/CSR2 0x5C/0x60 (LSE/LSI, reset-cause flags).

| Register | Address | Field(s) used | Bits | Other named bits |
|---|---|---|---|---|
| `CR` | `0x40021000` | clear `HSIDIV` (= /1), poll `HSIRDY` | 13:11, 10 | HSIKERDIV 7:5, HSION 8, HSIKERON 9, HSEON 16, HSERDY 17, HSEBYP 18, CSSON 19 |
| `IOPENR` | `0x40021034` | `GPIOAEN`, `GPIOBEN` | 0, 1 | C 2, D 3, F 5 |
| `APBENR1` | `0x4002103C` | `USART2EN` (mask `0x00020000`) | 17 | TIM3EN 1, RTCAPBEN 10, WWDGEN 11, I2C1EN 21, DBGEN 27, PWREN 28 |

- **Gates** (`IOPENR`, `AHBENR`, `APBENR1`, `APBENR2`) have one bit per peripheral; **0 = unclocked and silently deaf**. This lesson sets three: GPIOA, GPIOB, USART2. **Sources** (`CR`, `CFGR`) set the chip clock (slide 16). The rest comes later. `led_init()` sets its gate **before anything else**, and every later peripheral lesson does the same (gate model: 01_Week2_L00_ProgrammersModel.md).

## 6. GPIO, every register on one page (slide 4b)

`GPIO_TypeDef` is **eleven words**, at GPIOA `0x50000000` and GPIOB `0x50000400`; the ports are 0x400 apart, so one struct serves them all. Offsets: **MODER** 0x00 (2 bits/pin: in, out, alternate, analog), OTYPER 0x04 (push-pull or open-drain), OSPEEDR 0x08, PUPDR 0x0C, IDR 0x10, **ODR** 0x14, BSRR 0x18 (atomic set/reset), LCKR 0x1C, **AFR[0]** 0x20 (4 bits/pin, pins 0-7), AFR[1] 0x24 (pins 8-15), BRR 0x28 (reset only).

- **Configuration** registers (`MODER`, `OTYPER`, `OSPEEDR`, `PUPDR`, `AFR[]`, `LCKR`) say what a pin *is*, written once at startup. **Data** registers (`IDR`, `ODR`, `BSRR`, `BRR`) say what it *does*, used in the main loop.
- UART pins: **`MODER = 10` says *a peripheral* drives this pin; `AFR[0] = 1` says *which one*** (AF1 = USART2 on PA2/PA3). "Neither alone is enough."

| Setting (derived from Main.c, retarget.c) | Field bits | Value |
|---|---|---|
| PA5 output | MODER 11:10 = 01 | `1u << 10` = `0x400` (clear mask `0xC00`) |
| PA2, PA3 alternate | MODER 5:4 and 7:6 = 10 | `0xA0` |
| PA2, PA3 AF1 | AFR[0] 11:8 and 15:12 = 1 | `0x1100` |
| PB0-PB7 output | MODER 15:0 = 01 x 8 | low half `0x5555` |

## 7. USART2, every register on one page (slide 4c)

`USART_TypeDef` at **0x40004400**. `retarget.c` uses 4 of its 12 registers: **CR1** 0x00, **BRR** 0x0C, **ISR** 0x1C, **TDR** 0x28. Unused: CR2 0x04 (stop bits, pin swap, inversion), CR3 0x08 (flow control, DMA), GTPR 0x10, RTOR 0x14 (receiver timeout), RQR 0x18, ICR 0x20 (write 1 to clear), RDR 0x24 (byte received), PRESC 0x2C.

| Reg | Used bits | Other named bits |
|---|---|---|
| CR1 (set once) | `UE` 0, `RE` 2, `TE` 3, so CR1 = `0xD` | RXNEIE 5, TXEIE 7, PCE 10, M0 12, OVER8 15, M1 28, FIFOEN 29 |
| BRR | 15:0 = **417 = 0x01A1** | |
| ISR (read-only) | poll `TXE_TXFNF` 7 | FE 1, ORE 3, RXNE_RXFNE 5, TC 6, BUSY 16, TEACK 21 |
| TDR | 8:0, the byte to send | |

$$\text{BRR} = \frac{f_{clk} + \text{baud}/2}{\text{baud}} = \frac{48\,000\,000 + 57\,600}{115\,200} = 417 \text{ (rounded to nearest)}$$

- `BRR` is computed from `SystemCoreClock`, so **it is only right if the chip really runs at 48 MHz** (slide 16's job). `uart2_init()` order: gates (IOPENR GPIOAEN, APBENR1 USART2EN), then `AFR[0]`, `MODER`, `BRR`, and `CR1 = TE|RE|UE`. `uart2_putc()` waits while `ISR.TXE_TXFNF` says TDR is full, then stores the byte in `TDR`.

## 8. Reset in hardware, before any code (slide 5)

- **AVR**: reset jumps to address 0, and the bootstrap must be assembly because SP is not set up yet and C cannot run without a stack. **Cortex-M** "does it differently, and better". The **core itself reads the first two words** at `0x08000000` before fetching any instruction: **word 0 = `0x20003000` goes into SP, word 1 = `0x080006C5` goes into PC**.
- The very first instruction therefore runs **with a valid stack**. That is why `Reset_Handler` can be written in C; the AVR edition's startup could not be.

## 9. The vector table, an array at a known address (slides 6-7)

```c
__attribute__((section(".isr_vector"), used))   // own section -> link.ld pins it at 0x08000000
void (* const vectors[])(void) = {              // used: no C code reads it; const: lives in FLASH
    (void (*)(void))&_estack,   /*  0 initial MSP: a value wearing a cast, NOT a function */
    Reset_Handler,              /*  1 */
    NMI_Handler, HardFault_Handler,     /* 2, 3 */
    0, 0, 0, 0, 0, 0, 0,        /*  4-10 reserved */
    SVC_Handler, 0, 0,          /* 11, then 12-13 reserved */
    PendSV_Handler, SysTick_Handler,    /* 14, 15 */
    WWDG_IRQHandler, 0, RTC_TAMP_IRQHandler, /* ... IRQ0 upward ... */ USART2_IRQHandler,
};
```

- **`section(".isr_vector")`** lets the linker pin the table instead of letting it land anywhere. **`used`** stops the compiler deleting an array nothing in your program mentions; only the hardware reads it. **`const`** puts it in FLASH; drop it and the table costs **180 bytes** of the 12 KB RAM.
- Layout (derived from `startup.c`): 16 system entries + 29 IRQs (IRQ0-28) = **45 words = 180 bytes**, the exact size of `.isr_vector`. The IRQn vector is at $0x08000000 + 4(16+n)$: TIM3 (IRQ16) at `0x08000080`, USART2 (IRQ28, the last) at `0x080000B0`. `.text` starts at `0x080000B4`.

Record 2 of `Main.hex`, the first data record: `:10000000 00300020C50600087906000879060008 BF`. ARM is **little-endian**, so read each 4-byte group right to left:

| Bytes | Value | Meaning |
|---|---|---|
| `00 30 00 20` | `0x20003000` | initial SP, the top of RAM |
| `C5 06 00 08` | `0x080006C5` | `Reset_Handler` |
| `79 06 00 08` | `0x08000679` | `NMI_Handler` |
| `79 06 00 08` | `0x08000679` | `HardFault_Handler` |

1. **`0x20003000` is not a number someone typed.** It is `0x20000000 + 0x3000` (12 KB), computed by the linker; the stack grows *downward* from it.
2. **Every handler address is odd.** `nm` gives `Reset_Handler` = `0x080006C4`; the table holds `0x080006C5`. Bit 0 is the **Thumb bit** (T), not part of the address (bits 31:1). **An even entry faults on the first instruction** (02_Week2_L01_InstructionSet_Thumb.md).
3. **Words 2 and 3 are identical** because NMI and HardFault are both weak aliases of the one `Default_Handler` (at `0x08000678`).

## 10. Weak aliases and the misspelling trap (slide 8)

```c
#define WEAK_ALIAS __attribute__((weak, alias("Default_Handler")))
void TIM3_IRQHandler(void)   WEAK_ALIAS;      // startup.c: the weak default
void TIM3_IRQHandler(void) { /* ... */ }      // your lesson: strong, wins at link time
void Default_Handler(void) { for (;;) { } }   // parks, so a debugger can read IPSR
```

- A **weak** symbol is a default that any ordinary (strong) definition overrides. There is no `ISR()` macro, no vector number, nothing to register. **"The name is the registration."** `Default_Handler` parks instead of returning: an unexpected interrupt that returns leaves a misbehaving program, one that stops leaves a program you can attach a debugger to.
- **The trap**: `TIM3_IRQhandler`, one letter wrong. It "compiles. links. runs." It overrides nothing, the weak default stays in the table, and the interrupt does nothing, with no warning. **"The single most expensive typo on this architecture."** When an interrupt "does not fire", check the spelling *first*.

## 11. Four kinds of bytes, and why .data has two addresses (slides 9-10)

| Section | Contents | Lives in | At reset |
|---|---|---|---|
| `.text` | code | FLASH only | runs in place |
| `.rodata` | `const` data | FLASH only | read in place |
| `.data` | initialised globals | **FLASH and RAM** | **must be copied** |
| `.bss` | zero/uninitialised globals | **RAM only** | **must be zeroed** |

- "The two on the left are finished when the chip is programmed. **The two on the right are promises nothing has kept yet.**" `Reset_Handler` exists to keep them.
- C promises that `int counter = 0;` is zero and `int magic = 0xC0FFEE;` holds its value when `main()` begins. "On this chip you are the one who keeps them."
- A `.data` value must survive power-off (so it is stored in FLASH) and be writable (so it runs from RAM). Its **LMA** (load address, where stored) is `_sidata = 0x08001D64`; its **VMA** (virtual address, where it runs) is `0x20000000..0x20000064`, 100 bytes. For `.text`, LMA = VMA.
- `.bss` (372 bytes here) gets **no FLASH at all**, only a size; startup writes the zeros at run time. Section basics: 03_Week3_L02_Development_Toolchain.md.

## 12. Reset Handler in full (slide 11)

```c
uint32_t SystemCoreClock = 12000000UL;   // defined in startup.c (ST's system file not used); HSI48/4
void Reset_Handler(void) {
    uint32_t *src, *dst;
    src = &_sidata;                                              // 1. copy .data FLASH -> RAM
    for (dst = &_sdata; dst < &_edata; ) { *dst++ = *src++; }    //    (LAB EXERCISE 1)
    for (dst = &_sbss;  dst < &_ebss;  ) { *dst++ = 0; }         // 2. zero .bss (LAB EXERCISE 2)
    SystemInit();          // 3. clock: 12 MHz -> 48 MHz
    __libc_init_array();   // 4. C++ ctors, __attribute__((constructor)) (.init_array)
    (void)main();
    for (;;) { }           // main() must not return - but if it does
}
```

- "**Two `memcpy`-shaped loops over addresses the linker chose.** That is the entire mystery of what happens before `main`."
- On a desktop a returning `main()` exits the process. Here there is nothing to exit *to*, and a bare return would run into whatever bytes follow in FLASH. "The infinite loop is a wall."
- Order matters (derived): `SystemCoreClock` is an initialised global, so it is in `.data`. The copy must come **before** `SystemInit()`, or it would overwrite 48000000 with 12000000.

## 13. Linker symbols are addresses, not variables (slide 12)

| You write | You get |
|---|---|
| `&_sdata` | the address the linker chose: **what you want** |
| `_sdata` | the four bytes that happen to live at that address: **garbage** |

- The linker creates no storage, only a *symbol whose value is the address*. `extern uint32_t _sdata;` is "a polite lie told to the compiler" so that `&_sdata` has a type. `uint32_t n = _edata - _sdata;` is **WRONG**: it compiles cleanly and returns garbage.
- **Rule: a linker symbol is only ever used with `&`. If you see one without an ampersand, it is a bug.**
- `Main.c` uses eight, all with `&`, and prints every one. It sizes sections as `(uintptr_t)&_edata - (uintptr_t)&_sdata` = 100 bytes. Derived: `&_edata - &_sdata` on `uint32_t *` counts words (25), not bytes.

## 14. link.ld part 1, MEMORY and the computed stack top (slide 13)

```
ENTRY(Reset_Handler)                       /* ELF entry point, 0x080006C5 */
MEMORY
{
  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 32K     /* slide 3, transcribed */
  RAM   (rw)  : ORIGIN = 0x20000000, LENGTH = 12K  }
_estack = ORIGIN(RAM) + LENGTH(RAM);       /* 0x20003000: computed, not typed */
_Min_Heap_Size  = 0x200;                   /*  512 B reserved */
_Min_Stack_Size = 0x400;                   /* 1024 B reserved */
```

- FLASH is at `0x08000000`, **not at 0** (the low addresses are the code-region alias). RAM at `0x20000000` is **architectural, not ST's choice**.
- `32K`/`12K` belong to this exact part (a C031**C6** has 32 KB of flash): change the part and this line changes with it. `_estack` is **computed**, which is why `0x20003000` is trustworthy: "nobody could have mistyped it."

$$\text{\_estack} = \text{ORIGIN(RAM)} + \text{LENGTH(RAM)} = 0x20000000 + 12 \times 1024 = 0x20003000$$

## 15. link.ld part 2, SECTIONS and the location counter (slide 14)

```
SECTIONS {
  .isr_vector : { . = ALIGN(4); KEEP(*(.isr_vector)) . = ALIGN(4); } >FLASH  /* FIRST: 0x08000000 */
  .text   : { *(.text) *(.text*) ... KEEP(*(.init)) KEEP(*(.fini)) _etext = .; } >FLASH
  .rodata : { *(.rodata) *(.rodata*) } >FLASH
  /* then .ARM.extab, .ARM (exidx), .preinit_array, .init_array, .fini_array, all >FLASH */
  _sidata = LOADADDR(.data);                     /* where .data is STORED, in FLASH */
  .data : { _sdata = .; *(.data) *(.data*) . = ALIGN(4); _edata = .; } >RAM AT> FLASH
  .bss  : { _sbss = .; *(.bss) *(.bss*) *(COMMON) . = ALIGN(4); _ebss = .; } >RAM  /* no AT> */
  ._user_heap_stack : { . = ALIGN(8); PROVIDE(end = .);
                        . = . + _Min_Heap_Size; . = . + _Min_Stack_Size; } >RAM
}
```

- **`>RAM AT> FLASH`** gives `.data` its two addresses (lives in RAM, stored in FLASH), and **`LOADADDR()`** is how startup finds the FLASH copy. "These three lines are why `.data` works."
- **`.` is the location counter**, "the address I have reached so far". `_sdata = .;` is how every boundary marker is made. "The dot is the linker's entire working memory."
- **`KEEP()`** protects a section from `--gc-sections`, which deletes anything unreferenced, and no C code references the vector table. `._user_heap_stack` only **reserves** 0x200 + 0x400 = 1536 B. `PROVIDE(end = .)` marks the heap start for `_sbrk`.

| Symbol | Made by | Value in this build | Used by |
|---|---|---|---|
| `_estack` | `ORIGIN(RAM)+LENGTH(RAM)` | `0x20003000` | `vectors[0]`, loaded into SP by hardware |
| `_sidata` | `LOADADDR(.data)` | `0x08001D64` | copy source |
| `_sdata`, `_edata` | `.` at `.data` start, end | `0x20000000`, `0x20000064` | copy loop |
| `_sbss`, `_ebss` | `.` at `.bss` start, end | `0x20000064`, `0x200001D8` | zero loop |
| `end` | `PROVIDE(end = .)` | `0x200001D8` | `_sbrk`, the heap start |

## 16. Where the memory actually went (slide 15)

| `size -A` section | Size | Addr |
|---|---|---|
| `.isr_vector` | 180 | `0x08000000` |
| `.text` | 5684 | `0x080000b4` |
| `.rodata` | 1652 | `0x080016e8` |
| `.data` | 100 | `0x20000000` |
| `.bss` | 372 | `0x20000064` |
| `._user_heap_stack` | 1536 | `0x20000218` (as printed) |

Linker summary, printed at every build: **FLASH 7624 B of 32 KB (23.27%)**, **RAM 2008 B of 12 KB (16.34%)**.

- **RAM = 100 + 372 + 1536 = 2008.** The heap and stack reservation is three quarters of the RAM use, before any real program is written.
- **FLASH = 180 + 5684 + 1652 + 4 + 4 + 100 = 7624.** The 100 is `.data` counted a **second time**, at its FLASH load address. **"`.data` costs you both."** A large initialised array is the most expensive thing you can declare.
- Address chain (derived): `0x08000000 + 180 = 0x080000B4`, `+ 5684 = 0x080016E8`, `+ 1652 = 0x08001D5C`, `+ 4 + 4 = 0x08001D64` (`_sidata`). RAM: `0x200001D8 + 1536 = 0x200007D8`, so 2008 bytes used. That puts the heap/stack block at `0x200001D8` (the printed heap start), 64 bytes below the slide's `0x20000218`.
- **Prefer `const`**: `.rodata` costs FLASH only, and `.bss` costs no FLASH at all.

## 17. The clock, 12 to 48 MHz in one register write (slide 16)

The STM32C0 wakes on its **48 MHz HSI divided by four, so 12 MHz**.

```c
void SystemInit(void) {
    FLASH->ACR = (FLASH->ACR & ~FLASH_ACR_LATENCY) | FLASH_ACR_LATENCY_0;   // 1 wait state FIRST
    while ((FLASH->ACR & FLASH_ACR_LATENCY) != FLASH_ACR_LATENCY_0) { }      // ...and confirm it
    RCC->CR &= ~RCC_CR_HSIDIV;              // HSIDIV = 000 -> divide by 1 -> 48 MHz
    while (!(RCC->CR & RCC_CR_HSIRDY)) { }
    SystemCoreClock = 48000000UL;
}
```

| Register | Address | Field | Bits | Action |
|---|---|---|---|---|
| `FLASH->ACR` | `0x40022000` | `LATENCY` | 2:0 | set to 1 wait state. Other bits: PRFTEN 8, ICEN 9, ICRST 11, PROGEMPTY 16, DBG_SWEN 18 |
| `RCC->CR` | `0x40021000` | `HSIDIV`, `HSIRDY` | 13:11, 10 | clear (mask `0x3800`), then poll |

- **"The order is not negotiable."** Flash cannot be read as fast as the CPU runs at 48 MHz without one wait state. Raise the clock first and the CPU fetches an instruction that is not ready: **the part hangs with no error**, somewhere unrelated to your bug.
- **The rule for every clock change: wait states go up *before* the frequency, and come down *after* it.**
- This is the gentlest STM32 clock setup: **no PLL, no lock bit, no source switch** (the F446RE later needs all three). If the report says `SystemCoreClock : 12000000`, the HSIDIV write did not take; everything still works, at a quarter speed.

## 18. printf needs a write stub (slide 17)

```c
int _write(int fd, const char *buf, int len) {      // retarget.c: the whole stdio-to-hardware bridge
    (void)fd;  for (int i = 0; i < len; i++) {
        if (buf[i] == '\n') { uart2_putc('\r'); }   // send \r\n for each \n
        uart2_putc(buf[i]);
    }
    return len;
}
```

- `printf` lives in the C library, which has never heard of a UART. It calls `_write()` and expects the system to provide it. Implement `_write` and `printf`, `puts`, `putchar` and `fprintf` all work at once.
- The AVR edition hand-wrote **fifteen formatters** to fit a 4 KB part. Here newlib-nano's `printf` costs **about 1.4 KB of 32 KB**, so this edition uses the standard library.
- **`_sbrk()`** hands `malloc` the gap between `.bss` and the stack, starting at `&end`; `printf` allocates its buffer there. **Get `_sbrk` wrong and `printf` prints nothing**: a silent board running a perfectly good program.

## 19. What you should see on the serial monitor (slide 19)

```
  SystemCoreClock : 48000000 Hz
  vector table    : 0x08000000  (must be the base of FLASH)
  .data in FLASH  : 0x08001D64  _sidata, the copy source
  .data in RAM    : 0x20000000 .. 0x20000064  (100 bytes)
  .bss  in RAM    : 0x20000064 .. 0x200001D8  (372 bytes)
  heap starts at  : 0x200001D8  (first byte after .bss)
  stack top       : 0x20003000  _estack, loaded into SP by the HARDWARE before any code runs
  .data copied    : 0x00C0FFEE  OK    (expect 0x00C0FFEE)
  .bss  zeroed    : 0x00000000  OK    (expect 0x00000000)
```

- **"Not one of those numbers is hardcoded."** Every address is read back at run time through `&` from a linker symbol. Edit `link.ld` and they move.
- Witnesses in `Main.c`: `volatile uint32_t data_witness = 0x00C0FFEEu;` is in `.data`; `bss_witness = 0u` and `static uint32_t frame_count;` are in `.bss`; `const uint32_t rodata_witness = 0x5AFEu;` is in `.rodata` (no RAM). Then the bar plays, LD4 toggles once per frame, and `frame N` prints every 32nd frame.

## 20. What carries forward (slide 21)

- Every later lesson links this same `startup.c` shape. When lesson 06 defines `TIM3_IRQHandler`, you know why that name and no other works. `size -A` is now readable.
- **Silent-board checklist**: Did `.data` get copied? Is `SystemCoreClock` 48 MHz or still 12? Is the handler name spelled exactly right? **Is the peripheral clock even enabled?** (Next: GPIO, behind `RCC->IOPENR`, which must come first "or the entire port reads back zero".)

## Lab takeaways

"Write your prediction down before you build." The baseline build is **FLASH 7624 B (23.27%), RAM 2008 B (16.34%), zero warnings**. Upload **`Main.elf`**, which carries the symbols.

- **Part 0, build and run**: FLASH ends at `0x08000000 + 0x8000 = 0x08008000`, so the last byte is `0x08007FFF`. Printed `0x08...` values (vectors, `_sidata`) are FLASH; `0x20...` values are SRAM. Printing `&GPIOA->ODR` gives `0x50000014`, where an F4/F1 would give `0x4...`; trust *your* part's manual.
- **Part 0, step 5: comment out `RCC->IOPENR |= RCC_IOPENR_GPIOAEN;` in `led_init()`.** Result: **serial fine, bar fine, LD4 dead.** `led_init()` wrote MODER to an unclocked port, so the write was **silently discarded**. `uart2_init()` later enables the same gate and configures PA2/PA3, and nothing goes back to fix PA5. The bar is on GPIOB, behind its own gate. The fault is in the **order**.
- **Part 1: delete the `.data` copy.** It builds and runs; the report shows `.data copied: 0x00000000 WRONG`. It reads zero only because the simulator hands out zeroed RAM. **On a real chip the value is indeterminate**: arbitrary after power-on, the previous program's data after a warm reset. Nothing crashes; missing startup work produces one wrong value and lets everything else carry on.
- **Part 2: delete the `.bss` zero.** **Most likely nothing changes**: `bss_witness` is OK and the counter still starts at 32, so the bug is invisible in Wokwi. On hardware `.bss` holds garbage or leftovers ("might count from 3,141,592"). It is hard to find because it is invisible wherever RAM starts clean, it moves when the program changes, and it depends on how you reset.
- **Part 3: move `.isr_vector` after `.text`** (the most important part). Result: **zero errors, zero warnings, identical sizes**. `.text` is now at `0x08000000` and `.isr_vector` at `0x08001634` (134223412). The first record is `:10000000002243088B42...`, so **SP = `0x08432200`** (in FLASH, not writable) and **PC = `0xD374428B`** (unmapped). Those words are machine code; no handler is installed yet, so the core **locks up**.
- Part 3, what would catch it: assert that `.isr_vector` is at `ORIGIN(FLASH)` and that word 1 is in FLASH and odd. **"The compiler checks your language. The linker checks your arithmetic. Neither checks your intent."** Never trust a build's exit code alone. (Lab.md's restore check quotes `003000200D050008...`, from an older build; the current first record is `00300020C5060008...`.) Optional: remove `const` from `vectors` and it builds but warns `LOAD segment with RWX permissions`. Remove only `KEEP()` and it still works, but only by luck on this toolchain; keep the `KEEP()`.
- **Part 4: shrink RAM.**

| RAM | Result |
|---|---|
| 12K | baseline, `_estack = 0x20003000` |
| 8K | **only the stack top moves**, to `0x20002000`, and the hex starts `00200020`. Everything else is placed bottom-up. |
| 2K | **builds**, 2008/2048 = **98.05%**, but is **not safe**: the sizes are a *reservation, not a limit*, so the stack can grow through the heap into `.bss` |
| 1K | **fails**: `section '._user_heap_stack' will not fit in region 'RAM'`, `overflowed by 984 bytes` (2008 - 1024), **196.09%** |

- The 8K value reaches SP with no code involved: `link.ld` computes `_estack`, `vectors[0]` holds it, the table sits at `0x08000000`, `objcopy` writes it into the hex, and the **hardware** loads it. **"A linker checks what it can compute; it cannot check what happens later."** Step 2 is the more dangerous one because it was not caught.
- **Part 5: what a 64 x `uint32_t` (256 B) array costs.** The added `printf` costs 16 B `.rodata` + 16 B `.text` in every row.

| Declaration | .rodata | .data | .bss | FLASH | RAM |
|---|---|---|---|---|---|
| baseline | 1652 | 100 | 372 | 7624 | 472 |
| (a) `static const volatile ... = {...}` | **1924** | 100 | 372 | +288 | **+0** |
| (b) `static volatile ... = {...}` | 1668 | **356** | 372 | +288 | +256 |
| (c) `static volatile ...;` | 1668 | 100 | **628** | +32 | +256 |

- **`const` costs FLASH only. Initialised and writable costs both. Uninitialised costs RAM only.** Without `volatile`, `-Os` folds the read into a constant and **deletes the array**. RAM is the scarce one: "mark it `const` unless you will write to it."
- **Part 6: the LED bar is yours.** **One byte is the whole bar** (bit 0 = PB0, bit 7 = PB7). A frame is `frame_t { uint8_t leds; uint16_t ms; }`, and `static const` tables sit in `.rodata`. `PLAY(t, n)` counts the rows with `sizeof(t)/sizeof(t[0])`, and `ledbar_show()` is the only function that writes the port. `delay_ms()` polls SysTick's `COUNTFLAG` with LOAD = 48000000/1000 - 1 = 47999 (07_Week5_L06_Time_Timers.md). **A 500 ms frame wastes 24 million cycles.** Removing `const` from a table grows `.data`.

## Exam focus

1. **Decode** `:10000000 00300020 C5060008 ...`. *SP = 0x20003000 (bytes reversed) and PC = 0x080006C5. Reset_Handler is at 0x080006C4; bit 0 is the Thumb bit.*
2. **What does the core do on reset, before any instruction?** *It loads SP from word 0 and PC from word 1 at 0x08000000 (aliased at 0). That is why Reset_Handler can be C, unlike on AVR.*
3. **`_estack` for 8 KB of RAM?** *0x20000000 + 0x2000 = 0x20002000. It is the only printed value that moves.*
4. **A vector entry is even (0x080006C4). What happens?** *The T bit is clear, so it faults on the first instruction.*
5. **Spot the bug:** `void USART2_IRQhandler(void){...}`. *It is misspelled, so it overrides nothing and the weak Default_Handler stays in the table, with no warning. When the IRQ fires, the core parks in `for(;;)`.*
6. **Spot the bug:** `uint32_t n = _edata - _sdata;`. *It reads memory contents. The fix is `(uintptr_t)&_edata - (uintptr_t)&_sdata`, which is 100.*
7. **Where does each go?** *`const int t[4]={1};` goes to .rodata (FLASH only), `int t[4]={1};` to .data (FLASH and RAM), and `int t[4];` to .bss (RAM only).*
8. **Why is FLASH 7624 and not 7524?** *.data's 100 B load copy is counted in FLASH too: 180+5684+1652+4+4+100.*
9. **Why is RAM 2008 for a tiny program?** *100 + 372 + 1536, where 1536 is the heap/stack reservation (0x200 + 0x400).*
10. **BRR at 48 MHz and 115200 baud?** *(48 000 000 + 57 600)/115 200 = 417 = 0x1A1. At 12 MHz the same formula gives 104 (derived).*
11. **`SystemInit()` raises the clock before the wait state. What happens?** *Flash cannot keep up, so the part hangs with no error. Wait states go up before the frequency and down after.*
12. **What does the 48 MHz switch take?** *Clear RCC->CR HSIDIV (bits 13:11) to 000, then poll HSIRDY (bit 10): no PLL, no lock bit, no source switch. The reset clock is HSI48/4 = 12 MHz.*
13. **Move `.isr_vector` after `.text`. Errors?** *None, and the sizes are identical. SP = 0x08432200 and PC = 0xD374428B, so the core locks up. Catch it by asserting the table is at ORIGIN(FLASH) and word 1 is in FLASH and odd.*
14. **2K vs 1K of RAM?** *2K builds at 98.05% but is unsafe (a reservation, not a limit). 1K fails: overflowed by 984 bytes, 196.09%.*
15. **Delete the .bss loop and run in Wokwi. What changes?** *Probably nothing, because RAM starts zeroed. On hardware you get garbage.*
16. **Comment out GPIOAEN in `led_init()`.** *LD4 is dead but the UART and the bar work. The write to the unclocked port is dropped, and `uart2_init()` enables the gate later.*
17. **Why `section`, `used` and `const` on `vectors`?** *Placement at 0x08000000; keeps an array no C code reads; FLASH instead of 180 B of RAM, with no RWX warning.*
18. **Why `KEEP()`?** *`--gc-sections` drops unreferenced sections, and only the hardware references the table.*
19. **Address of TIM3's vector (IRQ16)?** *0x08000000 + 4(16+16) = 0x08000080, derived from startup.c's table.*
20. **Address of `GPIOA->ODR`, and why is the named form smaller?** *0x50000014 (IOPORT, not 0x4...). The base stays in a register and each register is a constant offset: 14 B against 16 B with a literal pool.*
21. **The board is silent but the program is correct. What do you check?** *`_sbrk` (printf's heap), the .data copy, SystemCoreClock = 48 MHz, handler spelling, the peripheral clock gate.*
22. **Why `for(;;)` after `main()` and in Default_Handler?** *There is nothing to return to; a return would run into the next FLASH bytes. A parked core can be inspected with a debugger (IPSR).*
