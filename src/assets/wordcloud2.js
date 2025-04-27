/**
 * wordcloud2.js
 * http://timdream.org/wordcloud2.js/
 *
 * Copyright 2011 - 2019 Tim Guan-tin Chien and contributors.
 * Released under the MIT license
 */

'use strict';

// setImmediate
if (!window.setImmediate) {
  window.setImmediate = (function setupSetImmediate() {
    return window.msSetImmediate ||
    window.webkitSetImmediate ||
    window.mozSetImmediate ||
    window.oSetImmediate ||
    (function setupSetZeroTimeout() {
      if (!window.postMessage || !window.addEventListener) {
        return null;
      }

      var callbacks = [undefined];
      var message = 'zero-timeout-message';

      // Like setTimeout, but only takes a function argument.  There's
      // no time argument (always zero) and no arguments (you have to
      // use a closure).
      var setZeroTimeout = function setZeroTimeout(callback) {
        var id = callbacks.length;
        callbacks.push(callback);
        window.postMessage(message + id.toString(), '*');

        return id;
      };

      window.addEventListener('message', function setZeroTimeoutMessage(evt) {
        // Skipping checking event source, retarded IE confused this window
        // object with another in the presence of iframe
        if (typeof evt.data !== 'string' ||
            evt.data.substr(0, message.length) !== message/* ||            evt.source !== window */) {
          return;
        }

        evt.stopImmediatePropagation();

        var id = parseInt(evt.data.substr(message.length), 10);
        if (!callbacks[id]) {
          return;
        }

        callbacks[id]();
        callbacks[id] = undefined;
      }, true);

      /* specify clearImmediate() here since we need the scope */
      window.clearImmediate = function clearZeroTimeout(id) {
        if (!callbacks[id]) {
          return;
        }

        callbacks[id] = undefined;
      };

      return setZeroTimeout;
    }()) ||
    // fallback
    function setImmediateFallback(fn) {
      window.setTimeout(fn, 0);
    };
  }());
}

if (!window.clearImmediate) {
  window.clearImmediate = (function setupClearImmediate() {
    return window.msClearImmediate ||
    window.webkitClearImmediate ||
    window.mozClearImmediate ||
    window.oClearImmediate ||
    // "clearZeroTimeout" is implement on the previous block ||    // fallback
    function clearImmediateFallback(timer) {
      window.clearTimeout(timer);
    };
  }());
}

