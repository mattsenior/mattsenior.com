---
layout: article
title: "Using Clojure’s core.logic to Solve Simple Number Puzzles"
---

I’ll start by saying I’m relatively new to the ideas of [Logic Programming](http://en.wikipedia.org/wiki/Logic_programming) and [Declarative Programming](http://en.wikipedia.org/wiki/Declarative_programming) in general, having spent most of my developer life so far writing ([imperative](http://en.wikipedia.org/wiki/Imperative_programming)) PHP code.

The idea of both Logic and Declarative programming paradigms is simple: your job as a developer is to write _what_ results you want your code to give you, rather than _how_ it should go about calculating those results.

I’m going to use Clojure’s [core.logic](https://github.com/clojure/core.logic/wiki) library to run through some very basic examples—I won’t go into how to run the Clojure code—finishing by solving some very basic number puzzles with our new Logic Programming skills.

---

With a fresh [Leiningen](http://leiningen.org/) project, let’s first get hold of core.logic by updating our `project.clj`:

```clojure
:dependencies [[org.clojure/clojure "1.5.1"]
               [org.clojure/core.logic "0.8.7"]]
```

Our `ns` will need to look something like this to pull in core.logic:

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

Underneath this, our _logic expressions_ will be any number of constraints used to determine what our results are.

We could, for example, write a constraint that says the value of `q` must always be 10. For this we’d use core.logic’s _unify_ operator `==`

```clojure
(run* [q]
  (== q 10)) ;; -> (10)
```

When this program is run, core.logic will return all values that satisfy **all** of the given constraints. Here we’ll have the result `(10)` as 10 is the only possible value that can satisfy our constraint.

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

I recently stumbled upon the following number puzzle in the [i](http://www.independent.co.uk/i/) newspaper, reproduced here for academic purposes!

<img src="/img/2014-02-22-using-clojures-core-logic-to-solve-simple-number-puzzles/number-puzzle.svg" alt="Number puzzle" class="img--center" />

The empty boxes must be filled with the numbers 1–9 to satisfy the horizontal and vertical calculations; each number can only appear once; calculations should be performed left-to-right and top-to-bottom (no [BODMAS](http://en.wikipedia.org/wiki/Order_of_operations)).

The puzzle is simply a set of logical constraints, so rather than thinking about how we would imperatively write an algorithm to solve it, let’s see how we can use Logic Programming to sidestep this entirely.

---

Our first step will be to create all the _lvars_ we’ll need, and set up the output format:

```clojure
(run* [q]

  (fresh [a0 a1 a2  ;; Top row
          b0 b1 b2  ;; Middle row
          c0 c1 c2] ;; Bottom row

    ;; Unify q with our lvars in the output format we want
    (== q [[a0 a1 a2]     ;; Top row
           [b0 b1 b2]     ;; Middle row
           [c0 c1 c2]]))) ;; Bottom row
```

Here you can see we’re unifying `q` with some nested vectors containing our _lvars_, which is how we set up the format of the results. If we run this, we get the following output:

```clojure
([[_0 _1 _2] [_3 _4 _5] [_6 _7 _8]])
```

As we’ve not set up any constraints, we just get nine of the `_0`, `_1`, etc. symbols we saw earlier.

Let’s start adding the rules of the puzzle. Firstly, our values must be in the range 1-9. For this we can use core.logic’s _finite domain_ (FD) tools, which can be found under the `clojure.core.logic.fd` namespace:

```clojure
(ns logic.core
  (:refer-clojure :exclude [==])
  (:require [clojure.core.logic :refer :all])
  (:require [clojure.core.logic.fd :as fd]))
```

Here’s our first constraint:

```clojure
;; State that every one of our lvars should be in the range 1-9
(fd/in a0 a1 a2 b0 b1 b2 c0 c1 c2 (fd/interval 1 9))
```

Next, we need to ensure that each of our _lvars_ contains a different number. Core.logic’s `distinct` does the trick:

```clojure
;; State that each of our lvars should be unique
(fd/distinct [a0 a1 a2 b0 b1 b2 c0 c1 c2])
```

Now we can go ahead and add all of the mathematical constraints. Core.logic has FD operators for this purpose, such as `fd/+`, `fd/-`, `fd/*`, etc., or we can use `fd/eq` which is a helpful macro that lets us write our FD constraints with normal Clojure operators (`+`, `-`, `*`, etc.):

```clojure
(fd/eq
  ;; Horizontal conditions for the puzzle
  (= (- (* a0 a1) a2) 22)
  (= (- (* b0 b1) b2) -1)
  (= (+ (* c0 c1) c2) 72)

  ;; Vertical conditions for the puzzle
  (= (* (+ a0 b0) c0) 25)
  (= (- (- a1 b1) c1) -4)
  (= (+ (* a2 b2) c2) 25)

  ;; And finally, in the puzzle we are told that the top left
  ;; number (a0) is 4.
  (= a0 4))
```

Putting it all together:

```clojure
(ns logic.core
  (:refer-clojure :exclude [==])
  (:require [clojure.core.logic :refer :all])
  (:require [clojure.core.logic.fd :as fd]))

;; Use run* to retrieve all possible solutions
(run* [q]

  ;; Create some new logic vars (lvars) for us to use in our rules
  (fresh [a0 a1 a2  ;; Top row
          b0 b1 b2  ;; Middle row
          c0 c1 c2] ;; Bottom row

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
      (= (- (* a0 a1) a2) 22)
      (= (- (* b0 b1) b2) -1)
      (= (+ (* c0 c1) c2) 72)

      ;; Vertical conditions for the puzzle
      (= (* (+ a0 b0) c0) 25)
      (= (- (- a1 b1) c1) -4)
      (= (+ (* a2 b2) c2) 25)

      ;; And finally, in the puzzle we are told that the top left
      ;; number (a0) is 4.
      (= a0 4))))
```

And here are our results. As you can see, all nine cells now have values, puzzle solved!

```clojure
([[4 6 2]
  [1 7 8]
  [5 3 9]])
```

---

For me, the next direction to take this in will be to look further into use cases for Rich Hickey’s [Datomic](http://www.datomic.com/) database. Datomic uses a Logic Programming language called [Datalog](http://en.wikipedia.org/wiki/Datalog) to query its data, and queries are written as a set of logical constraints against _lvars_ in the same way we’ve just discovered.

Being able to describe the results you want and the constraints of your problem in this manner, and not worrying about the underlying implementation, really is very exciting.
