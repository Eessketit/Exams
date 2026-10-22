# L01 Instruction Set: Thumb on the Cortex M0 Plus

**What this lecture is about:** reading (not writing) the Thumb machine code that `arm-none-eabi-gcc -Os` emits for the STM32C031C6, so you can say exactly what a line of C became.

Every listing is real output from the spike build `_spike/c031c6/Main.elf` (`-Os`, arm-none-eabi-gcc 15.2.1). Part 0 theory, the second of four lessons with no code to write.

## 1. Why read assembly (slide 1)

- You never write an application in assembly here; you **read** it when C cannot explain a failure: the debugger stops with no source line; a variable changes when nothing wrote it; a 3 µs loop takes 30; the optimiser deletes code you needed.
- All four are answered by **the instructions the compiler actually emitted**. A diagnostic skill, like reading a stack trace.

## 2. Thumb, the only instruction set this chip has (slide 2)

| | ARM (A32) | Thumb (T32) |
|---|---|---|
| Instruction width | always 32 bits | 16 bits, widening to 32 only when it must |
| Code size, same program | baseline | **roughly 30% smaller** |
| Conditional execution | on every instruction | on branches |
| Registers in one instruction | all 16, always | R0-R7 in most 16-bit forms |
| Arrived | 1985, the original | 1994, in the ARM7**T**DMI |
| Executed by | Cortex-A, Cortex-R | Cortex-A, Cortex-R, **and every Cortex-M** |

- Diagram: the same 4 instructions are **16 bytes** in ARM, **10 bytes** in Thumb (three 16-bit, one widened). "A third less flash ... is worth more to a 32 KB part than anything the wider encoding was buying."
- Cortex-A holds both and switches at run time. **A Cortex-M has no ARM state to switch to**: Thumb is not a mode you opt into, it is the only thing the decoder understands.
- General idea, **code density** (program per byte). Fixed wide encodings decode trivially and waste space; variable length (x86: 1 to 15 bytes) packs tightly but the decoder must first find where the next instruction starts. RISC compromise = a **compressed instruction set** beside the full one: **Thumb** (ARM), **MIPS16**, RISC-V's **"C" extension**. Memory, not arithmetic, is what a small system runs out of first.
- Proof in `Main.map`: `.../15.2.1/thumb/v6-m/nofp/libgcc.a(_udivsi3.o)`. **`thumb`** = instruction set, **`v6-m`** = architecture, **`nofp`** = no FPU; GCC ships one runtime copy per combination.

## 3. Thirteen mnemonics make 80 percent of the code (slide 3)

- The spike: **2100 instructions**, **51 distinct mnemonics**. Shares (running total): `movs` 15.9, `ldr` 15.3 (31.2), `cmp` 8.3 (39.5), `str` 8.0 (47.5), `adds` 5.7 (53.2), `bl` 4.3 (57.5), `lsls` 4.0 (61.5), `b` 3.9 (65.4), `bne` 3.6 (69.0), `beq` 3.5 (72.5), `subs` 2.5 (75.0), `push`/`pop` 4.6 (**79.6%**).
- **13 mnemonics = 80%** (push and pop count as two); the other 38 are the rest. "Move things. Add things. Compare things. Jump somewhere."

## 4. Load and store: the two machine models (slide 4)

The question every ISA answers once: **may an arithmetic instruction name a memory address?**

```
add  dword [counter], 1        ; x86, register-memory: one instruction
ldr   r0, [r1]                 @ Cortex-M, load-store: the same job in three
adds  r0, r0, #1
str   r0, [r1]
```

| | Register-memory | Load-store |
|---|---|---|
| Found in | x86, 68000, S/360 | **ARM**, RISC-V, MIPS, **AVR** |
| An ALU operand may be | a register **or** memory | a register only |
| Memory is touched by | most instructions | `ldr` / `str`, and nothing else |
| Instruction length | variable, x86 is 1 to 15 bytes | fixed, Thumb is 2 or 4 |
| `counter++` costs | 1 instruction | 3 instructions |
| ...and bus accesses | 2 | 2 |

