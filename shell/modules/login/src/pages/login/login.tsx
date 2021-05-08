import React from 'react';
import logo from '~/images/logo.svg';
import login from '~/images/login.svg';
import axios from 'axios';
import queryString from 'query-string';
import './login.css';


export default function Login() {
  const idRef = React.useRef(null);
  const pwRef = React.useRef(null);
  const [id, setId] = React.useState('test@a.com')
  const [pw, setPw] = React.useState('xXVc8j26H!vXn84')
  const [csrfToken, setCsrfToken] = React.useState('')
  const [submitUrl, setSubmitUrl] = React.useState('')

  React.useEffect(() => {
    const query = queryString.parse(window.location.search);
    if (query.flow) {
      axios
        .get(`/4434/self-service/login/flows?id=${query.flow}`)
        .then(res => {
          const { methods } = res.data;
          const { action, fields } = methods.password.config;
          setSubmitUrl(action);
          const tokenField = fields.find((f: any) => f.name === "csrf_token");
          if (tokenField) {
            setCsrfToken(tokenField.value);
          }
        })
        .catch(e => {
          if(e.response.status === 410) {
            window.location.href = `${window.location.origin}/4433/self-service/login/browser`
          }
        })
    }
  }, []);

  const handleInputId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  }

  const handleInputPw = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPw(e.target.value);
  }

  // const handleSubmit = () => {
  //   axios
  //     .post(submitUrl, {
  //       identifier: id,
  //       password: pw,
  //       csrf_token: csrfToken,
  //     })
  //     .then(res => {
  //       console.log('res:', res);
  //     })
  //     .catch(e => {
  //       console.log('e:', e);
  //     });
  // }

  return (
    <>
      <div className="lg:flex">
        <div className="lg:w-1/2 xl:max-w-screen-sm">
          <div className="py-12 bg-indigo-100 lg:bg-white flex items-center justify-center lg:px-12">
            <div className="cursor-pointer flex items-center">
              <img src={logo} className='lg:w-80 md:w-auto' alt="logo" />
            </div>
          </div>
          <div className="mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl">
            <h2 className="text-center text-4xl text-indigo-800 font-display font-semibold lg:text-left xl:text-5xl
                xl:text-bold">Welcome</h2>
            <div className="mt-12">
              <form action={submitUrl} method="POST">
                <div>
                  <div className="text-sm font-bold text-gray-700 tracking-wide">Email Address</div>
                  <input ref={idRef} name='identifier' value={id} onChange={handleInputId} className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500" type="text" placeholder="mike@gmail.com" />
                </div>
                <div className="mt-8">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-gray-700 tracking-wide">
                      Password
                    </div>
                    <div>
                      <a className="text-xs font-display font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                        Forgot Password?
                    </a>
                    </div>
                  </div>
                  <input ref={pwRef} name="password" value={pw} onChange={handleInputPw} className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500" type="password" placeholder="Enter your password" />
                </div>
                <div className="mt-10">
                  <button type='submit' className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg">
                    Log In
                  </button>
                </div>
                <input name="csrf_token" type="hidden" value={csrfToken}></input>
              </form>
              <div className="mt-12 text-sm font-display font-semibold text-gray-700 text-center">
                Don't have an account ? <a className="cursor-pointer text-indigo-600 hover:text-indigo-800">Sign up</a>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center bg-indigo-100 flex-1 h-screen">
          <div className="max-w-xs transform duration-200 hover:scale-110 cursor-pointer">
            <img src={login} className='w-60' alt="login" />
          </div>
        </div>
      </div>
    </>
  );
}
