$(function() {

	var context;

	try {
		context = new webkitAudioContext();
		console.log("Supported");
	}
	catch(e) {
		alert('Web Audio API is not supported in this browser');
	}

	if(context) {

		var Metronome = function(context) {
			this.context = context;
			this.loaded = false;
			this.clickBuffer = null;

			this.tempo = 180;
			this.beats = 4;
			this.volume = 1;

			this.loop = null;
			this.counter = 0;

			this.loadSound();
		}

		Metronome.prototype = {
			loadSound : function() {
				var request = new XMLHttpRequest();
				request.open('GET', "sounds/metronome.wav", true);
				request.responseType = 'arraybuffer';

				// Decode asynchronously
				request.onload = function() {
					context.decodeAudioData(request.response, function(buffer) {
						this.clickBuffer = buffer;
						this.loaded = true;
					}, function() {
						// Error
					    console.log("Error");
					});
				}
				request.send();
			},

			play : function() {
				if(!this.clickBuffer) return;

				var color = "green";
				var source = context.createBufferSource();
				var gainNode = context.createGainNode();
				gainNode.gain.value = metronome.volume * metronome.volume;

				source.buffer = clickBuffer;
				source.connect(gainNode);

				if((metronome.counter % metronome.beats) == 0) {
					metronome.counter = 0;
					source.playbackRate.value = 1.5;
					color = "red";
				}

				gainNode.connect(context.destination);
				source.noteOn(0);

				$('.indicator').addClass(color);

				setTimeout(function() {
					$('.indicator').removeClass("green red");
				}, 100);

				metronome.counter++;
			},

			start : function() {
				$('.toggle').html('Stop').addClass("playing");
				if(this.loop != null) {
					console.log("Already running");
				} else {
					console.log("Start");
					var ms = 60000 / this.tempo;
					this.loop = setInterval(this.play, ms);
				}
			},

			stop : function() {
				$('.toggle').html('Start').removeClass("playing");
				console.log("Stop");
				clearInterval(this.loop);
				this.loop = null;
				metronome.counter = 0;
			},

			toggle : function() {
				if(this.loop == null) {
					this.start();
				} else {
					this.stop();

				}
			},

			changeTempo : function(tempo) {
				if(tempo <= 0 || tempo == this.tempo) return;
				this.tempo = tempo;
				console.log("Changed tempo: " + tempo);
				$('.tempo').val(tempo);
				if(this.loop != null) {
					this.stop();
					this.start();
				}
			},

			changeBeats : function(beats) {
				if(beats <= 0) return;
				$('.beats').val(beats);
				this.beats = beats;
			},

			changeVolume : function(volume) {
				$('[type="number"].volume').val(volume * 100);
				this.volume = volume;
			}
		};

		var metronome = new Metronome(context);

		$(document).on('keydown', function(e) {
			if(e.keyCode == 32) {
				if(e.srcElement.nodeName == "INPUT") return;
				metronome.toggle();
			}
		});

		/* Init */

		function onlyAllowNumbers(e) {
			// Allow: backspace, delete, tab, escape, and enter
			if(e.keyCode == 13) {
				$(this).blur();
			}
			if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 13 ||
			     // Allow: Ctrl + A
			    (e.keyCode == 65 && e.ctrlKey === true) ||
			     // Allow: home, end, left, right
			    (e.keyCode >= 35 && e.keyCode <= 39)) {
			         // let it happen, don't do anything
			         return;
			} else {
			    // Ensure that it is a number and stop the keypress
			    if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105 )) {
			        e.preventDefault();
			    }
			}
		}

		function microtime (time) {
			var now = new Date().getTime() / 1000;
			var s = parseInt(now, 10);

			return (time) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
		}

		var lastChangedValue = 0;

		var lastTime = microtime();
		var timeout = null;

		$('.tempo')
			.val(metronome.tempo)
			.on('keydown', onlyAllowNumbers)
			.on('change', function(e) {
				if($(this).prop('type') == 'range'){
					$('[type="number"].tempo').val($(this).val());
				}

				var thisTime = microtime(true);
				var el = this;

				clearTimeout(timeout);

				timeout = setTimeout(function() {
					if(lastTime > thisTime) return;
					else {
						metronome.changeTempo(parseInt($(el).val()));
					}
				}, 1000);

			})
			.on('');

		$('.beats')
			.val(metronome.beats)
			.on('keydown', onlyAllowNumbers)
			.on('change', function(e) {
				metronome.changeBeats(parseInt($(this).val()));
			});

		$('.volume')
			.val(metronome.volume  * 100)
			.on('keydown', onlyAllowNumbers)
			.on('change', function(e) {
				var volume = parseInt($(this).val()) / parseInt($(this).prop('max'));
				console.log(volume);
				metronome.changeVolume(volume);
			});

		$('.toggle').on('click', function(e) {
			metronome.toggle();
		});

		$('input[type="number"]').on('click', function(e) {
			$(this).select();
		});
	}

});