// config defaults
let cameraConfig = {
	ip: '192.168.0.190',
	flip: 0,
	mirror: 0,
	invertcontrols: 0,
	panspeed: 8,
	zoomspeed: 5,
	tiltspeed: 8,
	focusspeed: 5,
	autopaninterval: 30,
};

let baseURL = "http://" + cameraConfig.ip + "/cgi-bin";
let activePreset;
let arrowKeys = ['up', 'down', 'left', 'right', 'esc'];
let numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
let sliderKeys = ['q', 'a', 'w', 's'];

let keyActions = {
	up: function () {
		(cameraConfig.invertcontrols == 0) ? camPanTilt(1, 'up') : camPanTilt(1, 'down');
	},
	down: function () {
		(cameraConfig.invertcontrols == 0) ? camPanTilt(1, 'down') : camPanTilt(1, 'up');
	},
	left: function () {
		(cameraConfig.invertcontrols == 0) ? camPanTilt(1, 'left') : camPanTilt(1, 'right');
	},
	right: function () {
		(cameraConfig.invertcontrols == 0) ? camPanTilt(1, 'right') : camPanTilt(1, 'left');
	},
	esc: function () {
		if (document.title == 'PTZ-Optics - Main') {
			camPanTilt(1, 'home');
			console.log('Reset pantilt');
		} else {
			transition('none', '../../index.html')
		}
	}
};

function handleKeyEvent(eventType, pressedKey) {
	if (eventType === 'keydown') {
		if (pressedKey == 'esc') {
			$(`#esc`).addClass('pressed')
			keyActions.esc();
		} else {
			$(`#${pressedKey}`).addClass('pressed')
			keyActions[pressedKey]();
		}
	} else if (eventType === 'keyup') {
		$(`#${pressedKey}`).removeClass('pressed')
		console.log(`Stopped Panning`);
		camPanTilt(1, 'ptzstop');
	}
}

//Creating keybinds
function createKeybinds() {
	//Keybinds for controlling the camera with the arrow keys
	Mousetrap.bind(arrowKeys, function (e, currentKey) {
		if (e.repeat) return;
		handleKeyEvent('keydown', currentKey);
	}, 'keydown');

	Mousetrap.bind(arrowKeys, function (e, currentKey) {
		handleKeyEvent('keyup', currentKey);
	}, 'keyup');

	//Keybinds for calling presets with number keys
	Mousetrap.bind(numKeys, function (e, currentKey) {
		$(`#pst${currentKey}`).focus();
		activePreset = $(`#pst${currentKey}`).html();

		presetGetSet(1, currentKey, 'poscall');
		console.log(`Called preset ${currentKey}`);
		$('#presetTitle1').html(`${Cookies.get(activePreset)}`);
	});

	//Keybinds for zooming and focusing with q,a,w,s
	Mousetrap.bind(sliderKeys, function (e, currentKey) {
		if (e.repeat) return;
		e.preventDefault();

		switch (currentKey) {
			case 'q':
				$('#zoomSlider').val(100);
				camZoom(1, 'zoomin');
				break;
			case 'a':
				$('#zoomSlider').val(0);
				camZoom(1, 'zoomout');
				break;
			case 'w':
				$('#focusSlider').val(100);
				camZoom(1, 'focusin');
				break;
			case 's':
				$('#focusSlider').val(0);
				camZoom(1, 'focusout');
				break;
		}
	}, 'keydown');

	Mousetrap.bind(sliderKeys, function (e, currentKey) {
		e.preventDefault();
		switch (currentKey) {
			case 'q':
			case 'a':
				$('#zoomSlider').val(50);
				break;
			case 'w':
			case 's':
				$('#focusSlider').val(50);
				break;
		}
		camPanTilt(1, 'ptzstop');
	}, 'keyup');
}

// setup all the initial configuration and standard settings
function sendConfig() {
	cameraConfig = configLocalStorage('get');

	// set the initial IP value for the camera ip input
	$("#ip").val(cameraConfig.ip);
	baseURL = "http://" + cameraConfig.ip + "/cgi-bin";

	//set the camera's initial configuration for each value in the saved config object
	for (const [key, value] of Object.entries(cameraConfig)) {
		if (key.includes('interval') || key.includes('speed') || key.includes('ip')) {
			continue;
		}
		sendAjaxRequest(baseURL + "/param.cgi?post_image_value&" + key + "&" + value);
	}
	updateSettingsLabels();
	console.log(cameraConfig);
}

//Retrieve and set camera config to and from local storage
function configLocalStorage(action) {
	if (action === 'get') {
		let retrievedConfig = localStorage.getItem('configStorage');
		if (!retrievedConfig) {
			return cameraConfig;
		} else {
			return JSON.parse(retrievedConfig);
		}
	} else if (action === 'set') {
		localStorage.setItem('configStorage', JSON.stringify(cameraConfig));
		sendConfig();
	}
}

//Update values of settings buttons to match current camera config
function updateSettingsLabels() {
	for (const [key, value] of Object.entries(cameraConfig)) {
		if (key.includes('speed') || key.includes('interval') || key == 'ip') {
			$(`#${key}`).val(value)
		} else {
			switch (value) {
				case 0:
					$(`#${key}`).html(`${key} - No`);
					break;
				case 1:
					$(`#${key}`).html(`${key} - Yes`);
					break;
			}
		}
	}
}

// Function to adjust camera settings based on the provided action
function toggleSetting(action) {
	// Check the value of action and update the URL and config values accordingly
	switch (action) {
		case 'flip':
			cameraConfig.flip = (cameraConfig.flip === 0) ? 1 : 0;
			break;
		case 'mirror':
			cameraConfig.mirror = (cameraConfig.mirror === 0) ? 1 : 0;
			break;
		case 'invertcontrols':
			cameraConfig.invertcontrols = (cameraConfig.invertcontrols === 0) ? 1 : 0;
			break;
	}

	// Save the updated config and update the labels
	configLocalStorage('set');
	updateSettingsLabels();
}

