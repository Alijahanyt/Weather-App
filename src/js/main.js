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

date.innerText = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
})


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
}




async function getDefaultCity() {
    try {
        const response = await fetch('https://ipapi.co/json/');
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