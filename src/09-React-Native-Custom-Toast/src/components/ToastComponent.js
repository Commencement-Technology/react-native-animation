import {Image, Platform, StyleSheet, Text} from 'react-native';
import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSequence,
  withDelay,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';
const ToastComponent = forwardRef(({}, ref) => {
  const toastTopAnimation = useSharedValue(-100);
  const [showing, setShowing] = useState(false);
  const [toastType, setToastType] = useState('success');
  const [toastText, setToastText] = useState('');
  const [toastDuration, setToastDuration] = useState(0);
  const TOP_VALUE = Platform.OS === 'ios' ? 60 : 20;
  useImperativeHandle(
    ref,
    () => ({
      show,
    }),
    [show],
  );

  const show = useCallback(
    ({type, text, duration}) => {
      setShowing(true);
      toastTopAnimation.value = withSequence(
        withTiming(TOP_VALUE),
        withDelay(
          duration,
          withTiming(-100, finish => {
            if (finish) {
              runOnJS(setShowing)(false);
            }
          }),
        ),
      );
      setToastType(type);
      setToastText(text);
      setToastDuration(duration);
    },
    [TOP_VALUE, toastTopAnimation],
  );

  const animatedTopStyles = useAnimatedStyle(() => {
    return {
      top: toastTopAnimation.value,
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = toastTopAnimation.value;
    },
    onActive: (event, ctx) => {
      if (event.translationY < 100) {
        toastTopAnimation.value = withSpring(ctx.startY + event.translationY, {
          damping: 600,
          stiffness: 100,
        });
      }
    },
    onEnd: event => {
      if (event.translationY < 0) {
        toastTopAnimation.value = withTiming(-100, finish => {
          if (finish) {
            runOnJS(setShowing)(false);
          }
        });
      } else if (event.translationY > 0) {
        toastTopAnimation.value = withSequence(
          withTiming(TOP_VALUE),
          withDelay(
            toastDuration,
            withTiming(-100, finish => {
              if (finish) {
                runOnJS(setShowing)(false);
              }
            }),
          ),
        );
      }
    },
  });

  return (
    <>
      {showing && (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[
              styles.toastContiner,
              toastType === 'success'
                ? styles.successToastContainer
                : toastType === 'warning'
                ? styles.warningToastContainer
                : styles.errorToastContainer,
              animatedTopStyles,
            ]}>
            <Image
              source={
                toastType === 'success'
                  ? require('../assets/SuccessIcon.png')
                  : toastType === 'warning'
                  ? require('../assets/WarningIcon.png')
                  : require('../assets/ErrorIcon.png')
              }
              style={styles.toastIcon}
            />
            <Text
              style={[
                styles.toastText,
                toastType === 'success'
                  ? styles.successToastText
                  : toastType === 'warning'
                  ? styles.warningToastText
                  : styles.errorToastText,
              ]}>
              {toastText}
            </Text>
          </Animated.View>
        </PanGestureHandler>
      )}
    </>
  );
});

export default ToastComponent;

const styles = StyleSheet.create({
  toastContiner: {
    position: 'absolute',
    top: 0,
    width: '90%',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  toastText: {
    marginLeft: 14,
    fontSize: 16,
  },
  toastIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    // aspectRatio: 1,
  },
  closeIcon: {
    width: 12,
    height: undefined,
    aspectRatio: 1,
    marginRight: 15,
    marginLeft: 15,
  },
  successToastContainer: {
    backgroundColor: '#def1d7',
    borderColor: '#1f8722',
  },
  warningToastContainer: {
    backgroundColor: '#fef7ec',
    borderColor: '#f08135',
  },
  errorToastContainer: {
    backgroundColor: '#fae1db',
    borderColor: '#d9100a',
  },
  successToastText: {
    color: '#1f8722',
  },
  warningToastText: {
    color: '#f08135',
  },
  errorToastText: {
    color: '#d9100a',
  },
});
