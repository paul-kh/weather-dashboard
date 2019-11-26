const cityInputEl = document.getElementById("search-city");
const searchBtnEl = document.getElementById("search-btn");
const apiKey = "6f7d6642b79b540bd7c50a703fc51a88";

// Get current time
const day = new Date();
const dayWrapper = moment(day);
const currentDay = dayWrapper.format('MM/DD/YYYY');
const cityNameEl = document.getElementById("city-name");
const iconCurrentWeatherEl = document.getElementById("icon-current-weather");
const tempCurrentWeatherEl = document.getElementById("temp");
const humidityCurrentWeatherEl = document.getElementById("humidity");
const windSpeedCurrentWeatherEl = document.getElementById("wind-speed");
const uvIndexCurrentWeatherEl = document.getElementById("uv-index");

// Add OnClick() to the search button
searchBtnEl.addEventListener("click", function (event) {
    event.preventDefault();
    const searchCityStr = cityInputEl.value.trim();
    console.log("City name: ", searchCityStr);

    // Get current weather data
    function getCurrentWeather() {
        // Define variables for lat and lon for getting UV Index
        let cityLat = "";
        let cityLon = "";
        const queryUrlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" +
            searchCityStr + "&units=imperial&appid=" +
            apiKey;
        // log queryURL for troubleshooting
        console.log("Current Weather URL: ", queryUrlCurrent);

        // Use the 3r-party API axios to query current weather data from API server of Open Weather
        axios.get(queryUrlCurrent).then(function (data) {
            console.log("Current weather data: ", data);

            function displayCurrentWeather() {
                // Get icon pictures from OpenWeather.org
                const iconName = data.data.weather[0].icon;
                const iconSRC = "http://openweathermap.org/img/wn/" + iconName + "@2x.png";
                cityNameEl.innerHTML = data.data.name + "&nbsp" + "(" + currentDay + ")";
                iconCurrentWeatherEl.setAttribute("src", iconSRC);
                tempCurrentWeatherEl.innerHTML = "Temperatur: " + data.data.main.temp + " &#8457;";
                humidityCurrentWeatherEl.innerHTML = "Humidity: " + data.data.main.humidity + " &#37;";
                windSpeedCurrentWeatherEl.innerHTML = "Wind Speed: " + data.data.wind.speed + " MPH";

                // Get lat & lon for another query to get UV Index
                cityLat = data.data.coord.lat;
                cityLon = data.data.coord.lon;
                console.log("Lat: ", cityLat, " Lon: ", cityLon);

                function getCurrentUVIndex() {
                    const uvIndexQuery = "http://api.openweathermap.org/data/2.5/uvi?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + apiKey;
                    console.log("uvIndex Qery: ", uvIndexQuery);
                    axios.get(uvIndexQuery).then(function (UVdata) {
                        console.log("UV Index Data: ", UVdata);
                        uvIndexCurrentWeatherEl.innerHTML = "UV Index: <span style='background-color:red; padding: 5px; border-radius: 3px;'>" + UVdata.data.value + "</span>";
                    });
                } // end of getCurrentUVIndex()
                getCurrentUVIndex();
            } // end of displayCurrentWeather()
            displayCurrentWeather();
        }); // end of axios

    } // end of function getCurrentWeather()
    getCurrentWeather();
    // ---------------------------------------- END OF CURRENT WEATHER-----------------------------------------------------------------------------

    // Get 5-day forcast 
    const queryUrlForcast = "http://api.openweathermap.org/data/2.5/forecast?q=" +
        searchCityStr + "&units=imperial&appid=" +
        apiKey;
    console.log("Forcast Weather URL: ", queryUrlForcast);
    // Define constants of all elements for displaying to HTML
    const fiveCardTitleEls = document.querySelectorAll(".five-day-js");
    const fiveTempEls = document.querySelectorAll(".five-temp-js");
    const fiveHumidityEls = document.querySelectorAll(".five-humidity-js");
    const fiveIconEls = document.querySelectorAll(".five-icon-js");
    
    function get5DayWeatherForcast() {
        // use axios to pull data from API server
        const weathers = [];
        axios.get(queryUrlForcast).then(function (data) {
            console.log("5-day forcast data: ", data);
            for (let i = 0; i < data.data.list.length; i++) {
                // Get weather data of 6:00:00 AM for each day, and push into an array: [{date: "MM-DD-YYYY 6:00:00", icon: "", temp: "", humidity: ""}, ...]
                let SixAM = moment(data.data.list[i].dt_txt).format("H");
                let date = moment(data.data.list[i].dt_txt).format("MM/DD/YYYY");
                if (SixAM === "6") {
                    weathers.push({ "day": date, "icon": data.data.list[i].weather[0].icon, "temp": data.data.list[i].main.temp, "humidity": data.data.list[i].main.humidity });
                }
            }
            console.log("5-day weather: ", weathers);
            function displayToHTML() {
                const iconSRCs = []; // array store SRC attributes for the five weather icons
                for (let i = 0; i < 5; i++){
                    fiveCardTitleEls[i].innerHTML = weathers[i].day; // Show date as card title for the five weather cards
                    // Get icon SRC of each icon
                    iconSRCs[i] = "http://openweathermap.org/img/wn/" + weathers[i].icon + "@2x.png";
                    fiveIconEls[i].src = iconSRCs[i]; // Set SRC of each weather icon
                    fiveTempEls[i].innerHTML = "Temp: " + weathers[i].temp + "&#8457;"; // Show temperature
                    fiveHumidityEls[i].innerHTML = "Humidity: " + weathers[i].humidity + "&#37;"; // Show humidity         
                }
            }
            displayToHTML();
        }); // end of axios
    }
    get5DayWeatherForcast();





}); // end of onClick event

