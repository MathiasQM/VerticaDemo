<script setup lang="ts">
import { ref, reactive, onMounted, defineProps, defineEmits } from "vue";

interface Props {
  default?: string;
  digitCount: number;
  modelValue: string;
}

const props = defineProps<Props>();

const digits = reactive<string[]>(Array(props.digitCount).fill(""));

const otpContainer = ref<HTMLDivElement | null>(null);

const emit = defineEmits<{
  (e: "update:otp", otp: string): void;
}>();

const isDigitsFull = (): boolean => {
  return digits.every((digit) => digit !== "");
};

const handleKeyDown = (event: KeyboardEvent, index: number): void => {
  if (event.key !== "Tab" && event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
    event.preventDefault();
  }

  if (event.key === "Backspace") {
    digits[index] = "";

    if (index > 0) {
      (otpContainer.value?.children[index - 1] as HTMLElement).focus();
    }

    return;
  }

  if (/^\d$/.test(event.key)) {
    digits[index] = event.key;

    if (index < props.digitCount - 1) {
      (otpContainer.value?.children[index + 1] as HTMLElement).focus();
    }

    if (isDigitsFull()) {
      emit("update:otp", digits.join(""));
    }
  }
};

const handlePaste = (event: ClipboardEvent, index: number): void => {
  const paste = event.clipboardData?.getData("text") || "";
  if (paste.length <= props.digitCount && /^\d+$/.test(paste)) {
    for (let i = 0; i < props.digitCount; i++) {
      if (index + i < props.digitCount) {
        digits[index + i] = paste.charAt(i);
      }
    }
    emit("update:otp", digits.join(""));
    event.preventDefault();
  }
};

const handleInput = (event: Event, index: number): void => {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  console.log(value);

  // Handle the case where the input value length is greater than 1
  if (value.length > 1) {
    for (let i = 0; i < value.length && i < props.digitCount; i++) {
      digits[i] = value.charAt(i);
    }
    emit("update:otp", digits.join(""));
  } else {
    digits[index] = value;
    if (isDigitsFull()) {
      emit("update:otp", digits.join(""));
    }
  }
};

onMounted(() => {
  otpContainer.value?.querySelectorAll("input").forEach((input, ind) => {
    input.addEventListener("paste", (event) => handlePaste(event as ClipboardEvent, ind));
    input.addEventListener("input", (event) => handleInput(event, ind));
  });
});
</script>

<template>
  <div ref="otpContainer" class="flex justify-evenly gap-5 w-full">
    <input
      type="tel"
      class="w-10 h-10 lg:w-12 lg:h-12 border border-light-300 rounded-md flex justify-center items-center text-h4 text-center focus:outline-purple-500"
      v-for="(el, ind) in digits"
      :key="ind"
      v-model="digits[ind]"
      :autofocus="ind === 0"
      autocomplete="off"
      :placeholder="String(ind + 1)"
      maxlength="1"
      @keydown="handleKeyDown($event, ind)"
      @paste="handlePaste($event, ind)"
      @input="handleInput($event, ind)"
      :class="{ bounce: digits[ind] !== '' }"
    />
  </div>
</template>

<style scoped>
.bounce {
  animation: pulse 0.3s ease-in-out alternate;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.1);
  }
}
</style>
