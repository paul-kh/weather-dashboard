const cityInputEl = document.getElementById("search-city");
const searchBtnEl = document.getElementById("search-btn");
let searchCityStr = "";
const apiKey = "6f7d6642b79b540bd7c50a703fc51a88";
let cityIsFound = false; // set flag when city is found in the API server
let searchMethod;

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

function getSearchMethod(searchStr) {
    if (searchStr.length === 5 && parseInt(searchStr) + '' === searchStr) {
        searchMethod = 'zip';
    } else {
        searchMethod = 'q';
    }
}

function getCurrentWeather(searchStr) {
    cityIsFound = false;
    // Define variables for lat and lon for getting UV Index
    let cityLat = "";
    let cityLon = "";
    getSearchMethod(searchStr);
    const queryUrlCurrent = "https://api.openweathermap.org/data/2.5/weather?" + searchMethod + "=" +
        searchStr + "&units=imperial&appid=" +
        apiKey;
    // log queryURL for troubleshooting
    console.log("Current Weather URL: ", queryUrlCurrent);

    // Use the 3r-party API axios to query current weather data from API server of Open Weather
    axios.get(queryUrlCurrent).then(function (data) {
        console.log("Current weather data: ", data);
        // Get city name and assign it to global variable for showing searched cities to user
        if (data) { cityIsFound = true };
        searchCityStr = data.data.name; // update city with the city obtained from server
        console.log("searchCityStr is now assigned with city obtained from server: ", searchCityStr);
        currentWeatherToHTML(data);
    }); // end of axios
} // end of function getCurrentWeather()

function currentWeatherToHTML(dataObj) {
    // Get icon pictures from OpenWeather.org
    const iconName = dataObj.data.weather[0].icon;
    const iconSRC = "https://openweathermap.org/img/wn/" + iconName + "@2x.png";
    cityNameEl.innerHTML = dataObj.data.name + "&nbsp" + "(" + currentDay + ")";
    iconCurrentWeatherEl.setAttribute("src", iconSRC);
    tempCurrentWeatherEl.innerHTML = "Temperatur: " + dataObj.data.main.temp + " &#8457;";
    humidityCurrentWeatherEl.innerHTML = "Humidity: " + dataObj.data.main.humidity + " &#37;";
    windSpeedCurrentWeatherEl.innerHTML = "Wind Speed: " + dataObj.data.wind.speed + " MPH";

    // Get lat & lon for another query to get UV Index
    cityLat = dataObj.data.coord.lat;
    cityLon = dataObj.data.coord.lon;
    console.log("Lat: ", cityLat, " Lon: ", cityLon);
    getCurrentUVIndex(cityLat, cityLon);
} // end of displayCurrentWeather()

function getCurrentUVIndex(cityLat, cityLon) {
    const uvIndexQuery = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + apiKey;
    console.log("uvIndex Qery: ", uvIndexQuery);
    axios.get(uvIndexQuery).then(function (UVdata) {
        console.log("UV Index Data: ", UVdata);
        uvIndexCurrentWeatherEl.innerHTML = "UV Index: <span style='background-color:red; padding: 5px; border-radius: 3px;'>" + UVdata.data.value + "</span>";
    });
} // end of getCurrentUVIndex()

function saveSearchHistory() {
    const city = searchCityStr;
    const dataStr = localStorage.getItem("history") || "[]"; // if the saved data "history" not exist, create empty array
    const data = JSON.parse(dataStr);
    // if city already saved, do not save again
    if (data.indexOf(city) > -1) {
        console.log("City in array: ", data.indexOf(city));
        return;
    } else if (cityIsFound) { // if city was found at the server, save city as search history
        data.push(city);
        cityIsFound = false;
        console.log("Save cities: ", city);
        localStorage.setItem("history", JSON.stringify(data));
        console.log("City in array: ", data.indexOf(city));
    } else if (cityIsFound === false) { // if city was not found at the server, don't save it as search history
        return;
    } // end of if else 
} // end of saveSearchHistory()

