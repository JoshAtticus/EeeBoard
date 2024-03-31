var showSeconds = window.location.search.indexOf('showSeconds=true') > -1;
var currentBackground = 1;

document.getElementById('fullscreenButton').addEventListener('click', function () {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }
});

function updateTime() {
    var now = new Date();
    var clockDiv = document.getElementById('clock');
    var dateDiv = document.getElementById('date');
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    clockDiv.textContent = showSeconds ? now.toLocaleTimeString() : now.toLocaleTimeString().slice(0, -3);
    dateDiv.textContent = now.getDate() + ' ' + monthNames[now.getMonth()] + ' ' + now.getFullYear();
}
setInterval(updateTime, 1000);
updateTime();

var requestInterval = 30000; // 30 seconds
var requestOffset = 5000; // 5 seconds before the 30-second mark

setInterval(function () {
    var now = new Date();
    var seconds = now.getSeconds();
    var milliseconds = now.getMilliseconds();
    var timeUntilNextRequest = requestInterval - (seconds * 1000 + milliseconds) + requestOffset;

    setTimeout(function () {
        updateImage();
    }, timeUntilNextRequest);
}, requestInterval);

function updateImage() {
    var xhr = new XMLHttpRequest();
    var timestamp = new Date().getTime(); // Generate a unique timestamp
    var url = 'http://eeeapi.atticat.tech/images/unsplash?timestamp=' + timestamp; // Add the timestamp as a query parameter
    xhr.open('GET', url, true);
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
    xhr.setRequestHeader('User-Agent', 'EeeBoard/1.0.0');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var newBackground = currentBackground == 1 ? 2 : 1;
            var img = new Image();
            img.onload = function () {
                document.getElementById('background' + newBackground).style.backgroundImage = 'url(' + img.src + ')';
                document.getElementById('background' + currentBackground).className = 'background fade-out';
                document.getElementById('background' + newBackground).className = 'background';
                currentBackground = newBackground;
            };
            img.src = xhr.responseURL;
        }
    };
    xhr.send();
}
setInterval(updateImage, 30000);
updateImage();

var touchStartX = null;
var minSwipeDistance = 300;

document.body.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
}, false);

document.body.addEventListener('touchmove', function (e) {
    if (touchStartX === null) {
        return;
    }
    var touchEndX = e.changedTouches[0].clientX;
    var diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
            updateImage();
        }
        touchStartX = null;
    }
}, false);

document.body.addEventListener('touchend', function (e) {
    touchStartX = null;
}, false);

function updateWeather() {
    var location = window.localStorage.getItem('location');
    if (!location) {
        location = window.prompt('Please enter your location:');
        if (location === null) {
            return;
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://eeeapi.atticat.tech/weather/' + location, true);
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
    xhr.setRequestHeader('User-Agent', 'EeeBoard/1.0.0');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                window.localStorage.setItem('location', location);
                var weather = JSON.parse(xhr.responseText);
                document.getElementById('weather').textContent = Math.round(weather.temperature) + '°C in ' + weather.location;
            } else {
                window.localStorage.removeItem('location');
                alert('Failed to get weather information. Click cancel to disable EeeWeather.');
                updateWeather();
            }
        }
    }
    xhr.send();
}
setInterval(updateWeather, 1800000);
updateWeather();