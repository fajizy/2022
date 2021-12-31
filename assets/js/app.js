const { to, set, registerPlugin } = gsap;

const checkAudio = new Audio("/assets/audio/check.mp3");
const flagAudio = new Audio("/assets/audio/flag-2.mp3");

registerPlugin(MorphSVGPlugin);

document.querySelectorAll(".task-item").forEach(task => {
    let checkbox = task.querySelector(".checkbox"),
        checkboxInput = checkbox.querySelector("input"),
        flag = task.querySelector(".flag"),
        flagPath = flag.querySelectorAll("path"),
        timer;

    checkboxInput.addEventListener("change", e => {
        clearInterval(timer);
        if (e.target.value == "2021") {
            if (!Renderer.initialised) {
                Renderer.init();
            }
            Renderer.toggle();
        }
        if (e.target.checked) {
            checkAudio.play();
            to(checkbox, {
                "--checkbox-lines-offset": "4.5px",
                duration: 0.2,
                delay: 0.2,
                clearProps: true
            });

            to(task, {
                keyframes: [
                    {
                        "--text-line-scale": 1,
                        "--text-x": "2px",
                        duration: 0.15
                    },

                    {
                        "--text-x": "0px",
                        duration: 0.15,
                        onComplete() {
                            timer = setTimeout(() => task.classList.add("done"), 500);
                        }
                    }]
            });



            return;
        }
        to(task, {
            "--text-line-scale": 0,
            duration: 0.25,
            onComplete() {
                task.classList.remove("done");
            }
        });

    });

    flag.addEventListener("pointerenter", e => {
        flag.animating;
        if (flag.animating) {
            return;
        }
        to(flag, {
            keyframes: [
                {
                    "--flag-rotate": e.offsetX > 21 ? "-4deg" : "4deg",
                    duration: 0.1
                },

                {
                    "--flag-rotate": e.offsetX > 21 ? "4deg" : "-4deg",
                    duration: 0.1
                },

                {
                    "--flag-rotate": "0deg",
                    duration: 0.1
                }]
        });



    });

    flag.addEventListener("click", e => {
        if (flag.animating) {
            return;
        }
        flag.animating = true;

        if (flag.classList.contains("active")) {
            to(flag, {
                keyframes: [
                    {
                        "--flag-scale-y": 0.9,
                        "--flag-fill-percent": "0%",
                        duration: 0.15
                    },

                    {
                        "--flag-scale-y": 1,
                        duration: 0.25
                    }],


                onComplete() {
                    flag.classList.remove("active");
                    flag.animating = false;
                }
            });

            return;
        }

        flagAudio.play();

        to(flagPath, {
            duration: 1.8,
            ease: "sine.out",
            keyframes: new Array(2).
                fill([
                    {
                        morphSVG:
                            "M7.66 16.75L2.25 1.99999C8 0.5 9.5 2.54999 14 0.799988C15.5 3.3 16.5 7.00001 16 8C11.5 10 9.5 9.58974 5.03377 9.58974"
                    },

                    {
                        morphSVG:
                            "M7.66 16.75L2.25 2.00001C9.5 4.50001 9 1 14.5 2C16 4.50001 16 8.00002 15.5 9.00001C10 10.5 9.5 9 5.03377 9.58976"
                    },

                    {
                        morphSVG:
                            "M7.66 16.75L2.25 2C7 2.75 9.5 1.50001 14 1.75C15.5 4.25001 16 8.00001 15.5 9C11 9 9.5 10.5 5.03377 9.58975"
                    },

                    {
                        morphSVG:
                            "M7.66 16.75L2.25 2C8 -0.249996 9.5 3.50001 14 1.75C15.5 4.25002 16 8.00002 15.5 9C11 11 9.5 8.50002 5.03377 9.58975"
                    }]).


                flat()
        });


        to(flag, {
            "--flag-fill-percent": "150%",
            duration: 0.25,
            delay: 0.2,
            clearProps: true,
            onStart() {
                set(flag, {
                    "--flag-fill-x": "1.5px",
                    "--flag-fill-y": "1.5px"
                });

            },
            onComplete() {
                flag.classList.add("active");
                flag.animating = false;
            }
        });

    });
});

const fireworkAudio = new Audio("/assets/audio/firework.mp3");
const fireworkStartAudio = new Audio("/assets/audio/firework-start.mp3");

