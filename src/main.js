let getObjectFitSize = (contains, containerWidth, containerHeight,
    width, height) => {
    var doRatio = width / height;
    var cRatio = containerWidth / containerHeight;
    var targetWidth = 0;
    var targetHeight = 0;
    var test = contains ? doRatio > cRatio : doRatio < cRatio;
  
    if (test) {
      targetWidth = containerWidth;
      targetHeight = targetWidth / doRatio;
    } else {
      targetHeight = containerHeight;
      targetWidth = targetHeight * doRatio;
    }
  
    return {
      width: targetWidth,
      height: targetHeight,
      x: (containerWidth - targetWidth) / 2,
      y: (containerHeight - targetHeight) / 2
    };
}

let canvasSetup = () => {
    let canvas = document.getElementById('canvas');
    canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight);
    const dimensions = getObjectFitSize(
        true,
        canvas.clientWidth,
        canvas.clientHeight,
        canvas.width,
        canvas.height
    );
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    return canvas
}

const RADIUS = 10;

let drawCircle = (ctx, x, y, color) => {
    ctx.beginPath();
    ctx.arc(x, y, RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();  
}

let hitXWall = (canvas, circle) => {
    rightWall = canvas.width;
    if (((circle.x + RADIUS) >= rightWall) || 
        ((circle.x - RADIUS) <= 0)) {
        return true;
    } else {
        return false;
    }
}

let hitYWall = (canvas, circle) => {
    bottomWall = canvas.height;
    if (((circle.y + RADIUS) >= bottomWall) || 
        ((circle.y - RADIUS) <= 0)) {
        return true;
    } else {
        return false;
    }
}

const NUM_CIRCLES = 1000;
let infectedNumber = 1;
let healthyNumber = NUM_CIRCLES - infectedNumber;
let recoveredNumber = 0;
let BASE_CHANCE_INFECTION = 0.05;
let chanceOfInfection = BASE_CHANCE_INFECTION;
let deceasedNumber = 0;

let checkForCollisions = (circles, index) => {
    let circle = circles[index];
    for (let i = 0; i < circles.length; i++) {
        if (i === index) {
            continue;
        }
        let currentCircle = circles[i];
        let x_delta_sq =  (currentCircle.x - circle.x) ** 2;
        let y_delta_sq = (currentCircle.y - circle.y) ** 2;
        let distance = Math.sqrt(x_delta_sq + y_delta_sq);
        if (distance < (RADIUS * 2)) {
            if (currentCircle.state === 'infected') {
                if (circle.state === 'healthy') {
                    if (Math.random() < chanceOfInfection) {
                        circle.state = 'infected';
                        circle.color = '#fa1807';
                        infectedNumber++;
                        healthyNumber--;
                    }
                }
            }
            if ((circle.state === 'infected') && (circle.daysWithCovid >= 100)) {
                if (Math.random() < 0.06) {
                    circle.state = 'deceased';
                    circle.color = null;
                    deceasedNumber++;
                    infectedNumber--;
                } else {
                    circle.state = 'recovered';
                    circle.color = '#9300f5';
                    infectedNumber--;
                    recoveredNumber++;
                }
            }
        }
    }
}

let updateCircle = (circle) => {
    if (hitXWall(canvas, circle)) {
        circle.velocX *= -1;
    }
    if (hitYWall(canvas, circle)) {
        circle.velocY *= -1
    }
    circle.x += circle.velocX;
    circle.y += circle.velocY;
    if (circle.state === 'infected') {
        circle.daysWithCovid++;
    }
}

let canvas = canvasSetup();
let circles = [];

let draw = () => {
    canvas = canvasSetup();
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
    for (let i = 0; i < circles.length; i++) {
        checkForCollisions(circles, i);
    }
    circles.forEach(circle => {
        updateCircle(circle);
        if (circle.state !== 'deceased') {
            drawCircle(ctx, circle.x, circle.y, circle.color);
        }
    });
    let infectedNum = document.getElementById('infected-number');
    infectedNum.innerHTML = infectedNumber;
    let healthyNum = document.getElementById('healthy-number');
    healthyNum.innerHTML = healthyNumber;
    let recoveredNum = document.getElementById('recovered-number');
    recoveredNum.innerHTML = recoveredNumber;
    let deceasedNum = document.getElementById('deceased-number');
    deceasedNum.innerHTML = deceasedNumber;
    let vaccinationSlider = document.getElementById('vaccination');
    chanceOfInfection = BASE_CHANCE_INFECTION * ((120 - vaccinationSlider.value) / 100);
    let vaccinationRate = document.getElementById('vaccination-rate');
    vaccinationRate.innerHTML = vaccinationSlider.value - 20;
    let loopTimer = setTimeout(draw, 20);
}

let initCircles = () => {
    for (let i = 0; i < NUM_CIRCLES; i++) {
        let newCircle = {
            x: Math.random() * (canvas.width-2*RADIUS) + RADIUS,
            y: Math.random() * (canvas.height-2*RADIUS) + RADIUS,
            velocX: Math.random() * 11 - 5,
            velocY: Math.random() * 11 - 5,
            state: 'healthy',
            color: '#F67540',
            daysWithCovid: 0
        };
        circles.push(newCircle);
        circles[0].state = 'infected';
        circles[0].color = '#fa1807';
    }
}

let startUp = () => {
    canvas = canvasSetup();
    let infectedTotal = document.getElementById('infected-total');
    infectedTotal.innerHTML = NUM_CIRCLES;
    let healthyTotal = document.getElementById('healthy-total');
    healthyTotal.innerHTML = NUM_CIRCLES;
    let recoveredTotal = document.getElementById('recovered-total');
    recoveredTotal.innerHTML = NUM_CIRCLES;
    let deceasedTotal = document.getElementById('deceased-total');
    deceasedTotal.innerHTML = NUM_CIRCLES;
    initCircles();
    draw();
}

setTimeout(startUp, 60);
