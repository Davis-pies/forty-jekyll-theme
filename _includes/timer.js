class Timer {
	constructor(color = "white", startQuantity = 600, incrementQuantity = 0, updateInterval = 100, instaStart = false) {
		this.Color = color;
		this.StartQuantity = startQuantity;
		this.CurrentQuantity = startQuantity;
		this.IncrementQuantity = incrementQuantity;
		this.UpdateInterval = updateInterval;
		this.Interval = null;
		this.Pause = true;
		if (instaStart) {
			this.startTimer();
		}
	}

	decrement(timer) {
		console.log("decrement called");
		let currentTime = Date.now();
		if (!timer.Pause) {
			let elapsedTime = (currentTime - timer.LastTime) / 1000;
			console.log(elapsedTime);
			timer.CurrentQuantity -= elapsedTime;
			console.log(timer.CurrentQuantity);
		}
		timer.LastTime = currentTime;
	}

	startTimer() {
		console.log("startTimer called");
		this.LastTime = Date.now();
		this.Interval = function(){setInterval(this.decrement, this.UpdateInterval, this)};
		console.log(this.Interval);
		this.Pause = false;
	}

	increment() {
		this.CurrentQuantity += this.IncrementQuantity;
	}

	pause() {
		console.log(`Pausing ${this.Color} Timer`);
		this.Pause = true;
	}

	unpause() {
		console.log(`Unpausing ${this.Color} Timer`);
		this.Pause = false;
	}
	log(){
		console.log(`Time Remaining: ${this.CurrentQuantity}`);
	}
}
