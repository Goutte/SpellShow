SpellShow
=========

![Logo](http://github.com/Goutte/SpellShow/raw/master/Docs/spellShow.png)

Explodes a text into letters (spans) and applies chained css transformations.
The transformation 'tip' can be N letters wide. (default is 3)

This can be used to obtain a typewriter like effect,
by making text appear to screen character by character with opacity, with a tip 1 letter wide.

You can manipulate any tweenable css property, see the eye-hurting demo for a better explanation.

Needs Mootools (tested up to 1.4)
Needs SmoothSequentialMorph (provided)

Demo
----

http://jsfiddle.net/goutte/KJZAg/


How to use
----------

HTML

``` html
<p id="text">IN GIRUM IMUS NOCTE ET CONSUMIMUR IGNI</p>
```


JAVASCRIPT

``` javascript

document.id('text').spellShow();

```