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
const suggestionsDropdown = document.getElementById('suggestionsDropdown');

// Debounce timer for suggestions
let suggestionsTimeout;

// Listen for input changes to show city suggestions
city.addEventListener('input', async (e) => {
    const input = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(suggestionsTimeout);
    
    // Hide suggestions if input is empty
    if (input.length < 2) {
        suggestionsDropdown.classList.add('hidden');
        return;
    }
    
    // Debounce the API call
    suggestionsTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${input}&count=10&language=en&format=json`);
            
            if (!response.ok) {
                throw new Error("Could not fetch suggestions");
            }
            
            const data = await response.json();
            displaySuggestions(data.results || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsDropdown.classList.add('hidden');
        }
    }, 300); // 300ms debounce delay
});

// Display city suggestions
function displaySuggestions(results) {
    suggestionsDropdown.innerHTML = '';
    
    if (results.length === 0) {
        suggestionsDropdown.classList.add('hidden');
        return;
    }
    
    results.forEach(result => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'px-4 py-3 hover:bg-[#3a3650] cursor-pointer border-b border-[#3a3650] last:border-b-0';
        
        const cityName = result.name;
        const country = result.country ? `, ${result.country}` : '';
        const state = result.admin1 ? ` (${result.admin1})` : '';
        
        suggestionItem.innerHTML = `
            <p class="text-sm text-white">${cityName}${state}</p>
            <p class="text-xs text-gray-400">${country}</p>
        `;
        
        suggestionItem.addEventListener('click', () => {
            city.value = `${cityName}${country}`;
            suggestionsDropdown.classList.add('hidden');
            getCity();
        });
        
        suggestionsDropdown.appendChild(suggestionItem);
    });
    
    suggestionsDropdown.classList.remove('hidden');
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!city.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
        suggestionsDropdown.classList.add('hidden');
    }
});

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

                // Store weather data for unit conversion
                lastWeatherData = weatherData;

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
                
                // Populate day dropdown now that we have data
                populateDayDropdown();
                
                // Clear search input
                city.value = '';
                suggestionsDropdown.classList.add('hidden');


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

// Clear search input on initial load after a short delay
setTimeout(() => {
    city.value = '';
    suggestionsDropdown.classList.add('hidden');
}, 500);

// ===== UNITS CONTROL FUNCTIONALITY =====
let currentUnits = {
    temperature: 'celsius',
    windSpeed: 'kmh',
    precipitation: 'mm'
};

let lastWeatherData = null; // Store last fetched weather data for conversion

const unitsBtn = document.getElementById('unitsBtn');
const unitsMenu = document.getElementById('unitsMenu');

// Toggle units menu
unitsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    unitsMenu.classList.toggle('hidden');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!unitsBtn.contains(e.target) && !unitsMenu.contains(e.target)) {
        unitsMenu.classList.add('hidden');
    }
});

// Handle unit changes
const temperatureRadios = document.querySelectorAll('input[name="temperature"]');
const windSpeedRadios = document.querySelectorAll('input[name="windSpeed"]');
const precipitationRadios = document.querySelectorAll('input[name="precipitation"]');

// Update checkmarks on radio buttons
function updateCheckmarks() {
    // Temperature checkmarks
    temperatureRadios.forEach(radio => {
        const label = radio.closest('label');
        const checkmark = label.querySelector('span:last-child');
        if (radio.checked) {
            checkmark.textContent = '✓';
            checkmark.classList.add('text-blue-400', 'font-bold');
        } else {
            checkmark.textContent = '';
            checkmark.classList.remove('text-blue-400', 'font-bold');
        }
    });

    // Wind speed checkmarks
    windSpeedRadios.forEach(radio => {
        const label = radio.closest('label');
        const checkmark = label.querySelector('span:last-child');
        if (radio.checked) {
            checkmark.textContent = '✓';
            checkmark.classList.add('text-blue-400', 'font-bold');
        } else {
            checkmark.textContent = '';
            checkmark.classList.remove('text-blue-400', 'font-bold');
        }
    });

    // Precipitation checkmarks
    precipitationRadios.forEach(radio => {
        const label = radio.closest('label');
        const checkmark = label.querySelector('span:last-child');
        if (radio.checked) {
            checkmark.textContent = '✓';
            checkmark.classList.add('text-blue-400', 'font-bold');
        } else {
            checkmark.textContent = '';
            checkmark.classList.remove('text-blue-400', 'font-bold');
        }
    });
}

// Temperature conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}

// Wind speed conversion (km/h to mph: divide by 1.609)
function kmhToMph(kmh) {
    return kmh / 1.609;
}

function mphToKmh(mph) {
    return mph * 1.609;
}

// Precipitation conversion (mm to inches: divide by 25.4)
function mmToInches(mm) {
    return mm / 25.4;
}

function inchesToMm(inches) {
    return inches * 25.4;
}

// Update display with current units
function updateDisplayUnits() {
    if (!lastWeatherData) return;

    const current = lastWeatherData.current;
    const daily = lastWeatherData.daily;

    // Temperature
    if (currentUnits.temperature === 'celsius') {
        temperature.innerText = `${current.temperature_2m} °C`;
        feelsLike.innerText = `${current.apparent_temperature} °C`;
    } else {
        const tempF = Math.round(celsiusToFahrenheit(current.temperature_2m) * 10) / 10;
        const feelsF = Math.round(celsiusToFahrenheit(current.apparent_temperature) * 10) / 10;
        temperature.innerText = `${tempF} °F`;
        feelsLike.innerText = `${feelsF} °F`;
    }

    // Wind speed
    if (currentUnits.windSpeed === 'kmh') {
        wind.innerText = `${current.wind_speed_10m} km/h`;
    } else {
        const windMph = Math.round(kmhToMph(current.wind_speed_10m) * 10) / 10;
        wind.innerText = `${windMph} mph`;
    }

    // Precipitation
    if (currentUnits.precipitation === 'mm') {
        precipitation.innerText = `${current.precipitation} mm`;
    } else {
        const precipInches = Math.round(mmToInches(current.precipitation) * 100) / 100;
        precipitation.innerText = `${precipInches} in`;
    }

    // Daily forecast temps
    const dailyMin = daily.temperature_2m_min;
    const dailyMax = daily.temperature_2m_max;

    minTemp.forEach((el, index) => {
        if (dailyMin[index] !== undefined) {
            let minValue = Math.round(dailyMin[index]);
            if (currentUnits.temperature === 'fahrenheit') {
                minValue = Math.round(celsiusToFahrenheit(minValue));
            }
            el.innerText = `${minValue}°`;
        }
    });

    maxTemp.forEach((el, index) => {
        if (dailyMax[index] !== undefined) {
            let maxValue = Math.round(dailyMax[index]);
            if (currentUnits.temperature === 'fahrenheit') {
                maxValue = Math.round(celsiusToFahrenheit(maxValue));
            }
            el.innerText = `${maxValue}°`;
        }
    });

    // Hourly temps
    const hourlyTemps = lastWeatherData.hourly.temperature_2m;
    hourlyTemp.forEach((el, index) => {
        if (hourlyTemps[index] !== undefined) {
            let temp = Math.round(hourlyTemps[index]);
            if (currentUnits.temperature === 'fahrenheit') {
                temp = Math.round(celsiusToFahrenheit(temp));
            }
            const unit = currentUnits.temperature === 'fahrenheit' ? '°F' : '°C';
            el.innerText = `${temp}${unit}`;
        }
    });
}

// Listen for unit changes
temperatureRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            currentUnits.temperature = e.target.value;
            updateCheckmarks();
            updateRadioButtonStyles();
            updateDisplayUnits();
        }
    });
});

windSpeedRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            currentUnits.windSpeed = e.target.value;
            updateCheckmarks();
            updateRadioButtonStyles();
            updateDisplayUnits();
        }
    });
});

precipitationRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            currentUnits.precipitation = e.target.value;
            updateCheckmarks();
            updateRadioButtonStyles();
            updateDisplayUnits();
        }
    });
});

// Initialize checkmarks
updateCheckmarks();

// ===== UPDATE CUSTOM RADIO BUTTON STYLING =====
function updateRadioButtonStyles() {
    // Update temperature radio buttons
    temperatureRadios.forEach(radio => {
        const label = radio.closest('label');
        const circle = label.querySelector('.rounded-full');
        const innerDot = circle.querySelector('div');
        
        if (radio.checked) {
            circle.classList.remove('border-gray-500');
            circle.classList.add('border-[#4657d9]');
            innerDot.classList.remove('bg-transparent');
            innerDot.classList.add('bg-[#4657d9]');
        } else {
            circle.classList.remove('border-[#4657d9]');
            circle.classList.add('border-gray-500');
            innerDot.classList.remove('bg-[#4657d9]');
            innerDot.classList.add('bg-transparent');
        }
    });
    
    // Update wind speed radio buttons
    windSpeedRadios.forEach(radio => {
        const label = radio.closest('label');
        const circle = label.querySelector('.rounded-full');
        const innerDot = circle.querySelector('div');
        
        if (radio.checked) {
            circle.classList.remove('border-gray-500');
            circle.classList.add('border-[#4657d9]');
            innerDot.classList.remove('bg-transparent');
            innerDot.classList.add('bg-[#4657d9]');
        } else {
            circle.classList.remove('border-[#4657d9]');
            circle.classList.add('border-gray-500');
            innerDot.classList.remove('bg-[#4657d9]');
            innerDot.classList.add('bg-transparent');
        }
    });
    
    // Update precipitation radio buttons
    precipitationRadios.forEach(radio => {
        const label = radio.closest('label');
        const circle = label.querySelector('.rounded-full');
        const innerDot = circle.querySelector('div');
        
        if (radio.checked) {
            circle.classList.remove('border-gray-500');
            circle.classList.add('border-[#4657d9]');
            innerDot.classList.remove('bg-transparent');
            innerDot.classList.add('bg-[#4657d9]');
        } else {
            circle.classList.remove('border-[#4657d9]');
            circle.classList.add('border-gray-500');
            innerDot.classList.remove('bg-[#4657d9]');
            innerDot.classList.add('bg-transparent');
        }
    });
}

// ===== HOURLY FORECAST DAY SELECTION =====
let currentDayIndex = 0; // 0 = today
const hourlyDateBtn = document.getElementById('hourlyDateBtn');
const dayDropdown = document.getElementById('dayDropdown');
const hourlyDateDisplay = document.getElementById('hourlyDate');

// Toggle day dropdown
hourlyDateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dayDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!hourlyDateBtn.contains(e.target) && !dayDropdown.contains(e.target)) {
        dayDropdown.classList.add('hidden');
    }
});

// Populate day dropdown options
function populateDayDropdown() {
    dayDropdown.innerHTML = '';
    
    if (!lastWeatherData) return;
    
    const dailyTimes = lastWeatherData.daily.time; // Array of dates
    
    for (let i = 0; i < Math.min(7, dailyTimes.length); i++) {
        const date = new Date(dailyTimes[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        const dayOption = document.createElement('button');
        dayOption.type = 'button';
        dayOption.className = `w-full text-left px-4 py-2 hover:bg-[#3a3650] transition-colors ${i === currentDayIndex ? 'bg-[#3a3650]' : ''}`;
        dayOption.textContent = dayName;
        
        dayOption.addEventListener('click', () => {
            currentDayIndex = i;
            updateHourlyForecast(i);
            hourlyDateDisplay.textContent = dayName;
            dayDropdown.classList.add('hidden');
            populateDayDropdown(); // Refresh to show new selection
        });
        
        dayDropdown.appendChild(dayOption);
    }
}

// Update hourly forecast for selected day
function updateHourlyForecast(dayIndex) {
    if (!lastWeatherData) return;
    
    const hourlyData = lastWeatherData.hourly;
    const dailyTimes = lastWeatherData.daily.time;
    
    // Get start and end times for the selected day
    const dayDate = new Date(dailyTimes[dayIndex]);
    dayDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(dayDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Find hourly data indices for this day
    const hourlyTimes = hourlyData.time.map(t => new Date(t));
    const dayHours = [];
    
    // Find all hourly indices for this day
    hourlyTimes.forEach((time, index) => {
        if (time >= dayDate && time < nextDay) {
            dayHours.push(index);
        }
    });
    
    // Update only the first 8 hourly display items with this day's data
    hourlyTime.forEach((el, displayIndex) => {
        if (displayIndex < dayHours.length && displayIndex < 8) {
            const hourlyIndex = dayHours[displayIndex];
            const hourTime = new Date(hourlyData.time[hourlyIndex]);
            const hour = hourTime.getHours();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            
            el.innerText = `${displayHour} ${ampm}`;
            
            // Update temperature
            let temp = Math.round(hourlyData.temperature_2m[hourlyIndex]);
            if (currentUnits.temperature === 'fahrenheit') {
                temp = Math.round(celsiusToFahrenheit(temp));
            }
            const unit = currentUnits.temperature === 'fahrenheit' ? '°F' : '°C';
            hourlyTemp[displayIndex].innerText = `${temp}${unit}`;
            
            // Update weather icon
            const weatherCode = hourlyData.weather_code[hourlyIndex];
            hourlyIcons[displayIndex].src = `src/assets/images/${weatherIcons[weatherCode] || 'icon-sunny.webp'}`;
        }
    });
}