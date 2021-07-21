import React from 'react';
import axios from 'axios';
import message from '~/common/components/message';
import FormInput from '~/common/components/form-input';
import Container from '~/common/components/container';
import ucStore from '~/store/uc';
import i18n from '~/common/i18n';
import history from '~/common/history';

const getValidText = (v: string) => {
  return !!v ? '' : i18n.t('can not be empty');
};

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [emailValid, setEmailValid] = React.useState('');
  const [passwordValid, setPasswordValid] = React.useState('');

  const updateEmial = (v: string) => {
    setEmail(v);
    setEmailValid(getValidText(v));
  };

  const updatePassword = (v: string) => {
    setPassword(v);
    setPasswordValid(getValidText(v));
  };

  const handleRember = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(e.target.checked);
  };

  const handleSubmit = () => {
    if (email && password) {
      axios
        .post('/api/user/login', {
          email,
          password,
          remember,
        })
        .then((res) => {
          ucStore.setProfile(res?.data?.data);
          history.push('/uc/setting');
        })
        .catch((e) => {
          message.error(e?.response?.data?.errorMsg || e.message);
        });
    } else {
      setEmailValid(getValidText(email));
      setPasswordValid(getValidText(password));
    }
  };

  const goToRegistration = () => {
    history.push('/uc/registration');
  };

  return (
    <Container>
      <h2 className="text-center text-4xl text-indigo-800 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
        {i18n.t('Welcome to Erda')}
      </h2>
      <div className="mt-12">
        <FormInput
          label={i18n.t('email')}
          value={email}
          onChange={updateEmial}
          placeholder={i18n.t('enter your {name}', { name: i18n.t('email') })}
          errorTip={emailValid}
        />

        <FormInput
          label={i18n.t('password')}
          value={password}
          onChange={updatePassword}
          placeholder={i18n.t('enter your {name}', { name: i18n.t('password') })}
          type="password"
          errorTip={passwordValid}
          // labelExtra={(
          // <div>
          //   <a className="text-xs font-display font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">Forgot Password?</a>
          // </div>
          // )}
        />

        <div className="mt-8 flex items-center">
          <input type="checkbox" onChange={handleRember} className="flex items-center" checked={remember} />
          <span className="text-sm font-bold text-gray-700 ml-2 tracking-wide">{i18n.t('keep login')}</span>
        </div>

        <div className="mt-10">
          <button
            onClick={handleSubmit}
            type="submit"
            className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg"
          >
            {i18n.t('Login')}
          </button>
        </div>
        <div className="my-12 text-sm font-display font-semibold text-gray-700 pb-2 text-center">
          {i18n.t('Do not have an account?')}{' '}
          <a className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={goToRegistration}>
            {i18n.t('Sign up')}
          </a>
        </div>
      </div>
    </Container>
  );
}
