exports.PannerField = PannerField;

function PannerField(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.center = {x: canvas.width / 2, y: canvas.height * 0.7};
    this.point = {x: this.center.x, y: 0.7 * this.center.y};

    this.isDragging = false;

    let self = this;

    canvas.addEventListener('mousedown', function () {
        self.handleMouseDown.apply(self, arguments)
    });
    canvas.addEventListener('mousemove', function () {
        self.handleMouseMove.apply(self, arguments)
    });
    canvas.addEventListener('mouseleave', function () {
        self.handleMouseLeave.apply(self, arguments)
    });
    canvas.addEventListener('mouseup', function () {
        self.handleMouseUp.apply(self, arguments)
    });

    this.keyboardIcon = new Image();
    this.keyboardIcon.src = 'img/keyboard_icon.gif';

    this.keyboardIcon.onload = function () {
        self.render();
    }
}

PannerField.prototype.render = function () {
    let grd = this.ctx.createRadialGradient(this.center.x, this.center.y, 5,
        this.center.x, this.center.y, this.canvas.height);
    grd.addColorStop(0, "#bbb");
    grd.addColorStop(1, "#fff");
    this.ctx.fillStyle = grd;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // instrument
    this.ctx.save();
    this.ctx.translate(this.point.x, this.point.y);
    this.ctx.translate(-this.keyboardIcon.width / 2, -this.keyboardIcon.height / 2);
    this.ctx.drawImage(this.keyboardIcon, 0, 0);
    this.ctx.restore();
    this.ctx.fill();
};

PannerField.prototype.handleMouseDown = function (e) {
    this.isDragging = true;
    this.handleMouseMove(e);
};

PannerField.prototype.handleMouseUp = function (e) {
    this.isDragging = false;
};

PannerField.prototype.handleMouseLeave = function (e) {
    this.isDragging = false;
};

PannerField.prototype.handleMouseMove = function (e) {
    if (this.isDragging) {
        this.point = {x: e.offsetX, y: e.offsetY};
        this.render();
        if (this.pointChangedListener) {
            this.pointChangedListener({
                // -1 < x < 1
                x: (this.point.x - this.center.x) / this.canvas.offsetWidth * 2,
                // 0 < y < 1
                y: (this.center.y - this.point.y) / this.canvas.offsetHeight
            });
        }
    }
};

PannerField.prototype.registerPointChanged = function (callback) {
    this.pointChangedListener = callback;
};