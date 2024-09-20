"use strict";

/**
 * Create dimensions from the given values and store them for later use.
 * All values should be positive and make sense.
 * @param {number} width The outer width of the area.
 * @param {number} height The outer height of the area.
 * @param {number} top Margin form the top edge.
 * @param {number} right Margin form the right edge.
 * @param {number} bottom Margin form the bottom edge.
 * @param {number} left Margin form the left edge.
 */
function makeDimension(width, height, top, right, bottom, left) {
	return {width: width,
		height: height,
		innerWidth: width - (left + right),
		innerHeight: height - (top + bottom),
		top: top,
		right: right,
		bottom: bottom,
		left: left,
		cx: (width - (left + right)) / 2 + left,
		cy: (height - (top + bottom)) / 2 + top};
}

// set up dimensions for the plotting.
var testDimension = makeDimension(620, 400, 30, 30, 30, 30);

var MAX_SPEED = 2; // pixel/ms
var elapsed = 0;

const experienceScreen = document.getElementById('experience-screen');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const timer = document.getElementById('timer');
const startText = document.getElementById('start-text');

function rHit(r, rTarget) {
	return ((plotHitsDimension.innerWidth / 2) / rTarget) * r;
};



function v(v) {
	var colour = 'rgb(' + clampInt(0, 255, (v / MAX_SPEED) * 255) + ', 0, 0)';
	return colour;
};


var fittsTest = {
	target: {x: 0, y: 0, r: 10},
	start: {x: 0, y: 0, t: 0},
	last: {},

	isoPositions: [],
	currentPosition: 0,
	currentCount: 0,
	miss: 0,
	isoLimits: {minD: 120, maxD: 300, minW:10 , maxW: 100},
	isoParams: {num: 9, distance: 200, width: 50, randomize: true},

	active: false,

	data: [],

	colour: d3.scale.category10(),

	generateTarget: function() {
		this.target = this.isoPositions[this.currentPosition];
		this.target.distance = this.isoParams.distance;

		var target = testAreaSVG.selectAll('#target').data([this.target]);

		var insert = function(d) {
			d.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; })
			.attr('r', function(d) { return d.w / 2; });
		}

		target.enter()
			.append('circle')
				.attr('id', 'target')
				.style('fill', 'red')
				.call(insert);

		target.transition()
				.call(insert);
	},

	updateISOCircles: function() {
		this.generateISOPositions(this.isoParams.num,
			this.isoParams.distance,
			this.isoParams.width);

		var circles = testAreaSVG.selectAll('circle').data(this.isoPositions);

		var insert = function(d) {
			d.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; })
			.attr('r', function(d) { return d.w / 2; });
		}

		circles.enter()
			.append('circle')
				.attr('class', 'iso')
				.call(insert);

		circles.transition()
			.call(insert);

		circles.exit()
			.transition()
				.attr('r', 0)
				.remove();

		// this.currentPosition = 0;
		this.generateTarget();
	},

	generateISOPositions: function(num, d, w) {
		this.isoPositions = [];

		for (var i = 0; i < num; i++) {
			this.isoPositions[i] = {x: testDimension.cx + ((d/2) * Math.cos((2 * Math.PI * i) / num)),
				y: testDimension.cy + ((d/2) * Math.sin((2 * Math.PI * i) / num)),
				w: w};
		}
	},

	removeTarget: function() {
		// Remove the currently active target
		testAreaSVG.selectAll('#target').data([])
			.exit()
				.remove();
	},

	mouseClicked: function(x, y) {
		if (distance({x: x, y: y}, this.target) < (this.target.w / 2)) {
			if (!this.active) {
				console.log('start active');
				startTimer();
				this.active = true;
			}

			this.currentCount++;
			this.currentPosition = (this.currentPosition + Math.ceil(this.isoPositions.length/2)) % this.isoPositions.length;
			this.removeTarget();
			this.generateTarget();

			if (this.currentCount === 4) {
				this.active = false;
				endExperience();
			}

			if (this.currentPosition === 0) {
				this.advanceParams();
			}

			this.last = {x: x, y: y, t: (new Date).getTime()};
			this.start = this.last;
		}
		else {
			this.miss++;
		}
	},

	mouseMoved: function(x, y) {
		if (this.active) {
			// skip if the mouse did actually not move
			// that should practically never happen...
			if (x == this.last.x && y == this.last.y) {
				return;
			}

			// Skip for the first frame (we dont have last frame)
			if (Object.keys(this.last).length === 0) {
				return;
			}

			var newPoint = {x: x, y: y, t: (new Date).getTime()}

			var dt = newPoint.t - this.last.t;
			var dist = distance(this.last, {x: x, y: y})
			if (dt > 0)
				var speed = dist / dt;
			else
				var speed = 0;

			testAreaSVG.append('line')
				// .attr('class', '')
				.attr('x1', this.last.x)
				.attr('x2', newPoint.x)
				.attr('y1', this.last.y)
				.attr('y2', newPoint.y)
				.style('stroke', v(speed))
				.transition()
					.duration(5000)
					.style('stroke-opacity', 0)
					.remove();

			this.last = newPoint;
		}
	},

	advanceParams: function() {
		this.isoParams.distance = Math.floor(randomAB(this.isoLimits.minD, this.isoLimits.maxD));
		this.isoParams.width = Math.floor(randomAB(this.isoLimits.minW, this.isoLimits.maxW));

		this.updateISOCircles();
	},
};

function randomAB(a, b) {
	return a + Math.random() * (b - a);
}

function mouseMoved()
{
	var m = d3.svg.mouse(this);
	fittsTest.mouseMoved(m[0], m[1])
}

function mouseClicked()
{
	var m = d3.svg.mouse(this);
	fittsTest.mouseClicked(m[0], m[1]);
}

function distance(a, b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function clampInt(lower, upper, x) {
	return Math.min(upper, Math.max(lower, Math.floor(x)));
}

function bgRect(d, dim) {
	return d.append('rect')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('width', dim.width)
		.attr('height', dim.height)
		.attr('class', 'back');
}



var testAreaSVG = d3.select('#test-area').append('svg')
	.attr('width', testDimension.width)
	.attr('height', testDimension.height)
	.style('pointer-events', 'all')
    .on('mousemove', mouseMoved)
	.on('mousedown', mouseClicked)
	.call(bgRect, testDimension);


function startTimer() {
	let startTime = null;
	console.log('start timer');

	function loop(timestamp) {
		if (!startTime)
			startTime = timestamp;

		elapsed = timestamp - startTime;
		timer.innerText = (elapsed / 1000).toFixed(2);
		if (!fittsTest.active) {
			console.log('stop timer');
			return;
		}
		window.requestAnimationFrame(loop);
	}
	window.requestAnimationFrame(loop);
}

function startExperience() {
	startScreen.style.display = "none";
	experienceScreen.style.display = "";

	fittsTest.updateISOCircles();
}

function endExperience() {
	experienceScreen.style.display = "none";
	startScreen.style.display = "";
	startText.innerText = `${(elapsed / 1000).toFixed(2)} seconds`;

	// init code
	fittsTest.currentPosition = 0,
	fittsTest.currentCount = 0,
	fittsTest.miss = 0,
	fittsTest.active = false;
	timer.innerText = "";
	testAreaSVG.selectAll('line').remove();
}


startButton.addEventListener('click', startExperience);
