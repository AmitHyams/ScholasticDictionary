import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TextInput, Button, View, ScrollView, SafeAreaView, Alert, Animated, TouchableOpacity, PixelRatio } from 'react-native';
import { useState, useEffect } from "react";
import { useFonts } from "expo-font";

export default function App() {
  const [word, setWord] = useState('Example');
  const [loading, setLoading] = useState(false);
  const [definition, setDefinition] = useState(null);
  const [wData, setWData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  
  const [fontsLoaded] = useFonts({
    "Garamond": require("./assets/fonts/EBGaramond-VariableFont_wght.ttf"),
  });


  useEffect(() => {
    const fetchData = async () => {
      const fetchedArray = await getArray();
      setHistory(fetchedArray);
    };

    fetchData();
  }, []); 

  const submit = (w) => {
    if(w != ""){
      setWord(w);
      if(flipped){
        flip();
      }
      fetchDefinition(w);
    }else{
      setWData(null);
    }
  } 



  const saveArray = async (array) => {
    try {
      const jsonValue = JSON.stringify(array);
      await AsyncStorage.setItem('wordHistory', jsonValue);
    } catch (e) {
      console.error('Error saving array:', e);
    }
  };

  const getArray = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('wordHistory');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading array:', e);
    return [];
    }
  };

  const flexValue = new Animated.Value(2);
  const handleFocus = () => {
    Animated.timing(flexValue, {
      toValue: 6,
      duration: 300, // Duration for the animation
      useNativeDriver: false,
    }).start();
  };
  const handleBlur = () => {
    Animated.timing(flexValue, {
      toValue: 2,
      duration: 300, // Duration for the animation
      useNativeDriver: false,
    }).start();
  };

  const [flipAnimation] = useState(new Animated.Value(0)); // Initializing animated value
  const [flipped, setFlipped] = useState(false); // State to toggle flip
  const flip = () => {
    if(wData != null){
      Animated.timing(flipAnimation, {
        toValue: flipped ? 0 : 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      setFlipped(!flipped); // Toggle the flipped state
    }
  };

  // Interpolate the flipAnimation to create the flip effect
  const rotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'], // Rotate from 0 to 180 degrees
  });


  const fetchDefinition = async (w) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w}`);
      const data = await response.json();
      setWord(w);
      if (data.title === "No Definitions Found") {
        //setError('No definitions found for the word.');
        setWord('No definitions found for the word.');
        setWData(null);
        setDefinition(null);
      } else if(w !== '' && w !== null && w !== 'Example') {
        setWData(data);
        if(!history.includes(word)){
          setHistory([...history,word]);
          saveArray(history);
        }
        setDefinition(data[0].meanings[0].definitions[0].definition);
        setError('');
      }
    } catch (err) {
      setError('Error fetching data.');
      Alert.alert("Error","error");
    }
    setLoading(false);
  };

  const quiz = () => {
     const randomNW = Math.floor(Math.random() * history.length);
     setWord(history[randomNW]);
     submit(history[randomNW]);
  };

  const removeWfromH = (i) =>{
    setHistory(history => history.filter(curWord => curWord !== i));
    saveArray(history);
    setWord('Example');
    setWData(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={flip}>
        <Animated.View style={[styles.card,{
              transform: [{ rotateY }], // Apply the rotation transform
            }, ]}>
          <View style={[styles.face, styles.front]}>
            <Text style={styles.title}> {word} </Text>
          </View>
          {flipped && wData && (
          <View style={[styles.face, styles.back]}>
              <Text style={styles.phon}> {wData[0].phonetic} </Text>
              <Text placeholder = "enter new word"> {wData[0].meanings[0].definitions[0].definition}</Text>
              <Text> {wData[0].origin} </Text>
              <Text> {wData[0].meanings[0].definitions[0].example}</Text>
            </View>
          )}
          {error ? <Text>{error}</Text> : null}
        </Animated.View>
      </TouchableOpacity>  

      <Animated.View style={[styles.word, {flex: flexValue}]}>
        <TextInput
          onChangeText = {setWord}
          placeholder = "Enter New Word"
          onSubmitEditing = {() => {submit(word)}}
          Value = {word} 
          style={styles.btext}
          onFocus = {handleFocus}
          onBlur = {handleBlur}
        />
        <TouchableOpacity onPress={() => {quiz()}} style={styles.used}>
          <Text style={styles.btext}>quiz me!</Text>
        </TouchableOpacity>
        <Text style={styles.btext}>Previous Words</Text>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic" >
          {
            history !== null &&
            history.map((w,index) => {
              return(
                <TouchableOpacity key={index} onPress={() => {
                  setWord(w);
                  submit(w);
                }} 
                onLongPress={() => {removeWfromH(w)}}
                delayLongPress={1000}
                style={styles.used}>
                  <Text style={styles.btext}>{w}</Text>
                </TouchableOpacity>
              );
              //Alert.alert("word",w);
            }) 
          }
        </ScrollView>
      </Animated.View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const scale = PixelRatio.get();

const styles = StyleSheet.create({
  title: {
    fontSize:20,
    fontWeight: 'bold',
    color: '#FCE7C8',
    fontFamily: 'Garamond'
  },
  phon: {
    fontSize:15,
    fontWeight: 'bold',
  },
  btext: {
    color: '#F0A04B',
    fontSize:17,
    fontFamily: 'Garamond'
  },
  container: {
    marginTop:StatusBar.currentHeight,
    flex: 1,
    backgroundColor: '#FCE7C8',
    alignItems: 'center',
    justifyContent: 'top',
  },
  card: {
    //flex: 0.5,
    marginTop: 10 * scale,
    marginBottom: 10 * scale,
    padding: 10 * scale,
    width: 130 * scale,
    height: 150 * scale, // Adjust the height for visibility of front and back
    backgroundColor: '#B1C29E',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    perspective: 1000, // Create a 3D effect on the card container
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  front: {
    //backgroundColor: '#3498db',
    // Additional styling for the front face
    backfaceVisibility: 'hidden', // Hide the back face when not flipped
  },
  back: {
    backgroundColor: '#FADA7A',
    transform: [{ rotateY: '180deg' }], // Rotate the back face by 180deg to show it when flipped
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  word: {
    flex: 2,
    margin:10 * scale,
    width: 90 * scale,
    height: 10 * scale,
    backgroundColor: '#FCE7C8',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,

    alignItems: 'center',
    justifyContent: 'top',
  },
  used: {
    marginTop: 5 * scale,
    padding: 1 * scale,
    width: '90%',
    backgroundColor: '#FCE7C8',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    width: '100%',
    paddingLeft: 10 * scale,
  }
});
