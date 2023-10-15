// Deafaults for camera config
let cameraConfig = {
	ip: '192.168.0.190',
	flip: 0,
	mirror: 0,
	invertcontrols: 0,
	panspeed: 8,
	zoomspeed: 5,
	tiltspeed: 8,
	focusspeed: 5,
};

let baseURL = "http://" + cameraConfig.ip + "/cgi-bin";
let activePreset;
let arrowKeys = ['up', 'down', 'left', 'right', 'esc'];
let numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
let sliderKeys = ['q', 'a', 'w', 's'];

//Dictionary of functions for arrow keys
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

//Execute the 'keyActions' function associated with the currently pressed key
function handleKeyEvent(eventType, pressedKey) {
	if (eventType === 'keydown') {
		if (pressedKey == 'esc') {
			$(`#esc`).addClass('activeButton')
			keyActions.esc();
		} else {
			$(`#${pressedKey}`).addClass('activeButton');
			keyActions[pressedKey]();
		}
	} else if (eventType === 'keyup') {
		$(`#${pressedKey}`).removeClass('activeButton');
		console.log(`Stopped Panning`);
		camPanTilt(1, 'ptzstop');
	}
}

//Create keybinds
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
		$(`#pst${currentKey}`).addClass('activeButton');
		$(`:not(#pst${currentKey})`).removeClass('activeButton');

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
				camZoom(1, 'zoomstop');
				break;
			case 'w':
			case 's':
				$('#focusSlider').val(50);
				camFocus(1, 'focusstop');
				break;
		}
		camPanTilt(1, 'ptzstop');
	}, 'keyup');
}

// Send the current configuration to the camera
function sendConfig() {
	//If there is a camera configuration already in memory, use the settings from that.
	cameraConfig = configLocalStorage('get');

	//Set the value for the 'Camera IP' input
	$("#ip").val(cameraConfig.ip);
	baseURL = "http://" + cameraConfig.ip + "/cgi-bin";

	//Set each parameter of the camera configuration unless it is a speed value or the camera IP (these are stored locally)
	for (const [key, value] of Object.entries(cameraConfig)) {
		if (key.includes('speed') || key == 'ip') {
			continue;
		}
		sendAjaxRequest(baseURL + "/param.cgi?post_image_value&" + key + "&" + value);
	}
	//Update the settings on the "Preferences" page to match that of the current configuration
	updateSettingsLabels();
	console.log(cameraConfig);
}

//Set or retrieve camera config as a localStorage object
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

//Update values of settings buttons to match current camera configuration
function updateSettingsLabels() {
	for (const [key, value] of Object.entries(cameraConfig)) {
		if (key.includes('speed') || key == 'ip') {
			$(`#${key}`).val(value)
		} else {
			switch (value) {
				case 0:
					$(`#${key}`).removeClass('activeButton');
					break;
				case 1:
					$(`#${key}`).addClass('activeButton')
					break;
			}
		}
	}
	if (Cookies.get('theme') == 'dark') {
		$('#themeToggle').addClass('activeButton');
	} else if (Cookies.get('theme') == 'light') {
		$('#themeToggle').removeClass('activeButton');
	}
}

// Toggle the "flip", "mirror" or "invertcontrols" when pressed
function toggleSetting(action) {
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

	// Save the updated config and update the buttons
	configLocalStorage('set');
	updateSettingsLabels();
}

//Send HTTP-GET request to the correct url on the camera
function sendAjaxRequest(action_url) {
	$.ajax({
		url: action_url,
		type: 'GET',
		crossDomain: true,
	})
		.fail(function () {
			console.log(`error fetching ${action_url}`);
		})
}

// Set the ip address of the camera when it is changed in the preferences
function refreshCameraIP() {
	// Get the value of the "Camera IP" input field
	cameraConfig.ip = $('#ip').val();
	configLocalStorage('set');
}

// Control the camera's pan and tilt action
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

// Control the camera zoom
function camZoom(camera, action) {
	// Build the URL for the camera control action, including the zoom speed
	const loc = `${baseURL}/ptzctrl.cgi?ptzcmd&${action}&${cameraConfig.zoomspeed}`;
	// Run the action to zoom the camera
	sendAjaxRequest(loc);
}

