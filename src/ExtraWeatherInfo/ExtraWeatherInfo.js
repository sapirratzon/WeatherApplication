import React from 'react'
import './ExtraWeatherInfo.css'

const ExtraInfo = props => {
    return (
        <div className={"container"}>
            <div className={"cards pt-4"}>
                <ol>
                    <li className={"py-6"}>Speed: {props.weatherExtraData.windSpeed} m/s</li>
                    <li className={"py-6"}>Humidity: {props.weatherExtraData.humidity} %</li>
                    <li className={"py-6"}>Pressure: {props.weatherExtraData.atmoPressure} hpa</li>
                    <li className={"py-6"}>Sunrise Time: {props.weatherExtraData.sunriseTime}</li>
                    <li className={"py-6"}>Sunset Time: {props.weatherExtraData.sunsetTime}</li>
                </ol>
            </div>
        </div>
    )
};

export default ExtraInfo;