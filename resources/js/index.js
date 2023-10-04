let camera_ip = "192.168.0.190";
let base_url = "http://" + camera_ip + "/cgi-bin";

// config defaults
let defaults = {
	ip: camera_ip,
	flip: 0,
	mirror: 0,
	invertcontrols: 0,
	infinitypt: 0,
	infinityzoom: 0,
	infinityfocus: 0,
	panspeed: 8,
	zoomspeed: 5,
	tiltspeed: 8,
	focusspeed: 5,
	autopaninterval: 30,
};

let variables = {
	arrowKeys: ['up', 'down', 'left', 'right', 'esc'],
	numKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
	sliderKeys: ['w', 's', 'q', 'a'],
	sliderClasses: ['.zoom.plus', '.zoom.minus', '.focus.plus', '.focus.minus'],
	slideKeyNums: [1000, 0, 1000, 0],
	actions: {
		up: function () {
			stop_autopan();
			cam_pantilt(1, 'up');
			console.log(`Panned up`);
		},
		down: function () {
			stop_autopan();
			cam_pantilt(1, 'down');
			console.log(`Panned down`);
		},
		left: function () {
			stop_autopan();
			cam_pantilt(1, 'left');
			console.log(`Panned left`);
		},
		right: function () {
			stop_autopan();
			cam_pantilt(1, 'right');
			console.log(`Panned right`);
		},
		esc: function () {
			if (document.title == 'PTZ-Optics - Main') {
				stop_autopan();
				cam_pantilt(1, 'home');
				console.log('Reset pantilt');
			}
			else {
				document.getElementById('closeLink').click();
			}
		}
	}
};

let config = defaults;

let activePreset;

function delay(URL) {
	document.getElementById('wrapper').classList.add('transition');
	setTimeout(function () {
		window.location = URL
	}, 500);
}

function transLeft(URL) {
	document.getElementById('wrapper').classList.add('activeRightTransition');
	setTimeout(function () {
		window.location = URL
	}, 500);
}

function transRight(URL) {
	document.getElementById('wrapper').classList.add('activeLeftTransition');
	setTimeout(function () {
		window.location = URL
	}, 500);
}


let alreadyPanning = false;

function handleKeyEvent(eventType, x) {
	if (eventType === 'keydown') {
		if (x === 'esc') {
			$(`#esc`).addClass('pressed')
			variables.actions.esc();
		} else {
			$(`#${x}`).addClass('pressed')
			variables.actions[x]();
		} up
	} else if (eventType === 'keyup') {
		$(`#${x}`).removeClass('pressed')
		cam_pantilt(1, 'ptzstop');
	}
}

