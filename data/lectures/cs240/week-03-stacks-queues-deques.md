---
title: Stacks, Queues & Deques
week: 3
date: 2026-09-22
summary: Ring buffers and the monotonic stack trick
topics: [stacks, queues, ring-buffer]
---

## Notes

### Stack

Last in, first out. Push and pop at one end, both O(1). Backing it with an array
is almost always the right call.

### Queue

First in, first out. The naive array version is a trap: dequeuing from the front
shifts everything, making it O(n).

### Ring buffer

Fix the queue by wrapping indices around a fixed-size array:

```
head ──▶ [ _ , b , c , d , _ ]  ◀── tail
          0   1   2   3   4
```

Both ends move in O(1) and nothing shifts. One catch: when `head == tail`, is
the buffer full or empty? Two standard fixes — keep an explicit count, or
deliberately leave one slot unused.

### Monotonic stack

A stack kept in sorted order as you scan. It solves "next greater element" in a
single pass. Each element is pushed at most once and popped at most once, so the
whole scan is **O(n)** even though it looks nested.

## Resources

- [Lecture slides (PDF)](#)
- [Recording](#)
- [Lab 3 starter code](#)

## Flashcards

Q: Why is a monotonic stack O(n) and not O(n²)?
A: Each element is pushed at most once and popped at most once across the whole scan.

Q: What ambiguity does head == tail create in a ring buffer?
A: It can mean either full or empty — resolve it with an explicit count or by leaving one slot unused.

Q: What's wrong with implementing a queue as a plain array you shift?
A: Dequeuing from the front shifts every remaining element, making it O(n) per operation.
