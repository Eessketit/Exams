# L02 Development: Toolchain, Sections, Linking, Boot

What this lecture is about: the *other* machine, the toolchain. With no OS, every job between power-on and the first line of `main()` (place the program, give it a stack, set up globals, call `main`) is done by the build and by your startup code, or not at all. Part 0 theory, no code to write. All figures are real output from the repo's build of `_spike/c031c6/` (STM32C031C6). The detailed startup code and `link.ld` are L04: see 04_Week3_L04_Startup_LinkerScript.md.

## 1. No OS, so somebody else does its jobs (slide 1)

- On a PC, `gcc hello.c` + the OS: decides where the program lives, provides a stack, zeroes globals, opens `stdout`, calls `main()`.
- **There is no operating system here.** Every job still has to be done; if you do not arrange it, nothing does.
- The lesson's question: *between power-on and the first line of `main()`, who does the work, and what happens if nobody does?*

| Job (PC: the OS) | Who does it on this chip (slides 2-8) |
|---|---|
| where the program lives | the linker, from `link.ld` (locate stage) |
| a stack | hardware loads SP from vector word 0 |
| set up globals | `Reset_Handler`: copy `.data`, zero `.bss` |
| `stdout` | your `_write` (defined in `main.o`, needed by `printf` in `libc_nano.a`) |
| call `main()` | `Reset_Handler` |

## 2. Five stages, not one, and address binding (slide 2)

