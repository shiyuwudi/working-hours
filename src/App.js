import React from 'react';
import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { Calendar, InputNumber, Table, Badge } from 'antd';

function onPanelChange(value, mode) {
    console.log(value.format('YYYY-MM-DD'), mode);
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            total: 150,
        };
    }

    onSelect = (date) => {
        console.log(date);
    };

    onTotalChange = (v) => {
        this.setState({
            total: v,
        });
    };

    getListData = (value) => {
        let listData;
        switch (value.date()) {
            case 8:
                listData = [
                    { type: 'warning', content: 'This is warning event.' },
                    { type: 'success', content: 'This is usual event.' },
                ];
                break;
            case 10:
                listData = [
                    { type: 'warning', content: 'This is warning event.' },
                    { type: 'success', content: 'This is usual event.' },
                    { type: 'error', content: 'This is error event.' },
                ];
                break;
            case 15:
                listData = [
                    { type: 'warning', content: 'This is warning event' },
                    { type: 'success', content: 'This is very long usual event。。....' },
                    { type: 'error', content: 'This is error event 1.' },
                    { type: 'error', content: 'This is error event 2.' },
                    { type: 'error', content: 'This is error event 3.' },
                    { type: 'error', content: 'This is error event 4.' },
                ];
                break;
            default:
        }
        return listData || [];
    };

    dateCellRender = (value) => {
        const listData = this.getListData(value);
        return (
            <ul className="events">
                {listData.map(item => (
                    <li key={item.content}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    }

    render() {
        const { total } = this.state;
        // <div>Current Total: 69h</div>
        //                             <div>Remaining: 12days / 81h</div>
        //                             <p>Daily Estimated Hours: 6.75h (+1h Lunch Break)。</p>
        const columns = [
            {
                title: "Description",
                dataIndex: "desc",
                key: "desc",
            },
            {
                title: "Result",
                dataIndex: "result",
                key: "result",
            },
        ];
        const dataSource = [
            { desc: "Current Total", result: "69h" },
            { desc: "Remaining", result: "12days / 81h" },
            { desc: "Daily Estimated Hours", result: "6.75h (+1h Lunch Break)" },
        ];
        return (
            <div className="App">
                <div className="title">Working Hour Calculator</div>
                <div className="form">
                    <div className="title1">Step1. Fill in information below</div>
                    <div className="body">
                        <div className="total-label">Target Total Working Hours</div>
                        <div>
                            <InputNumber
                                value={total}
                                onChange={this.onTotalChange}
                            />
                        </div>
                        <div className="total-suffix">(Default: 150 Hours)</div>

                    </div>
                </div>
                <div className="result">
                    <div className="title1">Step3. Results come below</div>
                    <div className="body">
                        <Table
                            size={'small'}
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            style={{ width: '100%' }}
                        />

                    </div>
                </div>
                <div className="cal">
                    <div className="title1">Step2. Click on date cells to take note on daily working hours </div>
                    <div className="">
                        <Calendar
                            onSelect={this.onSelect}
                            dateCellRender={this.dateCellRender}
                        />
                    </div>

                </div>
            </div>
        );
    }
}

export default App;