function keybinds() {

	variables.arrowKeys.forEach(function (x) {
		Mousetrap.bind(x, function (e) {
			if (e.repeat) return;
			handleKeyEvent('keydown', x);
		}, 'keydown');

		Mousetrap.bind(x, function (e) {
			handleKeyEvent('keyup', x);
		}, 'keyup');

		$(`#${x}`).on('mousedown', function (e) {
			stop_autopan();
			if (x === 'esc') {
				cam_pantilt(1, 'home');
				console.log('Reset pantilt');
			}
			else {
				cam_pantilt(1, x);
				console.log(`Panned ${x}`);
			}
		});

		$(`#${x}`).on('mouseup', function (e) {
			stop_autopan();
			cam_pantilt(1, 'ptzstop');
			console.log(`Stopped Panning`);
		});
	});

	variables.numKeys.forEach(function (x) {
		Mousetrap.bind(x, function (e) {
			$(`#pst${x}`).focus();
			activePreset = $(`#pst${x}`).html();

			stop_autopan();
			cam_preset(1, x, 'poscall');

			console.log(`Called preset ${x}`);
			$('#camTitle').html(`Active Preset: ${activePreset}`);
		});
	});

	variables.sliderKeys.forEach(function (x, i) {
		Mousetrap.bind(x, function (e) {
			if (e.repeat) return;
			e.preventDefault();
			stop_autopan();
			if (x == 'q') {
				lerp(1000, '#zoomSlider', 'up');
				cam_zoom(1, 'zoomin');
			}
			else if (x == 'a') {
				lerp(0, '#zoomSlider', 'down');
				cam_zoom(1, 'zoomout');
			}
			else if (x == 'w') {
				lerp(1000, '#focusSlider', 'up');
				cam_zoom(1, 'focusin');
			}
			else if (x == 's') {
				lerp(0, '#focusSlider', 'down');
				cam_zoom(1, 'focusout');
			}
		}, 'keydown');
		Mousetrap.bind(x, function (e) {
			stop_autopan();
			e.preventDefault();
			if (x == 'q') {
				lerpCancelled = true;
				lerp(500, '#zoomSlider', 'down');
			}
			else if (x == 'a') {
				lerpCancelled = true;
				lerp(500, '#zoomSlider', 'up');
			}
			else if (x == 'w') {
				lerp(500, '#focusSlider', 'down');
			}
			else if (x == 's') {
				lerp(500, '#focusSlider', 'up');
			}
			cam_zoom(1, 'zoomstop');
		}, 'keyup');
	});

	variables.sliderClasses.forEach(function (x, i) {
		let split = x.split('.');
		$('body').on('mousedown', `.${split[1]}.plus`, function (e) {
			if (x === '.zoom.plus') {
				cam_zoom(1, `${split[1]}in`);
				console.log(`${split[1]}ing in`);
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				else if (!lerping) {
					lerp(1000, '#zoomSlider', 'up');
				}
			}
			else if (x === '.focus.plus') {
				cam_focus(1, `${split[1]}in`);
				console.log(`${split[1]}ing in`);
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				else if (!lerping) {
					lerp(1000, '#focusSlider', 'up');
				}
			};
		});

		$('body').on('mouseup', `.${split[1]}.plus`, function (e) {
			if (x === '.zoom.plus') {
				cam_zoom(1, 'zoomstop');
				console.log('stopped');
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				else if (!lerping) {
					lerp(500, '#zoomSlider', 'down');
				}
			}
			else if (x === '.focus.plus') {
				cam_focus(1, 'focusstop');
				console.log('stopped');
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				else if (!lerping) {
					lerp(500, '#focusSlider', 'down');
				}
			};
		});

		$('body').on('mousedown', `.${split[1]}.minus`, function (e) {
			if (x === '.zoom.minus') {
				cam_zoom(1, `${split[1]}out`);
				console.log(`${split[1]}ing out`);
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				else if (!lerping) {
					lerp(1, '#zoomSlider', 'down');
				}
			}
			else if (x === '.focus.minus') {
				cam_focus(1, `${split[1]}out`);
				console.log(`${split[1]}ing out`);
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				else if (!lerping) {
					lerp(1, '#focusSlider', 'down');
				}
			};
		});

		$('body').on('mouseup', `.${split[1]}.minus`, function (e) {
			if (x === '.zoom.minus') {
				cam_zoom(1, 'zoomstop');
				console.log('stopped');
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				if (!lerping) {
					lerp(500, '#zoomSlider', 'up');
				}
			}
			else if (x === '.focus.minus') {
				cam_focus(1, 'focusstop');
				console.log('stopped');
				if (lerping) {
					console.log("Error: Already Lerping");
					return;
				}
				else if (!lerping) {
					lerp(500, '#focusSlider', 'up');
				}
			};
		});
	});
}

let lerping = false;
let lerpCancelled = false;

const timer = ms => new Promise(res => setTimeout(res, ms));

async function lerp(targetValue, sliderClass, lerpFunction) {
	let currentValue = Number($(sliderClass).val());
	lerping = true;
	lerpCancelled = false;

	// Start the lerp process
	while (lerping) {
		if (lerpFunction === "up") {
			// Lerp up
			if (currentValue < targetValue) {
				if (currentValue < targetValue - 0.8) {
					let lerpValue = (targetValue - currentValue) / 10;
					currentValue += lerpValue;
					$(sliderClass).val(currentValue);
				} else {
					currentValue = targetValue;
				}
			} else {
				lerping = false;
			}
		} else if (lerpFunction === "down") {
			// Lerp down
			if (currentValue > targetValue) {
				if (currentValue > targetValue + 0.8) {
					let lerpValue = (targetValue - currentValue) / 10;
					currentValue += lerpValue;
					$(sliderClass).val(currentValue);
				} else {
					currentValue = targetValue;
				}
			} else {
				lerping = false;
			}
		}

		// Check if the lerp action has been cancelled
		if (lerpCancelled) {
			$(sliderClass).val(currentValue);
			lerping = false;
		}
		await timer(5);
	}
}

