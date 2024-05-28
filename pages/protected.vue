<template>
  <!-- <div class="flex items-center justify-center w-full h-full">
    <div
      class="flex items-center justify-around min-w-96 h-64 bg-vertica-purple-light p-5 border border-vertica-purple-dark rounded-lg"
    >
      <div class="self-start w-1/2">
        <h1 class="text-h4 text-white bg-[#4650A0] px-3 py-1 w-22 mb-4">Velkommen!</h1>

        <p class="text-small text-vertica-purple-dark w-1/2 min-w-52">
          I kan læse mere om mig, mine kompetencer og erfaring på LinkedIn. <br /><br />
          Det er dog langt hyggeligere at snakke over en kop kaffe :-)
        </p>
      </div>

      <button
        @click="logout"
        class="disabled:bg-purple-300 disabled:cursor-not-allowed hover:cursor-pointer bg-vertica-green font-inter text-white w-44 py-2 rounded-md"
        type="submit"
      >
        Logout
      </button>
    </div>
  </div> -->
  <div class="w-full h-full flex flex-wrap justify-center items-center">
    <div
      class="w-full dm:w-3/4 md:w-2/3 lg:w-2/3 h-full md:h-auto lg:py-20 bg-vertica-purple-light border border-vertica-purple-dark rounded-md p-5 flex flex-wrap justify-center lg:justify-evenly items-center gap-10"
    >
      <div class="flex flex-col gap-4 w-full lg:w-1/2 max-w-[400px]">
        <p class="text-small text-vertica-purple-dark tracking-wider font-bold font-inter">VERTICA</p>
        <h1 class="text-h4 text-white bg-[#4650A0] px-3 py-1">Godt gået!</h1>
        <p class="text-small text-vertica-purple-dark">
          I er nu logget ind! I kan læse mere om mig, mine kompetencer og erfaring på
          <a class="text-vertica-green" href="https://www.linkedin.com/in/mathias-quist-michaelsen-329590125/"
            >LinkedIn</a
          >. <br /><br />
          Det er dog langt hyggeligere at snakke over en kop kaffe :-).
        </p>
        <a class="text-vertica-green" href="mailto:mathiasqm@gmail.com">mathiasqm@gmail.com</a>
        <a class="text-vertica-green" href="tel:+4528487925">28 48 79 25</a>
      </div>
      <button
        @click="logout"
        class="font-inter disabled:bg-purple-300 disabled:cursor-not-allowed hover:cursor-pointer bg-[#4650A0] text-white w-44 py-2 rounded-md"
        type="submit"
      >
        Log ud
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

definePageMeta({
  middleware: "auth",
});

const router = useRouter();

const logout = () => {
  localStorage.removeItem("authToken");
  router.push("/");
};
</script>
