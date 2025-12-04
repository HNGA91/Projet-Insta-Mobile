import React, { useContext } from "react";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./Navigation/TabNavigator";
import { UserProvider, UserContext } from "./Context/UserContext";
import { FavorisProvider } from "./Context/FavorisContext";
import { PanierProvider } from "./Context/PanierContext";
import { ArticleProvider } from "./Context/ArticleContext";

// Wrapper qui injecte user dans les contexts
const ContextWrapper = ({ children }) => {
	const { user, loading: userLoading } = useContext(UserContext);

	// Si l'utilisateur est en cours de chargement, afficher un indicateur
	if (userLoading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color="#1c5be4ff" />
			</View>
		);
	}

	return (
		<ArticleProvider>
			<PanierProvider user={user}>
				<FavorisProvider user={user}>{children}</FavorisProvider>
			</PanierProvider>
		</ArticleProvider>
	);
};

const App = () => {
	return (
		<UserProvider>
			<ContextWrapper>
				<NavigationContainer>
					<View style={{ flex: 1 }}>
						<StatusBar barStyle="light-content" backgroundColor="#1c5be4ff" translucent={false} />
						<SafeAreaView style={{ flex: 0, backgroundColor: "#1c5be4ff" }} />
						<SafeAreaView style={{ flex: 1 }} edges={["right", "bottom", "left"]}>
							<TabNavigator />
						</SafeAreaView>
					</View>
				</NavigationContainer>
			</ContextWrapper>
		</UserProvider>
	);
};

export default App;
