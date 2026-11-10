import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const MESSAGE = 'Есть несохранённые изменения. Уйти со страницы без сохранения?';

/** Asks before leaving the page (reload, tab close or in-app navigation) while `isDirty` is true. */
export function useUnsavedGuard(isDirty: Ref<boolean>): void {
  function onBeforeUnload(event: BeforeUnloadEvent): void {
    if (isDirty.value) event.preventDefault();
  }

  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload));
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload));

  onBeforeRouteLeave(() => !isDirty.value || window.confirm(MESSAGE));
}
