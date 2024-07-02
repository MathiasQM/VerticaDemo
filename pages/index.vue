<script setup lang="ts">
// Imports
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  bufferToBase64Url,
  base64urlToArrayBuffer,
  setSessionCookie,
  signInWithCustomTokenAndGetIdToken,
  checkIfEmailExists,
} from "@/utils/utils"; // Import utility functions
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { navigateTo } from "#app";

// Enum for WebAuthN support
const enum WebAuthNSupport {
  Supported = "Supported",
  Unsupported = "Unsupported",
  Unknown = "Unknown",
}

interface GenerateRegistrationOptionsResult {
  challenge: string | ArrayBuffer; // Base64URL string
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string | ArrayBuffer; // Base64URL string
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  authenticatorSelection: {
    userVerification: UserVerificationRequirement;
  };
  timeout: number;
  attestation: AttestationConveyancePreference;
}

interface GenerateRegistrationAndAuthOptionsInput {
  email: string;
  rpId: string;
}

interface GenerateAuthenticationOptionsResult {
  challenge: string | ArrayBuffer; // Base64URL string
  name: string;
  rpId: string;
  allowCredentials: Array<{
    id: string | ArrayBuffer; // Base64URL string
    type: string;
    transports: [string, string, string, string];
  }>;
  userVerification: string;
  timeout: number;
}

interface VerifyOTPResult {
  token: string;
}
interface VerifyOTPInput {
  email: string;
  otp: string;
}

interface CredentialResponse {
  id: string;
  rawId: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
  type: string;
}

interface VerifyRegistrationInput {
  credential: CredentialResponse;
  email: string;
}

interface VerifyRegistrationOutput {
  token: string;
}

interface AssertionResponse {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string;
  };
  type: string;
}

interface VerifyAuthenticationInput {
  assertion: AssertionResponse;
  email: string;
}

interface VerifyAuthenticationOutput {
  token: string;
}

// Firebase services
const functions = getFunctions();

// Vue Router
const router = useRouter();

// State
const email = ref<string>("");
const otp = ref<string>("");
const showOTP = ref<boolean>(false);
const message = ref<string>("");
const webAuthNSupported = ref<WebAuthNSupport>(WebAuthNSupport.Unknown);
const loading = ref<boolean>(false);
const verifyText = ref<string>("Verify Email");

// WebAuthN support check on mount
onMounted(() => {
  webAuthNSupported.value =
    window.PublicKeyCredential !== undefined ? WebAuthNSupport.Supported : WebAuthNSupport.Unsupported;
});

// Helper Functions

