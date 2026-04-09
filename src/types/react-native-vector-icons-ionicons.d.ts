declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  type IoniconsProps = TextProps & {
    name: string;
    size?: number;
    color?: string;
  };

  const Ionicons: ComponentType<IoniconsProps>;

  export default Ionicons;
}
