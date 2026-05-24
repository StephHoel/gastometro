const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/expo/android/build.gradle');
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Comment out all "apply plugin" lines that might cause issues
  content = content.replace(/^apply plugin: 'expo-module-gradle-plugin'/gm, "// apply plugin: 'expo-module-gradle-plugin'");
  content = content.replace(/^apply plugin: "expo-autolinking"/gm, "// apply plugin: 'expo-autolinking'");
  content = content.replace(/^apply plugin: 'expo-autolinking'/gm, "// apply plugin: 'expo-autolinking'");

  // 2. Remove the expoModule guard block or any bare expoModule { ... } block
  content = content.replace(/if \(project\.extensions\.findByName\('expoModule'\) != null\) \{[\s\S]*?\} \/\/ end expoModule guard/g, '');
  content = content.replace(/expoModule\s*\{[\s\S]*?\n\}/g, '');

  // 3. Force compileSdk and minSdk in the android block
  // First, find the android { block and replace it
  const androidRegex = /android\s*\{/;
  if (androidRegex.test(content)) {
    // If compileSdk or compileSdkVersion missing, inject defaults right after android {
    content = content.replace(androidRegex, match => {
      const insert = '\n  compileSdk 35\n  compileSdkVersion 35';
      return match + insert;
    });
  }

  // Remove any duplicate namespace declarations later
  // Keep the first occurrence only
  const namespaceMatches = content.match(/namespace\s+"expo\.core"/g) || [];
  if (namespaceMatches.length > 1) {
    // remove subsequent occurrences
    let firstDone = false;
    content = content.replace(/namespace\s+"expo\.core"/g, () => {
      if (!firstDone) { firstDone = true; return 'namespace "expo.core"'; }
      return '';
    });
  }

  fs.writeFileSync(filePath, content);
  console.log('Patched expo/android/build.gradle with forced SDK and minimal plugins');
} else {
  console.log('Expo build.gradle not found at ' + filePath);
}
