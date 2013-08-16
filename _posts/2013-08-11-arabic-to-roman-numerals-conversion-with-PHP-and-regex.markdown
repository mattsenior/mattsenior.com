---
layout: article
title: Arabic to Roman Numerals Conversion with PHP and Regex
---
During this week’s [CodeKata](http://codekata.pragprog.com/), we were asked to write a tool to convert Arabic numbers (1, 5, 100, etc.) into Roman Numerals (I, V, C, etc.). For those unfamiliar with CodeKata, the point of the exercise is not to find a working solution, but to practice our approaches to problem-solving, pair-programming, and TDD.

As a bit of a running joke once the serious exercise was completed, I tried to solve the problem using regular expressions in PHP. This is written in a single method and is certainly **not** supposed to be an efficient or best-practice way to approach the problem in a production environment.

---

The very first step is to represent the Arabic number using just the numeral `I`, e.g. 1 becomes `I` and 18 becomes `IIIIIIIIIIIIIIIIII`.

If, for a moment, we concern ourselves just with sorting out the numerals `I`, `V`, and `X`, there are two phases of regex replacement that need to be completed:

Phase 1:

-   All occurrences of `IIIII` (5) need to be replaced with `V`;
-   Then, all occurrences of `VV` (10) need to be replaced with `X`;

Phase Two:

-   All remaining occurrences of `IIII` (4) need to be replaced with `IV`;
-   Then, any instances of `VIV` (9) need to be replaced with `IX`;

---

The pattern of replacements in the phases above are exactly the same if we multiply all the numbers by 10.

So, for...        |   1 (`I`) |   5 (`V`) | and   10 (`X`)
it’s the same for |  10 (`X`) |  50 (`L`) | and  100 (`C`)
and the same for  | 100 (`C`) | 500 (`D`) | and 1000 (`M`)

So a pattern emerges that applies to each of these groups of numerals: `IVX`, `XLC`, and `CDM`.

Phase 1 needs to be completed for each of these groups (`IVX`, `XLC`, `CDM`) first, then Phase 2 can be completed for each group afterwards, so that the substitutions are made in the correct order.

---

In the code below, the first `foreach` loop iterates through each of the phases above. The strings in the array each contain four space-separated tokens, representing two find-replace pairs. E.g. `/I{5}/ V` will be used to replace `IIIII` with `V`, and `/V{2}/ X` will be used to replace `VV` with `X`.

The second `foreach` loop iterates through our groups of numerals (each a multiple of 10 greater than the last).

We use `strtr($p, 'IVX', $r)` to translate all the find-replace tokens in the phase to the correct multiple-of-ten group, as the patterns are identical. E.g. the phase `/I{5}/ V /V{2}/ X` will become `/X{5}/ L /L{2}/ C`.

The last step after this translation is to `explode` the space-separated string and feed the tokens into the correct parameters of `preg_replace`.

```php
<?php

namespace Seniorio;

class Numeralizor
{
    public function arabicToRoman($n)
    {
        $n = str_repeat('I', $n);

        foreach (array('/I{5}/ V /V{2}/ X', '/I{4}/ IV /VIV/ IX') as $p) {
            foreach (array('IVX', 'XLC', 'CDM') as $r) {
                $a = explode(' ', strtr($p, 'IVX', $r));
                $n = preg_replace(array($a[0], $a[2]), array($a[1], $a[3]), $n);
            }
        }

        return $n;
    }
}
```

Just a bit of fun. You can find the accompanying 3000-line(!) PhpSpec test on [GitHub](https://github.com/seniorio/roman-numerals).
