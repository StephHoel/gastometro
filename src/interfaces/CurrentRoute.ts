import type { ParamListBase, RouteProp } from "expo-router/react-navigation"

interface RootStackParamList extends ParamListBase {
  Index: undefined
  Add: undefined
  Edit: { id: string }
};

export interface CurrentRoute extends RouteProp<RootStackParamList, keyof RootStackParamList> { }
