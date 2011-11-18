/*
---
description: Manages a smoothly sequential morphing of passed elements
             and of children elements of passed parent element.
             The smoothness spans to options.concurrentialMorphs elements.

authors:
  - Antoine Goutenoir <antoine@goutenoir.com>

licence:
  - lulz

requires:
  - Options
  - Chain
  - Events

provides:
  - SmoothSequentialMorph
...
*/
SmoothSequentialMorph = new Class({

  Implements: [Options, Chain, Events],

  options: {
    //// Provide either this ///////////////////////////////////////////////////////////////////////////////////////////
    // The id of the parent element from which all leafs will be morphed
    parentElementId: '',
    // Exclude elements responding to this css selector (leave empty to exclude none, a good value is '.hidden *')
    excludedCssSelector: '',
    //// Or this ///////////////////////////////////////////////////////////////////////////////////////////////////////
    morphedElements: [],
    //// Common options ////////////////////////////////////////////////////////////////////////////////////////////////
    // Duration of one morph fx
    morphDuration: 500,
    // Number of concurrential morphs at any time (except briefly on start and on complete)
    concurrentialMorphs: 3,
    // Apply these styles to morphed elements before launching chaining
    initialCss: {},
    // No setup on instantiation
    noSetup: false

    // onReady: Function.from
    // onStart: Function.from
    // onComplete: Function.from
  },

  /**
   * There are mandatory options, see above
   * Please note that if you provide both parentElementId and morphedElements, they will be combined without duplicates
   *
   * @param morphProperties See Fx.Morph start() parameter
   * @param options
   */
  initialize: function (morphProperties, options) {
    this.morphProperties = morphProperties;
    this.setOptions(options);

    if (!this.options.noSetup) this.setup();
  },

  setup: function() {
    this.chains = this.createChains();
    this.fireEvent('ready');

    return this;
  },

  /**
   * Gets Elements under the parent element that are eligible for sequential morphing :
   * - leaf-most elements (not containers)
   * - not matching optional excludedCssSelector
   *
   * Adds the elements provided in option morphedElements
   *
   * @return Array
   */
  getMorphingElements: function () {
    var leafMost = [];

    if (this.options.parentElementId != '') {
      var parentElement = document.id (this.options.parentElementId);
      var all = parentElement.getElements('*:not(br)');
      leafMost = all.filter(function(item, index){return (item.getFirst('*:not(br)') == null)});

      if (this.options.excludedCssSelector != '') {
        var excluded = parentElement.getElements(this.options.excludedCssSelector);
        leafMost = leafMost.filter(function(item, index){return !excluded.contains(item)});
      }
    }

    if (this.options.morphedElements.length > 0) {
      leafMost = leafMost.combine(this.options.morphedElements);
    }

    return leafMost;
  },


  getMorphingElementsReorganisedPerChain: function () {
    var allElements = this.getMorphingElements();
    allElements.setStyles(this.options.initialCss);
    var elements = new Array(this.options.concurrentialMorphs);
    for (var i = 0 ; i < this.options.concurrentialMorphs ; i++) {
      elements[i] = new Array();
    }
    allElements.each(function(item, index){
      elements[index%this.options.concurrentialMorphs].push(item);
    }, this);

    return elements;
  },

  /**
   * Creates the concurrential chains, as many as options.concurrentialMorphs
   * Each chain function is the morphing of an element
   */
  createChains: function () {
    var elements = this.getMorphingElementsReorganisedPerChain();
    var chains = new Array(this.options.concurrentialMorphs.toInt());
    var self = this;

    for (var i = 0 ; i < elements.length ; i++) {
      chains[i] = new Chain;
      for (var j = 0 ; j < elements[i].length ; j++) {

        chains[i].chain(function(){

          var i = arguments[0],
              j = arguments[1];

          elements[i][j].set('morph',{
            duration: self.options.morphDuration,
            onComplete: function(){
              this.callChain();
            }.bind(this)
          });

          elements[i][j].morph(self.morphProperties);

        }.bind(chains[i],i,j)); // moo goodness :]

      }
    }

    // Add a callChain to the end of the last chain stack called, so that we can chain this class like a FX
    chains[elements.length%chains.length].chain(function(){
      this.fireEvent('complete');
      this.callChain();
    }.bind(this));

    return chains;
  },

  /**
   * Starts the FX, and fire all the chains with a perfect delay between them
   */
  start: function () {
    this.fireEvent('start');
    for (var i = 0 ; i < this.chains.length ; i++) {
      this.chains[i].callChain.delay(i * this.options.morphDuration / this.chains.length, this.chains[i]);
    }

    return this;
  }

});