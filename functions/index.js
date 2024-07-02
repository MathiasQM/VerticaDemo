// functions/index.js
import { checkEmail } from './Auth/checkEmail.js';
import { generateRegistrationOptions } from './Auth/generateRegistrationOptions.js';
import { verifyRegistration } from './Auth/verifyRegistration.js';
import { generateAuthenticationOptions } from './Auth/generateAuthenticationOptions.js';
import { verifyAuthentication } from './Auth/verifyAuthentication.js';
import { setAuthCookie } from './Auth/setAuthCookie.js';
import { generateOTP } from './Auth/generateOTP.js';
import { verifyOTP } from './Auth/verifyOTP.js';


export {
  checkEmail,
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  setAuthCookie,
  generateOTP,
  verifyOTP,
};
