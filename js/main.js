const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

const gearEyeRing = document.getElementById("gearEyeRing");
const irisRing = document.getElementById("irisRing");
const pupil = document.getElementById("pupil");
const highlight = document.getElementById("eyeHighlight");
const eyeBodyGroup = document.getElementById("eyeBodyGroup");

const turbNoise = document.getElementById("turbNoise");
const dispMap = document.getElementById("dispMap");
const tearNoise = document.getElementById("tearNoise");
const tearMap = document.getElementById("tearMap");
const offR = document.getElementById("offR");
const offB = document.getElementById("offB");

let gearAngle = 0;
let gearTargetScale = 1;
let gearCurrentScale = 1;

let eyeBodyScale = 1;
let eyeBodyTargetScale = 1;

const gearRotateSpeed = 360 / 18;
const CX = 300;
const CY = 300;

let glitchNextTime = 0;

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particleList = [];
const particleTotal = 120;

for(let i = 0; i < particleTotal; i++){
    particleList.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.4 + 0.1
    });
}

let pageActive = true;

document.addEventListener('visibilitychange', () => {
    pageActive = !document.hidden;
});

function resetAllGlitch(){
    turbNoise.setAttribute("baseFrequency", "0.0 0.0");
    dispMap.setAttribute("scale", "0");
    tearNoise.setAttribute("baseFrequency", "0.0 0.0");
    tearMap.setAttribute("scale", "0");
    offR.setAttribute("dx","0");
    offB.setAttribute("dx","0");
}

function runSignalDistortBurst(){
    const burstFrames = 3 + Math.floor(Math.random() * 3);
    let frameIdx = 0;

    function step(){
        if(frameIdx >= burstFrames){
            resetAllGlitch();
            return;
        }

        const freqX = 0.01 + Math.random() * 0.025;
        const freqY = 0.02 + Math.random() * 0.04;
        const distortScale = 6 + Math.random() * 10;

        turbNoise.setAttribute("baseFrequency", `${freqX} ${freqY}`);
        turbNoise.setAttribute("seed", Math.floor(Math.random() * 100));
        dispMap.setAttribute("scale", distortScale);
        offR.setAttribute("dx", 2);
        offB.setAttribute("dx", -2);

        frameIdx++;
        setTimeout(step, 16 + Math.random() * 24);
    }

    step();
}

function runScreenTearBurst(){
    const tearFrames = 5 + Math.floor(Math.random() * 4);
    let frame = 0;

    function step(){
        if(frame >= tearFrames){
            resetAllGlitch();
            return;
        }

        const intensity = 7 + Math.random() * 10;

        tearNoise.setAttribute("baseFrequency", `0.001 ${0.04 + Math.random() * 0.07}`);
        tearNoise.setAttribute("seed", Math.floor(Math.random() * 100));
        tearMap.setAttribute("scale", intensity);

        frame++;
        setTimeout(step, 16 + Math.random() * 18);
    }

    step();
}

function updateEyeTargets(){
    if(!pageActive) return;

    const now = performance.now();

    gearTargetScale = 0.97 + Math.random() * 0.10;
    eyeBodyTargetScale = 0.98 + Math.random() * 0.04;

    const pupilScale = 0.92 + Math.random() * 0.16;
    const irisScale = 0.96 + Math.random() * 0.08;
    const highlightMoveX = (Math.random() - 0.5) * 6;
    const highlightMoveY = (Math.random() - 0.5) * 6;

    pupil.style.transition = "r 0.45s ease-out";
    pupil.setAttribute("r", 60 * pupilScale);

    irisRing.style.transition = "transform 0.45s ease-out";
    irisRing.style.transform = `scale(${irisScale})`;

    highlight.style.transition = "transform 0.45s ease-out";
    highlight.style.transform = `translate(${highlightMoveX}px, ${highlightMoveY}px)`;

    if(now > glitchNextTime){
        const type = Math.random();

        if(type < 0.45){
            runSignalDistortBurst();
        }else if(type < 0.80){
            runScreenTearBurst();
        }else{
            runSignalDistortBurst();
            setTimeout(runScreenTearBurst, 80);
        }

        glitchNextTime = now + 1200 + Math.random() * 1600;
    }
}

setInterval(updateEyeTargets, 1200);

function render(){
    if(!pageActive){
        requestAnimationFrame(render);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gearAngle += gearRotateSpeed / 60;
    gearCurrentScale += (gearTargetScale - gearCurrentScale) * 0.04;
    eyeBodyScale += (eyeBodyTargetScale - eyeBodyScale) * 0.03;

    // 齿轮变换
    const gearTransform = `translate(${CX},${CY}) rotate(${gearAngle}) scale(${gearCurrentScale}) translate(${-CX},${-CY})`;
    gearEyeRing.setAttribute("transform", gearTransform);

    // ✅修复眼睛整体缩放，SVG原生transform属性，严格以300,300为中心缩放，不会右下漂移
    const eyeBodyTransform = `translate(${CX},${CY}) scale(${eyeBodyScale}) translate(${-CX},${-CY})`;
    eyeBodyGroup.setAttribute("transform", eyeBodyTransform);

    for(let p of particleList){
        p.x += p.vx;
        p.y += p.vy;

        if(p.x < 0) p.x = canvas.width;
        if(p.x > canvas.width) p.x = 0;
        if(p.y < 0) p.y = canvas.height;
        if(p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110,170,255,${p.alpha})`;
        ctx.fill();
    }

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
