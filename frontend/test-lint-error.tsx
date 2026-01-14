// קובץ לבדיקת ESLint
import { View } from 'react-native';

export default function TestComponent() {
  // משתנה שלא בשימוש - זו שגיאת לינט!
  const unusedVariable = "hello";
  
  // console.log - לרוב אסור בקוד פרודקשן
  console.log("test");

  return (
    <View>
    </View>
  );
}

