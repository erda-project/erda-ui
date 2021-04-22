import * as React from 'react';
// import routeInfoStore from 'app/common/stores/route';
import { goTo } from 'common/utils';

let _orgName = '';
const OrgHome = () => {
  // const orgName = routeInfoStore.useStore(s => s.params.orgName);

  React.useEffect(()=>{
    console.log('------init');
  },[])

  return (
    <div className=''>
      org home
    </div>
  );
}

export default OrgHome

const getOrg = ()=>{
  console.log('------get');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('terminus');
    }, 100);
  });
}