---
layout: article
title: "Using Clojure’s core.logic to Solve Simple Number Puzzles"
---

I’ll start by saying I’m relatively new to the ideas of [Logic Programming](http://en.wikipedia.org/wiki/Logic_programming) and [Declarative Programming](http://en.wikipedia.org/wiki/Declarative_programming) in general, having spent most of my developer life so far writing ([imperative](http://en.wikipedia.org/wiki/Imperative_programming)) PHP code.

The idea of both Logic and Declarative programming paradigms is simple: your job as a developer is to write _what_ results you want your code to give you, rather than _how_ it should go about calculating those results.

I’m going to use Clojure’s [core.logic](https://github.com/clojure/core.logic/wiki) library to run through some very basic examples—I won’t go into how to run the Clojure code—finishing by solving some very basic number puzzles with our new Logic Programming skills.

---

With a fresh [Leiningen](http://leiningen.org/) project, let’s first get hold of core.logic by updating your `project.clj`:

```clojure
:dependencies [[org.clojure/clojure "1.5.1"]
               [org.clojure/core.logic "0.8.7"]]
```

Your `ns` will need to look something like this to pull in core.logic:

```clojure
(ns number-puzzles.core
  (:refer-clojure :exclude [==]) ;; Prevent ns conflict
  (:require [clojure.core.logic :refer :all]))
```

This is what core.logic’s syntax looks like (I recommend reading the [primer](https://github.com/clojure/core.logic/wiki/A-Core.logic-Primer)):

```clojure
(run* [q]
  ;; Logic expressions here
)
```

A core.logic program is written inside a call to `run*`. We also need to give our main _logic variable_ a name, `q` seems to be the convention. This logic variable (or _lvar_) is special: whatever value we give it later will be the output from the program.

Underneath this, our _logic expressions_ will be any number of constraints used to narrow down our set of results.

We could, for example, write a constraint that says the value of `q` must always be 10. For this we’d use core.logic’s _unify_ operator `==`

```clojure
(run* [q]
  (== q 10)) ;; -> (10)
```

Running this will give the result `(10)`. 10 is the only possible value that can satisfy our constraint.

If we added a second constraint stating that `q` must equal 20…

```clojure
(run* [q]
  (== q 10)
  (== q 20)) ;; -> ()
```

…our result list would be empty—no value could be found that satisfies both of our constraints (because no value can be both 10 _and_ 20).

---

In order to describe the logical constraints of our program, we often require more _logic variables_ than just the `q` we start with. For this, we can use core.logic’s `fresh` to create new _lvars_:

```clojure
(run* [q]
  (fresh [a]
    (== a 10)
    (== q a))) ;; -> (10)
```

Here we have two constraints: firstly that `a` must equal the value 10; secondly that the value of `q` must equal the value of `a`. The only value of `q` that can satisfy both these constraints is `10`, so again the output is a list with a single value `(10)`.

---

If we run the following, which _unifies_ our main lvar `q` with a fresh lvar `a`, but makes no further constraints…

```clojure
(run* [q]
  (fresh [a]
    (== q a))) ;; -> (_0)
```

…we’re given the strange output `_0`. This means that our lvar could take on _any_ value, and nothing more specific can be said than that.

---

## Solving a Newspaper Number Puzzle



```clojure
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