//Send HTTP-GET request to the correct url on the camera
function sendAjaxRequest(action_url) {
	$.ajax({
		url: action_url,
		type: 'GET',
		headers: { 'Access-Control-Allow-Origin': `http://${cameraConfig.ip}/` },
	})
		.done(function () {
			// console.log("success");
		})
		.fail(function () {
			console.log(`error fetching ${action_url}`);
		})
		.always(function () {
			// console.log("complete");
		});
}

// function to reload camera IP address
function refreshCameraIP() {
	// get the value of the camera IP address input field
	cameraConfig.ip = $('#ip').val();
	configLocalStorage('set');
}

// Function to control the camera's pan and tilt action
function camPanTilt(camera, direction) {
	// Build the URL for the camera control action, including the direction and pan/tilt speed
	const loc = `${baseURL}/ptzctrl.cgi?ptzcmd&${direction}&${cameraConfig.panspeed}&${cameraConfig.tiltspeed}`;
	// Run the action to move the camera
	sendAjaxRequest(loc);

	if (direction == 'ptzstop') {
		return;
	}
	console.log(`Panning ${direction}`);
}

// Function to control the camera zoom
function camZoom(camera, action) {
	// Build the URL for the camera control action, including the zoom speed
	const loc = `${baseURL}/ptzctrl.cgi?ptzcmd&${action}&${cameraConfig.zoomspeed}`;
	// Run the action to zoom the camera
	sendAjaxRequest(loc);
}

// Function to control the camera focus
function camFocus(camera, action) {
	// Build the URL for the camera control action, including the focus speed
	const loc = `${baseURL}/ptzctrl.cgi?ptzcmd&${action}&${cameraConfig.focusspeed}`;
	// Run the action to focus the camera
	sendAjaxRequest(loc);
}

// Function to control the camera preset
function presetGetSet(camera, positionnum, action) {
	// Build the URL for the camera control action, including the position number
	const loc = `${baseURL}/ptzctrl.cgi?ptzcmd&${action}&${positionnum}`;
	// Run the action to set the camera preset
	sendAjaxRequest(loc);
}

function transition(direction, targetURL) {
	switch (direction) {
		case 'left':
			$('#wrapper').addClass('activeRightTransition');
			break;
		case 'right':
			$('#wrapper').addClass('activeLeftTransition');
			break;
		case 'none':
			$('#wrapper').addClass('transition');
	}
	setTimeout(function () {
		window.location = targetURL
	}, 500)
}

$(document).ready(function () {
	sendConfig();
	createKeybinds();

	$(`.ptzButton`).on('mousedown', function (e) {

		$(this).addClass('pressed');
		if ($(this).attr('id') === 'esc') {
			camPanTilt(1, 'home');
			console.log('Reset pantilt');
		}
		else {
			camPanTilt(1, $(this).attr('id'));
			console.log(`Panned ${$(this).attr('id')}`);
		}
		$(`.ptzButton`).on('mouseup', function (e) {

			$(this).removeClass('pressed');
			camPanTilt(1, 'ptzstop');
			console.log(`Stopped Panning`);
		});
	});

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

	$('.presetButton').click(function (e) {
		activePreset = $(this).html();
		presetGetSet(1, activePreset, 'poscall');
		console.log(`Called preset ${activePreset}`);
		$('#camTitle').html(`Active Preset: ${Cookies.get(`${activePreset}`)}`);
	});

	$('.presetButton').on('mouseover', function (e) {
		let presetNumber = $(this).html();
		$('#presetPreview').attr('src', `${presetNumber}.jpg`);
		$('#presetTitle1').html(`${Cookies.get(`${presetNumber}`)}`);
		$('.presetButton').on('mouseout', function (e) {
			let presetNumber = activePreset;
			if (typeof activePreset == 'undefined') {
				$('#presetTitle1').html(`Presets`);
			}
			else {
				$('#presetTitle1').html(`${Cookies.get(`${presetNumber}`)}`);
			}
		});
	});


	$('.asgnBtn').click(function (e) {
		pstNum = $(this).val();
		if (pstNum < 11) {
			presetGetSet(1, pstNum, 'posset');
			console.log(`Set preset ${pstNum}`);
		}
		else {
			presetGetSet(1, 11, 'posset');
			console.log('Set autopan start position');
		};
		let presetName = prompt('Enter a name for the preset:');
		Cookies.set(`${pstNum}`, `${presetName}`, { expires: 1000 });
	});


	$('body').on('click', '#panBtn', function (e) {
		e.preventDefault();
		$(this).toggleClass('pressed');
		camPanTilt(1, "ptzstop");
		if (autopanning == false) {
			autopan();
			$(this).addClass('active');
		} else {

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
		var action = $(this).attr('id').toLowerCase();
		toggleSetting(action);
		return false;
	});

	$('body').on('change', 'select', function (e) {
		e.preventDefault();
		var action = $(this).attr('id').toLowerCase();
		cameraConfig[action] = parseInt($(this).val());
		configLocalStorage('set');
		return false;
	});

	$('#reloadcamera').on('mousedown', function (e) {
		refreshCameraIP();
	})
})

// Check if the theme cookie exists
if (!Cookies.get('theme')) {
	// Set the default theme to dark
	Cookies.set('theme', 'dark', { expires: 1000 })
}

document.documentElement.setAttribute('data-theme', Cookies.get('theme'));