- **The trade: load-store costs instructions, not memory traffic.** It buys a fixed-length encoding, a decoder that never asks how long an instruction is, and equal-depth pipeline stages for every opcode; a 48 MHz part with no cache is built from those. That is most of what "RISC" vs "CISC" meant. (VAX: *both* operands could be memory.)
- **AVR's one crack:** `sbi PORTB, 0` set a low-I/O bit in one uninterruptible instruction. **Cortex-M0+ has no `sbi`**; peripheral registers are ordinary memory. The convenience returns as hardware, GPIO `BSRR` (see 06_Week4_L05_GPIO_Interrupts.md, BSRR section).
- Crossing the boundary: `ldr`/`str` 32 bits (`x = *p;` / `*p = x;`); `ldrb`/`strb` 8 bits (`char`, `uint8_t`); `ldrh`/`strh` 16 bits (`uint16_t`); `ldrsh` 16 bits **sign-extended** (`int16_t`). `movs r0, #7` (`x = 7`) and `movs r0, r3` (`x = y`) never touch memory.
- **Rule: setting one bit in a peripheral register is never one instruction here.** Read, modify, write = **3 instructions, 2 bus events, and a gap** that belongs to whatever runs next (see 05_Week4_L03_Execution_Concurrency.md, atomicity section).

## 5. Arithmetic, logic, and the missing divide (slide 5)

| Instruction | Does | Note |
|---|---|---|
| `adds r0, r1, r2` / `subs r0, r1, #4` | add / subtract | |
| `negs r0, r1` | negate | `0 - r1` |
| `muls r0, r1` | multiply | 32x32, low 32 bits kept |
| `adcs` | add with carry | builds 64-bit sums from 32-bit parts |
| `ands` / `orrs` / `eors r0, r1` | AND / OR / XOR | `x &= y`, `x \|= y`, `x ^= y` |
| `bics r0, r1` | **bit clear**, `r0 AND NOT r1` | `x &= ~y`, the mask-clearing idiom |

- **No divide instruction on Cortex-M0+.** `a / b` calls the library routine `__aeabi_uidiv`, dramatically slower than multiply. The spike links `080000b4 <__udivsi3>` because one line of C divided. M3 and above have `sdiv` / `udiv`.
- **Why the `s`:** the 16-bit encodings have no room for a choice, so most data-processing instructions *always* set the flags and the compiler writes `adds`, not `add`. M3+ 32-bit encodings let you pick.

## 6. Shifts and bit fields (slide 6)

- `lsls r0, r1, #3` logical shift left (multiply by 8); `lsrs r0, r1, #3` logical shift right (**unsigned** divide by 8); `asrs r0, r1, #3` arithmetic shift right (**signed** divide, keeps the sign); `rors r0, r1` rotate right.
- Reason shifts are everywhere: **bit fields**. In `GPIOA->MODER |= (2u << (pin * 2));` the `<<` is an `lsls`. All peripheral configuration is shift-and-mask, so `lsls` (4.0%) outranks `subs` (2.5%).
- Pick the shift that matches the signedness. Computed, `x = -8` (`0xFFFFFFF8`) shifted right 1: `asrs` gives `0xFFFFFFFC` = -4; `lsrs` gives `0x7FFFFFFC` = 2147483644 (a small negative became a huge positive).

## 7. Flags and conditional branches (slide 7)

- **Condition-code machines** (ARM, x86, AVR, 68000): a compare *sets* flags, a later branch *reads* them, coupled by invisible state. **Compare-and-branch machines** (RISC-V, MIPS): no flags register; RISC-V writes `blt a0, a1, label` in one instruction.
- Flags buy **density** (one `cmp` feeds several branches); they cost a hidden dependency every instruction in between must preserve, awkward for deep or out-of-order pipelines, the main reason newer designs dropped them.
- **This chip is a condition-code machine.** `cmp` is a subtraction that throws the answer away and keeps the flags; `tst` is an AND that does the same.
- Flags = top of `APSR` (flags view of `xPSR`, see 01_Week2_L00_ProgrammersModel.md): **N bit 31** negative, **Z bit 30** zero, **C bit 29** carry/borrow, **V bit 28** signed overflow.

| Branch | Taken when | From C | Flag test (textbook context) |
|---|---|---|---|
| `beq` / `bne` | equal / not equal | `if (a == b)` / `if (a != b)` | Z = 1 / Z = 0 |
| `blt` / `bge` | signed less / greater-or-equal | `int` comparison | N != V / N = V |
| `bcc` / `bcs` | unsigned lower / higher-or-same | `unsigned` comparison | C = 0 / C = 1 |
| `bmi` / `bpl` | negative / positive | sign test | N = 1 / N = 0 |

- **`blt` and `bcc` are not interchangeable.** The compiler picks by the variable's signedness; a comparison that misbehaves at the extremes of a range is very often a signedness bug, visible at once in the disassembly.
- Computed example: `cmp r0, r1`, `r0 = 0xFFFFFFFF`, `r1 = 1` gives `0xFFFFFFFE`, N=1 Z=0 C=1 V=0. `blt` **taken** (as `int`, -1 < 1); `bcc` **not taken** (as `unsigned`, 4294967295 >= 1).

## 8. Branches, calls and returns (slide 8)

