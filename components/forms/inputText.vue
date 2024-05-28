<script setup lang="ts">
import { ref, watch, onMounted, defineProps, defineEmits } from "vue";

interface Props {
  placeholder?: string;
  name: string;
  label: string;
  useLocalStorage?: boolean;
  info?: string;
  modelValue?: string;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const inputValue = ref(props.modelValue || ""); // Local reactive property for input value
const localStorageKey = `textInputValue_${props.name}`; // Unique key for each instance

const saveToLocalStorage = (value: string) => {
  localStorage.setItem(localStorageKey, value);
};

const getFromLocalStorage = (): string | null => {
  return localStorage.getItem(localStorageKey);
};

const initializeValue = () => {
  if (props.useLocalStorage) {
    const storedValue = getFromLocalStorage();
    if (storedValue) {
      inputValue.value = storedValue;
      emit("update:modelValue", storedValue); // Emit the updated value
    }
  }
};

watch(inputValue, (newValue) => {
  emit("update:modelValue", newValue); // Emit the updated value
  if (props.useLocalStorage) {
    saveToLocalStorage(newValue);
  }
});

onMounted(() => {
  initializeValue();
});
</script>

<template>
  <div class="relative w-full">
    <div class="flex w-full">
      <label
        :class="disabled ? 'text-grey' : ''"
        class="font-inter text-xsmall pl-1 text-darkgrey dark:text-white font-semibold mb-2"
        >{{ label }}</label
      >
      <div v-if="info !== ''" class="group relative flex gap-5">
        <NuxtIcon name="Info" class="text-xsmall pl-1 text-lightgrey dark:text-creme cursor-pointer relative" />
        <div
          class="font-inter bg-darkgrey dark:bg-white rounded-sm w-32 h-10 p-1 left-5 bottom-5 transition-all hidden group-hover:block absolute"
        >
          <p class="font-inter text-white dark:text-black text-xsmall leading-4">
            {{ info }}
          </p>
        </div>
      </div>
    </div>
    <input
      :disabled="disabled"
      type="text"
      class="font-inter text-small border disabled:cursor-not-allowed border-creme outline-none text-left rounded-md w-full py-3 pl-3 dark:bg-lighterdark dark:text-white placeholder:text-light-300 dark:placeholder:text-creme focus:outline-purple-dark cursor-pointer"
      :name="name"
      v-model="inputValue"
      :placeholder="placeholder"
    />
  </div>
</template>
