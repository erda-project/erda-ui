export interface UserMenuProps {
  avatar?: AvatarProps;
  name?: string;
  subtitle?: string;
  operations?: UserMenuOperation[];
  prefixCls?: string;
  layout?: 'vertical' | 'horizontal';
  onClick?: (param: React.MouseEventHandler) => void;
}

interface UserMenuOperation {
  icon?: React.ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface AvatarProps {
  src?: string;
  chars?: string;
}
