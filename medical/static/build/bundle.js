
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
  'use strict';

  var top = 'top';
  var bottom = 'bottom';
  var right = 'right';
  var left = 'left';
  var auto = 'auto';
  var basePlacements = [top, bottom, right, left];
  var start = 'start';
  var end = 'end';
  var clippingParents = 'clippingParents';
  var viewport = 'viewport';
  var popper = 'popper';
  var reference = 'reference';
  var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []); // modifiers that need to read the DOM

  var beforeRead = 'beforeRead';
  var read = 'read';
  var afterRead = 'afterRead'; // pure-logic modifiers

  var beforeMain = 'beforeMain';
  var main = 'main';
  var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

  var beforeWrite = 'beforeWrite';
  var write = 'write';
  var afterWrite = 'afterWrite';
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

  function getNodeName(element) {
    return element ? (element.nodeName || '').toLowerCase() : null;
  }

  function getWindow(node) {
    if (node == null) {
      return window;
    }

    if (node.toString() !== '[object Window]') {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }

    return node;
  }

  function isElement$1(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }

  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }

  function isShadowRoot(node) {
    // IE 11 has no ShadowRoot
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }

    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // and applies them to the HTMLElements such as popper and arrow

  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function (name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name]; // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      } // Flow doesn't support to extend this property, but it's the most
      // effective way to apply styles to an HTMLElement
      // $FlowFixMe[cannot-write]


      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (name) {
        var value = attributes[name];

        if (value === false) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, value === true ? '' : value);
        }
      });
    });
  }

  function effect$2(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0'
      },
      arrow: {
        position: 'absolute'
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;

    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }

    return function () {
      Object.keys(state.elements).forEach(function (name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

        var style = styleProperties.reduce(function (style, property) {
          style[property] = '';
          return style;
        }, {}); // arrow is optional + virtual elements

        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }

        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  } // eslint-disable-next-line import/no-unused-modules


  var applyStyles$1 = {
    name: 'applyStyles',
    enabled: true,
    phase: 'write',
    fn: applyStyles,
    effect: effect$2,
    requires: ['computeStyles']
  };

  function getBasePlacement(placement) {
    return placement.split('-')[0];
  }

  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  function getBoundingClientRect(element, includeScale) {
    if (includeScale === void 0) {
      includeScale = false;
    }

    var rect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;

    if (isHTMLElement(element) && includeScale) {
      var offsetHeight = element.offsetHeight;
      var offsetWidth = element.offsetWidth; // Do not attempt to divide by 0, otherwise we get `Infinity` as scale
      // Fallback to 1 in case both values are `0`

      if (offsetWidth > 0) {
        scaleX = round(rect.width) / offsetWidth || 1;
      }

      if (offsetHeight > 0) {
        scaleY = round(rect.height) / offsetHeight || 1;
      }
    }

    return {
      width: rect.width / scaleX,
      height: rect.height / scaleY,
      top: rect.top / scaleY,
      right: rect.right / scaleX,
      bottom: rect.bottom / scaleY,
      left: rect.left / scaleX,
      x: rect.left / scaleX,
      y: rect.top / scaleY
    };
  }

  // means it doesn't take into account transforms.

  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
    // Fixes https://github.com/popperjs/popper-core/issues/1223

    var width = element.offsetWidth;
    var height = element.offsetHeight;

    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }

    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }

    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width: width,
      height: height
    };
  }

  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

    if (parent.contains(child)) {
      return true;
    } // then fallback to custom implementation with Shadow DOM support
    else if (rootNode && isShadowRoot(rootNode)) {
        var next = child;

        do {
          if (next && parent.isSameNode(next)) {
            return true;
          } // $FlowFixMe[prop-missing]: need a better way to handle this...


          next = next.parentNode || next.host;
        } while (next);
      } // Give up, the result is false


    return false;
  }

  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }

  function isTableElement(element) {
    return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
  }

  function getDocumentElement(element) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return ((isElement$1(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
    element.document) || window.document).documentElement;
  }

  function getParentNode(element) {
    if (getNodeName(element) === 'html') {
      return element;
    }

    return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || ( // DOM Element detected
      isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element) // fallback

    );
  }

  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle$1(element).position === 'fixed') {
      return null;
    }

    return element.offsetParent;
  } // `.offsetParent` reports `null` for fixed elements, while absolute elements
  // return the containing block


  function getContainingBlock(element) {
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
    var isIE = navigator.userAgent.indexOf('Trident') !== -1;

    if (isIE && isHTMLElement(element)) {
      // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
      var elementCss = getComputedStyle$1(element);

      if (elementCss.position === 'fixed') {
        return null;
      }
    }

    var currentNode = getParentNode(element);

    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }

    while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
      // create a containing block.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

      if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }

    return null;
  } // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.


  function getOffsetParent(element) {
    var window = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);

    while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent);
    }

    if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
      return window;
    }

    return offsetParent || getContainingBlock(element) || window;
  }

  function getMainAxisFromPlacement(placement) {
    return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
  }

  function within(min$1, value, max$1) {
    return max(min$1, min(value, max$1));
  }
  function withinMaxClamp(min, value, max) {
    var v = within(min, value, max);
    return v > max ? max : v;
  }

  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }

  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  function expandToHashMap(value, keys) {
    return keys.reduce(function (hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  var toPaddingObject = function toPaddingObject(padding, state) {
    padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  };

  function arrow(_ref) {
    var _state$modifiersData$;

    var state = _ref.state,
        name = _ref.name,
        options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? 'height' : 'width';

    if (!arrowElement || !popperOffsets) {
      return;
    }

    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === 'y' ? top : left;
    var maxProp = axis === 'y' ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
    var startDiff = popperOffsets[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
    // outside of the popper bounds

    var min = paddingObject[minProp];
    var max = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset = within(min, center, max); // Prevents breaking syntax highlighting...

    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
  }

  function effect$1(_ref2) {
    var state = _ref2.state,
        options = _ref2.options;
    var _options$element = options.element,
        arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

    if (arrowElement == null) {
      return;
    } // CSS selector


    if (typeof arrowElement === 'string') {
      arrowElement = state.elements.popper.querySelector(arrowElement);

      if (!arrowElement) {
        return;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      if (!isHTMLElement(arrowElement)) {
        console.error(['Popper: "arrow" element must be an HTMLElement (not an SVGElement).', 'To use an SVG arrow, wrap it in an HTMLElement that will be used as', 'the arrow.'].join(' '));
      }
    }

    if (!contains(state.elements.popper, arrowElement)) {
      if (process.env.NODE_ENV !== "production") {
        console.error(['Popper: "arrow" modifier\'s `element` must be a child of the popper', 'element.'].join(' '));
      }

      return;
    }

    state.elements.arrow = arrowElement;
  } // eslint-disable-next-line import/no-unused-modules


  var arrow$1 = {
    name: 'arrow',
    enabled: true,
    phase: 'main',
    fn: arrow,
    effect: effect$1,
    requires: ['popperOffsets'],
    requiresIfExists: ['preventOverflow']
  };

  function getVariation(placement) {
    return placement.split('-')[1];
  }

  var unsetSides = {
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto'
  }; // Round the offsets to the nearest suitable subpixel based on the DPR.
  // Zooming can change the DPR, but it seems to report a value that will
  // cleanly divide the values into the appropriate subpixels.

  function roundOffsetsByDPR(_ref) {
    var x = _ref.x,
        y = _ref.y;
    var win = window;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }

  function mapToStyles(_ref2) {
    var _Object$assign2;

    var popper = _ref2.popper,
        popperRect = _ref2.popperRect,
        placement = _ref2.placement,
        variation = _ref2.variation,
        offsets = _ref2.offsets,
        position = _ref2.position,
        gpuAcceleration = _ref2.gpuAcceleration,
        adaptive = _ref2.adaptive,
        roundOffsets = _ref2.roundOffsets,
        isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x,
        x = _offsets$x === void 0 ? 0 : _offsets$x,
        _offsets$y = offsets.y,
        y = _offsets$y === void 0 ? 0 : _offsets$y;

    var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
      x: x,
      y: y
    }) : {
      x: x,
      y: y
    };

    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty('x');
    var hasY = offsets.hasOwnProperty('y');
    var sideX = left;
    var sideY = top;
    var win = window;

    if (adaptive) {
      var offsetParent = getOffsetParent(popper);
      var heightProp = 'clientHeight';
      var widthProp = 'clientWidth';

      if (offsetParent === getWindow(popper)) {
        offsetParent = getDocumentElement(popper);

        if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
          heightProp = 'scrollHeight';
          widthProp = 'scrollWidth';
        }
      } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


      offsetParent = offsetParent;

      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
        offsetParent[heightProp];
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }

      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
        offsetParent[widthProp];
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }

    var commonStyles = Object.assign({
      position: position
    }, adaptive && unsetSides);

    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x: x,
      y: y
    }) : {
      x: x,
      y: y
    };

    x = _ref4.x;
    y = _ref4.y;

    if (gpuAcceleration) {
      var _Object$assign;

      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }

    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
  }

  function computeStyles(_ref5) {
    var state = _ref5.state,
        options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration,
        gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
        _options$adaptive = options.adaptive,
        adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
        _options$roundOffsets = options.roundOffsets,
        roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;

    if (process.env.NODE_ENV !== "production") {
      var transitionProperty = getComputedStyle$1(state.elements.popper).transitionProperty || '';

      if (adaptive && ['transform', 'top', 'right', 'bottom', 'left'].some(function (property) {
        return transitionProperty.indexOf(property) >= 0;
      })) {
        console.warn(['Popper: Detected CSS transitions on at least one of the following', 'CSS properties: "transform", "top", "right", "bottom", "left".', '\n\n', 'Disable the "computeStyles" modifier\'s `adaptive` option to allow', 'for smooth transitions, or remove these properties from the CSS', 'transition declaration on the popper element if only transitioning', 'opacity or background-color for example.', '\n\n', 'We recommend using the popper element as a wrapper around an inner', 'element that can have any CSS property transitioned for animations.'].join(' '));
      }
    }

    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration: gpuAcceleration,
      isFixed: state.options.strategy === 'fixed'
    };

    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive: adaptive,
        roundOffsets: roundOffsets
      })));
    }

    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: 'absolute',
        adaptive: false,
        roundOffsets: roundOffsets
      })));
    }

    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-placement': state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  var computeStyles$1 = {
    name: 'computeStyles',
    enabled: true,
    phase: 'beforeWrite',
    fn: computeStyles,
    data: {}
  };

  var passive = {
    passive: true
  };

  function effect(_ref) {
    var state = _ref.state,
        instance = _ref.instance,
        options = _ref.options;
    var _options$scroll = options.scroll,
        scroll = _options$scroll === void 0 ? true : _options$scroll,
        _options$resize = options.resize,
        resize = _options$resize === void 0 ? true : _options$resize;
    var window = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.addEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.addEventListener('resize', instance.update, passive);
    }

    return function () {
      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.removeEventListener('scroll', instance.update, passive);
        });
      }

      if (resize) {
        window.removeEventListener('resize', instance.update, passive);
      }
    };
  } // eslint-disable-next-line import/no-unused-modules


  var eventListeners = {
    name: 'eventListeners',
    enabled: true,
    phase: 'write',
    fn: function fn() {},
    effect: effect,
    data: {}
  };

  var hash$1 = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash$1[matched];
    });
  }

  var hash = {
    start: 'end',
    end: 'start'
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function (matched) {
      return hash[matched];
    });
  }

  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft: scrollLeft,
      scrollTop: scrollTop
    };
  }

  function getWindowScrollBarX(element) {
    // If <html> has a CSS width greater than the viewport, then this will be
    // incorrect for RTL.
    // Popper 1 is broken in this case and never had a bug report so let's assume
    // it's not an issue. I don't think anyone ever specifies width on <html>
    // anyway.
    // Browsers where the left scrollbar doesn't cause an issue report `0` for
    // this (e.g. Edge 2019, IE11, Safari)
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  function getViewportRect(element) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0; // NB: This isn't supported on iOS <= 12. If the keyboard is open, the popper
    // can be obscured underneath it.
    // Also, `html.clientHeight` adds the bottom bar height in Safari iOS, even
    // if it isn't open, so if this isn't available, the popper will be detected
    // to overflow the bottom of the screen too early.

    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height; // Uses Layout Viewport (like Chrome; Safari does not currently)
      // In Chrome, it returns a value very close to 0 (+/-) but contains rounding
      // errors due to floating point numbers, so we need to check precision.
      // Safari returns a number <= 0, usually < -1 when pinch-zoomed
      // Feature detection fails in mobile emulation mode in Chrome.
      // Math.abs(win.innerWidth / visualViewport.scale - visualViewport.width) <
      // 0.001
      // Fallback here: "Not Safari" userAgent

      if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }

    return {
      width: width,
      height: height,
      x: x + getWindowScrollBarX(element),
      y: y
    };
  }

  // of the `<html>` and `<body>` rect bounds if horizontally scrollable

  function getDocumentRect(element) {
    var _element$ownerDocumen;

    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;

    if (getComputedStyle$1(body || html).direction === 'rtl') {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }

    return {
      width: width,
      height: height,
      x: x,
      y: y
    };
  }

  function isScrollParent(element) {
    // Firefox wants us to check `-x` and `-y` variations as well
    var _getComputedStyle = getComputedStyle$1(element),
        overflow = _getComputedStyle.overflow,
        overflowX = _getComputedStyle.overflowX,
        overflowY = _getComputedStyle.overflowY;

    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  function getScrollParent(node) {
    if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return node.ownerDocument.body;
    }

    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }

    return getScrollParent(getParentNode(node));
  }

  /*
  given a DOM element, return the list of all scroll parents, up the list of ancesors
  until we get to the top window object. This list is what we attach scroll listeners
  to, because if any of these parent elements scroll, we'll need to re-calculate the
  reference element's position.
  */

  function listScrollParents(element, list) {
    var _element$ownerDocumen;

    if (list === void 0) {
      list = [];
    }

    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)));
  }

  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }

  function getInnerBoundingClientRect(element) {
    var rect = getBoundingClientRect(element);
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }

  function getClientRectFromMixedType(element, clippingParent) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element)) : isElement$1(clippingParent) ? getInnerBoundingClientRect(clippingParent) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  } // A "clipping parent" is an overflowable container with the characteristic of
  // clipping (or hiding) overflowing elements with a position different from
  // `initial`


  function getClippingParents(element) {
    var clippingParents = listScrollParents(getParentNode(element));
    var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

    if (!isElement$1(clipperElement)) {
      return [];
    } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


    return clippingParents.filter(function (clippingParent) {
      return isElement$1(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
    });
  } // Gets the maximum area that the element is visible in due to any number of
  // clipping parents


  function getClippingRect(element, boundary, rootBoundary) {
    var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
    var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents[0];
    var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  function computeOffsets(_ref) {
    var reference = _ref.reference,
        element = _ref.element,
        placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference.x + reference.width / 2 - element.width / 2;
    var commonY = reference.y + reference.height / 2 - element.height / 2;
    var offsets;

    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference.y - element.height
        };
        break;

      case bottom:
        offsets = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;

      case right:
        offsets = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;

      case left:
        offsets = {
          x: reference.x - element.width,
          y: commonY
        };
        break;

      default:
        offsets = {
          x: reference.x,
          y: reference.y
        };
    }

    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

    if (mainAxis != null) {
      var len = mainAxis === 'y' ? 'height' : 'width';

      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
          break;

        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
          break;
      }
    }

    return offsets;
  }

  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        _options$placement = _options.placement,
        placement = _options$placement === void 0 ? state.placement : _options$placement,
        _options$boundary = _options.boundary,
        boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
        _options$rootBoundary = _options.rootBoundary,
        rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
        _options$elementConte = _options.elementContext,
        elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
        _options$altBoundary = _options.altBoundary,
        altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
        _options$padding = _options.padding,
        padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement$1(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: 'absolute',
      placement: placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
    // 0 or negative = within the clipping rect

    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

    if (elementContext === popper && offsetData) {
      var offset = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function (key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
        overflowOffsets[key] += offset[axis] * multiply;
      });
    }

    return overflowOffsets;
  }

  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        placement = _options.placement,
        boundary = _options.boundary,
        rootBoundary = _options.rootBoundary,
        padding = _options.padding,
        flipVariations = _options.flipVariations,
        _options$allowedAutoP = _options.allowedAutoPlacements,
        allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
      return getVariation(placement) === variation;
    }) : basePlacements;
    var allowedPlacements = placements$1.filter(function (placement) {
      return allowedAutoPlacements.indexOf(placement) >= 0;
    });

    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;

      if (process.env.NODE_ENV !== "production") {
        console.error(['Popper: The `allowedAutoPlacements` option did not allow any', 'placements. Ensure the `placement` option matches the variation', 'of the allowed placements.', 'For example, "auto" cannot be used to allow "bottom-start".', 'Use "auto-start" instead.'].join(' '));
      }
    } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


    var overflows = allowedPlacements.reduce(function (acc, placement) {
      acc[placement] = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding
      })[getBasePlacement(placement)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function (a, b) {
      return overflows[a] - overflows[b];
    });
  }

  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }

    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }

  function flip(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;

    if (state.modifiersData[name]._skip) {
      return;
    }

    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
        specifiedFallbackPlacements = options.fallbackPlacements,
        padding = options.padding,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        _options$flipVariatio = options.flipVariations,
        flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
        allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
      return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        flipVariations: flipVariations,
        allowedAutoPlacements: allowedAutoPlacements
      }) : placement);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements[0];

    for (var i = 0; i < placements.length; i++) {
      var placement = placements[i];

      var _basePlacement = getBasePlacement(placement);

      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? 'width' : 'height';
      var overflow = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        altBoundary: altBoundary,
        padding: padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }

      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];

      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }

      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }

      if (checks.every(function (check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }

      checksMap.set(placement, checks);
    }

    if (makeFallbackChecks) {
      // `2` may be desired in some cases – research later
      var numberOfChecks = flipVariations ? 3 : 1;

      var _loop = function _loop(_i) {
        var fittingPlacement = placements.find(function (placement) {
          var checks = checksMap.get(placement);

          if (checks) {
            return checks.slice(0, _i).every(function (check) {
              return check;
            });
          }
        });

        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };

      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);

        if (_ret === "break") break;
      }
    }

    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  } // eslint-disable-next-line import/no-unused-modules


  var flip$1 = {
    name: 'flip',
    enabled: true,
    phase: 'main',
    fn: flip,
    requiresIfExists: ['offset'],
    data: {
      _skip: false
    }
  };

  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }

    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }

  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function (side) {
      return overflow[side] >= 0;
    });
  }

  function hide(_ref) {
    var state = _ref.state,
        name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: 'reference'
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets: referenceClippingOffsets,
      popperEscapeOffsets: popperEscapeOffsets,
      isReferenceHidden: isReferenceHidden,
      hasPopperEscaped: hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-reference-hidden': isReferenceHidden,
      'data-popper-escaped': hasPopperEscaped
    });
  } // eslint-disable-next-line import/no-unused-modules


  var hide$1 = {
    name: 'hide',
    enabled: true,
    phase: 'main',
    requiresIfExists: ['preventOverflow'],
    fn: hide
  };

  function distanceAndSkiddingToXY(placement, rects, offset) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

    var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
      placement: placement
    })) : offset,
        skidding = _ref[0],
        distance = _ref[1];

    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }

  function offset(_ref2) {
    var state = _ref2.state,
        options = _ref2.options,
        name = _ref2.name;
    var _options$offset = options.offset,
        offset = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function (acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement],
        x = _data$state$placement.x,
        y = _data$state$placement.y;

    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  var offset$1 = {
    name: 'offset',
    enabled: true,
    phase: 'main',
    requires: ['popperOffsets'],
    fn: offset
  };

  function popperOffsets(_ref) {
    var state = _ref.state,
        name = _ref.name;
    // Offsets are the actual position the popper needs to have to be
    // properly positioned near its reference element
    // This is the most basic placement, and will be adjusted by
    // the modifiers in the next step
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: 'absolute',
      placement: state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  var popperOffsets$1 = {
    name: 'popperOffsets',
    enabled: true,
    phase: 'read',
    fn: popperOffsets,
    data: {}
  };

  function getAltAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }

  function preventOverflow(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;
    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        padding = options.padding,
        _options$tether = options.tether,
        tether = _options$tether === void 0 ? true : _options$tether,
        _options$tetherOffset = options.tetherOffset,
        tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      altBoundary: altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };

    if (!popperOffsets) {
      return;
    }

    if (checkMainAxis) {
      var _offsetModifierState$;

      var mainSide = mainAxis === 'y' ? top : left;
      var altSide = mainAxis === 'y' ? bottom : right;
      var len = mainAxis === 'y' ? 'height' : 'width';
      var offset = popperOffsets[mainAxis];
      var min$1 = offset + overflow[mainSide];
      var max$1 = offset - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
      // outside the reference bounds

      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
      // to include its full size in the calculation. If the reference is small
      // and near the edge of a boundary, the popper can overflow even if the
      // reference is not overflowing as well (e.g. virtual elements with no
      // width or height)

      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
      popperOffsets[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset;
    }

    if (checkAltAxis) {
      var _offsetModifierState$2;

      var _mainSide = mainAxis === 'x' ? top : left;

      var _altSide = mainAxis === 'x' ? bottom : right;

      var _offset = popperOffsets[altAxis];

      var _len = altAxis === 'y' ? 'height' : 'width';

      var _min = _offset + overflow[_mainSide];

      var _max = _offset - overflow[_altSide];

      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

      popperOffsets[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  var preventOverflow$1 = {
    name: 'preventOverflow',
    enabled: true,
    phase: 'main',
    fn: preventOverflow,
    requiresIfExists: ['offset']
  };

  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }

  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  } // Returns the composite rect of an element relative to its offsetParent.
  // Composite means it takes into account transforms as well as layout.


  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }

    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };

    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }

      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }

    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  function order(modifiers) {
    var map = new Map();
    var visited = new Set();
    var result = [];
    modifiers.forEach(function (modifier) {
      map.set(modifier.name, modifier);
    }); // On visiting object, check for its dependencies and visit them recursively

    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function (dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);

          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }

    modifiers.forEach(function (modifier) {
      if (!visited.has(modifier.name)) {
        // check for visited object
        sort(modifier);
      }
    });
    return result;
  }

  function orderModifiers(modifiers) {
    // order based on dependencies
    var orderedModifiers = order(modifiers); // order based on phase

    return modifierPhases.reduce(function (acc, phase) {
      return acc.concat(orderedModifiers.filter(function (modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }

  function debounce(fn) {
    var pending;
    return function () {
      if (!pending) {
        pending = new Promise(function (resolve) {
          Promise.resolve().then(function () {
            pending = undefined;
            resolve(fn());
          });
        });
      }

      return pending;
    };
  }

  function format(str) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return [].concat(args).reduce(function (p, c) {
      return p.replace(/%s/, c);
    }, str);
  }

  var INVALID_MODIFIER_ERROR = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s';
  var MISSING_DEPENDENCY_ERROR = 'Popper: modifier "%s" requires "%s", but "%s" modifier is not available';
  var VALID_PROPERTIES = ['name', 'enabled', 'phase', 'fn', 'effect', 'requires', 'options'];
  function validateModifiers(modifiers) {
    modifiers.forEach(function (modifier) {
      [].concat(Object.keys(modifier), VALID_PROPERTIES) // IE11-compatible replacement for `new Set(iterable)`
      .filter(function (value, index, self) {
        return self.indexOf(value) === index;
      }).forEach(function (key) {
        switch (key) {
          case 'name':
            if (typeof modifier.name !== 'string') {
              console.error(format(INVALID_MODIFIER_ERROR, String(modifier.name), '"name"', '"string"', "\"" + String(modifier.name) + "\""));
            }

            break;

          case 'enabled':
            if (typeof modifier.enabled !== 'boolean') {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"enabled"', '"boolean"', "\"" + String(modifier.enabled) + "\""));
            }

            break;

          case 'phase':
            if (modifierPhases.indexOf(modifier.phase) < 0) {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"phase"', "either " + modifierPhases.join(', '), "\"" + String(modifier.phase) + "\""));
            }

            break;

          case 'fn':
            if (typeof modifier.fn !== 'function') {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"fn"', '"function"', "\"" + String(modifier.fn) + "\""));
            }

            break;

          case 'effect':
            if (modifier.effect != null && typeof modifier.effect !== 'function') {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"effect"', '"function"', "\"" + String(modifier.fn) + "\""));
            }

            break;

          case 'requires':
            if (modifier.requires != null && !Array.isArray(modifier.requires)) {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requires"', '"array"', "\"" + String(modifier.requires) + "\""));
            }

            break;

          case 'requiresIfExists':
            if (!Array.isArray(modifier.requiresIfExists)) {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requiresIfExists"', '"array"', "\"" + String(modifier.requiresIfExists) + "\""));
            }

            break;

          case 'options':
          case 'data':
            break;

          default:
            console.error("PopperJS: an invalid property has been provided to the \"" + modifier.name + "\" modifier, valid properties are " + VALID_PROPERTIES.map(function (s) {
              return "\"" + s + "\"";
            }).join(', ') + "; but \"" + key + "\" was provided.");
        }

        modifier.requires && modifier.requires.forEach(function (requirement) {
          if (modifiers.find(function (mod) {
            return mod.name === requirement;
          }) == null) {
            console.error(format(MISSING_DEPENDENCY_ERROR, String(modifier.name), requirement, requirement));
          }
        });
      });
    });
  }

  function uniqueBy(arr, fn) {
    var identifiers = new Set();
    return arr.filter(function (item) {
      var identifier = fn(item);

      if (!identifiers.has(identifier)) {
        identifiers.add(identifier);
        return true;
      }
    });
  }

  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function (merged, current) {
      var existing = merged[current.name];
      merged[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged;
    }, {}); // IE11 does not support Object.values

    return Object.keys(merged).map(function (key) {
      return merged[key];
    });
  }

  var INVALID_ELEMENT_ERROR = 'Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.';
  var INFINITE_LOOP_ERROR = 'Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.';
  var DEFAULT_OPTIONS = {
    placement: 'bottom',
    modifiers: [],
    strategy: 'absolute'
  };

  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return !args.some(function (element) {
      return !(element && typeof element.getBoundingClientRect === 'function');
    });
  }

  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }

    var _generatorOptions = generatorOptions,
        _generatorOptions$def = _generatorOptions.defaultModifiers,
        defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
        _generatorOptions$def2 = _generatorOptions.defaultOptions,
        defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper(reference, popper, options) {
      if (options === void 0) {
        options = defaultOptions;
      }

      var state = {
        placement: 'bottom',
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference,
          popper: popper
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state: state,
        setOptions: function setOptions(setOptionsAction) {
          var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options);
          state.scrollParents = {
            reference: isElement$1(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
            popper: listScrollParents(popper)
          }; // Orders the modifiers based on their dependencies and `phase`
          // properties

          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

          state.orderedModifiers = orderedModifiers.filter(function (m) {
            return m.enabled;
          }); // Validate the provided modifiers so that the consumer will get warned
          // if one of the modifiers is invalid for any reason

          if (process.env.NODE_ENV !== "production") {
            var modifiers = uniqueBy([].concat(orderedModifiers, state.options.modifiers), function (_ref) {
              var name = _ref.name;
              return name;
            });
            validateModifiers(modifiers);

            if (getBasePlacement(state.options.placement) === auto) {
              var flipModifier = state.orderedModifiers.find(function (_ref2) {
                var name = _ref2.name;
                return name === 'flip';
              });

              if (!flipModifier) {
                console.error(['Popper: "auto" placements require the "flip" modifier be', 'present and enabled to work.'].join(' '));
              }
            }

            var _getComputedStyle = getComputedStyle$1(popper),
                marginTop = _getComputedStyle.marginTop,
                marginRight = _getComputedStyle.marginRight,
                marginBottom = _getComputedStyle.marginBottom,
                marginLeft = _getComputedStyle.marginLeft; // We no longer take into account `margins` on the popper, and it can
            // cause bugs with positioning, so we'll warn the consumer


            if ([marginTop, marginRight, marginBottom, marginLeft].some(function (margin) {
              return parseFloat(margin);
            })) {
              console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', 'between the popper and its reference element or boundary.', 'To replicate margin, use the `offset` modifier, as well as', 'the `padding` option in the `preventOverflow` and `flip`', 'modifiers.'].join(' '));
            }
          }

          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }

          var _state$elements = state.elements,
              reference = _state$elements.reference,
              popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
          // anymore

          if (!areValidElements(reference, popper)) {
            if (process.env.NODE_ENV !== "production") {
              console.error(INVALID_ELEMENT_ERROR);
            }

            return;
          } // Store the reference and popper rects to be read by modifiers


          state.rects = {
            reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
            popper: getLayoutRect(popper)
          }; // Modifiers have the ability to reset the current update cycle. The
          // most common use case for this is the `flip` modifier changing the
          // placement, which then needs to re-run all the modifiers, because the
          // logic was previously ran for the previous placement and is therefore
          // stale/incorrect

          state.reset = false;
          state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
          // is filled with the initial data specified by the modifier. This means
          // it doesn't persist and is fresh on each update.
          // To ensure persistent data, use `${name}#persistent`

          state.orderedModifiers.forEach(function (modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          var __debug_loops__ = 0;

          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (process.env.NODE_ENV !== "production") {
              __debug_loops__ += 1;

              if (__debug_loops__ > 100) {
                console.error(INFINITE_LOOP_ERROR);
                break;
              }
            }

            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }

            var _state$orderedModifie = state.orderedModifiers[index],
                fn = _state$orderedModifie.fn,
                _state$orderedModifie2 = _state$orderedModifie.options,
                _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
                name = _state$orderedModifie.name;

            if (typeof fn === 'function') {
              state = fn({
                state: state,
                options: _options,
                name: name,
                instance: instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function () {
          return new Promise(function (resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };

      if (!areValidElements(reference, popper)) {
        if (process.env.NODE_ENV !== "production") {
          console.error(INVALID_ELEMENT_ERROR);
        }

        return instance;
      }

      instance.setOptions(options).then(function (state) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state);
        }
      }); // Modifiers have the ability to execute arbitrary code before the first
      // update cycle runs. They will be executed in the same order as the update
      // cycle. This is useful when a modifier adds some persistent data that
      // other modifiers need to use, but the modifier is run after the dependent
      // one.

      function runModifierEffects() {
        state.orderedModifiers.forEach(function (_ref3) {
          var name = _ref3.name,
              _ref3$options = _ref3.options,
              options = _ref3$options === void 0 ? {} : _ref3$options,
              effect = _ref3.effect;

          if (typeof effect === 'function') {
            var cleanupFn = effect({
              state: state,
              name: name,
              instance: instance,
              options: options
            });

            var noopFn = function noopFn() {};

            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }

      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function (fn) {
          return fn();
        });
        effectCleanupFns = [];
      }

      return instance;
    };
  }
  var createPopper$2 = /*#__PURE__*/popperGenerator(); // eslint-disable-next-line import/no-unused-modules

  var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
  var createPopper$1 = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers$1
  }); // eslint-disable-next-line import/no-unused-modules

  var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
  var createPopper = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers
  }); // eslint-disable-next-line import/no-unused-modules

  var Popper = /*#__PURE__*/Object.freeze({
    __proto__: null,
    popperGenerator: popperGenerator,
    detectOverflow: detectOverflow,
    createPopperBase: createPopper$2,
    createPopper: createPopper,
    createPopperLite: createPopper$1,
    top: top,
    bottom: bottom,
    right: right,
    left: left,
    auto: auto,
    basePlacements: basePlacements,
    start: start,
    end: end,
    clippingParents: clippingParents,
    viewport: viewport,
    popper: popper,
    reference: reference,
    variationPlacements: variationPlacements,
    placements: placements,
    beforeRead: beforeRead,
    read: read,
    afterRead: afterRead,
    beforeMain: beforeMain,
    main: main,
    afterMain: afterMain,
    beforeWrite: beforeWrite,
    write: write,
    afterWrite: afterWrite,
    modifierPhases: modifierPhases,
    applyStyles: applyStyles$1,
    arrow: arrow$1,
    computeStyles: computeStyles$1,
    eventListeners: eventListeners,
    flip: flip$1,
    hide: hide$1,
    offset: offset$1,
    popperOffsets: popperOffsets$1,
    preventOverflow: preventOverflow$1
  });

  /*!
    * Bootstrap v5.1.3 (https://getbootstrap.com/)
    * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const MAX_UID = 1000000;
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend'; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  const toType = obj => {
    if (obj === null || obj === undefined) {
      return `${obj}`;
    }

    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
  };
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */


  const getUID = prefix => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));

    return prefix;
  };

  const getSelector = element => {
    let selector = element.getAttribute('data-bs-target');

    if (!selector || selector === '#') {
      let hrefAttr = element.getAttribute('href'); // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273

      if (!hrefAttr || !hrefAttr.includes('#') && !hrefAttr.startsWith('.')) {
        return null;
      } // Just in case some CMS puts out a full URL with the anchor appended


      if (hrefAttr.includes('#') && !hrefAttr.startsWith('#')) {
        hrefAttr = `#${hrefAttr.split('#')[1]}`;
      }

      selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : null;
    }

    return selector;
  };

  const getSelectorFromElement = element => {
    const selector = getSelector(element);

    if (selector) {
      return document.querySelector(selector) ? selector : null;
    }

    return null;
  };

  const getElementFromSelector = element => {
    const selector = getSelector(element);
    return selector ? document.querySelector(selector) : null;
  };

  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    } // Get transition-duration of the element


    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    } // If multiple durations are defined, take the first


    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };

  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };

  const isElement = obj => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (typeof obj.jquery !== 'undefined') {
      obj = obj[0];
    }

    return typeof obj.nodeType !== 'undefined';
  };

  const getElement = obj => {
    if (isElement(obj)) {
      // it's a jQuery object or a node element
      return obj.jquery ? obj[0] : obj;
    }

    if (typeof obj === 'string' && obj.length > 0) {
      return document.querySelector(obj);
    }

    return null;
  };

  const typeCheckConfig = (componentName, config, configTypes) => {
    Object.keys(configTypes).forEach(property => {
      const expectedTypes = configTypes[property];
      const value = config[property];
      const valueType = value && isElement(value) ? 'element' : toType(value);

      if (!new RegExp(expectedTypes).test(valueType)) {
        throw new TypeError(`${componentName.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
      }
    });
  };

  const isVisible = element => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }

    return getComputedStyle(element).getPropertyValue('visibility') === 'visible';
  };

  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }

    if (element.classList.contains('disabled')) {
      return true;
    }

    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }

    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };

  const findShadowRoot = element => {
    if (!document.documentElement.attachShadow) {
      return null;
    } // Can find the shadow root otherwise it'll return the document


    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }

    if (element instanceof ShadowRoot) {
      return element;
    } // when we don't find a shadow root


    if (!element.parentNode) {
      return null;
    }

    return findShadowRoot(element.parentNode);
  };

  const noop$1 = () => {};
  /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */


  const reflow = element => {
    // eslint-disable-next-line no-unused-expressions
    element.offsetHeight;
  };

  const getjQuery = () => {
    const {
      jQuery
    } = window;

    if (jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return jQuery;
    }

    return null;
  };

  const DOMContentLoadedCallbacks = [];

  const onDOMContentLoaded = callback => {
    if (document.readyState === 'loading') {
      // add listener on the first call when the document is in loading state
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener('DOMContentLoaded', () => {
          DOMContentLoadedCallbacks.forEach(callback => callback());
        });
      }

      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };

  const isRTL = () => document.documentElement.dir === 'rtl';

  const defineJQueryPlugin = plugin => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      /* istanbul ignore if */

      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;

        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };

  const execute = callback => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }

    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;

    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }

      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };

    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };
  /**
   * Return the previous/next element of a list.
   *
   * @param {array} list    The list of elements
   * @param activeElement   The active element
   * @param shouldGetNext   Choose to get next or previous element
   * @param isCycleAllowed
   * @return {Element|elem} The proper element
   */


  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    let index = list.indexOf(activeElement); // if the element does not exist in the list return an element depending on the direction and if cycle is allowed

    if (index === -1) {
      return list[!shouldGetNext && isCycleAllowed ? list.length - 1 : 0];
    }

    const listLength = list.length;
    index += shouldGetNext ? 1 : -1;

    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }

    return list[Math.max(0, Math.min(index, listLength - 1))];
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {}; // Events storage

  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const customEventsRegex = /^(mouseenter|mouseleave)/i;
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);
  /**
   * ------------------------------------------------------------------------
   * Private methods
   * ------------------------------------------------------------------------
   */

  function getUidEvent(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }

  function getEvent(element) {
    const uid = getUidEvent(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }

  function bootstrapHandler(element, fn) {
    return function handler(event) {
      event.delegateTarget = element;

      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }

      return fn.apply(element, [event]);
    };
  }

  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);

      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (let i = domElements.length; i--;) {
          if (domElements[i] === target) {
            event.delegateTarget = target;

            if (handler.oneOff) {
              EventHandler.off(element, event.type, selector, fn);
            }

            return fn.apply(target, [event]);
          }
        }
      } // To please ESLint


      return null;
    };
  }

  function findHandler(events, handler, delegationSelector = null) {
    const uidEventList = Object.keys(events);

    for (let i = 0, len = uidEventList.length; i < len; i++) {
      const event = events[uidEventList[i]];

      if (event.originalHandler === handler && event.delegationSelector === delegationSelector) {
        return event;
      }
    }

    return null;
  }

  function normalizeParams(originalTypeEvent, handler, delegationFn) {
    const delegation = typeof handler === 'string';
    const originalHandler = delegation ? delegationFn : handler;
    let typeEvent = getTypeEvent(originalTypeEvent);
    const isNative = nativeEvents.has(typeEvent);

    if (!isNative) {
      typeEvent = originalTypeEvent;
    }

    return [delegation, originalHandler, typeEvent];
  }

  function addHandler(element, originalTypeEvent, handler, delegationFn, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }

    if (!handler) {
      handler = delegationFn;
      delegationFn = null;
    } // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does


    if (customEventsRegex.test(originalTypeEvent)) {
      const wrapFn = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };

      if (delegationFn) {
        delegationFn = wrapFn(delegationFn);
      } else {
        handler = wrapFn(handler);
      }
    }

    const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
    const events = getEvent(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFn = findHandler(handlers, originalHandler, delegation ? handler : null);

    if (previousFn) {
      previousFn.oneOff = previousFn.oneOff && oneOff;
      return;
    }

    const uid = getUidEvent(originalHandler, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = delegation ? bootstrapDelegationHandler(element, handler, delegationFn) : bootstrapHandler(element, handler);
    fn.delegationSelector = delegation ? handler : null;
    fn.originalHandler = originalHandler;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, delegation);
  }

  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);

    if (!fn) {
      return;
    }

    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }

  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    Object.keys(storeElementEvent).forEach(handlerKey => {
      if (handlerKey.includes(namespace)) {
        const event = storeElementEvent[handlerKey];
        removeHandler(element, events, typeEvent, event.originalHandler, event.delegationSelector);
      }
    });
  }

  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }

  const EventHandler = {
    on(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, false);
    },

    one(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, true);
    },

    off(element, originalTypeEvent, handler, delegationFn) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }

      const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getEvent(element);
      const isNamespace = originalTypeEvent.startsWith('.');

      if (typeof originalHandler !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!events || !events[typeEvent]) {
          return;
        }

        removeHandler(element, events, typeEvent, originalHandler, delegation ? handler : null);
        return;
      }

      if (isNamespace) {
        Object.keys(events).forEach(elementEvent => {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        });
      }

      const storeElementEvent = events[typeEvent] || {};
      Object.keys(storeElementEvent).forEach(keyHandlers => {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');

        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          const event = storeElementEvent[keyHandlers];
          removeHandler(element, events, typeEvent, event.originalHandler, event.delegationSelector);
        }
      });
    },

    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }

      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      const isNative = nativeEvents.has(typeEvent);
      let jQueryEvent;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      let evt = null;

      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }

      if (isNative) {
        evt = document.createEvent('HTMLEvents');
        evt.initEvent(typeEvent, bubbles, true);
      } else {
        evt = new CustomEvent(event, {
          bubbles,
          cancelable: true
        });
      } // merge custom information in our event


      if (typeof args !== 'undefined') {
        Object.keys(args).forEach(key => {
          Object.defineProperty(evt, key, {
            get() {
              return args[key];
            }

          });
        });
      }

      if (defaultPrevented) {
        evt.preventDefault();
      }

      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }

      if (evt.defaultPrevented && typeof jQueryEvent !== 'undefined') {
        jQueryEvent.preventDefault();
      }

      return evt;
    }

  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  const elementMap = new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }

      const instanceMap = elementMap.get(element); // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used

      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }

      instanceMap.set(key, instance);
    },

    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }

      return null;
    },

    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }

      const instanceMap = elementMap.get(element);
      instanceMap.delete(key); // free up element references if there are no instances left for an element

      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }

  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const VERSION = '5.1.3';

  class BaseComponent {
    constructor(element) {
      element = getElement(element);

      if (!element) {
        return;
      }

      this._element = element;
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }

    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      Object.getOwnPropertyNames(this).forEach(propertyName => {
        this[propertyName] = null;
      });
    }

    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    /** Static */


    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }

    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }

    static get VERSION() {
      return VERSION;
    }

    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }

    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }

    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const enableDismissTrigger = (component, method = 'hide') => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }

      if (isDisabled(this)) {
        return;
      }

      const target = getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target); // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method

      instance[method]();
    });
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$d = 'alert';
  const DATA_KEY$c = 'bs.alert';
  const EVENT_KEY$c = `.${DATA_KEY$c}`;
  const EVENT_CLOSE = `close${EVENT_KEY$c}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$c}`;
  const CLASS_NAME_FADE$5 = 'fade';
  const CLASS_NAME_SHOW$8 = 'show';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Alert extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$d;
    } // Public


    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);

      if (closeEvent.defaultPrevented) {
        return;
      }

      this._element.classList.remove(CLASS_NAME_SHOW$8);

      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);

      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    } // Private


    _destroyElement() {
      this._element.remove();

      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Alert.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  enableDismissTrigger(Alert, 'close');
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Alert to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Alert);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): button.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$c = 'button';
  const DATA_KEY$b = 'bs.button';
  const EVENT_KEY$b = `.${DATA_KEY$b}`;
  const DATA_API_KEY$7 = '.data-api';
  const CLASS_NAME_ACTIVE$3 = 'active';
  const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$b}${DATA_API_KEY$7}`;
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Button extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$c;
    } // Public


    toggle() {
      // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
      this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Button.getOrCreateInstance(this);

        if (config === 'toggle') {
          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Button to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Button);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  function normalizeData(val) {
    if (val === 'true') {
      return true;
    }

    if (val === 'false') {
      return false;
    }

    if (val === Number(val).toString()) {
      return Number(val);
    }

    if (val === '' || val === 'null') {
      return null;
    }

    return val;
  }

  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }

  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },

    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },

    getDataAttributes(element) {
      if (!element) {
        return {};
      }

      const attributes = {};
      Object.keys(element.dataset).filter(key => key.startsWith('bs')).forEach(key => {
        let pureKey = key.replace(/^bs/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      });
      return attributes;
    },

    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    },

    offset(element) {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      };
    },

    position(element) {
      return {
        top: element.offsetTop,
        left: element.offsetLeft
      };
    }

  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const NODE_TEXT = 3;
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },

    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },

    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector));
    },

    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode;

      while (ancestor && ancestor.nodeType === Node.ELEMENT_NODE && ancestor.nodeType !== NODE_TEXT) {
        if (ancestor.matches(selector)) {
          parents.push(ancestor);
        }

        ancestor = ancestor.parentNode;
      }

      return parents;
    },

    prev(element, selector) {
      let previous = element.previousElementSibling;

      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }

        previous = previous.previousElementSibling;
      }

      return [];
    },

    next(element, selector) {
      let next = element.nextElementSibling;

      while (next) {
        if (next.matches(selector)) {
          return [next];
        }

        next = next.nextElementSibling;
      }

      return [];
    },

    focusableChildren(element) {
      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(', ');
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    }

  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): carousel.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$b = 'carousel';
  const DATA_KEY$a = 'bs.carousel';
  const EVENT_KEY$a = `.${DATA_KEY$a}`;
  const DATA_API_KEY$6 = '.data-api';
  const ARROW_LEFT_KEY = 'ArrowLeft';
  const ARROW_RIGHT_KEY = 'ArrowRight';
  const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  const SWIPE_THRESHOLD = 40;
  const Default$a = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: 'hover',
    wrap: true,
    touch: true
  };
  const DefaultType$a = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    slide: '(boolean|string)',
    pause: '(string|boolean)',
    wrap: 'boolean',
    touch: 'boolean'
  };
  const ORDER_NEXT = 'next';
  const ORDER_PREV = 'prev';
  const DIRECTION_LEFT = 'left';
  const DIRECTION_RIGHT = 'right';
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY]: DIRECTION_LEFT
  };
  const EVENT_SLIDE = `slide${EVENT_KEY$a}`;
  const EVENT_SLID = `slid${EVENT_KEY$a}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$a}`;
  const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY$a}`;
  const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY$a}`;
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$a}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$a}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$a}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$a}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$a}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$a}`;
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$a}${DATA_API_KEY$6}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
  const CLASS_NAME_CAROUSEL = 'carousel';
  const CLASS_NAME_ACTIVE$2 = 'active';
  const CLASS_NAME_SLIDE = 'slide';
  const CLASS_NAME_END = 'carousel-item-end';
  const CLASS_NAME_START = 'carousel-item-start';
  const CLASS_NAME_NEXT = 'carousel-item-next';
  const CLASS_NAME_PREV = 'carousel-item-prev';
  const CLASS_NAME_POINTER_EVENT = 'pointer-event';
  const SELECTOR_ACTIVE$1 = '.active';
  const SELECTOR_ACTIVE_ITEM = '.active.carousel-item';
  const SELECTOR_ITEM = '.carousel-item';
  const SELECTOR_ITEM_IMG = '.carousel-item img';
  const SELECTOR_NEXT_PREV = '.carousel-item-next, .carousel-item-prev';
  const SELECTOR_INDICATORS = '.carousel-indicators';
  const SELECTOR_INDICATOR = '[data-bs-target]';
  const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
  const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  const POINTER_TYPE_TOUCH = 'touch';
  const POINTER_TYPE_PEN = 'pen';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Carousel extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._items = null;
      this._interval = null;
      this._activeElement = null;
      this._isPaused = false;
      this._isSliding = false;
      this.touchTimeout = null;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this._config = this._getConfig(config);
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._touchSupported = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
      this._pointerEvent = Boolean(window.PointerEvent);

      this._addEventListeners();
    } // Getters


    static get Default() {
      return Default$a;
    }

    static get NAME() {
      return NAME$b;
    } // Public


    next() {
      this._slide(ORDER_NEXT);
    }

    nextWhenVisible() {
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }

    prev() {
      this._slide(ORDER_PREV);
    }

    pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if (SelectorEngine.findOne(SELECTOR_NEXT_PREV, this._element)) {
        triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    }

    cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config && this._config.interval && !this._isPaused) {
        this._updateInterval();

        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
      }
    }

    to(index) {
      this._activeElement = SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);

      const activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;

      this._slide(order, this._items[index]);
    } // Private


    _getConfig(config) {
      config = { ...Default$a,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$b, config, DefaultType$a);
      return config;
    }

    _handleSwipe() {
      const absDeltax = Math.abs(this.touchDeltaX);

      if (absDeltax <= SWIPE_THRESHOLD) {
        return;
      }

      const direction = absDeltax / this.touchDeltaX;
      this.touchDeltaX = 0;

      if (!direction) {
        return;
      }

      this._slide(direction > 0 ? DIRECTION_RIGHT : DIRECTION_LEFT);
    }

    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
      }

      if (this._config.pause === 'hover') {
        EventHandler.on(this._element, EVENT_MOUSEENTER, event => this.pause(event));
        EventHandler.on(this._element, EVENT_MOUSELEAVE, event => this.cycle(event));
      }

      if (this._config.touch && this._touchSupported) {
        this._addTouchEventListeners();
      }
    }

    _addTouchEventListeners() {
      const hasPointerPenTouch = event => {
        return this._pointerEvent && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
      };

      const start = event => {
        if (hasPointerPenTouch(event)) {
          this.touchStartX = event.clientX;
        } else if (!this._pointerEvent) {
          this.touchStartX = event.touches[0].clientX;
        }
      };

      const move = event => {
        // ensure swiping with one touch and not pinching
        this.touchDeltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this.touchStartX;
      };

      const end = event => {
        if (hasPointerPenTouch(event)) {
          this.touchDeltaX = event.clientX - this.touchStartX;
        }

        this._handleSwipe();

        if (this._config.pause === 'hover') {
          // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
          this.pause();

          if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
          }

          this.touchTimeout = setTimeout(event => this.cycle(event), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
        }
      };

      SelectorEngine.find(SELECTOR_ITEM_IMG, this._element).forEach(itemImg => {
        EventHandler.on(itemImg, EVENT_DRAG_START, event => event.preventDefault());
      });

      if (this._pointerEvent) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, event => start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, event => end(event));

        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, event => start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, event => move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, event => end(event));
      }
    }

    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      const direction = KEY_TO_DIRECTION[event.key];

      if (direction) {
        event.preventDefault();

        this._slide(direction);
      }
    }

    _getItemIndex(element) {
      this._items = element && element.parentNode ? SelectorEngine.find(SELECTOR_ITEM, element.parentNode) : [];
      return this._items.indexOf(element);
    }

    _getItemByOrder(order, activeElement) {
      const isNext = order === ORDER_NEXT;
      return getNextActiveElement(this._items, activeElement, isNext, this._config.wrap);
    }

    _triggerSlideEvent(relatedTarget, eventDirectionName) {
      const targetIndex = this._getItemIndex(relatedTarget);

      const fromIndex = this._getItemIndex(SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element));

      return EventHandler.trigger(this._element, EVENT_SLIDE, {
        relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex
      });
    }

    _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE$1, this._indicatorsElement);
        activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
        activeIndicator.removeAttribute('aria-current');
        const indicators = SelectorEngine.find(SELECTOR_INDICATOR, this._indicatorsElement);

        for (let i = 0; i < indicators.length; i++) {
          if (Number.parseInt(indicators[i].getAttribute('data-bs-slide-to'), 10) === this._getItemIndex(element)) {
            indicators[i].classList.add(CLASS_NAME_ACTIVE$2);
            indicators[i].setAttribute('aria-current', 'true');
            break;
          }
        }
      }
    }

    _updateInterval() {
      const element = this._activeElement || SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);

      if (!element) {
        return;
      }

      const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);

      if (elementInterval) {
        this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
        this._config.interval = elementInterval;
      } else {
        this._config.interval = this._config.defaultInterval || this._config.interval;
      }
    }

    _slide(directionOrOrder, element) {
      const order = this._directionToOrder(directionOrOrder);

      const activeElement = SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);

      const activeElementIndex = this._getItemIndex(activeElement);

      const nextElement = element || this._getItemByOrder(order, activeElement);

      const nextElementIndex = this._getItemIndex(nextElement);

      const isCycling = Boolean(this._interval);
      const isNext = order === ORDER_NEXT;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;

      const eventDirectionName = this._orderToDirection(order);

      if (nextElement && nextElement.classList.contains(CLASS_NAME_ACTIVE$2)) {
        this._isSliding = false;
        return;
      }

      if (this._isSliding) {
        return;
      }

      const slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

      if (slideEvent.defaultPrevented) {
        return;
      }

      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      this._activeElement = nextElement;

      const triggerSlidEvent = () => {
        EventHandler.trigger(this._element, EVENT_SLID, {
          relatedTarget: nextElement,
          direction: eventDirectionName,
          from: activeElementIndex,
          to: nextElementIndex
        });
      };

      if (this._element.classList.contains(CLASS_NAME_SLIDE)) {
        nextElement.classList.add(orderClassName);
        reflow(nextElement);
        activeElement.classList.add(directionalClassName);
        nextElement.classList.add(directionalClassName);

        const completeCallBack = () => {
          nextElement.classList.remove(directionalClassName, orderClassName);
          nextElement.classList.add(CLASS_NAME_ACTIVE$2);
          activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
          this._isSliding = false;
          setTimeout(triggerSlidEvent, 0);
        };

        this._queueCallback(completeCallBack, activeElement, true);
      } else {
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        this._isSliding = false;
        triggerSlidEvent();
      }

      if (isCycling) {
        this.cycle();
      }
    }

    _directionToOrder(direction) {
      if (![DIRECTION_RIGHT, DIRECTION_LEFT].includes(direction)) {
        return direction;
      }

      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }

      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }

    _orderToDirection(order) {
      if (![ORDER_NEXT, ORDER_PREV].includes(order)) {
        return order;
      }

      if (isRTL()) {
        return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }

      return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    } // Static


    static carouselInterface(element, config) {
      const data = Carousel.getOrCreateInstance(element, config);
      let {
        _config
      } = data;

      if (typeof config === 'object') {
        _config = { ..._config,
          ...config
        };
      }

      const action = typeof config === 'string' ? config : _config.slide;

      if (typeof config === 'number') {
        data.to(config);
      } else if (typeof action === 'string') {
        if (typeof data[action] === 'undefined') {
          throw new TypeError(`No method named "${action}"`);
        }

        data[action]();
      } else if (_config.interval && _config.ride) {
        data.pause();
        data.cycle();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        Carousel.carouselInterface(this, config);
      });
    }

    static dataApiClickHandler(event) {
      const target = getElementFromSelector(this);

      if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
        return;
      }

      const config = { ...Manipulator.getDataAttributes(target),
        ...Manipulator.getDataAttributes(this)
      };
      const slideIndex = this.getAttribute('data-bs-slide-to');

      if (slideIndex) {
        config.interval = false;
      }

      Carousel.carouselInterface(target, config);

      if (slideIndex) {
        Carousel.getInstance(target).to(slideIndex);
      }

      event.preventDefault();
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, Carousel.dataApiClickHandler);
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);

    for (let i = 0, len = carousels.length; i < len; i++) {
      Carousel.carouselInterface(carousels[i], Carousel.getInstance(carousels[i]));
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Carousel to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Carousel);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$a = 'collapse';
  const DATA_KEY$9 = 'bs.collapse';
  const EVENT_KEY$9 = `.${DATA_KEY$9}`;
  const DATA_API_KEY$5 = '.data-api';
  const Default$9 = {
    toggle: true,
    parent: null
  };
  const DefaultType$9 = {
    toggle: 'boolean',
    parent: '(null|element)'
  };
  const EVENT_SHOW$5 = `show${EVENT_KEY$9}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$9}`;
  const EVENT_HIDE$5 = `hide${EVENT_KEY$9}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$9}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$9}${DATA_API_KEY$5}`;
  const CLASS_NAME_SHOW$7 = 'show';
  const CLASS_NAME_COLLAPSE = 'collapse';
  const CLASS_NAME_COLLAPSING = 'collapsing';
  const CLASS_NAME_COLLAPSED = 'collapsed';
  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
  const WIDTH = 'width';
  const HEIGHT = 'height';
  const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
  const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Collapse extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._isTransitioning = false;
      this._config = this._getConfig(config);
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);

      for (let i = 0, len = toggleList.length; i < len; i++) {
        const elem = toggleList[i];
        const selector = getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter(foundElem => foundElem === this._element);

        if (selector !== null && filterElement.length) {
          this._selector = selector;

          this._triggerArray.push(elem);
        }
      }

      this._initializeChildren();

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters


    static get Default() {
      return Default$9;
    }

    static get NAME() {
      return NAME$a;
    } // Public


    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }

      let actives = [];
      let activesData;

      if (this._config.parent) {
        const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
        actives = SelectorEngine.find(SELECTOR_ACTIVES, this._config.parent).filter(elem => !children.includes(elem)); // remove children if greater depth
      }

      const container = SelectorEngine.findOne(this._selector);

      if (actives.length) {
        const tempActiveData = actives.find(elem => container !== elem);
        activesData = tempActiveData ? Collapse.getInstance(tempActiveData) : null;

        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$5);

      if (startEvent.defaultPrevented) {
        return;
      }

      actives.forEach(elemActive => {
        if (container !== elemActive) {
          Collapse.getOrCreateInstance(elemActive, {
            toggle: false
          }).hide();
        }

        if (!activesData) {
          Data.set(elemActive, DATA_KEY$9, null);
        }
      });

      const dimension = this._getDimension();

      this._element.classList.remove(CLASS_NAME_COLLAPSE);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.style[dimension] = 0;

      this._addAriaAndCollapsedClass(this._triggerArray, true);

      this._isTransitioning = true;

      const complete = () => {
        this._isTransitioning = false;

        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);

        this._element.style[dimension] = '';
        EventHandler.trigger(this._element, EVENT_SHOWN$5);
      };

      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;

      this._queueCallback(complete, this._element, true);

      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }

    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$5);

      if (startEvent.defaultPrevented) {
        return;
      }

      const dimension = this._getDimension();

      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);

      const triggerArrayLength = this._triggerArray.length;

      for (let i = 0; i < triggerArrayLength; i++) {
        const trigger = this._triggerArray[i];
        const elem = getElementFromSelector(trigger);

        if (elem && !this._isShown(elem)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }

      this._isTransitioning = true;

      const complete = () => {
        this._isTransitioning = false;

        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE);

        EventHandler.trigger(this._element, EVENT_HIDDEN$5);
      };

      this._element.style[dimension] = '';

      this._queueCallback(complete, this._element, true);
    }

    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    } // Private


    _getConfig(config) {
      config = { ...Default$9,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      };
      config.toggle = Boolean(config.toggle); // Coerce string values

      config.parent = getElement(config.parent);
      typeCheckConfig(NAME$a, config, DefaultType$9);
      return config;
    }

    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }

    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }

      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      SelectorEngine.find(SELECTOR_DATA_TOGGLE$4, this._config.parent).filter(elem => !children.includes(elem)).forEach(element => {
        const selected = getElementFromSelector(element);

        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      });
    }

    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }

      triggerArray.forEach(elem => {
        if (isOpen) {
          elem.classList.remove(CLASS_NAME_COLLAPSED);
        } else {
          elem.classList.add(CLASS_NAME_COLLAPSED);
        }

        elem.setAttribute('aria-expanded', isOpen);
      });
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const _config = {};

        if (typeof config === 'string' && /show|hide/.test(config)) {
          _config.toggle = false;
        }

        const data = Collapse.getOrCreateInstance(this, _config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
      event.preventDefault();
    }

    const selector = getSelectorFromElement(this);
    const selectorElements = SelectorEngine.find(selector);
    selectorElements.forEach(element => {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Collapse to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Collapse);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dropdown.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$9 = 'dropdown';
  const DATA_KEY$8 = 'bs.dropdown';
  const EVENT_KEY$8 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$4 = '.data-api';
  const ESCAPE_KEY$2 = 'Escape';
  const SPACE_KEY = 'Space';
  const TAB_KEY$1 = 'Tab';
  const ARROW_UP_KEY = 'ArrowUp';
  const ARROW_DOWN_KEY = 'ArrowDown';
  const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

  const REGEXP_KEYDOWN = new RegExp(`${ARROW_UP_KEY}|${ARROW_DOWN_KEY}|${ESCAPE_KEY$2}`);
  const EVENT_HIDE$4 = `hide${EVENT_KEY$8}`;
  const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$8}`;
  const EVENT_SHOW$4 = `show${EVENT_KEY$8}`;
  const EVENT_SHOWN$4 = `shown${EVENT_KEY$8}`;
  const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$8}${DATA_API_KEY$4}`;
  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$8}${DATA_API_KEY$4}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$8}${DATA_API_KEY$4}`;
  const CLASS_NAME_SHOW$6 = 'show';
  const CLASS_NAME_DROPUP = 'dropup';
  const CLASS_NAME_DROPEND = 'dropend';
  const CLASS_NAME_DROPSTART = 'dropstart';
  const CLASS_NAME_NAVBAR = 'navbar';
  const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]';
  const SELECTOR_MENU = '.dropdown-menu';
  const SELECTOR_NAVBAR_NAV = '.navbar-nav';
  const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
  const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
  const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
  const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
  const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
  const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
  const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
  const Default$8 = {
    offset: [0, 2],
    boundary: 'clippingParents',
    reference: 'toggle',
    display: 'dynamic',
    popperConfig: null,
    autoClose: true
  };
  const DefaultType$8 = {
    offset: '(array|string|function)',
    boundary: '(string|element)',
    reference: '(string|element|object)',
    display: 'string',
    popperConfig: '(null|object|function)',
    autoClose: '(boolean|string)'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Dropdown extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._popper = null;
      this._config = this._getConfig(config);
      this._menu = this._getMenuElement();
      this._inNavbar = this._detectNavbar();
    } // Getters


    static get Default() {
      return Default$8;
    }

    static get DefaultType() {
      return DefaultType$8;
    }

    static get NAME() {
      return NAME$9;
    } // Public


    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }

    show() {
      if (isDisabled(this._element) || this._isShown(this._menu)) {
        return;
      }

      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, relatedTarget);

      if (showEvent.defaultPrevented) {
        return;
      }

      const parent = Dropdown.getParentFromElement(this._element); // Totally disable Popper for Dropdowns in Navbar

      if (this._inNavbar) {
        Manipulator.setDataAttribute(this._menu, 'popper', 'none');
      } else {
        this._createPopper(parent);
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement && !parent.closest(SELECTOR_NAVBAR_NAV)) {
        [].concat(...document.body.children).forEach(elem => EventHandler.on(elem, 'mouseover', noop$1));
      }

      this._element.focus();

      this._element.setAttribute('aria-expanded', true);

      this._menu.classList.add(CLASS_NAME_SHOW$6);

      this._element.classList.add(CLASS_NAME_SHOW$6);

      EventHandler.trigger(this._element, EVENT_SHOWN$4, relatedTarget);
    }

    hide() {
      if (isDisabled(this._element) || !this._isShown(this._menu)) {
        return;
      }

      const relatedTarget = {
        relatedTarget: this._element
      };

      this._completeHide(relatedTarget);
    }

    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }

      super.dispose();
    }

    update() {
      this._inNavbar = this._detectNavbar();

      if (this._popper) {
        this._popper.update();
      }
    } // Private


    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4, relatedTarget);

      if (hideEvent.defaultPrevented) {
        return;
      } // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support


      if ('ontouchstart' in document.documentElement) {
        [].concat(...document.body.children).forEach(elem => EventHandler.off(elem, 'mouseover', noop$1));
      }

      if (this._popper) {
        this._popper.destroy();
      }

      this._menu.classList.remove(CLASS_NAME_SHOW$6);

      this._element.classList.remove(CLASS_NAME_SHOW$6);

      this._element.setAttribute('aria-expanded', 'false');

      Manipulator.removeDataAttribute(this._menu, 'popper');
      EventHandler.trigger(this._element, EVENT_HIDDEN$4, relatedTarget);
    }

    _getConfig(config) {
      config = { ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      };
      typeCheckConfig(NAME$9, config, this.constructor.DefaultType);

      if (typeof config.reference === 'object' && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
        // Popper virtual elements require a getBoundingClientRect method
        throw new TypeError(`${NAME$9.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }

      return config;
    }

    _createPopper(parent) {
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
      }

      let referenceElement = this._element;

      if (this._config.reference === 'parent') {
        referenceElement = parent;
      } else if (isElement(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === 'object') {
        referenceElement = this._config.reference;
      }

      const popperConfig = this._getPopperConfig();

      const isDisplayStatic = popperConfig.modifiers.find(modifier => modifier.name === 'applyStyles' && modifier.enabled === false);
      this._popper = createPopper(referenceElement, this._menu, popperConfig);

      if (isDisplayStatic) {
        Manipulator.setDataAttribute(this._menu, 'popper', 'static');
      }
    }

    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$6);
    }

    _getMenuElement() {
      return SelectorEngine.next(this._element, SELECTOR_MENU)[0];
    }

    _getPlacement() {
      const parentDropdown = this._element.parentNode;

      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }

      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      } // We need to trim the value because custom properties can also include spaces


      const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';

      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }

      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }

    _detectNavbar() {
      return this._element.closest(`.${CLASS_NAME_NAVBAR}`) !== null;
    }

    _getOffset() {
      const {
        offset
      } = this._config;

      if (typeof offset === 'string') {
        return offset.split(',').map(val => Number.parseInt(val, 10));
      }

      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }

      return offset;
    }

    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }]
      }; // Disable Popper if we have a static display

      if (this._config.display === 'static') {
        defaultBsPopperConfig.modifiers = [{
          name: 'applyStyles',
          enabled: false
        }];
      }

      return { ...defaultBsPopperConfig,
        ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
      };
    }

    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(isVisible);

      if (!items.length) {
        return;
      } // if target isn't included in items (e.g. when expanding the dropdown)
      // allow cycling to get the last item in case key equals ARROW_UP_KEY


      getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus();
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Dropdown.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

    static clearMenus(event) {
      if (event && (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY$1)) {
        return;
      }

      const toggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE$3);

      for (let i = 0, len = toggles.length; i < len; i++) {
        const context = Dropdown.getInstance(toggles[i]);

        if (!context || context._config.autoClose === false) {
          continue;
        }

        if (!context._isShown()) {
          continue;
        }

        const relatedTarget = {
          relatedTarget: context._element
        };

        if (event) {
          const composedPath = event.composedPath();
          const isMenuTarget = composedPath.includes(context._menu);

          if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
            continue;
          } // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu


          if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
            continue;
          }

          if (event.type === 'click') {
            relatedTarget.clickEvent = event;
          }
        }

        context._completeHide(relatedTarget);
      }
    }

    static getParentFromElement(element) {
      return getElementFromSelector(element) || element.parentNode;
    }

    static dataApiKeydownHandler(event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (/input|textarea/i.test(event.target.tagName) ? event.key === SPACE_KEY || event.key !== ESCAPE_KEY$2 && (event.key !== ARROW_DOWN_KEY && event.key !== ARROW_UP_KEY || event.target.closest(SELECTOR_MENU)) : !REGEXP_KEYDOWN.test(event.key)) {
        return;
      }

      const isActive = this.classList.contains(CLASS_NAME_SHOW$6);

      if (!isActive && event.key === ESCAPE_KEY$2) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (isDisabled(this)) {
        return;
      }

      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0];
      const instance = Dropdown.getOrCreateInstance(getToggleButton);

      if (event.key === ESCAPE_KEY$2) {
        instance.hide();
        return;
      }

      if (event.key === ARROW_UP_KEY || event.key === ARROW_DOWN_KEY) {
        if (!isActive) {
          instance.show();
        }

        instance._selectMenuItem(event);

        return;
      }

      if (!isActive || event.key === SPACE_KEY) {
        Dropdown.clearMenus();
      }
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function (event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Dropdown to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Dropdown);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
  const SELECTOR_STICKY_CONTENT = '.sticky-top';

  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    }

    getWidth() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }

    hide() {
      const width = this.getWidth();

      this._disableOverFlow(); // give padding to element to balance the hidden scrollbar width


      this._setElementAttributes(this._element, 'paddingRight', calculatedValue => calculatedValue + width); // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth


      this._setElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight', calculatedValue => calculatedValue + width);

      this._setElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight', calculatedValue => calculatedValue - width);
    }

    _disableOverFlow() {
      this._saveInitialAttribute(this._element, 'overflow');

      this._element.style.overflow = 'hidden';
    }

    _setElementAttributes(selector, styleProp, callback) {
      const scrollbarWidth = this.getWidth();

      const manipulationCallBack = element => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }

        this._saveInitialAttribute(element, styleProp);

        const calculatedValue = window.getComputedStyle(element)[styleProp];
        element.style[styleProp] = `${callback(Number.parseFloat(calculatedValue))}px`;
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    reset() {
      this._resetElementAttributes(this._element, 'overflow');

      this._resetElementAttributes(this._element, 'paddingRight');

      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight');

      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight');
    }

    _saveInitialAttribute(element, styleProp) {
      const actualValue = element.style[styleProp];

      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProp, actualValue);
      }
    }

    _resetElementAttributes(selector, styleProp) {
      const manipulationCallBack = element => {
        const value = Manipulator.getDataAttribute(element, styleProp);

        if (typeof value === 'undefined') {
          element.style.removeProperty(styleProp);
        } else {
          Manipulator.removeDataAttribute(element, styleProp);
          element.style[styleProp] = value;
        }
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    _applyManipulationCallback(selector, callBack) {
      if (isElement(selector)) {
        callBack(selector);
      } else {
        SelectorEngine.find(selector, this._element).forEach(callBack);
      }
    }

    isOverflowing() {
      return this.getWidth() > 0;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const Default$7 = {
    className: 'modal-backdrop',
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    isAnimated: false,
    rootElement: 'body',
    // give the choice to place backdrop under different elements
    clickCallback: null
  };
  const DefaultType$7 = {
    className: 'string',
    isVisible: 'boolean',
    isAnimated: 'boolean',
    rootElement: '(element|string)',
    clickCallback: '(function|null)'
  };
  const NAME$8 = 'backdrop';
  const CLASS_NAME_FADE$4 = 'fade';
  const CLASS_NAME_SHOW$5 = 'show';
  const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$8}`;

  class Backdrop {
    constructor(config) {
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }

    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._append();

      if (this._config.isAnimated) {
        reflow(this._getElement());
      }

      this._getElement().classList.add(CLASS_NAME_SHOW$5);

      this._emulateAnimation(() => {
        execute(callback);
      });
    }

    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._getElement().classList.remove(CLASS_NAME_SHOW$5);

      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    } // Private


    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement('div');
        backdrop.className = this._config.className;

        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }

        this._element = backdrop;
      }

      return this._element;
    }

    _getConfig(config) {
      config = { ...Default$7,
        ...(typeof config === 'object' ? config : {})
      }; // use getElement() with the default "body" to get a fresh Element on each instantiation

      config.rootElement = getElement(config.rootElement);
      typeCheckConfig(NAME$8, config, DefaultType$7);
      return config;
    }

    _append() {
      if (this._isAppended) {
        return;
      }

      this._config.rootElement.append(this._getElement());

      EventHandler.on(this._getElement(), EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }

    dispose() {
      if (!this._isAppended) {
        return;
      }

      EventHandler.off(this._element, EVENT_MOUSEDOWN);

      this._element.remove();

      this._isAppended = false;
    }

    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const Default$6 = {
    trapElement: null,
    // The element to trap focus inside of
    autofocus: true
  };
  const DefaultType$6 = {
    trapElement: 'element',
    autofocus: 'boolean'
  };
  const NAME$7 = 'focustrap';
  const DATA_KEY$7 = 'bs.focustrap';
  const EVENT_KEY$7 = `.${DATA_KEY$7}`;
  const EVENT_FOCUSIN$1 = `focusin${EVENT_KEY$7}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$7}`;
  const TAB_KEY = 'Tab';
  const TAB_NAV_FORWARD = 'forward';
  const TAB_NAV_BACKWARD = 'backward';

  class FocusTrap {
    constructor(config) {
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }

    activate() {
      const {
        trapElement,
        autofocus
      } = this._config;

      if (this._isActive) {
        return;
      }

      if (autofocus) {
        trapElement.focus();
      }

      EventHandler.off(document, EVENT_KEY$7); // guard against infinite focus loop

      EventHandler.on(document, EVENT_FOCUSIN$1, event => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
      this._isActive = true;
    }

    deactivate() {
      if (!this._isActive) {
        return;
      }

      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$7);
    } // Private


    _handleFocusin(event) {
      const {
        target
      } = event;
      const {
        trapElement
      } = this._config;

      if (target === document || target === trapElement || trapElement.contains(target)) {
        return;
      }

      const elements = SelectorEngine.focusableChildren(trapElement);

      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }

    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }

      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }

    _getConfig(config) {
      config = { ...Default$6,
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$7, config, DefaultType$6);
      return config;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$6 = 'modal';
  const DATA_KEY$6 = 'bs.modal';
  const EVENT_KEY$6 = `.${DATA_KEY$6}`;
  const DATA_API_KEY$3 = '.data-api';
  const ESCAPE_KEY$1 = 'Escape';
  const Default$5 = {
    backdrop: true,
    keyboard: true,
    focus: true
  };
  const DefaultType$5 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean'
  };
  const EVENT_HIDE$3 = `hide${EVENT_KEY$6}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$6}`;
  const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$6}`;
  const EVENT_SHOW$3 = `show${EVENT_KEY$6}`;
  const EVENT_SHOWN$3 = `shown${EVENT_KEY$6}`;
  const EVENT_RESIZE = `resize${EVENT_KEY$6}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$6}`;
  const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$6}`;
  const EVENT_MOUSEUP_DISMISS = `mouseup.dismiss${EVENT_KEY$6}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$6}`;
  const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const CLASS_NAME_OPEN = 'modal-open';
  const CLASS_NAME_FADE$3 = 'fade';
  const CLASS_NAME_SHOW$4 = 'show';
  const CLASS_NAME_STATIC = 'modal-static';
  const OPEN_SELECTOR$1 = '.modal.show';
  const SELECTOR_DIALOG = '.modal-dialog';
  const SELECTOR_MODAL_BODY = '.modal-body';
  const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Modal extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
    } // Getters


    static get Default() {
      return Default$5;
    }

    static get NAME() {
      return NAME$6;
    } // Public


    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });

      if (showEvent.defaultPrevented) {
        return;
      }

      this._isShown = true;

      if (this._isAnimated()) {
        this._isTransitioning = true;
      }

      this._scrollBar.hide();

      document.body.classList.add(CLASS_NAME_OPEN);

      this._adjustDialog();

      this._setEscapeEvent();

      this._setResizeEvent();

      EventHandler.on(this._dialog, EVENT_MOUSEDOWN_DISMISS, () => {
        EventHandler.one(this._element, EVENT_MOUSEUP_DISMISS, event => {
          if (event.target === this._element) {
            this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(() => this._showElement(relatedTarget));
    }

    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);

      if (hideEvent.defaultPrevented) {
        return;
      }

      this._isShown = false;

      const isAnimated = this._isAnimated();

      if (isAnimated) {
        this._isTransitioning = true;
      }

      this._setEscapeEvent();

      this._setResizeEvent();

      this._focustrap.deactivate();

      this._element.classList.remove(CLASS_NAME_SHOW$4);

      EventHandler.off(this._element, EVENT_CLICK_DISMISS);
      EventHandler.off(this._dialog, EVENT_MOUSEDOWN_DISMISS);

      this._queueCallback(() => this._hideModal(), this._element, isAnimated);
    }

    dispose() {
      [window, this._dialog].forEach(htmlElement => EventHandler.off(htmlElement, EVENT_KEY$6));

      this._backdrop.dispose();

      this._focustrap.deactivate();

      super.dispose();
    }

    handleUpdate() {
      this._adjustDialog();
    } // Private


    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value
        isAnimated: this._isAnimated()
      });
    }

    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }

    _getConfig(config) {
      config = { ...Default$5,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$6, config, DefaultType$5);
      return config;
    }

    _showElement(relatedTarget) {
      const isAnimated = this._isAnimated();

      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // Don't move modal's DOM position
        document.body.append(this._element);
      }

      this._element.style.display = 'block';

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      this._element.setAttribute('role', 'dialog');

      this._element.scrollTop = 0;

      if (modalBody) {
        modalBody.scrollTop = 0;
      }

      if (isAnimated) {
        reflow(this._element);
      }

      this._element.classList.add(CLASS_NAME_SHOW$4);

      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }

        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };

      this._queueCallback(transitionComplete, this._dialog, isAnimated);
    }

    _setEscapeEvent() {
      if (this._isShown) {
        EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
          if (this._config.keyboard && event.key === ESCAPE_KEY$1) {
            event.preventDefault();
            this.hide();
          } else if (!this._config.keyboard && event.key === ESCAPE_KEY$1) {
            this._triggerBackdropTransition();
          }
        });
      } else {
        EventHandler.off(this._element, EVENT_KEYDOWN_DISMISS$1);
      }
    }

    _setResizeEvent() {
      if (this._isShown) {
        EventHandler.on(window, EVENT_RESIZE, () => this._adjustDialog());
      } else {
        EventHandler.off(window, EVENT_RESIZE);
      }
    }

    _hideModal() {
      this._element.style.display = 'none';

      this._element.setAttribute('aria-hidden', true);

      this._element.removeAttribute('aria-modal');

      this._element.removeAttribute('role');

      this._isTransitioning = false;

      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);

        this._resetAdjustments();

        this._scrollBar.reset();

        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      });
    }

    _showBackdrop(callback) {
      EventHandler.on(this._element, EVENT_CLICK_DISMISS, event => {
        if (this._ignoreBackdropClick) {
          this._ignoreBackdropClick = false;
          return;
        }

        if (event.target !== event.currentTarget) {
          return;
        }

        if (this._config.backdrop === true) {
          this.hide();
        } else if (this._config.backdrop === 'static') {
          this._triggerBackdropTransition();
        }
      });

      this._backdrop.show(callback);
    }

    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }

    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);

      if (hideEvent.defaultPrevented) {
        return;
      }

      const {
        classList,
        scrollHeight,
        style
      } = this._element;
      const isModalOverflowing = scrollHeight > document.documentElement.clientHeight; // return if the following background transition hasn't yet completed

      if (!isModalOverflowing && style.overflowY === 'hidden' || classList.contains(CLASS_NAME_STATIC)) {
        return;
      }

      if (!isModalOverflowing) {
        style.overflowY = 'hidden';
      }

      classList.add(CLASS_NAME_STATIC);

      this._queueCallback(() => {
        classList.remove(CLASS_NAME_STATIC);

        if (!isModalOverflowing) {
          this._queueCallback(() => {
            style.overflowY = '';
          }, this._dialog);
        }
      }, this._dialog);

      this._element.focus();
    } // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // ----------------------------------------------------------------------


    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      const scrollbarWidth = this._scrollBar.getWidth();

      const isBodyOverflowing = scrollbarWidth > 0;

      if (!isBodyOverflowing && isModalOverflowing && !isRTL() || isBodyOverflowing && !isModalOverflowing && isRTL()) {
        this._element.style.paddingLeft = `${scrollbarWidth}px`;
      }

      if (isBodyOverflowing && !isModalOverflowing && !isRTL() || !isBodyOverflowing && isModalOverflowing && isRTL()) {
        this._element.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    } // Static


    static jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        const data = Modal.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](relatedTarget);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
    const target = getElementFromSelector(this);

    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    EventHandler.one(target, EVENT_SHOW$3, showEvent => {
      if (showEvent.defaultPrevented) {
        // only register focus restorer if modal will actually get shown
        return;
      }

      EventHandler.one(target, EVENT_HIDDEN$3, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    }); // avoid conflict when clicking moddal toggler while another one is open

    const allReadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);

    if (allReadyOpen) {
      Modal.getInstance(allReadyOpen).hide();
    }

    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Modal to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Modal);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): offcanvas.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$5 = 'offcanvas';
  const DATA_KEY$5 = 'bs.offcanvas';
  const EVENT_KEY$5 = `.${DATA_KEY$5}`;
  const DATA_API_KEY$2 = '.data-api';
  const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$5}${DATA_API_KEY$2}`;
  const ESCAPE_KEY = 'Escape';
  const Default$4 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  const DefaultType$4 = {
    backdrop: 'boolean',
    keyboard: 'boolean',
    scroll: 'boolean'
  };
  const CLASS_NAME_SHOW$3 = 'show';
  const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
  const OPEN_SELECTOR = '.offcanvas.show';
  const EVENT_SHOW$2 = `show${EVENT_KEY$5}`;
  const EVENT_SHOWN$2 = `shown${EVENT_KEY$5}`;
  const EVENT_HIDE$2 = `hide${EVENT_KEY$5}`;
  const EVENT_HIDDEN$2 = `hidden${EVENT_KEY$5}`;
  const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$5}${DATA_API_KEY$2}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$5}`;
  const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Offcanvas extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();

      this._addEventListeners();
    } // Getters


    static get NAME() {
      return NAME$5;
    }

    static get Default() {
      return Default$4;
    } // Public


    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
      if (this._isShown) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$2, {
        relatedTarget
      });

      if (showEvent.defaultPrevented) {
        return;
      }

      this._isShown = true;
      this._element.style.visibility = 'visible';

      this._backdrop.show();

      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      this._element.setAttribute('role', 'dialog');

      this._element.classList.add(CLASS_NAME_SHOW$3);

      const completeCallBack = () => {
        if (!this._config.scroll) {
          this._focustrap.activate();
        }

        EventHandler.trigger(this._element, EVENT_SHOWN$2, {
          relatedTarget
        });
      };

      this._queueCallback(completeCallBack, this._element, true);
    }

    hide() {
      if (!this._isShown) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$2);

      if (hideEvent.defaultPrevented) {
        return;
      }

      this._focustrap.deactivate();

      this._element.blur();

      this._isShown = false;

      this._element.classList.remove(CLASS_NAME_SHOW$3);

      this._backdrop.hide();

      const completeCallback = () => {
        this._element.setAttribute('aria-hidden', true);

        this._element.removeAttribute('aria-modal');

        this._element.removeAttribute('role');

        this._element.style.visibility = 'hidden';

        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }

        EventHandler.trigger(this._element, EVENT_HIDDEN$2);
      };

      this._queueCallback(completeCallback, this._element, true);
    }

    dispose() {
      this._backdrop.dispose();

      this._focustrap.deactivate();

      super.dispose();
    } // Private


    _getConfig(config) {
      config = { ...Default$4,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$5, config, DefaultType$4);
      return config;
    }

    _initializeBackDrop() {
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible: this._config.backdrop,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: () => this.hide()
      });
    }

    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }

    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
        if (this._config.keyboard && event.key === ESCAPE_KEY) {
          this.hide();
        }
      });
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Offcanvas.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function (event) {
    const target = getElementFromSelector(this);

    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    if (isDisabled(this)) {
      return;
    }

    EventHandler.one(target, EVENT_HIDDEN$2, () => {
      // focus on trigger when it is closed
      if (isVisible(this)) {
        this.focus();
      }
    }); // avoid conflict when clicking a toggler of an offcanvas, while another is open

    const allReadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);

    if (allReadyOpen && allReadyOpen !== target) {
      Offcanvas.getInstance(allReadyOpen).hide();
    }

    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => SelectorEngine.find(OPEN_SELECTOR).forEach(el => Offcanvas.getOrCreateInstance(el).show()));
  enableDismissTrigger(Offcanvas);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  defineJQueryPlugin(Offcanvas);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);
  const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  /**
   * A pattern that recognizes a commonly useful subset of URLs that are safe.
   *
   * Shoutout to Angular https://github.com/angular/angular/blob/12.2.x/packages/core/src/sanitization/url_sanitizer.ts
   */

  const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i;
  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular https://github.com/angular/angular/blob/12.2.x/packages/core/src/sanitization/url_sanitizer.ts
   */

  const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;

  const allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();

    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue) || DATA_URL_PATTERN.test(attribute.nodeValue));
      }

      return true;
    }

    const regExp = allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp); // Check if a regular expression validates the attribute.

    for (let i = 0, len = regExp.length; i < len; i++) {
      if (regExp[i].test(attributeName)) {
        return true;
      }
    }

    return false;
  };

  const DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFn) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }

    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml);
    }

    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    const elements = [].concat(...createdDocument.body.querySelectorAll('*'));

    for (let i = 0, len = elements.length; i < len; i++) {
      const element = elements[i];
      const elementName = element.nodeName.toLowerCase();

      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }

      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);
      attributeList.forEach(attribute => {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      });
    }

    return createdDocument.body.innerHTML;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$4 = 'tooltip';
  const DATA_KEY$4 = 'bs.tooltip';
  const EVENT_KEY$4 = `.${DATA_KEY$4}`;
  const CLASS_PREFIX$1 = 'bs-tooltip';
  const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
  const DefaultType$3 = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(array|string|function)',
    container: '(string|element|boolean)',
    fallbackPlacements: 'array',
    boundary: '(string|element)',
    customClass: '(string|function)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    allowList: 'object',
    popperConfig: '(null|object|function)'
  };
  const AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: isRTL() ? 'left' : 'right',
    BOTTOM: 'bottom',
    LEFT: isRTL() ? 'right' : 'left'
  };
  const Default$3 = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: [0, 0],
    container: false,
    fallbackPlacements: ['top', 'right', 'bottom', 'left'],
    boundary: 'clippingParents',
    customClass: '',
    sanitize: true,
    sanitizeFn: null,
    allowList: DefaultAllowlist,
    popperConfig: null
  };
  const Event$2 = {
    HIDE: `hide${EVENT_KEY$4}`,
    HIDDEN: `hidden${EVENT_KEY$4}`,
    SHOW: `show${EVENT_KEY$4}`,
    SHOWN: `shown${EVENT_KEY$4}`,
    INSERTED: `inserted${EVENT_KEY$4}`,
    CLICK: `click${EVENT_KEY$4}`,
    FOCUSIN: `focusin${EVENT_KEY$4}`,
    FOCUSOUT: `focusout${EVENT_KEY$4}`,
    MOUSEENTER: `mouseenter${EVENT_KEY$4}`,
    MOUSELEAVE: `mouseleave${EVENT_KEY$4}`
  };
  const CLASS_NAME_FADE$2 = 'fade';
  const CLASS_NAME_MODAL = 'modal';
  const CLASS_NAME_SHOW$2 = 'show';
  const HOVER_STATE_SHOW = 'show';
  const HOVER_STATE_OUT = 'out';
  const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
  const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  const EVENT_MODAL_HIDE = 'hide.bs.modal';
  const TRIGGER_HOVER = 'hover';
  const TRIGGER_FOCUS = 'focus';
  const TRIGGER_CLICK = 'click';
  const TRIGGER_MANUAL = 'manual';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Tooltip extends BaseComponent {
    constructor(element, config) {
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)');
      }

      super(element); // private

      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null; // Protected

      this._config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters


    static get Default() {
      return Default$3;
    }

    static get NAME() {
      return NAME$4;
    }

    static get Event() {
      return Event$2;
    }

    static get DefaultType() {
      return DefaultType$3;
    } // Public


    enable() {
      this._isEnabled = true;
    }

    disable() {
      this._isEnabled = false;
    }

    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }

    toggle(event) {
      if (!this._isEnabled) {
        return;
      }

      if (event) {
        const context = this._initializeOnDelegatedTarget(event);

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {
        if (this.getTipElement().classList.contains(CLASS_NAME_SHOW$2)) {
          this._leave(null, this);

          return;
        }

        this._enter(null, this);
      }
    }

    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);

      if (this.tip) {
        this.tip.remove();
      }

      this._disposePopper();

      super.dispose();
    }

    show() {
      if (this._element.style.display === 'none') {
        throw new Error('Please use show on visible elements');
      }

      if (!(this.isWithContent() && this._isEnabled)) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, this.constructor.Event.SHOW);
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = shadowRoot === null ? this._element.ownerDocument.documentElement.contains(this._element) : shadowRoot.contains(this._element);

      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      } // A trick to recreate a tooltip in case a new title is given by using the NOT documented `data-bs-original-title`
      // This will be removed later in favor of a `setContent` method


      if (this.constructor.NAME === 'tooltip' && this.tip && this.getTitle() !== this.tip.querySelector(SELECTOR_TOOLTIP_INNER).innerHTML) {
        this._disposePopper();

        this.tip.remove();
        this.tip = null;
      }

      const tip = this.getTipElement();
      const tipId = getUID(this.constructor.NAME);
      tip.setAttribute('id', tipId);

      this._element.setAttribute('aria-describedby', tipId);

      if (this._config.animation) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }

      const placement = typeof this._config.placement === 'function' ? this._config.placement.call(this, tip, this._element) : this._config.placement;

      const attachment = this._getAttachment(placement);

      this._addAttachmentClass(attachment);

      const {
        container
      } = this._config;
      Data.set(tip, this.constructor.DATA_KEY, this);

      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.Event.INSERTED);
      }

      if (this._popper) {
        this._popper.update();
      } else {
        this._popper = createPopper(this._element, tip, this._getPopperConfig(attachment));
      }

      tip.classList.add(CLASS_NAME_SHOW$2);

      const customClass = this._resolvePossibleFunction(this._config.customClass);

      if (customClass) {
        tip.classList.add(...customClass.split(' '));
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement) {
        [].concat(...document.body.children).forEach(element => {
          EventHandler.on(element, 'mouseover', noop$1);
        });
      }

      const complete = () => {
        const prevHoverState = this._hoverState;
        this._hoverState = null;
        EventHandler.trigger(this._element, this.constructor.Event.SHOWN);

        if (prevHoverState === HOVER_STATE_OUT) {
          this._leave(null, this);
        }
      };

      const isAnimated = this.tip.classList.contains(CLASS_NAME_FADE$2);

      this._queueCallback(complete, this.tip, isAnimated);
    }

    hide() {
      if (!this._popper) {
        return;
      }

      const tip = this.getTipElement();

      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }

        if (this._hoverState !== HOVER_STATE_SHOW) {
          tip.remove();
        }

        this._cleanTipClass();

        this._element.removeAttribute('aria-describedby');

        EventHandler.trigger(this._element, this.constructor.Event.HIDDEN);

        this._disposePopper();
      };

      const hideEvent = EventHandler.trigger(this._element, this.constructor.Event.HIDE);

      if (hideEvent.defaultPrevented) {
        return;
      }

      tip.classList.remove(CLASS_NAME_SHOW$2); // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support

      if ('ontouchstart' in document.documentElement) {
        [].concat(...document.body.children).forEach(element => EventHandler.off(element, 'mouseover', noop$1));
      }

      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      const isAnimated = this.tip.classList.contains(CLASS_NAME_FADE$2);

      this._queueCallback(complete, this.tip, isAnimated);

      this._hoverState = '';
    }

    update() {
      if (this._popper !== null) {
        this._popper.update();
      }
    } // Protected


    isWithContent() {
      return Boolean(this.getTitle());
    }

    getTipElement() {
      if (this.tip) {
        return this.tip;
      }

      const element = document.createElement('div');
      element.innerHTML = this._config.template;
      const tip = element.children[0];
      this.setContent(tip);
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
      this.tip = tip;
      return this.tip;
    }

    setContent(tip) {
      this._sanitizeAndSetContent(tip, this.getTitle(), SELECTOR_TOOLTIP_INNER);
    }

    _sanitizeAndSetContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);

      if (!content && templateElement) {
        templateElement.remove();
        return;
      } // we use append for html objects to maintain js events


      this.setElementContent(templateElement, content);
    }

    setElementContent(element, content) {
      if (element === null) {
        return;
      }

      if (isElement(content)) {
        content = getElement(content); // content is a DOM node or a jQuery

        if (this._config.html) {
          if (content.parentNode !== element) {
            element.innerHTML = '';
            element.append(content);
          }
        } else {
          element.textContent = content.textContent;
        }

        return;
      }

      if (this._config.html) {
        if (this._config.sanitize) {
          content = sanitizeHtml(content, this._config.allowList, this._config.sanitizeFn);
        }

        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
    }

    getTitle() {
      const title = this._element.getAttribute('data-bs-original-title') || this._config.title;

      return this._resolvePossibleFunction(title);
    }

    updateAttachment(attachment) {
      if (attachment === 'right') {
        return 'end';
      }

      if (attachment === 'left') {
        return 'start';
      }

      return attachment;
    } // Private


    _initializeOnDelegatedTarget(event, context) {
      return context || this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }

    _getOffset() {
      const {
        offset
      } = this._config;

      if (typeof offset === 'string') {
        return offset.split(',').map(val => Number.parseInt(val, 10));
      }

      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }

      return offset;
    }

    _resolvePossibleFunction(content) {
      return typeof content === 'function' ? content.call(this._element) : content;
    }

    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }, {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'arrow',
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: 'onChange',
          enabled: true,
          phase: 'afterWrite',
          fn: data => this._handlePopperPlacementChange(data)
        }],
        onFirstUpdate: data => {
          if (data.options.placement !== data.placement) {
            this._handlePopperPlacementChange(data);
          }
        }
      };
      return { ...defaultBsPopperConfig,
        ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
      };
    }

    _addAttachmentClass(attachment) {
      this.getTipElement().classList.add(`${this._getBasicClassPrefix()}-${this.updateAttachment(attachment)}`);
    }

    _getAttachment(placement) {
      return AttachmentMap[placement.toUpperCase()];
    }

    _setListeners() {
      const triggers = this._config.trigger.split(' ');

      triggers.forEach(trigger => {
        if (trigger === 'click') {
          EventHandler.on(this._element, this.constructor.Event.CLICK, this._config.selector, event => this.toggle(event));
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.Event.MOUSEENTER : this.constructor.Event.FOCUSIN;
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.Event.MOUSELEAVE : this.constructor.Event.FOCUSOUT;
          EventHandler.on(this._element, eventIn, this._config.selector, event => this._enter(event));
          EventHandler.on(this._element, eventOut, this._config.selector, event => this._leave(event));
        }
      });

      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };

      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);

      if (this._config.selector) {
        this._config = { ...this._config,
          trigger: 'manual',
          selector: ''
        };
      } else {
        this._fixTitle();
      }
    }

    _fixTitle() {
      const title = this._element.getAttribute('title');

      const originalTitleType = typeof this._element.getAttribute('data-bs-original-title');

      if (title || originalTitleType !== 'string') {
        this._element.setAttribute('data-bs-original-title', title || '');

        if (title && !this._element.getAttribute('aria-label') && !this._element.textContent) {
          this._element.setAttribute('aria-label', title);
        }

        this._element.setAttribute('title', '');
      }
    }

    _enter(event, context) {
      context = this._initializeOnDelegatedTarget(event, context);

      if (event) {
        context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
      }

      if (context.getTipElement().classList.contains(CLASS_NAME_SHOW$2) || context._hoverState === HOVER_STATE_SHOW) {
        context._hoverState = HOVER_STATE_SHOW;
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HOVER_STATE_SHOW;

      if (!context._config.delay || !context._config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(() => {
        if (context._hoverState === HOVER_STATE_SHOW) {
          context.show();
        }
      }, context._config.delay.show);
    }

    _leave(event, context) {
      context = this._initializeOnDelegatedTarget(event, context);

      if (event) {
        context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HOVER_STATE_OUT;

      if (!context._config.delay || !context._config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(() => {
        if (context._hoverState === HOVER_STATE_OUT) {
          context.hide();
        }
      }, context._config.delay.hide);
    }

    _isWithActiveTrigger() {
      for (const trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    }

    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      Object.keys(dataAttributes).forEach(dataAttr => {
        if (DISALLOWED_ATTRIBUTES.has(dataAttr)) {
          delete dataAttributes[dataAttr];
        }
      });
      config = { ...this.constructor.Default,
        ...dataAttributes,
        ...(typeof config === 'object' && config ? config : {})
      };
      config.container = config.container === false ? document.body : getElement(config.container);

      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }

      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }

      typeCheckConfig(NAME$4, config, this.constructor.DefaultType);

      if (config.sanitize) {
        config.template = sanitizeHtml(config.template, config.allowList, config.sanitizeFn);
      }

      return config;
    }

    _getDelegateConfig() {
      const config = {};

      for (const key in this._config) {
        if (this.constructor.Default[key] !== this._config[key]) {
          config[key] = this._config[key];
        }
      } // In the future can be replaced with:
      // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
      // `Object.fromEntries(keysWithDifferentValues)`


      return config;
    }

    _cleanTipClass() {
      const tip = this.getTipElement();
      const basicClassPrefixRegex = new RegExp(`(^|\\s)${this._getBasicClassPrefix()}\\S+`, 'g');
      const tabClass = tip.getAttribute('class').match(basicClassPrefixRegex);

      if (tabClass !== null && tabClass.length > 0) {
        tabClass.map(token => token.trim()).forEach(tClass => tip.classList.remove(tClass));
      }
    }

    _getBasicClassPrefix() {
      return CLASS_PREFIX$1;
    }

    _handlePopperPlacementChange(popperData) {
      const {
        state
      } = popperData;

      if (!state) {
        return;
      }

      this.tip = state.elements.popper;

      this._cleanTipClass();

      this._addAttachmentClass(this._getAttachment(state.placement));
    }

    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();

        this._popper = null;
      }
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tooltip.getOrCreateInstance(this, config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Tooltip to jQuery only if jQuery is present
   */


  defineJQueryPlugin(Tooltip);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): popover.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$3 = 'popover';
  const DATA_KEY$3 = 'bs.popover';
  const EVENT_KEY$3 = `.${DATA_KEY$3}`;
  const CLASS_PREFIX = 'bs-popover';
  const Default$2 = { ...Tooltip.Default,
    placement: 'right',
    offset: [0, 8],
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>'
  };
  const DefaultType$2 = { ...Tooltip.DefaultType,
    content: '(string|element|function)'
  };
  const Event$1 = {
    HIDE: `hide${EVENT_KEY$3}`,
    HIDDEN: `hidden${EVENT_KEY$3}`,
    SHOW: `show${EVENT_KEY$3}`,
    SHOWN: `shown${EVENT_KEY$3}`,
    INSERTED: `inserted${EVENT_KEY$3}`,
    CLICK: `click${EVENT_KEY$3}`,
    FOCUSIN: `focusin${EVENT_KEY$3}`,
    FOCUSOUT: `focusout${EVENT_KEY$3}`,
    MOUSEENTER: `mouseenter${EVENT_KEY$3}`,
    MOUSELEAVE: `mouseleave${EVENT_KEY$3}`
  };
  const SELECTOR_TITLE = '.popover-header';
  const SELECTOR_CONTENT = '.popover-body';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Popover extends Tooltip {
    // Getters
    static get Default() {
      return Default$2;
    }

    static get NAME() {
      return NAME$3;
    }

    static get Event() {
      return Event$1;
    }

    static get DefaultType() {
      return DefaultType$2;
    } // Overrides


    isWithContent() {
      return this.getTitle() || this._getContent();
    }

    setContent(tip) {
      this._sanitizeAndSetContent(tip, this.getTitle(), SELECTOR_TITLE);

      this._sanitizeAndSetContent(tip, this._getContent(), SELECTOR_CONTENT);
    } // Private


    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }

    _getBasicClassPrefix() {
      return CLASS_PREFIX;
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Popover.getOrCreateInstance(this, config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Popover to jQuery only if jQuery is present
   */


  defineJQueryPlugin(Popover);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): scrollspy.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$2 = 'scrollspy';
  const DATA_KEY$2 = 'bs.scrollspy';
  const EVENT_KEY$2 = `.${DATA_KEY$2}`;
  const DATA_API_KEY$1 = '.data-api';
  const Default$1 = {
    offset: 10,
    method: 'auto',
    target: ''
  };
  const DefaultType$1 = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };
  const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
  const EVENT_SCROLL = `scroll${EVENT_KEY$2}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY$2}${DATA_API_KEY$1}`;
  const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
  const CLASS_NAME_ACTIVE$1 = 'active';
  const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  const SELECTOR_NAV_LIST_GROUP$1 = '.nav, .list-group';
  const SELECTOR_NAV_LINKS = '.nav-link';
  const SELECTOR_NAV_ITEMS = '.nav-item';
  const SELECTOR_LIST_ITEMS = '.list-group-item';
  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}, .${CLASS_NAME_DROPDOWN_ITEM}`;
  const SELECTOR_DROPDOWN$1 = '.dropdown';
  const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
  const METHOD_OFFSET = 'offset';
  const METHOD_POSITION = 'position';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class ScrollSpy extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._scrollElement = this._element.tagName === 'BODY' ? window : this._element;
      this._config = this._getConfig(config);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;
      EventHandler.on(this._scrollElement, EVENT_SCROLL, () => this._process());
      this.refresh();

      this._process();
    } // Getters


    static get Default() {
      return Default$1;
    }

    static get NAME() {
      return NAME$2;
    } // Public


    refresh() {
      const autoMethod = this._scrollElement === this._scrollElement.window ? METHOD_OFFSET : METHOD_POSITION;
      const offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
      const offsetBase = offsetMethod === METHOD_POSITION ? this._getScrollTop() : 0;
      this._offsets = [];
      this._targets = [];
      this._scrollHeight = this._getScrollHeight();
      const targets = SelectorEngine.find(SELECTOR_LINK_ITEMS, this._config.target);
      targets.map(element => {
        const targetSelector = getSelectorFromElement(element);
        const target = targetSelector ? SelectorEngine.findOne(targetSelector) : null;

        if (target) {
          const targetBCR = target.getBoundingClientRect();

          if (targetBCR.width || targetBCR.height) {
            return [Manipulator[offsetMethod](target).top + offsetBase, targetSelector];
          }
        }

        return null;
      }).filter(item => item).sort((a, b) => a[0] - b[0]).forEach(item => {
        this._offsets.push(item[0]);

        this._targets.push(item[1]);
      });
    }

    dispose() {
      EventHandler.off(this._scrollElement, EVENT_KEY$2);
      super.dispose();
    } // Private


    _getConfig(config) {
      config = { ...Default$1,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' && config ? config : {})
      };
      config.target = getElement(config.target) || document.documentElement;
      typeCheckConfig(NAME$2, config, DefaultType$1);
      return config;
    }

    _getScrollTop() {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    }

    _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    }

    _getOffsetHeight() {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    }

    _process() {
      const scrollTop = this._getScrollTop() + this._config.offset;

      const scrollHeight = this._getScrollHeight();

      const maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        const target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }

        return;
      }

      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        this._activeTarget = null;

        this._clear();

        return;
      }

      for (let i = this._offsets.length; i--;) {
        const isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    }

    _activate(target) {
      this._activeTarget = target;

      this._clear();

      const queries = SELECTOR_LINK_ITEMS.split(',').map(selector => `${selector}[data-bs-target="${target}"],${selector}[href="${target}"]`);
      const link = SelectorEngine.findOne(queries.join(','), this._config.target);
      link.classList.add(CLASS_NAME_ACTIVE$1);

      if (link.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, link.closest(SELECTOR_DROPDOWN$1)).classList.add(CLASS_NAME_ACTIVE$1);
      } else {
        SelectorEngine.parents(link, SELECTOR_NAV_LIST_GROUP$1).forEach(listGroup => {
          // Set triggered links parents as active
          // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
          SelectorEngine.prev(listGroup, `${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`).forEach(item => item.classList.add(CLASS_NAME_ACTIVE$1)); // Handle special case when .nav-link is inside .nav-item

          SelectorEngine.prev(listGroup, SELECTOR_NAV_ITEMS).forEach(navItem => {
            SelectorEngine.children(navItem, SELECTOR_NAV_LINKS).forEach(item => item.classList.add(CLASS_NAME_ACTIVE$1));
          });
        });
      }

      EventHandler.trigger(this._scrollElement, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }

    _clear() {
      SelectorEngine.find(SELECTOR_LINK_ITEMS, this._config.target).filter(node => node.classList.contains(CLASS_NAME_ACTIVE$1)).forEach(node => node.classList.remove(CLASS_NAME_ACTIVE$1));
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = ScrollSpy.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    SelectorEngine.find(SELECTOR_DATA_SPY).forEach(spy => new ScrollSpy(spy));
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .ScrollSpy to jQuery only if jQuery is present
   */

  defineJQueryPlugin(ScrollSpy);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): tab.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$1 = 'tab';
  const DATA_KEY$1 = 'bs.tab';
  const EVENT_KEY$1 = `.${DATA_KEY$1}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}${DATA_API_KEY}`;
  const CLASS_NAME_DROPDOWN_MENU = 'dropdown-menu';
  const CLASS_NAME_ACTIVE = 'active';
  const CLASS_NAME_FADE$1 = 'fade';
  const CLASS_NAME_SHOW$1 = 'show';
  const SELECTOR_DROPDOWN = '.dropdown';
  const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  const SELECTOR_ACTIVE = '.active';
  const SELECTOR_ACTIVE_UL = ':scope > li > .active';
  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
  const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  const SELECTOR_DROPDOWN_ACTIVE_CHILD = ':scope > .dropdown-menu .active';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Tab extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$1;
    } // Public


    show() {
      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && this._element.classList.contains(CLASS_NAME_ACTIVE)) {
        return;
      }

      let previous;
      const target = getElementFromSelector(this._element);

      const listElement = this._element.closest(SELECTOR_NAV_LIST_GROUP);

      if (listElement) {
        const itemSelector = listElement.nodeName === 'UL' || listElement.nodeName === 'OL' ? SELECTOR_ACTIVE_UL : SELECTOR_ACTIVE;
        previous = SelectorEngine.find(itemSelector, listElement);
        previous = previous[previous.length - 1];
      }

      const hideEvent = previous ? EventHandler.trigger(previous, EVENT_HIDE$1, {
        relatedTarget: this._element
      }) : null;
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$1, {
        relatedTarget: previous
      });

      if (showEvent.defaultPrevented || hideEvent !== null && hideEvent.defaultPrevented) {
        return;
      }

      this._activate(this._element, listElement);

      const complete = () => {
        EventHandler.trigger(previous, EVENT_HIDDEN$1, {
          relatedTarget: this._element
        });
        EventHandler.trigger(this._element, EVENT_SHOWN$1, {
          relatedTarget: previous
        });
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    } // Private


    _activate(element, container, callback) {
      const activeElements = container && (container.nodeName === 'UL' || container.nodeName === 'OL') ? SelectorEngine.find(SELECTOR_ACTIVE_UL, container) : SelectorEngine.children(container, SELECTOR_ACTIVE);
      const active = activeElements[0];
      const isTransitioning = callback && active && active.classList.contains(CLASS_NAME_FADE$1);

      const complete = () => this._transitionComplete(element, active, callback);

      if (active && isTransitioning) {
        active.classList.remove(CLASS_NAME_SHOW$1);

        this._queueCallback(complete, element, true);
      } else {
        complete();
      }
    }

    _transitionComplete(element, active, callback) {
      if (active) {
        active.classList.remove(CLASS_NAME_ACTIVE);
        const dropdownChild = SelectorEngine.findOne(SELECTOR_DROPDOWN_ACTIVE_CHILD, active.parentNode);

        if (dropdownChild) {
          dropdownChild.classList.remove(CLASS_NAME_ACTIVE);
        }

        if (active.getAttribute('role') === 'tab') {
          active.setAttribute('aria-selected', false);
        }
      }

      element.classList.add(CLASS_NAME_ACTIVE);

      if (element.getAttribute('role') === 'tab') {
        element.setAttribute('aria-selected', true);
      }

      reflow(element);

      if (element.classList.contains(CLASS_NAME_FADE$1)) {
        element.classList.add(CLASS_NAME_SHOW$1);
      }

      let parent = element.parentNode;

      if (parent && parent.nodeName === 'LI') {
        parent = parent.parentNode;
      }

      if (parent && parent.classList.contains(CLASS_NAME_DROPDOWN_MENU)) {
        const dropdownElement = element.closest(SELECTOR_DROPDOWN);

        if (dropdownElement) {
          SelectorEngine.find(SELECTOR_DROPDOWN_TOGGLE, dropdownElement).forEach(dropdown => dropdown.classList.add(CLASS_NAME_ACTIVE));
        }

        element.setAttribute('aria-expanded', true);
      }

      if (callback) {
        callback();
      }
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tab.getOrCreateInstance(this);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    if (isDisabled(this)) {
      return;
    }

    const data = Tab.getOrCreateInstance(this);
    data.show();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Tab to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Tab);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): toast.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'toast';
  const DATA_KEY = 'bs.toast';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const CLASS_NAME_FADE = 'fade';
  const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility

  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_SHOWING = 'showing';
  const DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  const Default = {
    animation: true,
    autohide: true,
    delay: 5000
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Toast extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;

      this._setListeners();
    } // Getters


    static get DefaultType() {
      return DefaultType;
    }

    static get Default() {
      return Default;
    }

    static get NAME() {
      return NAME;
    } // Public


    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);

      if (showEvent.defaultPrevented) {
        return;
      }

      this._clearTimeout();

      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }

      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);

        EventHandler.trigger(this._element, EVENT_SHOWN);

        this._maybeScheduleHide();
      };

      this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated


      reflow(this._element);

      this._element.classList.add(CLASS_NAME_SHOW);

      this._element.classList.add(CLASS_NAME_SHOWING);

      this._queueCallback(complete, this._element, this._config.animation);
    }

    hide() {
      if (!this._element.classList.contains(CLASS_NAME_SHOW)) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);

      if (hideEvent.defaultPrevented) {
        return;
      }

      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE); // @deprecated


        this._element.classList.remove(CLASS_NAME_SHOWING);

        this._element.classList.remove(CLASS_NAME_SHOW);

        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };

      this._element.classList.add(CLASS_NAME_SHOWING);

      this._queueCallback(complete, this._element, this._config.animation);
    }

    dispose() {
      this._clearTimeout();

      if (this._element.classList.contains(CLASS_NAME_SHOW)) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }

      super.dispose();
    } // Private


    _getConfig(config) {
      config = { ...Default,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' && config ? config : {})
      };
      typeCheckConfig(NAME, config, this.constructor.DefaultType);
      return config;
    }

    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }

      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }

      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }

    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case 'mouseover':
        case 'mouseout':
          this._hasMouseInteraction = isInteracting;
          break;

        case 'focusin':
        case 'focusout':
          this._hasKeyboardInteraction = isInteracting;
          break;
      }

      if (isInteracting) {
        this._clearTimeout();

        return;
      }

      const nextElement = event.relatedTarget;

      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }

      this._maybeScheduleHide();
    }

    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
    }

    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Toast.getOrCreateInstance(this, config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config](this);
        }
      });
    }

  }

  enableDismissTrigger(Toast);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Toast to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Toast);

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  createCommonjsModule(function (module, exports) {
  !function(t,e,n,r,o){if("customElements"in n)o();else {if(n.AWAITING_WEB_COMPONENTS_POLYFILL)return void n.AWAITING_WEB_COMPONENTS_POLYFILL.then(o);var a=n.AWAITING_WEB_COMPONENTS_POLYFILL=f();a.then(o);var i=n.WEB_COMPONENTS_POLYFILL||"//cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.0.2/webcomponents-bundle.js",s=n.ES6_CORE_POLYFILL||"//cdnjs.cloudflare.com/ajax/libs/core-js/2.5.3/core.min.js";"Promise"in n?c(i).then((function(){a.isDone=!0,a.exec();})):c(s).then((function(){c(i).then((function(){a.isDone=!0,a.exec();}));}));}function f(){var t=[];return t.isDone=!1,t.exec=function(){t.splice(0).forEach((function(t){t();}));},t.then=function(e){return t.isDone?e():t.push(e),t},t}function c(t){var e=f(),n=r.createElement("script");return n.type="text/javascript",n.readyState?n.onreadystatechange=function(){"loaded"!=n.readyState&&"complete"!=n.readyState||(n.onreadystatechange=null,e.isDone=!0,e.exec());}:n.onload=function(){e.isDone=!0,e.exec();},n.src=t,r.getElementsByTagName("head")[0].appendChild(n),n.then=e.then,n}}(0,0,window,document,(function(){var e;e=function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r});},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=5)}([function(t,e){t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var n=function(t,e){var n,r=t[1]||"",o=t[3];if(!o)return r;if(e&&"function"==typeof btoa){var a=(n=o,"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(n))))+" */"),i=o.sources.map((function(t){return "/*# sourceURL="+o.sourceRoot+t+" */"}));return [r].concat(i).concat([a]).join("\n")}return [r].join("\n")}(e,t);return e[2]?"@media "+e[2]+"{"+n+"}":n})).join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var r={},o=0;o<this.length;o++){var a=this[o][0];"number"==typeof a&&(r[a]=!0);}for(o=0;o<t.length;o++){var i=t[o];"number"==typeof i[0]&&r[i[0]]||(n&&!i[2]?i[2]=n:n&&(i[2]="("+i[2]+") and ("+n+")"),e.push(i));}},e};},function(t,e,n){var r=n(3);t.exports="string"==typeof r?r:r.toString();},function(t,e,n){var r=n(4);t.exports="string"==typeof r?r:r.toString();},function(t,e,n){(t.exports=n(0)(!1)).push([t.i,"@-webkit-keyframes spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@-webkit-keyframes burst{0%{-webkit-transform:scale(1);transform:scale(1);opacity:1}90%{-webkit-transform:scale(1.5);transform:scale(1.5);opacity:0}}@keyframes burst{0%{-webkit-transform:scale(1);transform:scale(1);opacity:1}90%{-webkit-transform:scale(1.5);transform:scale(1.5);opacity:0}}@-webkit-keyframes flashing{0%{opacity:1}45%{opacity:0}90%{opacity:1}}@keyframes flashing{0%{opacity:1}45%{opacity:0}90%{opacity:1}}@-webkit-keyframes fade-left{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}75%{-webkit-transform:translateX(-20px);transform:translateX(-20px);opacity:0}}@keyframes fade-left{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}75%{-webkit-transform:translateX(-20px);transform:translateX(-20px);opacity:0}}@-webkit-keyframes fade-right{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}75%{-webkit-transform:translateX(20px);transform:translateX(20px);opacity:0}}@keyframes fade-right{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}75%{-webkit-transform:translateX(20px);transform:translateX(20px);opacity:0}}@-webkit-keyframes fade-up{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}75%{-webkit-transform:translateY(-20px);transform:translateY(-20px);opacity:0}}@keyframes fade-up{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}75%{-webkit-transform:translateY(-20px);transform:translateY(-20px);opacity:0}}@-webkit-keyframes fade-down{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}75%{-webkit-transform:translateY(20px);transform:translateY(20px);opacity:0}}@keyframes fade-down{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}75%{-webkit-transform:translateY(20px);transform:translateY(20px);opacity:0}}@-webkit-keyframes tada{0%{-webkit-transform:scaleX(1);transform:scaleX(1)}10%,20%{-webkit-transform:scale3d(.95,.95,.95) rotate(-10deg);transform:scale3d(.95,.95,.95) rotate(-10deg)}30%,50%,70%,90%{-webkit-transform:scaleX(1) rotate(10deg);transform:scaleX(1) rotate(10deg)}40%,60%,80%{-webkit-transform:scaleX(1) rotate(-10deg);transform:scaleX(1) rotate(-10deg)}to{-webkit-transform:scaleX(1);transform:scaleX(1)}}@keyframes tada{0%{-webkit-transform:scaleX(1);transform:scaleX(1)}10%,20%{-webkit-transform:scale3d(.95,.95,.95) rotate(-10deg);transform:scale3d(.95,.95,.95) rotate(-10deg)}30%,50%,70%,90%{-webkit-transform:scaleX(1) rotate(10deg);transform:scaleX(1) rotate(10deg)}40%,60%,80%{-webkit-transform:rotate(-10deg);transform:rotate(-10deg)}to{-webkit-transform:scaleX(1);transform:scaleX(1)}}.bx-spin,.bx-spin-hover:hover{-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}.bx-tada,.bx-tada-hover:hover{-webkit-animation:tada 1.5s ease infinite;animation:tada 1.5s ease infinite}.bx-flashing,.bx-flashing-hover:hover{-webkit-animation:flashing 1.5s infinite linear;animation:flashing 1.5s infinite linear}.bx-burst,.bx-burst-hover:hover{-webkit-animation:burst 1.5s infinite linear;animation:burst 1.5s infinite linear}.bx-fade-up,.bx-fade-up-hover:hover{-webkit-animation:fade-up 1.5s infinite linear;animation:fade-up 1.5s infinite linear}.bx-fade-down,.bx-fade-down-hover:hover{-webkit-animation:fade-down 1.5s infinite linear;animation:fade-down 1.5s infinite linear}.bx-fade-left,.bx-fade-left-hover:hover{-webkit-animation:fade-left 1.5s infinite linear;animation:fade-left 1.5s infinite linear}.bx-fade-right,.bx-fade-right-hover:hover{-webkit-animation:fade-right 1.5s infinite linear;animation:fade-right 1.5s infinite linear}",""]);},function(t,e,n){(t.exports=n(0)(!1)).push([t.i,'.bx-rotate-90{transform:rotate(90deg);-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)"}.bx-rotate-180{transform:rotate(180deg);-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)"}.bx-rotate-270{transform:rotate(270deg);-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)"}.bx-flip-horizontal{transform:scaleX(-1);-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)"}.bx-flip-vertical{transform:scaleY(-1);-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)"}',""]);},function(t,e,n){n.r(e),n.d(e,"BoxIconElement",(function(){return g}));var r,o,a,i,s=n(1),f=n.n(s),c=n(2),l=n.n(c),m="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),d=(o=(r=Object).getPrototypeOf||function(t){return t.__proto__},a=r.setPrototypeOf||function(t,e){return t.__proto__=e,t},i="object"===("undefined"==typeof Reflect?"undefined":m(Reflect))?Reflect.construct:function(t,e,n){var r,o=[null];return o.push.apply(o,e),r=t.bind.apply(t,o),a(new r,n.prototype)},function(t){var e=o(t);return a(t,a((function(){return i(e,arguments,o(this).constructor)}),e))}),p=window,b={},y=document.createElement("template"),h=function(){return !!p.ShadyCSS};y.innerHTML='\n<style>\n:host {\n  display: inline-block;\n  font-size: initial;\n  box-sizing: border-box;\n  width: 24px;\n  height: 24px;\n}\n:host([size=xs]) {\n    width: 0.8rem;\n    height: 0.8rem;\n}\n:host([size=sm]) {\n    width: 1.55rem;\n    height: 1.55rem;\n}\n:host([size=md]) {\n    width: 2.25rem;\n    height: 2.25rem;\n}\n:host([size=lg]) {\n    width: 3.0rem;\n    height: 3.0rem;\n}\n\n:host([size]:not([size=""]):not([size=xs]):not([size=sm]):not([size=md]):not([size=lg])) {\n    width: auto;\n    height: auto;\n}\n:host([pull=left]) #icon {\n    float: left;\n    margin-right: .3em!important;\n}\n:host([pull=right]) #icon {\n    float: right;\n    margin-left: .3em!important;\n}\n:host([border=square]) #icon {\n    padding: .25em;\n    border: .07em solid rgba(0,0,0,.1);\n    border-radius: .25em;\n}\n:host([border=circle]) #icon {\n    padding: .25em;\n    border: .07em solid rgba(0,0,0,.1);\n    border-radius: 50%;\n}\n#icon,\nsvg {\n  width: 100%;\n  height: 100%;\n}\n#icon {\n    box-sizing: border-box;\n} \n'+f.a+"\n"+l.a+'\n</style>\n<div id="icon"></div>';var g=d(function(t){function e(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e);var t=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return t.$ui=t.attachShadow({mode:"open"}),t.$ui.appendChild(t.ownerDocument.importNode(y.content,!0)),h()&&p.ShadyCSS.styleElement(t),t._state={$iconHolder:t.$ui.getElementById("icon"),type:t.getAttribute("type")},t}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}(e,HTMLElement),u(e,null,[{key:"getIconSvg",value:function(t,e){var n=this.cdnUrl+"/regular/bx-"+t+".svg";return "solid"===e?n=this.cdnUrl+"/solid/bxs-"+t+".svg":"logo"===e&&(n=this.cdnUrl+"/logos/bxl-"+t+".svg"),n&&b[n]||(b[n]=new Promise((function(t,e){var r=new XMLHttpRequest;r.addEventListener("load",(function(){this.status<200||this.status>=300?e(new Error(this.status+" "+this.responseText)):t(this.responseText);})),r.onerror=e,r.onabort=e,r.open("GET",n),r.send();}))),b[n]}},{key:"define",value:function(t){t=t||this.tagName,h()&&p.ShadyCSS.prepareTemplate(y,t),customElements.define(t,this);}},{key:"cdnUrl",get:function(){return "//unpkg.com/boxicons@2.1.2/svg"}},{key:"tagName",get:function(){return "box-icon"}},{key:"observedAttributes",get:function(){return ["type","name","color","size","rotate","flip","animation","border","pull"]}}]),u(e,[{key:"attributeChangedCallback",value:function(t,e,n){var r=this._state.$iconHolder;switch(t){case"type":!function(t,e,n){var r=t._state;r.$iconHolder.textContent="",r.type&&(r.type=null),r.type=!n||"solid"!==n&&"logo"!==n?"regular":n,void 0!==r.currentName&&t.constructor.getIconSvg(r.currentName,r.type).then((function(t){r.type===n&&(r.$iconHolder.innerHTML=t);})).catch((function(t){console.error("Failed to load icon: "+r.currentName+"\n"+t);}));}(this,0,n);break;case"name":!function(t,e,n){var r=t._state;r.currentName=n,r.$iconHolder.textContent="",n&&void 0!==r.type&&t.constructor.getIconSvg(n,r.type).then((function(t){r.currentName===n&&(r.$iconHolder.innerHTML=t);})).catch((function(t){console.error("Failed to load icon: "+n+"\n"+t);}));}(this,0,n);break;case"color":r.style.fill=n||"";break;case"size":!function(t,e,n){var r=t._state;r.size&&(r.$iconHolder.style.width=r.$iconHolder.style.height="",r.size=r.sizeType=null),n&&!/^(xs|sm|md|lg)$/.test(r.size)&&(r.size=n.trim(),r.$iconHolder.style.width=r.$iconHolder.style.height=r.size);}(this,0,n);break;case"rotate":e&&r.classList.remove("bx-rotate-"+e),n&&r.classList.add("bx-rotate-"+n);break;case"flip":e&&r.classList.remove("bx-flip-"+e),n&&r.classList.add("bx-flip-"+n);break;case"animation":e&&r.classList.remove("bx-"+e),n&&r.classList.add("bx-"+n);}}},{key:"connectedCallback",value:function(){h()&&p.ShadyCSS.styleElement(this);}}]),e}());e.default=g,g.define();}])},module.exports=e();}));

  });

  function noop() { }
  function assign(tar, src) {
      // @ts-ignore
      for (const k in src)
          tar[k] = src[k];
      return tar;
  }
  function add_location(element, file, line, column, char) {
      element.__svelte_meta = {
          loc: { file, line, column, char }
      };
  }
  function run(fn) {
      return fn();
  }
  function blank_object() {
      return Object.create(null);
  }
  function run_all(fns) {
      fns.forEach(run);
  }
  function is_function(thing) {
      return typeof thing === 'function';
  }
  function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
  }
  let src_url_equal_anchor;
  function src_url_equal(element_src, url) {
      if (!src_url_equal_anchor) {
          src_url_equal_anchor = document.createElement('a');
      }
      src_url_equal_anchor.href = url;
      return element_src === src_url_equal_anchor.href;
  }
  function is_empty(obj) {
      return Object.keys(obj).length === 0;
  }
  function validate_store(store, name) {
      if (store != null && typeof store.subscribe !== 'function') {
          throw new Error(`'${name}' is not a store with a 'subscribe' method`);
      }
  }
  function subscribe(store, ...callbacks) {
      if (store == null) {
          return noop;
      }
      const unsub = store.subscribe(...callbacks);
      return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function component_subscribe(component, store, callback) {
      component.$$.on_destroy.push(subscribe(store, callback));
  }
  function create_slot(definition, ctx, $$scope, fn) {
      if (definition) {
          const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
          return definition[0](slot_ctx);
      }
  }
  function get_slot_context(definition, ctx, $$scope, fn) {
      return definition[1] && fn
          ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
          : $$scope.ctx;
  }
  function get_slot_changes(definition, $$scope, dirty, fn) {
      if (definition[2] && fn) {
          const lets = definition[2](fn(dirty));
          if ($$scope.dirty === undefined) {
              return lets;
          }
          if (typeof lets === 'object') {
              const merged = [];
              const len = Math.max($$scope.dirty.length, lets.length);
              for (let i = 0; i < len; i += 1) {
                  merged[i] = $$scope.dirty[i] | lets[i];
              }
              return merged;
          }
          return $$scope.dirty | lets;
      }
      return $$scope.dirty;
  }
  function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
      if (slot_changes) {
          const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
          slot.p(slot_context, slot_changes);
      }
  }
  function get_all_dirty_from_scope($$scope) {
      if ($$scope.ctx.length > 32) {
          const dirty = [];
          const length = $$scope.ctx.length / 32;
          for (let i = 0; i < length; i++) {
              dirty[i] = -1;
          }
          return dirty;
      }
      return -1;
  }
  function null_to_empty(value) {
      return value == null ? '' : value;
  }
  function append(target, node) {
      target.appendChild(node);
  }
  function insert(target, node, anchor) {
      target.insertBefore(node, anchor || null);
  }
  function detach(node) {
      node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
      for (let i = 0; i < iterations.length; i += 1) {
          if (iterations[i])
              iterations[i].d(detaching);
      }
  }
  function element(name) {
      return document.createElement(name);
  }
  function text(data) {
      return document.createTextNode(data);
  }
  function space() {
      return text(' ');
  }
  function listen(node, event, handler, options) {
      node.addEventListener(event, handler, options);
      return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
      if (value == null)
          node.removeAttribute(attribute);
      else if (node.getAttribute(attribute) !== value)
          node.setAttribute(attribute, value);
  }
  function children(element) {
      return Array.from(element.childNodes);
  }
  function set_style(node, key, value, important) {
      if (value === null) {
          node.style.removeProperty(key);
      }
      else {
          node.style.setProperty(key, value, important ? 'important' : '');
      }
  }
  function custom_event(type, detail, bubbles = false) {
      const e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, bubbles, false, detail);
      return e;
  }

  let current_component;
  function set_current_component(component) {
      current_component = component;
  }
  function get_current_component() {
      if (!current_component)
          throw new Error('Function called outside component initialization');
      return current_component;
  }
  function onMount(fn) {
      get_current_component().$$.on_mount.push(fn);
  }
  function createEventDispatcher() {
      const component = get_current_component();
      return (type, detail) => {
          const callbacks = component.$$.callbacks[type];
          if (callbacks) {
              // TODO are there situations where events could be dispatched
              // in a server (non-DOM) environment?
              const event = custom_event(type, detail);
              callbacks.slice().forEach(fn => {
                  fn.call(component, event);
              });
          }
      };
  }

  const dirty_components = [];
  const binding_callbacks = [];
  const render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
      if (!update_scheduled) {
          update_scheduled = true;
          resolved_promise.then(flush);
      }
  }
  function add_render_callback(fn) {
      render_callbacks.push(fn);
  }
  // flush() calls callbacks in this order:
  // 1. All beforeUpdate callbacks, in order: parents before children
  // 2. All bind:this callbacks, in reverse order: children before parents.
  // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
  //    for afterUpdates called during the initial onMount, which are called in
  //    reverse order: children before parents.
  // Since callbacks might update component values, which could trigger another
  // call to flush(), the following steps guard against this:
  // 1. During beforeUpdate, any updated components will be added to the
  //    dirty_components array and will cause a reentrant call to flush(). Because
  //    the flush index is kept outside the function, the reentrant call will pick
  //    up where the earlier call left off and go through all dirty components. The
  //    current_component value is saved and restored so that the reentrant call will
  //    not interfere with the "parent" flush() call.
  // 2. bind:this callbacks cannot trigger new flush() calls.
  // 3. During afterUpdate, any updated components will NOT have their afterUpdate
  //    callback called a second time; the seen_callbacks set, outside the flush()
  //    function, guarantees this behavior.
  const seen_callbacks = new Set();
  let flushidx = 0; // Do *not* move this inside the flush() function
  function flush() {
      const saved_component = current_component;
      do {
          // first, call beforeUpdate functions
          // and update components
          while (flushidx < dirty_components.length) {
              const component = dirty_components[flushidx];
              flushidx++;
              set_current_component(component);
              update(component.$$);
          }
          set_current_component(null);
          dirty_components.length = 0;
          flushidx = 0;
          while (binding_callbacks.length)
              binding_callbacks.pop()();
          // then, once components are updated, call
          // afterUpdate functions. This may cause
          // subsequent updates...
          for (let i = 0; i < render_callbacks.length; i += 1) {
              const callback = render_callbacks[i];
              if (!seen_callbacks.has(callback)) {
                  // ...so guard against infinite loops
                  seen_callbacks.add(callback);
                  callback();
              }
          }
          render_callbacks.length = 0;
      } while (dirty_components.length);
      while (flush_callbacks.length) {
          flush_callbacks.pop()();
      }
      update_scheduled = false;
      seen_callbacks.clear();
      set_current_component(saved_component);
  }
  function update($$) {
      if ($$.fragment !== null) {
          $$.update();
          run_all($$.before_update);
          const dirty = $$.dirty;
          $$.dirty = [-1];
          $$.fragment && $$.fragment.p($$.ctx, dirty);
          $$.after_update.forEach(add_render_callback);
      }
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
      outros = {
          r: 0,
          c: [],
          p: outros // parent group
      };
  }
  function check_outros() {
      if (!outros.r) {
          run_all(outros.c);
      }
      outros = outros.p;
  }
  function transition_in(block, local) {
      if (block && block.i) {
          outroing.delete(block);
          block.i(local);
      }
  }
  function transition_out(block, local, detach, callback) {
      if (block && block.o) {
          if (outroing.has(block))
              return;
          outroing.add(block);
          outros.c.push(() => {
              outroing.delete(block);
              if (callback) {
                  if (detach)
                      block.d(1);
                  callback();
              }
          });
          block.o(local);
      }
  }

  function get_spread_update(levels, updates) {
      const update = {};
      const to_null_out = {};
      const accounted_for = { $$scope: 1 };
      let i = levels.length;
      while (i--) {
          const o = levels[i];
          const n = updates[i];
          if (n) {
              for (const key in o) {
                  if (!(key in n))
                      to_null_out[key] = 1;
              }
              for (const key in n) {
                  if (!accounted_for[key]) {
                      update[key] = n[key];
                      accounted_for[key] = 1;
                  }
              }
              levels[i] = n;
          }
          else {
              for (const key in o) {
                  accounted_for[key] = 1;
              }
          }
      }
      for (const key in to_null_out) {
          if (!(key in update))
              update[key] = undefined;
      }
      return update;
  }
  function get_spread_object(spread_props) {
      return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
  }
  function create_component(block) {
      block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
      const { fragment, on_mount, on_destroy, after_update } = component.$$;
      fragment && fragment.m(target, anchor);
      if (!customElement) {
          // onMount happens before the initial afterUpdate
          add_render_callback(() => {
              const new_on_destroy = on_mount.map(run).filter(is_function);
              if (on_destroy) {
                  on_destroy.push(...new_on_destroy);
              }
              else {
                  // Edge case - component was destroyed immediately,
                  // most likely as a result of a binding initialising
                  run_all(new_on_destroy);
              }
              component.$$.on_mount = [];
          });
      }
      after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
      const $$ = component.$$;
      if ($$.fragment !== null) {
          run_all($$.on_destroy);
          $$.fragment && $$.fragment.d(detaching);
          // TODO null out other refs, including component.$$ (but need to
          // preserve final state?)
          $$.on_destroy = $$.fragment = null;
          $$.ctx = [];
      }
  }
  function make_dirty(component, i) {
      if (component.$$.dirty[0] === -1) {
          dirty_components.push(component);
          schedule_update();
          component.$$.dirty.fill(0);
      }
      component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
  }
  function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
      const parent_component = current_component;
      set_current_component(component);
      const $$ = component.$$ = {
          fragment: null,
          ctx: null,
          // state
          props,
          update: noop,
          not_equal,
          bound: blank_object(),
          // lifecycle
          on_mount: [],
          on_destroy: [],
          on_disconnect: [],
          before_update: [],
          after_update: [],
          context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
          // everything else
          callbacks: blank_object(),
          dirty,
          skip_bound: false,
          root: options.target || parent_component.$$.root
      };
      append_styles && append_styles($$.root);
      let ready = false;
      $$.ctx = instance
          ? instance(component, options.props || {}, (i, ret, ...rest) => {
              const value = rest.length ? rest[0] : ret;
              if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                  if (!$$.skip_bound && $$.bound[i])
                      $$.bound[i](value);
                  if (ready)
                      make_dirty(component, i);
              }
              return ret;
          })
          : [];
      $$.update();
      ready = true;
      run_all($$.before_update);
      // `false` as a special case of no DOM component
      $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
      if (options.target) {
          if (options.hydrate) {
              const nodes = children(options.target);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.l(nodes);
              nodes.forEach(detach);
          }
          else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.c();
          }
          if (options.intro)
              transition_in(component.$$.fragment);
          mount_component(component, options.target, options.anchor, options.customElement);
          flush();
      }
      set_current_component(parent_component);
  }
  /**
   * Base class for Svelte components. Used when dev=false.
   */
  class SvelteComponent {
      $destroy() {
          destroy_component(this, 1);
          this.$destroy = noop;
      }
      $on(type, callback) {
          const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
          callbacks.push(callback);
          return () => {
              const index = callbacks.indexOf(callback);
              if (index !== -1)
                  callbacks.splice(index, 1);
          };
      }
      $set($$props) {
          if (this.$$set && !is_empty($$props)) {
              this.$$.skip_bound = true;
              this.$$set($$props);
              this.$$.skip_bound = false;
          }
      }
  }

  function dispatch_dev(type, detail) {
      document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
  }
  function append_dev(target, node) {
      dispatch_dev('SvelteDOMInsert', { target, node });
      append(target, node);
  }
  function insert_dev(target, node, anchor) {
      dispatch_dev('SvelteDOMInsert', { target, node, anchor });
      insert(target, node, anchor);
  }
  function detach_dev(node) {
      dispatch_dev('SvelteDOMRemove', { node });
      detach(node);
  }
  function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
      const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
      if (has_prevent_default)
          modifiers.push('preventDefault');
      if (has_stop_propagation)
          modifiers.push('stopPropagation');
      dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
      const dispose = listen(node, event, handler, options);
      return () => {
          dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
          dispose();
      };
  }
  function attr_dev(node, attribute, value) {
      attr(node, attribute, value);
      if (value == null)
          dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
      else
          dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
  }
  function set_data_dev(text, data) {
      data = '' + data;
      if (text.wholeText === data)
          return;
      dispatch_dev('SvelteDOMSetData', { node: text, data });
      text.data = data;
  }
  function validate_each_argument(arg) {
      if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
          let msg = '{#each} only iterates over array-like objects.';
          if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
              msg += ' You can use a spread to convert this iterable into an array.';
          }
          throw new Error(msg);
      }
  }
  function validate_slots(name, slot, keys) {
      for (const slot_key of Object.keys(slot)) {
          if (!~keys.indexOf(slot_key)) {
              console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
          }
      }
  }
  /**
   * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
   */
  class SvelteComponentDev extends SvelteComponent {
      constructor(options) {
          if (!options || (!options.target && !options.$$inline)) {
              throw new Error("'target' is a required option");
          }
          super();
      }
      $destroy() {
          super.$destroy();
          this.$destroy = () => {
              console.warn('Component was already destroyed'); // eslint-disable-line no-console
          };
      }
      $capture_state() { }
      $inject_state() { }
  }

  var page = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
  	module.exports = factory() ;
  }(commonjsGlobal, (function () {
  var isarray = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };

  /**
   * Expose `pathToRegexp`.
   */
  var pathToRegexp_1 = pathToRegexp;
  var parse_1 = parse;
  var compile_1 = compile;
  var tokensToFunction_1 = tokensToFunction;
  var tokensToRegExp_1 = tokensToRegExp;

  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  var PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
  ].join('|'), 'g');

  /**
   * Parse a string for the raw tokens.
   *
   * @param  {String} str
   * @return {Array}
   */
  function parse (str) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var res;

    while ((res = PATH_REGEXP.exec(str)) != null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;

      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        continue
      }

      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
      }

      var prefix = res[2];
      var name = res[3];
      var capture = res[4];
      var group = res[5];
      var suffix = res[6];
      var asterisk = res[7];

      var repeat = suffix === '+' || suffix === '*';
      var optional = suffix === '?' || suffix === '*';
      var delimiter = prefix || '/';
      var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

      tokens.push({
        name: name || key++,
        prefix: prefix || '',
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        pattern: escapeGroup(pattern)
      });
    }

    // Match any characters still remaining.
    if (index < str.length) {
      path += str.substr(index);
    }

    // If the path exists, push it onto the end.
    if (path) {
      tokens.push(path);
    }

    return tokens
  }

  /**
   * Compile a string to a template function for the path.
   *
   * @param  {String}   str
   * @return {Function}
   */
  function compile (str) {
    return tokensToFunction(parse(str))
  }

  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction (tokens) {
    // Compile all the tokens into regexps.
    var matches = new Array(tokens.length);

    // Compile all the patterns before compilation.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^' + tokens[i].pattern + '$');
      }
    }

    return function (obj) {
      var path = '';
      var data = obj || {};

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          path += token;

          continue
        }

        var value = data[token.name];
        var segment;

        if (value == null) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to be defined')
          }
        }

        if (isarray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
          }

          if (value.length === 0) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }
          }

          for (var j = 0; j < value.length; j++) {
            segment = encodeURIComponent(value[j]);

            if (!matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
            }

            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }

          continue
        }

        segment = encodeURIComponent(value);

        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
        }

        path += token.prefix + segment;
      }

      return path
    }
  }

  /**
   * Escape a regular expression string.
   *
   * @param  {String} str
   * @return {String}
   */
  function escapeString (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
  }

  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {String} group
   * @return {String}
   */
  function escapeGroup (group) {
    return group.replace(/([=!:$\/()])/g, '\\$1')
  }

  /**
   * Attach the keys as a property of the regexp.
   *
   * @param  {RegExp} re
   * @param  {Array}  keys
   * @return {RegExp}
   */
  function attachKeys (re, keys) {
    re.keys = keys;
    return re
  }

  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {String}
   */
  function flags (options) {
    return options.sensitive ? '' : 'i'
  }

  /**
   * Pull out keys from a regexp.
   *
   * @param  {RegExp} path
   * @param  {Array}  keys
   * @return {RegExp}
   */
  function regexpToRegexp (path, keys) {
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          pattern: null
        });
      }
    }

    return attachKeys(path, keys)
  }

  /**
   * Transform an array into a regexp.
   *
   * @param  {Array}  path
   * @param  {Array}  keys
   * @param  {Object} options
   * @return {RegExp}
   */
  function arrayToRegexp (path, keys, options) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }

    var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

    return attachKeys(regexp, keys)
  }

  /**
   * Create a path regexp from string input.
   *
   * @param  {String} path
   * @param  {Array}  keys
   * @param  {Object} options
   * @return {RegExp}
   */
  function stringToRegexp (path, keys, options) {
    var tokens = parse(path);
    var re = tokensToRegExp(tokens, options);

    // Attach keys back to the regexp.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] !== 'string') {
        keys.push(tokens[i]);
      }
    }

    return attachKeys(re, keys)
  }

  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {Array}  tokens
   * @param  {Array}  keys
   * @param  {Object} options
   * @return {RegExp}
   */
  function tokensToRegExp (tokens, options) {
    options = options || {};

    var strict = options.strict;
    var end = options.end !== false;
    var route = '';
    var lastToken = tokens[tokens.length - 1];
    var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        route += escapeString(token);
      } else {
        var prefix = escapeString(token.prefix);
        var capture = token.pattern;

        if (token.repeat) {
          capture += '(?:' + prefix + capture + ')*';
        }

        if (token.optional) {
          if (prefix) {
            capture = '(?:' + prefix + '(' + capture + '))?';
          } else {
            capture = '(' + capture + ')?';
          }
        } else {
          capture = prefix + '(' + capture + ')';
        }

        route += capture;
      }
    }

    // In non-strict mode we allow a slash at the end of match. If the path to
    // match already ends with a slash, we remove it for consistency. The slash
    // is valid at the end of a path match, not in the middle. This is important
    // in non-ending mode, where "/test/" shouldn't match "/test//route".
    if (!strict) {
      route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
    }

    if (end) {
      route += '$';
    } else {
      // In non-ending mode, we need the capturing groups to match as much as
      // possible by using a positive lookahead to the end or next path segment.
      route += strict && endsWithSlash ? '' : '(?=\\/|$)';
    }

    return new RegExp('^' + route, flags(options))
  }

  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(String|RegExp|Array)} path
   * @param  {Array}                 [keys]
   * @param  {Object}                [options]
   * @return {RegExp}
   */
  function pathToRegexp (path, keys, options) {
    keys = keys || [];

    if (!isarray(keys)) {
      options = keys;
      keys = [];
    } else if (!options) {
      options = {};
    }

    if (path instanceof RegExp) {
      return regexpToRegexp(path, keys)
    }

    if (isarray(path)) {
      return arrayToRegexp(path, keys, options)
    }

    return stringToRegexp(path, keys, options)
  }

  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

  /**
     * Module dependencies.
     */

    

    /**
     * Short-cuts for global-object checks
     */

    var hasDocument = ('undefined' !== typeof document);
    var hasWindow = ('undefined' !== typeof window);
    var hasHistory = ('undefined' !== typeof history);
    var hasProcess = typeof process !== 'undefined';

    /**
     * Detect click event
     */
    var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

    /**
     * To work properly with the URL
     * history.location generated polyfill in https://github.com/devote/HTML5-History-API
     */

    var isLocation = hasWindow && !!(window.history.location || window.location);

    /**
     * The page instance
     * @api private
     */
    function Page() {
      // public things
      this.callbacks = [];
      this.exits = [];
      this.current = '';
      this.len = 0;

      // private things
      this._decodeURLComponents = true;
      this._base = '';
      this._strict = false;
      this._running = false;
      this._hashbang = false;

      // bound functions
      this.clickHandler = this.clickHandler.bind(this);
      this._onpopstate = this._onpopstate.bind(this);
    }

    /**
     * Configure the instance of page. This can be called multiple times.
     *
     * @param {Object} options
     * @api public
     */

    Page.prototype.configure = function(options) {
      var opts = options || {};

      this._window = opts.window || (hasWindow && window);
      this._decodeURLComponents = opts.decodeURLComponents !== false;
      this._popstate = opts.popstate !== false && hasWindow;
      this._click = opts.click !== false && hasDocument;
      this._hashbang = !!opts.hashbang;

      var _window = this._window;
      if(this._popstate) {
        _window.addEventListener('popstate', this._onpopstate, false);
      } else if(hasWindow) {
        _window.removeEventListener('popstate', this._onpopstate, false);
      }

      if (this._click) {
        _window.document.addEventListener(clickEvent, this.clickHandler, false);
      } else if(hasDocument) {
        _window.document.removeEventListener(clickEvent, this.clickHandler, false);
      }

      if(this._hashbang && hasWindow && !hasHistory) {
        _window.addEventListener('hashchange', this._onpopstate, false);
      } else if(hasWindow) {
        _window.removeEventListener('hashchange', this._onpopstate, false);
      }
    };

    /**
     * Get or set basepath to `path`.
     *
     * @param {string} path
     * @api public
     */

    Page.prototype.base = function(path) {
      if (0 === arguments.length) return this._base;
      this._base = path;
    };

    /**
     * Gets the `base`, which depends on whether we are using History or
     * hashbang routing.

     * @api private
     */
    Page.prototype._getBase = function() {
      var base = this._base;
      if(!!base) return base;
      var loc = hasWindow && this._window && this._window.location;

      if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
        base = loc.pathname;
      }

      return base;
    };

    /**
     * Get or set strict path matching to `enable`
     *
     * @param {boolean} enable
     * @api public
     */

    Page.prototype.strict = function(enable) {
      if (0 === arguments.length) return this._strict;
      this._strict = enable;
    };


    /**
     * Bind with the given `options`.
     *
     * Options:
     *
     *    - `click` bind to click events [true]
     *    - `popstate` bind to popstate [true]
     *    - `dispatch` perform initial dispatch [true]
     *
     * @param {Object} options
     * @api public
     */

    Page.prototype.start = function(options) {
      var opts = options || {};
      this.configure(opts);

      if (false === opts.dispatch) return;
      this._running = true;

      var url;
      if(isLocation) {
        var window = this._window;
        var loc = window.location;

        if(this._hashbang && ~loc.hash.indexOf('#!')) {
          url = loc.hash.substr(2) + loc.search;
        } else if (this._hashbang) {
          url = loc.search + loc.hash;
        } else {
          url = loc.pathname + loc.search + loc.hash;
        }
      }

      this.replace(url, null, true, opts.dispatch);
    };

    /**
     * Unbind click and popstate event handlers.
     *
     * @api public
     */

    Page.prototype.stop = function() {
      if (!this._running) return;
      this.current = '';
      this.len = 0;
      this._running = false;

      var window = this._window;
      this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
      hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
      hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
    };

    /**
     * Show `path` with optional `state` object.
     *
     * @param {string} path
     * @param {Object=} state
     * @param {boolean=} dispatch
     * @param {boolean=} push
     * @return {!Context}
     * @api public
     */

    Page.prototype.show = function(path, state, dispatch, push) {
      var ctx = new Context(path, state, this),
        prev = this.prevContext;
      this.prevContext = ctx;
      this.current = ctx.path;
      if (false !== dispatch) this.dispatch(ctx, prev);
      if (false !== ctx.handled && false !== push) ctx.pushState();
      return ctx;
    };

    /**
     * Goes back in the history
     * Back should always let the current route push state and then go back.
     *
     * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
     * @param {Object=} state
     * @api public
     */

    Page.prototype.back = function(path, state) {
      var page = this;
      if (this.len > 0) {
        var window = this._window;
        // this may need more testing to see if all browsers
        // wait for the next tick to go back in history
        hasHistory && window.history.back();
        this.len--;
      } else if (path) {
        setTimeout(function() {
          page.show(path, state);
        });
      } else {
        setTimeout(function() {
          page.show(page._getBase(), state);
        });
      }
    };

    /**
     * Register route to redirect from one path to other
     * or just redirect to another route
     *
     * @param {string} from - if param 'to' is undefined redirects to 'from'
     * @param {string=} to
     * @api public
     */
    Page.prototype.redirect = function(from, to) {
      var inst = this;

      // Define route from a path to another
      if ('string' === typeof from && 'string' === typeof to) {
        page.call(this, from, function(e) {
          setTimeout(function() {
            inst.replace(/** @type {!string} */ (to));
          }, 0);
        });
      }

      // Wait for the push state and replace it with another
      if ('string' === typeof from && 'undefined' === typeof to) {
        setTimeout(function() {
          inst.replace(from);
        }, 0);
      }
    };

    /**
     * Replace `path` with optional `state` object.
     *
     * @param {string} path
     * @param {Object=} state
     * @param {boolean=} init
     * @param {boolean=} dispatch
     * @return {!Context}
     * @api public
     */


    Page.prototype.replace = function(path, state, init, dispatch) {
      var ctx = new Context(path, state, this),
        prev = this.prevContext;
      this.prevContext = ctx;
      this.current = ctx.path;
      ctx.init = init;
      ctx.save(); // save before dispatching, which may redirect
      if (false !== dispatch) this.dispatch(ctx, prev);
      return ctx;
    };

    /**
     * Dispatch the given `ctx`.
     *
     * @param {Context} ctx
     * @api private
     */

    Page.prototype.dispatch = function(ctx, prev) {
      var i = 0, j = 0, page = this;

      function nextExit() {
        var fn = page.exits[j++];
        if (!fn) return nextEnter();
        fn(prev, nextExit);
      }

      function nextEnter() {
        var fn = page.callbacks[i++];

        if (ctx.path !== page.current) {
          ctx.handled = false;
          return;
        }
        if (!fn) return unhandled.call(page, ctx);
        fn(ctx, nextEnter);
      }

      if (prev) {
        nextExit();
      } else {
        nextEnter();
      }
    };

    /**
     * Register an exit route on `path` with
     * callback `fn()`, which will be called
     * on the previous context when a new
     * page is visited.
     */
    Page.prototype.exit = function(path, fn) {
      if (typeof path === 'function') {
        return this.exit('*', path);
      }

      var route = new Route(path, null, this);
      for (var i = 1; i < arguments.length; ++i) {
        this.exits.push(route.middleware(arguments[i]));
      }
    };

    /**
     * Handle "click" events.
     */

    /* jshint +W054 */
    Page.prototype.clickHandler = function(e) {
      if (1 !== this._which(e)) return;

      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (e.defaultPrevented) return;

      // ensure link
      // use shadow dom when available if not, fall back to composedPath()
      // for browsers that only have shady
      var el = e.target;
      var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

      if(eventPath) {
        for (var i = 0; i < eventPath.length; i++) {
          if (!eventPath[i].nodeName) continue;
          if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
          if (!eventPath[i].href) continue;

          el = eventPath[i];
          break;
        }
      }

      // continue ensure link
      // el.nodeName for svg links are 'a' instead of 'A'
      while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
      if (!el || 'A' !== el.nodeName.toUpperCase()) return;

      // check if link is inside an svg
      // in this case, both href and target are always inside an object
      var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

      // Ignore if tag has
      // 1. "download" attribute
      // 2. rel="external" attribute
      if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

      // ensure non-hash for the same path
      var link = el.getAttribute('href');
      if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

      // Check for mailto: in the href
      if (link && link.indexOf('mailto:') > -1) return;

      // check target
      // svg target is an object and its desired value is in .baseVal property
      if (svg ? el.target.baseVal : el.target) return;

      // x-origin
      // note: svg links that are not relative don't call click events (and skip page.js)
      // consequently, all svg links tested inside page.js are relative and in the same origin
      if (!svg && !this.sameOrigin(el.href)) return;

      // rebuild path
      // There aren't .pathname and .search properties in svg links, so we use href
      // Also, svg href is an object and its desired value is in .baseVal property
      var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

      path = path[0] !== '/' ? '/' + path : path;

      // strip leading "/[drive letter]:" on NW.js on Windows
      if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
        path = path.replace(/^\/[a-zA-Z]:\//, '/');
      }

      // same page
      var orig = path;
      var pageBase = this._getBase();

      if (path.indexOf(pageBase) === 0) {
        path = path.substr(pageBase.length);
      }

      if (this._hashbang) path = path.replace('#!', '');

      if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
        return;
      }

      e.preventDefault();
      this.show(orig);
    };

    /**
     * Handle "populate" events.
     * @api private
     */

    Page.prototype._onpopstate = (function () {
      var loaded = false;
      if ( ! hasWindow ) {
        return function () {};
      }
      if (hasDocument && document.readyState === 'complete') {
        loaded = true;
      } else {
        window.addEventListener('load', function() {
          setTimeout(function() {
            loaded = true;
          }, 0);
        });
      }
      return function onpopstate(e) {
        if (!loaded) return;
        var page = this;
        if (e.state) {
          var path = e.state.path;
          page.replace(path, e.state);
        } else if (isLocation) {
          var loc = page._window.location;
          page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
        }
      };
    })();

    /**
     * Event button.
     */
    Page.prototype._which = function(e) {
      e = e || (hasWindow && this._window.event);
      return null == e.which ? e.button : e.which;
    };

    /**
     * Convert to a URL object
     * @api private
     */
    Page.prototype._toURL = function(href) {
      var window = this._window;
      if(typeof URL === 'function' && isLocation) {
        return new URL(href, window.location.toString());
      } else if (hasDocument) {
        var anc = window.document.createElement('a');
        anc.href = href;
        return anc;
      }
    };

    /**
     * Check if `href` is the same origin.
     * @param {string} href
     * @api public
     */
    Page.prototype.sameOrigin = function(href) {
      if(!href || !isLocation) return false;

      var url = this._toURL(href);
      var window = this._window;

      var loc = window.location;

      /*
         When the port is the default http port 80 for http, or 443 for
         https, internet explorer 11 returns an empty string for loc.port,
         so we need to compare loc.port with an empty string if url.port
         is the default port 80 or 443.
         Also the comparition with `port` is changed from `===` to `==` because
         `port` can be a string sometimes. This only applies to ie11.
      */
      return loc.protocol === url.protocol &&
        loc.hostname === url.hostname &&
        (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
    };

    /**
     * @api private
     */
    Page.prototype._samePath = function(url) {
      if(!isLocation) return false;
      var window = this._window;
      var loc = window.location;
      return url.pathname === loc.pathname &&
        url.search === loc.search;
    };

    /**
     * Remove URL encoding from the given `str`.
     * Accommodates whitespace in both x-www-form-urlencoded
     * and regular percent-encoded form.
     *
     * @param {string} val - URL component to decode
     * @api private
     */
    Page.prototype._decodeURLEncodedURIComponent = function(val) {
      if (typeof val !== 'string') { return val; }
      return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
    };

    /**
     * Create a new `page` instance and function
     */
    function createPage() {
      var pageInstance = new Page();

      function pageFn(/* args */) {
        return page.apply(pageInstance, arguments);
      }

      // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
      pageFn.callbacks = pageInstance.callbacks;
      pageFn.exits = pageInstance.exits;
      pageFn.base = pageInstance.base.bind(pageInstance);
      pageFn.strict = pageInstance.strict.bind(pageInstance);
      pageFn.start = pageInstance.start.bind(pageInstance);
      pageFn.stop = pageInstance.stop.bind(pageInstance);
      pageFn.show = pageInstance.show.bind(pageInstance);
      pageFn.back = pageInstance.back.bind(pageInstance);
      pageFn.redirect = pageInstance.redirect.bind(pageInstance);
      pageFn.replace = pageInstance.replace.bind(pageInstance);
      pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
      pageFn.exit = pageInstance.exit.bind(pageInstance);
      pageFn.configure = pageInstance.configure.bind(pageInstance);
      pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
      pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

      pageFn.create = createPage;

      Object.defineProperty(pageFn, 'len', {
        get: function(){
          return pageInstance.len;
        },
        set: function(val) {
          pageInstance.len = val;
        }
      });

      Object.defineProperty(pageFn, 'current', {
        get: function(){
          return pageInstance.current;
        },
        set: function(val) {
          pageInstance.current = val;
        }
      });

      // In 2.0 these can be named exports
      pageFn.Context = Context;
      pageFn.Route = Route;

      return pageFn;
    }

    /**
     * Register `path` with callback `fn()`,
     * or route `path`, or redirection,
     * or `page.start()`.
     *
     *   page(fn);
     *   page('*', fn);
     *   page('/user/:id', load, user);
     *   page('/user/' + user.id, { some: 'thing' });
     *   page('/user/' + user.id);
     *   page('/from', '/to')
     *   page();
     *
     * @param {string|!Function|!Object} path
     * @param {Function=} fn
     * @api public
     */

    function page(path, fn) {
      // <callback>
      if ('function' === typeof path) {
        return page.call(this, '*', path);
      }

      // route <path> to <callback ...>
      if ('function' === typeof fn) {
        var route = new Route(/** @type {string} */ (path), null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.callbacks.push(route.middleware(arguments[i]));
        }
        // show <path> with [state]
      } else if ('string' === typeof path) {
        this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
        // start [options]
      } else {
        this.start(path);
      }
    }

    /**
     * Unhandled `ctx`. When it's not the initial
     * popstate then redirect. If you wish to handle
     * 404s on your own use `page('*', callback)`.
     *
     * @param {Context} ctx
     * @api private
     */
    function unhandled(ctx) {
      if (ctx.handled) return;
      var current;
      var page = this;
      var window = page._window;

      if (page._hashbang) {
        current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
      } else {
        current = isLocation && window.location.pathname + window.location.search;
      }

      if (current === ctx.canonicalPath) return;
      page.stop();
      ctx.handled = false;
      isLocation && (window.location.href = ctx.canonicalPath);
    }

    /**
     * Escapes RegExp characters in the given string.
     *
     * @param {string} s
     * @api private
     */
    function escapeRegExp(s) {
      return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
    }

    /**
     * Initialize a new "request" `Context`
     * with the given `path` and optional initial `state`.
     *
     * @constructor
     * @param {string} path
     * @param {Object=} state
     * @api public
     */

    function Context(path, state, pageInstance) {
      var _page = this.page = pageInstance || page;
      var window = _page._window;
      var hashbang = _page._hashbang;

      var pageBase = _page._getBase();
      if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
      var i = path.indexOf('?');

      this.canonicalPath = path;
      var re = new RegExp('^' + escapeRegExp(pageBase));
      this.path = path.replace(re, '') || '/';
      if (hashbang) this.path = this.path.replace('#!', '') || '/';

      this.title = (hasDocument && window.document.title);
      this.state = state || {};
      this.state.path = path;
      this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
      this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
      this.params = {};

      // fragment
      this.hash = '';
      if (!hashbang) {
        if (!~this.path.indexOf('#')) return;
        var parts = this.path.split('#');
        this.path = this.pathname = parts[0];
        this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
        this.querystring = this.querystring.split('#')[0];
      }
    }

    /**
     * Push state.
     *
     * @api private
     */

    Context.prototype.pushState = function() {
      var page = this.page;
      var window = page._window;
      var hashbang = page._hashbang;

      page.len++;
      if (hasHistory) {
          window.history.pushState(this.state, this.title,
            hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
      }
    };

    /**
     * Save the context state.
     *
     * @api public
     */

    Context.prototype.save = function() {
      var page = this.page;
      if (hasHistory) {
          page._window.history.replaceState(this.state, this.title,
            page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
      }
    };

    /**
     * Initialize `Route` with the given HTTP `path`,
     * and an array of `callbacks` and `options`.
     *
     * Options:
     *
     *   - `sensitive`    enable case-sensitive routes
     *   - `strict`       enable strict matching for trailing slashes
     *
     * @constructor
     * @param {string} path
     * @param {Object=} options
     * @api private
     */

    function Route(path, options, page) {
      var _page = this.page = page || globalPage;
      var opts = options || {};
      opts.strict = opts.strict || _page._strict;
      this.path = (path === '*') ? '(.*)' : path;
      this.method = 'GET';
      this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
    }

    /**
     * Return route middleware with
     * the given callback `fn()`.
     *
     * @param {Function} fn
     * @return {Function}
     * @api public
     */

    Route.prototype.middleware = function(fn) {
      var self = this;
      return function(ctx, next) {
        if (self.match(ctx.path, ctx.params)) {
          ctx.routePath = self.path;
          return fn(ctx, next);
        }
        next();
      };
    };

    /**
     * Check if this route matches `path`, if so
     * populate `params`.
     *
     * @param {string} path
     * @param {Object} params
     * @return {boolean}
     * @api private
     */

    Route.prototype.match = function(path, params) {
      var keys = this.keys,
        qsIndex = path.indexOf('?'),
        pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
        m = this.regexp.exec(decodeURIComponent(pathname));

      if (!m) return false;

      delete params[0];

      for (var i = 1, len = m.length; i < len; ++i) {
        var key = keys[i - 1];
        var val = this.page._decodeURLEncodedURIComponent(m[i]);
        if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
          params[key.name] = val;
        }
      }

      return true;
    };


    /**
     * Module exports.
     */

    var globalPage = createPage();
    var page_js = globalPage;
    var default_1 = globalPage;

  page_js.default = default_1;

  return page_js;

  })));
  });

  /* src/components/Hero.svelte generated by Svelte v3.47.0 */

  const file$j = "src/components/Hero.svelte";

  function create_fragment$k(ctx) {
  	let section;
  	let div;
  	let h1;
  	let t1;
  	let h2;
  	let t3;
  	let a;

  	const block = {
  		c: function create() {
  			section = element("section");
  			div = element("div");
  			h1 = element("h1");
  			h1.textContent = "Welcome to Medilab";
  			t1 = space();
  			h2 = element("h2");
  			h2.textContent = "We are team of talented designers making websites with Bootstrap";
  			t3 = space();
  			a = element("a");
  			a.textContent = "Get Started";
  			attr_dev(h1, "class", "svelte-yejlfe");
  			add_location(h1, file$j, 4, 4, 113);
  			attr_dev(h2, "class", "svelte-yejlfe");
  			add_location(h2, file$j, 5, 4, 145);
  			attr_dev(a, "href", "#about");
  			attr_dev(a, "class", "btn-get-started scrollto svelte-yejlfe");
  			add_location(a, file$j, 6, 4, 223);
  			attr_dev(div, "class", "container svelte-yejlfe");
  			add_location(div, file$j, 3, 2, 85);
  			attr_dev(section, "id", "hero");
  			attr_dev(section, "class", "d-flex align-items-center svelte-yejlfe");
  			add_location(section, file$j, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div);
  			append_dev(div, h1);
  			append_dev(div, t1);
  			append_dev(div, h2);
  			append_dev(div, t3);
  			append_dev(div, a);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$k.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$k($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Hero', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class Hero extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Hero",
  			options,
  			id: create_fragment$k.name
  		});
  	}
  }

  /* src/components/WhyUs.svelte generated by Svelte v3.47.0 */

  const file$i = "src/components/WhyUs.svelte";

  function create_fragment$j(ctx) {
  	let section;
  	let div13;
  	let div12;
  	let div2;
  	let div1;
  	let h3;
  	let t1;
  	let p0;
  	let t3;
  	let div0;
  	let a;
  	let t4;
  	let i0;
  	let t5;
  	let div11;
  	let div10;
  	let div9;
  	let div4;
  	let div3;
  	let i1;
  	let t6;
  	let h40;
  	let t8;
  	let p1;
  	let t10;
  	let div6;
  	let div5;
  	let i2;
  	let t11;
  	let h41;
  	let t13;
  	let p2;
  	let t15;
  	let div8;
  	let div7;
  	let i3;
  	let t16;
  	let h42;
  	let t18;
  	let p3;

  	const block = {
  		c: function create() {
  			section = element("section");
  			div13 = element("div");
  			div12 = element("div");
  			div2 = element("div");
  			div1 = element("div");
  			h3 = element("h3");
  			h3.textContent = "Why Choose Medilab?";
  			t1 = space();
  			p0 = element("p");
  			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\n            eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis\n            aute irure dolor in reprehenderit Asperiores dolores sed et. Tenetur\n            quia eos. Autem tempore quibusdam vel necessitatibus optio ad\n            corporis.";
  			t3 = space();
  			div0 = element("div");
  			a = element("a");
  			t4 = text("Learn More ");
  			i0 = element("i");
  			t5 = space();
  			div11 = element("div");
  			div10 = element("div");
  			div9 = element("div");
  			div4 = element("div");
  			div3 = element("div");
  			i1 = element("i");
  			t6 = space();
  			h40 = element("h4");
  			h40.textContent = "Corporis voluptates sit";
  			t8 = space();
  			p1 = element("p");
  			p1.textContent = "Consequuntur sunt aut quasi enim aliquam quae harum pariatur\n                  laboris nisi ut aliquip";
  			t10 = space();
  			div6 = element("div");
  			div5 = element("div");
  			i2 = element("i");
  			t11 = space();
  			h41 = element("h4");
  			h41.textContent = "Ullamco laboris ladore pan";
  			t13 = space();
  			p2 = element("p");
  			p2.textContent = "Excepteur sint occaecat cupidatat non proident, sunt in culpa\n                  qui officia deserunt";
  			t15 = space();
  			div8 = element("div");
  			div7 = element("div");
  			i3 = element("i");
  			t16 = space();
  			h42 = element("h4");
  			h42.textContent = "Labore consequatur";
  			t18 = space();
  			p3 = element("p");
  			p3.textContent = "Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut\n                  maiores omnis facere";
  			attr_dev(h3, "class", "svelte-1a5ulg7");
  			add_location(h3, file$i, 7, 10, 210);
  			attr_dev(p0, "class", "svelte-1a5ulg7");
  			add_location(p0, file$i, 8, 10, 249);
  			attr_dev(i0, "class", "bx bx-chevron-right svelte-1a5ulg7");
  			add_location(i0, file$i, 17, 26, 701);
  			attr_dev(a, "href", "#");
  			attr_dev(a, "class", "more-btn svelte-1a5ulg7");
  			add_location(a, file$i, 16, 12, 646);
  			attr_dev(div0, "class", "text-center");
  			add_location(div0, file$i, 15, 10, 608);
  			attr_dev(div1, "class", "content svelte-1a5ulg7");
  			add_location(div1, file$i, 6, 8, 178);
  			attr_dev(div2, "class", "col-lg-4 d-flex align-items-stretch");
  			add_location(div2, file$i, 5, 6, 120);
  			attr_dev(i1, "class", "bx bx-receipt svelte-1a5ulg7");
  			add_location(i1, file$i, 27, 16, 1084);
  			attr_dev(h40, "class", "svelte-1a5ulg7");
  			add_location(h40, file$i, 28, 16, 1128);
  			attr_dev(p1, "class", "svelte-1a5ulg7");
  			add_location(p1, file$i, 29, 16, 1177);
  			attr_dev(div3, "class", "icon-box mt-4 mt-xl-0 svelte-1a5ulg7");
  			add_location(div3, file$i, 26, 14, 1032);
  			attr_dev(div4, "class", "col-xl-4 d-flex align-items-stretch");
  			add_location(div4, file$i, 25, 12, 968);
  			attr_dev(i2, "class", "bx bx-cube-alt svelte-1a5ulg7");
  			add_location(i2, file$i, 37, 16, 1491);
  			attr_dev(h41, "class", "svelte-1a5ulg7");
  			add_location(h41, file$i, 38, 16, 1536);
  			attr_dev(p2, "class", "svelte-1a5ulg7");
  			add_location(p2, file$i, 39, 16, 1588);
  			attr_dev(div5, "class", "icon-box mt-4 mt-xl-0 svelte-1a5ulg7");
  			add_location(div5, file$i, 36, 14, 1439);
  			attr_dev(div6, "class", "col-xl-4 d-flex align-items-stretch");
  			add_location(div6, file$i, 35, 12, 1375);
  			attr_dev(i3, "class", "bx bx-images svelte-1a5ulg7");
  			add_location(i3, file$i, 47, 16, 1900);
  			attr_dev(h42, "class", "svelte-1a5ulg7");
  			add_location(h42, file$i, 48, 16, 1943);
  			attr_dev(p3, "class", "svelte-1a5ulg7");
  			add_location(p3, file$i, 49, 16, 1987);
  			attr_dev(div7, "class", "icon-box mt-4 mt-xl-0 svelte-1a5ulg7");
  			add_location(div7, file$i, 46, 14, 1848);
  			attr_dev(div8, "class", "col-xl-4 d-flex align-items-stretch");
  			add_location(div8, file$i, 45, 12, 1784);
  			attr_dev(div9, "class", "row");
  			add_location(div9, file$i, 24, 10, 938);
  			attr_dev(div10, "class", "icon-boxes d-flex flex-column justify-content-center");
  			add_location(div10, file$i, 23, 8, 861);
  			attr_dev(div11, "class", "col-lg-8 d-flex align-items-stretch");
  			add_location(div11, file$i, 22, 6, 803);
  			attr_dev(div12, "class", "row");
  			add_location(div12, file$i, 4, 4, 96);
  			attr_dev(div13, "class", "container");
  			add_location(div13, file$i, 3, 2, 68);
  			attr_dev(section, "id", "why-us");
  			attr_dev(section, "class", "why-us svelte-1a5ulg7");
  			add_location(section, file$i, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div13);
  			append_dev(div13, div12);
  			append_dev(div12, div2);
  			append_dev(div2, div1);
  			append_dev(div1, h3);
  			append_dev(div1, t1);
  			append_dev(div1, p0);
  			append_dev(div1, t3);
  			append_dev(div1, div0);
  			append_dev(div0, a);
  			append_dev(a, t4);
  			append_dev(a, i0);
  			append_dev(div12, t5);
  			append_dev(div12, div11);
  			append_dev(div11, div10);
  			append_dev(div10, div9);
  			append_dev(div9, div4);
  			append_dev(div4, div3);
  			append_dev(div3, i1);
  			append_dev(div3, t6);
  			append_dev(div3, h40);
  			append_dev(div3, t8);
  			append_dev(div3, p1);
  			append_dev(div9, t10);
  			append_dev(div9, div6);
  			append_dev(div6, div5);
  			append_dev(div5, i2);
  			append_dev(div5, t11);
  			append_dev(div5, h41);
  			append_dev(div5, t13);
  			append_dev(div5, p2);
  			append_dev(div9, t15);
  			append_dev(div9, div8);
  			append_dev(div8, div7);
  			append_dev(div7, i3);
  			append_dev(div7, t16);
  			append_dev(div7, h42);
  			append_dev(div7, t18);
  			append_dev(div7, p3);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$j.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$j($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('WhyUs', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WhyUs> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class WhyUs extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "WhyUs",
  			options,
  			id: create_fragment$j.name
  		});
  	}
  }

  /* src/components/AboutUs.svelte generated by Svelte v3.47.0 */

  const file$h = "src/components/AboutUs.svelte";

  function create_fragment$i(ctx) {
  	let section;
  	let div9;
  	let div8;
  	let div0;
  	let a0;
  	let t0;
  	let div7;
  	let h3;
  	let t2;
  	let p0;
  	let t4;
  	let div2;
  	let div1;
  	let i0;
  	let t5;
  	let h40;
  	let a1;
  	let t7;
  	let p1;
  	let t9;
  	let div4;
  	let div3;
  	let i1;
  	let t10;
  	let h41;
  	let a2;
  	let t12;
  	let p2;
  	let t14;
  	let div6;
  	let div5;
  	let i2;
  	let t15;
  	let h42;
  	let a3;
  	let t17;
  	let p3;

  	const block = {
  		c: function create() {
  			section = element("section");
  			div9 = element("div");
  			div8 = element("div");
  			div0 = element("div");
  			a0 = element("a");
  			t0 = space();
  			div7 = element("div");
  			h3 = element("h3");
  			h3.textContent = "Enim quis est voluptatibus aliquid consequatur fugiat";
  			t2 = space();
  			p0 = element("p");
  			p0.textContent = "Esse voluptas cumque vel exercitationem. Reiciendis est hic accusamus.\n          Non ipsam et sed minima temporibus laudantium. Soluta voluptate sed\n          facere corporis dolores excepturi. Libero laboriosam sint et id nulla\n          tenetur. Suscipit aut voluptate.";
  			t4 = space();
  			div2 = element("div");
  			div1 = element("div");
  			i0 = element("i");
  			t5 = space();
  			h40 = element("h4");
  			a1 = element("a");
  			a1.textContent = "Lorem Ipsum";
  			t7 = space();
  			p1 = element("p");
  			p1.textContent = "Voluptatum deleniti atque corrupti quos dolores et quas molestias\n            excepturi sint occaecati cupiditate non provident";
  			t9 = space();
  			div4 = element("div");
  			div3 = element("div");
  			i1 = element("i");
  			t10 = space();
  			h41 = element("h4");
  			a2 = element("a");
  			a2.textContent = "Nemo Enim";
  			t12 = space();
  			p2 = element("p");
  			p2.textContent = "At vero eos et accusamus et iusto odio dignissimos ducimus qui\n            blanditiis praesentium voluptatum deleniti atque";
  			t14 = space();
  			div6 = element("div");
  			div5 = element("div");
  			i2 = element("i");
  			t15 = space();
  			h42 = element("h4");
  			a3 = element("a");
  			a3.textContent = "Dine Pad";
  			t17 = space();
  			p3 = element("p");
  			p3.textContent = "Explicabo est voluptatum asperiores consequatur magnam. Et veritatis\n            odit. Sunt aut deserunt minus aut eligendi omnis";
  			attr_dev(a0, "href", /*youtubeURL*/ ctx[0]);
  			attr_dev(a0, "class", "glightbox play-btn mb-4 svelte-54xthc");
  			add_location(a0, file$h, 10, 8, 373);
  			attr_dev(div0, "class", "col-xl-5 col-lg-6 video-box d-flex justify-content-center align-items-stretch position-relative svelte-54xthc");
  			add_location(div0, file$h, 6, 6, 188);
  			attr_dev(h3, "class", "svelte-54xthc");
  			add_location(h3, file$h, 16, 8, 590);
  			add_location(p0, file$h, 17, 8, 661);
  			attr_dev(i0, "class", "bx bx-fingerprint svelte-54xthc");
  			add_location(i0, file$h, 25, 28, 1020);
  			attr_dev(div1, "class", "icon svelte-54xthc");
  			add_location(div1, file$h, 25, 10, 1002);
  			attr_dev(a1, "href", "");
  			attr_dev(a1, "class", "svelte-54xthc");
  			add_location(a1, file$h, 26, 28, 1086);
  			attr_dev(h40, "class", "title svelte-54xthc");
  			add_location(h40, file$h, 26, 10, 1068);
  			attr_dev(p1, "class", "description svelte-54xthc");
  			add_location(p1, file$h, 27, 10, 1128);
  			attr_dev(div2, "class", "icon-box svelte-54xthc");
  			add_location(div2, file$h, 24, 8, 969);
  			attr_dev(i1, "class", "bx bx-gift svelte-54xthc");
  			add_location(i1, file$h, 34, 28, 1382);
  			attr_dev(div3, "class", "icon svelte-54xthc");
  			add_location(div3, file$h, 34, 10, 1364);
  			attr_dev(a2, "href", "");
  			attr_dev(a2, "class", "svelte-54xthc");
  			add_location(a2, file$h, 35, 28, 1441);
  			attr_dev(h41, "class", "title svelte-54xthc");
  			add_location(h41, file$h, 35, 10, 1423);
  			attr_dev(p2, "class", "description svelte-54xthc");
  			add_location(p2, file$h, 36, 10, 1481);
  			attr_dev(div4, "class", "icon-box svelte-54xthc");
  			add_location(div4, file$h, 33, 8, 1331);
  			attr_dev(i2, "class", "bx bx-atom svelte-54xthc");
  			add_location(i2, file$h, 43, 28, 1731);
  			attr_dev(div5, "class", "icon svelte-54xthc");
  			add_location(div5, file$h, 43, 10, 1713);
  			attr_dev(a3, "href", "");
  			attr_dev(a3, "class", "svelte-54xthc");
  			add_location(a3, file$h, 44, 28, 1790);
  			attr_dev(h42, "class", "title svelte-54xthc");
  			add_location(h42, file$h, 44, 10, 1772);
  			attr_dev(p3, "class", "description svelte-54xthc");
  			add_location(p3, file$h, 45, 10, 1829);
  			attr_dev(div6, "class", "icon-box svelte-54xthc");
  			add_location(div6, file$h, 42, 8, 1680);
  			attr_dev(div7, "class", "col-xl-7 col-lg-6 icon-boxes d-flex flex-column align-items-stretch justify-content-center py-5 px-lg-5");
  			add_location(div7, file$h, 13, 6, 449);
  			attr_dev(div8, "class", "row");
  			add_location(div8, file$h, 5, 4, 164);
  			attr_dev(div9, "class", "container-fluid");
  			add_location(div9, file$h, 4, 2, 130);
  			attr_dev(section, "id", "about");
  			attr_dev(section, "class", "about svelte-54xthc");
  			add_location(section, file$h, 3, 0, 93);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div9);
  			append_dev(div9, div8);
  			append_dev(div8, div0);
  			append_dev(div0, a0);
  			append_dev(div8, t0);
  			append_dev(div8, div7);
  			append_dev(div7, h3);
  			append_dev(div7, t2);
  			append_dev(div7, p0);
  			append_dev(div7, t4);
  			append_dev(div7, div2);
  			append_dev(div2, div1);
  			append_dev(div1, i0);
  			append_dev(div2, t5);
  			append_dev(div2, h40);
  			append_dev(h40, a1);
  			append_dev(div2, t7);
  			append_dev(div2, p1);
  			append_dev(div7, t9);
  			append_dev(div7, div4);
  			append_dev(div4, div3);
  			append_dev(div3, i1);
  			append_dev(div4, t10);
  			append_dev(div4, h41);
  			append_dev(h41, a2);
  			append_dev(div4, t12);
  			append_dev(div4, p2);
  			append_dev(div7, t14);
  			append_dev(div7, div6);
  			append_dev(div6, div5);
  			append_dev(div5, i2);
  			append_dev(div6, t15);
  			append_dev(div6, h42);
  			append_dev(h42, a3);
  			append_dev(div6, t17);
  			append_dev(div6, p3);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$i.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$i($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('AboutUs', slots, []);
  	let youtubeURL = "https://www.youtube.com/watch?v=jDDaplaOz7Q";
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AboutUs> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({ youtubeURL });

  	$$self.$inject_state = $$props => {
  		if ('youtubeURL' in $$props) $$invalidate(0, youtubeURL = $$props.youtubeURL);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [youtubeURL];
  }

  class AboutUs extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "AboutUs",
  			options,
  			id: create_fragment$i.name
  		});
  	}
  }

  /* src/components/Counts.svelte generated by Svelte v3.47.0 */

  const file$g = "src/components/Counts.svelte";

  function create_fragment$h(ctx) {
  	let section;
  	let div9;
  	let div8;
  	let div1;
  	let div0;
  	let i0;
  	let t0;
  	let span0;
  	let t1;
  	let p0;
  	let t3;
  	let div3;
  	let div2;
  	let i1;
  	let t4;
  	let span1;
  	let t5;
  	let p1;
  	let t7;
  	let div5;
  	let div4;
  	let i2;
  	let t8;
  	let span2;
  	let t9;
  	let p2;
  	let t11;
  	let div7;
  	let div6;
  	let i3;
  	let t12;
  	let span3;
  	let t13;
  	let p3;

  	const block = {
  		c: function create() {
  			section = element("section");
  			div9 = element("div");
  			div8 = element("div");
  			div1 = element("div");
  			div0 = element("div");
  			i0 = element("i");
  			t0 = space();
  			span0 = element("span");
  			t1 = space();
  			p0 = element("p");
  			p0.textContent = "Doctors";
  			t3 = space();
  			div3 = element("div");
  			div2 = element("div");
  			i1 = element("i");
  			t4 = space();
  			span1 = element("span");
  			t5 = space();
  			p1 = element("p");
  			p1.textContent = "Departments";
  			t7 = space();
  			div5 = element("div");
  			div4 = element("div");
  			i2 = element("i");
  			t8 = space();
  			span2 = element("span");
  			t9 = space();
  			p2 = element("p");
  			p2.textContent = "Research Labs";
  			t11 = space();
  			div7 = element("div");
  			div6 = element("div");
  			i3 = element("i");
  			t12 = space();
  			span3 = element("span");
  			t13 = space();
  			p3 = element("p");
  			p3.textContent = "Awards";
  			attr_dev(i0, "class", "fas fa-user-md svelte-1r0jq23");
  			add_location(i0, file$g, 7, 10, 194);
  			attr_dev(span0, "data-purecounter-start", "0");
  			attr_dev(span0, "data-purecounter-end", "85");
  			attr_dev(span0, "data-purecounter-duration", "1");
  			attr_dev(span0, "class", "purecounter svelte-1r0jq23");
  			add_location(span0, file$g, 8, 10, 233);
  			attr_dev(p0, "class", "svelte-1r0jq23");
  			add_location(p0, file$g, 14, 10, 413);
  			attr_dev(div0, "class", "count-box svelte-1r0jq23");
  			add_location(div0, file$g, 6, 8, 160);
  			attr_dev(div1, "class", "col-lg-3 col-md-6");
  			add_location(div1, file$g, 5, 6, 120);
  			attr_dev(i1, "class", "far fa-hospital svelte-1r0jq23");
  			add_location(i1, file$g, 20, 10, 550);
  			attr_dev(span1, "data-purecounter-start", "0");
  			attr_dev(span1, "data-purecounter-end", "18");
  			attr_dev(span1, "data-purecounter-duration", "1");
  			attr_dev(span1, "class", "purecounter svelte-1r0jq23");
  			add_location(span1, file$g, 21, 10, 590);
  			attr_dev(p1, "class", "svelte-1r0jq23");
  			add_location(p1, file$g, 27, 10, 770);
  			attr_dev(div2, "class", "count-box svelte-1r0jq23");
  			add_location(div2, file$g, 19, 8, 516);
  			attr_dev(div3, "class", "col-lg-3 col-md-6 mt-5 mt-md-0");
  			add_location(div3, file$g, 18, 6, 463);
  			attr_dev(i2, "class", "fas fa-flask svelte-1r0jq23");
  			add_location(i2, file$g, 33, 10, 911);
  			attr_dev(span2, "data-purecounter-start", "0");
  			attr_dev(span2, "data-purecounter-end", "12");
  			attr_dev(span2, "data-purecounter-duration", "1");
  			attr_dev(span2, "class", "purecounter svelte-1r0jq23");
  			add_location(span2, file$g, 34, 10, 948);
  			attr_dev(p2, "class", "svelte-1r0jq23");
  			add_location(p2, file$g, 40, 10, 1128);
  			attr_dev(div4, "class", "count-box svelte-1r0jq23");
  			add_location(div4, file$g, 32, 8, 877);
  			attr_dev(div5, "class", "col-lg-3 col-md-6 mt-5 mt-lg-0");
  			add_location(div5, file$g, 31, 6, 824);
  			attr_dev(i3, "class", "fas fa-award svelte-1r0jq23");
  			add_location(i3, file$g, 46, 10, 1271);
  			attr_dev(span3, "data-purecounter-start", "0");
  			attr_dev(span3, "data-purecounter-end", "150");
  			attr_dev(span3, "data-purecounter-duration", "1");
  			attr_dev(span3, "class", "purecounter svelte-1r0jq23");
  			add_location(span3, file$g, 47, 10, 1308);
  			attr_dev(p3, "class", "svelte-1r0jq23");
  			add_location(p3, file$g, 53, 10, 1489);
  			attr_dev(div6, "class", "count-box svelte-1r0jq23");
  			add_location(div6, file$g, 45, 8, 1237);
  			attr_dev(div7, "class", "col-lg-3 col-md-6 mt-5 mt-lg-0");
  			add_location(div7, file$g, 44, 6, 1184);
  			attr_dev(div8, "class", "row");
  			add_location(div8, file$g, 4, 4, 96);
  			attr_dev(div9, "class", "container");
  			add_location(div9, file$g, 3, 2, 68);
  			attr_dev(section, "id", "counts");
  			attr_dev(section, "class", "counts svelte-1r0jq23");
  			add_location(section, file$g, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div9);
  			append_dev(div9, div8);
  			append_dev(div8, div1);
  			append_dev(div1, div0);
  			append_dev(div0, i0);
  			append_dev(div0, t0);
  			append_dev(div0, span0);
  			append_dev(div0, t1);
  			append_dev(div0, p0);
  			append_dev(div8, t3);
  			append_dev(div8, div3);
  			append_dev(div3, div2);
  			append_dev(div2, i1);
  			append_dev(div2, t4);
  			append_dev(div2, span1);
  			append_dev(div2, t5);
  			append_dev(div2, p1);
  			append_dev(div8, t7);
  			append_dev(div8, div5);
  			append_dev(div5, div4);
  			append_dev(div4, i2);
  			append_dev(div4, t8);
  			append_dev(div4, span2);
  			append_dev(div4, t9);
  			append_dev(div4, p2);
  			append_dev(div8, t11);
  			append_dev(div8, div7);
  			append_dev(div7, div6);
  			append_dev(div6, i3);
  			append_dev(div6, t12);
  			append_dev(div6, span3);
  			append_dev(div6, t13);
  			append_dev(div6, p3);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$h.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$h($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Counts', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Counts> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class Counts extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Counts",
  			options,
  			id: create_fragment$h.name
  		});
  	}
  }

  const subscriber_queue = [];
  /**
   * Creates a `Readable` store that allows reading by subscription.
   * @param value initial value
   * @param {StartStopNotifier}start start and stop notifications for subscriptions
   */
  function readable(value, start) {
      return {
          subscribe: writable(value, start).subscribe
      };
  }
  /**
   * Create a `Writable` store that allows both updating and reading by subscription.
   * @param {*=}value initial value
   * @param {StartStopNotifier=}start start and stop notifications for subscriptions
   */
  function writable(value, start = noop) {
      let stop;
      const subscribers = new Set();
      function set(new_value) {
          if (safe_not_equal(value, new_value)) {
              value = new_value;
              if (stop) { // store is ready
                  const run_queue = !subscriber_queue.length;
                  for (const subscriber of subscribers) {
                      subscriber[1]();
                      subscriber_queue.push(subscriber, value);
                  }
                  if (run_queue) {
                      for (let i = 0; i < subscriber_queue.length; i += 2) {
                          subscriber_queue[i][0](subscriber_queue[i + 1]);
                      }
                      subscriber_queue.length = 0;
                  }
              }
          }
      }
      function update(fn) {
          set(fn(value));
      }
      function subscribe(run, invalidate = noop) {
          const subscriber = [run, invalidate];
          subscribers.add(subscriber);
          if (subscribers.size === 1) {
              stop = start(set) || noop;
          }
          run(value);
          return () => {
              subscribers.delete(subscriber);
              if (subscribers.size === 0) {
                  stop();
                  stop = null;
              }
          };
      }
      return { set, update, subscribe };
  }

  const services = readable([
      {
          name: 'Lorem Ipsum',
          description: 'Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi',
          icon: 'fas fa-heartbeat'
      },
      {
          name: 'Sed ut perspiciatis',
          description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
          icon: 'fas fa-pills'
      },
      {
          name: 'Magni Dolores',
          description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia',
          icon: 'fas fa-user'
      },
      {
          name: 'Dele cardo',
          description: 'Quis consequatur saepe eligendi voluptatem consequatur dolor consequuntur',
          icon: 'fas fa-wheelchair'
      },
      {
          name: 'Divera don',
          description: 'Modi nostrum vel laborum. Porro fugit error sit minus sapiente sit aspernatur',
          icon: 'fas fa-notes-medical'
      },
      {
          name: 'Nemo Enim',
          description: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis',
          icon: 'fas fa-dna'
      },
  ]);

  /* src/components/Services.svelte generated by Svelte v3.47.0 */
  const file$f = "src/components/Services.svelte";

  function get_each_context$3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[1] = list[i];
  	child_ctx[3] = i;
  	return child_ctx;
  }

  // (17:6) {#each $services as service, sid}
  function create_each_block$3(ctx) {
  	let div2;
  	let div1;
  	let div0;
  	let i;
  	let i_class_value;
  	let t0;
  	let h4;
  	let a;
  	let t1_value = /*service*/ ctx[1].name + "";
  	let t1;
  	let t2;
  	let p;
  	let t3_value = /*service*/ ctx[1].description + "";
  	let t3;
  	let t4;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div1 = element("div");
  			div0 = element("div");
  			i = element("i");
  			t0 = space();
  			h4 = element("h4");
  			a = element("a");
  			t1 = text(t1_value);
  			t2 = space();
  			p = element("p");
  			t3 = text(t3_value);
  			t4 = space();
  			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*service*/ ctx[1].icon) + " svelte-nqo0wd"));
  			add_location(i, file$f, 23, 30, 777);
  			attr_dev(div0, "class", "icon svelte-nqo0wd");
  			add_location(div0, file$f, 23, 12, 759);
  			attr_dev(a, "href", "");
  			attr_dev(a, "class", "svelte-nqo0wd");
  			add_location(a, file$f, 24, 16, 826);
  			attr_dev(h4, "class", "svelte-nqo0wd");
  			add_location(h4, file$f, 24, 12, 822);
  			attr_dev(p, "class", "svelte-nqo0wd");
  			add_location(p, file$f, 25, 12, 873);
  			attr_dev(div1, "class", "icon-box svelte-nqo0wd");
  			add_location(div1, file$f, 22, 10, 724);
  			attr_dev(div2, "class", "col-lg-4 col-md-6 d-flex align-items-stretch " + (/*sid*/ ctx[3] >= 3 ? 'mt-4' : ''));
  			add_location(div2, file$f, 17, 8, 587);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div1);
  			append_dev(div1, div0);
  			append_dev(div0, i);
  			append_dev(div1, t0);
  			append_dev(div1, h4);
  			append_dev(h4, a);
  			append_dev(a, t1);
  			append_dev(div1, t2);
  			append_dev(div1, p);
  			append_dev(p, t3);
  			append_dev(div2, t4);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*$services*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*service*/ ctx[1].icon) + " svelte-nqo0wd"))) {
  				attr_dev(i, "class", i_class_value);
  			}

  			if (dirty & /*$services*/ 1 && t1_value !== (t1_value = /*service*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
  			if (dirty & /*$services*/ 1 && t3_value !== (t3_value = /*service*/ ctx[1].description + "")) set_data_dev(t3, t3_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$3.name,
  		type: "each",
  		source: "(17:6) {#each $services as service, sid}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$g(ctx) {
  	let section;
  	let div2;
  	let div0;
  	let h2;
  	let t1;
  	let p;
  	let t3;
  	let div1;
  	let each_value = /*$services*/ ctx[0];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			section = element("section");
  			div2 = element("div");
  			div0 = element("div");
  			h2 = element("h2");
  			h2.textContent = "Services";
  			t1 = space();
  			p = element("p");
  			p.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n        aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n        quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat\n        sit in iste officiis commodi quidem hic quas.";
  			t3 = space();
  			div1 = element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(h2, file$f, 6, 6, 181);
  			attr_dev(p, "class", "svelte-nqo0wd");
  			add_location(p, file$f, 7, 6, 205);
  			attr_dev(div0, "class", "section-title");
  			add_location(div0, file$f, 5, 4, 147);
  			attr_dev(div1, "class", "row");
  			add_location(div1, file$f, 15, 4, 521);
  			attr_dev(div2, "class", "container");
  			add_location(div2, file$f, 4, 2, 119);
  			attr_dev(section, "id", "services");
  			attr_dev(section, "class", "services svelte-nqo0wd");
  			add_location(section, file$f, 3, 0, 76);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div2);
  			append_dev(div2, div0);
  			append_dev(div0, h2);
  			append_dev(div0, t1);
  			append_dev(div0, p);
  			append_dev(div2, t3);
  			append_dev(div2, div1);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div1, null);
  			}
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*$services*/ 1) {
  				each_value = /*$services*/ ctx[0];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$3(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$3(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(div1, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  			destroy_each(each_blocks, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$g.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$g($$self, $$props, $$invalidate) {
  	let $services;
  	validate_store(services, 'services');
  	component_subscribe($$self, services, $$value => $$invalidate(0, $services = $$value));
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Services', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({ services, $services });
  	return [$services];
  }

  class Services extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Services",
  			options,
  			id: create_fragment$g.name
  		});
  	}
  }

  const departments = readable([
      {
          name: 'Cardiology',
          excerpt: 'Qui laudantium consequatur laborum sit qui ad sapiente dila parde sonata raqer a videna mareta paulona marka',
          description: 'Et nobis maiores eius. Voluptatibus ut enim blanditiis atque harum sint. Laborum eos ipsum ipsa odit magni. Incidunt hic ut molestiae aut qui. Est repellat minima eveniet eius et quis magni nihil. Consequatur dolorem quaerat quos qui similique accusamus nostrum rem vero',
          image: 'static/assets/img/departments-1.jpg',
      },
      {
          name: 'Neurology',
          excerpt: ' Qui laudantium consequatur laborum sit qui ad sapiente dila parde sonata raqer a videna mareta paulona marka',
          description: 'Ea ipsum voluptatem consequatur quis est. Illum error ullam omnis quia et reiciendis sunt sunt est. Non aliquid repellendus itaque accusamus eius et velit ipsa voluptates. Optio nesciunt eaque beatae accusamus lerode pakto madirna desera vafle de nideran pal',
          image: 'static/assets/img/departments-2.jpg',
      },
      {
          name: 'Hepatology',
          excerpt: ' Eos voluptatibus quo. Odio similique illum id quidem non enim fuga. Qui natus non sunt dicta dolor et. In asperiores velit quaerat perferendis aut',
          description: 'Iure officiis odit rerum. Harum sequi eum illum corrupti culpa veritatis quisquam. Neque necessitatibus illo rerum eum ut. Commodi ipsam minima molestiae sed laboriosam a iste odio. Earum odit nesciunt fugiat sit ullam. Soluta et harum voluptatem optio quae',
          image: 'static/assets/img/departments-3.jpg',
      },
      {
          name: 'Pediatrics',
          excerpt: ' Omnis blanditiis saepe eos autem qui sunt debitis porro quia.',
          description: 'Eaque consequuntur consequuntur libero expedita in voluptas. Nostrum ipsam necessitatibus aliquam fugiat debitis quis velit. Eum ex maxime error in consequatur corporis atque. Eligendi asperiores sed qui veritatis aperiam quia a laborum inventore',
          image: 'static/assets/img/departments-4.jpg',
      },
      {
          name: 'Eye Care',
          excerpt: ' Totam aperiam accusamus. Repellat consequuntur iure voluptas iure porro quis delectus',
          description: 'Exercitationem nostrum omnis. Ut reiciendis repudiandae minus. Omnis recusandae ut non quam ut quod eius qui. Ipsum quia odit vero atque qui quibusdam amet. Occaecati sed est sint aut vitae molestiae voluptate vel',
          image: 'static/assets/img/departments-5.jpg',
      },
  ]);

  /* src/components/Departments.svelte generated by Svelte v3.47.0 */
  const file$e = "src/components/Departments.svelte";

  function get_each_context$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[2] = list[i];
  	child_ctx[4] = i;
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[2] = list[i];
  	child_ctx[4] = i;
  	return child_ctx;
  }

  // (20:10) {#each $departments as department, did}
  function create_each_block_1(ctx) {
  	let li;
  	let a;
  	let t0_value = /*department*/ ctx[2].name + "";
  	let t0;
  	let t1;

  	const block = {
  		c: function create() {
  			li = element("li");
  			a = element("a");
  			t0 = text(t0_value);
  			t1 = space();

  			attr_dev(a, "class", "nav-link " + (/*selectedDepartment*/ ctx[1] == /*did*/ ctx[4]
  			? 'active show'
  			: '') + " svelte-1e8g364");

  			attr_dev(a, "data-bs-toggle", "tab");
  			attr_dev(a, "href", "#tab-" + /*did*/ ctx[4]);
  			add_location(a, file$e, 21, 14, 760);
  			attr_dev(li, "class", "nav-item");
  			add_location(li, file$e, 20, 12, 724);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, a);
  			append_dev(a, t0);
  			append_dev(li, t1);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*$departments*/ 1 && t0_value !== (t0_value = /*department*/ ctx[2].name + "")) set_data_dev(t0, t0_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1.name,
  		type: "each",
  		source: "(20:10) {#each $departments as department, did}",
  		ctx
  	});

  	return block;
  }

  // (35:10) {#each $departments as department, did}
  function create_each_block$2(ctx) {
  	let div3;
  	let div2;
  	let div0;
  	let h3;
  	let t0_value = /*department*/ ctx[2].name + "";
  	let t0;
  	let t1;
  	let p0;
  	let t2_value = /*department*/ ctx[2].excerpt + "";
  	let t2;
  	let t3;
  	let p1;
  	let t4_value = /*department*/ ctx[2].description + "";
  	let t4;
  	let t5;
  	let div1;
  	let img;
  	let img_src_value;
  	let img_alt_value;
  	let t6;

  	const block = {
  		c: function create() {
  			div3 = element("div");
  			div2 = element("div");
  			div0 = element("div");
  			h3 = element("h3");
  			t0 = text(t0_value);
  			t1 = space();
  			p0 = element("p");
  			t2 = text(t2_value);
  			t3 = space();
  			p1 = element("p");
  			t4 = text(t4_value);
  			t5 = space();
  			div1 = element("div");
  			img = element("img");
  			t6 = space();
  			attr_dev(h3, "class", "svelte-1e8g364");
  			add_location(h3, file$e, 41, 18, 1426);
  			attr_dev(p0, "class", "fst-italic svelte-1e8g364");
  			add_location(p0, file$e, 42, 18, 1471);
  			attr_dev(p1, "class", "svelte-1e8g364");
  			add_location(p1, file$e, 45, 18, 1576);
  			attr_dev(div0, "class", "col-lg-8 details order-2 order-lg-1");
  			add_location(div0, file$e, 40, 16, 1358);
  			if (!src_url_equal(img.src, img_src_value = /*department*/ ctx[2].image)) attr_dev(img, "src", img_src_value);
  			attr_dev(img, "alt", img_alt_value = "Image of " + /*department*/ ctx[2].name + " department");
  			attr_dev(img, "class", "img-fluid");
  			add_location(img, file$e, 50, 18, 1759);
  			attr_dev(div1, "class", "col-lg-4 text-center order-1 order-lg-2");
  			add_location(div1, file$e, 49, 16, 1687);
  			attr_dev(div2, "class", "row gy-4");
  			add_location(div2, file$e, 39, 14, 1319);

  			attr_dev(div3, "class", "tab-pane " + (/*selectedDepartment*/ ctx[1] == /*did*/ ctx[4]
  			? 'active show'
  			: '') + " svelte-1e8g364");

  			attr_dev(div3, "id", "tab-" + /*did*/ ctx[4]);
  			add_location(div3, file$e, 35, 12, 1177);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div3, anchor);
  			append_dev(div3, div2);
  			append_dev(div2, div0);
  			append_dev(div0, h3);
  			append_dev(h3, t0);
  			append_dev(div0, t1);
  			append_dev(div0, p0);
  			append_dev(p0, t2);
  			append_dev(div0, t3);
  			append_dev(div0, p1);
  			append_dev(p1, t4);
  			append_dev(div2, t5);
  			append_dev(div2, div1);
  			append_dev(div1, img);
  			append_dev(div3, t6);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*$departments*/ 1 && t0_value !== (t0_value = /*department*/ ctx[2].name + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*$departments*/ 1 && t2_value !== (t2_value = /*department*/ ctx[2].excerpt + "")) set_data_dev(t2, t2_value);
  			if (dirty & /*$departments*/ 1 && t4_value !== (t4_value = /*department*/ ctx[2].description + "")) set_data_dev(t4, t4_value);

  			if (dirty & /*$departments*/ 1 && !src_url_equal(img.src, img_src_value = /*department*/ ctx[2].image)) {
  				attr_dev(img, "src", img_src_value);
  			}

  			if (dirty & /*$departments*/ 1 && img_alt_value !== (img_alt_value = "Image of " + /*department*/ ctx[2].name + " department")) {
  				attr_dev(img, "alt", img_alt_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div3);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$2.name,
  		type: "each",
  		source: "(35:10) {#each $departments as department, did}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$f(ctx) {
  	let section;
  	let div5;
  	let div0;
  	let h2;
  	let t1;
  	let p;
  	let t3;
  	let div4;
  	let div1;
  	let ul;
  	let t4;
  	let div3;
  	let div2;
  	let each_value_1 = /*$departments*/ ctx[0];
  	validate_each_argument(each_value_1);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	let each_value = /*$departments*/ ctx[0];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			section = element("section");
  			div5 = element("div");
  			div0 = element("div");
  			h2 = element("h2");
  			h2.textContent = "Departments";
  			t1 = space();
  			p = element("p");
  			p.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n        aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n        quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat\n        sit in iste officiis commodi quidem hic quas.";
  			t3 = space();
  			div4 = element("div");
  			div1 = element("div");
  			ul = element("ul");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t4 = space();
  			div3 = element("div");
  			div2 = element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(h2, file$e, 7, 6, 221);
  			attr_dev(p, "class", "svelte-1e8g364");
  			add_location(p, file$e, 8, 6, 248);
  			attr_dev(div0, "class", "section-title");
  			add_location(div0, file$e, 6, 4, 187);
  			attr_dev(ul, "class", "nav nav-tabs flex-column svelte-1e8g364");
  			add_location(ul, file$e, 18, 8, 624);
  			attr_dev(div1, "class", "col-lg-3");
  			add_location(div1, file$e, 17, 6, 593);
  			attr_dev(div2, "class", "tab-content");
  			add_location(div2, file$e, 33, 8, 1089);
  			attr_dev(div3, "class", "col-lg-9");
  			add_location(div3, file$e, 32, 6, 1058);
  			attr_dev(div4, "class", "row gy-4");
  			add_location(div4, file$e, 16, 4, 564);
  			attr_dev(div5, "class", "container");
  			add_location(div5, file$e, 5, 2, 159);
  			attr_dev(section, "id", "departments");
  			attr_dev(section, "class", "departments svelte-1e8g364");
  			add_location(section, file$e, 4, 0, 110);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div5);
  			append_dev(div5, div0);
  			append_dev(div0, h2);
  			append_dev(div0, t1);
  			append_dev(div0, p);
  			append_dev(div5, t3);
  			append_dev(div5, div4);
  			append_dev(div4, div1);
  			append_dev(div1, ul);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(ul, null);
  			}

  			append_dev(div4, t4);
  			append_dev(div4, div3);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div2, null);
  			}
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*selectedDepartment, $departments*/ 3) {
  				each_value_1 = /*$departments*/ ctx[0];
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(ul, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_1.length;
  			}

  			if (dirty & /*selectedDepartment, $departments*/ 3) {
  				each_value = /*$departments*/ ctx[0];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$2(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$f.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$f($$self, $$props, $$invalidate) {
  	let $departments;
  	validate_store(departments, 'departments');
  	component_subscribe($$self, departments, $$value => $$invalidate(0, $departments = $$value));
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Departments', slots, []);
  	let selectedDepartment = 0;
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Departments> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({
  		departments,
  		selectedDepartment,
  		$departments
  	});

  	$$self.$inject_state = $$props => {
  		if ('selectedDepartment' in $$props) $$invalidate(1, selectedDepartment = $$props.selectedDepartment);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [$departments, selectedDepartment];
  }

  class Departments extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Departments",
  			options,
  			id: create_fragment$f.name
  		});
  	}
  }

  /* src/components/Doctor.svelte generated by Svelte v3.47.0 */
  const file$d = "src/components/Doctor.svelte";

  function create_fragment$e(ctx) {
  	let div2;
  	let div0;
  	let img;
  	let img_src_value;
  	let img_alt_value;
  	let t0;
  	let div1;
  	let h4;
  	let t1;
  	let t2;
  	let span;
  	let t3;
  	let t4;
  	let p;
  	let t5;
  	let t6;
  	let button;
  	let mounted;
  	let dispose;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			img = element("img");
  			t0 = space();
  			div1 = element("div");
  			h4 = element("h4");
  			t1 = text(/*name*/ ctx[0]);
  			t2 = space();
  			span = element("span");
  			t3 = text(/*specialty*/ ctx[2]);
  			t4 = space();
  			p = element("p");
  			t5 = text(/*description*/ ctx[3]);
  			t6 = space();
  			button = element("button");
  			button.textContent = "Make an appointment";
  			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[1])) attr_dev(img, "src", img_src_value);
  			attr_dev(img, "class", "img-fluid svelte-3xvgb5");
  			attr_dev(img, "alt", img_alt_value = "Image of " + /*name*/ ctx[0]);
  			add_location(img, file$d, 14, 4, 366);
  			attr_dev(div0, "class", "pic svelte-3xvgb5");
  			add_location(div0, file$d, 13, 2, 344);
  			attr_dev(h4, "class", "svelte-3xvgb5");
  			add_location(h4, file$d, 17, 4, 467);
  			attr_dev(span, "class", "svelte-3xvgb5");
  			add_location(span, file$d, 18, 4, 487);
  			attr_dev(p, "class", "svelte-3xvgb5");
  			add_location(p, file$d, 19, 4, 516);
  			attr_dev(button, "class", "btn btn-primary mt-2");
  			add_location(button, file$d, 22, 4, 553);
  			attr_dev(div1, "class", "member-info svelte-3xvgb5");
  			add_location(div1, file$d, 16, 2, 437);
  			attr_dev(div2, "class", "member d-flex align-items-start svelte-3xvgb5");
  			add_location(div2, file$d, 12, 0, 296);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, img);
  			append_dev(div2, t0);
  			append_dev(div2, div1);
  			append_dev(div1, h4);
  			append_dev(h4, t1);
  			append_dev(div1, t2);
  			append_dev(div1, span);
  			append_dev(span, t3);
  			append_dev(div1, t4);
  			append_dev(div1, p);
  			append_dev(p, t5);
  			append_dev(div1, t6);
  			append_dev(div1, button);

  			if (!mounted) {
  				dispose = listen_dev(button, "click", /*onClick*/ ctx[4], false, false, false);
  				mounted = true;
  			}
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*image*/ 2 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[1])) {
  				attr_dev(img, "src", img_src_value);
  			}

  			if (dirty & /*name*/ 1 && img_alt_value !== (img_alt_value = "Image of " + /*name*/ ctx[0])) {
  				attr_dev(img, "alt", img_alt_value);
  			}

  			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
  			if (dirty & /*specialty*/ 4) set_data_dev(t3, /*specialty*/ ctx[2]);
  			if (dirty & /*description*/ 8) set_data_dev(t5, /*description*/ ctx[3]);
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  			mounted = false;
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$e.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$e($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Doctor', slots, []);
  	let { id } = $$props;
  	let { name } = $$props;
  	let { image } = $$props;
  	let { specialty } = $$props;
  	let { description } = $$props;
  	let dispatch = createEventDispatcher();

  	function onClick(e) {
  		dispatch('make-appointment', { id, name, specialty });
  	}

  	const writable_props = ['id', 'name', 'image', 'specialty', 'description'];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Doctor> was created with unknown prop '${key}'`);
  	});

  	$$self.$$set = $$props => {
  		if ('id' in $$props) $$invalidate(5, id = $$props.id);
  		if ('name' in $$props) $$invalidate(0, name = $$props.name);
  		if ('image' in $$props) $$invalidate(1, image = $$props.image);
  		if ('specialty' in $$props) $$invalidate(2, specialty = $$props.specialty);
  		if ('description' in $$props) $$invalidate(3, description = $$props.description);
  	};

  	$$self.$capture_state = () => ({
  		createEventDispatcher,
  		id,
  		name,
  		image,
  		specialty,
  		description,
  		dispatch,
  		onClick
  	});

  	$$self.$inject_state = $$props => {
  		if ('id' in $$props) $$invalidate(5, id = $$props.id);
  		if ('name' in $$props) $$invalidate(0, name = $$props.name);
  		if ('image' in $$props) $$invalidate(1, image = $$props.image);
  		if ('specialty' in $$props) $$invalidate(2, specialty = $$props.specialty);
  		if ('description' in $$props) $$invalidate(3, description = $$props.description);
  		if ('dispatch' in $$props) dispatch = $$props.dispatch;
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [name, image, specialty, description, onClick, id];
  }

  class Doctor extends SvelteComponentDev {
  	constructor(options) {
  		super(options);

  		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
  			id: 5,
  			name: 0,
  			image: 1,
  			specialty: 2,
  			description: 3
  		});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Doctor",
  			options,
  			id: create_fragment$e.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*id*/ ctx[5] === undefined && !('id' in props)) {
  			console.warn("<Doctor> was created without expected prop 'id'");
  		}

  		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
  			console.warn("<Doctor> was created without expected prop 'name'");
  		}

  		if (/*image*/ ctx[1] === undefined && !('image' in props)) {
  			console.warn("<Doctor> was created without expected prop 'image'");
  		}

  		if (/*specialty*/ ctx[2] === undefined && !('specialty' in props)) {
  			console.warn("<Doctor> was created without expected prop 'specialty'");
  		}

  		if (/*description*/ ctx[3] === undefined && !('description' in props)) {
  			console.warn("<Doctor> was created without expected prop 'description'");
  		}
  	}

  	get id() {
  		throw new Error("<Doctor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set id(value) {
  		throw new Error("<Doctor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get name() {
  		throw new Error("<Doctor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set name(value) {
  		throw new Error("<Doctor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get image() {
  		throw new Error("<Doctor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set image(value) {
  		throw new Error("<Doctor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get specialty() {
  		throw new Error("<Doctor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set specialty(value) {
  		throw new Error("<Doctor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get description() {
  		throw new Error("<Doctor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set description(value) {
  		throw new Error("<Doctor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const doctors = readable([
      {
          id: 1,
          name: 'Walter White',
          specialty: 'Chief Medical Officer',
          image: 'static/assets/img/doctors/doctors-1.jpg',
          description: 'Explicabo voluptatem mollitia et repellat qui dolorum quasi'
      },
      {
          id: 2,
          name: 'Sarah Jhonson',
          specialty: 'Anesthesiologist',
          image: 'static/assets/img/doctors/doctors-2.jpg',
          description: 'Aut maiores voluptates amet et quis praesentium qui senda para'
      },
      {
          id: 3,
          name: 'William Anderson',
          specialty: 'Cardiology',
          image: 'static/assets/img/doctors/doctors-3.jpg',
          description: 'Quisquam facilis cum velit laborum corrupti fuga rerum quia'
      },
      {
          id: 4,
          name: 'Amanda Jepson',
          specialty: 'Neurosurgeon',
          image: 'static/assets/img/doctors/doctors-4.jpg',
          description: 'Dolorum tempora officiis odit laborum officiis et et accusamus'
      },
  ]);

  /* src/components/Modal.svelte generated by Svelte v3.47.0 */
  const file$c = "src/components/Modal.svelte";

  function create_fragment$d(ctx) {
  	let div5;
  	let div4;
  	let div3;
  	let div0;
  	let h5;
  	let t0;
  	let h5_id_value;
  	let t1;
  	let button0;
  	let t2;
  	let div1;
  	let t3;
  	let div2;
  	let button1;
  	let t5;
  	let button2;
  	let t6;
  	let div5_aria_labelledby_value;
  	let current;
  	const default_slot_template = /*#slots*/ ctx[5].default;
  	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

  	const block = {
  		c: function create() {
  			div5 = element("div");
  			div4 = element("div");
  			div3 = element("div");
  			div0 = element("div");
  			h5 = element("h5");
  			t0 = text(/*title*/ ctx[1]);
  			t1 = space();
  			button0 = element("button");
  			t2 = space();
  			div1 = element("div");
  			if (default_slot) default_slot.c();
  			t3 = space();
  			div2 = element("div");
  			button1 = element("button");
  			button1.textContent = "Close";
  			t5 = space();
  			button2 = element("button");
  			t6 = text(/*buttonText*/ ctx[2]);
  			attr_dev(h5, "class", "modal-title");
  			attr_dev(h5, "id", h5_id_value = "" + (/*id*/ ctx[0] + "Label"));
  			add_location(h5, file$c, 31, 8, 561);
  			attr_dev(button0, "type", "button");
  			attr_dev(button0, "class", "btn-close");
  			attr_dev(button0, "data-bs-dismiss", "modal");
  			attr_dev(button0, "aria-label", "Close");
  			add_location(button0, file$c, 32, 8, 621);
  			attr_dev(div0, "class", "modal-header");
  			add_location(div0, file$c, 30, 6, 526);
  			attr_dev(div1, "class", "modal-body");
  			add_location(div1, file$c, 39, 6, 774);
  			attr_dev(button1, "type", "button");
  			attr_dev(button1, "class", "btn btn-secondary");
  			attr_dev(button1, "data-bs-dismiss", "modal");
  			add_location(button1, file$c, 41, 8, 859);
  			attr_dev(button2, "type", "button");
  			attr_dev(button2, "class", "btn btn-primary");
  			add_location(button2, file$c, 44, 8, 974);
  			attr_dev(div2, "class", "modal-footer");
  			add_location(div2, file$c, 40, 6, 824);
  			attr_dev(div3, "class", "modal-content");
  			add_location(div3, file$c, 29, 4, 492);
  			attr_dev(div4, "class", "modal-dialog");
  			add_location(div4, file$c, 28, 2, 461);
  			attr_dev(div5, "class", "modal fade");
  			attr_dev(div5, "id", /*id*/ ctx[0]);
  			attr_dev(div5, "tabindex", "-1");
  			attr_dev(div5, "aria-labelledby", div5_aria_labelledby_value = "" + (/*id*/ ctx[0] + "Label"));
  			attr_dev(div5, "aria-hidden", "true");
  			add_location(div5, file$c, 21, 0, 357);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div5, anchor);
  			append_dev(div5, div4);
  			append_dev(div4, div3);
  			append_dev(div3, div0);
  			append_dev(div0, h5);
  			append_dev(h5, t0);
  			append_dev(div0, t1);
  			append_dev(div0, button0);
  			append_dev(div3, t2);
  			append_dev(div3, div1);

  			if (default_slot) {
  				default_slot.m(div1, null);
  			}

  			append_dev(div3, t3);
  			append_dev(div3, div2);
  			append_dev(div2, button1);
  			append_dev(div2, t5);
  			append_dev(div2, button2);
  			append_dev(button2, t6);
  			current = true;
  		},
  		p: function update(ctx, [dirty]) {
  			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

  			if (!current || dirty & /*id*/ 1 && h5_id_value !== (h5_id_value = "" + (/*id*/ ctx[0] + "Label"))) {
  				attr_dev(h5, "id", h5_id_value);
  			}

  			if (default_slot) {
  				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
  					update_slot_base(
  						default_slot,
  						default_slot_template,
  						ctx,
  						/*$$scope*/ ctx[4],
  						!current
  						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
  						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
  						null
  					);
  				}
  			}

  			if (!current || dirty & /*buttonText*/ 4) set_data_dev(t6, /*buttonText*/ ctx[2]);

  			if (!current || dirty & /*id*/ 1) {
  				attr_dev(div5, "id", /*id*/ ctx[0]);
  			}

  			if (!current || dirty & /*id*/ 1 && div5_aria_labelledby_value !== (div5_aria_labelledby_value = "" + (/*id*/ ctx[0] + "Label"))) {
  				attr_dev(div5, "aria-labelledby", div5_aria_labelledby_value);
  			}
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(default_slot, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(default_slot, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div5);
  			if (default_slot) default_slot.d(detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$d.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$d($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Modal', slots, ['default']);
  	let { id } = $$props;
  	let { title } = $$props;
  	let { buttonText } = $$props;
  	var myModal;

  	onMount(async function () {
  		myModal = new Modal(document.getElementById("modal"), { keyboard: false });
  	});

  	function toggle() {
  		myModal.toggle();
  	}

  	const writable_props = ['id', 'title', 'buttonText'];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
  	});

  	$$self.$$set = $$props => {
  		if ('id' in $$props) $$invalidate(0, id = $$props.id);
  		if ('title' in $$props) $$invalidate(1, title = $$props.title);
  		if ('buttonText' in $$props) $$invalidate(2, buttonText = $$props.buttonText);
  		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
  	};

  	$$self.$capture_state = () => ({
  		Modal,
  		onMount,
  		id,
  		title,
  		buttonText,
  		myModal,
  		toggle
  	});

  	$$self.$inject_state = $$props => {
  		if ('id' in $$props) $$invalidate(0, id = $$props.id);
  		if ('title' in $$props) $$invalidate(1, title = $$props.title);
  		if ('buttonText' in $$props) $$invalidate(2, buttonText = $$props.buttonText);
  		if ('myModal' in $$props) myModal = $$props.myModal;
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [id, title, buttonText, toggle, $$scope, slots];
  }

  class Modal_1 extends SvelteComponentDev {
  	constructor(options) {
  		super(options);

  		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
  			id: 0,
  			title: 1,
  			buttonText: 2,
  			toggle: 3
  		});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Modal_1",
  			options,
  			id: create_fragment$d.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*id*/ ctx[0] === undefined && !('id' in props)) {
  			console.warn("<Modal> was created without expected prop 'id'");
  		}

  		if (/*title*/ ctx[1] === undefined && !('title' in props)) {
  			console.warn("<Modal> was created without expected prop 'title'");
  		}

  		if (/*buttonText*/ ctx[2] === undefined && !('buttonText' in props)) {
  			console.warn("<Modal> was created without expected prop 'buttonText'");
  		}
  	}

  	get id() {
  		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set id(value) {
  		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get title() {
  		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set title(value) {
  		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get buttonText() {
  		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set buttonText(value) {
  		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get toggle() {
  		return this.$$.ctx[3];
  	}

  	set toggle(value) {
  		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  /* src/components/DoctorList.svelte generated by Svelte v3.47.0 */
  const file$b = "src/components/DoctorList.svelte";

  function get_each_context$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[8] = list[i];
  	return child_ctx;
  }

  // (21:0) <MyModal   id="modal"   buttonText="Submit"   title="Make an Appointment with {selected.name}"   bind:this={modal} >
  function create_default_slot(ctx) {
  	let form;
  	let div1;
  	let label0;
  	let t1;
  	let input0;
  	let t2;
  	let div0;
  	let t4;
  	let div2;
  	let label1;
  	let t6;
  	let input1;

  	const block = {
  		c: function create() {
  			form = element("form");
  			div1 = element("div");
  			label0 = element("label");
  			label0.textContent = "Email address";
  			t1 = space();
  			input0 = element("input");
  			t2 = space();
  			div0 = element("div");
  			div0.textContent = "We'll never share your email with anyone else.";
  			t4 = space();
  			div2 = element("div");
  			label1 = element("label");
  			label1.textContent = "Password";
  			t6 = space();
  			input1 = element("input");
  			attr_dev(label0, "for", "exampleInputEmail1");
  			attr_dev(label0, "class", "form-label");
  			add_location(label0, file$b, 28, 6, 626);
  			attr_dev(input0, "type", "email");
  			attr_dev(input0, "class", "form-control");
  			attr_dev(input0, "id", "exampleInputEmail1");
  			attr_dev(input0, "aria-describedby", "emailHelp");
  			add_location(input0, file$b, 29, 6, 705);
  			attr_dev(div0, "id", "emailHelp");
  			attr_dev(div0, "class", "form-text");
  			add_location(div0, file$b, 35, 6, 846);
  			attr_dev(div1, "class", "mb-3");
  			add_location(div1, file$b, 27, 4, 601);
  			attr_dev(label1, "for", "exampleInputPassword1");
  			attr_dev(label1, "class", "form-label");
  			add_location(label1, file$b, 40, 6, 993);
  			attr_dev(input1, "type", "password");
  			attr_dev(input1, "class", "form-control");
  			attr_dev(input1, "id", "exampleInputPassword1");
  			add_location(input1, file$b, 41, 6, 1070);
  			attr_dev(div2, "class", "mb-3");
  			add_location(div2, file$b, 39, 4, 968);
  			add_location(form, file$b, 26, 2, 590);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, form, anchor);
  			append_dev(form, div1);
  			append_dev(div1, label0);
  			append_dev(div1, t1);
  			append_dev(div1, input0);
  			append_dev(div1, t2);
  			append_dev(div1, div0);
  			append_dev(form, t4);
  			append_dev(form, div2);
  			append_dev(div2, label1);
  			append_dev(div2, t6);
  			append_dev(div2, input1);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(form);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_default_slot.name,
  		type: "slot",
  		source: "(21:0) <MyModal   id=\\\"modal\\\"   buttonText=\\\"Submit\\\"   title=\\\"Make an Appointment with {selected.name}\\\"   bind:this={modal} >",
  		ctx
  	});

  	return block;
  }

  // (79:4) {:else}
  function create_else_block(ctx) {
  	let div;
  	let current;
  	let each_value = /*doctors*/ ctx[1];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  	}

  	const out = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	const block = {
  		c: function create() {
  			div = element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div, "class", "row");
  			add_location(div, file$b, 79, 6, 2213);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div, null);
  			}

  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*doctors, makeAppointment*/ 18) {
  				each_value = /*doctors*/ ctx[1];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(div, null);
  					}
  				}

  				group_outros();

  				for (i = each_value.length; i < each_blocks.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}
  		},
  		i: function intro(local) {
  			if (current) return;

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o: function outro(local) {
  			each_blocks = each_blocks.filter(Boolean);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			destroy_each(each_blocks, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_else_block.name,
  		type: "else",
  		source: "(79:4) {:else}",
  		ctx
  	});

  	return block;
  }

  // (73:4) {#if isLoading}
  function create_if_block(ctx) {
  	let div1;
  	let div0;
  	let span;

  	const block = {
  		c: function create() {
  			div1 = element("div");
  			div0 = element("div");
  			span = element("span");
  			span.textContent = "Loading...";
  			attr_dev(span, "class", "sr-only");
  			add_location(span, file$b, 75, 10, 2127);
  			attr_dev(div0, "class", "spinner-grow text-primary");
  			attr_dev(div0, "role", "status");
  			add_location(div0, file$b, 74, 8, 2063);
  			attr_dev(div1, "class", "d-flex justify-content-center");
  			add_location(div1, file$b, 73, 6, 2011);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div1, anchor);
  			append_dev(div1, div0);
  			append_dev(div0, span);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div1);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block.name,
  		type: "if",
  		source: "(73:4) {#if isLoading}",
  		ctx
  	});

  	return block;
  }

  // (81:8) {#each doctors as doctor}
  function create_each_block$1(ctx) {
  	let div;
  	let doctor;
  	let t;
  	let current;
  	const doctor_spread_levels = [/*doctor*/ ctx[8]];
  	let doctor_props = {};

  	for (let i = 0; i < doctor_spread_levels.length; i += 1) {
  		doctor_props = assign(doctor_props, doctor_spread_levels[i]);
  	}

  	doctor = new Doctor({ props: doctor_props, $$inline: true });
  	doctor.$on("make-appointment", /*makeAppointment*/ ctx[4]);

  	const block = {
  		c: function create() {
  			div = element("div");
  			create_component(doctor.$$.fragment);
  			t = space();
  			attr_dev(div, "class", "col-lg-6");
  			add_location(div, file$b, 81, 10, 2275);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);
  			mount_component(doctor, div, null);
  			append_dev(div, t);
  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			const doctor_changes = (dirty & /*doctors*/ 2)
  			? get_spread_update(doctor_spread_levels, [get_spread_object(/*doctor*/ ctx[8])])
  			: {};

  			doctor.$set(doctor_changes);
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(doctor.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(doctor.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			destroy_component(doctor);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$1.name,
  		type: "each",
  		source: "(81:8) {#each doctors as doctor}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$c(ctx) {
  	let mymodal;
  	let t0;
  	let section;
  	let div2;
  	let div1;
  	let h2;
  	let t2;
  	let p;
  	let t4;
  	let div0;
  	let input;
  	let t5;
  	let button;
  	let i;
  	let t6;
  	let t7;
  	let current_block_type_index;
  	let if_block;
  	let current;
  	let mounted;
  	let dispose;

  	let mymodal_props = {
  		id: "modal",
  		buttonText: "Submit",
  		title: "Make an Appointment with " + /*selected*/ ctx[3].name,
  		$$slots: { default: [create_default_slot] },
  		$$scope: { ctx }
  	};

  	mymodal = new Modal_1({ props: mymodal_props, $$inline: true });
  	/*mymodal_binding*/ ctx[6](mymodal);
  	const if_block_creators = [create_if_block, create_else_block];
  	const if_blocks = [];

  	function select_block_type(ctx, dirty) {
  		if (/*isLoading*/ ctx[2]) return 0;
  		return 1;
  	}

  	current_block_type_index = select_block_type(ctx);
  	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

  	const block = {
  		c: function create() {
  			create_component(mymodal.$$.fragment);
  			t0 = space();
  			section = element("section");
  			div2 = element("div");
  			div1 = element("div");
  			h2 = element("h2");
  			h2.textContent = "Doctors";
  			t2 = space();
  			p = element("p");
  			p.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n        aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n        quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat\n        sit in iste officiis commodi quidem hic quas.";
  			t4 = space();
  			div0 = element("div");
  			input = element("input");
  			t5 = space();
  			button = element("button");
  			i = element("i");
  			t6 = text(" Search");
  			t7 = space();
  			if_block.c();
  			add_location(h2, file$b, 49, 6, 1280);
  			add_location(p, file$b, 50, 6, 1303);
  			attr_dev(input, "type", "text");
  			attr_dev(input, "class", "form-control form-control-lg");
  			attr_dev(input, "placeholder", "Search Here");
  			add_location(input, file$b, 58, 8, 1654);
  			attr_dev(i, "class", "bi bi-search me-2");
  			add_location(i, file$b, 67, 11, 1903);
  			attr_dev(button, "type", "submit");
  			attr_dev(button, "class", "input-group-text btn-primary");
  			add_location(button, file$b, 63, 8, 1785);
  			attr_dev(div0, "class", "input-group mt-3 mb-3");
  			add_location(div0, file$b, 57, 6, 1610);
  			attr_dev(div1, "class", "section-title");
  			add_location(div1, file$b, 48, 4, 1246);
  			attr_dev(div2, "class", "container");
  			add_location(div2, file$b, 47, 2, 1218);
  			attr_dev(section, "id", "doctors");
  			attr_dev(section, "class", "doctors svelte-2v979d");
  			add_location(section, file$b, 46, 0, 1177);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			mount_component(mymodal, target, anchor);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, section, anchor);
  			append_dev(section, div2);
  			append_dev(div2, div1);
  			append_dev(div1, h2);
  			append_dev(div1, t2);
  			append_dev(div1, p);
  			append_dev(div1, t4);
  			append_dev(div1, div0);
  			append_dev(div0, input);
  			append_dev(div0, t5);
  			append_dev(div0, button);
  			append_dev(button, i);
  			append_dev(button, t6);
  			append_dev(div2, t7);
  			if_blocks[current_block_type_index].m(div2, null);
  			current = true;

  			if (!mounted) {
  				dispose = listen_dev(button, "click", /*search*/ ctx[5], false, false, false);
  				mounted = true;
  			}
  		},
  		p: function update(ctx, [dirty]) {
  			const mymodal_changes = {};
  			if (dirty & /*selected*/ 8) mymodal_changes.title = "Make an Appointment with " + /*selected*/ ctx[3].name;

  			if (dirty & /*$$scope*/ 2048) {
  				mymodal_changes.$$scope = { dirty, ctx };
  			}

  			mymodal.$set(mymodal_changes);
  			let previous_block_index = current_block_type_index;
  			current_block_type_index = select_block_type(ctx);

  			if (current_block_type_index === previous_block_index) {
  				if_blocks[current_block_type_index].p(ctx, dirty);
  			} else {
  				group_outros();

  				transition_out(if_blocks[previous_block_index], 1, 1, () => {
  					if_blocks[previous_block_index] = null;
  				});

  				check_outros();
  				if_block = if_blocks[current_block_type_index];

  				if (!if_block) {
  					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  					if_block.c();
  				} else {
  					if_block.p(ctx, dirty);
  				}

  				transition_in(if_block, 1);
  				if_block.m(div2, null);
  			}
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(mymodal.$$.fragment, local);
  			transition_in(if_block);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(mymodal.$$.fragment, local);
  			transition_out(if_block);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			/*mymodal_binding*/ ctx[6](null);
  			destroy_component(mymodal, detaching);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(section);
  			if_blocks[current_block_type_index].d();
  			mounted = false;
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$c.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$c($$self, $$props, $$invalidate) {
  	let $docs;
  	validate_store(doctors, 'docs');
  	component_subscribe($$self, doctors, $$value => $$invalidate(7, $docs = $$value));
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('DoctorList', slots, []);
  	let modal;
  	let doctors$1 = [];
  	let isLoading = false;
  	let selected = { name: "none" };

  	function makeAppointment(e) {
  		$$invalidate(3, selected = e.detail);
  		modal.toggle();
  	}

  	function search(e) {
  		$$invalidate(2, isLoading = true);

  		setTimeout(
  			function () {
  				$$invalidate(2, isLoading = false);
  				$$invalidate(1, doctors$1 = $docs);
  			},
  			500
  		);
  	}

  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DoctorList> was created with unknown prop '${key}'`);
  	});

  	function mymodal_binding($$value) {
  		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
  			modal = $$value;
  			$$invalidate(0, modal);
  		});
  	}

  	$$self.$capture_state = () => ({
  		Doctor,
  		docs: doctors,
  		MyModal: Modal_1,
  		modal,
  		doctors: doctors$1,
  		isLoading,
  		selected,
  		makeAppointment,
  		search,
  		$docs
  	});

  	$$self.$inject_state = $$props => {
  		if ('modal' in $$props) $$invalidate(0, modal = $$props.modal);
  		if ('doctors' in $$props) $$invalidate(1, doctors$1 = $$props.doctors);
  		if ('isLoading' in $$props) $$invalidate(2, isLoading = $$props.isLoading);
  		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [modal, doctors$1, isLoading, selected, makeAppointment, search, mymodal_binding];
  }

  class DoctorList extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DoctorList",
  			options,
  			id: create_fragment$c.name
  		});
  	}
  }

  /* src/components/Faq.svelte generated by Svelte v3.47.0 */

  const file$a = "src/components/Faq.svelte";

  function create_fragment$b(ctx) {
  	let section;
  	let div7;
  	let div0;
  	let h2;
  	let t1;
  	let p0;
  	let t3;
  	let div6;
  	let ul;
  	let li0;
  	let i0;
  	let t4;
  	let a0;
  	let t5;
  	let i1;
  	let i2;
  	let t6;
  	let div1;
  	let p1;
  	let t8;
  	let li1;
  	let i3;
  	let t9;
  	let a1;
  	let t10;
  	let i4;
  	let i5;
  	let t11;
  	let div2;
  	let p2;
  	let t13;
  	let li2;
  	let i6;
  	let t14;
  	let a2;
  	let t15;
  	let i7;
  	let i8;
  	let t16;
  	let div3;
  	let p3;
  	let t18;
  	let li3;
  	let i9;
  	let t19;
  	let a3;
  	let t20;
  	let i10;
  	let i11;
  	let t21;
  	let div4;
  	let p4;
  	let t23;
  	let li4;
  	let i12;
  	let t24;
  	let a4;
  	let t25;
  	let i13;
  	let i14;
  	let t26;
  	let div5;
  	let p5;

  	const block = {
  		c: function create() {
  			section = element("section");
  			div7 = element("div");
  			div0 = element("div");
  			h2 = element("h2");
  			h2.textContent = "Frequently Asked Questions";
  			t1 = space();
  			p0 = element("p");
  			p0.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n        aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n        quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat\n        sit in iste officiis commodi quidem hic quas.";
  			t3 = space();
  			div6 = element("div");
  			ul = element("ul");
  			li0 = element("li");
  			i0 = element("i");
  			t4 = space();
  			a0 = element("a");
  			t5 = text("Non consectetur a erat nam at lectus urna duis? ");
  			i1 = element("i");
  			i2 = element("i");
  			t6 = space();
  			div1 = element("div");
  			p1 = element("p");
  			p1.textContent = "Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id\n              volutpat lacus laoreet non curabitur gravida. Venenatis lectus\n              magna fringilla urna porttitor rhoncus dolor purus non.";
  			t8 = space();
  			li1 = element("li");
  			i3 = element("i");
  			t9 = space();
  			a1 = element("a");
  			t10 = text("Feugiat scelerisque varius morbi enim nunc? ");
  			i4 = element("i");
  			i5 = element("i");
  			t11 = space();
  			div2 = element("div");
  			p2 = element("p");
  			p2.textContent = "Dolor sit amet consectetur adipiscing elit pellentesque habitant\n              morbi. Id interdum velit laoreet id donec ultrices. Fringilla\n              phasellus faucibus scelerisque eleifend donec pretium. Est\n              pellentesque elit ullamcorper dignissim. Mauris ultrices eros in\n              cursus turpis massa tincidunt dui.";
  			t13 = space();
  			li2 = element("li");
  			i6 = element("i");
  			t14 = space();
  			a2 = element("a");
  			t15 = text("Dolor sit amet consectetur adipiscing elit? ");
  			i7 = element("i");
  			i8 = element("i");
  			t16 = space();
  			div3 = element("div");
  			p3 = element("p");
  			p3.textContent = "Eleifend mi in nulla posuere sollicitudin aliquam ultrices\n              sagittis orci. Faucibus pulvinar elementum integer enim. Sem nulla\n              pharetra diam sit amet nisl suscipit. Rutrum tellus pellentesque\n              eu tincidunt. Lectus urna duis convallis convallis tellus. Urna\n              molestie at elementum eu facilisis sed odio morbi quis";
  			t18 = space();
  			li3 = element("li");
  			i9 = element("i");
  			t19 = space();
  			a3 = element("a");
  			t20 = text("Tempus quam pellentesque nec nam aliquam sem et tortor consequat? ");
  			i10 = element("i");
  			i11 = element("i");
  			t21 = space();
  			div4 = element("div");
  			p4 = element("p");
  			p4.textContent = "Molestie a iaculis at erat pellentesque adipiscing commodo.\n              Dignissim suspendisse in est ante in. Nunc vel risus commodo\n              viverra maecenas accumsan. Sit amet nisl suscipit adipiscing\n              bibendum est. Purus gravida quis blandit turpis cursus in.";
  			t23 = space();
  			li4 = element("li");
  			i12 = element("i");
  			t24 = space();
  			a4 = element("a");
  			t25 = text("Tortor vitae purus faucibus ornare. Varius vel pharetra vel turpis\n            nunc eget lorem dolor? ");
  			i13 = element("i");
  			i14 = element("i");
  			t26 = space();
  			div5 = element("div");
  			p5 = element("p");
  			p5.textContent = "Laoreet sit amet cursus sit amet dictum sit amet justo. Mauris\n              vitae ultricies leo integer malesuada nunc vel. Tincidunt eget\n              nullam non nisi est sit amet. Turpis nunc eget lorem dolor sed. Ut\n              venenatis tellus in metus vulputate eu scelerisque.";
  			add_location(h2, file$a, 5, 6, 135);
  			attr_dev(p0, "class", "svelte-13nsybp");
  			add_location(p0, file$a, 6, 6, 177);
  			attr_dev(div0, "class", "section-title");
  			add_location(div0, file$a, 4, 4, 101);
  			attr_dev(i0, "class", "bx bx-help-circle icon-help svelte-13nsybp");
  			add_location(i0, file$a, 17, 10, 569);
  			attr_dev(i1, "class", "bx bx-chevron-down icon-show svelte-13nsybp");
  			add_location(i1, file$a, 22, 61, 793);
  			attr_dev(i2, "class", "bx bx-chevron-up icon-close svelte-13nsybp");
  			add_location(i2, file$a, 24, 14, 861);
  			attr_dev(a0, "data-bs-toggle", "collapse");
  			attr_dev(a0, "class", "collapse svelte-13nsybp");
  			attr_dev(a0, "data-bs-target", "#faq-list-1");
  			add_location(a0, file$a, 18, 10, 621);
  			attr_dev(p1, "class", "svelte-13nsybp");
  			add_location(p1, file$a, 27, 12, 1011);
  			attr_dev(div1, "id", "faq-list-1");
  			attr_dev(div1, "class", "collapse show");
  			attr_dev(div1, "data-bs-parent", ".faq-list");
  			add_location(div1, file$a, 26, 10, 928);
  			attr_dev(li0, "data-aos", "fade-up");
  			attr_dev(li0, "class", "svelte-13nsybp");
  			add_location(li0, file$a, 16, 8, 535);
  			attr_dev(i3, "class", "bx bx-help-circle icon-help svelte-13nsybp");
  			add_location(i3, file$a, 36, 10, 1349);
  			attr_dev(i4, "class", "bx bx-chevron-down icon-show svelte-13nsybp");
  			add_location(i4, file$a, 41, 57, 1570);
  			attr_dev(i5, "class", "bx bx-chevron-up icon-close svelte-13nsybp");
  			add_location(i5, file$a, 43, 14, 1638);
  			attr_dev(a1, "data-bs-toggle", "collapse");
  			attr_dev(a1, "data-bs-target", "#faq-list-2");
  			attr_dev(a1, "class", "collapsed svelte-13nsybp");
  			add_location(a1, file$a, 37, 10, 1401);
  			attr_dev(p2, "class", "svelte-13nsybp");
  			add_location(p2, file$a, 46, 12, 1783);
  			attr_dev(div2, "id", "faq-list-2");
  			attr_dev(div2, "class", "collapse");
  			attr_dev(div2, "data-bs-parent", ".faq-list");
  			add_location(div2, file$a, 45, 10, 1705);
  			attr_dev(li1, "data-aos", "fade-up");
  			attr_dev(li1, "data-aos-delay", "100");
  			attr_dev(li1, "class", "svelte-13nsybp");
  			add_location(li1, file$a, 35, 8, 1294);
  			attr_dev(i6, "class", "bx bx-help-circle icon-help svelte-13nsybp");
  			add_location(i6, file$a, 57, 10, 2255);
  			attr_dev(i7, "class", "bx bx-chevron-down icon-show svelte-13nsybp");
  			add_location(i7, file$a, 62, 57, 2476);
  			attr_dev(i8, "class", "bx bx-chevron-up icon-close svelte-13nsybp");
  			add_location(i8, file$a, 64, 14, 2544);
  			attr_dev(a2, "data-bs-toggle", "collapse");
  			attr_dev(a2, "data-bs-target", "#faq-list-3");
  			attr_dev(a2, "class", "collapsed svelte-13nsybp");
  			add_location(a2, file$a, 58, 10, 2307);
  			attr_dev(p3, "class", "svelte-13nsybp");
  			add_location(p3, file$a, 67, 12, 2689);
  			attr_dev(div3, "id", "faq-list-3");
  			attr_dev(div3, "class", "collapse");
  			attr_dev(div3, "data-bs-parent", ".faq-list");
  			add_location(div3, file$a, 66, 10, 2611);
  			attr_dev(li2, "data-aos", "fade-up");
  			attr_dev(li2, "data-aos-delay", "200");
  			attr_dev(li2, "class", "svelte-13nsybp");
  			add_location(li2, file$a, 56, 8, 2200);
  			attr_dev(i9, "class", "bx bx-help-circle icon-help svelte-13nsybp");
  			add_location(i9, file$a, 78, 10, 3185);
  			attr_dev(i10, "class", "bx bx-chevron-down icon-show svelte-13nsybp");
  			add_location(i10, file$a, 83, 79, 3428);
  			attr_dev(i11, "class", "bx bx-chevron-up icon-close svelte-13nsybp");
  			add_location(i11, file$a, 85, 14, 3496);
  			attr_dev(a3, "data-bs-toggle", "collapse");
  			attr_dev(a3, "data-bs-target", "#faq-list-4");
  			attr_dev(a3, "class", "collapsed svelte-13nsybp");
  			add_location(a3, file$a, 79, 10, 3237);
  			attr_dev(p4, "class", "svelte-13nsybp");
  			add_location(p4, file$a, 88, 12, 3641);
  			attr_dev(div4, "id", "faq-list-4");
  			attr_dev(div4, "class", "collapse");
  			attr_dev(div4, "data-bs-parent", ".faq-list");
  			add_location(div4, file$a, 87, 10, 3563);
  			attr_dev(li3, "data-aos", "fade-up");
  			attr_dev(li3, "data-aos-delay", "300");
  			attr_dev(li3, "class", "svelte-13nsybp");
  			add_location(li3, file$a, 77, 8, 3130);
  			attr_dev(i12, "class", "bx bx-help-circle icon-help svelte-13nsybp");
  			add_location(i12, file$a, 98, 10, 4054);
  			attr_dev(i13, "class", "bx bx-chevron-down icon-show svelte-13nsybp");
  			add_location(i13, file$a, 104, 35, 4333);
  			attr_dev(i14, "class", "bx bx-chevron-up icon-close svelte-13nsybp");
  			add_location(i14, file$a, 104, 77, 4375);
  			attr_dev(a4, "data-bs-toggle", "collapse");
  			attr_dev(a4, "data-bs-target", "#faq-list-5");
  			attr_dev(a4, "class", "collapsed svelte-13nsybp");
  			add_location(a4, file$a, 99, 10, 4106);
  			attr_dev(p5, "class", "svelte-13nsybp");
  			add_location(p5, file$a, 109, 12, 4546);
  			attr_dev(div5, "id", "faq-list-5");
  			attr_dev(div5, "class", "collapse");
  			attr_dev(div5, "data-bs-parent", ".faq-list");
  			add_location(div5, file$a, 108, 10, 4468);
  			attr_dev(li4, "data-aos", "fade-up");
  			attr_dev(li4, "data-aos-delay", "400");
  			attr_dev(li4, "class", "svelte-13nsybp");
  			add_location(li4, file$a, 97, 8, 3999);
  			attr_dev(ul, "class", "svelte-13nsybp");
  			add_location(ul, file$a, 15, 6, 522);
  			attr_dev(div6, "class", "faq-list svelte-13nsybp");
  			add_location(div6, file$a, 14, 4, 493);
  			attr_dev(div7, "class", "container");
  			add_location(div7, file$a, 3, 2, 73);
  			attr_dev(section, "id", "faq");
  			attr_dev(section, "class", "faq section-bg svelte-13nsybp");
  			add_location(section, file$a, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div7);
  			append_dev(div7, div0);
  			append_dev(div0, h2);
  			append_dev(div0, t1);
  			append_dev(div0, p0);
  			append_dev(div7, t3);
  			append_dev(div7, div6);
  			append_dev(div6, ul);
  			append_dev(ul, li0);
  			append_dev(li0, i0);
  			append_dev(li0, t4);
  			append_dev(li0, a0);
  			append_dev(a0, t5);
  			append_dev(a0, i1);
  			append_dev(a0, i2);
  			append_dev(li0, t6);
  			append_dev(li0, div1);
  			append_dev(div1, p1);
  			append_dev(ul, t8);
  			append_dev(ul, li1);
  			append_dev(li1, i3);
  			append_dev(li1, t9);
  			append_dev(li1, a1);
  			append_dev(a1, t10);
  			append_dev(a1, i4);
  			append_dev(a1, i5);
  			append_dev(li1, t11);
  			append_dev(li1, div2);
  			append_dev(div2, p2);
  			append_dev(ul, t13);
  			append_dev(ul, li2);
  			append_dev(li2, i6);
  			append_dev(li2, t14);
  			append_dev(li2, a2);
  			append_dev(a2, t15);
  			append_dev(a2, i7);
  			append_dev(a2, i8);
  			append_dev(li2, t16);
  			append_dev(li2, div3);
  			append_dev(div3, p3);
  			append_dev(ul, t18);
  			append_dev(ul, li3);
  			append_dev(li3, i9);
  			append_dev(li3, t19);
  			append_dev(li3, a3);
  			append_dev(a3, t20);
  			append_dev(a3, i10);
  			append_dev(a3, i11);
  			append_dev(li3, t21);
  			append_dev(li3, div4);
  			append_dev(div4, p4);
  			append_dev(ul, t23);
  			append_dev(ul, li4);
  			append_dev(li4, i12);
  			append_dev(li4, t24);
  			append_dev(li4, a4);
  			append_dev(a4, t25);
  			append_dev(a4, i13);
  			append_dev(a4, i14);
  			append_dev(li4, t26);
  			append_dev(li4, div5);
  			append_dev(div5, p5);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$b.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$b($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Faq', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Faq> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class Faq extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Faq",
  			options,
  			id: create_fragment$b.name
  		});
  	}
  }

  /* src/components/Testimonial.svelte generated by Svelte v3.47.0 */

  const file$9 = "src/components/Testimonial.svelte";

  function create_fragment$a(ctx) {
  	let div;
  	let img;
  	let img_src_value;
  	let img_alt_value;
  	let t0;
  	let h3;
  	let t1;
  	let t2;
  	let h4;
  	let t3;
  	let t4;
  	let p;
  	let i0;
  	let t5;
  	let t6;
  	let t7;
  	let i1;

  	const block = {
  		c: function create() {
  			div = element("div");
  			img = element("img");
  			t0 = space();
  			h3 = element("h3");
  			t1 = text(/*name*/ ctx[0]);
  			t2 = space();
  			h4 = element("h4");
  			t3 = text(/*role*/ ctx[2]);
  			t4 = space();
  			p = element("p");
  			i0 = element("i");
  			t5 = space();
  			t6 = text(/*review*/ ctx[3]);
  			t7 = space();
  			i1 = element("i");
  			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[1])) attr_dev(img, "src", img_src_value);
  			attr_dev(img, "class", "testimonial-img svelte-prdr5q");
  			attr_dev(img, "alt", img_alt_value = "An image of " + /*name*/ ctx[0]);
  			add_location(img, file$9, 7, 2, 133);
  			attr_dev(h3, "class", "svelte-prdr5q");
  			add_location(h3, file$9, 8, 2, 204);
  			attr_dev(h4, "class", "svelte-prdr5q");
  			add_location(h4, file$9, 9, 2, 222);
  			attr_dev(i0, "class", "bx bxs-quote-alt-left quote-icon-left svelte-prdr5q");
  			add_location(i0, file$9, 11, 4, 248);
  			attr_dev(i1, "class", "bx bxs-quote-alt-right quote-icon-right svelte-prdr5q");
  			add_location(i1, file$9, 13, 4, 317);
  			attr_dev(p, "class", "svelte-prdr5q");
  			add_location(p, file$9, 10, 2, 240);
  			attr_dev(div, "class", "testimonial-item svelte-prdr5q");
  			add_location(div, file$9, 6, 0, 100);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);
  			append_dev(div, img);
  			append_dev(div, t0);
  			append_dev(div, h3);
  			append_dev(h3, t1);
  			append_dev(div, t2);
  			append_dev(div, h4);
  			append_dev(h4, t3);
  			append_dev(div, t4);
  			append_dev(div, p);
  			append_dev(p, i0);
  			append_dev(p, t5);
  			append_dev(p, t6);
  			append_dev(p, t7);
  			append_dev(p, i1);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*image*/ 2 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[1])) {
  				attr_dev(img, "src", img_src_value);
  			}

  			if (dirty & /*name*/ 1 && img_alt_value !== (img_alt_value = "An image of " + /*name*/ ctx[0])) {
  				attr_dev(img, "alt", img_alt_value);
  			}

  			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
  			if (dirty & /*role*/ 4) set_data_dev(t3, /*role*/ ctx[2]);
  			if (dirty & /*review*/ 8) set_data_dev(t6, /*review*/ ctx[3]);
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$a.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$a($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Testimonial', slots, []);
  	let { name } = $$props;
  	let { image } = $$props;
  	let { role } = $$props;
  	let { review } = $$props;
  	const writable_props = ['name', 'image', 'role', 'review'];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Testimonial> was created with unknown prop '${key}'`);
  	});

  	$$self.$$set = $$props => {
  		if ('name' in $$props) $$invalidate(0, name = $$props.name);
  		if ('image' in $$props) $$invalidate(1, image = $$props.image);
  		if ('role' in $$props) $$invalidate(2, role = $$props.role);
  		if ('review' in $$props) $$invalidate(3, review = $$props.review);
  	};

  	$$self.$capture_state = () => ({ name, image, role, review });

  	$$self.$inject_state = $$props => {
  		if ('name' in $$props) $$invalidate(0, name = $$props.name);
  		if ('image' in $$props) $$invalidate(1, image = $$props.image);
  		if ('role' in $$props) $$invalidate(2, role = $$props.role);
  		if ('review' in $$props) $$invalidate(3, review = $$props.review);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [name, image, role, review];
  }

  class Testimonial extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$a, create_fragment$a, safe_not_equal, { name: 0, image: 1, role: 2, review: 3 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Testimonial",
  			options,
  			id: create_fragment$a.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
  			console.warn("<Testimonial> was created without expected prop 'name'");
  		}

  		if (/*image*/ ctx[1] === undefined && !('image' in props)) {
  			console.warn("<Testimonial> was created without expected prop 'image'");
  		}

  		if (/*role*/ ctx[2] === undefined && !('role' in props)) {
  			console.warn("<Testimonial> was created without expected prop 'role'");
  		}

  		if (/*review*/ ctx[3] === undefined && !('review' in props)) {
  			console.warn("<Testimonial> was created without expected prop 'review'");
  		}
  	}

  	get name() {
  		throw new Error("<Testimonial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set name(value) {
  		throw new Error("<Testimonial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get image() {
  		throw new Error("<Testimonial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set image(value) {
  		throw new Error("<Testimonial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get role() {
  		throw new Error("<Testimonial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set role(value) {
  		throw new Error("<Testimonial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get review() {
  		throw new Error("<Testimonial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set review(value) {
  		throw new Error("<Testimonial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const testimonials = readable([
      {
          name: 'Saul Goodman',
          role: 'Ceo &amp; Founder',
          image: 'static/assets/img/testimonials/testimonials-1.jpg',
          review: 'Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus. Accusantium quam, ultricies eget id, aliquam eget nibh et. Maecen aliquam, risus at semper.'
      },
      {
          name: 'Sara Wilsson',
          role: 'Designer',
          image: 'static/assets/img/testimonials/testimonials-2.jpg',
          review: 'Export tempor illum tamen malis malis eram quae irure esse labore quem cillum quid cillum eram malis quorum velit fore eram velit sunt aliqua noster fugiat irure amet legam anim culpa.'
      },
      {
          name: 'Jena Karlis',
          role: 'Store Owner',
          image: 'static/assets/img/testimonials/testimonials-3.jpg',
          review: 'Enim nisi quem export duis labore cillum quae magna enim sint quorum nulla quem veniam duis minim tempor labore quem eram duis noster aute amet eram fore quis sint minim.'
      },
      {
          name: 'Matt Brandon',
          role: 'Freelancer',
          image: 'static/assets/img/testimonials/testimonials-4.jpg',
          review: 'Fugiat enim eram quae cillum dolore dolor amet nulla culpa multos export minim fugiat minim velit minim dolor enim duis veniam ipsum anim magna sunt elit fore quem dolore labore illum veniam.'
      },
      {
          name: 'John Larson',
          role: 'Entrepreneur',
          image: 'static/assets/img/testimonials/testimonials-5.jpg',
          review: 'Quis quorum aliqua sint quem legam fore sunt eram irure aliqua veniam tempor noster veniam enim culpa labore duis sunt culpa nulla illum cillum fugiat legam esse veniam culpa fore nisi cillum quid.'
      },
  ]);

  /* src/components/TestimonialList.svelte generated by Svelte v3.47.0 */
  const file$8 = "src/components/TestimonialList.svelte";

  function get_each_context(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[1] = list[i];
  	return child_ctx;
  }

  // (15:12) {#each $testimonials as testimonial}
  function create_each_block(ctx) {
  	let testimonial;
  	let current;
  	const testimonial_spread_levels = [/*testimonial*/ ctx[1]];
  	let testimonial_props = {};

  	for (let i = 0; i < testimonial_spread_levels.length; i += 1) {
  		testimonial_props = assign(testimonial_props, testimonial_spread_levels[i]);
  	}

  	testimonial = new Testimonial({ props: testimonial_props, $$inline: true });

  	const block = {
  		c: function create() {
  			create_component(testimonial.$$.fragment);
  		},
  		m: function mount(target, anchor) {
  			mount_component(testimonial, target, anchor);
  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			const testimonial_changes = (dirty & /*$testimonials*/ 1)
  			? get_spread_update(testimonial_spread_levels, [get_spread_object(/*testimonial*/ ctx[1])])
  			: {};

  			testimonial.$set(testimonial_changes);
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(testimonial.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(testimonial.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			destroy_component(testimonial, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block.name,
  		type: "each",
  		source: "(15:12) {#each $testimonials as testimonial}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$9(ctx) {
  	let section;
  	let div5;
  	let div4;
  	let div2;
  	let div1;
  	let div0;
  	let t;
  	let div3;
  	let current;
  	let each_value = /*$testimonials*/ ctx[0];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  	}

  	const out = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	const block = {
  		c: function create() {
  			section = element("section");
  			div5 = element("div");
  			div4 = element("div");
  			div2 = element("div");
  			div1 = element("div");
  			div0 = element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			div3 = element("div");
  			attr_dev(div0, "class", "testimonial-wrap svelte-5tsivu");
  			add_location(div0, file$8, 13, 10, 395);
  			attr_dev(div1, "class", "swiper-slide");
  			add_location(div1, file$8, 12, 8, 358);
  			attr_dev(div2, "class", "swiper-wrapper");
  			add_location(div2, file$8, 11, 6, 321);
  			attr_dev(div3, "class", "swiper-pagination svelte-5tsivu");
  			add_location(div3, file$8, 21, 6, 631);
  			attr_dev(div4, "class", "testimonials-slider swiper svelte-5tsivu");
  			attr_dev(div4, "data-aos", "fade-up");
  			attr_dev(div4, "data-aos-delay", "100");
  			add_location(div4, file$8, 6, 4, 211);
  			attr_dev(div5, "class", "container");
  			add_location(div5, file$8, 5, 2, 183);
  			attr_dev(section, "id", "testimonials");
  			attr_dev(section, "class", "testimonials svelte-5tsivu");
  			add_location(section, file$8, 4, 0, 132);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div5);
  			append_dev(div5, div4);
  			append_dev(div4, div2);
  			append_dev(div2, div1);
  			append_dev(div1, div0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div0, null);
  			}

  			append_dev(div4, t);
  			append_dev(div4, div3);
  			current = true;
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*$testimonials*/ 1) {
  				each_value = /*$testimonials*/ ctx[0];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(div0, null);
  					}
  				}

  				group_outros();

  				for (i = each_value.length; i < each_blocks.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}
  		},
  		i: function intro(local) {
  			if (current) return;

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o: function outro(local) {
  			each_blocks = each_blocks.filter(Boolean);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  			destroy_each(each_blocks, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$9.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$9($$self, $$props, $$invalidate) {
  	let $testimonials;
  	validate_store(testimonials, 'testimonials');
  	component_subscribe($$self, testimonials, $$value => $$invalidate(0, $testimonials = $$value));
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('TestimonialList', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TestimonialList> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({ Testimonial, testimonials, $testimonials });
  	return [$testimonials];
  }

  class TestimonialList extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "TestimonialList",
  			options,
  			id: create_fragment$9.name
  		});
  	}
  }

  /* src/components/Gallery.svelte generated by Svelte v3.47.0 */

  const file$7 = "src/components/Gallery.svelte";

  function create_fragment$8(ctx) {
  	let section;
  	let div1;
  	let div0;
  	let h2;
  	let t1;
  	let p;
  	let t3;
  	let div19;
  	let div18;
  	let div3;
  	let div2;
  	let a0;
  	let img0;
  	let img0_src_value;
  	let t4;
  	let div5;
  	let div4;
  	let a1;
  	let img1;
  	let img1_src_value;
  	let t5;
  	let div7;
  	let div6;
  	let a2;
  	let img2;
  	let img2_src_value;
  	let t6;
  	let div9;
  	let div8;
  	let a3;
  	let img3;
  	let img3_src_value;
  	let t7;
  	let div11;
  	let div10;
  	let a4;
  	let img4;
  	let img4_src_value;
  	let t8;
  	let div13;
  	let div12;
  	let a5;
  	let img5;
  	let img5_src_value;
  	let t9;
  	let div15;
  	let div14;
  	let a6;
  	let img6;
  	let img6_src_value;
  	let t10;
  	let div17;
  	let div16;
  	let a7;
  	let img7;
  	let img7_src_value;

  	const block = {
  		c: function create() {
  			section = element("section");
  			div1 = element("div");
  			div0 = element("div");
  			h2 = element("h2");
  			h2.textContent = "Gallery";
  			t1 = space();
  			p = element("p");
  			p.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n        aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n        quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat\n        sit in iste officiis commodi quidem hic quas.";
  			t3 = space();
  			div19 = element("div");
  			div18 = element("div");
  			div3 = element("div");
  			div2 = element("div");
  			a0 = element("a");
  			img0 = element("img");
  			t4 = space();
  			div5 = element("div");
  			div4 = element("div");
  			a1 = element("a");
  			img1 = element("img");
  			t5 = space();
  			div7 = element("div");
  			div6 = element("div");
  			a2 = element("a");
  			img2 = element("img");
  			t6 = space();
  			div9 = element("div");
  			div8 = element("div");
  			a3 = element("a");
  			img3 = element("img");
  			t7 = space();
  			div11 = element("div");
  			div10 = element("div");
  			a4 = element("a");
  			img4 = element("img");
  			t8 = space();
  			div13 = element("div");
  			div12 = element("div");
  			a5 = element("a");
  			img5 = element("img");
  			t9 = space();
  			div15 = element("div");
  			div14 = element("div");
  			a6 = element("a");
  			img6 = element("img");
  			t10 = space();
  			div17 = element("div");
  			div16 = element("div");
  			a7 = element("a");
  			img7 = element("img");
  			add_location(h2, file$7, 5, 6, 132);
  			add_location(p, file$7, 6, 6, 155);
  			attr_dev(div0, "class", "section-title");
  			add_location(div0, file$7, 4, 4, 98);
  			attr_dev(div1, "class", "container");
  			add_location(div1, file$7, 3, 2, 70);
  			if (!src_url_equal(img0.src, img0_src_value = "static/assets/img/gallery/gallery-1.jpg")) attr_dev(img0, "src", img0_src_value);
  			attr_dev(img0, "alt", "");
  			attr_dev(img0, "class", "img-fluid svelte-lus4w2");
  			add_location(img0, file$7, 20, 12, 705);
  			attr_dev(a0, "href", "static/assets/img/gallery/gallery-1.jpg");
  			attr_dev(a0, "class", "galelry-lightbox");
  			add_location(a0, file$7, 19, 10, 617);
  			attr_dev(div2, "class", "gallery-item svelte-lus4w2");
  			add_location(div2, file$7, 18, 8, 580);
  			attr_dev(div3, "class", "col-lg-3 col-md-4");
  			add_location(div3, file$7, 17, 6, 540);
  			if (!src_url_equal(img1.src, img1_src_value = "static/assets/img/gallery/gallery-2.jpg")) attr_dev(img1, "src", img1_src_value);
  			attr_dev(img1, "alt", "");
  			attr_dev(img1, "class", "img-fluid svelte-lus4w2");
  			add_location(img1, file$7, 32, 12, 1053);
  			attr_dev(a1, "href", "static/assets/img/gallery/gallery-2.jpg");
  			attr_dev(a1, "class", "galelry-lightbox");
  			add_location(a1, file$7, 31, 10, 965);
  			attr_dev(div4, "class", "gallery-item svelte-lus4w2");
  			add_location(div4, file$7, 30, 8, 928);
  			attr_dev(div5, "class", "col-lg-3 col-md-4");
  			add_location(div5, file$7, 29, 6, 888);
  			if (!src_url_equal(img2.src, img2_src_value = "static/assets/img/gallery/gallery-3.jpg")) attr_dev(img2, "src", img2_src_value);
  			attr_dev(img2, "alt", "");
  			attr_dev(img2, "class", "img-fluid svelte-lus4w2");
  			add_location(img2, file$7, 44, 12, 1401);
  			attr_dev(a2, "href", "static/assets/img/gallery/gallery-3.jpg");
  			attr_dev(a2, "class", "galelry-lightbox");
  			add_location(a2, file$7, 43, 10, 1313);
  			attr_dev(div6, "class", "gallery-item svelte-lus4w2");
  			add_location(div6, file$7, 42, 8, 1276);
  			attr_dev(div7, "class", "col-lg-3 col-md-4");
  			add_location(div7, file$7, 41, 6, 1236);
  			if (!src_url_equal(img3.src, img3_src_value = "static/assets/img/gallery/gallery-4.jpg")) attr_dev(img3, "src", img3_src_value);
  			attr_dev(img3, "alt", "");
  			attr_dev(img3, "class", "img-fluid svelte-lus4w2");
  			add_location(img3, file$7, 56, 12, 1749);
  			attr_dev(a3, "href", "static/assets/img/gallery/gallery-4.jpg");
  			attr_dev(a3, "class", "galelry-lightbox");
  			add_location(a3, file$7, 55, 10, 1661);
  			attr_dev(div8, "class", "gallery-item svelte-lus4w2");
  			add_location(div8, file$7, 54, 8, 1624);
  			attr_dev(div9, "class", "col-lg-3 col-md-4");
  			add_location(div9, file$7, 53, 6, 1584);
  			if (!src_url_equal(img4.src, img4_src_value = "static/assets/img/gallery/gallery-5.jpg")) attr_dev(img4, "src", img4_src_value);
  			attr_dev(img4, "alt", "");
  			attr_dev(img4, "class", "img-fluid svelte-lus4w2");
  			add_location(img4, file$7, 68, 12, 2097);
  			attr_dev(a4, "href", "static/assets/img/gallery/gallery-5.jpg");
  			attr_dev(a4, "class", "galelry-lightbox");
  			add_location(a4, file$7, 67, 10, 2009);
  			attr_dev(div10, "class", "gallery-item svelte-lus4w2");
  			add_location(div10, file$7, 66, 8, 1972);
  			attr_dev(div11, "class", "col-lg-3 col-md-4");
  			add_location(div11, file$7, 65, 6, 1932);
  			if (!src_url_equal(img5.src, img5_src_value = "static/assets/img/gallery/gallery-6.jpg")) attr_dev(img5, "src", img5_src_value);
  			attr_dev(img5, "alt", "");
  			attr_dev(img5, "class", "img-fluid svelte-lus4w2");
  			add_location(img5, file$7, 80, 12, 2445);
  			attr_dev(a5, "href", "static/assets/img/gallery/gallery-6.jpg");
  			attr_dev(a5, "class", "galelry-lightbox");
  			add_location(a5, file$7, 79, 10, 2357);
  			attr_dev(div12, "class", "gallery-item svelte-lus4w2");
  			add_location(div12, file$7, 78, 8, 2320);
  			attr_dev(div13, "class", "col-lg-3 col-md-4");
  			add_location(div13, file$7, 77, 6, 2280);
  			if (!src_url_equal(img6.src, img6_src_value = "static/assets/img/gallery/gallery-7.jpg")) attr_dev(img6, "src", img6_src_value);
  			attr_dev(img6, "alt", "");
  			attr_dev(img6, "class", "img-fluid svelte-lus4w2");
  			add_location(img6, file$7, 92, 12, 2793);
  			attr_dev(a6, "href", "static/assets/img/gallery/gallery-7.jpg");
  			attr_dev(a6, "class", "galelry-lightbox");
  			add_location(a6, file$7, 91, 10, 2705);
  			attr_dev(div14, "class", "gallery-item svelte-lus4w2");
  			add_location(div14, file$7, 90, 8, 2668);
  			attr_dev(div15, "class", "col-lg-3 col-md-4");
  			add_location(div15, file$7, 89, 6, 2628);
  			if (!src_url_equal(img7.src, img7_src_value = "static/assets/img/gallery/gallery-8.jpg")) attr_dev(img7, "src", img7_src_value);
  			attr_dev(img7, "alt", "");
  			attr_dev(img7, "class", "img-fluid svelte-lus4w2");
  			add_location(img7, file$7, 104, 12, 3141);
  			attr_dev(a7, "href", "static/assets/img/gallery/gallery-8.jpg");
  			attr_dev(a7, "class", "galelry-lightbox");
  			add_location(a7, file$7, 103, 10, 3053);
  			attr_dev(div16, "class", "gallery-item svelte-lus4w2");
  			add_location(div16, file$7, 102, 8, 3016);
  			attr_dev(div17, "class", "col-lg-3 col-md-4");
  			add_location(div17, file$7, 101, 6, 2976);
  			attr_dev(div18, "class", "row g-0");
  			add_location(div18, file$7, 16, 4, 512);
  			attr_dev(div19, "class", "container-fluid");
  			add_location(div19, file$7, 15, 2, 478);
  			attr_dev(section, "id", "gallery");
  			attr_dev(section, "class", "gallery svelte-lus4w2");
  			add_location(section, file$7, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div1);
  			append_dev(div1, div0);
  			append_dev(div0, h2);
  			append_dev(div0, t1);
  			append_dev(div0, p);
  			append_dev(section, t3);
  			append_dev(section, div19);
  			append_dev(div19, div18);
  			append_dev(div18, div3);
  			append_dev(div3, div2);
  			append_dev(div2, a0);
  			append_dev(a0, img0);
  			append_dev(div18, t4);
  			append_dev(div18, div5);
  			append_dev(div5, div4);
  			append_dev(div4, a1);
  			append_dev(a1, img1);
  			append_dev(div18, t5);
  			append_dev(div18, div7);
  			append_dev(div7, div6);
  			append_dev(div6, a2);
  			append_dev(a2, img2);
  			append_dev(div18, t6);
  			append_dev(div18, div9);
  			append_dev(div9, div8);
  			append_dev(div8, a3);
  			append_dev(a3, img3);
  			append_dev(div18, t7);
  			append_dev(div18, div11);
  			append_dev(div11, div10);
  			append_dev(div10, a4);
  			append_dev(a4, img4);
  			append_dev(div18, t8);
  			append_dev(div18, div13);
  			append_dev(div13, div12);
  			append_dev(div12, a5);
  			append_dev(a5, img5);
  			append_dev(div18, t9);
  			append_dev(div18, div15);
  			append_dev(div15, div14);
  			append_dev(div14, a6);
  			append_dev(a6, img6);
  			append_dev(div18, t10);
  			append_dev(div18, div17);
  			append_dev(div17, div16);
  			append_dev(div16, a7);
  			append_dev(a7, img7);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$8.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$8($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Gallery', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gallery> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class Gallery extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Gallery",
  			options,
  			id: create_fragment$8.name
  		});
  	}
  }

  /* src/components/MessageForm.svelte generated by Svelte v3.47.0 */

  const file$6 = "src/components/MessageForm.svelte";

  function create_fragment$7(ctx) {
  	let form;
  	let div2;
  	let div0;
  	let input0;
  	let t0;
  	let div1;
  	let input1;
  	let t1;
  	let div3;
  	let input2;
  	let t2;
  	let div4;
  	let textarea;
  	let t3;
  	let div8;
  	let div5;
  	let t5;
  	let div6;
  	let t6;
  	let div7;
  	let t8;
  	let div9;
  	let button;

  	const block = {
  		c: function create() {
  			form = element("form");
  			div2 = element("div");
  			div0 = element("div");
  			input0 = element("input");
  			t0 = space();
  			div1 = element("div");
  			input1 = element("input");
  			t1 = space();
  			div3 = element("div");
  			input2 = element("input");
  			t2 = space();
  			div4 = element("div");
  			textarea = element("textarea");
  			t3 = space();
  			div8 = element("div");
  			div5 = element("div");
  			div5.textContent = "Loading";
  			t5 = space();
  			div6 = element("div");
  			t6 = space();
  			div7 = element("div");
  			div7.textContent = "Your message has been sent. Thank you!";
  			t8 = space();
  			div9 = element("div");
  			button = element("button");
  			button.textContent = "Send Message";
  			attr_dev(input0, "type", "text");
  			attr_dev(input0, "name", "name");
  			attr_dev(input0, "class", "form-control svelte-18d4vph");
  			attr_dev(input0, "id", "name");
  			attr_dev(input0, "placeholder", "Your Name");
  			input0.required = true;
  			add_location(input0, file$6, 5, 6, 162);
  			attr_dev(div0, "class", "col-md-6 form-group svelte-18d4vph");
  			add_location(div0, file$6, 4, 4, 122);
  			attr_dev(input1, "type", "email");
  			attr_dev(input1, "class", "form-control svelte-18d4vph");
  			attr_dev(input1, "name", "email");
  			attr_dev(input1, "id", "email");
  			attr_dev(input1, "placeholder", "Your Email");
  			input1.required = true;
  			add_location(input1, file$6, 15, 6, 382);
  			attr_dev(div1, "class", "col-md-6 form-group mt-3 mt-md-0 svelte-18d4vph");
  			add_location(div1, file$6, 14, 4, 329);
  			attr_dev(div2, "class", "row");
  			add_location(div2, file$6, 3, 2, 100);
  			attr_dev(input2, "type", "text");
  			attr_dev(input2, "class", "form-control svelte-18d4vph");
  			attr_dev(input2, "name", "subject");
  			attr_dev(input2, "id", "subject");
  			attr_dev(input2, "placeholder", "Subject");
  			input2.required = true;
  			add_location(input2, file$6, 26, 4, 594);
  			attr_dev(div3, "class", "form-group mt-3 svelte-18d4vph");
  			add_location(div3, file$6, 25, 2, 560);
  			attr_dev(textarea, "class", "form-control svelte-18d4vph");
  			attr_dev(textarea, "name", "message");
  			attr_dev(textarea, "rows", "5");
  			attr_dev(textarea, "placeholder", "Message");
  			textarea.required = true;
  			add_location(textarea, file$6, 36, 4, 781);
  			attr_dev(div4, "class", "form-group mt-3 svelte-18d4vph");
  			add_location(div4, file$6, 35, 2, 747);
  			attr_dev(div5, "class", "loading svelte-18d4vph");
  			add_location(div5, file$6, 45, 4, 938);
  			attr_dev(div6, "class", "error-message svelte-18d4vph");
  			add_location(div6, file$6, 46, 4, 977);
  			attr_dev(div7, "class", "sent-message svelte-18d4vph");
  			add_location(div7, file$6, 47, 4, 1011);
  			attr_dev(div8, "class", "my-3");
  			add_location(div8, file$6, 44, 2, 915);
  			attr_dev(button, "type", "submit");
  			attr_dev(button, "class", "svelte-18d4vph");
  			add_location(button, file$6, 50, 4, 1123);
  			attr_dev(div9, "class", "text-center");
  			add_location(div9, file$6, 49, 2, 1093);
  			attr_dev(form, "action", "forms/contact.php");
  			attr_dev(form, "method", "post");
  			attr_dev(form, "class", "message-form svelte-18d4vph");
  			add_location(form, file$6, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, form, anchor);
  			append_dev(form, div2);
  			append_dev(div2, div0);
  			append_dev(div0, input0);
  			append_dev(div2, t0);
  			append_dev(div2, div1);
  			append_dev(div1, input1);
  			append_dev(form, t1);
  			append_dev(form, div3);
  			append_dev(div3, input2);
  			append_dev(form, t2);
  			append_dev(form, div4);
  			append_dev(div4, textarea);
  			append_dev(form, t3);
  			append_dev(form, div8);
  			append_dev(div8, div5);
  			append_dev(div8, t5);
  			append_dev(div8, div6);
  			append_dev(div8, t6);
  			append_dev(div8, div7);
  			append_dev(form, t8);
  			append_dev(form, div9);
  			append_dev(div9, button);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(form);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$7.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$7($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('MessageForm', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MessageForm> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class MessageForm extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "MessageForm",
  			options,
  			id: create_fragment$7.name
  		});
  	}
  }

  /* src/components/Contact.svelte generated by Svelte v3.47.0 */
  const file$5 = "src/components/Contact.svelte";

  function create_fragment$6(ctx) {
  	let section;
  	let div1;
  	let div0;
  	let h2;
  	let t1;
  	let p0;
  	let t3;
  	let div2;
  	let iframe;
  	let iframe_src_value;
  	let t4;
  	let div10;
  	let div9;
  	let div7;
  	let div6;
  	let div3;
  	let i0;
  	let t5;
  	let h40;
  	let t7;
  	let p1;
  	let t9;
  	let div4;
  	let i1;
  	let t10;
  	let h41;
  	let t12;
  	let p2;
  	let t14;
  	let div5;
  	let i2;
  	let t15;
  	let h42;
  	let t17;
  	let p3;
  	let t19;
  	let div8;
  	let messageform;
  	let current;
  	messageform = new MessageForm({ $$inline: true });

  	const block = {
  		c: function create() {
  			section = element("section");
  			div1 = element("div");
  			div0 = element("div");
  			h2 = element("h2");
  			h2.textContent = "Contact";
  			t1 = space();
  			p0 = element("p");
  			p0.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n        aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n        quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat\n        sit in iste officiis commodi quidem hic quas.";
  			t3 = space();
  			div2 = element("div");
  			iframe = element("iframe");
  			t4 = space();
  			div10 = element("div");
  			div9 = element("div");
  			div7 = element("div");
  			div6 = element("div");
  			div3 = element("div");
  			i0 = element("i");
  			t5 = space();
  			h40 = element("h4");
  			h40.textContent = "Location:";
  			t7 = space();
  			p1 = element("p");
  			p1.textContent = "A108 Adam Street, New York, NY 535022";
  			t9 = space();
  			div4 = element("div");
  			i1 = element("i");
  			t10 = space();
  			h41 = element("h4");
  			h41.textContent = "Email:";
  			t12 = space();
  			p2 = element("p");
  			p2.textContent = "info@example.com";
  			t14 = space();
  			div5 = element("div");
  			i2 = element("i");
  			t15 = space();
  			h42 = element("h4");
  			h42.textContent = "Call:";
  			t17 = space();
  			p3 = element("p");
  			p3.textContent = "+1 5589 55488 55s";
  			t19 = space();
  			div8 = element("div");
  			create_component(messageform.$$.fragment);
  			add_location(h2, file$5, 6, 6, 180);
  			attr_dev(p0, "class", "svelte-1x4v2rr");
  			add_location(p0, file$5, 7, 6, 203);
  			attr_dev(div0, "class", "section-title");
  			add_location(div0, file$5, 5, 4, 146);
  			attr_dev(div1, "class", "container");
  			add_location(div1, file$5, 4, 2, 118);
  			set_style(iframe, "border", "0");
  			set_style(iframe, "width", "100%");
  			set_style(iframe, "height", "350px");
  			if (!src_url_equal(iframe.src, iframe_src_value = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12097.433213460943!2d-74.0062269!3d40.7101282!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xb89d1fe6bc499443!2sDowntown+Conference+Center!5e0!3m2!1smk!2sbg!4v1539943755621")) attr_dev(iframe, "src", iframe_src_value);
  			attr_dev(iframe, "frameborder", "0");
  			iframe.allowFullscreen = true;
  			add_location(iframe, file$5, 17, 4, 536);
  			add_location(div2, file$5, 16, 2, 526);
  			attr_dev(i0, "class", "bi bi-geo-alt svelte-1x4v2rr");
  			add_location(i0, file$5, 30, 12, 1043);
  			attr_dev(h40, "class", "svelte-1x4v2rr");
  			add_location(h40, file$5, 31, 12, 1083);
  			attr_dev(p1, "class", "svelte-1x4v2rr");
  			add_location(p1, file$5, 32, 12, 1114);
  			attr_dev(div3, "class", "address");
  			add_location(div3, file$5, 29, 10, 1009);
  			attr_dev(i1, "class", "bi bi-envelope svelte-1x4v2rr");
  			add_location(i1, file$5, 36, 12, 1219);
  			attr_dev(h41, "class", "svelte-1x4v2rr");
  			add_location(h41, file$5, 37, 12, 1260);
  			attr_dev(p2, "class", "svelte-1x4v2rr");
  			add_location(p2, file$5, 38, 12, 1288);
  			attr_dev(div4, "class", "email svelte-1x4v2rr");
  			add_location(div4, file$5, 35, 10, 1187);
  			attr_dev(i2, "class", "bi bi-phone svelte-1x4v2rr");
  			add_location(i2, file$5, 42, 12, 1372);
  			attr_dev(h42, "class", "svelte-1x4v2rr");
  			add_location(h42, file$5, 43, 12, 1410);
  			attr_dev(p3, "class", "svelte-1x4v2rr");
  			add_location(p3, file$5, 44, 12, 1437);
  			attr_dev(div5, "class", "phone svelte-1x4v2rr");
  			add_location(div5, file$5, 41, 10, 1340);
  			attr_dev(div6, "class", "info svelte-1x4v2rr");
  			add_location(div6, file$5, 28, 8, 980);
  			attr_dev(div7, "class", "col-lg-4");
  			add_location(div7, file$5, 27, 6, 949);
  			attr_dev(div8, "class", "col-lg-8 mt-5 mt-lg-0");
  			add_location(div8, file$5, 49, 6, 1514);
  			attr_dev(div9, "class", "row mt-5");
  			add_location(div9, file$5, 26, 4, 920);
  			attr_dev(div10, "class", "container");
  			add_location(div10, file$5, 25, 2, 892);
  			attr_dev(section, "id", "contact");
  			attr_dev(section, "class", "contact svelte-1x4v2rr");
  			add_location(section, file$5, 3, 0, 77);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, section, anchor);
  			append_dev(section, div1);
  			append_dev(div1, div0);
  			append_dev(div0, h2);
  			append_dev(div0, t1);
  			append_dev(div0, p0);
  			append_dev(section, t3);
  			append_dev(section, div2);
  			append_dev(div2, iframe);
  			append_dev(section, t4);
  			append_dev(section, div10);
  			append_dev(div10, div9);
  			append_dev(div9, div7);
  			append_dev(div7, div6);
  			append_dev(div6, div3);
  			append_dev(div3, i0);
  			append_dev(div3, t5);
  			append_dev(div3, h40);
  			append_dev(div3, t7);
  			append_dev(div3, p1);
  			append_dev(div6, t9);
  			append_dev(div6, div4);
  			append_dev(div4, i1);
  			append_dev(div4, t10);
  			append_dev(div4, h41);
  			append_dev(div4, t12);
  			append_dev(div4, p2);
  			append_dev(div6, t14);
  			append_dev(div6, div5);
  			append_dev(div5, i2);
  			append_dev(div5, t15);
  			append_dev(div5, h42);
  			append_dev(div5, t17);
  			append_dev(div5, p3);
  			append_dev(div9, t19);
  			append_dev(div9, div8);
  			mount_component(messageform, div8, null);
  			current = true;
  		},
  		p: noop,
  		i: function intro(local) {
  			if (current) return;
  			transition_in(messageform.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(messageform.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(section);
  			destroy_component(messageform);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$6.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$6($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Contact', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({ MessageForm });
  	return [];
  }

  class Contact extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Contact",
  			options,
  			id: create_fragment$6.name
  		});
  	}
  }

  /* src/pages/Home.svelte generated by Svelte v3.47.0 */
  const file$4 = "src/pages/Home.svelte";

  function create_fragment$5(ctx) {
  	let hero;
  	let t0;
  	let main;
  	let whyus;
  	let t1;
  	let aboutus;
  	let t2;
  	let counts;
  	let t3;
  	let services;
  	let t4;
  	let departments;
  	let t5;
  	let doctorslist;
  	let t6;
  	let faq;
  	let t7;
  	let testimonials;
  	let t8;
  	let gallery;
  	let t9;
  	let contact;
  	let current;
  	hero = new Hero({ $$inline: true });
  	whyus = new WhyUs({ $$inline: true });
  	aboutus = new AboutUs({ $$inline: true });
  	counts = new Counts({ $$inline: true });
  	services = new Services({ $$inline: true });
  	departments = new Departments({ $$inline: true });
  	doctorslist = new DoctorList({ $$inline: true });
  	faq = new Faq({ $$inline: true });
  	testimonials = new TestimonialList({ $$inline: true });
  	gallery = new Gallery({ $$inline: true });
  	contact = new Contact({ $$inline: true });

  	const block = {
  		c: function create() {
  			create_component(hero.$$.fragment);
  			t0 = space();
  			main = element("main");
  			create_component(whyus.$$.fragment);
  			t1 = space();
  			create_component(aboutus.$$.fragment);
  			t2 = space();
  			create_component(counts.$$.fragment);
  			t3 = space();
  			create_component(services.$$.fragment);
  			t4 = space();
  			create_component(departments.$$.fragment);
  			t5 = space();
  			create_component(doctorslist.$$.fragment);
  			t6 = space();
  			create_component(faq.$$.fragment);
  			t7 = space();
  			create_component(testimonials.$$.fragment);
  			t8 = space();
  			create_component(gallery.$$.fragment);
  			t9 = space();
  			create_component(contact.$$.fragment);
  			attr_dev(main, "id", "main");
  			add_location(main, file$4, 16, 0, 665);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			mount_component(hero, target, anchor);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, main, anchor);
  			mount_component(whyus, main, null);
  			append_dev(main, t1);
  			mount_component(aboutus, main, null);
  			append_dev(main, t2);
  			mount_component(counts, main, null);
  			append_dev(main, t3);
  			mount_component(services, main, null);
  			append_dev(main, t4);
  			mount_component(departments, main, null);
  			append_dev(main, t5);
  			mount_component(doctorslist, main, null);
  			append_dev(main, t6);
  			mount_component(faq, main, null);
  			append_dev(main, t7);
  			mount_component(testimonials, main, null);
  			append_dev(main, t8);
  			mount_component(gallery, main, null);
  			append_dev(main, t9);
  			mount_component(contact, main, null);
  			current = true;
  		},
  		p: noop,
  		i: function intro(local) {
  			if (current) return;
  			transition_in(hero.$$.fragment, local);
  			transition_in(whyus.$$.fragment, local);
  			transition_in(aboutus.$$.fragment, local);
  			transition_in(counts.$$.fragment, local);
  			transition_in(services.$$.fragment, local);
  			transition_in(departments.$$.fragment, local);
  			transition_in(doctorslist.$$.fragment, local);
  			transition_in(faq.$$.fragment, local);
  			transition_in(testimonials.$$.fragment, local);
  			transition_in(gallery.$$.fragment, local);
  			transition_in(contact.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(hero.$$.fragment, local);
  			transition_out(whyus.$$.fragment, local);
  			transition_out(aboutus.$$.fragment, local);
  			transition_out(counts.$$.fragment, local);
  			transition_out(services.$$.fragment, local);
  			transition_out(departments.$$.fragment, local);
  			transition_out(doctorslist.$$.fragment, local);
  			transition_out(faq.$$.fragment, local);
  			transition_out(testimonials.$$.fragment, local);
  			transition_out(gallery.$$.fragment, local);
  			transition_out(contact.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			destroy_component(hero, detaching);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(main);
  			destroy_component(whyus);
  			destroy_component(aboutus);
  			destroy_component(counts);
  			destroy_component(services);
  			destroy_component(departments);
  			destroy_component(doctorslist);
  			destroy_component(faq);
  			destroy_component(testimonials);
  			destroy_component(gallery);
  			destroy_component(contact);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$5.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$5($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Home', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({
  		Hero,
  		WhyUs,
  		AboutUs,
  		Counts,
  		Services,
  		Departments,
  		DoctorsList: DoctorList,
  		Faq,
  		Testimonials: TestimonialList,
  		Gallery,
  		Contact
  	});

  	return [];
  }

  class Home extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Home",
  			options,
  			id: create_fragment$5.name
  		});
  	}
  }

  /* src/components/TopBar.svelte generated by Svelte v3.47.0 */

  const file$3 = "src/components/TopBar.svelte";

  function create_fragment$4(ctx) {
  	let div3;
  	let div2;
  	let div0;
  	let i0;
  	let t0;
  	let a0;
  	let t2;
  	let i1;
  	let t3;
  	let t4;
  	let div1;
  	let a1;
  	let i2;
  	let t5;
  	let a2;
  	let i3;
  	let t6;
  	let a3;
  	let i4;
  	let t7;
  	let a4;
  	let i5;

  	const block = {
  		c: function create() {
  			div3 = element("div");
  			div2 = element("div");
  			div0 = element("div");
  			i0 = element("i");
  			t0 = space();
  			a0 = element("a");
  			a0.textContent = "contact@example.com";
  			t2 = space();
  			i1 = element("i");
  			t3 = text(" +1 5589 55488 55");
  			t4 = space();
  			div1 = element("div");
  			a1 = element("a");
  			i2 = element("i");
  			t5 = space();
  			a2 = element("a");
  			i3 = element("i");
  			t6 = space();
  			a3 = element("a");
  			i4 = element("i");
  			t7 = space();
  			a4 = element("a");
  			i5 = element("i");
  			attr_dev(i0, "class", "bi bi-envelope svelte-7nmios");
  			add_location(i0, file$3, 5, 12, 223);
  			attr_dev(a0, "href", "mailto:contact@example.com");
  			attr_dev(a0, "class", "svelte-7nmios");
  			add_location(a0, file$3, 6, 12, 264);
  			attr_dev(i1, "class", "bi bi-phone svelte-7nmios");
  			add_location(i1, file$3, 7, 12, 337);
  			attr_dev(div0, "class", "contact-info d-flex align-items-center");
  			add_location(div0, file$3, 4, 8, 158);
  			attr_dev(i2, "class", "bi bi-twitter svelte-7nmios");
  			add_location(i2, file$3, 10, 40, 506);
  			attr_dev(a1, "href", "#");
  			attr_dev(a1, "class", "twitter svelte-7nmios");
  			add_location(a1, file$3, 10, 12, 478);
  			attr_dev(i3, "class", "bi bi-facebook svelte-7nmios");
  			add_location(i3, file$3, 11, 41, 579);
  			attr_dev(a2, "href", "#");
  			attr_dev(a2, "class", "facebook svelte-7nmios");
  			add_location(a2, file$3, 11, 12, 550);
  			attr_dev(i4, "class", "bi bi-instagram svelte-7nmios");
  			add_location(i4, file$3, 12, 42, 654);
  			attr_dev(a3, "href", "#");
  			attr_dev(a3, "class", "instagram svelte-7nmios");
  			add_location(a3, file$3, 12, 12, 624);
  			attr_dev(i5, "class", "bi bi-linkedin svelte-7nmios");
  			add_location(i5, file$3, 13, 41, 729);
  			attr_dev(a4, "href", "#");
  			attr_dev(a4, "class", "linkedin svelte-7nmios");
  			add_location(a4, file$3, 13, 12, 700);
  			attr_dev(div1, "class", "d-none d-lg-flex social-links align-items-center");
  			add_location(div1, file$3, 9, 8, 403);
  			attr_dev(div2, "class", "container d-flex justify-content-between");
  			add_location(div2, file$3, 3, 4, 95);
  			attr_dev(div3, "id", "topbar");
  			attr_dev(div3, "class", "d-flex align-items-center fixed-top svelte-7nmios");
  			add_location(div3, file$3, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div3, anchor);
  			append_dev(div3, div2);
  			append_dev(div2, div0);
  			append_dev(div0, i0);
  			append_dev(div0, t0);
  			append_dev(div0, a0);
  			append_dev(div0, t2);
  			append_dev(div0, i1);
  			append_dev(div0, t3);
  			append_dev(div2, t4);
  			append_dev(div2, div1);
  			append_dev(div1, a1);
  			append_dev(a1, i2);
  			append_dev(div1, t5);
  			append_dev(div1, a2);
  			append_dev(a2, i3);
  			append_dev(div1, t6);
  			append_dev(div1, a3);
  			append_dev(a3, i4);
  			append_dev(div1, t7);
  			append_dev(div1, a4);
  			append_dev(a4, i5);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div3);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$4.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$4($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('TopBar', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopBar> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class TopBar extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "TopBar",
  			options,
  			id: create_fragment$4.name
  		});
  	}
  }

  /* src/components/Footer.svelte generated by Svelte v3.47.0 */

  const file$2 = "src/components/Footer.svelte";

  function create_fragment$3(ctx) {
  	let footer;
  	let div6;
  	let div5;
  	let div4;
  	let div0;
  	let h3;
  	let t1;
  	let p0;
  	let t2;
  	let br0;
  	let t3;
  	let br1;
  	let t4;
  	let br2;
  	let br3;
  	let t5;
  	let strong0;
  	let t7;
  	let br4;
  	let t8;
  	let strong1;
  	let t10;
  	let br5;
  	let t11;
  	let div1;
  	let h40;
  	let t13;
  	let ul0;
  	let li0;
  	let i0;
  	let t14;
  	let a0;
  	let t16;
  	let li1;
  	let i1;
  	let t17;
  	let a1;
  	let t19;
  	let li2;
  	let i2;
  	let t20;
  	let a2;
  	let t22;
  	let li3;
  	let i3;
  	let t23;
  	let a3;
  	let t25;
  	let li4;
  	let i4;
  	let t26;
  	let a4;
  	let t28;
  	let div2;
  	let h41;
  	let t30;
  	let ul1;
  	let li5;
  	let i5;
  	let t31;
  	let a5;
  	let t33;
  	let li6;
  	let i6;
  	let t34;
  	let a6;
  	let t36;
  	let li7;
  	let i7;
  	let t37;
  	let a7;
  	let t39;
  	let li8;
  	let i8;
  	let t40;
  	let a8;
  	let t42;
  	let li9;
  	let i9;
  	let t43;
  	let a9;
  	let t45;
  	let div3;
  	let h42;
  	let t47;
  	let p1;
  	let t49;
  	let form;
  	let input0;
  	let input1;
  	let t50;
  	let div11;
  	let div9;
  	let div7;
  	let t51;
  	let strong2;
  	let span;
  	let t53;
  	let t54;
  	let div8;
  	let t55;
  	let a10;
  	let t57;
  	let div10;
  	let a11;
  	let i10;
  	let t58;
  	let a12;
  	let i11;
  	let t59;
  	let a13;
  	let i12;
  	let t60;
  	let a14;
  	let i13;
  	let t61;
  	let a15;
  	let i14;

  	const block = {
  		c: function create() {
  			footer = element("footer");
  			div6 = element("div");
  			div5 = element("div");
  			div4 = element("div");
  			div0 = element("div");
  			h3 = element("h3");
  			h3.textContent = "Medilab";
  			t1 = space();
  			p0 = element("p");
  			t2 = text("A108 Adam Street ");
  			br0 = element("br");
  			t3 = text("\n            New York, NY 535022");
  			br1 = element("br");
  			t4 = text("\n            United States ");
  			br2 = element("br");
  			br3 = element("br");
  			t5 = space();
  			strong0 = element("strong");
  			strong0.textContent = "Phone:";
  			t7 = text(" +1 5589 55488 55");
  			br4 = element("br");
  			t8 = space();
  			strong1 = element("strong");
  			strong1.textContent = "Email:";
  			t10 = text(" info@example.com");
  			br5 = element("br");
  			t11 = space();
  			div1 = element("div");
  			h40 = element("h4");
  			h40.textContent = "Useful Links";
  			t13 = space();
  			ul0 = element("ul");
  			li0 = element("li");
  			i0 = element("i");
  			t14 = space();
  			a0 = element("a");
  			a0.textContent = "Home";
  			t16 = space();
  			li1 = element("li");
  			i1 = element("i");
  			t17 = space();
  			a1 = element("a");
  			a1.textContent = "About us";
  			t19 = space();
  			li2 = element("li");
  			i2 = element("i");
  			t20 = space();
  			a2 = element("a");
  			a2.textContent = "Services";
  			t22 = space();
  			li3 = element("li");
  			i3 = element("i");
  			t23 = space();
  			a3 = element("a");
  			a3.textContent = "Terms of service";
  			t25 = space();
  			li4 = element("li");
  			i4 = element("i");
  			t26 = space();
  			a4 = element("a");
  			a4.textContent = "Privacy policy";
  			t28 = space();
  			div2 = element("div");
  			h41 = element("h4");
  			h41.textContent = "Our Services";
  			t30 = space();
  			ul1 = element("ul");
  			li5 = element("li");
  			i5 = element("i");
  			t31 = space();
  			a5 = element("a");
  			a5.textContent = "Web Design";
  			t33 = space();
  			li6 = element("li");
  			i6 = element("i");
  			t34 = space();
  			a6 = element("a");
  			a6.textContent = "Web Development";
  			t36 = space();
  			li7 = element("li");
  			i7 = element("i");
  			t37 = space();
  			a7 = element("a");
  			a7.textContent = "Product Management";
  			t39 = space();
  			li8 = element("li");
  			i8 = element("i");
  			t40 = space();
  			a8 = element("a");
  			a8.textContent = "Marketing";
  			t42 = space();
  			li9 = element("li");
  			i9 = element("i");
  			t43 = space();
  			a9 = element("a");
  			a9.textContent = "Graphic Design";
  			t45 = space();
  			div3 = element("div");
  			h42 = element("h4");
  			h42.textContent = "Join Our Newsletter";
  			t47 = space();
  			p1 = element("p");
  			p1.textContent = "Tamen quem nulla quae legam multos aute sint culpa legam noster\n            magna";
  			t49 = space();
  			form = element("form");
  			input0 = element("input");
  			input1 = element("input");
  			t50 = space();
  			div11 = element("div");
  			div9 = element("div");
  			div7 = element("div");
  			t51 = text("© Copyright ");
  			strong2 = element("strong");
  			span = element("span");
  			span.textContent = "Medilab";
  			t53 = text(". All Rights\n        Reserved");
  			t54 = space();
  			div8 = element("div");
  			t55 = text("Designed by\n        ");
  			a10 = element("a");
  			a10.textContent = "BootstrapMade";
  			t57 = space();
  			div10 = element("div");
  			a11 = element("a");
  			i10 = element("i");
  			t58 = space();
  			a12 = element("a");
  			i11 = element("i");
  			t59 = space();
  			a13 = element("a");
  			i12 = element("i");
  			t60 = space();
  			a14 = element("a");
  			i13 = element("i");
  			t61 = space();
  			a15 = element("a");
  			i14 = element("i");
  			add_location(h3, file$2, 7, 10, 194);
  			add_location(br0, file$2, 9, 29, 254);
  			add_location(br1, file$2, 10, 31, 292);
  			add_location(br2, file$2, 11, 26, 325);
  			add_location(br3, file$2, 11, 32, 331);
  			add_location(strong0, file$2, 12, 12, 350);
  			add_location(br4, file$2, 12, 52, 390);
  			add_location(strong1, file$2, 13, 12, 409);
  			add_location(br5, file$2, 13, 52, 449);
  			attr_dev(p0, "class", "svelte-1lmd8oz");
  			add_location(p0, file$2, 8, 10, 221);
  			attr_dev(div0, "class", "col-lg-3 col-md-6 footer-contact svelte-1lmd8oz");
  			add_location(div0, file$2, 6, 8, 137);
  			attr_dev(h40, "class", "svelte-1lmd8oz");
  			add_location(h40, file$2, 18, 10, 550);
  			attr_dev(i0, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i0, file$2, 21, 14, 618);
  			attr_dev(a0, "href", "#");
  			attr_dev(a0, "class", "svelte-1lmd8oz");
  			add_location(a0, file$2, 22, 14, 666);
  			attr_dev(li0, "class", "svelte-1lmd8oz");
  			add_location(li0, file$2, 20, 12, 599);
  			attr_dev(i1, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i1, file$2, 25, 14, 736);
  			attr_dev(a1, "href", "#");
  			attr_dev(a1, "class", "svelte-1lmd8oz");
  			add_location(a1, file$2, 26, 14, 784);
  			attr_dev(li1, "class", "svelte-1lmd8oz");
  			add_location(li1, file$2, 24, 12, 717);
  			attr_dev(i2, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i2, file$2, 29, 14, 858);
  			attr_dev(a2, "href", "#");
  			attr_dev(a2, "class", "svelte-1lmd8oz");
  			add_location(a2, file$2, 30, 14, 906);
  			attr_dev(li2, "class", "svelte-1lmd8oz");
  			add_location(li2, file$2, 28, 12, 839);
  			attr_dev(i3, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i3, file$2, 33, 14, 980);
  			attr_dev(a3, "href", "#");
  			attr_dev(a3, "class", "svelte-1lmd8oz");
  			add_location(a3, file$2, 34, 14, 1028);
  			attr_dev(li3, "class", "svelte-1lmd8oz");
  			add_location(li3, file$2, 32, 12, 961);
  			attr_dev(i4, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i4, file$2, 37, 14, 1110);
  			attr_dev(a4, "href", "#");
  			attr_dev(a4, "class", "svelte-1lmd8oz");
  			add_location(a4, file$2, 38, 14, 1158);
  			attr_dev(li4, "class", "svelte-1lmd8oz");
  			add_location(li4, file$2, 36, 12, 1091);
  			attr_dev(ul0, "class", "svelte-1lmd8oz");
  			add_location(ul0, file$2, 19, 10, 582);
  			attr_dev(div1, "class", "col-lg-2 col-md-6 footer-links svelte-1lmd8oz");
  			add_location(div1, file$2, 17, 8, 495);
  			attr_dev(h41, "class", "svelte-1lmd8oz");
  			add_location(h41, file$2, 44, 10, 1302);
  			attr_dev(i5, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i5, file$2, 47, 14, 1370);
  			attr_dev(a5, "href", "#");
  			attr_dev(a5, "class", "svelte-1lmd8oz");
  			add_location(a5, file$2, 48, 14, 1418);
  			attr_dev(li5, "class", "svelte-1lmd8oz");
  			add_location(li5, file$2, 46, 12, 1351);
  			attr_dev(i6, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i6, file$2, 51, 14, 1494);
  			attr_dev(a6, "href", "#");
  			attr_dev(a6, "class", "svelte-1lmd8oz");
  			add_location(a6, file$2, 52, 14, 1542);
  			attr_dev(li6, "class", "svelte-1lmd8oz");
  			add_location(li6, file$2, 50, 12, 1475);
  			attr_dev(i7, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i7, file$2, 55, 14, 1623);
  			attr_dev(a7, "href", "#");
  			attr_dev(a7, "class", "svelte-1lmd8oz");
  			add_location(a7, file$2, 56, 14, 1671);
  			attr_dev(li7, "class", "svelte-1lmd8oz");
  			add_location(li7, file$2, 54, 12, 1604);
  			attr_dev(i8, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i8, file$2, 59, 14, 1755);
  			attr_dev(a8, "href", "#");
  			attr_dev(a8, "class", "svelte-1lmd8oz");
  			add_location(a8, file$2, 60, 14, 1803);
  			attr_dev(li8, "class", "svelte-1lmd8oz");
  			add_location(li8, file$2, 58, 12, 1736);
  			attr_dev(i9, "class", "bx bx-chevron-right svelte-1lmd8oz");
  			add_location(i9, file$2, 63, 14, 1878);
  			attr_dev(a9, "href", "#");
  			attr_dev(a9, "class", "svelte-1lmd8oz");
  			add_location(a9, file$2, 64, 14, 1926);
  			attr_dev(li9, "class", "svelte-1lmd8oz");
  			add_location(li9, file$2, 62, 12, 1859);
  			attr_dev(ul1, "class", "svelte-1lmd8oz");
  			add_location(ul1, file$2, 45, 10, 1334);
  			attr_dev(div2, "class", "col-lg-3 col-md-6 footer-links svelte-1lmd8oz");
  			add_location(div2, file$2, 43, 8, 1247);
  			attr_dev(h42, "class", "svelte-1lmd8oz");
  			add_location(h42, file$2, 70, 10, 2075);
  			attr_dev(p1, "class", "svelte-1lmd8oz");
  			add_location(p1, file$2, 71, 10, 2114);
  			attr_dev(input0, "type", "email");
  			attr_dev(input0, "name", "email");
  			attr_dev(input0, "class", "svelte-1lmd8oz");
  			add_location(input0, file$2, 76, 12, 2280);
  			attr_dev(input1, "type", "submit");
  			input1.value = "Subscribe";
  			attr_dev(input1, "class", "svelte-1lmd8oz");
  			add_location(input1, file$2, 76, 47, 2315);
  			attr_dev(form, "action", "");
  			attr_dev(form, "method", "post");
  			attr_dev(form, "class", "svelte-1lmd8oz");
  			add_location(form, file$2, 75, 10, 2237);
  			attr_dev(div3, "class", "col-lg-4 col-md-6 footer-newsletter svelte-1lmd8oz");
  			add_location(div3, file$2, 69, 8, 2015);
  			attr_dev(div4, "class", "row");
  			add_location(div4, file$2, 5, 6, 111);
  			attr_dev(div5, "class", "container");
  			add_location(div5, file$2, 4, 4, 81);
  			attr_dev(div6, "class", "footer-top svelte-1lmd8oz");
  			add_location(div6, file$2, 3, 2, 52);
  			add_location(span, file$2, 89, 33, 2623);
  			add_location(strong2, file$2, 89, 25, 2615);
  			attr_dev(div7, "class", "copyright");
  			add_location(div7, file$2, 88, 6, 2566);
  			attr_dev(a10, "href", "https://bootstrapmade.com/");
  			attr_dev(a10, "class", "svelte-1lmd8oz");
  			add_location(a10, file$2, 94, 8, 2751);
  			attr_dev(div8, "class", "credits svelte-1lmd8oz");
  			add_location(div8, file$2, 92, 6, 2701);
  			attr_dev(div9, "class", "me-md-auto text-center text-md-start");
  			add_location(div9, file$2, 87, 4, 2509);
  			attr_dev(i10, "class", "bx bxl-twitter svelte-1lmd8oz");
  			add_location(i10, file$2, 98, 34, 2934);
  			attr_dev(a11, "href", "#");
  			attr_dev(a11, "class", "twitter svelte-1lmd8oz");
  			add_location(a11, file$2, 98, 6, 2906);
  			attr_dev(i11, "class", "bx bxl-facebook svelte-1lmd8oz");
  			add_location(i11, file$2, 99, 35, 3002);
  			attr_dev(a12, "href", "#");
  			attr_dev(a12, "class", "facebook svelte-1lmd8oz");
  			add_location(a12, file$2, 99, 6, 2973);
  			attr_dev(i12, "class", "bx bxl-instagram svelte-1lmd8oz");
  			add_location(i12, file$2, 100, 36, 3072);
  			attr_dev(a13, "href", "#");
  			attr_dev(a13, "class", "instagram svelte-1lmd8oz");
  			add_location(a13, file$2, 100, 6, 3042);
  			attr_dev(i13, "class", "bx bxl-skype svelte-1lmd8oz");
  			add_location(i13, file$2, 101, 38, 3145);
  			attr_dev(a14, "href", "#");
  			attr_dev(a14, "class", "google-plus svelte-1lmd8oz");
  			add_location(a14, file$2, 101, 6, 3113);
  			attr_dev(i14, "class", "bx bxl-linkedin svelte-1lmd8oz");
  			add_location(i14, file$2, 102, 35, 3211);
  			attr_dev(a15, "href", "#");
  			attr_dev(a15, "class", "linkedin svelte-1lmd8oz");
  			add_location(a15, file$2, 102, 6, 3182);
  			attr_dev(div10, "class", "social-links text-center text-md-right pt-3 pt-md-0");
  			add_location(div10, file$2, 97, 4, 2834);
  			attr_dev(div11, "class", "container d-md-flex py-4");
  			add_location(div11, file$2, 86, 2, 2466);
  			attr_dev(footer, "id", "footer");
  			attr_dev(footer, "class", "svelte-1lmd8oz");
  			add_location(footer, file$2, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, footer, anchor);
  			append_dev(footer, div6);
  			append_dev(div6, div5);
  			append_dev(div5, div4);
  			append_dev(div4, div0);
  			append_dev(div0, h3);
  			append_dev(div0, t1);
  			append_dev(div0, p0);
  			append_dev(p0, t2);
  			append_dev(p0, br0);
  			append_dev(p0, t3);
  			append_dev(p0, br1);
  			append_dev(p0, t4);
  			append_dev(p0, br2);
  			append_dev(p0, br3);
  			append_dev(p0, t5);
  			append_dev(p0, strong0);
  			append_dev(p0, t7);
  			append_dev(p0, br4);
  			append_dev(p0, t8);
  			append_dev(p0, strong1);
  			append_dev(p0, t10);
  			append_dev(p0, br5);
  			append_dev(div4, t11);
  			append_dev(div4, div1);
  			append_dev(div1, h40);
  			append_dev(div1, t13);
  			append_dev(div1, ul0);
  			append_dev(ul0, li0);
  			append_dev(li0, i0);
  			append_dev(li0, t14);
  			append_dev(li0, a0);
  			append_dev(ul0, t16);
  			append_dev(ul0, li1);
  			append_dev(li1, i1);
  			append_dev(li1, t17);
  			append_dev(li1, a1);
  			append_dev(ul0, t19);
  			append_dev(ul0, li2);
  			append_dev(li2, i2);
  			append_dev(li2, t20);
  			append_dev(li2, a2);
  			append_dev(ul0, t22);
  			append_dev(ul0, li3);
  			append_dev(li3, i3);
  			append_dev(li3, t23);
  			append_dev(li3, a3);
  			append_dev(ul0, t25);
  			append_dev(ul0, li4);
  			append_dev(li4, i4);
  			append_dev(li4, t26);
  			append_dev(li4, a4);
  			append_dev(div4, t28);
  			append_dev(div4, div2);
  			append_dev(div2, h41);
  			append_dev(div2, t30);
  			append_dev(div2, ul1);
  			append_dev(ul1, li5);
  			append_dev(li5, i5);
  			append_dev(li5, t31);
  			append_dev(li5, a5);
  			append_dev(ul1, t33);
  			append_dev(ul1, li6);
  			append_dev(li6, i6);
  			append_dev(li6, t34);
  			append_dev(li6, a6);
  			append_dev(ul1, t36);
  			append_dev(ul1, li7);
  			append_dev(li7, i7);
  			append_dev(li7, t37);
  			append_dev(li7, a7);
  			append_dev(ul1, t39);
  			append_dev(ul1, li8);
  			append_dev(li8, i8);
  			append_dev(li8, t40);
  			append_dev(li8, a8);
  			append_dev(ul1, t42);
  			append_dev(ul1, li9);
  			append_dev(li9, i9);
  			append_dev(li9, t43);
  			append_dev(li9, a9);
  			append_dev(div4, t45);
  			append_dev(div4, div3);
  			append_dev(div3, h42);
  			append_dev(div3, t47);
  			append_dev(div3, p1);
  			append_dev(div3, t49);
  			append_dev(div3, form);
  			append_dev(form, input0);
  			append_dev(form, input1);
  			append_dev(footer, t50);
  			append_dev(footer, div11);
  			append_dev(div11, div9);
  			append_dev(div9, div7);
  			append_dev(div7, t51);
  			append_dev(div7, strong2);
  			append_dev(strong2, span);
  			append_dev(div7, t53);
  			append_dev(div9, t54);
  			append_dev(div9, div8);
  			append_dev(div8, t55);
  			append_dev(div8, a10);
  			append_dev(div11, t57);
  			append_dev(div11, div10);
  			append_dev(div10, a11);
  			append_dev(a11, i10);
  			append_dev(div10, t58);
  			append_dev(div10, a12);
  			append_dev(a12, i11);
  			append_dev(div10, t59);
  			append_dev(div10, a13);
  			append_dev(a13, i12);
  			append_dev(div10, t60);
  			append_dev(div10, a14);
  			append_dev(a14, i13);
  			append_dev(div10, t61);
  			append_dev(div10, a15);
  			append_dev(a15, i14);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(footer);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$3.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$3($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Footer', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class Footer extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Footer",
  			options,
  			id: create_fragment$3.name
  		});
  	}
  }

  /* src/components/Navigation.svelte generated by Svelte v3.47.0 */

  const file$1 = "src/components/Navigation.svelte";

  function create_fragment$2(ctx) {
  	let nav;
  	let ul;
  	let li0;
  	let a0;
  	let t1;
  	let li1;
  	let a1;
  	let t3;
  	let li2;
  	let a2;
  	let t5;
  	let li3;
  	let a3;
  	let t7;
  	let li4;
  	let a4;
  	let t9;
  	let li5;
  	let a5;
  	let t11;
  	let i;

  	const block = {
  		c: function create() {
  			nav = element("nav");
  			ul = element("ul");
  			li0 = element("li");
  			a0 = element("a");
  			a0.textContent = "Home";
  			t1 = space();
  			li1 = element("li");
  			a1 = element("a");
  			a1.textContent = "About";
  			t3 = space();
  			li2 = element("li");
  			a2 = element("a");
  			a2.textContent = "Services";
  			t5 = space();
  			li3 = element("li");
  			a3 = element("a");
  			a3.textContent = "Departments";
  			t7 = space();
  			li4 = element("li");
  			a4 = element("a");
  			a4.textContent = "Doctors";
  			t9 = space();
  			li5 = element("li");
  			a5 = element("a");
  			a5.textContent = "Contact";
  			t11 = space();
  			i = element("i");
  			attr_dev(a0, "class", "nav-link scrollto active svelte-1kxlj5u");
  			attr_dev(a0, "href", "#hero");
  			add_location(a0, file$1, 5, 6, 106);
  			attr_dev(li0, "class", "svelte-1kxlj5u");
  			add_location(li0, file$1, 4, 4, 95);
  			attr_dev(a1, "class", "nav-link scrollto svelte-1kxlj5u");
  			attr_dev(a1, "href", "#about");
  			add_location(a1, file$1, 9, 6, 190);
  			attr_dev(li1, "class", "svelte-1kxlj5u");
  			add_location(li1, file$1, 8, 4, 179);
  			attr_dev(a2, "class", "nav-link scrollto svelte-1kxlj5u");
  			attr_dev(a2, "href", "#services");
  			add_location(a2, file$1, 13, 6, 269);
  			attr_dev(li2, "class", "svelte-1kxlj5u");
  			add_location(li2, file$1, 12, 4, 258);
  			attr_dev(a3, "class", "nav-link scrollto svelte-1kxlj5u");
  			attr_dev(a3, "href", "#departments");
  			add_location(a3, file$1, 17, 6, 354);
  			attr_dev(li3, "class", "svelte-1kxlj5u");
  			add_location(li3, file$1, 16, 4, 343);
  			attr_dev(a4, "class", "nav-link scrollto svelte-1kxlj5u");
  			attr_dev(a4, "href", "#doctors");
  			add_location(a4, file$1, 21, 6, 445);
  			attr_dev(li4, "class", "svelte-1kxlj5u");
  			add_location(li4, file$1, 20, 4, 434);
  			attr_dev(a5, "class", "nav-link scrollto svelte-1kxlj5u");
  			attr_dev(a5, "href", "#contact");
  			add_location(a5, file$1, 25, 6, 528);
  			attr_dev(li5, "class", "svelte-1kxlj5u");
  			add_location(li5, file$1, 24, 4, 517);
  			attr_dev(ul, "class", "svelte-1kxlj5u");
  			add_location(ul, file$1, 3, 2, 86);
  			attr_dev(i, "class", "bi bi-list mobile-nav-toggle svelte-1kxlj5u");
  			add_location(i, file$1, 28, 2, 605);
  			attr_dev(nav, "id", "navbar");
  			attr_dev(nav, "class", "navbar order-last order-lg-0 svelte-1kxlj5u");
  			add_location(nav, file$1, 2, 0, 29);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, nav, anchor);
  			append_dev(nav, ul);
  			append_dev(ul, li0);
  			append_dev(li0, a0);
  			append_dev(ul, t1);
  			append_dev(ul, li1);
  			append_dev(li1, a1);
  			append_dev(ul, t3);
  			append_dev(ul, li2);
  			append_dev(li2, a2);
  			append_dev(ul, t5);
  			append_dev(ul, li3);
  			append_dev(li3, a3);
  			append_dev(ul, t7);
  			append_dev(ul, li4);
  			append_dev(li4, a4);
  			append_dev(ul, t9);
  			append_dev(ul, li5);
  			append_dev(li5, a5);
  			append_dev(nav, t11);
  			append_dev(nav, i);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(nav);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$2.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$2($$self, $$props) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Navigation', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navigation> was created with unknown prop '${key}'`);
  	});

  	return [];
  }

  class Navigation extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Navigation",
  			options,
  			id: create_fragment$2.name
  		});
  	}
  }

  /* src/components/Header.svelte generated by Svelte v3.47.0 */
  const file = "src/components/Header.svelte";

  function create_fragment$1(ctx) {
  	let header;
  	let div;
  	let h1;
  	let a0;
  	let t1;
  	let navigation;
  	let t2;
  	let a1;
  	let span;
  	let t4;
  	let current;
  	navigation = new Navigation({ $$inline: true });

  	const block = {
  		c: function create() {
  			header = element("header");
  			div = element("div");
  			h1 = element("h1");
  			a0 = element("a");
  			a0.textContent = "Medilab";
  			t1 = space();
  			create_component(navigation.$$.fragment);
  			t2 = space();
  			a1 = element("a");
  			span = element("span");
  			span.textContent = "Make an";
  			t4 = text(" Appointment");
  			attr_dev(a0, "href", "index.html");
  			attr_dev(a0, "class", "svelte-15r9uev");
  			add_location(a0, file, 5, 29, 195);
  			attr_dev(h1, "class", "logo me-auto svelte-15r9uev");
  			add_location(h1, file, 5, 4, 170);
  			attr_dev(span, "class", "d-none d-md-inline");
  			add_location(span, file, 8, 7, 315);
  			attr_dev(a1, "href", "#doctors");
  			attr_dev(a1, "class", "appointment-btn scrollto svelte-15r9uev");
  			add_location(a1, file, 7, 4, 256);
  			attr_dev(div, "class", "container d-flex align-items-center");
  			add_location(div, file, 4, 2, 116);
  			attr_dev(header, "id", "header");
  			attr_dev(header, "class", "fixed-top svelte-15r9uev");
  			add_location(header, file, 3, 0, 75);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, header, anchor);
  			append_dev(header, div);
  			append_dev(div, h1);
  			append_dev(h1, a0);
  			append_dev(div, t1);
  			mount_component(navigation, div, null);
  			append_dev(div, t2);
  			append_dev(div, a1);
  			append_dev(a1, span);
  			append_dev(a1, t4);
  			current = true;
  		},
  		p: noop,
  		i: function intro(local) {
  			if (current) return;
  			transition_in(navigation.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(navigation.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(header);
  			destroy_component(navigation);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$1.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('Header', slots, []);
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({ Navigation });
  	return [];
  }

  class Header extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Header",
  			options,
  			id: create_fragment$1.name
  		});
  	}
  }

  /* src/App.svelte generated by Svelte v3.47.0 */

  function create_fragment(ctx) {
  	let topbar;
  	let t0;
  	let header;
  	let t1;
  	let switch_instance;
  	let t2;
  	let footer;
  	let current;
  	topbar = new TopBar({ $$inline: true });
  	header = new Header({ $$inline: true });
  	var switch_value = /*page*/ ctx[0];

  	function switch_props(ctx) {
  		return { $$inline: true };
  	}

  	if (switch_value) {
  		switch_instance = new switch_value(switch_props());
  	}

  	footer = new Footer({ $$inline: true });

  	const block = {
  		c: function create() {
  			create_component(topbar.$$.fragment);
  			t0 = space();
  			create_component(header.$$.fragment);
  			t1 = space();
  			if (switch_instance) create_component(switch_instance.$$.fragment);
  			t2 = space();
  			create_component(footer.$$.fragment);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			mount_component(topbar, target, anchor);
  			insert_dev(target, t0, anchor);
  			mount_component(header, target, anchor);
  			insert_dev(target, t1, anchor);

  			if (switch_instance) {
  				mount_component(switch_instance, target, anchor);
  			}

  			insert_dev(target, t2, anchor);
  			mount_component(footer, target, anchor);
  			current = true;
  		},
  		p: function update(ctx, [dirty]) {
  			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
  				if (switch_instance) {
  					group_outros();
  					const old_component = switch_instance;

  					transition_out(old_component.$$.fragment, 1, 0, () => {
  						destroy_component(old_component, 1);
  					});

  					check_outros();
  				}

  				if (switch_value) {
  					switch_instance = new switch_value(switch_props());
  					create_component(switch_instance.$$.fragment);
  					transition_in(switch_instance.$$.fragment, 1);
  					mount_component(switch_instance, t2.parentNode, t2);
  				} else {
  					switch_instance = null;
  				}
  			}
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(topbar.$$.fragment, local);
  			transition_in(header.$$.fragment, local);
  			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
  			transition_in(footer.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(topbar.$$.fragment, local);
  			transition_out(header.$$.fragment, local);
  			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
  			transition_out(footer.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			destroy_component(topbar, detaching);
  			if (detaching) detach_dev(t0);
  			destroy_component(header, detaching);
  			if (detaching) detach_dev(t1);
  			if (switch_instance) destroy_component(switch_instance, detaching);
  			if (detaching) detach_dev(t2);
  			destroy_component(footer, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	validate_slots('App', slots, []);
  	let page$1;
  	page('/', () => $$invalidate(0, page$1 = Home));
  	page.start();
  	const writable_props = [];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
  	});

  	$$self.$capture_state = () => ({
  		router: page,
  		Home,
  		TopBar,
  		Footer,
  		Header,
  		page: page$1
  	});

  	$$self.$inject_state = $$props => {
  		if ('page' in $$props) $$invalidate(0, page$1 = $$props.page);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [page$1];
  }

  class App extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance, create_fragment, safe_not_equal, {});

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "App",
  			options,
  			id: create_fragment.name
  		});
  	}
  }

  const app = new App({
      target: document.body,
  });

  return app;

})();
//# sourceMappingURL=bundle.js.map