// Control the camera focus
function camFocus(camera, action) {
	// Build the URL for the camera control action, including the focus speed
	const loc = `${baseURL}/ptzctrl.cgi?ptzcmd&${action}&${cameraConfig.focusspeed}`;
	// Run the action to focus the camera
	sendAjaxRequest(loc);
}

// Call or set position presets
function presetGetSet(camera, positionnum, action) {
	// Build the URL for the camera control action, including the position number
	const loc = `${baseURL}/ptzctrl.cgi?ptzcmd&${action}&${positionnum}`;
	// Run the action to set the camera preset
	sendAjaxRequest(loc);
}

//Transition effect between pages
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

	//Add click event listeners for ptz control buttons
	$(`.ptzButton`).on('mousedown', function (e) {

		$(this).addClass('activeButton');
		if ($(this).attr('id') === 'esc') {
			camPanTilt(1, 'home');
			console.log('Reset pantilt');
		}
		else {
			camPanTilt(1, $(this).attr('id'));
			console.log(`Panned ${$(this).attr('id')}`);
		}
		$(`.ptzButton`).on('mouseup', function (e) {

			$(this).removeClass('activeButton');
			camPanTilt(1, 'ptzstop');
			console.log(`Stopped Panning`);
		});
	});

	// Add click event listener for theme toggle 
	$('#themeToggle').click(function () {
		// Get the current theme from the cookie
		var currentTheme = Cookies.get('theme');

		// If the current theme is light, set the theme to dark
		if (currentTheme === 'light') {
			Cookies.set('theme', 'dark', { expires: 1000 });
		}
		// And vice versa
		else if (currentTheme === 'dark') {
			Cookies.set('theme', 'light', { expires: 1000 });
		}

		// Set the data-theme attribute on the document element to the current theme
		document.documentElement.setAttribute('data-theme', Cookies.get('theme'));
	});

	//Hover event listeners for left and right chevron buttons
	$('#rightTransitionLink').on('mouseover', function () {
		$('#wrapper').addClass('rightTransition');
		$(this).on('mouseout', function () {
			$('#wrapper').removeClass('rightTransition');
		})
	})

	$('#leftTransitionLink').on('mouseover', function () {
		$('#wrapper').addClass('leftTransition');
		$(this).on('mouseout', function () {
			$('#wrapper').removeClass('leftTransition');
		})
	})

	// Add click event listeners for preset buttons
	$('.presetButton').click(function (e) {
		activePreset = $(this).html();
		presetGetSet(1, activePreset, 'poscall');
		console.log(`Called preset ${activePreset}`);
		$('#camTitle').html(`Active Preset: ${Cookies.get(`${activePreset}`)}`);
		$(this).addClass('activeButton');
		$(`:not(#${$(this).prop('id')})`).removeClass('activeButton');
	});

	// Add hover event listeners for preset buttons
	$('.presetButton').on('mouseover', function (e) {
		let presetNumber = $(this).html();
		$('#presetPreview').attr('src', `${presetNumber}.jpg`);
		$('#presetTitle1').html(`${Cookies.get(`${presetNumber}`)}`);
		if (typeof Cookies.get(`${presetNumber}`) == "undefined") {
			$('#presetTitle1').html(`No Preset`);
		}
		$('.presetButton').on('mouseout', function (e) {
			let presetNumber = $(this).html();
			if (typeof Cookies.get(`${activePreset}`) == "undefined") {
				$('#presetTitle1').html(`Presets`);
			}
			else {
				$('#presetTitle1').html(`${Cookies.get(`${activePreset}`)}`);
			}
		});
	});

	//Add click event listeners for preset assignment buttons
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

	//Add click event listener for preset clear buton
	$('#clearBtn').click(function (e) {
		e.preventDefault();
		if (confirm("Are you sure you want to delete all presets (This cannot be undone!)")) {
			for (const [cookie, value] of Object.entries(Cookies.get())) {
				if (cookie == "theme") {
					return;
				}
				presetGetSet(1, cookie, 'posset');
				Cookies.remove(cookie);
			}
			alert("All presets have been deleted");
		} else {
			console.log("canceled");
		}
	});

	//Add event listeners to detect when preferences are changed
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