const Renderer = {
    initialised: false,
    play: false,
    interval: { min: 20, max: 200 },
    background: "hsla(240, 5%, %luminance%, 1)",
    init() {
        this.initialised = true;
        this.setParameters();
        this.reconstructMethod();
        this.render();
    },
    toggle() {
        this.play = !this.play;
    },
    setParameters() {
        this.container = document.querySelector("#firework");
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.distance = Math.sqrt(
            Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));

        this.resolution = window.devicePixelRatio || 1;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width * this.resolution;
        this.canvas.height = this.height * this.resolution;
        this.context = this.canvas.getContext("2d");
        this.container.appendChild(this.canvas);
        this.canvas.style.width = this.width + "px";
        this.canvas.style.height = this.height + "px";
        this.context.scale(this.resolution, this.resolution);

        this.fireworks = [new Firework(this.width, this.height, this)];

        this.maxFireworkInterval = this.getRandomValue(this.interval) | 0;
        this.fireworkInterval = this.maxFireworkInterval;
    },
    reconstructMethod() {
        this.render = this.render.bind(this);
    },
    getRandomValue(range) {
        return range.min + (range.max - range.min) * Math.random();
    },
    render() {
        requestAnimationFrame(this.render);

        var maxOpacity = 0,
            context = this.context;

        for (var i = this.fireworks.length - 1; i >= 0; i--) {
            maxOpacity = Math.max(maxOpacity, this.fireworks[i].getOpacity());
        }
        context.fillStyle = this.background.replace("%luminance", 15 + maxOpacity);
        context.fillRect(0, 0, this.width, this.height);

        for (var i = this.fireworks.length - 1; i >= 0; i--) {
            if (!this.fireworks[i].render(context)) {
                this.fireworks.splice(i, 1);
            }
        }

        if (!this.play) {
            return;
        }

        if (--this.fireworkInterval == 0) {
            this.fireworks.push(new Firework(this.width, this.height, this));
            this.maxFireworkInterval = this.getRandomValue(this.interval) | 0;
            this.fireworkInterval = this.maxFireworkInterval;
        }
    }
};


const Firework = function (width, height, renderer) {
    this.width = width;
    this.height = height;
    this.renderer = renderer;
    this.init();
};

Firework.prototype = {
    color: "hsl(%hue, 84%, 69%)",
    particleCount: 300,
    delta: { opacity: 0.01, theta: Math.PI / 10 },
    radius: 2,
    velocity: -3,
    wait: { min: 20, max: 40 },
    threshold: 50,
    gravity: 0.002,
    init() {
        this.setParameters();
        this.createParticles();
    },
    setParameters() {
        var hue = 256 * Math.random() | 0;

        this.x = this.renderer.getRandomValue({
            min: this.width / 8,
            max: this.width * 7 / 8
        });

        this.y = this.renderer.getRandomValue({
            min: this.height / 4,
            max: this.height / 2
        });

        this.x0 = this.x;
        this.y0 = this.height + this.radius;
        this.color = this.color.replace("%hue", hue);
        this.status = 0;
        this.init = 0;
        this.theta = 0;
        this.waitCount = this.renderer.getRandomValue(this.wait);
        this.opacity = 1;
        this.velocity = this.velocity;
        this.particles = [];
    },
    createParticles() {
        for (var i = 0, length = this.particleCount; i < length; i++) {
            this.particles.push(new Particle(this.x, this.y, this.renderer));
        }
    },
    getOpacity() {
        return this.status == 2 ? this.opacity : 0;
    },
    render(context) {
        switch (this.status) {
            case 0:
                context.save();
                context.fillStyle = this.color;
                context.globalCompositeOperation = "lighter";
                context.globalAlpha =
                    this.y0 - this.y <= this.threshold ?
                        (this.y0 - this.y) / this.threshold :
                        1;
                context.translate(this.x0 + Math.sin(this.theta) / 2, this.y0);
                context.scale(0.8, 2.4);
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
                context.fill();
                context.restore();

                this.y0 += this.velocity;

                if (this.y0 <= this.y) {
                    this.status = 1;
                }

                if (this.init === 0) {
                    this.init = 1;
                    fireworkStartAudio.cloneNode(true).play();
                }

                this.theta += this.delta.theta;
                this.theta %= Math.PI * 2;
                this.velocity += this.gravity;
                return true;
            case 1:
                if (--this.waitCount <= 0) {
                    this.status = 2;
                }
                return true;
            case 2:
                if (this.opacity === 1) {
                    fireworkAudio.cloneNode(true).play();
                }
                context.save();
                context.globalCompositeOperation = "lighter";
                context.globalAlpha = this.opacity;
                context.fillStyle = this.color;

                for (var i = 0, length = this.particles.length; i < length; i++) {
                    this.particles[i].render(context, this.opacity);
                }
                context.restore();
                this.opacity -= this.delta.opacity;

                return this.opacity > 0;
        }

    }
};


const Particle = function (x, y, renderer) {
    this.x = x;
    this.y = y;
    this.renderer = renderer;
    this.init();
};

Particle.prototype = {
    radius: 1.5,
    velocity: { min: 0, max: 3 },
    gavity: 0.03,
    friction: 0.98,
    init() {
        var radian = Math.PI * 2 * Math.random(),
            velocity = (1 - Math.pow(Math.random(), 6)) * this.velocity.max,
            rate = Math.random();

        this.vx = velocity * Math.cos(radian) * rate;
        this.vy = velocity * Math.sin(radian) * rate;
    },
    render(context, opacity) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fill();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gavity;
        this.vx *= this.friction;
        this.vy *= this.friction;
    }
};