/*
---

description: Types text like a typewriter, with the ability to "type" multiple letters at the same time, to smoothen the apparition.

authors:
  - Antoine Goutenoir <antoine@goutenoir.com>

demo:
  - http://jsfiddle.net/goutte/KJZAg/

licence:
  - lulz

requires:
  - SmoothSequentialMorph

provides:
  - SpellShow
  - Element.spellShow

...
*/

SpellShow = new Class({

  Implements: [Options, Chain, Events],

  options: {
    noSetup: false,
    onReady: Function.from,
    onStart: Function.from,
    onComplete: Function.from
  },

  initialize: function (containerId, options) {
    this.container = document.id (containerId);
    this.setOptions(options);
    this.ssm = new SmoothSequentialMorph ({
      opacity: [0,1]
    }, {
      onComplete: this.options.onComplete,
      parentElementId: containerId,
      noSetup: true,
      concurrentialMorphs: 3,
      morphDuration: 150,
      initialCss: {opacity: 0}
    });


    if (!this.options.noSetup) this.setup();
  },

  setup: function() {
    this.explodeElement (this.container);

    this.fireEvent('ready');

    return this;
  },

  explodeElement: function (element) {
    var nextChildElement;
    var childElements = element.getChildren();

    var i = 0;
    nextChildElement = childElements[i++];

    Array.each (element.childNodes, function(node){
      switch (node.nodeType) {

        // TEXT NODE
        case 3:
          this.explodeTextNode(node, element, nextChildElement);
          break;

        // ELEMENT OR DOCUMENT
        case 1:
        case 9:
          nextChildElement = childElements[i++];
          this.explodeElement(node);
          break;

      }
    }.bind(this));
  },

  explodeTextNode: function (textNode, parentElement, nextSiblingElement) {
    var text = textNode.nodeValue;
    // If there is already only one letter (or 0) in the node, drop it
    if (text.length > 1) {
      var span;
      var chars = text.split("");
      Array.each(chars, function(c){
        span = new Element('span');
        span.set('text', c);
        if (typeof nextSiblingElement != 'undefined' && nextSiblingElement != null) {
          span.inject(nextSiblingElement, 'before');
        } else {
          span.inject(parentElement, 'bottom');
        }
      });
      parentElement.removeChild(textNode);
    }
  },



  start: function () {
    this.fireEvent('start');

    this.ssm.setup().start();

    return this;
  }

});



//// ELEMENT METHOD ////////////////////////////////////////////////////////////////////////////////////////////////////

Element.implement({

  spellShow: function (options) {
    if (!this.typewriter) {
      var defaultOptions = {
        // shenanigans !
      };
      this.typewriter = new SpellShow (this, Object.merge(defaultOptions, options));
    } else {
      this.typewriter.setOptions(options);
    }

    this.typewriter.setup().start();

    return this.typewriter;
  }

});