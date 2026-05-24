const fs = require('fs');
const f = 'settings.gradle';
try {
    let txt = fs.readFileSync(f, 'utf8');
    const ins = `  resolutionStrategy {
                eachPlugin {
                        if (requested.id.id == 'expo-module-gradle-plugin') {
                                useModule("dev.expo.modules:expo-module-gradle-plugin:+")
                        }
                }
        }
`;
    if (!txt.includes('resolutionStrategy')) {
        txt = txt.replace('  }\n  includeBuild', '  }\n' + ins + '  includeBuild');
        fs.writeFileSync(f, txt);
        console.log('Injected');
    } else {
        console.log('Already present');
    }
} catch (e) {
    console.error('Could not patch settings:', e.message);
}
