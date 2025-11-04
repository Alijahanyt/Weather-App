// let city = document.getElementById('city');
// org city decoding api https://geocoding-api.open-meteo.com/v1/search?name=Tehran&count=1&language=en&format=json
// api `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
// org long and lat api https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m



const currentTemp = document.getElementById('temp')

async function getCity() {
    let city = prompt("Enter city name:").trim()
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`)

        if (!response.ok) {
            throw new Error("could not find city")
        }
        const cityData = await response.json()
        console.log(cityData)


        async function getWeather() {
            let long = cityData.results[0].longitude
            let lat = cityData.results[0].latitude
            // console.log(long, lat)
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m`)

                const weatherData = await response.json()
                // console.log(weatherData)
                console.log(weatherData)
                currentTemp.innerText = `temp is ${weatherData.current.temperature_2m}`
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

getCity()