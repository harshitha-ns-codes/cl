import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import LearnScreen from '../screens/Learn/LearnScreen';
import KnowledgeGraphScreen from '../screens/Learn/KnowledgeGraphScreen';
import TopicContentScreen from '../screens/Learn/TopicContentScreen';
import IngestReaderScreen from '../screens/Learn/IngestReaderScreen';
import RecommendedArticleScreen from '../screens/Learn/RecommendedArticleScreen';

const LearnStack = createNativeStackNavigator();

export function LearnNavigator() {
  return (
    <LearnStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <LearnStack.Screen name="LearnMain" component={LearnScreen} />
      <LearnStack.Screen name="KnowledgeGraph" component={KnowledgeGraphScreen} />
      <LearnStack.Screen name="TopicContent" component={TopicContentScreen} />
      <LearnStack.Screen name="IngestReader" component={IngestReaderScreen} />
      <LearnStack.Screen name="RecommendedArticle" component={RecommendedArticleScreen} />
    </LearnStack.Navigator>
  );
}

export default LearnNavigator;
