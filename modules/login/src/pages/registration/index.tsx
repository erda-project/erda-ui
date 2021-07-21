import React from 'react';
import axios from 'axios';
import Container from '~/common/components/container';
import message from '~/common/components/message';
import FormInput from '~/common/components/form-input';
import history from '~/common/history';
import i18n from '~/common/i18n';

const getValidText = (v?: string, validType?: 'phone' | 'email') => {
  const validMap = {
    phone: {
      pattern: /^(1[3|4|5|7|8|9])\d{9}$/,
      message: i18n.t('Please enter the correct {name}', { name: i18n.t('mobile') }),
    },
    email: {
      pattern: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
      message: i18n.t('Please enter the correct {name}', { name: i18n.t('email') }),
    },
  };

  if (!!v) {
    const curValid = validType && validMap[validType];
    return curValid && !curValid.pattern.test(v) ? curValid.message : '';
  } else {
    return i18n.t('can not be empty');
  }
};

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [nick, setNick] = React.useState('');
  const [emailValid, setEmailValid] = React.useState('');
  const [passwordValid, setPasswordValid] = React.useState('');
  const [phoneValid, setPhoneValid] = React.useState('');
  const [confirmPwValid, setConfirmPwValid] = React.useState('');

  const updateEmial = (v: string) => {
    setEmail(v);
    setEmailValid(getValidText(v, 'email'));
  };

  const updateNick = (v: string) => {
    setNick(v);
  };

  const updatePhone = (v: string) => {
    setPhone(v);
    setPhoneValid(getValidText(v, 'phone'));
  };

  const updatePassword = (v: string) => {
    setPassword(v);
    setPasswordValid(getValidText(v));
    setConfirmPwValid('');
  };

  const updateConfirmPw = (v: string) => {
    setConfirmPw(v);
    setConfirmPwValid(v !== password ? i18n.t('inconsistent passwords') : '');
  };

  const handleSubmit = () => {
    if (email && password && phone && confirmPw && confirmPw === password) {
      axios
        .post('/api/user/registration', {
          email,
          password,
          nick,
          phone,
        })
        .then((res) => {
          history.push('/uc/login');
        })
        .catch((e) => {
          message.error(e?.response?.data?.errorMsg || e.message);
        });
    } else {
      setEmailValid(getValidText(email, 'email'));
      setPasswordValid(getValidText(password));
      setPhoneValid(getValidText(phone, 'phone'));
      setConfirmPwValid(confirmPw !== password ? i18n.t('inconsistent passwords') : '');
    }
  };

  const goToLogin = () => {
    history.push('/uc/login');
  };

  return (
    <Container>
      <h2 className="text-center text-4xl text-indigo-800 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
        {i18n.t('Sign up')}
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
          label={i18n.t('nick name')}
          value={nick}
          onChange={updateNick}
          placeholder={i18n.t('enter your {name}', { name: i18n.t('nick name') })}
        />

        <FormInput
          label={i18n.t('mobile')}
          value={phone}
          onChange={updatePhone}
          placeholder={i18n.t('enter your {name}', { name: i18n.t('mobile') })}
          errorTip={phoneValid}
        />

        <FormInput
          label={i18n.t('password')}
          value={password}
          onChange={updatePassword}
          placeholder={i18n.t('enter your {name}', { name: i18n.t('password') })}
          errorTip={passwordValid}
          type="password"
        />

        <FormInput
          label={i18n.t('confirm password')}
          value={confirmPw}
          onChange={updateConfirmPw}
          placeholder={i18n.t('enter your {name}', { name: i18n.t('confirm password') })}
          errorTip={confirmPwValid}
          type="password"
        />

        <div className="mt-10">
          <button
            onClick={handleSubmit}
            type="submit"
            className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg"
          >
            {i18n.t('Sign up')}
          </button>
        </div>
        <div className="my-12 text-sm font-display font-semibold text-gray-700 text-center">
          {i18n.t('Already have an account?')}{' '}
          <a className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={goToLogin}>
            {i18n.t('Login')}
          </a>
        </div>
      </div>
    </Container>
  );
}
