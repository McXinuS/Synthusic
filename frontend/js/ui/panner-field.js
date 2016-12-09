exports.PannerField = PannerField;

function PannerField(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.center = {x: canvas.width / 2, y: canvas.height};
    this.point = {x: this.center.x, y: 0.7 * canvas.height};

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

    //this.backgroundImage = new Image();
    //this.backgroundImage.src = 'img/...';
    this.keyboardIcon = new Image();
    this.keyboardIcon.src = 'img/keyboard_icon.gif';

    this.keyboardIcon.onload = function () {
        self.render();
    }
}

PannerField.prototype.render = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //this.ctx.drawImage(this.backgroundImage, this.center.x - this.backgroundImage.width/2,
    //    this.center.y - this.backgroundImage.height/2);
    this.ctx.fill();

    if (this.point) {
        // Draw it rotated.
        this.ctx.save();
        this.ctx.translate(this.point.x, this.point.y);
        this.ctx.rotate(this.angle);
        this.ctx.translate(-this.keyboardIcon.width / 2, -this.keyboardIcon.height / 2);
        this.ctx.drawImage(this.keyboardIcon, 0, 0);
        this.ctx.restore();
    }
    this.ctx.fill();
};

PannerField.prototype.handleMouseDown = function (e) {
    this.isDragging = true;
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
            // Callback with -1 < x < 1, 0 < y < 1
            this.pointChangedListener({
                x: (this.point.x - this.center.x) / this.canvas.offsetWidth * 2,
                y: (this.center.y - this.point.y) / this.canvas.offsetHeight
            });
        }
    }
};

PannerField.prototype.registerPointChanged = function (callback) {
    this.pointChangedListener = callback;
};