| Instruction | Does | C |
|---|---|---|
| `b   label` | jump | `goto`, loop back, `else` |
| `bne label` | jump if condition | `if`, `while` |
| `bl  func` | **branch with link**: jump, return address into `LR` | `f();` |
| `bx  lr` | jump to the address in `LR` | `return;` |
| `push {r4, lr}` | save registers on the stack | prologue |
| `pop  {r4, pc}` | restore, **and popping into `PC` returns** | epilogue |

- Where does a call put the return address? **Stack-based**: `call` pushes it, `ret` pops it (x86, 68000, **AVR** `rcall`/`ret`). **Link register**: the call writes a register, return branches to it (**ARM**, RISC-V `ra`, MIPS `$ra`, PowerPC).
- A **leaf** call (calls nothing) touches no memory: `bl` in, `bx lr` out. `LR` holds exactly one return address, so a function that calls anything must save it first. **That is precisely what `push {lr}` in every non-leaf prologue is for**; leaf functions often have no prologue.
- `pop {r4, pc}` replaces `pop {r4, lr}` + `bx lr`: popping the saved LR into PC *is* the branch, one instruction saved per stack-using function. Spike `_write`: `80002b8: b5f0 push {r4, r5, r6, r7, lr}` ... `80002c8: bdf0 pop {r4, r5, r6, r7, pc}`.

## 9. Addressing modes (slide 9)

| Form | Example | In C | Encoding |
|---|---|---|---|
| register | `ldr r0, [r1]` | `*p` | 16-bit |
| **immediate offset** | `ldr r0, [r4, #28]` | `s->field` | 16-bit, small offsets |
| **register offset** | `ldrb r6, [r1, r3]` | `buf[i]` | 16-bit |
| SP-relative | `ldr r0, [sp, #8]` | a local variable | 16-bit |
| PC-relative | `ldr r2, [pc, #44]` | a big constant | 16-bit |
| scaled register | `ldr r0, [r1, r2, lsl #2]` | `arr[i]` for `int` | **32-bit, M3+ only** |
| pre-indexed | `ldr r0, [r1, #4]!` | `*++p` | **32-bit, M3+ only** |
| post-indexed | `ldr r0, [r1], #4` | `*p++` | **32-bit, M3+ only** |

- `[r4, #28]` = base + **fixed** offset known at compile time (`USART2->ISR`); `[r1, r3]` = base + **variable** index computed at run time (`buf[i]`); `[sp, #8]` = base is the stack pointer (a local).
- **A peripheral register access is literally a struct field access**: base register plus constant offset. That is the whole trick the CMSIS headers use.

## 10. Offsets are small, and you can see when they run out (slide 10)

| Instruction | Offset field | Reaches |
|---|---|---|
| `ldr  r0, [r1, #n]` | 5 bits, **scaled by 4** | 0 to 124 bytes |
| `ldrh r0, [r1, #n]` | 5 bits, scaled by 2 | 0 to 62 bytes |
| `ldrb r0, [r1, #n]` | 5 bits, unscaled | 0 to 31 bytes |
| `ldr  r0, [sp, #n]` | 8 bits, scaled by 4 | 0 to 1020 bytes |

- Max offset $=(2^k-1)\times\text{scale}$: $31\times4=124$, $31\times2=62$, $31$, $255\times4=1020$.
- **Offsets are always positive**: no `[r1, #-4]` in 16-bit Thumb; to step back the compiler adjusts the base first.
- **A far field costs an extra instruction.** Offset 28 is free (`80002d0: ldr r6, [r4, #28]`); beyond 124 the compiler emits an `add` to move the base, then loads. So a large peripheral struct gives visibly worse code at its far end, and a driver that keeps a pointer to the register it hammers can be measurably faster.
- Where the limit comes from: 5 bits opcode, 3 per register, 5 left for the offset stored divided by 4 (`7` means 28, `10` means 40):

| Instruction | Hex | 15:11 op | 10:6 imm5 | 5:3 Rn | 2:0 Rt |
|---|---|---|---|---|---|
| `ldr r6, [r4, #28]` | `0x69E6` | `01101` | 7 (x4 = 28) | 4 | 6 |
| `str r5, [r4, #40]` | `0x62A5` | `01100` | 10 (x4 = 40) | 4 | 5 |

- Cortex-M3+ lifts this: offsets up to 4095, negative offsets, scaled register offsets, auto-increment. Same source, denser output: "one model, many instances" from L00.

## 11. SystemInit: one C line, read modify write (slide 11)

`SystemInit()` takes the chip from its **12 MHz** reset state to **48 MHz**. Its first line of C, then what the CPU got:

```c
FLASH->ACR = (FLASH->ACR & ~FLASH_ACR_LATENCY) | FLASH_ACR_LATENCY_0;
```

```
0800022c <SystemInit>:
 800022c:  2007   movs  r0, #7          ; r0 = 0x7, LATENCY mask (bits 2:0)
 800022e:  2301   movs  r3, #1          ; r3 = 0x1, new value LATENCY_0
 8000230:  4a0b   ldr   r2, [pc, #44]   ; r2 = 0x40022000, FLASH base, from the literal pool
 8000232:  6811   ldr   r1, [r2, #0]    ; LOAD    r1 = FLASH->ACR      (bus read)
 8000234:  4381   bics  r1, r0          ; MODIFY  r1 = r1 & ~7         (the "& ~")
 8000236:  430b   orrs  r3, r1          ; MODIFY  r3 = r1 | 1          (the "|")
 8000238:  6013   str   r3, [r2, #0]    ; STORE   FLASH->ACR = r3      (bus write)
```

- `FLASH->ACR` fields on the slide: 18 `DBG_SWEN`, 16 `PROGEMPTY`, 11 `ICRST`, 9 `ICEN`, 8 `PRFTEN`, **2:0 `LATENCY`** (the one changed).
- `ldr`, `bics`, `orrs`, `str` = slide 4's load/modify/store. The slide says "one statement, four bus operations"; of the four only `ldr` and `str` touch `FLASH->ACR` (slide 4's "two bus events").
- **`bics` is the `& ~`, `orrs` is the `|`.** That correspondence is the whole reason to read disassembly.

## 12. Literal pools: where big constants live (slide 12)

- `movs r0, #7` fits in the instruction (8-bit immediate). `0x40022000` is 32 bits and **cannot possibly fit** in a 16-bit instruction, so the compiler parks it in a **literal pool** just past the function and loads it **PC-relative**.
- `0x4A0B` = op `01001`, Rt = 2, imm8 = 11, x4 = 44. Address (textbook context: PC reads as instruction + 4, word-aligned): $\mathrm{Align}(A+4,4)+4\cdot imm8$, so $0x8000234 + 44 = 0x8000260$.
- **A general consequence of fixed-width encoding, not an ARM quirk:**
  - x86: the instruction grows, constant embedded (variable length).
  - **ARM / Thumb: a literal pool near the code, loaded PC-relative.**
  - RISC-V: two halves, `lui` then `addi`. AArch64: halves too, `movz` then `movk`.

```
 8000260:  40022000   .word  0x40022000    ; FLASH
 8000264:  40021000   .word  0x40021000    ; RCC
 8000268:  ffffc7ff   .word  0xffffc7ff    ; ~(7 << 11): all ones except HSIDIV, bits 13:11 of RCC->CR
 800026c:  20000000   .word  0x20000000    ; &SystemCoreClock, in SRAM
 8000270:  02dc6c00   .word  0x02dc6c00    ; 48000000
```

- The pool lists every peripheral address the function touches, in plain sight. An `ands` with `0xFFFFC7FF` clears `HSIDIV`.
- `0x02DC6C00` = **48,000,000**: the clock you assigned in C, sitting in flash as a number, written to `0x20000000`, the very bottom of SRAM (where the linker puts it: 03_Week3_L02_Development_Toolchain.md, .data section).

## 13. A polling loop in four instructions (slide 13)

L00's polling ("keep asking"), waiting for the flash controller to acknowledge the new wait state:

```
 800023a:  6813   ldr   r3, [r2, #0]   ; read FLASH->ACR      (r2 still 0x40022000)
 800023c:  4003   ands  r3, r0         ; isolate LATENCY      (r0 still 7)
 800023e:  2b01   cmp   r3, #1         ; is it what we asked for?
 8000240:  d1fb   bne.n 800023a        ; no: back to the load
```

- **Read, test, branch back**; it costs the CPU every cycle until the hardware agrees.
- `0xD1FB`: 15:12 op `1101`, 11:8 cond `0001` (NE), 7:0 imm8 `0xFB` = -5 halfwords from PC + 4: $T = A+4+2\cdot\mathrm{sext}(imm8) = 0x8000244 - 10 = 0x800023a$.
- No `volatile` is visible in machine code, but **without it** the compiler reads `FLASH->ACR` **once**, caches it in `r3`, and loops forever on a value that never changes.

## 14. The write function, line by line (slides 14-15)

`_write()` makes `printf` reach the serial port:

