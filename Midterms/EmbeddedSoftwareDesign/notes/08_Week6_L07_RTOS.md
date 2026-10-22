# L07 RTOS: a preemptive kernel from scratch

**What this lecture is about:** building a fixed-priority preemptive kernel (`os.c`, about 300 lines of C plus a 34-instruction PendSV switch) from SysTick, PendSV and PSP, then using it to show priority inversion, stack overflow and a HardFault report that names the faulting line. "Measured" means run unchanged on Renode's Cortex-M0 model (slide 20); none of it has been watched in Wokwi yet.

## 1. The board, and the job that never yields (pin maps, slide 1)

| Pin | Mode | Job in this lesson |
|---|---|---|
| PA0 / PA1 | in, pull-up | button A: bar speed (120, 60, 30 ms) / button B: hog on or off |
| PA2, PA3 | AF1 | USART2 TX, RX: serial monitor, 115200 baud |
| PB0-PB7 | out | LED bar, one bit per LED (Wokwi names PB0 `PB0.1`) |

- The professor's two-line contrast. **Cooperative scheduler** (the superloop; the job decides when it stops, by returning): one **CPU hog** can stop the whole system. **Preemptive scheduler** (an RTOS; the kernel decides, on a timer interrupt): the RTOS can forcibly stop (**preempt**) the hog and resume it later from exactly where it was.
- **CPU hog:** a job that keeps the CPU and never gives it back, like the prime-search `for (;;)`. In lesson 06's superloop it freezes the bar, the buttons and the report.
- On a Cortex-M, preemption takes **one interrupt (SysTick), one exception (PendSV) and a second stack pointer (PSP)**.

## 2. Task, context and TCB (slide 2)

- A running function *is* its **stack**, its **registers** (`r0`-`r12`, `lr`, `pc`, `xPSR`) and its **stack pointer**. Save all three and the function can be put away; restore them and it carries on as if nothing happened.
- **Task:** a C function that runs as if it had the CPU to itself (`bar`, `button`, `hog`, `report`, `idle`). **Context:** registers plus stack pointer, 16 words on the task's own stack.
- **Context switch:** save one context and restore another (`PendSV_Handler`, 34 instructions). **Task control block (TCB):** the kernel's record of one task, `os_task_t`, with `sp` as its first field.

```c
typedef struct os_task {
    uint32_t   *sp;              /* MUST be first: PendSV_Handler reads it at [tcb + 0] */
    const char *name;
    uint8_t     prio, base_prio, state;  /* current (may be inherited), as created; READY 0, SLEEPING 1, BLOCKED 2 */
    uint32_t    wake;            /* tick to wake at, when SLEEPING */
    const void *waiting_on;      /* the mutex or queue it is BLOCKED on */
    uint32_t   *stack, stack_words, ticks;  /* stack = lowest address; ticks = CPU use */
} os_task_t;
```

- The registers live **on the task's stack** while it is switched out, so the TCB keeps only the saved `sp`. `os.h` constants: `OS_MAX_TASKS 8`, `OS_TICK_HZ 1000u`, `OS_PRIORITY_INHERIT 1`, `OS_STACK_FILL 0xDEADBEEFu`.

## 3. Core special registers: xPSR, MSP, PSP, PRIMASK, CONTROL (slide 3)

These have **no address**. Only `MRS` (special register to `rN`) and `MSR` (`rN` to special register) reach them, and CMSIS wraps each one (`cmsis_gcc.h`, which pulls in `m-profile/cmsis_gcc_m.h`).

| Register | Fields | CMSIS | This kernel |
|---|---|---|---|
| `xPSR` = APSR + IPSR + EPSR | N 31, Z 30, C 29, V 28; **T 24**; ISR 5:0 (0 in Thread) | `__get_xPSR()`, `__get_APSR()`, `__get_IPSR()`; no write | forged into every new frame; decoded after a fault |
| `MSP` | main stack | `__get_MSP()`, `__set_MSP()` | handlers; `main()` before the first switch |
| `PSP` | process stack | `__get_PSP()`, `__set_PSP()` | every task; saved and loaded by PendSV; read by HardFault |
| `PRIMASK` | bit 0 PM: 1 = IRQs masked | `__get/__set_PRIMASK()`; `cpsid i`, `cpsie i` = `__disable_irq()`, `__enable_irq()` | `enter()`, `leave()`; PendSV |
| `CONTROL` | bit 1 SPSEL, bit 0 nPRIV | `__get/__set_CONTROL()` (set adds an `ISB`) | **never written**: EXC_RETURN sets SPSEL |
| `BASEPRI`, `FAULTMASK` | priority masks | **not on this core** (Thumb-2 only) | none |

## 4. MSP vs PSP and the EXC RETURN values (slides 3b, 18)