function showHistory() {
    const historyEl = document.getElementById("search-history"); // search history container
    historyEl.innerHTML = ""; // Initially hide the search history container
    const dataStr = localStorage.getItem("history") || "[]"; // if localstorage don't exist, create and empty array
    const data = JSON.parse(dataStr);
    console.log("Output city array: ", data);
    // start looping through the array of local storage
    data.forEach(function (city) {
        const cardEl = document.createElement("div");
        cardEl.setAttribute("class", "card px-2 py-2");
        const historyBtnEl = document.createElement("button");
        historyBtnEl.setAttribute("class", "btn card-text text-left history-btn-js");
        historyBtnEl.innerHTML = city;
        console.log("City array element: ", city);
        historyEl.prepend(cardEl);
        cardEl.prepend(historyBtnEl);
    }); // end of forEach loop
}

function get5DayWeatherForcast(city) {
    const queryUrlForcast = "https://api.openweathermap.org/data/2.5/forecast?q=" +
        city + "&units=imperial&appid=" +
        apiKey;
    console.log("Forcast Weather URL: ", queryUrlForcast);
    // pull forcast data from API server
    const weathers = []; // create array to store all requied data from servers to display to HTML
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
        fiveDayForcastToHTML(weathers);
    }); // end of axios
}

function fiveDayForcastToHTML(weatherArray) {
    // Define constants of all elements for displaying to HTML
    const fiveCardTitleEls = document.querySelectorAll(".five-day-js");
    const fiveTempEls = document.querySelectorAll(".five-temp-js");
    const fiveHumidityEls = document.querySelectorAll(".five-humidity-js");
    const fiveIconEls = document.querySelectorAll(".five-icon-js");
    const iconSRCs = []; // array store SRC attributes for the five weather icons
    for (let i = 0; i < 5; i++) {
        fiveCardTitleEls[i].innerHTML = weatherArray[i].day; // Show date as card title for the five weather cards
        // Get icon SRC of each icon
        iconSRCs[i] = "https://openweathermap.org/img/wn/" + weatherArray[i].icon + "@2x.png";
        fiveIconEls[i].src = iconSRCs[i]; // Set SRC of each weather icon
        fiveTempEls[i].innerHTML = "Temp: " + weatherArray[i].temp + "&#8457;"; // Show temperature
        fiveHumidityEls[i].innerHTML = "Humidity: " + weatherArray[i].humidity + "&#37;"; // Show humidity         
    }
}

// Add OnClick() to the search button
searchBtnEl.addEventListener("click", function (event) {
    event.preventDefault();
    searchCityStr = cityInputEl.value.trim();
    console.log("City name: ", searchCityStr);
    // wait 500ms for global variable searchCityStr to be updated first before saving it to the local storage
    const myInterval = setInterval(function () {
        saveSearchHistory();
        clearInterval(myInterval);
        showHistory();
        clickHistory();
    }, 500);
    getCurrentWeather(searchCityStr);
    get5DayWeatherForcast(searchCityStr);


}); // end of onClick event

function clickHistory() {
    const historyBtnEls = document.querySelectorAll(".history-btn-js");
    console.log("history button elements: ", historyBtnEls);
    //add onClick event to each history button
    historyBtnEls.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const btnText = btn.innerHTML;
            console.log("Clicked on: ", btnText);
            getCurrentWeather(btnText);
            get5DayWeatherForcast(btnText);
        });
    });
}

function showLastSearchResult() {
    const dataStr = localStorage.getItem("history") || "[]"; // if localstorage don't exist, create and empty array
    const data = JSON.parse(dataStr);
    if (data.length > 0) {
        getCurrentWeather(data[data.length - 1]);
        get5DayWeatherForcast(data[data.length - 1]);
        console.log(data[data.length - 1]);
        clickHistory();
    }
}
showLastSearchResult();
showHistory();
clickHistory();





