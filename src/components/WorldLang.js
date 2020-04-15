import React, {Component} from 'react';
import Form1 from "./Form1";
import CryptoJS from 'crypto-js';

class WorldLang extends Component {

  constructor(props) {
    super(props);
    this.state = {
      result: '',
    };
  }

  onOk = ({ action, secret, content }) => {
    // console.log(111, form);
    if (action === 'world') {
      // Encrypt
      const ciphertext = CryptoJS.AES.encrypt(content, secret).toString();
      this.setState({
        result: ciphertext,
      });
    } else {
      // Decrypt
      const bytes  = CryptoJS.AES.decrypt(content, secret);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      this.setState({
        result: originalText,
      });
    }
  }

  render() {
    return (
      <div className="world-lang-wrapper">
        <div className="content-area">
          <Form1 onOk={this.onOk} />
        </div>
        <div className="result">
          <div className="result-label">
            结果：
          </div>
          <div className="result-text">
            {this.state.result}
          </div>
        </div>
      </div>
    );
  }
}

export default WorldLang;