- **MSP** serves every exception handler, plus `main()` after reset; in this kernel, handlers only. **PSP** serves Thread mode when `CONTROL.SPSEL = 1`; in this kernel, every task, each on its own stack.
- **EXC_RETURN** is not a register. It is the value in `lr` while a handler runs, and it steers all of the above.
- Why the split is clean: a handler never needs space on a task's stack beyond the **8 words the hardware pushes on entry**. Each task's stack holds only that task.

| EXC_RETURN | Bit 3 | Bit 2 | Meaning | Seen when |
|---|---|---|---|---|
| `0xFFFFFFFD` | 1 Thread | 1 PSP | return to Thread mode, restore from PSP, keep using it | **every switch in this kernel**; `lr` when a task faulted |
| `0xFFFFFFF1` | 0 Handler | 0 MSP | return to Handler mode, MSP | `lr` when a handler faulted |
| `0xFFFFFFF9` | 1 Thread | 0 MSP | Thread mode on MSP (textbook context) | `main()` before `os_start` |

- Bits 31:4 are all ones. While a task runs, **CONTROL = 0x00000002** (SPSEL = 1, nPRIV = 0, so privileged). The first switch interrupts `main()` on MSP but returns with `0xFFFFFFFD`, so execution **never goes back to `main()`**.

## 5. The System Control Block: ICSR and SHPR3 (slide 4)

`SCB_Type` in `core_cm0plus.h`, at **0xE000ED00** (`SCS_BASE` 0xE000E000 + 0xD00). It is part of the core, so it is the same on every M0+. Map: 0x00 CPUID, **0x04 ICSR**, 0x08 VTOR (never written), 0x0C AIRCR, 0x10 SCR, 0x14 CCR (STKALIGN 9, UNALIGN_TRP 3), 0x18 reserved, 0x1C SHPR2 (`SHPR[0]`, SVCall 31:30), **0x20 SHPR3** (`SHPR[1]`), 0x24 SHCSR. The kernel writes **two registers out of nine**.

| Register | Address | Bits the kernel uses | Value written |
|---|---|---|---|
| ICSR | 0xE000ED04 | **28 PENDSVSET**, **27 PENDSVCLR** (also 31 NMIPENDSET, 26 PENDSTSET, 25 PENDSTCLR, 23 ISRPREEMPT, 22 ISRPENDING, 17:12 VECTPENDING, 5:0 VECTACTIVE) | 0x10000000 to pend, 0x08000000 to cancel |
| SHPR3 | 0xE000ED20 | **31:30 SysTick**, **23:22 PendSV** | **0xC0C00000** after `os_start` (both at 3) |

- **ICSR is write-1-to-act** and zeros do nothing, so the kernel writes the bit alone with `=`, never `|=`: `SCB->ICSR = SCB_ICSR_PENDSVSET_Msk`.
- `__NVIC_PRIO_BITS = 2`: only the top 2 bits of each priority byte exist, giving four levels, 0-3. $\text{byte} = p \ll (8-2)$, so priority 3 is 0xC0. `NVIC_SetPriority(PendSV_IRQn, 3)` writes the **SCB, not the NVIC**. CMSIS picks the word and byte from the exception number (`_SHP_IDX`, `_BIT_SHIFT`).
- SysTick (0xE000E010) is the third core block, used exactly as in lesson 06 (see 07_Week5_L06_Time_Timers.md, SysTick). `SysTick_Config(48000000 / 1000)` gives LOAD 47999, a 1 ms tick, and also leaves SysTick at priority 3.

## 6. PendSV: deciding vs switching (slides 4b, 4c)

- **The rule:** a switch must never happen *inside* another interrupt handler. That handler's frame is on MSP, half-finished, and swapping the task beneath it would return it into the wrong world. So switches happen in **PendSV** only.
- PendSV is **triggered by software only** (ICSR PENDSVSET) and given the **lowest priority, 3**. It runs only when no other handler is active, tail-chained on the way back to a task.
- **Deciding, `schedule()`:** picks the next task and pends PendSV if it differs. It runs anywhere (the tick, `os_delay`, mutex unlock, queue put, in tasks and in ISRs), and it can change its mind by writing PENDSVCLR.
- **Switching, `PendSV_Handler`:** saves the old context and restores the new one. It runs in one place only, and once PendSV runs the switch happens.

```c
static void schedule(void) {          /* os.c, if/else condensed; call with interrupts masked */
    os_task_t *n = pick();  os_next = n;
    SCB->ICSR = (n != os_current) ? SCB_ICSR_PENDSVSET_Msk : SCB_ICSR_PENDSVCLR_Msk;
}
```

- **Why PENDSVCLR:** without the cancel, a switch requested earlier would still happen, to a task chosen from stale information.

**One switch from A to B (slide 4c).** In the flowchart, dashed boxes are hardware, solid are kernel code and filled is the switch. Steps 2-9 run in Handler mode on MSP.

