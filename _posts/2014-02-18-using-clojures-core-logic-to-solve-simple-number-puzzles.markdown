---
layout: article
title: "Using Clojure’s core.logic to Solve Simple Number Puzzles"
---

I’ll start by saying I’m relatively new to the ideas of [Logic Programming](http://en.wikipedia.org/wiki/Logic_programming) and [Declarative Programming](http://en.wikipedia.org/wiki/Declarative_programming) in general, having spent most of my developer life so far writing ([imperative](http://en.wikipedia.org/wiki/Imperative_programming)) PHP code.

The idea of both Logic and Declarative programming paradigms is simple: your job as a developer is to write _what_ results you want your code to give you, rather than _how_ it should go about calculating those results.

I’m going to use Clojure’s [core.logic](https://github.com/clojure/core.logic/wiki) library to run through some very basic examples—I won’t go into how to run the Clojure code, there are plenty of Clojure/Leiningen tutorials available—finishing with one method of solving some very basic number puzzles with our new Logic Programming skills.

---

Let’s first get hold of core.logic by updating your `project.clj`:

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

A core.logic program is written inside a call to `run*`. `[q]` is just giving a name ‘q’ to the _logic variable_ used for output.

Underneath this, your _logic expressions_ will be any number of **constraints** used to narrow down our set of results.

We could, for example, write a constraint that says the value of `q` must always be 10. For this we’d use core.logic’s _unify_ operator `==`

```clojure
(run* [q]
  (== q 10))
```

Running this will give the result `(10)`. 10 is the only possible value that can satisfy our constraint.

If we added a second constraint stating that `q` must equal 20…

```clojure
(run* [q]
  (== q 10)
  (== q 20))
```

…our result list would be empty—no value could be found that satisfies both of our constraints (because no value can be both 10 _and_ 20).




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