```c
static void uart2_putc(char c) {
    while (!(USART2->ISR & USART_ISR_TXE_TXFNF)) { }
    USART2->TDR = (uint8_t)c;
}
int _write(int fd, const char *buf, int len) {
    (void)fd;
    for (int i = 0; i < len; i++) {
        if (buf[i] == '\n') { uart2_putc('\r'); }
        uart2_putc(buf[i]);
    }
    return len;
}
```

Registers: in, `r0` = fd, `r1` = buf, `r2` = len (AAPCS, section 17). Then `r3` = i, `r4` = USART2, `r5` = `'\r'`, `r0` = TXE mask, `r6`/`r7` scratch.

```
080002b8 <_write>:
 80002b8:  b5f0   push  {r4, r5, r6, r7, lr}  ; prologue: callee-saved r4-r7, and LR
 80002ba:  2300   movs  r3, #0                ; i = 0
 80002bc:  2080   movs  r0, #128              ; r0 = 0x80, TXE flag (fd discarded)
 80002be:  250d   movs  r5, #13               ; r5 = '\r'                    (hoisted)
 80002c0:  4c09   ldr   r4, [pc, #36]         ; r4 = 0x40004400 = USART2     (hoisted)
 80002c2:  4293   cmp   r3, r2                ; i < len ?  (signed: int)
 80002c4:  db01   blt.n 80002ca               ;   yes: body
 80002c6:  0010   movs  r0, r2                ; result r0 = len
 80002c8:  bdf0   pop   {r4, r5, r6, r7, pc}  ; epilogue and return in one
 80002ca:  5cce   ldrb  r6, [r1, r3]          ; c = buf[i]  (register offset)
 80002cc:  2e0a   cmp   r6, #10               ; c == '\n' ?
 80002ce:  d103   bne.n 80002d8               ;   no: skip the '\r'
 80002d0:  69e6   ldr   r6, [r4, #28]         ; USART2->ISR  (inlined uart2_putc #1)
 80002d2:  4206   tst   r6, r0                ; TXE set?
 80002d4:  d0fc   beq.n 80002d0               ;   no: poll again
 80002d6:  62a5   str   r5, [r4, #40]         ; USART2->TDR = '\r'
 80002d8:  5cce   ldrb  r6, [r1, r3]          ; c = buf[i] AGAIN (char may alias)
 80002da:  69e7   ldr   r7, [r4, #28]         ; USART2->ISR  (inlined uart2_putc #2)
 80002dc:  4207   tst   r7, r0
 80002de:  d0fc   beq.n 80002da               ;   no: poll again
 80002e0:  62a6   str   r6, [r4, #40]         ; USART2->TDR = c
 80002e2:  3301   adds  r3, #1                ; i++
 80002e4:  e7ed   b.n   80002c2               ; back to the test
```

- Constants decode the whole thing: `#10` = `'\n'`, `#13` = `'\r'`, `#128` = `USART_ISR_TXE` (bit 7), `[r4, #28]` = `USART2->ISR` (offset `0x1C`), `[r4, #40]` = `USART2->TDR` (offset `0x28`).
- C to addresses: prologue `80002b8`; `i = 0` and hoisted constants `80002ba-c0`; `i < len` `80002c2-c4`; `buf[i] == '\n'` `80002ca-ce`; `uart2_putc('\r')` `80002d0-d6`; `uart2_putc(buf[i])` `80002d8-e0`; `i++` and jump back `80002e2-e4`; **`return len` at `80002c6-c8`, in the middle**. `(void)fd;` became **nothing**: `r0` arrived holding fd and is reused at `80002bc`.
- **Hoisting:** `#128`, `#13` and the USART2 base are set once before the loop although the C mentions them inside it. Anything that cannot change is lifted out.
- **Inlining, twice:** `uart2_putc` is nowhere in the machine code; its three instructions appear once for `'\r'`, again for the character. **`_write` contains no `bl`.**
- **Rotation:** the `for` test sits at the top, the exit is the fall-through, so `return len` lands mid-function at `0x080002c6`. **Address order is not source order**, which is why a debugger stepping optimised code appears to jump around.
- **`buf[i]` loaded twice** (`80002ca`, `80002d8`): a `char` object may alias anything, so the store to `USART2->TDR` *might* have changed `buf[i]` as far as the standard knows. Same rule as section 20, from the other side.
- **Every `for` loop looks like this:** initialise, compare, conditional branch to the body, increment, unconditional branch back.
- Count check (computed): `0x80002b8` to `0x80002e4` is **23** two-byte instructions (46 bytes); the slide text says "twenty-two".

## 15. Two generations of Thumb (slide 16)

