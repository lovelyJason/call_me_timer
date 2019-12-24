import React from 'react';
import {
  StyleSheet
} from 'react-native';

import { Container, View, Content, Form, Item, Input, Button, Text, Spinner, Toast, Root } from 'native-base';
import axios from 'axios'
import moment from 'moment'
import cheerio from 'cheerio'
import Modal from 'react-native-modalbox';

global.Buffer = global.Buffer || require('buffer').Buffer
// global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest

// console.log(process)
//axios.defaults.withCredentials = true
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var timeId = null

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '123456',
      spinnerDisplay: 'none',
      swipeToClose: true
    }
    this.onLogin = this.onLogin.bind(this)
  }
  componentWillUnmount() {
    clearTimeout(timeId)
  }
  onUsernameChange(text) {
    this.setState({
      username: text
    })
  }
  onPasswordChange(text) {
    this.setState({
      password: text
    })
  }
  async onLogin() {
    const that = this
    let username = this.state.username
    let password = this.state.password
    let loginUrl = 'http://218.17.157.34:1234/selfservice/login/'
    let selfUrl = 'http://218.17.157.34:1234/selfservice/selftransaction/';
    let dataUrl = 'http://218.17.157.34:1234/grid/att/CardTimes/'
    await this.setState({
      spinnerDisplay: 'flex'
    })
    let body = `username=${username}&password=${password}&template9=&finnger10=&finnger9=&template10=&login_type=pwd&client_language=zh-cn`
    let res = await axios.post(loginUrl, body)
    let { data } = res
    if (data !== 'ok') {
      Toast.show({
        text: data,
        type: "success",
        position: "bottom"
      })
      this.setState({
        spinnerDisplay: 'none'
      })
      return
    }
    let res1 = await axios.post(selfUrl)
    let $ = cheerio.load(res1.data)
    let id = $('#id_self_services').attr('value')
    let dateNow = moment(Date.now()).format('YYYY-MM-DD')
    //let cookie = headers['set-cookie']    //arr
    const kaoqinData = `page=1&rp=1&ComeTime=${dateNow}&UserIDs=${id}&EndTime=${dateNow}`
    try {
      let res2 = await axios.post(dataUrl, kaoqinData,
        {
          // withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      if (typeof res2.data !== 'string') {
        Toast.show({
          text: res.data,
          type: "success",
          position: "bottom"
        })
        let { data: { rows = [] } = {} } = res2
        // console.log(res2)
        let { card_date, card_times, DeptName, times, name } = {} = rows[0]
        await that.setState({
          name,
          card_date,
          card_times,
          DeptName,
          times
        })
        that.refs.modal2.open()
        timeId = setTimeout(() => {
          that.refs.modal2.close()
        }, 5000);
      } else {
        Toast.show({
          text: data,
          type: "success",
          position: "bottom"
        })
      }
      that.setState({
        spinnerDisplay: 'none'
      })
    } catch (error) {
      Toast.show({
        text: error.message,
        type: "success",
        position: "bottom"
      })
      that.setState({
        spinnerDisplay: 'none'
      })
    }

  }
  onUsernameFocus() {
    
  }
  onPasswordFocus() {
   
  }
  render() {
    const { name, card_date, card_times, DeptName, times } = this.state
    return (
      <Root>
        <Container style={styles.body}>
          <Content>
            <Form >
              <Item>
                <Input keyboardType="numeric" placeholder="Username" onChangeText={text => this.onUsernameChange(text)} />
              </Item>
              <Item last>
                <Input defaultValue="123456" placeholder="Password" secureTextEntry={true} onChangeText={text => this.onPasswordChange(text)} />
              </Item>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Button onPress={() => { this.onLogin() }} bordered light style={styles.btn} primary><Text> 查询打卡 </Text></Button>
              </View>
            </Form>
            <Spinner style={{ display: this.state.spinnerDisplay }} color='red' />
          </Content>
        </Container>
        <Modal animationDuration={600} swipeToClose={this.state.swipeToClose} style={[styles.modal, styles.modal2]} backdrop={false} position={"top"} ref={"modal2"}>
          <Text style={[styles.text, { color: "white" }]}>{DeptName}的小可爱{name}</Text>
          <Text style={[styles.text, { color: "white" }]}>您的最近一次打卡记录为:</Text>
          <Text style={[styles.text, { color: "white" }]}>{card_date}-{card_times}</Text>
          <Text style={[styles.text, { color: "white" }]}>今天已打卡{times}次</Text>
        </Modal>

      </Root>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    marginTop: 206,
  },
  btn: {
    marginTop: 30,
    width: 100,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal2: {
    paddingTop: 50,
    height: 180,
    backgroundColor: "#3B5998"
  },
  modal4: {
    height: 200
  },
  text: {
    color: "black",
    fontSize: 18
  }
});

export default App;