| Step | What happens | Who |
|---|---|---|
| 1 to 2 | A (Thread mode, PSP) is interrupted by SysTick (1 ms); hardware pushes **half** of A's context (r0-r3, r12, lr, pc, xPSR) onto **A's own stack** | hardware |
| 3 to 4 | `SysTick_Handler`: ticks++, wake sleepers, `pick()` finds the most urgent READY task. If it is A, return to A | kernel |
| 5 | if not A, `SCB->ICSR = PENDSVSET`. The decision is made; the switch is only requested | `schedule()` |
| 6 | tail-chain into PendSV once no other handler is running | hardware |
| 7 to 8 | save A's r4-r11, `A.tcb->sp = PSP - 32`; `os_current = B`, pop B's r4-r11, PSP = B's frame | `PendSV_Handler` |
| 9 to 10 | `bx 0xFFFFFFFD`: hardware pops B's 8 words, pc included, and B resumes where it stopped | hardware |

- SysTick is only **one way in**. `os_delay()`, mutex unlock and queue put call `schedule()` too and join at step 4, so a task that sleeps does not wait for the tick to be switched out. **The hardware does half the work:** 8 of the 16 words.

## 7. The exception stack frame, 16 words (slide 5)

A switched-out task, lowest address first. `tcb->sp` points at r4, and the hardware frame starts 32 bytes on, at r0.

| Word | Offset from tcb->sp | Register | Saved by | Offset from PSP at exception entry |
|---|---|---|---|---|
| 0-3 | +0, +4, +8, +12 | r4, r5, r6, r7 | PendSV | -32 to -20 |
| 4-7 | +16, +20, +24, +28 | r8, r9, r10, r11 | PendSV (via r4-r7) | -16 to -4 |
| 8-11 | +32, +36, +40, +44 | r0, r1, r2, r3 | hardware | +0 to +12 |
| 12 | +48 | r12 | hardware | +16 |
| 13 | +52 | lr | hardware | +20 (frame word 5) |
| 14 | +56 | **pc** | hardware | +24 (frame word 6) |
| 15 | +60 | xPSR | hardware | +28 (frame word 7) |

- 16 words = 64 bytes. The task's own locals sit above (higher addresses), and the stack grows toward lower addresses. "Sixteen words and one pointer: that is a whole paused program." Hardware stacking and tail-chaining are lesson 03 material (see 05_Week4_L03_Execution_Concurrency.md, exception entry).

## 8. PendSV Handler, instruction by instruction (slide 6)

`naked` (no compiler prologue or epilogue), at `0x08000700` in `Main.elf`: **34 instructions, 88 bytes** with its literal pool. "That is the whole of multitasking." The numbers in the comments are the slide's steps.

```asm
    .syntax unified
    cpsid i
    ldr   r3, =os_current
    ldr   r1, [r3]          @ r1 = the task being left
    cmp   r1, #0
    beq   1f                @ the very first switch has nothing to save
    mrs   r0, psp           @ 1: r0 -> A's hardware frame (its r0)
    subs  r0, #32           @ 2: reserve 8 words below it ...
    str   r0, [r1]          @    ... tcb->sp = psp - 32
    stmia r0!, {r4-r7}      @ 3: r4-r7 at +0, r0 -> +16
    mov   r4, r8            @ 4: (and mov r5,r9 / mov r6,r10 / mov r7,r11: 4 movs)
    stmia r0!, {r4-r7}      @    r8-r11 at +16: A fully saved
1:  ldr   r2, =os_next
    ldr   r1, [r2]
    str   r1, [r3]          @ os_current = os_next
    ldr   r2, =os_switch_count  @ then ldr r0,[r2] / adds r0,#1 / str r0,[r2]: count++
    ldr   r0, [r1]          @ 5: r0 = B's saved sp, at B's r4
    adds  r0, #16           @ 6: skip to B's r8-r11 ...
    ldmia r0!, {r4-r7}      @    ... load them, r0 -> +32
    mov   r8, r4            @    (and mov r9,r5 / mov r10,r6 / mov r11,r7)
    msr   psp, r0           @ 7: PSP -> B's hardware frame (+32)
    subs  r0, #32           @ 8: back to B's r4 ...
    ldmia r0!, {r4-r7}      @    ... r4-r7 restored last
    cpsie i
    ldr   r0, =0xFFFFFFFD   @ 9: EXC_RETURN, Thread mode, PSP
    bx    r0                @    hardware pops B's 8 words and jumps to B's pc
```

