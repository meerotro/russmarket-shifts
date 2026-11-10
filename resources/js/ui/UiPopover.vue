<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** The element the popover is attached to. */
    anchor: HTMLElement | null;
    placement?: 'bottom-start' | 'bottom-end';
    offset?: number;
    label?: string;
  }>(),
  { placement: 'bottom-start', offset: 6, label: undefined },
);

const open = defineModel<boolean>('open', { required: true });

const VIEWPORT_MARGIN = 8;
const panel = ref<HTMLElement | null>(null);
const position = ref({ top: '0px', left: '0px' });

/** Places the panel under the anchor; flips above it and shifts sideways to stay on screen. */
function place(): void {
  if (!props.anchor || !panel.value) return;

  const anchor = props.anchor.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = panel.value;

  let top = anchor.bottom + props.offset;
  if (top + height > window.innerHeight - VIEWPORT_MARGIN) {
    top = Math.max(VIEWPORT_MARGIN, anchor.top - props.offset - height);
  }

  const wanted = props.placement === 'bottom-end' ? anchor.right - width : anchor.left;
  const left = Math.min(
    Math.max(VIEWPORT_MARGIN, wanted),
    window.innerWidth - width - VIEWPORT_MARGIN,
  );

  position.value = { top: `${top}px`, left: `${left}px` };
}

function onPointerDown(event: PointerEvent): void {
  const target = event.target as Node;
  if (panel.value?.contains(target) || props.anchor?.contains(target)) return;
  open.value = false;
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  event.stopPropagation();
  open.value = false;
}

watch(
  () => [open.value, props.anchor] as const,
  async ([isOpen], _previous, onCleanup) => {
    if (!isOpen) return;

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    onCleanup(() => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    });

    await nextTick();
    place();
  },
  { immediate: true },
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="panel"
      class="ui-popover"
      role="dialog"
      :aria-label="label"
      :style="position"
    >
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.ui-popover {
  position: fixed;
  z-index: 100;
  max-width: calc(100vw - 16px);
  border-radius: 10px;
  background: var(--c-surface);
  box-shadow: var(--shadow-pop);
}
</style>
