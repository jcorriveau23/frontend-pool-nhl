export const initFacebookSdk = () =>
  new Promise((resolve, reject) => {
    // Load the Facebook SDK asynchronously
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: '975314003763320',
        cookie: true,
        xfbml: true,
        version: 'v17.0',
      });
      // Resolve the promise when the SDK is loaded
      resolve();
    };

    // load facebook sdk script
    (function (d, s, id) {
      let js, // eslint-disable-line
        fjs = d.getElementsByTagName(s)[0]; // eslint-disable-line
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s); // eslint-disable-line
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  });

export const getFacebookLoginStatus = () =>
  new Promise((resolve, reject) => {
    window.FB.getLoginStatus(
      response => {
        resolve(response);
      },
      { scope: 'email,public_profile' }
    );
  });

export const fbLogin = () =>
  new Promise((resolve, reject) => {
    window.FB.login(
      response => {
        resolve(response);
      },
      { scope: 'email,public_profile' }
    );
  });

export const fbLogout = () =>
  new Promise((resolve, reject) => {
    window.FB.logout(response => {
      resolve(response);
    });
  });
