let width, height;
const canvas = $('#bg-canvas')[0];
const ctx = canvas.getContext('2d');

const orbs = [];
const maxOrbs = 64;
const colors = [
    {r: 128, g: 50, b: 50},
    {r: 160, g: 22, b: 193},
    {r: 32, g: 120, b: 100},
    {r: 21, g: 234, b: 217},
    {r: 80, g: 242, b: 56}
];
let lastTime = performance.now();
const spawnInteval = 200;
let spawnTimer = 0;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

$(window).on('resize', resize)
resize();

class Orb {
    constructor() {
        this.relX = Math.random();
        this.relY = Math.random();

        this.relRad = Math.random() * 0.05 + 0.01;

        this.relVx = (Math.random() - 0.5) * 0.0001;
        this.relVy = (Math.random() - 0.5) * 0.0001;

        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.lifeTime = Math.random() * 2000 + 4000;
        this.age = 0;
        this.maxOpacity = Math.random() * 0.5 + 0.3;
        this.opacity = 0;
        this.isDead = false;
    }

    update(deltaT) {
        this.age += deltaT;

        if (this.age >= this.lifeTime) {
            this.isDead = true;
            return;
        }

        const timeFactor = deltaT / 16.6;
        this.relX += this.relVx * timeFactor;
        this.relY += this.relVy * timeFactor;

        const progress = this.age / this.lifeTime;
        if (progress < 0.25) {
            this.opacity = (progress / 0.25) * this.maxOpacity;
        } else if (progress > 0.7) {
            this.opacity = ((1 - progress) / 0.3) * this.maxOpacity;
        } else {
            this.opacity = this.maxOpacity;
        }
    }

    draw() {
        const x = this.relX * width;
        const y = this.relY * height;

        const minDim = Math.min(width, height);
        const rad = this.relRad * minDim;

        ctx.save();

        const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, rad
        );

        const {r, g, b} = this.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity})`);
        gradient.addColorStop(0.1, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.6})`);
        gradient.addColorStop(0.85, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.1})`);
        gradient.addColorStop(0.9, `rgba(${r}, ${g}, ${b}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function initOrb() {
    for (let i = 0; i < 10; i++) {
        const orb = new Orb();
        orb.age = Math.random() * (orb.lifeTime * 0.5);
        orbs.push(orb);
    }
}

initOrb();

function animate(currentTime) {
    const deltaT = currentTime - lastTime;
    lastTime = currentTime;

    // Clear canvas background
    ctx.fillStyle = '#0b0d14';
    ctx.fillRect(0, 0, width, height);

    spawnTimer += deltaT;

    if (spawnTimer >= spawnInteval) {
        spawnTimer = 0;
        if (orbs.length < maxOrbs) orbs.push(new Orb());
    }

    ctx.globalCompositeOperation = 'lighter';

    for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i];
        
        orb.update(deltaT);

        if (orb.isDead) {
            orbs.splice(i, 1);
        } else {
            orb.draw();
        }
    }

    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);