- `os_current`, `os_next` and `os_switch_count` are **not `static`**, because the assembly reads them by name. `sp` must be the TCB's first field, because `ldr r0, [r1]` reads `[tcb + 0]`.
- First switch: `os_current == 0`, so `beq 1f` skips the save, and `r3` still holds `&os_current` at `1:`.
- Why `mrs r0, psp` + `stmia` and not `push`: PendSV runs in Handler mode, where `push` would use MSP. `stmia` only counts upward, so the code steps down 32 bytes first (textbook context).
- After step 9, B's PSP = B's saved `sp` + 64.
- **The same job on a desktop OS (slide 6):** the same shape. Decide in one place, switch later in a deferred low-priority step, and save half the registers on entry and half in the switch. Windows (x86-64) defers to a DISPATCH_LEVEL software interrupt (IRQL 2) and switches in `SwapContext`. Linux sets `TIF_NEED_RESCHED` and switches in `__switch_to_asm`. Both also move XSAVE (FPU) state and reload CR3, so a switch costs a few us, against tens of cycles here.
- **What makes the RTOS switch cheap is what it leaves out:** no address space, no FPU state, no privilege change to undo. That is also why **one bad pointer in any task can overwrite every other task**.

## 9. Why r8-r11 go the long way round (slide 7)

- `stmia r0!, {r4-r11}` does it in one instruction on a Cortex-M3. On the M0+ that instruction **does not exist**: the M0+ runs "Thumb-1 plus six" (see 02_Week2_L01_InstructionSet_Thumb.md, Thumb-1 subset). `stm` and `ldm` have an **8-bit register list**, which reaches only r0-r7. So r8-r11 are copied into r4-r7, which are already saved and therefore free, and stored from there.
- Restore runs backwards: **r8-r11 first** (using r4-r7 as scratch), then **r4-r7 last**, so the copy is not overwritten.

| Instruction | Halfword | Fields |
|---|---|---|
| `stmia r0!, {r4-r7}` | **0xC0F0** | 15:11 = 11000 STMIA, 10:8 Rn = 000 (r0), 7:0 list = 1111 0000 (r4-r7) |
| `mov r4, r8` | **0x4644** | 15:8 = 0x46 MOV hi, 7 D = 0, 6:3 Rm = 1000 (r8), 2:0 Rd = 100 (r4) |

- `mov` between low and high registers is one of the few Thumb-1 instructions that reach r8-r12. In the disassembly, `sl` = r10 and `fp` = r11, their old APCS names.
- The first draft did not assemble: GCC's default inline-asm syntax rejects `subs r0, #32` on this core, and one line, `.syntax unified`, fixed it. "Silent failures get slides; loud ones deserve a sentence."

## 10. Forging the first frame (slide 8)

A new task has never been preempted, so `os_task_create()` **builds** the stack it would have if it had just been interrupted at its first instruction:

```c
for (i = 0; i < stack_words; i++) stack[i] = OS_STACK_FILL;          /* 0xDEADBEEF */
uint32_t *sp = (uint32_t *)((uintptr_t)(stack + stack_words) & ~7u); /* AAPCS: 8-aligned */
*--sp = 0x01000000u;                 /* xPSR: only the Thumb bit */
*--sp = (uint32_t)fn & ~1u;          /* pc:   the function's start */
*--sp = (uint32_t)task_exit;         /* lr:   where it goes if it returns */
*--sp = 0u; *--sp = 0u; *--sp = 0u; *--sp = 0u;   /* r12, r3, r2, r1 */
*--sp = (uint32_t)arg;               /* r0:   its argument (AAPCS) */
for (int i = 0; i < 8; i++) *--sp = 0u;           /* r11..r4 */
t->sp = sp;  t->prio = t->base_prio = prio;  t->state = OS_READY;
```

- **xPSR's T bit (24) must be 1.** Returning with T = 0 asks for ARM state, which the M0+ does not have, so it HardFaults on the first switch.
- **pc = `fn & ~1`:** Thumb function pointers have bit 0 set, and the stacked pc must not (textbook context). **`arg` goes in the r0 slot**, because AAPCS passes the first argument there, so the task receives it as a normal parameter.
- **lr = `task_exit`:** a task function that returns is parked for good (BLOCKED, waiting on `task_exit`, which nobody wakes) instead of wandering off into memory.
- "To the switch, a brand-new task and a task preempted a second ago look identical. That is the trick." The 16 forged words are also why idle's high-water mark reads exactly **16 / 64**.
- **`os_start`** (os.c): create `idle` last (64 words, priority 0), `NVIC_SetPriority(PendSV_IRQn, 3)`, `SysTick_Config(SystemCoreClock / OS_TICK_HZ)`, then `__disable_irq(); os_current = 0; os_next = pick(); SCB->ICSR = PENDSVSET; __enable_irq();`. The first switch happens at that enable; `for (;;)` follows, and `main()` is over.

## 11. The scheduler rule: who runs next (slide 9)

