import React from "react";
import { StatusBar, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./Navigation/TabNavigator";
import { UserProvider } from "./Context/Context";

const App = () => {
	return (
		<UserProvider>
			<NavigationContainer>
				<View style={{ flex: 1 }}>
					<StatusBar barStyle="light-content" backgroundColor="#1c5be4ff" translucent={false} />
					<SafeAreaView style={{ flex: 0, backgroundColor: "#1c5be4ff" }} />
					<SafeAreaView style={{ flex: 1 }} edges={["right", "bottom", "left"]}>
						<TabNavigator />
					</SafeAreaView>
				</View>
			</NavigationContainer>
		</UserProvider>
	);
};

export default App;