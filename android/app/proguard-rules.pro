# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:


# Remove logs
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Remove recursos não usados
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**

# Excluir partes não utilizadas do React Native
-keep class com.facebook.react.** { *; }
-keepclassmembers,includedescriptorclasses class * {
    native <methods>;
}
