import React, { useContext } from "react";
import { View, StyleSheet, Image } from "react-native";
import { AuthContext } from "../../contexts/Auth";
import { PinSetup, PinUnlock } from '../../components/auth/pin-gate';
import { MyStack } from "../stack";
import { MyStackApp } from "../stackApp";


export default function AuthRoute() {
  const { signed, loading, pinStatus } = useContext(AuthContext);

  if (loading || (signed && pinStatus === 'loading')) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image 
          style={StyleSheet.absoluteFill}
          source={require('../../../assets/splash.png')}
        />
      </View>
    );
  }

  if (signed && pinStatus === 'missing') return <PinSetup />;
  if (signed && pinStatus === 'locked') return <PinUnlock />;

  return signed ? <MyStackApp /> : <MyStack />;
}
