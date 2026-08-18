---
title: Example lecture — Limits
week: 0
summary: A sample showing the format. Delete this file once you add your own.
topics: [example, limits, calculus]
---

## Notes

This lecture is here to show you what a lecture file looks like. Open
`data/lectures/math/example-lecture.md` and compare it with this page.

### What a limit actually says

**lim(x→a) f(x) = L** means: we can get f(x) as close to L as we like by taking
x close enough to a. Note what it does *not* say — nothing about f(a) itself.
The function needn't even be defined there.

### Why 0/0 isn't an answer

When substitution gives 0/0, that's an *indeterminate form* — it means "not
enough information yet", not "undefined". Do more work:

1. Factor and cancel
2. Multiply by the conjugate (when roots are involved)
3. Divide through by the highest power of x (for limits at infinity)

For example:

```
lim(x→2) (x² − 4)/(x − 2)
      = lim(x→2) (x − 2)(x + 2)/(x − 2)
      = lim(x→2) (x + 2)
      = 4
```

The cancellation is legal because x ≠ 2 while approaching 2 — we never
actually divide by zero.

> A limit exists only if the left-hand and right-hand limits agree. If they
> disagree, the limit does not exist, no matter how well-behaved each side is.

## Resources

- [Slides](#)
- [Textbook section](#)

## Flashcards

Q: What does 0/0 tell you when evaluating a limit?
A: Nothing yet — it's an indeterminate form, meaning you need to factor, rationalise or otherwise simplify before concluding.

Q: When does a limit fail to exist?
A: When the left-hand and right-hand limits disagree.

Q: Does lim(x→a) f(x) depend on the value of f(a)?
A: No. The limit describes behaviour approaching a; f(a) may differ or be undefined entirely.
