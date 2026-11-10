import { onScopeDispose, type Ref, ref, watch } from 'vue';

/** A copy of `source` that settles only after it has stopped changing for `delay` ms. */
export function useDebounce<T>(source: Ref<T>, delay = 250): Readonly<Ref<T>> {
  const debounced = ref(source.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | undefined;

  watch(source, (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.value = value;
    }, delay);
  });

  onScopeDispose(() => clearTimeout(timer));

  return debounced;
}
