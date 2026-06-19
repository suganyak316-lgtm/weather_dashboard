const loader = document.getElementById("loader");

const cityName = document.getElementById("cityName");
const weatherText = document.getElementById("weatherText");
const weatherIcon = document.getElementById("weatherIcon");

const temperature = document.getElementById("temperature");
const tempCard = document.getElementById("tempCard");

const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");

const rainChance = document.getElementById("rainChance");
const uvIndex = document.getElementById("uvIndex");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const forecastContainer =
document.getElementById("forecastContainer");

document
.getElementById("searchBtn")
.addEventListener("click", searchCity);

navigator.geolocation.getCurrentPosition(

(position) => {

    loadWeather(
        position.coords.latitude,
        position.coords.longitude,
        "My Location"
    );

},

() => {

    loadWeather(
        11.0168,
        76.9558,
        "Coimbatore"
    );

});

async function searchCity(){

    const city =
    document.getElementById("cityInput").value;

    if(city === "") return;

    const geoURL =
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

    const response =
    await fetch(geoURL);

    const data =
    await response.json();

    if(!data.results){

        alert("City not found");
        return;

    }

    const place =
    data.results[0];

    loadWeather(
        place.latitude,
        place.longitude,
        place.name
    );
}

async function loadWeather(
lat,
lon,
place
){

    loader.style.display = "flex";

    const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=7`;

    const response =
    await fetch(url);

    const data =
    await response.json();

    cityName.textContent = place;

    temperature.textContent =
    data.current.temperature_2m + "°C";

    tempCard.textContent =
    data.current.temperature_2m + "°C";

    windSpeed.textContent =
    data.current.wind_speed_10m + " km/h";

    humidity.textContent =
    data.hourly.relative_humidity_2m[0] + "%";

    rainChance.textContent =
    data.hourly.precipitation_probability[0] + "%";

    uvIndex.textContent =
    Math.floor(Math.random()*11);

    sunrise.textContent =
    formatTime(
        data.daily.sunrise[0]
    );

    sunset.textContent =
    formatTime(
        data.daily.sunset[0]
    );

    const weather =
    getWeatherInfo(
        data.current.weather_code
    );

    weatherIcon.textContent =
    weather.icon;

    weatherText.textContent =
    weather.text;

    renderForecast(data.daily);

    drawChart(
        data.hourly.temperature_2m.slice(0,24)
    );

    loader.style.display = "none";
}

function formatTime(time){

    return new Date(time)
    .toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

}

function getWeatherInfo(code){

    if(code === 0){

        return{
            icon:"☀️",
            text:"Sunny"
        };

    }

    if(code <= 3){

        return{
            icon:"⛅",
            text:"Cloudy"
        };

    }

    if(code <= 67){

        return{
            icon:"🌧️",
            text:"Rainy"
        };

    }

    return{
        icon:"⛈️",
        text:"Stormy"
    };
}

function renderForecast(daily){

    forecastContainer.innerHTML = "";

    daily.time.forEach((day,index)=>{

        const weather =
        getWeatherInfo(
            daily.weather_code[index]
        );

        const card =
        document.createElement("div");

        card.classList.add(
            "forecast-card"
        );

        card.innerHTML = `
            <h4>
            ${new Date(day)
            .toLocaleDateString(
            "en-US",
            {weekday:"short"}
            )}
            </h4>

            <div class="icon">
            ${weather.icon}
            </div>

            <h3>
            ${daily.temperature_2m_max[index]}°C
            </h3>

            <p>
            Min:
            ${daily.temperature_2m_min[index]}°C
            </p>
        `;

        forecastContainer.appendChild(
            card
        );
    });
}

function drawChart(temps){

    const canvas =
    document.getElementById(
        "tempChart"
    );

    const ctx =
    canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const max =
    Math.max(...temps);

    const min =
    Math.min(...temps);

    const padding = 40;

    ctx.beginPath();

    temps.forEach((temp,index)=>{

        const x =
        padding +
        (index *
        (canvas.width -
        padding*2))
        /(temps.length-1);

        const y =
        canvas.height -
        padding -
        ((temp-min)/
        (max-min||1))
        *
        (canvas.height -
        padding*2);

        if(index===0){

            ctx.moveTo(x,y);

        }else{

            ctx.lineTo(x,y);

        }

    });

    ctx.strokeStyle =
    "#5f9dff";

    ctx.lineWidth = 4;

    ctx.stroke();

    ctx.lineTo(
        canvas.width-padding,
        canvas.height-padding
    );

    ctx.lineTo(
        padding,
        canvas.height-padding
    );

    ctx.closePath();

    const gradient =
    ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(
        0,
        "rgba(95,157,255,0.5)"
    );

    gradient.addColorStop(
        1,
        "rgba(95,157,255,0)"
    );

    ctx.fillStyle =
    gradient;

    ctx.fill();
}
