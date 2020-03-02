import React from 'react'
import {Line} from 'react-chartjs-2'
import './ForecastChart.css'

const ForecastChart = props => {
    return(
        <div className={"chart"}>
            <h4>Daily Forecast</h4>
            <Line
                options={
                    {
                        tooltips: {
                            callbacks: {
                                title: function (tooltipItem, data) {
                                    return data['labels'][tooltipItem[0]['index']];
                                },
                                label: function (tooltipItem, data) {
                                    return data['datasets'][0]['data'][tooltipItem['index']] + "℃";
                                },
                                afterLabel: function (tooltipItem, data) {
                                    return data['datasets'][0]['text'][tooltipItem['index']];
                                },
                            }
                        }
                    }
                }
                data={props.forecast_data}

            />
        </div>
        )
};

export default ForecastChart;