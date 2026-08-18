---
title: Arrays & Linked Lists
week: 2
date: 2026-09-15
summary: Trade-offs, cache locality, and when a linked list is actually worth it
topics: [arrays, linked-lists, memory]
---

## Notes

### Arrays

Contiguous memory. Index arithmetic gives O(1) random access, and traversal is
fast for a reason people often forget: **cache locality**. The CPU pulls in a
whole cache line at a time, so the next element is usually already there.

Insert or delete in the middle costs O(n) because everything after it shifts.

### Linked lists

Each node holds a value plus a pointer. Insert and delete are O(1) — but only
*if you already hold a reference to the node*. Finding that node is O(n), which
quietly cancels the advantage in most real code.

Nodes are scattered across memory, so every hop is a potential cache miss. In
practice an array often beats a linked list even on workloads the textbook says
favour lists.

### Choosing between them

1. Need random access by index? Array.
2. Iterating a lot? Array — locality wins.
3. Splicing nodes you already hold, constantly? Linked list.
4. Unsure? Array. It's the better default more often than not.

## Resources

- [Lecture slides (PDF)](#)
- [Recording](#)

## Flashcards

Q: Why is array traversal usually faster than linked-list traversal?
A: Cache locality — array elements sit in contiguous memory, so the CPU loads several at once instead of chasing pointers.

Q: When is a linked list genuinely the better choice?
A: When you already hold a reference to the node and are inserting or removing frequently at that position.

Q: What is the cost of inserting into the middle of an array?
A: O(n), because every element after the insertion point has to shift.
