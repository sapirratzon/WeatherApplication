import  React from 'react';

const Weather = (props) => {
    return(
        <div className={"container"}>
            <div className={"cards pt-4"}>
                <h1>{props.city}</h1>
                <h4>{props.region} {props.country}</h4>
                {props.temp_celsius ? <h1 className={"py-2"}>{props.temp_celsius}&deg;c</h1> : null}
                {minmaxTemp(props.min_temp, props.max_temp)}
                {props.weatherIcon ? <i id="icon"><img id="wicon" src={`http://openweathermap.org/img/w/${props.weatherIcon}.png`} alt="Weather icon" /></i>: null }
                <h4 className={"py-3"}> {props.description}</h4>
            </div>
        </div>
    )
};

function minmaxTemp(min_temp, max_temp){
    return (
        <h3>
            <span className={"px-4"}>{min_temp}&deg;c</span>
            <span className={"px-4"}>{max_temp}&deg;c</span>
        </h3>
    )
}

export default Weather;