// Function to cancel the current lerp action
function cancelLerp() {
	lerpCancelled = true;
}



function get_config() {
	let result = localStorage.getItem('configStorage');
	if (!result) {
		return config;
	} else {
		return JSON.parse(result);
	}
}

function save_config() {
	localStorage.setItem('configStorage', JSON.stringify(config));
	console.log(config);
}

function run_action(action_url) {
	// $.get(url);
	$.ajax({
		url: action_url,
		type: 'GET',
		headers: { 'Access-Control-Allow-Origin': `http://${camera_ip}/` },
	})
		.done(function () {
			// console.log("success");
		})
		.fail(function (jqXHR, responseText, errorThrown) {
			console.log(`error fetching ${action_url}`);
		})
		.always(function () {
			// console.log("complete");
		});
}

// setup all the initial configuration and standard settings
function config_init() {

	config = get_config();
	console.log(config);

	// set the initial IP value for the camera ip input
	$("#cameraIP").val(config.ip);
	base_url = "http://" + config.ip + "/cgi-bin";

	// set the camera's initial configuration for each value in the saved config object
	config_setting("flip", config.flip);
	config_setting("mirror", config.mirror);
	config_setting("invertcontrols", config.invertcontrols);
	config_setting("infinitypt", config.infinitypt);
	config_setting("infinityzoom", config.infinityzoom);
	config_setting("infinityfocus", config.infinityfocus);

	// set the initial values for each select dropdown
	$("#panSpeed").val(config.panspeed);
	$("#zoomSpeed").val(config.zoomspeed);
	$("#tiltSpeed").val(config.tiltspeed);
	$("#focusSpeed").val(config.focusspeed);
	$("#panInterval").val(config.autopaninterval);

	// save_config();

	if (config.infinitypt == 1) {
		$('#infPT').html('Infinity Pan/Tilt - Yes');
	} else {
		$('#infPT').html('Infinity Pan/Tilt - No');
	}

	if (config.infinityzoom == 1) {
		$('#cam_zoom_infinity').show();
		$('#cam_zoom_standard').hide();
	} else {
		$('#cam_zoom_infinity').hide();
		$('#cam_zoom_standard').show();
	}

	if (config.infinityfocus == 1) {
		$('#cam_focus_infinity').show();
		$('#cam_focus_standard').hide();
	} else {
		$('#cam_focus_infinity').hide();
		$('#cam_focus_standard').show();
	}

	update_labels();
}

function config_setting(action, value) {
	let loc = base_url + "/param.cgi?post_image_value&" + action + "&" + value;
	run_action(loc);
}

function update_labels() {

	switch (config.flip) {
		case 0:
			$('#flip').html("Flip - No");
			break;
		case 1:
			$('#flip').html("Flip - Yes");
			break;
	}

	switch (config.mirror) {
		case 0:
			$('#mirror').html("Mirror - No");
			break;
		case 1:
			$('#mirror').html("Mirror - Yes");
			break;
	}

	switch (config.invertcontrols) {
		case 0:
			$('#invertcontrols').html("Invert Controls - No");
			break;
		case 1:
			$('#invertcontrols').html("Invert Controls - Yes");
			break;
	}

	switch (config.infinitypt) {
		case 0:
			$('#infinitypt').html("Infinity Pan/Tilt-No");
			break;
		case 1:
			$('#infinitypt').html("Infinity Pan/Tilt-Yes");
			break;
	}

	switch (config.infinityzoom) {
		case 0:
			$('#infinityzoom').html("Infinity Zoom-No");
			break;
		case 1:
			$('#infinityzoom').html("Infinity Zoom-Yes");
			break;
	}

	switch (config.infinityfocus) {
		case 0:
			$('#infinityfocus').html("Infinity Focus-No");
			break;
		case 1:
			$('#infinityfocus').html("Infinity Focus-Yes");
			break;
	}

	config.ip = $('#cameraIP').val();
}

