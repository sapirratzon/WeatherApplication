import  React from 'react';

const Weather = (props) => {
    return(
        <div className={"container"}>
            <div className={"cards pt-4"}>
                <h1>{props.weatherBasicData.city}</h1>
                <h4>{props.weatherBasicData.region} {props.weatherBasicData.country}</h4>
                {props.weatherBasicData.tempCelsius ? <h1 className={"py-2"}>{props.weatherBasicData.tempCelsius}&deg;c</h1> : null}
                {minmaxTemp(props.weatherBasicData.minTemp, props.weatherBasicData.maxTemp)}
                {props.weatherBasicData.weatherIcon ?
                    <i id="icon"><img id="wicon" src={`http://openweathermap.org/img/w/${props.weatherBasicData.weatherIcon}.png`} alt="Weather icon" /></i>: null }
                <h4 className={"py-3"}> {props.weatherBasicData.description}</h4>
            </div>
        </div>
    )
};

function minmaxTemp(minTemp, maxTemp){
    return (
        <h3>
            <span className={"px-4"}>{minTemp}&deg;c</span>
            <span className={"px-4"}>{maxTemp}&deg;c</span>
        </h3>
    )
}

export default Weather;