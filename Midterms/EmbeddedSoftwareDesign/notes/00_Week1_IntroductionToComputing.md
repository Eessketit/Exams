# 00 Week 1: Introduction to Computing (Chapter 0)

**What this lecture is about:** the parts of any computer (CPU, memory, I/O), the memory chip families, how memory and I/O hang off one bus, how an address decoder picks a chip, and a 5-instruction toy CPU traced bus cycle by bus cycle.

Source: `intro.pdf`, 33 pages (the professor's `.pps`, from the Mazidi/Naimi AVR textbook slides, Sepehr Naimi, MicroDigitalEd). Many numbers below exist only in the slide images.

## 1. Internal organization of a computer (pages 1-3)

- Three parts: **CPU, Memory, I/O**. **Input**, e.g. keyboard, mouse, sensor. **Output**, e.g. LCD, printer, "hands of a robot".

## 2. Memory characteristics (pages 4-6)

- **Memory:** "everything that can store, retain, and recall information", e.g. hard disk, a piece of paper.
- **Capacity:** the number of **bits** a memory can store, e.g. 128 Kbits, 256 Mbits.
- **Organization:** how the locations are organized. "A **128 x 4** memory has 128 locations, 4 bits each" (drawn as locations 0..127, 4 bits wide).
- **Access time:** how long it takes to get data from memory.
- Semiconductor memory (RAM sticks in the picture) vs non-semiconductor (floppy disks, hard disk).

| Formula | Meaning |
|---|---|
| $\text{capacity} = \text{locations} \times \text{bits per location}$ | 128 x 4 = 512 bits |
| $\text{locations} = 2^{n}$, $n$ = address lines | 128 = $2^7$, so 7 address lines |
| data lines = bits per location ($m$) | x4 means D0-D3 |

So a chip with $n$ address pins and $m$ data pins is a $2^n \times m$ memory. "K" in the chip tables means 1024 and capacity is in **bits**.

## 3. The semiconductor memory family (pages 7, 13)

| ROM | RAM |
|---|---|
| Mask ROM | SRAM (Static RAM) |
| PROM (Programmable ROM) | DRAM (Dynamic RAM) |
| EPROM (Erasable PROM) | NV-RAM (Nonvolatile RAM) |
| EEPROM (slide spells it "Electronic Erasable PROM") | |
| Flash EPROM | |

## 4. ROM types (pages 8-12)

| Type | How it is programmed / erased (slide wording) |
|---|---|
| Mask ROM | programmed by the IC manufacturer |
| PROM | **OTP (One-Time Programmable)**: you can program it only once |
| UV-EPROM | shine **ultraviolet** light to erase; erasing takes **up to 20 minutes**; the **entire contents** are erased |
| EEPROM | erased **electrically**, **instantly**; **each byte can be erased separately** |
| Flash | "erased in a flash": **the entire device is erased at once** |

Chip tables from the slides (capacity in bits; address lines computed as $\log_2$ locations):

| Part | Type | Capacity | Org. | Access | Pins | Vpp | Address lines |
|---|---|---|---|---|---|---|---|
| 2716 | UV-EPROM | 16K | 2K x 8 | 450 ns | 24 | 25 V | 11 |
| 2732 | UV-EPROM | 32K | 4K x 8 | 450 ns | 24 | 25 V | 12 |
| 2732A-20 | UV-EPROM | 32K | 4K x 8 | 200 ns | 24 | 21 V | 12 |
| 27C32-1 | UV-EPROM | 32K | 4K x 8 | 450 ns | 24 | 12.5 V CMOS | 12 |
| 2764-20 | UV-EPROM | 64K | 8K x 8 | 200 ns | 28 | 21 V | 13 |
| 2764A-20 | UV-EPROM | 64K | 8K x 8 | 200 ns | 28 | 12.5 V | 13 |
| 27C64-12 | UV-EPROM | 64K | 8K x 8 | 120 ns | 28 | 12.5 V CMOS | 13 |
| 2816A-25 | EEPROM | 16K | 2K x 8 | 250 ns | 24 | 5 V | 11 |
| 2864A | EEPROM | 64K | 8K x 8 | 250 ns | 28 | 5 V | 13 |
| 28C64A-25 | EEPROM | 64K | 8K x 8 | 250 ns | 28 | 5 V CMOS | 13 |
| 28C256-15 | EEPROM | 256K | 32K x 8 | 150 ns | 28 | 5 V | 15 |
| 28C256-25 | EEPROM | 256K | 32K x 8 | 250 ns | 28 | 5 V CMOS | 15 |
| 28F256-20 | Flash | 256K | 32K x 8 | 200 ns | 32 | 12 V CMOS | 15 |
| 28F010-15 | Flash | 1024K | 128K x 8 | 150 ns | 32 | 12 V CMOS | 17 |
| 28F020-15 | Flash | 2048K | 256K x 8 | 150 ns | 32 | 12 V CMOS | 18 |

- **2764 pinout** (page 10, 28 pins): Vpp pin 1, A0-A12, O0-O7, CE-bar pin 20, OE-bar pin 22, PGM-bar pin 27, N.C. 26, Vcc 28, GND 14. A0-A12 = 13 lines, matching 8K.
- **8K x 8 EEPROM pinout** (page 11): RDY/BSY-bar, A0-A12, I/O0-I/O7, WE-bar, OE-bar, CE-bar, NC, Vcc, Vss (28 pins).

## 5. RAM types (pages 14-16)

| | SRAM | DRAM | NV-RAM |
|---|---|---|---|
| Made of | flip-flops (transistors) | capacitors | SRAM + battery + control circuitry |
| Advantages | faster; no need for refreshing | less power; cheaper; high capacity | very fast; infinite program/erase cycle; non-volatile |
| Disadvantages | high power consumption; expensive | slower; refresh needed | expensive |

- **2K x 8 SRAM pinout** (page 14, 24 pins): A0-A10 (11 lines), I/O 1-8, WE-bar, OE-bar, CS-bar, Vcc, GND.

## 6. The job of the CPU and the memory pinout (pages 17-18)

- CPU task: **execute instructions**, recalling them "one after another" and executing them.
- Generic memory chip pins (page 18):

| Pin | Width | Meaning |
|---|---|---|
| D0-D7 | 8, bidirectional | data |
| A0-A(n-1) | n, input | address, $2^n$ locations |
| WE-bar | 1 | write enable, active low |
| OE-bar | 1 | output enable (read), active low |
| CS-bar | 1 | chip select, active low; chip ignores the bus when high |
| GND, VCC | | power |

## 7. Read and write timing (page 19)

- CPU drives A0-A(n-1), D0-D7 both ways, and WE-bar, OE-bar, CS-bar.
- **Reading from memory:** address valid, then CS-bar goes low, then OE-bar goes low; **data valid** appears $t_{AA}$ after address valid. **WE-bar stays high.** $t_{RC}$ spans the whole address-valid window. (textbook context: $t_{AA}$ = address access time, $t_{RC}$ = read cycle time.)
- **Writing to memory** (drawn underneath the read diagram, recovered from the PDF's embedded image): address valid, CS-bar low, CPU puts data valid on the bus, **WE-bar pulses low**; data must be stable for a **data set up** time before WE-bar rises and a **data hold** time after. OE-bar is not used.

## 8. Connecting IOs to the CPU with a bus (pages 20-22)

- Wiring each device to its own CPU pins (network, mouse, keyboard, graphic card, sound card): "**CPU should have lots of pins!**"
- Fix: a shared **bus**: **Address bus**, **Data bus**, **Control bus (Write, Read)**. Every I/O 0..n and the memory sit on the same wires.
- Memory hookup (page 22): A0-A(n-1) to address bus, D0-D7 to data bus, **Write to WE-bar, Read to OE-bar**. CS-bar is tied to ground, so it is always selected.

## 9. The address conflict (page 23)

- CPU puts **0** on the address bus. Memory location 0 and **I/O 0** both answer. "**How could we manage it?**"
- Two answers follow: a separate I/O space (peripheral I/O, section 10) or one shared space split by a decoder (memory-mapped I/O, section 11).

## 10. Peripheral IO, a separate IO space (page 24)

- Add a control line **IO/MEM-bar** to the control bus: 1 = I/O access, 0 = memory access.
- Memory here has **64 locations (0..63)**, so 6 address lines. Its **CS-bar is wired straight to IO/MEM-bar**: memory is selected only when IO/MEM-bar = 0. The I/Os also get IO/MEM-bar.
- The same address number now means two places, depending on that line.
- **ARM note:** the STM32C031 has no separate IO space; everything is memory-mapped. See 01_Week2_L00_ProgrammersModel.md section 4 (memory mapped vs port mapped IO).

## 11. Memory mapped IO and the address decoder (page 25)

- One address space: memory gets **0..15** (16 locations, A0-A3) and the I/Os get the addresses above it (**I/O 16, I/O 17, I/O 18**, ...).
- "The **logic circuit** enables CS when address is between 0 and 15." It drives the memory's CS-bar.
- **Recipe (slide wording):** 1. Write the address range in binary. 2. Separate the fixed part of the address. 3. Using a **NAND**, design a logic circuit whose output activates when the fixed address is given to it.

```
            a7 a6 a5 a4 | a3 a2 a1 a0
from  0  ->  0  0  0  0 |  0  0  0  0
to   15  ->  0  0  0  0 |  1  1  1  1
             fixed part  | varies -> memory A0-A3
```

- Gate: NAND of a4, a5, a6, a7, **each through an inverter bubble** (all fixed bits are 0), output = CS-bar:

$$\overline{CS} = \overline{\bar a_7\,\bar a_6\,\bar a_5\,\bar a_4}$$

- CS-bar = 0 only when a7..a4 = 0000, i.e. addresses 0..15 (checked over all 256 addresses).

## 12. Decoder example: 300H to 3FFH (page 26)

```
              a11 a10 a9 a8 | a7 ... a0
from 300H  ->  0   0  1  1  | 0000 0000
to   3FFH  ->  0   0  1  1  | 1111 1111
```

- Fixed part a11 a10 a9 a8 = **0011**; a7..a0 vary (256 locations, 8 lines to the device).
- Gate: NAND with inputs **a8, a9 direct** and **a10, a11 inverted**:

$$\overline{CS} = \overline{a_9\,a_8\,\bar a_{10}\,\bar a_{11}}$$

- "**An easy way of designing**": write the fixed bits over a NAND's inputs; put a bubble on every input whose bit is **0**, a plain wire where it is **1**.

## 13. Inside the CPU (page 27)

| Block | Job |
|---|---|
| PC (Program Counter) | address of the next instruction |
| Instruction decoder | turns the fetched byte into actions |
| ALU (Arithmetic Logic Unit) | does the arithmetic (the + in the trace) |
| Registers | A, B, C, D in this toy CPU |

- **ARM note:** the Cortex-M0+ has R0-R15 (PC = R15) instead of A-D; see 01_Week2_L00_ProgrammersModel.md section 2.

## 14. Instruction format and the opcode table (page 32)

- One instruction = 8 bits: **3-bit opcode + 5-bit operand** (3 green boxes + 5 yellow in the figure). The operand $x$ reaches 0..31.

| Opcode | Meaning |
|---|---|
| 000 | A <- x |
| 001 | A <- [x] |
| 010 | A <- A - register (x) |
| 011 | A <- A + x |
| 100 | A <- A + register (x) |
| 101 | A <- A - x |
| 110 | Register (xH) <- Register (xL) |
| 111 | [x] <- A |

- `x` = the constant, `[x]` = the memory or I/O byte at address x, `register (x)` = register number x.
- The program, as stored (page 32 binary column and memory box):

| Addr | Binary | Hex | Opcode, operand | Meaning |
|---|---|---|---|---|
| 0 | 0011 0001 | 31h | 001, 10001 = 17 | A <- [17] |
| 1 | 1100 0100 | C4h | 110, 00100 | B <- A |
| 2 | 0010 0110 | 26h | 001, 00110 = 6 | A <- [6] |
| 3 | 1000 0001 | 81h | 100, 00001 = 1 | A <- A + B |
| 4 | 1110 0111 | **EAh on the slide** | 111, 00111 = 7 | [7] <- A |
| 5 | 0000 0000 | 0h | data | |
| 6 | 0000 0101 | 5h | data | |
| 7 | (empty) | | result goes here | |

- **Slide inconsistency:** the memory box shows **EAh**, but the binary column shows 1110 0111 = **E7h**. Only E7h encodes [7] <- A; EAh = 111 01010 would be [10] <- A. Page 31 shows address 7 on the bus, so E7h is intended.
- 81h means A + B, so register 1 = B. That fits A = 0, B = 1, and C4h's operand 0 01 00 reads as xH = 01 (B), xL = 00 (A) (inferred, the slide does not number the registers).

## 15. How computers work: the program trace (pages 28-31)

- Memory 0..15 is chosen by the page 25 logic circuit, and **I/O 17 holds 9**. Every fetch puts the PC on the address bus with **Read** asserted. The byte comes back on the data bus into the instruction decoder, and the PC increments.

| Step | PC at fetch | Byte | Executes | Extra bus cycle | Result | PC after |
|---|---|---|---|---|---|---|
| 1 | 0 | 31h | A <- [17] | addr 17, Read; **I/O 17** drives 9 | A = 9 | 1 |
| 2 | 1 | C4h | B <- A | none (inside CPU) | B = 9 | 2 |
| 3 | 2 | 26h | A <- [6] | addr 6, Read; memory drives 5 | A = 5 | 3 |
| 4 | 3 | 81h | A <- A + B | none (ALU: 5 + 9) | A = 14 = **Eh** | 4 |
| 5 | 4 | EAh/E7h | [7] <- A | addr **7**, data **Eh**, **Write** | mem[7] = Eh | **5** |

- Final state (page 31): **A = E, B = 9, PC = 5**, location 7 = Eh. Bus transactions: 5 fetches + 2 data reads + 1 data write = **8**.
- Address 17 is above 15, so the decoder keeps the memory's CS-bar high and only I/O 17 answers. That is memory-mapped I/O at work.

## 16. Von Neumann vs Harvard architecture (page 33)

| | Harvard | Von Neumann |
|---|---|---|
| Buses | **two sets**: Code Memory has its own data, address, control buses; Data Memory has its own | **one set** of data, address, control buses shared by Code Memory and Data Memory |
| Code memory data bus | one-way, code memory to CPU | same shared bus |
| Data memory data bus | two-way | same shared bus |

- (textbook context) Harvard lets the CPU fetch the next instruction while it reads or writes data. Von Neumann must take turns on one bus.
- **ARM note:** AVR is Harvard; the STM32C031 has one unified (von Neumann) address space; see 01_Week2_L00_ProgrammersModel.md section 4.

## Exam focus

**Capacity from address and data lines** ($2^n \times m$ bits):

| Given | Work | Answer |
|---|---|---|
| 128 x 4 | $2^7 = 128$; $128 \times 4$ | 7 address lines, 4 data lines, 512 bits |
| 13 address, 8 data lines (2764) | $2^{13} \times 8 = 65536$ | 8K x 8 = 64 Kbits = 8 KB |
| 11 address, 8 data (2K x 8 SRAM, 2716) | $2^{11} \times 8$ | 16 Kbits |
| 28F020, 256K x 8 | $\log_2(262144) = 18$ | 18 address lines, 2048 Kbits |
| 64 Kbit chip organized x4 | $65536 / 4 = 16384 = 2^{14}$ | 14 address lines |
| peripheral I/O memory 0..63 | $\log_2 64$ | 6 address lines |

**Address decoders:**
- Memory at 0..15 on an 8-bit bus: fixed a7..a4 = 0000. $\overline{CS}$ = NAND of $\bar a_4..\bar a_7$, so all four inputs are bubbled.
- 300H-3FFH on a 12-bit bus: fixed a11..a8 = 0011. NAND(a8, a9, $\bar a_{10}$, $\bar a_{11}$). Device size = 256 = 8 lines.
- Reverse it: which addresses does NAND(a8, a9, $\bar a_{10}$, $\bar a_{11}$) select? 0011 xxxx xxxx = **300H to 3FFH**.
- Practice (same method, not on the slides): 1K chip at 400H-7FFH on a 12-bit bus. 0100 0000 0000 to 0111 1111 1111, so fixed a11 a10 = 01 and the gate is NAND($\bar a_{11}$, $a_{10}$).
- How many bits are fixed? Address width minus $\log_2$(block size): 8 - 4 = 4 (page 25), 12 - 8 = 4 (page 26).

**Trace and encode (page 32 table):**
- Final values after the 5 instructions? **A = Eh (14), B = 9, [7] = Eh, PC = 5.**
- Which instructions use the bus beyond the fetch? A <- [17] (read I/O), A <- [6] (read memory), [7] <- A (write). B <- A and A <- A + B stay inside the CPU.
- Encode A <- A + 3: 011 00011 = **63h**. Encode [9] <- A: 111 01001 = **E9h**. Decode A2h: 101 00010 = **A <- A - 2**.
- Spot the bug: memory cell 4 = EAh decodes to [10] <- A, not [7] <- A; the correct byte is **E7h**.

**Short answers:**
- Erased with UV, whole chip, up to 20 min: **UV-EPROM**. Byte-erasable electrically: **EEPROM**. Whole device at once: **Flash**. Program once: **PROM (OTP)**. Programmed by the IC maker: **Mask ROM**.
- SRAM vs DRAM: flip-flops, fast, no refresh, power-hungry, expensive vs capacitors, cheap, dense, slower, needs refresh. NV-RAM = SRAM + battery + control circuitry.
- During a read, which control line stays high? **WE-bar.** On a write, data must meet **set up and hold** around the WE-bar rising edge.
- Peripheral I/O selects memory vs I/O with **IO/MEM-bar**. Memory-mapped I/O splits one space with an **address decoder** on CS-bar.
- Why a bus? Otherwise the "CPU should have lots of pins!" Why a decoder? Two devices at address 0 clash (page 23).
