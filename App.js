
import { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import domtoimage from 'dom-to-image';
import * as ImagePicker from 'expo-image-picker';

// Here I am importing all of my custom components I used for this project.
import ImageViewer from './components/ImageViewer';
import CircleButton from './components/CircleButton';
import IconButton from './components/IconButton';
import EmojiPicker from "./components/EmojiPicker";
import EmojiList from './components/EmojiList';
import EmojiSticker from './components/EmojiSticker';
import Button from './components/Button';


const PlaceholderImage = require('./assets/images/background-image.png');

export default function App() {
  const imageRef = useRef();
  const [pickedEmoji, setPickedEmoji] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [status, requestPermission] = MediaLibrary.usePermissions();
    if (status === null) {
      requestPermission();
    }

    // Chooseing a new image to display in center of screen.
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setShowAppOptions(true);
      } else {
        alert('You did not select any image.');
      }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  // Here you can save the image with an icon.
  const onSaveImageAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });
        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert('Saved!');
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      domtoimage
        .toJpeg(imageRef.current, {
            quality: 0.95,
            width: 320,
            height: 440,
          })
        .then(dataUrl => {
          let link = document.createElement('a');
          link.download = 'sticker-smash.jpeg';
          link.href = dataUrl;
          link.click();
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    // ImagaViewer component is used to display my image. Here I am also styling the image in the center / the background of the app
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer
            placeholderImageSource={PlaceholderImage}
            selectedImage={selectedImage}
          />
          {pickedEmoji !== null ? ( <EmojiSticker imageSize={40} stickerSource={pickedEmoji} /> ) : null}
        </View>
      </View>
      
      {showAppOptions ? (
      // Here are my button options when you have chosen an image.
      <View style={styles.optionsContainer}>
        <View style={styles.optionsRow}>
          <IconButton icon="refresh" label="Reset" onPress={onReset} />
          <CircleButton onPress={onAddSticker} />
          <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
        </View>
      </View>
      ) : (

       // Here is my button component.
       <View style={styles.footerContainer}>
        <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
        <Button label="Use this photo" onPress={() => setShowAppOptions(true)} />
      </View>

      // Here are my emoji stickers.
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

// The styling in React Native is done using JavaScript as compared to the web, where CSS is used.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});