- The hex column (`2007`, `4a0b`, `6811`) is 4 digits = **2 bytes**. Almost every instruction is 16 bits, which is why 32 KB of flash holds a useful program. Each 16-bit format spends the top bits on the opcode, **3 bits per register** (hence R0-R7), the rest on a constant: `0x2007` `movs r0, #7` = op `00100`, Rd 0, imm8 7; `0x4A0B` and `0x6811` as in sections 12 and 10.
- **Thumb-1** (1994): 16-bit encodings only; compact and restricted.
- **Thumb-2** (2003, ARMv6T2): keeps every 16-bit encoding and adds 32-bit ones **beside** them in the same stream. No mode switch: a halfword whose top five bits are `11101`, `11110` or `11111` takes a second halfword.

| | Cortex-M0 / M0+ | Cortex-M3 | Cortex-M4 / M7 |
|---|---|---|---|
| Architecture | **ARMv6-M** | ARMv7-M | ARMv7E-M |
| Instruction set | **Thumb-1, plus six** | full Thumb-2 | full Thumb-2 + DSP |
| Divide | **none**, calls `__aeabi_uidiv` | `sdiv` / `udiv` | `sdiv` / `udiv` |
| Flags | most 16-bit forms always set them | `add` **or** `adds`, your choice | same |
| Conditional execution | branches only | `IT` blocks, up to 4 instructions | same |
| `ldr` offset | 0-124 bytes, positive only | ±4095, pre- and post-indexed | same |
| Registers | R0-R7 in most 16-bit forms | 32-bit forms reach all 16 | same |
| Immediates | 8 bits, 0-255 | 12-bit modified constants, `movw` / `movt` | same |
| Floating point | none | none | M4F and M7: hardware FPU |

- Every core in the table is Thumb-only. "Thumb" alone does not say what a core can do; the **generation** does.

## 16. Thumb 1 plus six, and the 32 bit bl (slide 17)

- The six, the **only 32-bit instructions** on this chip: **`bl`** (call anywhere in the address space), **`mrs` / `msr`** (read/write special registers `PRIMASK`, `CONTROL`, `PSP`), **`dsb` / `dmb` / `isb`** (memory and instruction barriers). Everything else is two bytes.

```
 800028a:  f7ff ffcf   bl  800022c <SystemInit>   ; in Reset_Handler; f7ff top 5 bits 11110 = 32-bit
```

- Decode: S = 1, imm10 = `0x3FF`; J1 = J2 = 1, imm11 = `0x7CF`; I1 = NOT(J1 XOR S) = 1, I2 = 1. Offset `S:I1:I2:imm10:imm11:0` = **-98**, from `0x800028e` (A + 4) back to **`0x800022c`**.
- **The rule for when Thumb widens:** not when 32 bits would be convenient, but **when 16 bits cannot do the job at all**. A 16-bit branch reaches about ±2 KB; a call must reach anywhere.
- **`.n` / `.w`** = narrow 16-bit / wide 32-bit. On this chip nothing to choose (`bne.n` is objdump being explicit). On M3+ the assembler picks the smallest encoding that reaches; `.w` forces wide, e.g. a branch across a large flash.
- **The restrictions are not ARM, they are Thumb-1:** `s` on every `adds`, no divide, 5-bit positive-only offsets, eight reachable registers, literal pools full of addresses. The same C on a Cortex-M4 gives `add` that leaves flags alone, `sdiv` not a library call, `ldr r0, [r1, #2000]` in one instruction, and far fewer literal pools (`movw` / `movt` build 32-bit constants inline).

## 17. The calling convention, AAPCS (slide 18)

- **ABI / calling convention:** who agrees where arguments go, where the result returns, which registers a function may destroy. Examples: SysV AMD64 (Linux), RISC-V and MIPS conventions, **AAPCS** here. Needed because of **separate compilation**: your C calls a library compiled years ago by another compiler, maybe in assembly, and neither sees the other's source.
- **Caller-saved** (*volatile*, *scratch*): the callee may destroy them; the caller saves what it still wants. **Callee-saved** (*non-volatile*): must be handed back untouched; saved on entry, restored on exit.

| Registers | AAPCS role |
|---|---|
| R0 R1 R2 R3 | arguments in, result out (R0) |
| R4 ... R11 | callee must preserve |
| R12 SP LR PC | scratch and special |

- `_write` explains itself: args in `r0`, `r1`, `r2` (fd, buf, len); returns len in `r0`; pushes `r4`-`r7` **because AAPCS says it must give them back unchanged** (it wanted them for the USART base and the loop counter).

## 18. The Thumb bit in the vector table (slide 19)

First record of `Main.hex`: `:1000000000300020750200082902000829020008BB`

