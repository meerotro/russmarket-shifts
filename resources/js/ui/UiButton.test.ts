import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import UiButton from './UiButton.vue';

describe('UiButton', () => {
  it('renders the variant, theme and content', () => {
    const wrapper = mount(UiButton, {
      props: { variant: 'secondary', theme: 'blue' },
      slots: { default: 'Опубликовать', 'icon-left': '<i class="icon" />' },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ui-button--secondary', 'ui-button--blue', 'ui-button--md']),
    );
    expect(wrapper.text()).toBe('Опубликовать');
    expect(wrapper.find('.icon').exists()).toBe(true);
    expect(wrapper.attributes('type')).toBe('button');
  });

  it('is clickable when enabled and inert when disabled', async () => {
    let clicks = 0;
    const onClick = () => clicks++;

    await mount(UiButton, { attrs: { onClick } }).trigger('click');
    expect(clicks).toBe(1);

    const disabled = mount(UiButton, { props: { disabled: true }, attrs: { onClick } });
    await disabled.trigger('click');
    expect(clicks).toBe(1);
    expect(disabled.attributes('disabled')).toBeDefined();
  });

  it('can be forced into the active state', () => {
    expect(mount(UiButton, { props: { active: true } }).classes()).toContain('is-active');
  });
});
