import React, {Component} from 'react';
import './App.css';
import Weather from './Weather/Weather'
import ExtraInfo from "./ExtraWeatherInfo/ExtraWeatherInfo"
import Form from "./ChooseCityForm/ChooseCityForm"
import ForecastChart from "./ForecastChart/ForecastChart"
import "bootstrap/dist/css/bootstrap.min.css";
import "weather-icons/css/weather-icons.css";
import { query } from './weather.json';
import Switch from 'react-switch'

const API_key = "9988c209622da3359cf6dc4d80276c44";

class App extends Component {
    constructor() {
        super();
        this.weatherInfo = query;
        this.state = {
            checked: false,
            forecast_data: {}
        };
        this.handleChange = this.handleChange.bind(this);
    };

    componentDidMount(){
        this.updateWeatherData_json();
        this.updateExtraWeatherData_json();
        this.updateWeatherForecast(null);
        this.updateCityRequest(false, "");
    }

    updateWeatherData_json(){
        const location = this.weatherInfo["results"]["channel"]["location"];
        const daily_forecast = this.weatherInfo["results"]["channel"]["item"];
        this.setState({
            city: location["city"],
            region: location["region"] + ", ",
            country: location["country"],
            icon: undefined,
            celsius: this.calCelsius_json(daily_forecast["condition"]["temp"]),
            min_temp: this.calCelsius_json(daily_forecast["forecast"][0]["low"]),
            max_temp: this.calCelsius_json(daily_forecast["forecast"][0]["high"]),
            description: this.weatherInfo["results"]["channel"]["item"]["condition"]["text"]
        })
    }

    updateWeatherData_api(ZipWeatherData) {
        this.setState({
            city: ZipWeatherData.name,
            region: "",
            country: ZipWeatherData.sys.country,
            celsius: this.calCelsius_api(ZipWeatherData.main.temp, 0),
            min_temp: this.calCelsius_api(ZipWeatherData.main.temp_min, 0),
            max_temp: this.calCelsius_api(ZipWeatherData.main.temp_max, 0),
            description: ZipWeatherData.weather[0].description,
            icon: ZipWeatherData.weather[0].icon
        })
    }

    updateExtraWeatherData_json(){
        const channel_json = this.weatherInfo["results"]["channel"];
        this.setState({
            wind_speed: Math.round(["wind"]["speed"] * 0.44704),
            humidity: channel_json["atmosphere"]["humidity"],
            atmo_pressure: channel_json["atmosphere"]["pressure"],
            sunrise_time: channel_json["astronomy"]["sunrise"],
            sunset_time: channel_json["astronomy"]["sunset"]
        })
    }

    updateExtraWeatherData_api (ZipWeatherData) {
        let date = new Date(ZipWeatherData.sys.sunrise * 1000);
        let sunrise = date.getHours() + ":" + date.getMinutes();
        date = new Date(ZipWeatherData.sys.sunset * 1000);
        let sunset = date.getHours() + ":" + date.getMinutes();
        this.setState({
            sunrise_time: sunrise,
            sunset_time: sunset,
            wind_speed: ZipWeatherData.wind.speed,
            humidity: ZipWeatherData.main.humidity,
            atmo_pressure: ZipWeatherData.main.pressure,
        });
    }

    updateWeatherForecast(response){
        let weekly_forecast = {
            days: [],
            daily_high_temp: [],
            daily_low_temp: [],
            daily_description: []
        };
        if (!response)
            weekly_forecast = this.updateWeatherForecast_json(weekly_forecast);
        else
            weekly_forecast = this.updateWeatherForecast_api(response, weekly_forecast);
        this.setState({
            forecast_data: {
                labels: weekly_forecast.days,
                datasets: [
                    {
                        text: weekly_forecast.daily_description,
                        label: 'High Temperature',
                        borderColor: "red",
                        fill: false,
                        data: weekly_forecast.daily_high_temp
                    },
                    {
                        text: weekly_forecast.daily_description,
                        label: 'Low Temperature',
                        borderColor: "blue",
                        fill: false,
                        data: weekly_forecast.daily_low_temp
                    }
                ]
            }
        })
    }