const sendOTP = async (): Promise<void> => {
  try {
    const generateOTP = httpsCallable(functions, "generateOTP");
    await generateOTP({ email: email.value });
    showOTP.value = true;
    message.value = "OTP sent to your email";
  } catch (error: any) {
    console.log("Error sending OTP", error);
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
};

const verifyOTPCode = async () => {
  // prettier-ignore
  const verifyOTP = httpsCallable<VerifyOTPInput, VerifyOTPResult>(functions, "verifyOTP");
  const result = await verifyOTP({ email: email.value, otp: otp.value });
  const { token } = result.data;
  const idToken = await signInWithCustomTokenAndGetIdToken(token);
  await setSessionCookie(idToken);
  localStorage.setItem("authToken", token);
  await navigateTo("/protected");
};

const handleRegistration = async () => {
  try {
    // prettier-ignore
    const generateRegistrationOptions = httpsCallable<GenerateRegistrationAndAuthOptionsInput, GenerateRegistrationOptionsResult>(functions, "generateRegistrationOptions");
    const result = await generateRegistrationOptions({
      email: email.value,
      rpId: window.location.hostname,
    });
    const options = result.data;

    // Ensure challenge and user.id are ArrayBuffer
    if (typeof options.challenge === "string") {
      options.challenge = base64urlToArrayBuffer(options.challenge);
    }
    if (typeof options.user.id === "string") {
      options.user.id = base64urlToArrayBuffer(options.user.id);
    }

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: options.challenge as BufferSource,
      rp: options.rp,
      user: { ...options.user, id: options.user.id as BufferSource },
      pubKeyCredParams: options.pubKeyCredParams.map((param) => ({
        ...param,
        type: "public-key" as PublicKeyCredentialType,
      })),
      authenticatorSelection: options.authenticatorSelection,
      timeout: options.timeout,
      attestation: options.attestation,
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential;

    const attestationResponse = credential.response as AuthenticatorAttestationResponse;

    const credentialResponse = {
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      response: {
        attestationObject: bufferToBase64Url(attestationResponse.attestationObject),
        clientDataJSON: bufferToBase64Url(attestationResponse.clientDataJSON),
      },
      type: credential.type,
    };

    // prettier-ignore
    const verifyRegistration = httpsCallable<VerifyRegistrationInput, VerifyRegistrationOutput>(functions, "verifyRegistration");
    const verificationResult = await verifyRegistration({
      credential: credentialResponse,
      email: email.value,
    });

    const { token } = verificationResult.data;
    const idToken = await signInWithCustomTokenAndGetIdToken(token);
    await setSessionCookie(idToken);
    localStorage.setItem("authToken", token);
    router.push("/protected");
    loading.value = false;
  } catch (error: any) {
    console.error("Registration Error:", error);
    loading.value = false;
    message.value = `Registration Error: ${error.message}`;
  }
};

const handleAuthentication = async () => {
  try {
    // prettier-ignore
    const generateAuthenticationOptions = httpsCallable<GenerateRegistrationAndAuthOptionsInput, GenerateAuthenticationOptionsResult>(functions, "generateAuthenticationOptions");
    const result = await generateAuthenticationOptions({
      email: email.value,
      rpId: window.location.hostname,
    });

    const options = result.data;

    // Ensure challenge and allowCredentials.id are ArrayBuffer
    if (typeof options.challenge === "string") {
      options.challenge = base64urlToArrayBuffer(options.challenge);
    }

    options.allowCredentials = options.allowCredentials.map((cred) => ({
      ...cred,
      id: typeof cred.id === "string" ? base64urlToArrayBuffer(cred.id) : cred.id,
    }));

    const assertion = (await navigator.credentials.get({
      publicKey: options as PublicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (!assertion) {
      throw new Error("No assertion returned");
    }

    const assertionResponse = {
      id: assertion.id,
      rawId: bufferToBase64Url(assertion.rawId),
      response: {
        authenticatorData: bufferToBase64Url((assertion.response as AuthenticatorAssertionResponse).authenticatorData),
        clientDataJSON: bufferToBase64Url((assertion.response as AuthenticatorAssertionResponse).clientDataJSON),
        signature: bufferToBase64Url((assertion.response as AuthenticatorAssertionResponse).signature),
        userHandle: bufferToBase64Url((assertion.response as AuthenticatorAssertionResponse).userHandle!),
      },
      type: assertion.type,
    };

    // prettier-ignore
    const verifyAuthentication = httpsCallable<VerifyAuthenticationInput, VerifyAuthenticationOutput>(functions, "verifyAuthentication");
    const verificationResult = await verifyAuthentication({
      assertion: assertionResponse,
      email: email.value,
    });

    const { token } = verificationResult.data;
    const idToken = await signInWithCustomTokenAndGetIdToken(token);
    await setSessionCookie(idToken);
    localStorage.setItem("authToken", token);
    navigateTo("/protected");
    loading.value = false;
  } catch (error: any) {
    console.error("Authentication Error:", error);
    if (error.name === "NotAllowedError" || error.name === "InvalidStateError") {
      //TODO:Handle the specific case where credentials are not found
      loading.value = false;
      message.value =
        "Unhandled case: No available credentials for your account. Please verify your identity to re-register your device.";
    } else {
      loading.value = false;
      message.value = `Authentication Error: ${error.message}`;
    }
  }
};

const handleExistingUser = async (authMethods: string[]): Promise<void> => {
  if (webAuthNSupported.value === WebAuthNSupport.Supported) {
    if (authMethods.includes("webauthn")) {
      await handleAuthentication();
    } else {
      if (!showOTP.value) {
        await sendOTP();
        verifyText.value = "Login with One Time Password";
      } else await verifyOTPCode();
    }
    loading.value = false;
    return;
  } else {
    //webAuthN not supported
    console.log("WebAuthN not supported for this user");
    if (!showOTP.value) {
      await sendOTP();
      verifyText.value = "Login with One Time Password";
    } else await verifyOTPCode();
    loading.value = false;
  }
};

const handleNonExistingUser = async (): Promise<void> => {
  loading.value = true;
  message.value = "";

  if (webAuthNSupported.value === WebAuthNSupport.Supported) {
    if (!showOTP.value) {
      await sendOTP();
    } else {
      await verifyOTPAndRegister(true);
    }
  } else {
    if (!showOTP.value) {
      await sendOTP();
    } else {
      await verifyOTPAndRegister();
    }
  }
};

// prettier-ignore
const verifyOTPAndRegister = async (dontcreateUser: boolean = false): Promise<void> => {
  try {
    // prettier-ignore
    const verifyOTP = httpsCallable<{ email: string; otp: string; dontcreateUser?: boolean }, { res?: string; token?: string }>(functions, "verifyOTP");
    const result = await verifyOTP({
      email: email.value,
      otp: otp.value,
      dontcreateUser,
    });

    const { res, token } = result.data;
    if (res === "success" || token) {
      if (dontcreateUser) {
        await handleRegistration();
      } else if (token) {
        const idToken = await signInWithCustomTokenAndGetIdToken(token);
        await setSessionCookie(idToken);
        localStorage.setItem("authToken", token);
        router.push("/protected");
      }
    }
  } catch (error: any) {
    console.log("OTP verification failed", error);
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
};

// Main Function

const handleSubmit = async (): Promise<void> => {
  loading.value = true;
  message.value = "";
  try {
    const { emailExists, authMethods } = await checkIfEmailExists(email.value);
    console.log("Email exists:", emailExists, "Auth methods:", authMethods);

    if (emailExists) {
      await handleExistingUser(authMethods);
    } else if (!emailExists) {
      await handleNonExistingUser();
    }
  } catch (error: any) {
    console.error("Error handling submit:", error);
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="w-full h-full flex flex-wrap justify-center items-center">
    <div
      class="w-full dm:w-3/4 md:w-2/3 lg:w-2/3 h-full md:h-auto lg:py-20 bg-vertica-purple-light border border-vertica-purple-dark rounded-md p-5 flex flex-wrap justify-center lg:justify-evenly items-center gap-10"
    >
      <div class="flex flex-col gap-4 w-full lg:w-1/2 max-w-[400px]">
        <p class="text-small text-vertica-purple-dark tracking-wider font-bold font-inter">VERTICA</p>
        <h1 class="text-h4 text-white bg-[#4650A0] px-3 py-1">Log ind eller Tilmeld</h1>
        <p class="text-small text-vertica-purple-dark">
          Dette er en MVP af <span class="font-bold">WebAuthN</span> og
          <span class="font-bold">One Time Password</span> som demonstration til <span class="font-bold">Vertica</span>.
          Log ind med WebAuthN eller OTP, baseret på din browsers kompatibilitet.

          <br /><br />
          - Mathias
        </p>
      </div>
      <div class="w-full lg:w-1/2 max-w-[400px]">
        <form @submit.prevent="handleSubmit" class="w-full flex flex-col gap-5 justify-center items-center">
          <FormsInputText v-model="email" label="Email" type="email" name="email" placeholder="Enter your email" />
          <p v-if="showOTP" class="font-inter w-full text-xsmall font-semibold">
            {{ verifyText }}
          </p>
          <Transition name="fade">
            <FormsOTP v-if="showOTP" :digit-count="6" @update:otp="otp = $event" v-model="otp" />
          </Transition>
          <button
            :disabled="loading"
            class="font-inter disabled:bg-purple-300 disabled:cursor-not-allowed hover:cursor-pointer bg-[#4650A0] text-white w-44 py-2 rounded-md"
            type="submit"
          >
            <template v-if="!loading">{{ !showOTP ? "Submit" : "Verify email" }}</template>
            <template v-else><UiSpinner /></template>
          </button>
        </form>
        <div v-if="message">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: rgb(123, 97, 255) !important;
  transition: background-color 5000s ease-in-out 0s;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
