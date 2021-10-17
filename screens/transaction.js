import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from '../config';
import firebase from 'firebase';


export default class Transaction extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      buttonState: 'normal',
      scannedBookId: '',
      scannedStudentId: ''

    }
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions: status === "granted",
      buttonState: id,
      scanned: false
    });
  }

  handleBarCodeScanned = async ({ type, data }) => {
    // this.setState({
    //   scanned: true,
    //   scannedData: data,
    //   buttonState: 'normal'
    // });

    const { buttonState } = this.state;
    if (buttonState === "BookId") {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      })
    }
    else if (buttonState === "StudentId") {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      })
    }
  }

  handleTransaction = async () => {
    var transactionMessage;
    db.collection('books')
      .doc(this.state.scannedBookId)
      .get()
      .then((doc) => {
        var book = doc.data();
         
        if (book.bookAvailability===true) {
           //console.log("Book Issued");
          this.initiateBookIssue();
          transactionMessage = 'Book Issued';
                   
         Alert.alert(transactionMessage);
        //  ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
        } else {
          this.initiateBookReturn();
          console.log("Book Returned");
          transactionMessage = 'Book Returned';
        //  console.log(transactionMessage);
         Alert.alert(transactionMessage);
          
        }
        this.setState({
      transactionMessage: transactionMessage,
      scannedBookId:'',
      scannedStudentId:''
    });
      });
    
  };
  initiateBookIssue = () => {
    db.collection('transaction').add({
      studentID: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      data: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Issue',
    });
console.log(this.state.scannedBookId);
    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability: false,
    });

    db.collection('students')
      .doc(this.state.scannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      });
  };

  initiateBookReturn = () => {
    db.collection('transaction').add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      data: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Return',
    });

    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability: true,
    });

    db.collection('students')
      .doc(this.state.scannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      });
  };
  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;
    if (buttonState !== 'normal' && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFill}
        />
      );
    } else if (buttonState === 'normal') {
      return (
        <KeyboardAvoidingView style={styles.container} behaviour="padding">
          <View>
            <Image
              source={require('../assets/booklogo.jpg')}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ textAlign: 'center', fontSize: 30 }}>Wily</Text>
          </View>
          <View style={styles.inputView}>
          <TextInput
              style={styles.inputBox}
              placeholder="Book Id"
              value={this.state.scannedBookId}
              onChangeText={(text) => {
                this.setState({scannedBookId: text });
       
              }}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('BookId');
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="Student Id"
              value={this.state.scannedStudentId}
              onChangeText={(text) => {
                this.setState({scannedStudentId: text });
              }}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('StudentId');
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <View>
            {/*--T activity-- <Text style={styles.displayText}> {hasCameraPermissions===true ? this.state.scannedData : 'Request For Camera Permission'} </Text> */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async() => {
                this.handleTransaction();
               
              }}>
              <Text style={styles.submitButtonText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  scanButton: {
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  inputView: {
    flexDirection: 'row',
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: 'yellow',
    width: 100,
    height: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },
  submitButtonText: {
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});
