<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary';
export type ButtonTheme = 'dark' | 'blue';

withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    /** The blue theme defines primary, secondary and tertiary; other variants look the same in both. */
    theme?: ButtonTheme;
    size?: 'md' | 'sm';
    type?: 'button' | 'submit';
    disabled?: boolean;
    /** Keeps the pressed look, e.g. while the menu opened by the button is visible. */
    active?: boolean;
    /** Stretches the button to the width of its container. */
    block?: boolean;
    /** A square button for a single icon; pass the accessible name via aria-label. */
    iconOnly?: boolean;
  }>(),
  {
    variant: 'primary',
    theme: 'dark',
    size: 'md',
    type: 'button',
    disabled: false,
    active: false,
    block: false,
    iconOnly: false,
  },
);
</script>

<template>
  <button
    class="ui-button"
    :class="[
      `ui-button--${variant}`,
      `ui-button--${theme}`,
      `ui-button--${size}`,
      { 'is-active': active, 'ui-button--block': block, 'ui-button--icon': iconOnly },
    ]"
    :type="type"
    :disabled="disabled"
  >
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </button>
</template>

<style scoped>
.ui-button {
  --bg: var(--c-dark);
  --bg-hover: var(--c-dark-hover);
  --bg-active: var(--c-dark-active);
  --fg: #fff;
  --line: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: var(--control-h);
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--bg);
  color: var(--fg);
  font-size: var(--fs-md);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  transition:
    background-color var(--ease),
    border-color var(--ease),
    color var(--ease);
}

.ui-button:hover {
  background: var(--bg-hover);
}

.ui-button:active,
.ui-button.is-active {
  background: var(--bg-active);
}

.ui-button--sm {
  height: 28px;
  padding: 0 8px;
  font-size: var(--fs-xs);
}

.ui-button--block {
  display: flex;
  width: 100%;
}

.ui-button--icon {
  width: var(--control-h);
  padding: 0;
}

.ui-button--icon.ui-button--sm {
  width: 28px;
}

/* Dark theme */
.ui-button--secondary {
  --bg: var(--c-neutral);
  --bg-hover: var(--c-neutral-hover);
  --bg-active: var(--c-neutral-active);
  --fg: var(--c-text);
}

.ui-button--tertiary {
  --bg: var(--c-surface);
  --bg-hover: #f9f9f9;
  --bg-active: var(--c-neutral-hover);
  --fg: var(--c-text);
  --line: var(--c-dark);
}

.ui-button--quaternary {
  --bg: var(--c-surface);
  --bg-hover: var(--c-ghost-hover);
  --bg-active: var(--c-neutral-hover);
  --fg: var(--c-text);
  --line: var(--c-neutral-hover);
}

/* Meant for grey surfaces: a white button without a border. */
.ui-button--quinary {
  --bg: var(--c-surface);
  --bg-hover: var(--c-neutral-hover);
  --bg-active: var(--c-neutral-active);
  --fg: var(--c-text);
}

/* Blue theme */
.ui-button--primary.ui-button--blue {
  --bg: var(--c-blue);
  --bg-hover: var(--c-blue-hover);
  --bg-active: var(--c-blue-active);
}

.ui-button--secondary.ui-button--blue {
  --bg: var(--c-blue-soft);
  --bg-hover: var(--c-blue-soft-hover);
  --bg-active: var(--c-blue-soft-active);
  --fg: var(--c-blue-text);
}

.ui-button--tertiary.ui-button--blue {
  --bg-hover: var(--c-blue-ghost-hover);
  --bg-active: var(--c-blue-ghost-active);
  --fg: var(--c-blue-text);
  --line: var(--c-blue-line);
}

/* Disabled: one muted look for every variant, as in the kit. */
.ui-button:disabled {
  --bg: var(--c-neutral);
  --fg: var(--c-text-disabled);
  --line: transparent;

  background: var(--bg);
  cursor: not-allowed;
}

.ui-button--tertiary:disabled,
.ui-button--quaternary:disabled,
.ui-button--quinary:disabled {
  --bg: var(--c-surface);
  --line: var(--c-neutral-hover);
}

.ui-button--quinary:disabled {
  --line: transparent;
}
</style>
