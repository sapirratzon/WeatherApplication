import React from 'react'
import './ChooseCityForm.css'

const Form = props => {
    return(
        <div className={"container text-light"}>
            <form onSubmit={props.loadWeather}>
                <div className={"row"}>
                    <div className={"col-md-3 offset-md-2"}>
                        <input type={"text"} className={"form-control"} name={"city_zip_code"} autoComplete={"off"} placeholder={"Zip Code"}/>
                    </div>
                    <div className={"col-md-3"}>
                        <input type={"text"} className={"form-control"} name={"country"} autoComplete={"off"} placeholder={"Country"}/>
                    </div>
                    <div className={"col-md-3 mt-md-0 py-2 text-md-left"}>
                        <button className={"btn btn-warning"}>Real Time API</button>
                    </div>
                </div>
                <div>To Change location Please Enter Zip Code and Country (optional; default country: us)</div>
            </form>
            <div>{props.error? error(props.error_info) : null}</div>
        </div>
    )
};

function error(error) {
    return(
        <div className={"alert-alert-danger mx-5"} role={"alert"}>{error}</div>
    )
}

export default Form;