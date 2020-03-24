import React from 'react';
import './App.css';
import 'antd/dist/antd.css';
import moment from 'moment';
import {Calendar, InputNumber, Table, Badge, TimePicker, Modal, Form, message} from 'antd';
import {db} from "./db";
import { saveAs } from 'file-saver';

const { RangePicker } = TimePicker;

class App extends React.Component {

    formRef = React.createRef();
    dateFormat = "YYYY-MM-DD";
    timeFormat = "HH:mm";

    constructor(props) {
        super(props);
        const dateMap = db.read('dateMap', {});
        const total = +db.read('total', 150);
        const totalD = +db.read('totalD', 22);
        // console.log('init', dateMap);
        this.state = {
            total, // total target working hours of the month
            totalD, //  total working days in month
            selectedDate: null,
            selectedRange: [],
            dateMap,
            saving: false,
        };
    }

    onSelect = (momentObj) => {
        const dateStr = momentObj.format(this.dateFormat);
        this.setState({
            selectedDate: dateStr,
        }, () => {
            const form = this.formRef.current;
            if (!form) return;
            const { dateMap } = this.state;
            let dateRange = [];
            if (dateMap.hasOwnProperty(dateStr)) {
                const { type, content } = dateMap[dateStr];
                if (type === 'success' && content && content.length === 2) {
                    dateRange = content;
                }
            }
            form.setFieldsValue({
                timeRange: dateRange.map(o => moment(o)),
            });
        });
    };

    onTotalChange = (v) => {
        this.setState({
            total: v,
        });
        db.save('total', v);
    };

    onTotalDChange = (v) => {
        this.setState({
            totalD: v,
        });
        db.save('totalD', v);
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

    onImport = () => {
        document.getElementById("image").click();
    };

    importText = (txt) => {
        // console.log(moment('03月02日', 'MM月DD日').format('YYYY-MM-DD HH:mm:ss'));
        const dateMap = txt
            .split('\n')
            .filter(o => !!o)
            .map(lineTxt => {
                const [datePart, timePart] = lineTxt.split(' ');
                const key = moment(datePart, 'MM月DD日').format(this.dateFormat);
                const content = timePart.split('-').map(o => moment(o, 'HHmm'));
                return {
                    key,
                    value: {
                        type: 'success',
                        content,
                    },
                };
            }).reduce((r, e) => ({...r, [e.key]: e.value }), {});
        this.setState({
            dateMap,
        });
        db.save('dateMap', dateMap);
    };

    onUploadChange = e => {
      // console.log('on upload change', e.target.files);
      const files = e.target.files;
      if (files && files.length > 0) {
          const file = files[0];
          // console.log('file is', file);
          const fileReader = new FileReader();
          // fileReader
          fileReader.addEventListener('loadend', ev => {
              this.importText(fileReader.result);
              // console.log('loadend', fileReader.result);
          });
          fileReader.readAsText(file);

      }
    };

    onExport = () => {
        const {dateMap} = this.state;
        let exportTextStr = '';
        for (const k in dateMap) {
            if (dateMap.hasOwnProperty(k)) {
                const { content, type } = dateMap[k];
                if (type === 'success' && !!content && Array.isArray(content) && content.length === 2) {
                    const lineStr = `${moment(k).format('MM月DD日')} ${content.map(o => moment(o).format('HHmm')).join('-')}\n`;
                    exportTextStr += lineStr;
                }
            }
        }
        // console.log('export str is ', exportTextStr);
        this.saveTxt(exportTextStr);
    };

    saveTxt = (content) => {
        const filename = "export.txt";
        const blob = new Blob([content], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, filename);
    };

    render() {
        const { total, selectedDate, saving, dateMap, totalD } = this.state;
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
        let totalWorkingSeconds = 0;
        let totalWorkingDays = 0;
        for (let k in dateMap) {
            if (dateMap.hasOwnProperty(k)) {
                if (moment(k).month() === nowM) {
                    const {type, content} = dateMap[k];
                    if (type === 'success') {
                        const [start, end] = content;
                        const seconds = moment(end).diff(moment(start), 'seconds') - 3600; // Lunch Break 1h
                        totalWorkingSeconds += seconds;
                        totalWorkingDays += 1;
                    }
                }
            }
        }
        const h = (totalWorkingSeconds / 3600).toFixed(2);
        const totalDesc = `${h}h`; // 69h
        const remainDays = totalD - totalWorkingDays;
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
                <a className="clear-time" onClick={this.clearCurrentDate}>
                    Delete
                </a>
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
                    <div className="body">
                        <div className="total-label">Total Working Days In Month</div>
                        <div>
                            <InputNumber
                                value={totalD}
                                onChange={this.onTotalDChange}
                            />
                        </div>
                        <div className="total-suffix">(Default: 22 Days)</div>
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
                    <div className="title1">
                        <div className="cal-header">
                            <div>Step2. Click on date cells to take note on daily working hours </div>
                            <div>
                                <a className="cal-import" onClick={this.onImport}>Import</a>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    style={ { display: 'none' }}
                                    onChange={this.onUploadChange}
                                    accept="txt"
                                />
                                <a onClick={this.onExport}>Export</a>
                                {/*<a onClick={this.delAll}>Delete All In This Month</a>*/}
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <Calendar
                            onSelect={this.onSelect}
                            dateCellRender={this.dateCellRender}
                        />
                    </div>

                </div>
                <Modal
                    forceRender
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