// function to reload camera IP address
function reload_cam() {
	// get the value of the camera IP address input field
	config['ip'] = $('#cameraIP').val();

	save_config();
	update_labels();
}


// Function to adjust camera settings based on the provided action
function adjust_setting(action) {
	// Variables to store the URL for flip and mirror actions
	let flipUrl, mirrorUrl;

	// Check the value of action and update the URL and config values accordingly
	switch (action) {
		case 'flip':
			flipUrl = (config.flip === 0) ? base_url + "/param.cgi?post_image_value&flip&1" : base_url + "/param.cgi?post_image_value&flip&0";
			run_action(flipUrl);
			config.flip = (config.flip === 0) ? 1 : 0;
			break;
		case 'mirror':
			mirrorUrl = (config.mirror === 0) ? base_url + "/param.cgi?post_image_value&mirror&1" : base_url + "/param.cgi?post_image_value&mirror&0";
			run_action(mirrorUrl);
			config.mirror = (config.mirror === 0) ? 1 : 0;
			break;
		case 'invertcontrols':
			config.invertcontrols = (config.invertcontrols === 0) ? 1 : 0;
			break;
		case 'infinitypt':
			config.infinitypt = (config.infinitypt === 0) ? 1 : 0;
			$('#pt_infinity').toggle();
			break;
		case 'infinityzoom':
			config.infinityzoom = (config.infinityzoom === 0) ? 1 : 0;
			$('#cam_zoom_infinity').toggle();
			$('#cam_zoom_standard').toggle();
			break;
		case 'infinityfocus':
			config.infinityfocus = (config.infinityfocus === 0) ? 1 : 0;
			$('#cam_focus_infinity').toggle();
			$('#cam_focus_standard').toggle();
			break;
	}

	// Save the updated config and update the labels
	save_config();
	update_labels();
}


// used for loading existing settings
function update_settings() {
	// Check the value of `config.flip` and call `run_action` with the appropriate URL
	if (config.flip === 0) {
		run_action(`${base_url}/param.cgi?post_image_value&flip&0`);
	} else if (config.flip === 1) {
		run_action(`${base_url}/param.cgi?post_image_value&flip&1`);
	}

	// Check the value of `config.mirror` and call `run_action` with the appropriate URL
	if (config.mirror === 0) {
		run_action(`${base_url}/param.cgi?post_image_value&mirror&0`);
	} else if (config.mirror === 1) {
		run_action(`${base_url}/param.cgi?post_image_value&mirror&1`);
	}

	// Check the value of `config.infinitypt` and hide/show the `#pt_infinity` element
	if (config.infinitypt === 0) {
		$('#pt_infinity').hide();
	} else if (config.infinitypt === 1) {
		$('#pt_infinity').show();
	}

	// Check the value of `config.infinityzoom` and hide/show the `#cam_zoom_infinity` and `#cam_zoom_standard` elements
	if (config.infinityzoom === 0) {
		$('#cam_zoom_infinity').hide();
		$('#cam_zoom_standard').show();
	} else if (config.infinityzoom === 1) {
		$('#cam_zoom_infinity').show();
		$('#cam_zoom_standard').hide();
	}

	// Check the value of `config.infinityfocus` and hide/show the `#cam_focus_infinity` and `#cam_focus_standard` elements
	if (config.infinityfocus === 1) {
		$('#cam_focus_infinity').hide();
		$('#cam_focus_standard').show();
	} else if (config.infinityfocus === 0) {
		$('#cam_focus_infinity').show();
		$('#cam_focus_standard').hide();
	}

	update_labels();
}

