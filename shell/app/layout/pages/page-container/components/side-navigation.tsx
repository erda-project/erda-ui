import React from 'react';
import { Menu, Button } from 'core/nusi';
import { map } from 'lodash';
import { MenuProps } from 'core/common/interface';
import { useUpdate } from 'common';
import { MenuFold as IconMenuFold, MenuUnfold as IconMenuUnfold } from '@icon-park/react';

export interface IMenu {
  key?: string;
  href: string;
  title?: string;
  text: string;
  icon: string | React.ReactNode;
  customIcon: Element;
  subMenu?: IMenu[];
  children?: IMenu[];
  jumpOut?: boolean;
  prefix?: string; // if page under this menu has different prefix of url, use this property get find active key
  isActive?: (s: string) => boolean;
}

interface IProps extends MenuProps {
  extraNode: React.ReactElement;
  openKeys: string[];
  selectedKey: string;
  linkRender: (child: React.ReactNode, item: IMenu) => React.ReactNode;
  dataSource: IMenu[];
  onFold: (v: boolean) => void;
}

const SideNavigation = ({
  extraNode,
  openKeys,
  selectedKey,
  linkRender,
  dataSource,
  onFold,
  onOpenChange,
  ...restProps
}: IProps) => {
  const [{ isFold, cachedOpenKeys }, updater] = useUpdate({
    isFold: false,
    cachedOpenKeys: [] as string[],
  });

  const renderChildrenMenu = (childList: IMenu[]) => {
    return map(childList, (child) => {
      const { icon, children, title, href } = child;
      const renderIcon = <span className="ant-menu-item-icon m-0 p-0">{icon}</span>;
      if (children && children.length) {
        return (
          <Menu.SubMenu key={href} icon={renderIcon} title={title}>
            {renderChildrenMenu(children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item title={title} key={href} icon={icon}>
          {linkRender(title, child)}
        </Menu.Item>
      );
    });
  };

  const handleOnFold = () => {
    if (!isFold) {
      updater.cachedOpenKeys(openKeys);
    } else {
      onOpenChange?.(cachedOpenKeys);
    }
    updater.isFold(!isFold);
    onFold(!isFold);
  };

  return (
    <div className="h-full side-nav-menu overflow-hidden" style={{ width: isFold ? 80 : 200 }}>
      <div style={{ height: 'calc(100% - 48px)' }} className="pt-2 border-right flex flex-col">
        {!isFold ? extraNode : null}
        <div className="flex-1 overflow-y-auto overflow-x-hidden h-full">
          <Menu
            inlineCollapsed={isFold}
            theme="light"
            openKeys={openKeys}
            selectedKeys={[selectedKey]}
            mode="inline"
            onOpenChange={onOpenChange}
            {...restProps}
          >
            {renderChildrenMenu(dataSource)}
          </Menu>
        </div>
      </div>
      <div className="h-12 relative">
        <Button type="primary" onClick={handleOnFold} className="absolute right-0 p-1">
          {isFold ? <IconMenuUnfold size="18" /> : <IconMenuFold size="18" />}
        </Button>
      </div>
    </div>
  );
};

export default SideNavigation;
