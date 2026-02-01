// let city = document.getElementById('city');
// org city decoding api https://geocoding-api.open-meteo.com/v1/search?name=Tehran&count=1&language=en&format=json
// api `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
// org long and lat api https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m



const cityName = document.getElementById('cityName')
const date = document.getElementById('date')
const temperature = document.getElementById('temp')
const feelsLike = document.getElementById('feelsLike')
const humidity = document.getElementById('humidity')
const wind = document.getElementById('wind')
const precipitation = document.getElementById('precipitation')
const weatherIcon = document.getElementById('weatherIcon')
const forecast = document.querySelectorAll('.forecast-days')
const forecastIcons = document.querySelectorAll('.forecast-icons img')
const minTemp = document.querySelectorAll('.forecast-icons span')
const maxTemp = document.querySelectorAll('.maxTemp')
const hourlyDate = document.getElementById('hourlyDate')
const hourlyIcons = document.querySelectorAll('.hourlyIcons')
const hourlyTemp = document.querySelectorAll('.hourlyTemp')
const hourlyTime = document.querySelectorAll('.hourlyTime')

hourlyDate.innerText = new Date().toLocaleDateString('en-US', {
    weekday: 'long'
})

date.innerText = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
})



const weatherIcons = {
    0: 'icon-sunny.webp',
    1: 'icon-partly-cloudy.webp',
    2: 'icon-partly-cloudy.webp',
    3: 'icon-overcast.webp',
    45: 'icon-fog.webp',
    61: 'icon-rain.webp',
    95: 'icon-storm.webp',
    // add more codes if needed
};





let city = document.getElementById('searchInput')

city.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        getCity()
    }
})

async function getCity() {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city.value.trim()}&count=1&language=en&format=json`)

        if (!response.ok) {
            throw new Error("could not find city")
        }
        const cityData = await response.json()
        console.log(cityData)


        async function getWeather() {
            let long = cityData.results[0].longitude
            let lat = cityData.results[0].latitude
            let timezone = cityData.results[0].timezone
            // console.log(long, lat)
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&timezone=${timezone}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,surface_pressure,wind_speed_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,pressure_msl,surface_pressure,wind_speed_10m`
                )

                const weatherData = await response.json()
                console.log(weatherData)
                cityName.innerText = `${cityData.results[0].name}, ${cityData.results[0].country}`
                temperature.innerText = `${weatherData.current.temperature_2m} °C`;
                feelsLike.innerText = `${weatherData.current.apparent_temperature} °C`;
                humidity.innerText = `${weatherData.current.relative_humidity_2m} %`;
                wind.innerText = `${weatherData.current.wind_speed_10m} km/h`;
                precipitation.innerText = `${weatherData.current.precipitation} mm`
                weatherIcon.src = `src/assets/images/${weatherIcons[weatherData.current.weather_code] || 'icon-sunny.webp'}`
                forecastIcons.forEach((icon, index) => {
                    icon.src = `src/assets/images/${weatherIcons[weatherData.daily.weather_code[index]] || 'icon-sunny.webp'}`
                })
                hourlyIcons.forEach((icon, index) => {
                    icon.src = `src/assets/images/${weatherIcons[weatherData.hourly.weather_code[index]] || 'icon-sunny.webp'}`
                })

                const dailyMin = weatherData.daily.temperature_2m_min
                const dailyMax = weatherData.daily.temperature_2m_max

                minTemp.forEach((el, index) => {
                    if (dailyMin[index] !== undefined) {
                        el.innerText = `${Math.round(dailyMin[index])}°`
                    }
                })

                maxTemp.forEach((el, index) => {
                    if (dailyMax[index] !== undefined) {
                        el.innerText = `${Math.round(dailyMax[index])}°`
                    }
                })
                hourlyTime.forEach((el, index) => {
                    const hour = new Date(weatherData.hourly.time[index]).getHours();
                    el.innerText = `${hour}:00`;
                })
                hourlyTemp.forEach((el, index) => {
                    if (weatherData.hourly.temperature_2m[index] !== undefined) {
                        el.innerText = `${Math.round(weatherData.hourly.temperature_2m[index])}°`;
                    }
                });


            }
            catch (error) {
                console.log(error)
            }
        }
        getWeather()
    }
    catch (error) {
        console.log(error)
    }
    function updateForecastWeekdays() {
        const forecast = document.querySelectorAll('.forecast-days');

        forecast.forEach((el, index) => {
            const date = new Date();
            date.setDate(date.getDate() + index);

            const weekday = date.toLocaleDateString('en-US', {
                weekday: 'short'
            });

            el.innerText = weekday;
        });
    }
    updateForecastWeekdays();

}




async function getDefaultCity() {
    try {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) throw new Error('Failed to get IP location');

        const data = await response.json();
        const cityFromIP = data.city;
        if (cityFromIP) {
            // Fill the input with the city from IP
            document.getElementById('searchInput').value = cityFromIP;
            getCity(); // fetch weather for this city
        }
    } catch (error) {
        console.error('IP location error:', error);
        // fallback default
        document.getElementById('searchInput').value = 'Berlin';
        getCity();
    }
}
getDefaultCity();