```c
static os_task_t *pick(void) {
    uint32_t cur = os_current ? (uint32_t)(os_current - tasks) : 0u;
    os_task_t *best = 0;
    for (uint32_t i = 1; i <= n_tasks; i++) {
        os_task_t *t = &tasks[(cur + i) % n_tasks];
        if (t->state == OS_READY && (best == 0 || t->prio > best->prio)) best = t;
    }
    return best;
}
```

- **The rule (fixed-priority preemptive):** the highest-priority READY task runs, always. A running task is stopped when a *more urgent* task becomes READY.
- **Round-robin time slicing among equals:** the search starts *after* the current task, and only a **strictly higher** priority replaces a find, so equal-priority tasks take turns, one tick each.
- **Idle task**, priority 0, is always READY, so there is always an answer. Cooperative scheduling (nobody stops a task) is lesson 06's superloop. This kernel combines fixed-priority preemption with round-robin.
- **Two numberings.** In this kernel (and FreeRTOS) the **highest number is most urgent**, ranging 0 (idle) to 3 (button). In the NVIC, **0 is most urgent**, ranging 0-3 (2 bits). "Always say which one you mean."

**Worked `pick()`**, scenario 1. Array order: bar 0 (p2), button 1 (p3), hog 2 (p1), report 3 (p1), idle 4 (p0). Idle is created last by `os_start`.

| Current | READY | Search order | Picked |
|---|---|---|---|
| none (first switch, cur = 0) | all | 1, 2, 3, 4, 0 | button (p3) |
| hog | hog, report, idle | 3, 4, 0, 1, 2 | report (equal p1, found first) |
| report | hog, report, idle | 4, 0, 1, 2, 3 | hog (round-robin back) |
| hog | bar (woken), hog, report, idle | 3, 4, 0, 1, 2 | bar (p2 beats p1: preempts) |

## 12. The tick, sleeping and task states (slide 10)

- **`SysTick_Handler`, the heartbeat**, does four things inside `enter()` and `leave()`. It runs `ticks++`, then `os_current->ticks++` (charging the tick to whoever was running). Every SLEEPING task with `(int32_t)(ticks - wake) >= 0` becomes READY; that is the wrap-safe compare (see 07_Week5_L06_Time_Timers.md, millis wrap). Last, `schedule()` handles wake-ups and time slices.
- **`os_delay(ms)`:** sets `wake = ticks + ms` and state SLEEPING, calls `schedule()`, then `leave(pm)`. PendSV is now pending, so the switch happens **at that `leave`**. The CPU is not waiting for the task; someone else runs.
- **`os_delay_until(&last, period)`:** lesson 06's `at += period` as a call. It does `*last += period` and sleeps only if `*last` is still in the future, so the task wakes on a fixed grid however long its work took. The bar's frames stay exactly 60 ms apart while the hog runs flat out.

| State | Means | Gets there by | Leaves by |
|---|---|---|---|
| READY | could run now (the running one is just `os_current`) | created; woken | being picked |
| SLEEPING | waiting for a time | `os_delay`, `os_delay_until` | the tick reaching `wake` |
| BLOCKED | waiting for a thing | a held mutex; an empty or full queue | the owner unlocks; an item arrives or leaves |

- **Busy-waiting** (lesson 05) spins at 100% CPU and nobody else runs. **Sleeping** costs no CPU, and every other READY task runs meanwhile.
- **Statistical profiling:** each tick charges 1 ms to whoever was running. Per 1 s report, $\text{cpu\%} = \Delta\text{ticks} / 10$. Report columns: `prio` is base/current (`1/3` while inheriting), `st` is R/S/B, and `stack` is used/size in words.

## 13. Measured: a hog that does not hurt (slide 11)

| Task (prio, stack size) | st, cpu% (hog on, t=3001) | st, cpu% (after B, t=5001) | stack used |
|---|---|---|---|
| bar (2, 128) | S, 0 | S, 0 | 24 |
| button (3, 128) | S, 0 | S, 0 | 30 |
| hog (1, 128) | R, **100** | S, 0 | 20 |
| report (1, 512) | R, 0 | R, 0 | 115 |
| idle (0, 64) | R, 0 | R, **100** | 16 |

- The hog takes every spare cycle, yet bar and button, at higher priority, are on time: each wakes, preempts the hog within a tick, works a few microseconds and sleeps. That is why they show **0% and still work**.
- Press B and the hog's share passes **whole to idle**. Nothing else changed, and in the superloop the left-hand column is impossible.
- switches/s: **419** with the hog on, **429** after B. Why about 420: button wakes 200 times a second (every 5 ms), bar about 17 (every 60 ms), and each visit is two switches, in and out. $2(200 + 1000/60) \approx 433$.

## 14. The mutex (slide 12)

