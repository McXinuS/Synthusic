exports.convertToProgressBar = convertToProgressBar;
exports.attachDragger = attachDragger;
exports.updateDropdownSelection = updateDropdownSelection;
exports.floatEqual = floatEqual;
// colors
exports.RGBtoHSV = RGBtoHSV;
exports.HSVtoRGB = HSVtoRGB;

/**
 * * Unused at the moment.
 * Converts range input element to canvas-based progress bar.
 * @param slider Input element with attribute type set to 'range'.
 * @param colors A color or a set of colors that fills progress bar as its value changes.
 * @param colorStops A set of numbers, which configures a color's range in percents of width (from [n-1] to [n])
 */
function convertToProgressBar(slider, colors, colorStops) {

    var w = slider.offsetWidth;
    var h = slider.offsetHeight;
    var maxValue = slider.getAttribute('max') || 100;
    var minValue = slider.getAttribute('min') || 0;
    if (!colors) colors = '#4a4';

    slider.classList.add('hidden');

    var parent = slider.parentNode;
    parent.removeChild(slider);
    var div = document.createElement('div');
    div.appendChild(slider);

    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    canvas.className = 'input-progress-bar';
    div.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    window.addEventListener('resize', function () {
        let style = window.getComputedStyle(div.parentNode, null);
        w = div.parentNode.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        canvas.setAttribute('width', w);
    }, true);

    slider.onchange = function () {
        var sliderProgress = (slider.value - minValue) / (maxValue - minValue);
        var xLast = 0;
        if (typeof(colors) === 'string') {
            ctx.fillStyle = colors;
            xLast = w * sliderProgress;
            ctx.fillRect(0, 0, xLast, h);
        } else if (typeof(colors) === 'object' && typeof(colorStops) === 'object') {
            var xNew;
            for (var i = 0; i < colors.length && i < colorStops.length; i++) {
                xNew = w * colorStops[i] / 100;
                xNew = xNew > w * sliderProgress ? w * sliderProgress : xNew;

                ctx.fillStyle = colors[i];
                ctx.fillRect(xLast, 0, xNew, h);

                xLast = xNew;
                if (xNew >= w * sliderProgress) {
                    break;
                }
            }
        }
        ctx.clearRect(xLast, 0, w, h);
    };
    slider.oninput = slider.onchange;
    slider.onchange();

    parent.appendChild(div);
}

// scroll object by dragging another object
function attachDragger(scrolldObj) {
    var attachment = false;
    var lastPosition;
    var self = $(this);
    var toScroll = scrolldObj;

    self.on("mousedown", function (e) {
        attachment = true;
        lastPosition = e.clientX;
    });
    $(window).on("mousemove", function (e) {
        if (attachment != true) return;

        var difference = e.clientX - lastPosition;
        toScroll.scrollLeft(toScroll.scrollLeft() - difference);
        lastPosition = e.clientX;
    });
    $(window).on("mouseup", function () {
        attachment = false;
    });
}

function updateDropdownSelection(newValue, liArray, attributeName) {
    if (typeof(newValue) === 'undefined') return;

    if (attributeName) {
        newValue = newValue.toString();
    }

    for (var i = 0; i < liArray.length; i++) {
        var a = liArray[i].children[0];
        if (attributeName) {
            if (a.getAttribute(attributeName) !== newValue) {
                a.classList.remove('selected');
            } else {
                a.classList.add('selected');
            }
        } else {
            if (a.innerText !== newValue) {
                a.classList.remove('selected');
            } else {
                a.classList.add('selected');
            }
        }
    }
}

function floatEqual(a, b, epsilon) {
    var diff = Math.abs(a - b);

    if (a == b) { // shortcut, handles infinities
        return true;
    } else if (a == 0 || b == 0 || diff < Number.MIN_VALUE) {
        // a or b is zero or both are extremely close to it
        // relative error is less meaningful here
        return diff < (epsilon * Number.MIN_VALUE);
    } else {
        return diff < epsilon; // use relative error
        //return diff / (Math.abs(a) + Math.abs(b)) < epsilon; // use relative error
    }
}

// http://stackoverflow.com/questions/13806483/increase-or-decrease-color-saturation
function RGBtoHSV(color) {
    var r, g, b, h, s, v, min, max, delta;
    r = color[0];
    g = color[1];
    b = color[2];
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);


    v = max;
    delta = max - min;
    if (max != 0)
        s = delta / max;        // s
    else {
        // r = g = b = 0        // s = 0, v is undefined
        s = 0;
        h = -1;
        return [h, s, undefined];
    }
    if (r === max)
        h = ( g - b ) / delta;      // between yellow & magenta
    else if (g === max)
        h = 2 + ( b - r ) / delta;  // between cyan & yellow
    else
        h = 4 + ( r - g ) / delta;  // between magenta & cyan
    h *= 60;                // degrees
    if (h < 0)
        h += 360;
    if (isNaN(h))
        h = 0;
    return [h, s, v];
}

function HSVtoRGB(color) {
    var i;
    var h, s, v, r, g, b;
    h = color[0];
    s = color[1];
    v = color[2];
    if (s === 0) {
        // achromatic (grey)
        r = g = b = v;
        return [r, g, b];
    }
    h /= 60;            // sector 0 to 5
    i = Math.floor(h);
    f = h - i;          // factorial part of h
    p = v * ( 1 - s );
    q = v * ( 1 - s * f );
    t = v * ( 1 - s * ( 1 - f ) );
    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default:        // case 5:
            r = v;
            g = p;
            b = q;
            break;
    }
    return [r, g, b];
}