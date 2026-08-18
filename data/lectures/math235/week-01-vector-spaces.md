---
title: Vector Spaces & Subspaces
week: 1
date: 2026-09-09
summary: Axioms, subspace test, span and linear independence
topics: [vector-spaces, subspaces, span]
---

## Notes

### What makes a vector space

A set V with addition and scalar multiplication satisfying the eight axioms.
In practice you rarely check all eight — you usually show something *is* a
subspace of a space you already trust.

### The subspace test

A non-empty subset W of V is a subspace if and only if:

1. The zero vector is in W.
2. W is closed under addition.
3. W is closed under scalar multiplication.

Checking 1 first is the fastest way to rule things out — if the zero vector
isn't there, stop.

### Span and independence

- **span(S)** is the set of all linear combinations of vectors in S. It is
  always a subspace.
- A set is **linearly independent** when the only linear combination equal to
  zero is the trivial one, all coefficients zero.

> A basis is exactly a set that is both independent and spans the space —
> the smallest spanning set, and the largest independent set, at once.

## Resources

- [Lecture slides (PDF)](#)
- [Textbook §4.1–4.3](#)

## Flashcards

Q: What are the three conditions of the subspace test?
A: Contains the zero vector, closed under addition, closed under scalar multiplication.

Q: Define linear independence.
A: The only linear combination of the vectors equal to zero is the one where every coefficient is zero.

Q: What is a basis?
A: A set that is both linearly independent and spans the space.
