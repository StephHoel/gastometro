export default {
  expo: {
    name: "Gastômetro",
    slug: "gastometro",
    version: "1.7.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "gastometro",
    userInterfaceStyle: "dark",
    android: {
      package: "com.stephhoel.gastometro",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon-foreground.png",
        backgroundColor: "#0F172A"
      },
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      build: {
        babel: {
          include: [
            "react-native-web"
          ]
        }
      }
    },
    plugins: [
      "expo-router",
      "expo-notifications",
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 29,
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            enableSeparateBuildPerCPUArchitecture: true,
            extraProguardRules: "-assumenosideeffects class android.util.Log { *; }"
          }
        }
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#0F172A",
          android: {
            image: "./assets/images/splash-icon.png"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      ...(process.env.EXPO_PUBLIC_ROUTER_BASE ? { baseUrl: process.env.EXPO_PUBLIC_ROUTER_BASE } : {})
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "7df77fa7-4459-4505-baba-b8c6c2d0090c"
      }
    },
    owner: "stephhoel"
  }
}