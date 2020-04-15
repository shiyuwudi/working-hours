import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';

const { TextArea } = Input;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const Demo = ({ onOk }) => {
  const onFinish = values => {
    console.log('Success:', values);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const [form] = Form.useForm();
  const onFill = (action) => {
    // console.log(form);
    form.validateFields().then(values => {
      onOk({ action, ...values });
    }).catch(err => {
      // console.log(222, err);
    });
  };

  const buttons = [
    {title: '-> 世界语', className: 'left', action: 'world' },
    {title: '人话 <-', className: 'right', action: 'human' },
  ];

  return (
    <Form
      {...layout}
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      form={form}
    >

      <Form.Item
        label="暗号"
        name="secret"
        rules={[{ required: true, message: '缺暗号，石宇要！' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="内容"
        name="content"
        rules={[{ required: true, message: '输入要加密的内容！' }]}

      >
        <TextArea
          autoSize={{
            minRows: 3,
          }}
        />
      </Form.Item>

      <Form.Item {...tailLayout}>
        {buttons.map(obj => (
          <Button
            className={"world-lang-button " + obj.className}
            type="ghost"
            htmlType="button"
            onClick={() => onFill(obj.action)}
            key={obj.action}
          >
            {obj.title}
          </Button>
        ))}
      </Form.Item>
    </Form>
  );
};

export default Demo;
