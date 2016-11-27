// TODO recolor stars on note play

//import {RGBtoHSV, HSVtoRGB, RGBtoSaturation, RGBtoValue} from './ext.js'

exports.PageBackgroundDrawer = PageBackgroundDrawer;

const STAR_DURATION_MIN = 8000;
const STAR_DURATION_MAX = 15000;
const STAR_COUNT = 15;
const STAR_RADIUS_INNER_MIN = 1;
const STAR_RADIUS_INNER_MAX = 2;
const STAR_RADIUS_OUTER_MAX = 10;

function PageBackgroundDrawer(cont) {
    this.container = cont;
    this.stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        this.stars.push(this.createStar());
    }
    this.runStars();
}

PageBackgroundDrawer.prototype.createStar = function () {
    var star = document.createElement('div');
    star.className = 'star';
    this.container.appendChild(star);
    return star;
};

PageBackgroundDrawer.prototype.runStars = function () {
    for (let star in this.stars) {
        this.runStar(this.stars[star]);
    }
};

PageBackgroundDrawer.prototype.runStar = function (star) {

    var x = Math.random() * this.container.offsetWidth;
    var y = Math.random() * this.container.offsetHeight;
    var xPrev = star.style.left || 0;
    var yPrev = star.style.top || 0;
    var xMiddle = (x + xPrev) / 2;
    var yMiddle = (y + yPrev) / 2;

    var duration = STAR_DURATION_MIN + Math.random() * (STAR_DURATION_MAX - STAR_DURATION_MIN);
    var halfPeriod = duration / 2;
    var radius1 = STAR_RADIUS_INNER_MIN + Math.random() * (STAR_RADIUS_INNER_MAX - STAR_RADIUS_INNER_MIN);
    var radius2 = Math.random() * STAR_RADIUS_OUTER_MAX;

    star.style.left = x + 'px';
    star.style.top = y + 'px';
    star.style.width = radius1 + 'px';
    star.style.height = radius1 + 'px';
    star.style.boxShadow = `0 0 ${radius2 * 10}px ${radius2}px rgba(255,255,255,0.5)`;
    star.style.transition = `all ${halfPeriod / 1000}s`;

    setTimeout(function () {
        star.className = 'star grow';
    }, 0);
    setTimeout(function () {
        star.className = 'star fade';
    }, halfPeriod);
    setTimeout(function () {
        this.runStar(star);
    }.bind(this), duration);

};