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

let config = defaults;
config.ip = camera_ip;

let arrowKeys = ['up', 'down', 'left', 'right', 'esc'];
let numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
let sliderKeys = ['w', 's', 'q', 'a'];
let sliderClasses = ['.zoom.plus', '.zoom.minus', '.focus.plus', '.focus.minus'];
let actions = ['flip','mirror','invertcontrols', 'infinitypt', 'infinityzoom','infinityfocus'];
let slideKeyNums = [1000, 0, 1000, 0];
let previewing = true;
let activePreset;

function preview(e) {
	number = $(e).html();
	$('#camTitle').html(`Preset Preview: ${activePreset}`);
	console.log(activePreset);
}

function delay(URL) {
	$('#main').addClass('transition');
	setTimeout(function () {
		window.location = URL
	}, 500);
}

requirejs.config({
	baseUrl: './resources/js',
	paths: {
		jquery: 'jquery-3.6.0',
		mousetrap: 'mousetrap.min',
		jscookie: 'js.cookie'
	}
});

requirejs(['jquery', 'mousetrap', 'jscookie'], function ($, Mousetrap, Cookies) {
	
	activeTheme = 'light';
	
	window.oncontextmenu = function() {
		if (event.button != 2 && !(event.clientX == event.clientY == 1)) {
			event.preventDefault();
		}
	}

	$('#themeToggle').on('click', function(){
		ToggleTheme();
	})
	
	let toggler = document.getElementById('#themeToggle');
	
	toggler.addEventListener('touchstart', function(){
		ToggleTheme();
	})
	
	SetTheme();

	function SetTheme() {
		activeTheme = Cookies.get('theme');
		document.documentElement.setAttribute('data-theme', activeTheme);
		CheckMark();
	}
	
	function ToggleTheme() {
		if (activeTheme == 'light') {
			document.cookie = `theme = dark; expires=Fri, 01 Jan 2100 00:00:00 UTC;`;
		}
		else if (activeTheme == 'dark') {
			document.cookie = `theme = light; expires=Fri, 01 Jan 2100 00:00:00 UTC;`;
		}
		SetTheme();
	}

	function CheckMark() {
		if (activeTheme == 'light') {
			$('#switch').removeClass('switched');
		}
		else if (activeTheme == 'dark') {
			$('#switch').addClass('switched');
		}
	}
	
	let alreadyPanning = false;

	arrowKeys.forEach(function (x) {
		Mousetrap.bind(x, function (e) {
			if(alreadyPanning) {
				return;
			}
			else if (!alreadyPanning) {
				alreadyPanning = true;
				$(`#${x}`).addClass('pressed');
				stop_autopan();
				if (x === 'esc') {
					stop_autopan();
					cam_pantilt(1, 'home');
					console.log('Reset pantilt');
				}
				else {
					stop_autopan();
					cam_pantilt(1, x);
					console.log(`Panned ${x}`);
				}
			}
		}, 'keydown');

		Mousetrap.bind(x, function (e) {
			alreadyPanning = false;
			$(`#${x}`).removeClass('pressed');
			cam_pantilt(1, 'ptzstop');
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

	numKeys.forEach(function (x) {
		Mousetrap.bind(x, function (e) {
			$(`#pst${x}`).focus();
			activePreset = $(`#pst${x}`).html();

			stop_autopan();
			cam_preset(1, x, 'poscall');

			console.log(`Called preset ${x}`);
			$('#camTitle').html(`Active Preset: ${activePreset}`);
		});
	});

	sliderKeys.forEach(function (x, i) {
		Mousetrap.bind(x, function (e) {
			stop_autopan();
			if (x == 'q') {
				lerp(1000, '#zoomSlider', 'up');
				cam_zoom(1, 'zoomin');
			}
			else if (x == 'a') {
				lerp(0, '#zoomSlider', 'down');
				cam_zoom(1, 'zoomout');
			}
		}, 'keydown');
		Mousetrap.bind(x, function (e) {
			stop_autopan();
			if (x == 'q') {
				lerp(500, '#zoomSlider', 'down');
			}
			else if (x == 'a') {
				lerp(500, '#zoomSlider', 'up');
			}
			cam_zoom(1, 'zoomstop');
		}, 'keyup');
	});

	$('.btn').click(function (e) {
		activePreset = $(this).html();

		stop_autopan();
		cam_preset(1, activePreset, 'poscall');

		console.log(`Called preset ${activePreset}`);
		$('#camTitle').html(`Active Preset: ${Cookies.get(`${activePreset}`)}`);
	});
	
	$('.btn').on('mouseout', function(e) {
		let i = activePreset;
		if (typeof activePreset == 'undefined') {
			$('#camTitle').html(`Active Preset: No Preset Active`);
		}
		else {
			$('#camTitle').html(`Active Preset: ${Cookies.get(`${i}`)}`);
		}
		$('#presetTitle1').html(`Presets`);
		previewing = true;
	});

	$('.btn').on('mouseover', function(e) {
		previewing = false;
		let i = $(this).html();
		$('#camTitle').html(`Preset Preview: ${Cookies.get(`${i}`)}`);
		$('#presetTitle1').html(`${Cookies.get(`${i}`)}`);
		// document.getElementById('camFeed').src=`./resources/images/${i}.jpg`;
	});

	sliderClasses.forEach(function (x, i) {
		let split = x.split('.');
		$('body').on('mousedown', `.${split[1]}.plus`, function (e) {
			if (x === '.zoom.plus') {
				cam_zoom(1, `${split[1]}in`);
				console.log(`${split[1]}ing in`);
				lerp(1000, '#zoomSlider', 'up');
			}
			else if (x === '.focus.plus') {
				cam_focus(1, `${split[1]}in`);
				console.log(`${split[1]}ing in`);
				lerp(1000, '#focusSlider', 'up');
			};
		});

		$('body').on('mouseup', `.${split[1]}.plus`, function (e) {
			if (x === '.zoom.plus') {
				cam_zoom(1, 'zoomstop');
				console.log('stopped');
				lerp(500, '#zoomSlider', 'down');
			}
			else if (x === '.focus.plus') {
				cam_focus(1, 'focusstop');
				console.log('stopped');
				lerp(500, '#focusSlider', 'down');
			};
		});

		$('body').on('mousedown', `.${split[1]}.minus`, function (e) {
			if (x === '.zoom.minus') {
				cam_zoom(1, `${split[1]}out`);
				console.log(`${split[1]}ing out`);
				lerp(1, '#zoomSlider', 'down');
			}
			else if (x === '.focus.minus') {
				cam_focus(1, `${split[1]}out`);
				console.log(`${split[1]}ing out`);
				lerp(1, '#focusSlider', 'down');
			};
		});
		
		$('body').on('mouseup', `.${split[1]}.minus`, function (e) {
			if (x === '.zoom.minus') {
				cam_zoom(1, 'zoomstop');
				console.log('stopped');
				lerp(500, '#zoomSlider', 'up');
			}
			else if (x === '.focus.minus') {
				cam_focus(1, 'focusstop');
				console.log('stopped');
				lerp(500, '#focusSlider', 'up');
			};
		});
	});

	const timer = ms => new Promise(res => setTimeout(res, ms))

	async function lerp(targetValue, sliderClass, lerpFunction) {
		let currentValue= Number($(sliderClass).val());
		
		if (lerpFunction === "up") {
			console.log("Lerping: UP");
			console.log("Initial value: " + currentValue);
			console.log("Target value: " + targetValue);
			console.log(" ");
			while(currentValue < targetValue) {
				if(currentValue < (targetValue - 0.8)) {
					let lerpValue = (targetValue - currentValue) / 10;
					currentValue = currentValue + lerpValue;
					$(sliderClass).val(currentValue);
					console.log("Current value: " + currentValue);
				}
				if(currentValue >= (targetValue - 0.8)) {
					currentValue = targetValue;
				}
				await timer(5);
			}
		}

		if (lerpFunction === "down") {
			console.log("Lerping: DOWN");
			console.log("Initial value: " + currentValue);
			console.log("Target value: " + targetValue);
			console.log(" ");
			while(currentValue > targetValue) {
				if(currentValue > (targetValue + 0.8)) {
					let lerpValue = (targetValue - currentValue) / 10;
					currentValue = currentValue + lerpValue;
					$(sliderClass).val(currentValue);
					console.log("Current value: " + currentValue);
				}
				if(currentValue <= (targetValue + 0.8)) {
					currentValue = targetValue;
				}
				await timer(5);
			}
		}
	}

	$('#infoLink').click(function(e) {
		$('#about').toggleClass('show');
	});
	
	$('.asgnBtn').click(function(e){
		pstNum = $(this).html();
		if (pstNum < 11){
			cam_preset(1, pstNum, 'posset');
			console.log(`Set preset ${pstNum}`);
		}
		else {
			cam_preset(1, 11, 'posset');
			console.log('Set autopan start position');
		};
		let presetName = prompt('Enter a name for the preset:');
		document.cookie = `${pstNum} = ${presetName}; expires=Fri, 01 Jan 2100 00:00:00 UTC;`;
	});
	
	// function clear_cookies() {
	// 	var i = 1;
	// 	while (i <= 9) {
	// 		var name = 'presetname' + i.toString();
	// 		var actualname = eval('name');
	// 		Cookies.remove(actualname)
	// 		i++;
	// 	}
	// 	location.reload();
	// }

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
		})
			.done(function () {
				// console.log("success");
			})
			.fail(function (jqXHR, responseText, errorThrown) {
				console.log("error");
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

	config_init();

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

	function reload_cam() {

		config.ip = $('#cameraIP').val();
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(config.ip)) {

			config.ip = config.ip;
			save_config();

			alert("New IP address saved.");

		} else {

			alert("IP address entered is invalid! Re-enter camera IP address.");
		}
	}

	function adjust_setting(action) {

		switch (action) {

			case 'flip':

				switch (config.flip) {
					case 0:
						var loc = base_url + "/param.cgi?post_image_value&flip&1";
						run_action(loc);
						config.flip = 1;
						save_config();
						update_labels();
						break;

					case 1:
						var loc = base_url + "/param.cgi?post_image_value&flip&0";
						run_action(loc);
						config.flip = 0;
						save_config();
						update_labels();
						break;
				}
				break;

			case 'mirror':
				switch (config.mirror) {
					case 0:
						var loc = base_url + "/param.cgi?post_image_value&mirror&1";
						run_action(loc);
						config.mirror = 1;
						save_config();
						update_labels();
						break;

					case 1:
						var loc = base_url + "/param.cgi?post_image_value&mirror&0";
						run_action(loc);
						config.mirror = 0;
						save_config();
						update_labels();
						break;
				}
				break;

			case 'invertcontrols':

				switch (config.invertcontrols) {
					case 0:
						config.invertcontrols = 1;
						save_config();
						update_labels();
						break;

					case 1:
						config.invertcontrols = 0;
						save_config();
						update_labels();
						break;
				}
				break;

			case 'infinitypt':

				switch (config.infinitypt) {
					case 0:
						config.infinitypt = 1;
						$('#pt_infinity').show();
						config.infinitypt = 1;
						save_config();
						update_labels();
						break;

					case 1:
						config.infinitypt = 0;
						$('#pt_infinity').hide();
						config.infinitypt = 0;
						save_config();
						update_labels();
						break;
				}
				break;

			case 'infinityzoom':

				// console.log("Adjusting Infinity Zoom", config.infinityzoom);
				switch (config.infinityzoom) {
					case 0:
						config.infinityzoom = 1;
						$('#cam_zoom_infinity').show();
						$('#cam_zoom_standard').hide();
						config.infinityzoom = 1;
						save_config();
						update_labels();
						break;

					case 1:
						config.infinityzoom = 0;
						$('#cam_zoom_infinity').hide();
						$('#cam_zoom_standard').show();
						config.infinityzoom = 0;
						save_config();
						update_labels();
						break;
				}
				break;

			case 'infinityfocus':

				switch (config.infinityfocus) {
					case 0:
						config.infinityfocus = 1;
						$('#cam_focus_infinity').show();
						$('#cam_focus_standard').hide();
						config.infinityfocus = 1;
						save_config();
						update_labels();
						break;

					case 1:
						config.infinityfocus = 0;
						$('#cam_focus_infinity').hide();
						$('#cam_focus_standard').show();
						config.infinityfocus = 0;
						save_config();
						update_labels();
						break;
				}
				break;
		}
	}

	// used for loading existing settings
	function update_settings() {

		switch (config.flip) {

			case 0:
				var loc = base_url + "/param.cgi?post_image_value&flip&0";
				run_action(loc);
				break;

			case 1:
				var loc = base_url + "/param.cgi?post_image_value&flip&1";
				run_action(loc);
				break;
		}

		switch (config.mirror) {

			case 0:
				var loc = base_url + "/param.cgi?post_image_value&mirror&0";
				run_action(loc);
				update_labels();
				break;

			case 1:
				var loc = base_url + "/param.cgi?post_image_value&mirror&1";
				run_action(loc);
				update_labels();
				break;
		}

		switch (config.infinitypt) {

			case 0:
				$('#pt_infinity').hide();
				break;

			case 1:
				$('#pt_infinity').show();
				break;
		}

		switch (config.infinityzoom) {

			case 0:
				$('#cam_zoom_infinity').hide();
				$('#cam_zoom_standard').show();
				break;

			case 1:
				$('#cam_zoom_infinity').show();
				$('#cam_zoom_standard').hide();
				break;
		}

		switch (config.infinityfocus) {

			case 1:
				$('#cam_focus_infinity').hide();
				$('#cam_focus_standard').show();
				break;

			case 0:
				$('#cam_focus_infinity').show();
				$('#cam_focus_standard').hide();
				break;
		}

		update_labels();
	}

	function cam_pantilt(camera, action) {

		switch (action) {

			case 'left':

				if (config.invertcontrols == "1") {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&right&" + config.panspeed + "&" + config.tiltspeed + "";
				} else {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&left&" + config.panspeed + "&" + config.tiltspeed + "";
				}
				break;

			case 'right':

				if (config.invertcontrols == "1") {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&left&" + config.panspeed + "&" + config.tiltspeed + "";
				} else {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&right&" + config.panspeed + "&" + config.tiltspeed + "";
				}
				break;

			case 'up':

				if (config.invertcontrols == "1") {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&down&" + config.panspeed + "&" + config.tiltspeed + "";
				} else {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&up&" + config.panspeed + "&" + config.tiltspeed + "";
				}
				break;

			case 'down':

				if (config.invertcontrols == "1") {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&up&" + config.panspeed + "&" + config.tiltspeed + "";
				} else {
					var loc = base_url + "/ptzctrl.cgi?ptzcmd&down&" + config.panspeed + "&" + config.tiltspeed + "";
				}
				break;

			case 'home':

				var loc = base_url + "/ptzctrl.cgi?ptzcmd&home&" + config.panspeed + "&" + config.tiltspeed + "";
				break;

			case 'ptzstop':

				var loc = base_url + "/ptzctrl.cgi?ptzcmd&ptzstop&" + config.panspeed + "&" + config.tiltspeed + "";
				break;
		}

		run_action(loc);
	}

	function cam_zoom(camera, action) {

		var loc = base_url + "/ptzctrl.cgi?ptzcmd&" + action + "&" + config.zoomspeed + "";
		run_action(loc);
	}

	function cam_focus(camera, action) {

		var loc = base_url + "/ptzctrl.cgi?ptzcmd&" + action + "&" + config.focusspeed + "";
		run_action(loc);
	}

	function cam_preset(camera, positionnum, action) {

		var loc = base_url + "/ptzctrl.cgi?ptzcmd&" + action + "&" + positionnum + "";
		run_action(loc);
	}

	var autoInterval;
	var panInterval;
	var panning;
	var autopanning = false;

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

	$('body').on('click', '.clearpresets', function (e) {
		e.preventDefault();
		stop_autopan()
		// clear_cookies();
		return false;
	});

	/* ------------------------------------ Mouse Events & Clicks
	*/

	$('body').on('click', '.adjust_setting', function (e) {
		e.preventDefault();
		var action = this.id
		adjust_setting(action);
		return false;
	});

	$('body').on('change', 'select', function (e) {
		e.preventDefault();
		var action = $(this).attr('id');
		config[action] = $(this).val();
		save_config();
		return false;
	});
});