    updateWeatherForecast_json(weekly_forecast){
        let days = 7;
        for (let idx = 0; idx < days; idx++){
            let daily_data = this.weatherInfo["results"]["channel"]["item"]["forecast"][idx];
            weekly_forecast.days.push(daily_data["day"]);
            weekly_forecast.daily_low_temp.push(this.calCelsius_json(daily_data["low"]));
            weekly_forecast.daily_high_temp.push(this.calCelsius_json(daily_data["high"]));
            weekly_forecast.daily_description.push(daily_data["text"]);
        }
        return weekly_forecast;
    }

    /**
     * /**
     * The given dataset is 5 day / 3 hour forecast.
     * This function calculate the min and max temperature of each day,
     * consider all the received hourly forecasts for this day.
     * @param forecastWeatherData - the api response
     * @param weekly_forecast - the dictionary for the forecast
     * @returns dictionary of the forecast results
     */
    updateWeatherForecast_api(forecastWeatherData, weekly_forecast){
        let temp_weekly_forecast = {};
        let forecastDay = "";
        for (let idx = 0; idx < forecastWeatherData.list.length; idx++){
            const daily_forecast = forecastWeatherData.list[idx];
            forecastDay = new Date(daily_forecast.dt * 1000).toString().split(' ')[0];
            if (!temp_weekly_forecast[forecastDay])
                temp_weekly_forecast[forecastDay] = [];
            temp_weekly_forecast[forecastDay].push(this.calCelsius_api(daily_forecast.main.temp_max, 2));
            temp_weekly_forecast[forecastDay].push(this.calCelsius_api(daily_forecast.main.temp_min, 2));
            weekly_forecast.daily_description.push(daily_forecast.weather[0].description);
        }
        for(let day in temp_weekly_forecast) {
            if (temp_weekly_forecast.hasOwnProperty(day)) {
                weekly_forecast.daily_low_temp.push(Math.min.apply(null, temp_weekly_forecast[day]));
                weekly_forecast.daily_high_temp.push(Math.max.apply(null, temp_weekly_forecast[day]));
            }
        }
        weekly_forecast.days = Object.keys(temp_weekly_forecast);
        return weekly_forecast;
    }

    updateCityRequest(isError, text){
        this.setState({
            error: isError,
            error_info: text
        })
    }

    handleChange(checked) {
        this.setState({ checked });
    }

    calCelsius_json(temp) {
        return Math.round((temp - 32) * 5/9);
    }

    calCelsius_api(temp, digits) {
        return (temp - 273.15).toFixed(digits);
    }

    getWeather = async (e) => {
        e.preventDefault();
        let city_zip_code = e.target.elements.city_zip_code.value;
        let country= e.target.elements.country.value;
        if (!city_zip_code) {
            city_zip_code = "10007";
            country = "us";
        }
        try {
            const zip_weather_api_call = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${city_zip_code},${country}&appid=${API_key}`);
            const forecast_api_call = await fetch(`https://api.openweathermap.org/data/2.5/forecast?zip=${city_zip_code},${country}&appid=${API_key}`);
            let ZipWeatherData = await zip_weather_api_call.json();
            let ForecastWeatherData = await forecast_api_call.json();
            this.updateWeatherData_api(ZipWeatherData);
            this.updateExtraWeatherData_api (ZipWeatherData);
            this.updateExtraWeatherData_api (ZipWeatherData);
            this.updateWeatherForecast(ForecastWeatherData);
            this.updateCityRequest(false, "");
        } catch (ex) {
            this.updateCityRequest(true, "Invalid Zip Code or Country, Please try again");
        }
    };

    render() {
        return (
            <div className={"App"}>
                <Form loadWeather={this.getWeather} error={this.state.error} error_info={this.state.error_info}/>
                <Weather
                    city={this.state.city}
                    region={this.state.region}
                    country={this.state.country}
                    temp_celsius={this.state.celsius}
                    min_temp={this.state.min_temp}
                    max_temp={this.state.max_temp}
                    description={this.state.description}
                    weatherIcon={this.state.icon}
                />
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
                    {this.state.checked ?
                        <ExtraInfo
                            wind_speed={this.state.wind_speed}
                            humidity={this.state.humidity}
                            atmo_pressure={this.state.atmo_pressure}
                            sunrise_time={this.state.sunrise_time}
                            sunset_time={this.state.sunset_time}
                        /> : null}
                </div>
                <ForecastChart forecast_data={this.state.forecast_data}/>
            </div>
        );
    }
}

export default App;