- **`gcc` is not a compiler. It is a driver** that runs four or five programs in sequence; on embedded the last one bites.
- The five stages: **preprocess, compile, assemble, link, locate**. `main.c` becomes `main.o`; then `main.o` + `startup.c` + `link.ld` go into LINK and LOCATE ("resolve names, then assign real addresses").
- The first stages are ordinary. **Locate is the embedded one** (the slide's text calls it "stage 4", counting preprocess and compile as one box): deciding that `SystemInit` lives at `0x0800022c` and `SystemCoreClock` at `0x20000000`.
- "On a PC the last stage is invisible. Here you write its input by hand." (`startup.c`, `link.ld`)

**Address binding**: when does a name in your source get a real address? Three possible moments:

| Bound at | Meaning | Where you meet it |
|---|---|---|
| compile time | fixed when built, cannot move | **this chip**, and MS-DOS `.com` files |
| load time | the loader picks a base when the program starts | classic relocatable executables |
| run time | addresses move while running, translated by an **MMU** | every desktop and phone OS |

- A desktop binds late: the same binary runs at a different address every launch, and two programs can both believe they own `0x400000`.
- **The rule: here there is no loader and no MMU, so binding happens at build time and is burned into the image.** That is why the embedded build needs a stage the desktop build does not, and why you write its input by hand.

## 3. The compiler sees one file at a time (slide 3)

- Each `.c` is compiled **alone** into an `.o`, knowing nothing of the others. Where it needs a name it does not have, it leaves **a hole and a note** (textbook terms: an undefined symbol plus a relocation).

| Object | Defines | Needs |
|---|---|---|
| `main.o` | `main`, `_write` | `printf`, `SystemCoreClock` |
| `startup.o` | `Reset_Handler`, `SystemCoreClock` | `main` |
| `libc_nano.a` | `printf` | `_write`, `_sbrk` |

- **The linker matches every "needs" to exactly one "defines". None left over, none duplicated, or it refuses.**
- `undefined reference to X`: somebody needs `X`, nobody defines it. Real spike example: `undefined reference to SystemCoreClock`, because ST's header *declares* it but ST's `system_stm32c0xx.c` (deliberately not used in this course) *defines* it. Fix: the course's `startup.c` defines it.
- `multiple definition of X`: two files both define it; the linker will not choose for you.
- Declare vs define: `extern uint32_t SystemCoreClock;` (header, no storage) vs `uint32_t SystemCoreClock = 12000000;` (one `.c` file, storage).

## 4. Your program is sections, not one blob (slide 4)

**The general idea: an object file is sorted by what things need, not by the order you wrote them.** Four sets of requirements, four sections (same names in every ELF file, Linux, macOS; `.bss` is a 1950s assembler directive):

| Section | Holds | Requirement | Lives in |
|---|---|---|---|
| `.text` | code | executable, never changes | flash |
| `.rodata` | `const` data, string literals | never changes, no execution | flash |
| `.data` | globals with a starting value | writable *and* remembered | RAM, values copied from flash |
| `.bss` | globals that start at zero | writable, no stored value | RAM only |

Real section output for the spike:

| Section | Size (B) | Address | Size hex | End (addr + size) |
|---|---|---|---|---|
| `.isr_vector` | 180 | `0x08000000` | `0xb4` | `0x080000b4` |
| `.text` | 4792 | `0x080000b4` | `0x12b8` | `0x0800136c` |
| `.rodata` | 184 | `0x08002cac` (slide) | `0xb8` | |
| `.data` | 96 | `0x20000000` | `0x60` | `0x20000060` |
| `.bss` | 364 | `0x20000060` | `0x16c` | `0x200001cc` |

- Two distinct places: **FLASH from `0x08000000`** (`.isr_vector`, `.text`, `.rodata`, `.data` (a copy)) and **SRAM from `0x20000000`** (`.data` (the real one), `.bss`, heap, stack (grows down)). Memory map: see 01_Week2_L00_ProgrammersModel.md (memory map section).
- Each section starts where the previous ends: `.text` at `0x08000000 + 180 = 0x080000b4`; `.bss` at `0x20000000 + 96 = 0x20000060`.
- Note: the slide prints `.rodata` at `0x08002cac`, but the spike's `Main.map` puts it at `0x0800136c`, directly after `.text`, consistent with the rule above (textbook context: checked in the map file). If asked to derive it, answer `0x0800136c`.
- `.isr_vector` = 180 B = 45 words, the vector table (details in L04).

## 5. The awkward one: .data, and why .bss is free (slide 5)

- `uint32_t SystemCoreClock = 12000000;` must be **writable**, so it lives in RAM; its initial value must **survive power-off**, so it lives in flash. Both, so **`.data` exists twice: the values live in flash, the variables live in RAM.** (Textbook terms: load address LMA in flash, run address VMA in RAM; the map file says `.data 0x20000000 ... load address 0x0800142c`.)
- `.bss` starts at zero, so the image records only *how many bytes to clear*. **364 B of `.bss` cost nothing in flash; 96 B of `.data` cost 96.** Your desktop's C runtime does the same.
- Who copies the 96 bytes before `main()`? On a PC, the loader. Here, `Reset_Handler`, in four lines of the startup file:

```c
src = &_sidata;                                  /* where the values sit in flash */
for (dst = &_sdata; dst < &_edata; ) { *dst++ = *src++; }
for (dst = &_sbss;  dst < &_ebss;  ) { *dst++ = 0; }
```

- `_sidata`, `_sdata`, `_edata`, `_sbss`, `_ebss` **are not variables. The linker invents them**, and their values are addresses it chose. **This is the one place where your C code reads decisions the linker made** (hence `&_sdata`: you want the symbol's address, not a value stored there).

Spike values of the linker symbols (textbook context: from `Main.map`):

| Symbol | Value | Meaning |
|---|---|---|
| `_sidata` | `0x0800142c` | start of `.data` values in flash |
| `_sdata` | `0x20000000` | start of `.data` in RAM |
| `_edata` | `0x20000060` | end of `.data` (96 B = 24 words copied) |
| `_sbss` | `0x20000060` | start of `.bss` |
| `_ebss` | `0x200001cc` | end of `.bss` (364 B = 91 words zeroed) |

- **Skip the `.bss` loop and globals start as whatever was in RAM at power-on. The program works perfectly on a cold boot and misbehaves after a reset.** Why intermittent: a reset does not clear SRAM, so after a warm reset a "zero" global holds what the previous run left; the bug depends on history, not on the code path.

## 6. The linker script is the memory map, written down (slide 6)

- The linker knows nothing about your chip; you tell it where flash starts, how big RAM is, which section goes where:

```
MEMORY
{
  FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 32K
  RAM   (rw) : ORIGIN = 0x20000000, LENGTH = 12K
}
```

| Region | Attr | ORIGIN | LENGTH | Last byte |
|---|---|---|---|---|
| FLASH | `rx` | `0x08000000` | 32K = 32768 B | `0x08007FFF` |
| RAM | `rw` | `0x20000000` | 12K = 12288 B = `0x3000` | `0x20002FFF` |

- **Those four numbers come from the datasheet**; they are the difference between firmware that runs and firmware that does not. **Get `LENGTH` wrong and the build succeeds; the failure arrives later, as a stack that quietly walks off the end of memory.**
- The build's memory report:

| Region | Used | Region size | %age used |
|---|---|---|---|
| FLASH | 5260 B | 32 KB | 16.05% |
| RAM | 2000 B | 12 KB | 16.28% |

- $\%\text{used} = \frac{\text{used}}{\text{LENGTH}}\times 100$: $5260/32768 = 16.05\%$, $2000/12288 = 16.28\%$.
- **On a 32 KB part that number belongs in every build log. It is the only early warning you get.**
- Where the numbers come from (textbook context, from `Main.map`; see L04 for the memory report): FLASH $= 180+4792+184+4+4+96 = 5260$ (vectors, code, rodata, `.init_array`, `.fini_array`, `.data` values). RAM $= 0x7d0 = 2000$: `.data` + `.bss` = 460 B, aligned to `0x200001d0`, then reserved heap `0x200` (512) and stack `0x400` (1024).

## 7. What actually gets programmed: elf, bin, hex (slide 7)

| File | What it is | Used by | Spike size (textbook context) |
|---|---|---|---|
| `Main.elf` | code + addresses + symbols + debug | debugger, simulator | 338584 B |
| `Main.bin` | raw bytes, exactly as in flash | some programmers | 5260 B (= FLASH used) |
| `Main.hex` | the same bytes as printable text records | most programmers | 14552 B |

The first two records of the real `Main.hex`:

```
:020000040800F2
:1000000000300020750200082902000829020008BB
```

Record format `:LL AAAA TT DD...DD CC`; checksum $CC = (-\sum \text{all bytes from LL to last DD}) \bmod 256$.

| Field | Meaning |
|---|---|
| `:` | every record starts with a colon |
| `10` | 16 data bytes follow |
| `0000` | at offset `0x0000` |
| `00` | record type: data |
| `00300020` | `0x20003000`, the initial stack pointer |
| `75020008` | `0x08000275`, the reset vector |
| `BB` | checksum |

- Bytes are stored **little-endian**: `00 30 00 20` reads back as `0x20003000`. `0x20003000 = 0x20000000 + 12K`, one past the last RAM byte (the stack grows down from the top).
- Checksums verified: record 1, $0x02+0x00+0x00+0x04+0x08+0x00 = 0x0E$, $0x100-0x0E = 0xF2$. Record 2, byte sum $0x145$, low byte $0x45$, $0x100-0x45 = 0xBB$.

| Word | Address | Value | Bits |
|---|---|---|---|
| 0, initial SP | `0x08000000` | `0x20003000` | 31:0 stack top |
| 1, reset vector | `0x08000004` | `0x08000275` | 31:1 address, bit 0 = T (Thumb) = 1 |

- **The reset vector is odd: bit 0 is the Thumb bit, and the handler itself starts at `0x08000274`.** Thumb bit: see 02_Week2_L01_InstructionSet_Thumb.md (Thumb section).
- Words 2 and 3 (`0x08000229`, NMI and HardFault) both point at the default handler at `0x08000228` (textbook context, from `Main.map`; weak aliases are L04).
- `:02000004 0800` is an **extended linear address** record: it sets the **upper half** of the address to `0x0800`, so offset `0x0000` means `0x08000000`. An 8-bit AVR never needed one: its whole flash fits in 16 bits of address (64 KB). This chip's flash sits at `0x08000000`, beyond 16 bits.
- Other record types in the same file (textbook context): `01` end of file (`:00000001FF`), `05` start linear address (`:040000050800027578`, the entry point `0x08000275`).

## 8. What runs before main, and bootstrapping (slide 8)

Power on / reset, then **hardware loads SP and PC from vector[0], [1]**, then `Reset_Handler`: copy `.data`, zero `.bss`, `SystemInit`, `__libc_init_array`, then `main()`.

- Loading SP and PC is **the only step the hardware does for you**: the CPU reads **two 32-bit words from address zero of flash**, the stack pointer and the reset vector, and starts. **That is the entire boot process. Everything else is code you can read.**
- `SystemInit` (at `0x0800022c`) sets up the clock; `__libc_init_array` runs the C library's init list (textbook context). Both in detail in L04.
- **Bootstrapping**: on reset the hardware can do only one fixed, dumb act, and that act must start software that is progressively less dumb.

| | PC | This chip |
|---|---|---|
| hardware's fixed act | CPU starts at a fixed address near the top of its address space | CPU reads SP and PC from flash address 0 |
| chain | firmware, then bootloader, then kernel, then your program | your code |
| handoffs | **four**, several seconds | **one link**: two words, then your code |

- The real difference: not that embedded booting is stranger, but that **it is short enough to read in full, and if one of those two words is wrong, nothing else exists to catch it.**

## 9. Your instruments: Wokwi and Renode (slide 9)

| | Wokwi | Renode |
|---|---|---|
| Where | a browser tab | a terminal |
| Shows you | the board: LEDs, displays, wires | serial output, registers, instruction counts |
| Good for | *does the circuit behave?* | *does the code behave?* |
| Cost | free, nothing to install | free, nothing to install |

- Both load the same `Main.elf`. **Neither compiles anything**: the compiler runs on your machine, the simulator only executes.
- **"A thing is not working until you have watched it work."** A clean build, a valid hex file and a correct-looking register dump have all, in this repo's history, come from firmware that drove nothing.

## 10. What You Should Be Able to Say, answered (slide 10)

1. Preprocess, compile, assemble, link, locate. **Locate** (assigning real addresses) is the embedded-specific one.
2. **Both.** Writable, so the variables live in RAM; the initial values must survive power-off, so they live in flash. `Reset_Handler` copies flash to RAM before `main()`.
3. Symbols **the linker invents**; their values are addresses (`_sdata` = start of `.data` in RAM, `_ebss` = end of `.bss`). Not variables; C reads them as `&_sdata`.
4. Globals start as whatever was in RAM. Works on a cold boot, misbehaves after a reset, because reset does not clear SRAM, so it depends on what ran before.
5. The `LENGTH`s (FLASH 32K, RAM 12K). Too large: the build still succeeds, the linker places code or stack in memory that does not exist, and the stack quietly walks off the end of memory at run time.
6. Extended linear address record: sets the upper 16 bits of the address to `0x0800` (flash at `0x08000000`). The 8-bit chips' whole flash fit in 16 bits of address.
7. Compile time, load time, run time. This chip: **compile (build) time**, no loader, no MMU. Laptop: **run time**, needs an **MMU**.
8. `.bss` is all zeros, so the image stores only how many bytes to clear; `.data` must store every initial value in flash.
9. PC: CPU fixed address, firmware, bootloader, kernel, program, **four handoffs**. This chip: two words then your code, **one link**.

## Exam focus

- **Decode a record.** `:10000000 00300020 75020008 ...`: 16 bytes at offset 0, type data. SP = `0x20003000`, PC = `0x08000275`, handler at `0x08000274` (clear bit 0). Base from the preceding `:020000040800F2` is `0x08000000`.
- **Compute a checksum.** `:02000004 0801 ??`: $0x02+0x04+0x08+0x01 = 0x0F$, so `F1`. This record points at `0x08010000`, past flash end `0x08007FFF` on a 32K part: a hex that cannot be programmed.
- **Predict an address.** `.data` grows to 100 B: `.bss` starts at `0x20000000 + 100 = 0x20000064`. `.text` starts at `0x08000000 + 180 = 0x080000b4`.
- **Flash vs RAM cost.** Add `int table[25] = {1};` (100 B, initialised): +100 flash, +100 RAM. Add `int buf[25];` (zero): +0 flash, +100 RAM. `const int k[25] = {1};`: +100 flash (`.rodata`), +0 RAM.
- **Name the error.** `startup.c` and `main.c` both write `uint32_t SystemCoreClock = 12000000;`: `multiple definition of SystemCoreClock`. Nobody defines it (header only): `undefined reference to SystemCoreClock`.
- **Spot the bug.** `RAM (rw) : ORIGIN = 0x20000000, LENGTH = 16K` on this chip: builds clean, reports a lower %, the stack starts above real RAM and the program fails at run time. Fix from the datasheet: 12K.
- **Spot the bug.** Startup code without the `.bss` loop: a counter `static int n;` starts at garbage after a reset button press, while power-cycle tests pass. Intermittent, history-dependent.
- **Hardware at reset?** Exactly two loads, SP from `0x08000000`, PC from `0x08000004` (odd, Thumb bit). No `.data` copy, no `.bss` clear, no clock setup.
- **Which file?** Debugger or simulator: `Main.elf` (has symbols). Most programmers: `Main.hex`. Raw image of flash: `Main.bin` (size = FLASH used, 5260 B).
