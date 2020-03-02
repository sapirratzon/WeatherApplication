import React from 'react'
import './ExtraWeatherInfo.css'

const ExtraInfo = props => {
    return(
        <div className={"container"}>
            <div className={"cards pt-4"}>
                <ol>
                    <li className={"py-6"}>Speed: {props.wind_speed} m/s</li>
                    <li className={"py-6"}>Humidity: {props.humidity} %</li>
                    <li className={"py-6"}>Pressure: {props.atmo_pressure} hpa</li>
                    <li className={"py-6"}>Sunrise Time: {props.sunrise_time}</li>
                    <li className={"py-6"}>Sunset Time: {props.sunset_time}</li>
                </ol>
            </div>
        </div>
    )};

export default ExtraInfo;