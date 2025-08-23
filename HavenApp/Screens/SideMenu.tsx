import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";

export default function SideMenu(props: any) {
  const navigation = useNavigation<any>();
  const auth = getAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut(auth)
            .then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }], // Redirect to welcome/login screen
              });
            })
            .catch((error) => {
              Alert.alert("Error", error.message);
            });
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <Ionicons name="person-circle-outline" size={80} color="#764ba2" />
          <Text style={styles.username}>Hello, Haven User</Text>
        </View>

        {/* Menu Items */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("SignUp")}
        >
          <MaterialIcons name="person-add" size={24} color="#333" />
          <Text style={styles.menuText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChatWithHaven")}
        >
          <MaterialIcons name="chat" size={24} color="#333" />
          <Text style={styles.menuText}>Chat With Haven</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <MaterialIcons name="account-circle" size={24} color="#333" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={24} color="purple" />
          <Text style={[styles.menuText, { color: "purple" }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
});