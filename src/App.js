import React, {Component} from 'react';
import './App.css';
import Weather from './Weather/Weather'
import ExtraInfo from "./ExtraWeatherInfo/ExtraWeatherInfo"
import Form from "./ChooseCityForm/ChooseCityForm"
import ForecastChart from "./ForecastChart/ForecastChart"
import "bootstrap/dist/css/bootstrap.min.css";
import "weather-icons/css/weather-icons.css";
import {query} from './weather.json';
import Switch from 'react-switch'

class App extends Component {
    constructor() {
        super();
        this.weatherInfo = query;
        this.state = {
            checked: false,
            weatherBasicData: {},
            weatherExtraData: {},
            forecastData: {},
            error: {}
        };
        this.handleChange = this.handleChange.bind(this);
    };

    componentDidMount() {
        this.updateWeatherDataJson();
        this.updateExtraWeatherDataJson();
        this.updateWeatherForecast(null);
        this.updateCityRequest(false, "");
    };

    updateWeatherDataJson = () => {
        const location = this.weatherInfo["results"]["channel"]["location"];
        const dailyForecast = this.weatherInfo["results"]["channel"]["item"];
        const weatherData = {
            city: location["city"],
            region: location["region"] + ", ",
            country: location["country"],
            icon: undefined,
            celsius: this.calCelsiusJson(dailyForecast["condition"]["temp"]),
            minTemp: this.calCelsiusJson(dailyForecast["forecast"][0]["low"]),
            maxTemp: this.calCelsiusJson(dailyForecast["forecast"][0]["high"]),
            description: this.weatherInfo["results"]["channel"]["item"]["condition"]["text"]
        };
        this.setState({
            weatherBasicData: weatherData
        })
    };

    updateWeatherDataAPI(zipWeatherData) {
        const weatherData = {
            city: zipWeatherData.name,
            region: "",
            country: zipWeatherData.sys.country,
            celsius: zipWeatherData.main.temp,
            minTemp: zipWeatherData.main.temp_min,
            maxTemp: zipWeatherData.main.temp_max,
            description: zipWeatherData.weather[0].description,
            icon: zipWeatherData.weather[0].icon
        };
        this.setState({
            weatherBasicData: weatherData
        })
    }

    updateExtraWeatherDataJson = () => {
        const channelJson = this.weatherInfo["results"]["channel"];
        const weatherData = {
            windSpeed: Math.round(channelJson["wind"]["speed"] * 0.44704),
            humidity: channelJson["atmosphere"]["humidity"],
            atmoPressure: channelJson["atmosphere"]["pressure"],
            sunriseTime: channelJson["astronomy"]["sunrise"],
            sunsetTime: channelJson["astronomy"]["sunset"]
        };
        this.setState({
            weatherExtraData: weatherData
        })
    };

    updateExtraWeatherDataAPI = (zipWeatherData) => {
        let date = new Date(zipWeatherData.sys.sunrise * 1000);
        let sunrise = date.getHours() + ":" + date.getMinutes();
        date = new Date(zipWeatherData.sys.sunset * 1000);
        let sunset = date.getHours() + ":" + date.getMinutes();
        const weatherData = {
            sunriseTime: sunrise,
            sunsetTime: sunset,
            windSpeed: zipWeatherData.wind.speed,
            humidity: zipWeatherData.main.humidity,
            atmoPressure: zipWeatherData.main.pressure,
        };
        this.setState({
            weatherExtraData: weatherData
        })
    };

    updateWeatherForecast = (response) => {
        let weeklyForecast = {
            days: [],
            dailyHighTemp: [],
            dailyLowTemp: [],
            dailyDescription: []
        };
        response ? weeklyForecast = this.updateWeatherForecastAPI(response, weeklyForecast) :
            weeklyForecast = this.updateWeatherForecastJson(weeklyForecast);
        this.setState({
            forecastData: {
                labels: weeklyForecast.days,
                datasets: [
                    {
                        text: weeklyForecast.dailyDescription,
                        label: 'High Temperature',
                        borderColor: "red",
                        fill: false,
                        data: weeklyForecast.dailyHighTemp
                    },
                    {
                        text: weeklyForecast.dailyDescription,
                        label: 'Low Temperature',
                        borderColor: "blue",
                        fill: false,
                        data: weeklyForecast.dailyLowTemp
                    }
                ]
            }
        })
    };