(function(global) {

  // Check if WordCloud can run on this browser
  var isSupported = (function isSupported() {
    var canvas = document.createElement('canvas');
    if (!canvas || !canvas.getContext) {
      return false;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
      return false;
    }
    if (!ctx.getImageData) {
      return false;
    }
    if (!ctx.fillText) {
      return false;
    }

    if (!Array.prototype.some) {
      return false;
    }
    if (!Array.prototype.push) {
      return false;
    }

    return true;
  }());

  // Find out if the browser impose minium font size by
  // drawing small texts on a canvas and measure it's width.
  var minFontSize = (function getMinFontSize() {
    if (!isSupported) {
      return;
    }

    var ctx = document.createElement('canvas').getContext('2d');

    // start from 20
    var size = 20;

    // two sizes to measure
    var hanWidth, mWidth;

    while (size) {
      ctx.font = size.toString(10) + 'px sans-serif';
      if ((ctx.measureText('\uFF37').width === hanWidth) &&
          (ctx.measureText('m').width) === mWidth) {
        return (size + 1);
      }

      hanWidth = ctx.measureText('\uFF37').width;
      mWidth = ctx.measureText('m').width;

      size--;
    }

    return 0;
  }());

  // Based on http://jsfromhell.com/array/shuffle
  var shuffleArray = function shuffleArray(arr) {
    for (var j, x, i = arr.length; i;
      j = Math.floor(Math.random() * i),
      x = arr[--i], arr[i] = arr[j],
      arr[j] = x) {}
    return arr;
  };

  var WordCloud = function WordCloud(elements, options) {
    if (!isSupported) {
      return;
    }

    if (!Array.isArray(elements)) {
      elements = [elements];
    }

    elements.forEach(function(el) {
      if (typeof el === 'string') {
        elements = document.querySelectorAll(el);
        if (!elements.length) {
          throw 'The element ' + el + ' does not exist.';
        }
      } else if (!el.tagName && !el.appendChild) {
        throw 'You must pass valid HTML elements, or ID/class selectors.';
      }
    });

    /* Default values to be overwritten by options object */
    var settings = {
      list: [],
      fontFamily: '"Trebuchet MS", "Heiti TC", "微軟正黑體", ' +
                 '"Arial Unicode MS", "Droid Fallback Sans", sans-serif',
      fontWeight: 'normal',
      color: 'random-dark',
      minSize: 0, // 0 to disable
      weightFactor: 1,
      clearCanvas: true,
      backgroundColor: '#fff',  // opaque white = rgba(255, 255, 255, 1)

      gridSize: 8,
      drawOutOfBound: false,
      shrinkToFit: false,
      origin: null,

      drawMask: false,
      maskColor: 'rgba(255,0,0,0.3)',
      maskGapWidth: 0.3,

      wait: 0,
      abortThreshold: 0, // disabled
      abort: function noop() {},

      minRotation: - Math.PI / 2,
      maxRotation: Math.PI / 2,
      rotationSteps: 0,

      shuffle: true,
      rotateRatio: 0.1,

      shape: 'circle',
      ellipticity: 0.65,

      classes: null,

      hover: null,
      click: null
    };

    if (options) {
      for (var key in options) {
        if (key in settings) {
          settings[key] = options[key];
        }
      }
    }

    /* Convert weightFactor into a function */
    if (typeof settings.weightFactor !== 'function') {
      var factor = settings.weightFactor;
      settings.weightFactor = function weightFactor(pt) {
        return pt * factor; //in px
      };
    }

    /* Convert shape into a function */
    if (typeof settings.shape !== 'function') {
      switch (settings.shape) {
        case 'circle':
        /* falls through */
        default:
          // 'circle' is the default and a shortcut in the code loop.
          settings.shape = 'circle';
          break;

        case 'cardioid':
          settings.shape = function shapeCardioid(theta) {
            return 1 - Math.sin(theta);
          };
          break;

        /*
        To work out an X-gon, one has to calculate "m", where 1/(cos(2*PI/X)+m*sin(2*PI/X)) gives the magnitude of each step along the path around the X-gon.
        "m" is related to the radius of the circumscribed circle by the relation:
          r = 1/(cos(2*PI/X)+m*sin(2*PI/X))
        For a given number of sides X, the following gives a good approximation to the radius:
          r = 1/(cos(2*PI/X)+sin(2*PI/X)/tan(PI/X))
        */

        case 'diamond':
        case 'square':
          // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%282*PI%2F4%29%2Bsin%282*PI%2F4%29%2Ftan%28PI%2F4%29%29%2C+r+%3D+1%2F%28cos%282*PI%2F4%29%2Bm*sin%282*PI%2F4%29%29
          settings.shape = function shapeSquare(theta) {
            var thetaPrime = theta + Math.PI / 4;
            return Math.cos(thetaPrime);
          };
          break;

        case 'triangle-forward':
          // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%282*PI%2F3%29%2Bsin%282*PI%2F3%29%2Ftan%28PI%2F3%29%29%2C+r+%3D+1%2F%28cos%282*PI%2F3%29%2Bm*sin%282*PI%2F3%29%29
          settings.shape = function shapeTriangle(theta) {
            var thetaPrime = theta + Math.PI * 2 / 3;
            return Math.cos(thetaPrime);
          };
          break;

        case 'triangle':
        case 'triangle-upright':
          settings.shape = function shapeTriangle(theta) {
            var thetaPrime = theta + Math.PI;
            return Math.cos(thetaPrime);
          };
          break;

        case 'pentagon':
          settings.shape = function shapePentagon(theta) {
            var thetaPrime = theta + 0.955;
            return Math.cos(thetaPrime);
          };
          break;

        case 'star':
          settings.shape = function shapeStar(theta) {
            var thetaPrime = theta / 2;
            return Math.cos(thetaPrime);
          };
          break;
      }
    }

    /* Convert rotation into a function */
    if (typeof settings.minRotation === 'number') {
      var rotationRange = Math.abs(settings.maxRotation - settings.minRotation);
      var rotationSteps = Math.abs(Math.floor(settings.rotationSteps));
      var minRotation = Math.min(settings.maxRotation, settings.minRotation);
      settings.rotationFactor = function rotationFactor() {
        if (rotationSteps > 0) {
          return minRotation + Math.floor(Math.random() * rotationSteps) * rotationRange / (rotationSteps - 1);
        } else {
          return minRotation + Math.random() * rotationRange;
        }
      };
    }

    /* Convert width/height into a function */
    var sizeFunction = function sizeFunction(d) {
      return d[1];
    };

    var drawMask = true;

    /* Start drawing */
    var g = settings.gridSize;
    var maskRectWidth = g - settings.maskGapWidth;

    var center = settings.origin ? [
      settings.origin[0] / g, settings.origin[1] / g
    ] : [defaultHorizontalPosition(), defaultVerticalPosition()];

    /* Information for the user about word placement */
    var grid = [];

    /* Determine the center of each word */
    var bounds = null;

    /* Determine if the text can be put at the position where it is */
    function canFitText(gx, gy, gw, gh, occupied) {
      // Go through the pixels of the word and see if we can fit it
      var i = gw;
      while (i--) {
        var j = gh;
        while (j--) {
          var p = occupied[gx + i][gy + j];
          if (!p) {
            return false;
          }
        }
      }
      return true;
    }

    /* Actually draw the text on the grid */
    function drawText(gx, gy, info, word, weight,
                     distance, theta, rotateDeg, attributes) {

      var fontSize = info.fontSize;
      var color;
      if (getTextColor) {
        color = getTextColor(word, weight, fontSize, distance, theta);
      } else {
        color = settings.color;
      }

      // get fontWeight that will be used to set ctx.font
      var fontWeight;
      if (getTextFontWeight) {
        fontWeight = getTextFontWeight(word, weight, fontSize);
      } else {
        fontWeight = settings.fontWeight;
      }

      var classes;
      if (getTextClasses) {
        classes = getTextClasses(word, weight, fontSize);
      } else {
        classes = settings.classes;
      }

      elements.forEach(function(el) {
        if (el.tagName === 'CANVAS') {
          var ctx = el.getContext('2d');

          var mu = info.mu;

          // Save the current state before messing it
          ctx.save();
          ctx.scale(1 / mu, 1 / mu);

          ctx.font = fontWeight + ' ' +
                     (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;
          ctx.fillStyle = color;

          // Translate the canvas position to the origin coordinate of where
          // the text should be put.
          ctx.translate((gx + info.gw / 2) * g * mu,
                       (gy + info.gh / 2) * g * mu);

          if (rotateDeg !== 0) {
            ctx.rotate(- rotateDeg);
          }

          // Finally, fill the text.

          // XXX: We cannot because textBaseline = 'top' here because
          // Firefox and Chrome uses different default line-height for canvas.
          // Please read https://bugzil.la/737852#c6.
          // Here, we use textBaseline = 'middle' and draw the text at exactly
          // 0.5 * fontSize lower.
          ctx.textBaseline = 'middle';
          ctx.fillText(word, 0,
                       (fontSize * mu / 2) * attributes.ratio);

          // The below box is always matches how <span>s are positioned
          /* ctx.strokeRect(info.fillTextOffsetX * mu,
            info.fillTextOffsetY * mu,
            info.fillTextWidth * mu,
            info.fillTextHeight * mu); */

          // Restore the state.
          ctx.restore();
        } else {
          var span = document.createElement('span');
          var transformRule = '';
          transformRule = 'rotate(' + (- rotateDeg) + 'deg) ';
          if (info.mu !== 1) {
            transformRule +=
              'translateX(-' + (info.fillTextWidth / 4) + 'px) ' +
              'scale(' + (1 / info.mu) + ')';
          }
          var styleRules = {
            'position': 'absolute',
            'display': 'block',
            'font': fontWeight + ' ' +
                    fontSize + 'px ' + settings.fontFamily,
            'left': ((gx + info.gw / 2) * g + info.fillTextOffsetX) + 'px',
            'top': ((gy + info.gh / 2) * g + info.fillTextOffsetY) + 'px',
            'width': info.fillTextWidth + 'px',
            'height': info.fillTextHeight + 'px',
            'lineHeight': fontSize + 'px',
            'whiteSpace': 'nowrap',
            'transform': transformRule,
            'webkitTransform': transformRule,
            'msTransform': transformRule,
            'transformOrigin': '50% 40%',
            'webkitTransformOrigin': '50% 40%',
            'msTransformOrigin': '50% 40%'
          };
          if (color) {
            styleRules.color = color;
          }
          span.textContent = word;
          for (var cssProp in styleRules) {
            span.style[cssProp] = styleRules[cssProp];
          }
          if (attributes.dataAttributes) {
            for (var key in attributes.dataAttributes) {
              span.setAttribute('data-' + key,
                              attributes.dataAttributes[key]);
            }
          }
          if (classes) {
            span.className += classes;
          }
          el.appendChild(span);
        }
      });
    }

    /* Help function to updateGrid */
    function fillGridAt(x, y, drawMask, dimension, item) {
      if (x >= ngx || y >= ngy || x < 0 || y < 0) {
        return;
      }

      grid[x][y] = false;

      if (drawMask) {
        var ctx = elements[0].getContext('2d');
        ctx.fillRect(x * g, y * g, maskRectWidth, maskRectWidth);
      }

      if (interactive) {
        infoGrid[x][y] = { item: item, dimension: dimension };
      }
    }

    /* Update the filling information of the given space with occupied points.
       Draw the mask on the canvas if necessary. */
    function updateGrid(gx, gy, gw, gh, info, item) {
      var occupied = info.occupied;
      var drawMask = settings.drawMask;
      var ctx;
      if (drawMask) {
        ctx = elements[0].getContext('2d');
        ctx.save();
        ctx.fillStyle = settings.maskColor;
      }

      var dimension;
      if (interactive) {
        var bounds = info.bounds;
        dimension = {
          x: (gx + bounds[3]) * g,
          y: (gy + bounds[0]) * g,
          w: (bounds[1] - bounds[3] + 1) * g,
          h: (bounds[2] - bounds[0] + 1) * g
        };
      }

      var i = gw;
      while (i--) {
        var j = gh;
        while (j--) {
          if (!occupied[gx + i][gy + j]) {
            fillGridAt(gx + i, gy + j, drawMask, dimension, item);
          }
        }
      }

      if (drawMask) {
        ctx.restore();
      }
    }

    /* putWord() processes each item on the list,
       calculate it's size and determine it's position, and actually
       put it on the canvas. */
    function putWord(item) {
      var word, weight;
      if (Array.isArray(item)) {
        word = item[0];
        weight = item[1];
      } else {
        word = item.word;
        weight = item.weight;
      }
      var attributes = item.attributes || {};

      // get info needed to put the text onto the canvas
      var info = getTextInfo(word, weight, rotateDeg, attributes);

      // not getting the info means we shouldn't be drawing this one.
      if (!info) {
        return false;
      }

      if (exceedTime()) {
        return false;
      }

      // If drawOutOfBound is set to false,
      // skip the loop if we have already know the bounding box of
      // word is larger than the canvas.
      if (!settings.drawOutOfBound && !settings.shrinkToFit) {
        var bounds = info.bounds;
        if ((bounds[1] - bounds[3] + 1) > ngx ||
          (bounds[2] - bounds[0] + 1) > ngy) {
          return false;
        }
      }

      // Determine the position to put the text by
      // start looking for the nearest points
      var r = maxRadius + 1;

      var tryToPutWordAtPoint = function(gxy) {
        var gx = Math.floor(gxy[0] - info.gw / 2);
        var gy = Math.floor(gxy[1] - info.gh / 2);
        var gw = info.gw;
        var gh = info.gh;

        // If we cannot fit the text at this position, return false
        // and go to the next position.
        if (!canFitText(gx, gy, gw, gh, info.occupied)) {
          return false;
        }

        // Actually put the text on the canvas
        drawText(gx, gy, info, word, weight,
                (maxRadius - r), gxy[2], rotateDeg, attributes);

        // Mark the spaces on the grid as filled
        updateGrid(gx, gy, gw, gh, info, item);

        // Return true so some() will stop and also return true.
        return true;
      };

      while (r--) {
        var points = getPointsAtRadius(maxRadius - r);

        if (settings.shuffle) {
          points = [].concat(points);
          shuffleArray(points);
        }

        // Try to fit the words by looking at each point.
        // array.some() will stop and return true
        // when putWordAtPoint() returns true.
        // If all the points returns false, array.some() returns false.
        var drawn = points.some(tryToPutWordAtPoint);

        if (drawn) {
          // leave putWord() and return true
          return true;
        }
      }
      if (settings.shrinkToFit) {
        if (Array.isArray(item)) {
          item[1] = item[1] * 3 / 4;
        } else {
          item.weight = item.weight * 3 / 4;
        }
        return putWord(item);
      }
      // we tried all distances but text won't fit, return false
      return false;
    }

    /* Send DOM event to all elements. Will stop sending event and return
       if the previous one is canceled (for cancelable events). */
    function sendEvent(type, cancelable, details) {
      if (cancelable) {
        return !elements.some(function(el) {
          var event = document.createEvent('CustomEvent');
          event.initCustomEvent(type, true, cancelable, details || {});
          return !el.dispatchEvent(event);
        }, this);
      } else {
        elements.forEach(function(el) {
          var event = document.createEvent('CustomEvent');
          event.initCustomEvent(type, true, cancelable, details || {});
          el.dispatchEvent(event);
        }, this);
      }
    }

    /* Start drawing on a canvas */
    function start() {
      // For dimensions, clearCanvas etc.,
      // we only care about the first element.
      var canvas = elements[0];

      if (canvas.getContext) {
        ngx = Math.ceil(canvas.width / g);
        ngy = Math.ceil(canvas.height / g);
      } else {
        var rect = canvas.getBoundingClientRect();
        ngx = Math.ceil(rect.width / g);
        ngy = Math.ceil(rect.height / g);
      }

      // Sending a wordcloudstart event which cause the previous loop to stop.
      // Do nothing if the event is canceled.
      if (!sendEvent('wordcloudstart', true)) {
        return;
      }

      // Determine the center of the word cloud
      center = (settings.origin) ?
        [settings.origin[0]/g, settings.origin[1]/g] :
        [ngx / 2, ngy / 2];

      // Maxium radius to look for space
      maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));

      /* Clear the canvas only if the clearCanvas is set,
         if not, update the grid to the current canvas state */
      grid = [];

      var gx, gy, i;
      if (!canvas.getContext || settings.clearCanvas) {
        elements.forEach(function(el) {
          if (el.getContext) {
            var ctx = el.getContext('2d');
            ctx.fillStyle = settings.backgroundColor;
            ctx.clearRect(0, 0, ngx * (g + 1), ngy * (g + 1));
            ctx.fillRect(0, 0, ngx * (g + 1), ngy * (g + 1));
          } else {
            el.textContent = '';
            el.style.backgroundColor = settings.backgroundColor;
            el.style.position = 'relative';
          }
        });

        /* fill the grid with empty state */
        gx = ngx;
        while (gx--) {
          grid[gx] = [];
          gy = ngy;
          while (gy--) {
            grid[gx][gy] = true;
          }
        }
      } else {
        /* Determine bgPixel by creating
           another canvas and fill the specified background color. */
        var bctx = document.createElement('canvas').getContext('2d');

        bctx.fillStyle = settings.backgroundColor;
        bctx.fillRect(0, 0, 1, 1);
        var bgPixel = bctx.getImageData(0, 0, 1, 1).data;

        /* Read back the pixels of the canvas we got to tell which part of the
           canvas is empty.
           (no clearCanvas only works with a canvas, not divs) */
        var imageData =
          canvas.getContext('2d').getImageData(0, 0, ngx * g, ngy * g).data;

        gx = ngx;
        var x, y;
        while (gx--) {
          grid[gx] = [];
          gy = ngy;
          while (gy--) {
            y = g;
            singleGridLoop: while (y--) {
              x = g;
              while (x--) {
                i = 4;
                while (i--) {
                  if (imageData[((gy * g + y) * ngx * g +
                                (gx * g + x)) * 4 + i] !== bgPixel[i]) {
                    grid[gx][gy] = false;
                    break singleGridLoop;
                  }
                }
              }
            }
            if (grid[gx][gy] !== false) {
              grid[gx][gy] = true;
            }
          }
        }

        imageData = bctx = bgPixel = undefined;
      }

      // fill the infoGrid with empty state if we need it
      if (settings.hover || settings.click) {

        interactive = true;

        /* fill the grid with empty state */
        gx = ngx + 1;
        while (gx--) {
          infoGrid[gx] = [];
        }

        if (settings.hover) {
          canvas.addEventListener('mousemove', wordcloudhover);
        }

        if (settings.click) {
          canvas.addEventListener('click', wordcloudclick);
          canvas.addEventListener('touchstart', wordcloudclick);
          canvas.addEventListener('touchend', function (e) {
            e.preventDefault();
          });
          canvas.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
        }

        canvas.addEventListener('wordcloudstart', function stopInteraction() {
          canvas.removeEventListener('wordcloudstart', stopInteraction);

          canvas.removeEventListener('mousemove', wordcloudhover);
          canvas.removeEventListener('click', wordcloudclick);
          hovered = undefined;
        });
      }

      i = 0;
      var loopingFunction, stoppingFunction;
      if (settings.wait !== 0) {
        loopingFunction = window.setTimeout;
        stoppingFunction = window.clearTimeout;
      } else {
        loopingFunction = window.setImmediate;
        stoppingFunction = window.clearImmediate;
      }

      var addEventListener = function addEventListener(type, listener) {
        elements.forEach(function(el) {
          el.addEventListener(type, listener);
        }, this);
      };

      var removeEventListener = function removeEventListener(type, listener) {
        elements.forEach(function(el) {
          el.removeEventListener(type, listener);
        }, this);
      };

      var anotherWordCloudStart = function anotherWordCloudStart() {
        removeEventListener('wordcloudstart', anotherWordCloudStart);
        stoppingFunction(timer);
      };
    }
  }
});