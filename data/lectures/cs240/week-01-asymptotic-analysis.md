---
title: Asymptotic Analysis
week: 1
date: 2026-09-08
summary: Big-O, Big-Theta, and what "amortized" actually means
topics: [complexity, big-o, amortized]
---

## Notes

### Why we measure this way

We care about how a program's cost **grows** with the input size, not how many
milliseconds it took on one particular laptop. Constants and hardware change;
the growth rate doesn't.

### The three bounds

- **O(f)** — upper bound. "It costs at most about f."
- **Ω(f)** — lower bound. "It costs at least about f."
- **Θ(f)** — tight bound. Both of the above at once.

In everyday conversation people say "Big-O" when they usually mean Θ. Be precise
in exams, relaxed in the hallway.

### Amortized cost

Amortized is *not* the same as average. Average is about a distribution of
inputs; amortized is a worst-case guarantee spread over a sequence of operations.

A dynamic array doubles its capacity when full. That one resize is O(n), but it
only happens after n cheap pushes, so the cost spreads out:

```
push  push  push  push … push (resize, expensive)
 1     1     1     1        n
```

Total for n pushes is O(n), so each push is **O(1) amortized**.

> Rule of thumb: if an expensive step "pays" for the many cheap steps that
> preceded it, the amortized cost is cheap.

### Common growth rates, slowest-growing first

| Notation | Name | Example |
|---|---|---|
| O(1) | constant | array index |
| O(log n) | logarithmic | binary search |
| O(n) | linear | one pass over a list |
| O(n log n) | linearithmic | merge sort |
| O(n²) | quadratic | naive nested loops |

## Resources

- [Lecture slides (PDF)](#)
- [Recording](#)
- [Problem set 1](#)

## Flashcards

Q: What does amortized O(1) mean?
A: Any sequence of n operations costs O(n) in total, even if one individual operation is expensive.

Q: How is Θ different from O?
A: O is only an upper bound; Θ means the bound is tight — the cost grows at that rate both above and below.

Q: Why is pushing to a dynamic array O(1) amortized rather than O(n)?
A: Resizing doubles the capacity, so an expensive resize only happens after n cheap pushes; the cost spreads across them.

Q: Is amortized the same as average-case?
A: No. Average-case is about a distribution of inputs; amortized is a worst-case guarantee across a sequence of operations.