```c
void os_mutex_lock(os_mutex_t *m) {
    uint32_t pm = enter();                       /* PRIMASK, as always */
    while (m->owner != 0) {
#if OS_PRIORITY_INHERIT
        if (m->owner->prio < os_current->prio) m->owner->prio = os_current->prio;
#endif
        os_current->state = OS_BLOCKED;  os_current->waiting_on = m;
        schedule(); leave(pm);  pm = enter();    /* switched out here; back when woken */
    }
    m->owner = os_current;  leave(pm);
}
/* unlock: owner = 0; prio = base_prio (give back anything lent); wake_waiters(m); schedule(); */
```

- **`enter()`** saves PRIMASK, then masks (`__get_PRIMASK(); __disable_irq()`). **`leave(pm)`** restores it (`__set_PRIMASK(pm)`), not just clears it, so critical sections **nest** and work from inside a handler. This is lesson 03's tool, unchanged (see 05_Week4_L03_Execution_Concurrency.md, critical sections).
- The `while` re-checks the owner after waking (textbook context: `wake_waiters` readies every waiter, and another may get the mutex first).
- **Masking interrupts (PRIMASK)** holds up everything, every task and every interrupt, so it may last only a few instructions. It is usable from an ISR, and here it guards the kernel's own lists and counters.
- **A mutex** holds up only tasks that want this resource, and may last as long as the work takes. Waiters are BLOCKED, off the CPU. It is **not usable from an ISR**, because an ISR cannot block. Here it guards `shared` in scenario 2.
- The mutex is a way to make a *long* critical section cheap for everyone who does not need it.

## 15. Priority inversion (slide 13)

Scenario 2: **low** (p1) holds the mutex 30 ms at a time; **mid** (p2) computes 120 ms and never touches it; **high** (p3) needs it briefly every 100 ms and times its wait; `report` is p4. Timeline: low locks; high wants the mutex and BLOCKS, which is legitimate. Mid then preempts **low** and runs 120 ms, so low cannot finish and unlock. **High is now waiting for mid**, a task it outranks that shares nothing with it.

| Term | Meaning | Here |
|---|---|---|
| Blocking | waiting for a resource another task holds | high waits for low: expected, at most 30 ms |
| Priority inversion | a task waits, in effect, for a task it outranks | high waits behind mid |
| Unbounded inversion | that wait has no limit: it lasts as long as mid runs | up to 120 ms here; forever if mid never stops |

- **Mars Pathfinder, 1997.** The lander kept resetting because a high-priority bus task was starved through this exact pattern. Engineers reproduced it on the ground and fixed it by **turning on one flag remotely**: priority inheritance.

## 16. Priority inheritance, measured (slide 14)

- **The fix:** while low holds a mutex that high is waiting for, **low borrows high's priority**. Mid can no longer preempt it. Low finishes its 30 ms, unlocks, drops back to `base_prio` 1, and high goes.

| `OS_PRIORITY_INHERIT` | High's worst wait | Waits over 40 ms (5 s, 49 locks) |
|---|---|---|
| **1** | **10 ms** | **0** |
| 0 | **110 ms** | **6** |

- Same tasks, same code, one `#define`. Low's critical section is 30 ms, so **any wait over 40 ms is time spent waiting for mid**. With inheritance off, 110 - 30 = 80 ms of the worst wait was mid's. Mid's CPU share is the same either way. Inheritance does not take time from mid; it changes **when** mid gets it (Lab).
- **Limitation:** this inheritance is right for **one mutex at a time**. A task holding two with different waiters needs a real implementation, and FreeRTOS's is several hundred lines.

## 17. Queues, from tasks and from interrupts (slide 15)

- Often better than sharing data under a mutex: **don't share it, give it**. A queue copies fixed-size items in and out. A reader blocks while it is empty, a writer while it is full.
- `os_queue_put(&q, &item)` blocks while full. `os_queue_get(&q, &item)` blocks while empty. `os_queue_put_from_isr(&q, &item)` **never blocks**: it returns 0 if full, 1 if put.
- Ring buffer: tail = (head + count) % capacity; get reads at `head`, then head = (head + 1) % capacity. Every put and get calls `wake_waiters(q)` and then `schedule()`.
- **An ISR must never block:** there is no task to put to sleep, only a handler on MSP. So the ISR version reports "full" and lets the handler decide.
- Because the ISR version calls `schedule()`, a waiting task can be made READY **inside the interrupt**. The switch happens the moment the last handler returns, since PendSV is priority 3. Interrupts that use it belong at NVIC 0-2 (README). Lesson 08's design: the UART RX interrupt puts bytes in a queue, and a protocol task blocks on it, using no CPU until a byte arrives.
- **Mutex vs queue:** with a mutex the data stays where it is, shared, and anyone who wants it waits while it is held; never use one from an ISR. With a queue the data is copied to whoever needs it; a reader waits while it is empty, a writer while it is full, and an ISR may only use `os_queue_put_from_isr()`.

## 18. Sizing a stack: the high-water mark and overflow (slides 16-17)

