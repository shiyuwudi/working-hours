import React from 'react';
import './App.css';
import 'antd/dist/antd.css';
import moment from 'moment';
import {Calendar, InputNumber, Table, Badge, TimePicker, Modal, Form, message} from 'antd';
import {db} from "./db";
// import axios from 'axios';
import holidays from './holiday.json';

const { RangePicker } = TimePicker;

class App extends React.Component {

    formRef = React.createRef();
    dateFormat = "YYYY-MM-DD";
    timeFormat = "HH:mm";

    constructor(props) {
        super(props);
        const dateMap = db.read('dateMap', {});
        console.log('init', dateMap);
        this.state = {
            total: 150, // total target working hours of the month
            selectedDate: null,
            selectedRange: [],
            dateMap,
            saving: false,
        };
        // axios.defaults.withCredentials=true;
        // axios.defaults.crossDomain=true;
    }

    componentDidMount() {
        this.getHolidays();
    }

    getHolidays = () => {
        // (async () => {
        //     // https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv
        //     const res = await axios.get('/holidays');
        //     console.log('res', res);
        // })();
        // var reader = new FileReader();
        // reader.onload = function () {
        //     console.log('reader result', reader.result);
        // };
        // // start reading the file. When it is done, calls the onload event defined above.
        // reader.readAsBinaryString(holidays);
        console.log('hol', holidays.root.split('\n')[0]);
    };



    onSelect = (momentObj) => {
        const dateStr = momentObj.format(this.dateFormat);
        this.setState({
            selectedDate: dateStr,
        });
    };

    onTotalChange = (v) => {
        this.setState({
            total: v,
        });
    };

    getListData = (value) => {
        const { dateMap } = this.state;
        const k = value.format(this.dateFormat);
        if (dateMap.hasOwnProperty(k)) {
            return [dateMap[k]];
        }
        return [];
    };

    dateCellRender = (value) => {
        const listData = this.getListData(value);
        return (
            <ul className="events">
                {listData.map(item => {
                    let text;
                    if (Array.isArray(item.content)) {
                        text = item.content.map(m => moment(m).format(this.timeFormat)).join(' ~ ');
                    } else {
                        text = item.content;
                    }
                    return (
                        <li key={item.content}>
                            <Badge status={item.type} text={text} />
                        </li>
                    );
                })}
            </ul>
        );
    };

    onFormCancel = () => {
        this.setState({
            selectedDate: null,
        });
    };

    persistState = () => {
        const { dateMap } = this.state;
        db.save('dateMap', dateMap);
    };

    onFormOk = () => {
        this.formRef.current.validateFields().then(values => {
            const { timeRange } = values;
            if (
                !timeRange
                || !Array.isArray(timeRange)
                || timeRange.length !== 2
                || timeRange.some(o => !o || !moment.isMoment(o))
            ) {
                return message.error('Time range is in wrong format');
            }
            this.setState({
                saving: true,
            });
            this.setState(oldState => ({
               ...oldState,
               dateMap: {
                 ...oldState.dateMap,
                 [oldState.selectedDate]: {
                     type: 'success',
                     content: timeRange,
                 },
               },
            }),  () => {
                this.persistState();
                this.setState({
                    saving: false,
                    selectedDate: null,
                });
                message.success('Working Hours Saved!');
            });
        }).catch(errorInfo => {
            console.log('form error', errorInfo);
        })
    };

    clearCurrentDate = () => {
        this.setState({
            saving: true,
        });
        this.setState(oldState => {
            const oldMap = oldState.dateMap;
            const newMap = {};
            const theK = oldState.selectedDate;
            for (const k in oldMap) {
                if (oldMap.hasOwnProperty(k)) {
                    if (theK !== k) {
                        newMap[k] = oldMap[k];
                    }
                }
            }
            return {
                ...oldState,
                dateMap: newMap,
            };
        },  () => {
            this.persistState();
            this.setState({
                saving: false,
                selectedDate: null,
            });
            message.success('Working Hours Cleared!');
        });
    };

    render() {
        const { total, selectedDate, saving, dateMap } = this.state;
        const columns = [
            {
                title: "Description",
                dataIndex: "desc",
                key: "desc",
            },
            {
                title: "Result (Calculated)",
                dataIndex: "result",
                key: "result",
            },
        ];
        const now = moment();
        const nowM = now.month();
        // console.log('m', nowM  + 1);
        let totalWorkingSeconds = 0;
        for (let k in dateMap) {
            if (dateMap.hasOwnProperty(k)) {
                if (moment(k).month() === nowM) {
                    const {type, content} = dateMap[k];
                    if (type === 'success') {
                        const [start, end] = content;
                        const seconds = moment(end).diff(moment(start), 'seconds') - 3600; // Lunch Break 1h
                        totalWorkingSeconds += seconds;
                    }
                }
            }
        }
        const h = (totalWorkingSeconds / 3600).toFixed(2);
        const totalDesc = `${h}h`; // 69h
        const lastDate = moment().endOf("month").date();
        const theDate = moment().date();
        const remainDays = lastDate - theDate;
        const remainHours = total - (+h);
        const remainHoursDesc = remainHours.toFixed(2);
        const dailyEstimatedHours = (remainHours / remainDays).toFixed(2); // .2f
        const dataSource = [
            { desc: "Current Total", result: totalDesc },
            { desc: "Remaining", result: `${remainDays}days / ${remainHoursDesc}h` },
            { desc: "Daily Estimated Hours", result: `${dailyEstimatedHours}h (1h Lunch Break excluded)` },
        ];
        const showForm = !!selectedDate;
        const layout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };
        const modalTitle = (
            <div>
                {"Fill in working hours for " + (selectedDate || '')}
                <a className="clear-time" onClick={this.clearCurrentDate}>clear</a>
            </div>
        );
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
                    <div className="title1">
                        Step3. Results come below
                    </div>
                    <div className="body">
                        <Table
                            size={'small'}
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            style={{ width: '100%' }}
                            rowKey="desc"
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
                <Modal
                    visible={showForm}
                    title={modalTitle}
                    onCancel={this.onFormCancel}
                    width={700}
                    centered
                    onOk={this.onFormOk}
                    confirmLoading={saving}
                >
                    <div className="form-container">
                        <Form {...layout} name="basic" ref={this.formRef}>
                            <Form.Item
                                name="timeRange"
                                label="Check-in & Off Time"
                                rules={[{ required: true, message: 'Please select time range!' }]}
                            >
                                <RangePicker />
                            </Form.Item>
                        </Form>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default App;