| Bytes (little-endian) | Value | Meaning |
|---|---|---|
| `00300020` | `0x20003000` | initial SP, top of **12 KB** SRAM (`0x20000000 + 0x3000`) |
| `75020008` | `0x08000275` | reset vector, **where execution begins** |
| `29020008` | `0x08000229` | NMI handler |

- `Reset_Handler` is at **`0x08000274`** (even); the vector says **`0x08000275`**. Bits 31:1 are the address, **bit 0 = T = 1 means "Thumb code"**, set on purpose. **Every function pointer on the chip is odd.**
- On Cortex-A the bit answers a real question (which set the branch lands in). On Cortex-M the answer is always Thumb, so the bit is always 1, and the hardware still insists on being told.
- **Clear it and the CPU faults immediately on reset.** A vector table of even addresses is a dead chip; a common hand-written-assembly mistake. (Vector table and Reset Handler: 04_Week3_L04_Startup_LinkerScript.md.)

## 19. LR is odd too: reading a return address (slide 20)

```
 800028a:  f7ff ffcf   bl  800022c <SystemInit>   ; 4 bytes
 800028e:  f000 fb31   bl  80008f4                ; the instruction it returns to
```

- Return address = next instruction `0x0800028e`; `bl` sets the Thumb bit (`| 1`): **`LR = 0x0800028f`**. On return `PC <- LR & ~1 = 0x0800028e`.
- `bx lr` and `pop {..., pc}` (the same branch in disguise) read bit 0 as *the instruction set to resume in*, then branch with it **cleared**. **Nothing is skipped and nothing is off by one.** The bit rides inside the address instead of a mode register, which is why `pop {pc}` can return at all: the Thumb bit was saved with LR and comes back with it.
- **When it bites:** a branch to an address with bit 0 **clear** faults (ARM state, which it has none of). A `HardFault` whose stacked `PC` or `LR` is a sensible-looking **even** address usually means a **computed function pointer**, or hand-written assembly that returned with **`mov pc, lr` instead of `bx lr`**.
- Inside an exception handler `LR` holds a magic **`EXC_RETURN`** (`0xFFFFFFF9`, `0xFFFFFFFD`); branching to it unstacks the frame (see 05_Week4_L03_Execution_Concurrency.md and 08_Week6_L07_RTOS.md).

## 20. What the compiler is allowed to do, and volatile (slide 21)

