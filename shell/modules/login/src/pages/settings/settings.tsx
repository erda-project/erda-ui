import React from 'react';
import ucStore from '~/store/uc';


export default function Settings() {
  const profile = ucStore.useStore(s => s.profile);

  let content = 'empty';
  if (profile) {
    console.log('profile:', profile.identity);
    content = JSON.stringify(profile.identity);
  }

  return (
    <div className="lg:flex">
      {content}
    </div>
  );
}
