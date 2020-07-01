import React from 'react';
import {
  StyleSheet,
  ImageBackground
} from 'react-native';

import { Container, View, Content, Form, Item, Input, Button, Text, Spinner, Toast, Root } from 'native-base';
import axios from 'axios'
import moment from 'moment'
import cheerio from 'cheerio'
import Modal from 'react-native-modalbox';
import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

global.Buffer = global.Buffer || require('buffer').Buffer
// global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest

// console.log(process)
//axios.defaults.withCredentials = true
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var timeId = null
var storage = new Storage({
  storageBackend: AsyncStorage
})

global.storage = storage;

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '2121',
      password: '123456',
      spinnerDisplay: 'none',
      swipeToClose: true
    }
    this.onLogin = this.onLogin.bind(this)
  }
  componentDidMount() {
  }
  componentWillUnmount() {
    clearTimeout(timeId)
    this.setState = () => {
      return
    }
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
    const baseUrl = `http://inmail.miz.so:1234`
    let loginUrl = `${baseUrl}/selfservice/login/`
    let selfUrl = `${baseUrl}/selfservice/selftransaction/`;
    let dataUrl = `${baseUrl}/grid/att/CardTimes/`
    this.setState({
      spinnerDisplay: 'flex'
    })
    let body = `username=${username}&password=${password}&template9=&finnger10=&finnger9=&template10=&login_type=pwd&client_language=zh-cn`
    let res = await axios.post(loginUrl, body)
    // console.log('login---', res)
    let { data } = res
    // console.log(data)
    if (data !== 'ok') {
      Toast.show({
        text: data,
        type: "error",
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
        // 持久化存储
        // storage.save({
        //   key: 'user',  // 注意:请不要在key中使用_下划线符号!
        //   data: {
        //     username: this.state.username
        //   },
        //   expires: null
        // });
        // Toast.show({
        //   text: res.data,
        //   type: "success",
        //   position: "bottom"
        // })
        // console.log(res2.data)
        let { rows = [] } = res2.data
        // console.log(res2)
        if (rows.length === 0) {
          Toast.show({
            text: '抱歉，您今天没有打卡,请别为难我',
            type: "warn",
            position: "bottom"
          })
          this.setState({
            spinnerDisplay: 'none'
          })
          return
        }
        let { card_date, card_times, DeptName, times, name } = rows[0]
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
        // console.log(11)
        Toast.show({
          text: data,
          type: "success",
          position: "bottom"
        })
      }
    } catch (error) {
      Toast.show({
        text: error.message,
        type: "success",
        position: "bottom"
      })
    }
    this.setState({
      spinnerDisplay: 'none'
    })
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
          <ImageBackground source={require('./images/haha.gif')} style={{ height: 206 }}>
          </ImageBackground>
          <ImageBackground source={require('./images/bk.jpg')} style={{ width: '100%', height: '100%', opacity: 0.9 }}>
            <Content style={styles.content}>
              <Form>
                <Item>
                  <Input defaultValue="2121" keyboardType="numeric" placeholder="Username" onChangeText={text => this.onUsernameChange(text)} />
                </Item>
                <Item last>
                  <Input defaultValue="123456" placeholder="Password" secureTextEntry={true} onChangeText={text => this.onPasswordChange(text)} />
                </Item>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Button success rounded onPress={() => { this.onLogin() }} style={styles.btn}><Text> 查询打卡 </Text></Button>
                </View>
              </Form>
              <Spinner style={{ display: this.state.spinnerDisplay }} color='red' />
            </Content>
          </ImageBackground>
        </Container>
        <Modal animationDuration={1000} swipeToClose={this.state.swipeToClose} style={[styles.modal, styles.modal2]} backdrop={false} position={"top"} ref={"modal2"}>
          <Text style={[styles.text, { color: "white" }]}>{DeptName}的{name}</Text>
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
    // paddingTop: 206,
    backgroundColor: '#fff'
  },
  content: {
    height: '100%'
    // background: require('./images/bk.jpg')
  },
  btn: {
    marginTop: 30,
    width: 100,
    borderRadius: 10
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal2: {
    paddingTop: 30,
    height: 210,
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
