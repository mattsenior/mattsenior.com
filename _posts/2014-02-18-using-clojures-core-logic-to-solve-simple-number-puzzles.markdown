---
layout: article
title: "Using Clojure’s core.logic to Solve Simple Number Puzzles"
---

```clojure
(ns number-puzzles.core
  (:refer-clojure :exclude [==])
  (:use clojure.core.logic)
  (:require [clojure.core.logic.fd :as fd]))

;; Use run* to retrieve all possible solutions
(run* [q]

  ;; Create some new logic vars (lvars) for us to use in our rules
  ;; Named a0 a1 a2 for the top row, b0 b1 b2 for the second, etc.
  (fresh [a0 a1 a2 b0 b1 b2 c0 c1 c2]

    ;; Unify q with our lvars in the output format we want
    (== q [[a0 a1 a2]
           [b0 b1 b2]
           [c0 c1 c2]])

    ;; State that every one of our lvars should be in the range 1-9
    (fd/in a0 a1 a2 b0 b1 b2 c0 c1 c2 (fd/interval 1 9))

    ;; State that each of our lvars should be unique
    (fd/distinct [a0 a1 a2 b0 b1 b2 c0 c1 c2])

    ;; fd/eq is just a helper to allow us to use standard Clojure
    ;; operators like + instead of fd/+
    (fd/eq

      ;; Horizontal conditions for the puzzle
      (= (+ (* a0 a1) a2) 37)
      (= (+ (* b0 b1) b2) 38)
      (= (+ (+ c0 c1) c2) 16)

      ;; Vertical conditions for the puzzle
      (= (+ (- a0 b0) c0) 3)
      (= (+ (- a1 b1) c1) 12)
      (= (+ (- a2 b2) c2) 0)

      ;; And finally, in the puzzle we are told that the top left
      ;; number (a0) is 4.
      (= a0 4))))
```

The result:

```clojure
([[4 9 1]
  [7 5 3]
  [6 8 2]])
```
