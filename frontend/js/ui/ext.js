exports.convertToProgressBar = convertToProgressBar;
exports.attachKeyboardDragger = attachKeyboardDragger;
exports.updateDropdownSelection = updateDropdownSelection;

function convertToProgressBar(slider, colors, colorStops) {

    var w = slider.offsetWidth;
    var h = slider.offsetHeight;
    var maxValue = slider.getAttribute('max') || 100;
    var minValue = slider.getAttribute('min') || 0;

    slider.classList.add('hidden');

    var parent = slider.parentNode;
    parent.removeChild(slider);
    var div = document.createElement('div');
    div.className = 'input-progress-bar';
    div.appendChild(slider);

    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    div.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    slider.onchange = function(){
        var sliderProgress = (slider.value-minValue)/(maxValue-minValue);
        var xLast=0;
        if (typeof(colors) === 'string') {
            ctx.fillStyle = colors;
            xLast = w*sliderProgress;
            ctx.fillRect(0,0,xLast,h);
        } else if (typeof(colors) === 'object' && typeof(colorStops) === 'object') {
            var xNew;
            for (var i=0; i<colors.length && i<colorStops.length; i++) {
                xNew = w*colorStops[i]/100;
                xNew = xNew>w*sliderProgress ? w*sliderProgress : xNew;

                ctx.fillStyle = colors[i];
                ctx.fillRect(xLast, 0, xNew, h);

                xLast = xNew;
                if (xNew>=w*sliderProgress) {
                    break;
                }
            }
        }
        ctx.clearRect(xLast,0,w,h);
    };
    slider.oninput = slider.onchange;
    slider.onchange();

    parent.appendChild(div);
}

// scroll keyboard by dragging object
function attachKeyboardDragger () {
    var attachment = false;
    var lastPosition;
    var obj = $(this);
    var kb = $("#keyboard");

    obj.on("mousedown", function (e) {
        attachment = true;
        lastPosition = e.clientX;
    });
    $(window).on("mousemove", function (e) {
        if (attachment == true) {
            var difference = e.clientX - lastPosition;
            kb.scrollLeft(kb.scrollLeft() - difference);
            lastPosition = e.clientX;
        }
    });
    $(window).on("mouseup", function () {
        attachment = false;
    });
}

function updateDropdownSelection (newValue, liArray, attributeName) {
    for (var i=0; i<liArray.length; i++) {
        var a = liArray[i].children[0];
        if (attributeName) {
            var attrValue = a.getAttribute(attributeName);
            if (attrValue !== newValue) {
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