    updateWeatherForecastJson = (weeklyForecast) => {
        const days = 7;
        for (let idx = 0; idx < days; idx++) {
            let dailyData = this.weatherInfo["results"]["channel"]["item"]["forecast"][idx];
            weeklyForecast.days.push(dailyData["day"]);
            weeklyForecast.dailyLowTemp.push(this.calCelsiusJson(dailyData["low"]));
            weeklyForecast.dailyHighTemp.push(this.calCelsiusJson(dailyData["high"]));
            weeklyForecast.dailyDescription.push(dailyData["text"]);
        }
        return weeklyForecast;
    };

    /**
     * /**
     * The given dataset is 5 day / 3 hour forecast.
     * This function calculate the min and max temperature of each day,
     * consider all the received hourly forecasts for this day.
     * @param forecastWeatherData - the api response
     * @param weeklyForecast - the dictionary for the forecast
     * @returns dictionary of the forecast results
     */
    updateWeatherForecastAPI = (forecastWeatherData, weeklyForecast) => {
        let tempWeeklyForecast = {};
        let forecastDay = "";
        for (let idx = 0; idx < forecastWeatherData.list.length; idx++) {
            const dailyForecast = forecastWeatherData.list[idx];
            forecastDay = new Date(dailyForecast.dt * 1000).toString().split(' ')[0];
            if (!tempWeeklyForecast[forecastDay])
                tempWeeklyForecast[forecastDay] = [];
            tempWeeklyForecast[forecastDay].push(dailyForecast.main.temp_max);
            tempWeeklyForecast[forecastDay].push(dailyForecast.main.temp_min);
            weeklyForecast.dailyDescription.push(dailyForecast.weather[0].description);
        }
        for (let day in tempWeeklyForecast) {
            if (tempWeeklyForecast.hasOwnProperty(day)) {
                weeklyForecast.dailyLowTemp.push(Math.min.apply(null, tempWeeklyForecast[day]));
                weeklyForecast.dailyHighTemp.push(Math.max.apply(null, tempWeeklyForecast[day]));
            }
        }
        weeklyForecast.days = Object.keys(tempWeeklyForecast);
        return weeklyForecast;
    };

    updateCityRequest = (isError, text) => {
        this.setState({
            error: isError,
            errorInfo: text
        })
    };

    handleChange = (checked) => {
        this.setState({checked});
    };

    calCelsiusJson = (temp) => {
        return Math.round((temp - 32) * 5 / 9);
    };

    getWeather = async (event) => {
        event.preventDefault();
        let cityZipCode = event.target.elements.cityZipCode.value;
        let country = event.target.elements.country.value;
        if (!cityZipCode) {
            cityZipCode = "10007";
            country = "us";
        }
        try {
            const zipWeatherAPICall = await fetch(process.env.REACT_APP_WEATHER_API +
                '&units=metric&zip=' + cityZipCode + "," + country);
            const forecastAPICall = await fetch(process.env.REACT_APP_WEATHER_FORECAST_API +
                '&units=metric&zip=' + cityZipCode + "," + country);
            const zipWeatherData = await zipWeatherAPICall.json();
            const ForecastWeatherData = await forecastAPICall.json();
            this.updateWeatherDataAPI(zipWeatherData);
            this.updateExtraWeatherDataAPI(zipWeatherData);
            this.updateExtraWeatherDataAPI(zipWeatherData);
            this.updateWeatherForecast(ForecastWeatherData);
            this.updateCityRequest(false, "");
        } catch (ex) {
            this.updateCityRequest(true, "Invalid Zip Code or Country, Please try again");
        }
    };

    render() {
        return (
            <div className={"App"}>
                <Form loadWeather={this.getWeather} error={this.state.error} errorInfo={this.state.errorInfo}/>
                <Weather className={"weather"} weatherBasicData={this.state.weatherBasicData}/>
                <div className={"extraData"}>
                    <label><span>Press for  </span>
                        <Switch
                            onChange={this.handleChange}
                            checked={this.state.checked}
                            offColor={"#FFA500"}
                            onColor={"#ffedcc"}
                            width={70}
                            checkedIcon={<div>less</div>}
                            uncheckedIcon={<div>more</div>}
                        /> <span>  Information</span>
                    </label>
                    {this.state.checked ? <ExtraInfo weatherExtraData={this.state.weatherExtraData}/> : null}
                </div>
                <ForecastChart forecastData={this.state.forecastData}/>
            </div>
        );
    }
}

export default App;