// Function to control the camera's pan and tilt action
// Function to control the camera pan/tilt
function cam_pantilt(camera, action) {
	// Get the direction to move the camera
	const direction = getDirection(action);

	// Build the URL for the camera control action, including the direction and pan/tilt speed
	const loc = `${base_url}/ptzctrl.cgi?ptzcmd&${direction}&${config.panspeed}&${config.tiltspeed}`;

	// Run the action to move the camera
	run_action(loc);
}

// Helper function to get the direction based on the action and the inversion setting
function getDirection(action) {
	if (config.invertcontrols === "1") {
		switch (action) {
			// If the action is 'left', return 'right'
			case 'left':
				return 'right';
			// If the action is 'right', return 'left'
			case 'right':
				return 'left';
			// If the action is 'up', return 'down'
			case 'up':
				return 'down';
			// If the action is 'down', return 'up'
			case 'down':
				return 'up';
			// For any other action, return the action
			default:
				return action;
		}
	}
	// Return the original action if the inversion setting is not set
	return action;
}

// Function to control the camera zoom
function cam_zoom(camera, action) {
	// Build the URL for the camera control action, including the zoom speed
	const loc = `${base_url}/ptzctrl.cgi?ptzcmd&${action}&${config.zoomspeed}`;

	// Run the action to zoom the camera
	run_action(loc);
}

// Function to control the camera focus
function cam_focus(camera, action) {
	// Build the URL for the camera control action, including the focus speed
	const loc = `${base_url}/ptzctrl.cgi?ptzcmd&${action}&${config.focusspeed}`;

	// Run the action to focus the camera
	run_action(loc);
}

// Function to control the camera preset
function cam_preset(camera, positionnum, action) {
	// Build the URL for the camera control action, including the position number
	const loc = `${base_url}/ptzctrl.cgi?ptzcmd&${action}&${positionnum}`;

	// Run the action to set the camera preset
	run_action(loc);
}

let autoInterval;
let panInterval;
let panning;
let autopanning = false;

function autopan() {

	var seconds = config.autopaninterval;
	autopanning = true;

	// preset 11 is the autopan start preset
	cam_preset(1, 11, 'poscall');

	// wait 1 second before starting the pan
	// this should give the camera enough time to pan to start position
	setTimeout(function () {

		console.log("start panning right");
		pan('right');

		autoInterval = setInterval(function () {

			if (panning == 'left') {

				clearInterval(panInterval);
				console.log("start panning right");
				pan('right');

			} else if (panning == 'right') {

				clearInterval(panInterval);
				console.log("start panning left");
				pan('left');
			}

		}, seconds * 1000);

	}, 1000);
}

function pan(direction) {

	var panspeed = 10;
	var tiltspeed = 10;

	panInterval = setInterval(function () {

		if (direction == 'left') {

			panning = 'left';

			if (config.invertcontrols == "1") {
				var loc = base_url + "/ptzctrl.cgi?ptzcmd&right&" + panspeed + "&" + tiltspeed;
			} else {
				var loc = base_url + "/ptzctrl.cgi?ptzcmd&left&" + panspeed + "&" + tiltspeed;
			}
			console.log("...pan left");

		} else if (direction == 'right') {

			panning = 'right';

			if (config.invertcontrols == "1") {
				var loc = base_url + "/ptzctrl.cgi?ptzcmd&left&" + panspeed + "&" + tiltspeed;
			} else {
				var loc = base_url + "/ptzctrl.cgi?ptzcmd&right&" + panspeed + "&" + tiltspeed;
			}
			console.log("...pan right");
		}
		run_action(loc);

	}, 1000);
}

function stop_autopan() {
	if (autoInterval) {
		clearInterval(autoInterval);
	}
	if (panInterval) {
		clearInterval(panInterval);
	}
	autopanning = false;
	$('#panBtn').removeClass('pressed');
	cam_pantilt(1, "ptzstop");
	$('.autopan').removeClass('active');
}

function forceDownload(url, fileName) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.responseType = "blob";
	xhr.onload = function () {
		var urlCreator = window.URL || window.webkitURL;
		var imageUrl = urlCreator.createObjectURL(this.response);
		var tag = document.createElement('a');
		tag.href = imageUrl;
		tag.download = fileName;
		document.body.appendChild(tag);
		tag.click();
		document.body.removeChild(tag);
	}
	xhr.send();
}

