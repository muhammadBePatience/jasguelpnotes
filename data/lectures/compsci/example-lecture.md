---
title: Example lecture — Loops in Java
week: 0
summary: A sample showing the format. Delete this file once you add your own.
topics: [example, java, loops]
---

## Notes

This lecture is here to show you what a lecture file looks like. Open
`data/lectures/compsci/example-lecture.md` next to this page and compare the
two — everything you see here came from that file.

### The three loops

A `for` loop when you know how many times:

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

A `while` loop when you don't:

```java
while (scanner.hasNextLine()) {
    process(scanner.nextLine());
}
```

A `do while` loop when the body must run **at least once** — the condition is
checked at the bottom, not the top.

### Off-by-one errors

The classic mistake is `<=` where you meant `<`:

| Condition | Runs for i = | Iterations |
|---|---|---|
| `i < 5` | 0, 1, 2, 3, 4 | 5 |
| `i <= 5` | 0, 1, 2, 3, 4, 5 | 6 |

> When a loop runs one time too many, check the comparison operator first.
> It's the culprit far more often than the loop body.

## Resources

- [Slides](#)
- [Recording](#)

## Flashcards

Q: When would you use a do-while loop instead of a while loop?
A: When the body must run at least once, because the condition is checked after the first iteration rather than before it.

Q: Why does a for loop with the condition i <= 5, starting at 0, run six times?
A: It includes i = 5 as well as 0 through 4 — `<=` adds one extra iteration compared with `<`.

Q: What goes in the three parts of a for loop header?
A: Initialisation, the condition checked before each pass, and the update run after each pass.
