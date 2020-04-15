import React from 'react'
import WorkingHours from './WorkingHours';
import WorldLang from './components/WorldLang';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

function callback(key) {
    console.log(key);
}

function App () {
    return (
        <div>
            <Tabs onChange={callback} type="card">

                <TabPane tab="世界语翻译机 v0.1" key="2">
                    <WorldLang />
                </TabPane>

                <TabPane tab="工作时间计算器 v0.1" key="1">
                    <WorkingHours />
                </TabPane>

                {/*<TabPane tab="Tab 3" key="3">*/}
                {/*    Content of Tab Pane 3*/}
                {/*</TabPane>*/}
            </Tabs>
        </div>
    );
}

export default App;