$(document).ready(function () {
	config_init();
	keybinds();

	// Add a click event listener to the toggle button
	$('#themeToggle').click(function () {
		// Get the current theme from the cookie
		var currentTheme = Cookies.get('theme');

		// If the current theme is light, set the theme to dark
		if (currentTheme === 'light') {
			Cookies.set('theme', 'dark', { expires: 1000 });
		}
		// If the current theme is dark, set the theme to light
		else if (currentTheme === 'dark') {
			Cookies.set('theme', 'light', { expires: 1000 });
		}

		// Set the data-theme attribute on the document element to the current theme
		document.documentElement.setAttribute('data-theme', Cookies.get('theme'));
	});

	$('#parent-element').on('mousedown', function (e) {
		let x = e.target.id;
		if (variables.arrowKeys.includes(x)) {
			variables.actions[x]();
		}
	});

	$('#parent-element').on('mouseup', function (e) {
		cam_pantilt(1, 'ptzstop');
		console.log(`Stopped Panning`);
	});

	$('#rightLink').on('mouseover', function () {
		$('#wrapper').addClass('rightTransition');
	})

	$('#rightLink').on('mouseout', function () {
		$('#wrapper').removeClass('rightTransition');
	})

	$('#leftLink').on('mouseover', function () {
		$('#wrapper').addClass('leftTransition');
	})

	$('#leftLink').on('mouseout', function () {
		$('#wrapper').removeClass('leftTransition');
	})

	$('.btn').click(function (e) {
		activePreset = $(this).html();

		stop_autopan();
		cam_preset(1, activePreset, 'poscall');

		console.log(`Called preset ${activePreset}`);
		$('#camTitle').html(`Active Preset: ${Cookies.get(`${activePreset}`)}`);
	});

	$('.btn').on('mouseout', function (e) {
		let i = activePreset;
		if (typeof activePreset == 'undefined') {
			$('#camTitle').html(`Active Preset: No Preset Active`);
		}
		else {
			$('#camTitle').html(`Active Preset: ${Cookies.get(`${i}`)}`);
		}
		$('#presetTitle1').html(`Presets`);
	});

	$('.btn').on('mouseover', function (e) {
		let i = $(this).html();
		$('#presetPreview').attr('src', `${i}.jpg`);
		$('#presetTitle1').html(`${Cookies.get(`${i}`)}`);
	});

	$('#infoLink').click(function (e) {
		$('#about').toggleClass('show');
	});

	$('.asgnBtn').click(function (e) {
		pstNum = $(this).val();
		if (pstNum < 11) {
			cam_preset(1, pstNum, 'posset');
			console.log(`Set preset ${pstNum}`);
		}
		else {
			cam_preset(1, 11, 'posset');
			console.log('Set autopan start position');
		};
		let presetName = prompt('Enter a name for the preset:');
		Cookies.set(`${pstNum}`, `${presetName}`, { expires: 1000 });
	});


	$('body').on('click', '#panBtn', function (e) {
		e.preventDefault();
		$(this).toggleClass('pressed');
		cam_pantilt(1, "ptzstop");

		if (autopanning == false) {
			autopan();
			$(this).addClass('active');
		} else {
			stop_autopan();
		}
		return false;
	});

	$('#clearBtn').click(function (e) {
		e.preventDefault();
		if (confirm("Are you sure you want to delete all presets (This cannot be undone!)")) {
			console.log("deleted");
		} else {
			console.log("canceled");
		}
	});

	$('body').on('click', '.adjust_setting', function (e) {
		e.preventDefault();
		var action = this.id
		adjust_setting(action);
		return false;
	});

	$('body').on('change', 'select', function (e) {
		e.preventDefault();
		var action = $(this).attr('id').toLowerCase();
		config[action] = parseInt($(this).val());
		save_config();
		return false;
	});
})

// Check if the theme cookie exists
if (!Cookies.get('theme')) {
	// Set the default theme to light
	Cookies.set('theme', 'light', { expires: 1000 })
}

document.documentElement.setAttribute('data-theme', Cookies.get('theme'));