- `os_task_create()` fills each stack with **0xDEADBEEF**. The stack grows down, so the words at the bottom (`stack[0]` upward) that still read 0xDEADBEEF were never reached. `os_stack_used()` counts them and returns `stack_words - untouched`, in words.
- Measured used/size: bar 24/128, button 30/128, hog 20/128, **report 115/512 (`printf`)**, idle 16/64. `printf` costs 115 words = **460 bytes** (newlib-nano's formatter plus `_write`), and every task that prints needs room for it.
- **The method matters more than the numbers:** run the program, exercise every path, read the high-water mark, add a margin. "A stack sized by guessing is wrong in one of two directions, and only one of them is visible."
- **Too small, measured.** The report stack is cut to 96 words while it needs 115. It prints `96 / 96 OVERFLOW`, and primes/s jumps from 5539 to **536871010**, but **nothing crashed**. Report wrote 115 - 96 = **19 words** below its stack, and the linker had put `primes` (the hog's counter) at **0x20000084**, the word just under `stk_report` at **0x20000088**. 536 871 010 = **0x20000062**, a stack address. The mark saturates at the size, so `96 / 96` means "at least full", not by how much.
- **People expect** an overflow to crash the guilty task. **On an MCU it is usually** another task's data quietly wrong, so the bug looks like it is in the victim (the hog). The high-water mark catches it; bigger cores use an MPU guard region.

## 19. A HardFault that says where (slide 18)

On a fault the hardware stacks the usual 8 words, on PSP if a task was running, and enters `HardFault_Handler`. **Bit 2 of `lr`** (EXC_RETURN) says which stack, and **word 6 of the frame is the faulting pc**.

```asm
    movs r0, #4               @ HardFault_Handler, naked, in Main.c
    mov  r1, lr
    tst  r0, r1               @ EXC_RETURN bit 2: which stack?
    beq  1f
    mrs  r0, psp              @ a task faulted
    b    2f
1:  mrs  r0, msp              @ a handler faulted
2:  ldr  r1, =fault_report    @ r0 = frame pointer = first argument
    bx   r1
```

`fault_report(frame)` prints the task name (from `os_current`), `frame[6]` pc, `frame[5]` lr, `frame[7]` xPSR and the `addr2line` command, then loops forever. Measured, with `__builtin_trap()` in the hog:

```
*** HardFault in task 'hog'
    pc   = 0x08000422   <- the instruction that faulted
    lr   = 0x08000415   <- where it would have returned to
    xPSR = 0x61000000
    Find the line:  arm-none-eabi-addr2line -e Main.elf 0x08000422
```

- `addr2line` answers with the exact line of `Main.c`. The instruction at that address is `udf #255`: undefined, deliberately.
- xPSR 0x61000000 sets bits 30, 29 and 24: **Z = 1, C = 1, T = 1**, ISR = 0 (Thread mode). EXC_RETURN in `lr`: 0xFFFFFFFD when a task faulted (bit 2 = 1, PSP), 0xFFFFFFF1 when a handler faulted (bit 2 = 0, MSP).
- The M0+ has **one fault handler and no fault-status registers**, so the *reason* is lost. On the Cortex-M4 in lesson 11, `CFSR` says why as well as where.

## 20. What a real RTOS adds, and how it was measured (slides 19-20)

- **FreeRTOS and Zephyr add:** tickless idle and deadline scheduling (Zephyr); semaphores, event groups, timers and message buffers; nested inheritance and recursive mutexes; stack checks on every switch and MPU guard regions; FPU state in the same switch on an M4F.
- "The core is the same, instruction for instruction." `xTaskCreate` is `os_task_create`, `vTaskDelayUntil` is `os_delay_until`, and `xQueueSendFromISR` is `os_queue_put_from_isr`. From here on, lessons are written as tasks.
- **Measured on** Renode 1.17.0, STM32F072 platform: a Cortex-M0, the same ARMv6-M, with SysTick, PendSV and the NVIC modelled. `os.c` and `Main.c` were unchanged. A test-only `startup.c` skipped the C0's clock and flash-latency waits, the C0's GPIO was mapped as plain memory for button presses, and the F0's USART2 sits at the C0's address.
- **Renode does not fault on an unaligned word access; ARMv6-M silicon does.** So the lab faults with `__builtin_trap()`, which faults everywhere.

## Lab takeaways

- **Part 0, build and read.** FLASH 7472 B (22.80%) and RAM **6128 B of 12 KB (49.87%)**, up from about 2 KB. The stacks take 128 + 128 + 128 + 512 + 64 = 960 words = **3840 B**, whether used or not. After pressing B: hog `S 19`, idle 80, then idle 100.
- **Part 1, hog at priority 4.** Banner, then nothing: bar, buttons and report all starve. The highest-priority READY task always runs and the hog is always ready, so priority must follow deadline, and the hog has none.
- **Part 2, forged xPSR 0x00000000.** HardFault in `button` at `pc = 0x08000228`, its first instruction. Button has the highest priority, so it is switched to first, and T = 0 asks for ARM state, which the M0+ lacks.
- **Part 3, `SCENARIO 2`, then `OS_PRIORITY_INHERIT 0`.** Worst wait 10 ms vs 110 ms; waits over 40 ms 0 vs 6 in 49 locks. The extra 80 ms was waiting for mid, whose CPU share does not change.
- **Part 4, report stack 96 words** (change both the `STACK()` size and the `os_task_create` size). No crash: `96 / 96 OVERFLOW`, then 536871010 primes/s. `nm -n` puts `primes` (0x20000084) just below `stk_report` (0x20000088), so the damage lands in another task's data.
- **Part 5, `if (primes == 3000u) { __builtin_trap(); }` in the hog.** The report names `hog` with pc 0x08000422, and `addr2line` prints the trap's line (`udf`). Open question: the unaligned store `*(volatile uint32_t *)0x20002801u = 1u` faults on silicon, not in Renode; Wokwi is unchecked.
- **Part 6, a logger fed by a queue.** The button task (smallest stack, highest priority) must not `printf`, so it calls `os_queue_put()` and the logger blocks in `os_queue_get()`. Measured: `log 2/2 B 0` until a press; stack high-water mark 89 words.
- **Where to go next.** With bar and hog both at p1, round-robin still runs the bar, but it loses exact timing. A switch is roughly 66 cycles in the handler plus about 30 for entry and exit, about 2 us at 48 MHz, so 420 switches/s cost under 0.1% of the CPU (textbook context).

## Exam focus

- **Draw a switched-out stack.** From `tcb->sp` upward: r4-r7 (+0), r8-r11 (+16), r0-r3 (+32), r12, lr, pc, xPSR (+48); 64 bytes in all. Hardware saves r0-r3, r12, lr, pc, xPSR (the higher 8 words); PendSV saves r4-r11 (the lower 8). In the hardware frame, pc is word 6 (PSP + 24).
- **What goes in a new task's forged frame?** xPSR 0x01000000, pc `fn & ~1`, lr `task_exit`, r0 `arg`, and 12 zero words. Spot the bug: forging xPSR = 0 HardFaults at the first instruction.
- **Why switch in PendSV, not in `SysTick_Handler`?** Switching under another handler's half-finished MSP frame returns it into the wrong world. PendSV at priority 3 runs only when no handler is active. Deciding happens anywhere; switching happens only in PendSV.
- **Compute the priority and pend writes.** SHPR3 (0xE000ED20) = **0xC0C00000**, since priority 3 is byte 0xC0. To pend, write 0x10000000 to ICSR (0xE000ED04) with `=`, not `|=`.
- **Why copy r8-r11 through r4-r7?** Thumb-1 `stm` and `ldm` list only r0-r7. On restore, r8-r11 go first, so restoring r4-r7 last does not clobber them.
- **Which EXC_RETURN values matter?** Every switch uses 0xFFFFFFFD (Thread mode, PSP). HardFault's `tst` checks bit 2: 1 means PSP (a task faulted); 0 means MSP, as in 0xFFFFFFF1 (a handler faulted).
- **Predict `pick()`.** With hog (p1) current, report (p1) READY and the rest asleep, report runs next (round-robin). If bar wakes, bar (p2) preempts at once. Raise the hog to p4 and nothing else ever runs.
- **Why `PENDSVCLR` in `schedule()`?** It cancels an earlier request when the current task should keep running after all; otherwise the switch would go to a stale choice.
- **Inversion numbers.** Low holds the mutex 30 ms, mid computes 120 ms, high runs every 100 ms. Inheritance off: worst wait 110 ms, 6 waits over 40 ms. On: 10 ms, 0 waits. Any wait over 40 ms means waiting on mid.
- **Why can't an ISR lock a mutex or call `os_queue_put`?** Both can block, and a handler has no task to put to sleep. Use `os_queue_put_from_isr()`, which returns 0 if full; the switch it requests happens after the last handler returns.
- **What does a stack overflow look like?** Usually another task's data goes quietly wrong rather than a crash: `primes` became 0x20000062. The 0xDEADBEEF high-water mark catches it, and `printf` alone needs 115 words.
- **Why `leave(pm)`, not `__enable_irq()`?** Restoring PRIMASK lets critical sections nest and stay correct inside handlers.
- **Source slips.** The `Main.c` header says "30 ms or 150"; the measured figures are 10 and 110. The `os.h` comment says Lab "Part 4"; it is Part 3. Slide 20 says the open question is "Part 6"; it is Part 5. Mid runs `os_delay(250)` then 120 ms busy, so its period is about 370 ms, not 250.