- Contract: preserve **observable behaviour** as the C standard defines it, and the standard has never heard of your peripheral. Three reads you wrote may become **one read cached in a register** at `-Os`.
- Fine for ordinary variables, catastrophic for a status register. Classic symptom: **works at `-O0`, hangs at `-Os`**.
- `volatile` forbids it. **CMSIS** (Common Microcontroller Software Interface Standard, ARM's vendor-neutral Cortex-M headers) already applies it: every register in `stm32c031xx.h` is **`__IO`, which is simply `volatile`**. You inherit the protection; know why it is there (more: 05_Week4_L03_Execution_Concurrency.md, volatile section).

## 21. What You Should Be Able to Say (slide 22)

1. **About 13** mnemonics are 80% (79.6%) of real firmware; 51 distinct in 2100 instructions.
2. Load-store: the ALU cannot touch memory, so `ldr` (read), `orrs`/`bics` (modify), `str` (write): 3 instructions, 2 bus events. No `sbi` on M0+.
3. `bics r0, r1` = `r0 AND NOT r1`, produced by `x &= ~y`.
4. Every peripheral bit field is shift-and-mask (`2u << (pin * 2)`), so `lsls` (4.0%) beats `subs` (2.5%).
5. `cmp` keeps the **flags** (N Z C V in APSR); the next conditional branch acts on them.
6. `blt` = **signed** less-than, `bcc` = **unsigned** lower. Confusing them breaks comparisons at the range extremes (-1 read as 4294967295).
7. `pop {r4, pc}` **returns** (saved LR goes straight into PC); `pop {r4, lr}` still needs `bx lr`.
8. `s->field` = **immediate offset** `[r4, #28]`; `buf[i]` = **register offset** `[r1, r3]`.
9. ARMv6-M (Thumb-1 plus six) has no divide; `a / b` calls `__aeabi_uidiv`. `Main.map` shows `libgcc.a(_udivsi3.o)` pulled in (`<__udivsi3>` at `080000b4`).
10. The other set is **ARM (A32)**. A Cortex-M **never** switches into it: no ARM state exists, and a branch with bit 0 clear faults.
11. M4 in one instruction, M0+ cannot: **hardware divide** (`sdiv`/`udiv`); **far or negative offset load** (`ldr r0, [r1, #2000]`, pre/post-indexed); **inline 32-bit constant** (`movw`/`movt`). Also `add` without flags, `IT` blocks, scaled-register `ldr`.
12. Bit 0 is the **Thumb bit**; the function is at `0x08000274`. "Fixing" the vector to even **faults immediately on reset**.
13. It returns to **`0x0800028e`** (`LR & ~1`), the instruction after the `bl` (here `bl 80008f4`). An **even** LR is wrong: a computed function pointer or `mov pc, lr`; returning through it faults.
14. **Register-memory** vs **load-store**: this chip load-store, x86 register-memory, AVR load-store (with the `sbi` crack).
15. RISC-V `blt a0, a1, L`: compare and branch in one, no flags. ARM gains **density**: one `cmp` feeds several branches.
16. **Stack-based** (x86, 68000, AVR `rcall`/`ret`) vs **link register** (ARM, RISC-V `ra`, MIPS, PowerPC). This chip uses LR; `push {lr}` saves the one return address before a nested `bl` overwrites it.
17. A 16-bit instruction cannot hold 32 bits (`movs` immediate is 8 bits). ARM: **literal pool, PC-relative** (`ldr r2, [pc, #44]`). Others: RISC-V `lui` + `addi`, AArch64 `movz` + `movk`, x86 embeds it.

## Exam focus

**Branch target.** `80002d4: d0fc beq.n`: cond `0000` EQ, imm8 `0xFC` = -4, $0x80002d8 - 8 = 0x80002d0$ (a poll loop). `80002e4: e7ed b.n`: imm11 `0x7ED` = -19, $0x80002e8 - 38 = 0x80002c2$. A branch to itself (`d1fe`, `e7fe`) has offset -2.

**Literal address.** `80002c0: 4c09 ldr r4, [pc, #36]`: imm8 9, x4 = 36, $\mathrm{Align}(0x80002c4,4)+36 = 0x80002e8$, which holds `0x40004400` (USART2).

**Encodable or not.** `ldr r0, [r1, #8]`: imm5 = 2, `01101 00010 001 000` = `0x6888` (computed). `ldr r0, [r1, #128]`: 128/4 = 32 > 31, **not encodable**, expect an `adds` to the base first. `[r1, #-4]`: never in 16-bit Thumb. `movs r0, #256`: over the 0-255 immediate, so a literal pool or extra instructions.

**LR and return.** `bl` at `0x080002fc` (4 bytes): LR = `0x08000300 | 1` = `0x08000301`; returns to `0x08000300`.

**Stack frame of `push {r4, r5, r6, r7, lr}`** (textbook context: lowest register at lowest address): SP drops 5 x 4 = **20 bytes**.

| SP offset after push | +0 | +4 | +8 | +12 | +16 |
|---|---|---|---|---|---|
| Holds | r4 | r5 | r6 | r7 | LR (popped into PC) |

**Signed vs unsigned.**

```c
int      a = -1;          if (a < 1) ...   // cmp; blt -> taken
unsigned b = 0xFFFFFFFF;  if (b < 1) ...   // cmp; bcc -> NOT taken
```

**Which instruction?** `x &= ~MASK` `bics`; `x |= BIT` `orrs`; `x ^= y` `eors`; `x << 3` `lsls`; `a / b` `bl __aeabi_uidiv`; `if (x & BIT)` `tst` + `beq`/`bne`; `*p` of `int16_t` `ldrsh`.

**Spot the bug.**
- Hand-written vector `0x08000274`: even, **faults on reset**; must be `0x08000275`.
- Assembly returning with `mov pc, lr`: use `bx lr`.
- Status register read through a non-`volatile` pointer: works at `-O0`, **hangs at `-Os`** (read once, cached).
- `int16_t` loaded with `ldrh`: no sign extension, needs `ldrsh`. Signed value shifted with `lsrs`: negative becomes huge, needs `asrs`.
- A comparison that fails only at the extremes of its range: look for `bcc`/`bcs` where you meant `blt`/`bge` (or the reverse); the variable's signedness is wrong.

**Numbers to know.** Thumb ~30% smaller (slide example 10 vs 16 bytes). Six 32-bit instructions: `bl`, `mrs`, `msr`, `dsb`, `dmb`, `isb`. Thumb-2 prefixes `11101`, `11110`, `11111`. FLASH `0x40022000`, RCC `0x40021000`, USART2 `0x40004400` (ISR `+0x1C`, TDR `+0x28`, TXE bit 7 = 128), `SystemCoreClock` at `0x20000000` = 48,000,000 (`0x02DC6C00`), initial SP `0x20003000`, `SystemInit` `0x0800022c`, `Reset_Handler` `0x08000274` (vector `0x08000275`), `EXC_RETURN` `0xFFFFFFF9` / `0xFFFFFFFD`.
