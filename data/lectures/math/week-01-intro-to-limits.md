---
title: Intro to Limits
week: 1
summary: What a limit is, one-sided limits, and reading them off a graph
topics: [limits, one-sided-limits, piecewise, tangent]
---

## Notes

The handout below is the blank lesson sheet — the examples are there to work
through. These are the ideas behind it.

### Where calculus came from

Two problems the ancients kept running into:

- **The area problem** — finding the area of a shape that isn't made of
  straight lines. The Greeks approximated a circle with polygons; the Egyptians
  split the land around the Nile into rectangles. Both are the same trick:
  approximate with simple shapes, then take more and more of them.
- **The tangent problem** — finding the *rate of change* at a single point,
  which is the slope of the tangent line there.

### Why the tangent problem needs limits

To find a slope you need **two** points. But a tangent touches the curve at
only one point, P. So you cheat: take a second point Q nearby on the curve,
find the slope of the line PQ, then slide Q closer and closer to P.

The slope of the tangent is what that value *approaches*. It's never actually
computed at a single point — it's a limit.

### What a limit actually is

> The limit of a function is the y-value the function approaches near a
> particular x-value.

Note "near", not "at". The function doesn't have to be defined at that x-value,
and if it is, its value there can be something else entirely. The limit only
cares about the behaviour on the way in.

### One-sided limits

You can approach an x-value from either direction:

| Notation | Means |
|---|---|
| lim as x→a⁻ | approaching a from the **left** (smaller values) |
| lim as x→a⁺ | approaching a from the **right** (larger values) |
| lim as x→a | the two-sided limit |

**The two-sided limit exists only if both one-sided limits exist and are
equal.** If the graph jumps at x = a, the left and right limits disagree and
the limit does not exist — even though both one-sided limits are perfectly
fine on their own.

Reading these off a graph: put your finger on the curve to the left of a and
slide right — the height you head toward is the left limit. Then come in from
the right for the right limit.

### Piecewise functions

Absolute values are the usual source of these. |x − 2| splits at x = 2:

```
|x − 2| =  x − 2    when x ≥ 2
         −(x − 2)   when x < 2
```

That split point is exactly where the interesting limit questions live. For
something like |x − 2|/(x − 2), the function equals +1 on one side and −1 on
the other, so the left and right limits differ and the two-sided limit doesn't
exist — even though the function is perfectly well behaved everywhere else.

> Whenever you see an absolute value, rewrite it in piecewise form first.
> Nearly every limit question about it becomes obvious once you do.

## Resources

- [Lesson handout — Intro to Limits (PDF)](files/math/1-02-intro-to-limits.pdf)

## Flashcards

Q: What does the limit of a function describe?
A: The y-value the function approaches near a particular x-value — its behaviour on the way in, not its value at that point.

Q: Does a function have to be defined at x = a for the limit as x approaches a to exist?
A: No. The limit only depends on behaviour near a, not on f(a), which may be different or undefined.

Q: When does a two-sided limit fail to exist?
A: When the left-hand and right-hand limits disagree — for example where the graph jumps.

Q: What do the minus and plus signs mean in x→a⁻ and x→a⁺?
A: Minus means approaching a from the left (smaller values), plus means from the right (larger values).

Q: Why do you need a limit to find the slope of a tangent?
A: A slope needs two points, but a tangent touches at one. You take a nearby point Q, find the slope of PQ, and see what it approaches as Q slides toward P.

Q: What's the first step when a limit question involves an absolute value?
A: Rewrite the function in piecewise form — the split point is where the one-sided limits differ.
