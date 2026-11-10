import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import type { ShiftView } from '@/lib/shiftView';

import CoverageCell from './CoverageCell.vue';
import ShiftCell from './ShiftCell.vue';

const shift: ShiftView = { time: '08 - 18', hours: '10 ч', tone: 'purple', title: 'День' };

describe('ShiftCell', () => {
  it('is an empty dashed slot by default', () => {
    const wrapper = mount(ShiftCell, { props: { view: 'week' } });

    expect(wrapper.find('.shift-cell__empty').exists()).toBe(true);
    expect(wrapper.find('.shift-cell__plus').exists()).toBe(false);
  });

  it('shows a plus when an empty slot is selected', () => {
    const wrapper = mount(ShiftCell, { props: { view: 'week', selected: true } });

    expect(wrapper.classes()).toContain('is-selected');
    expect(wrapper.find('.shift-cell__plus').exists()).toBe(true);
  });

  it('shows time and hours in the week view, hours only in the month view', () => {
    const week = mount(ShiftCell, { props: { view: 'week', shift } });
    expect(week.find('.shift-cell__time').text()).toBe('08 - 18');
    expect(week.find('.shift-cell__hours').text()).toBe('10 ч');
    expect(week.find('.tone-purple').exists()).toBe(true);

    const month = mount(ShiftCell, { props: { view: 'month', shift } });
    expect(month.find('.shift-cell__time').exists()).toBe(false);
    expect(month.text()).toBe('10 ч');
  });

  it('marks unsaved shifts and server errors', () => {
    const wrapper = mount(ShiftCell, {
      props: { view: 'week', shift, pending: true, error: 'Сотрудник не найден.' },
    });

    expect(wrapper.find('.is-pending').exists()).toBe(true);
    expect(wrapper.classes()).toContain('has-error');
    expect(wrapper.attributes('title')).toBe('Сотрудник не найден.');
  });

  it('reports the start of a drag', async () => {
    const wrapper = mount(ShiftCell, { props: { view: 'week', shift } });
    await wrapper.find('.shift-cell__shift').trigger('dragstart');

    expect(wrapper.emitted('shift-dragstart')).toHaveLength(1);
  });
});

describe('CoverageCell', () => {
  it('is pink at zero and blue otherwise', () => {
    expect(mount(CoverageCell, { props: { count: 0 } }).classes()).toContain('is-empty');
    expect(mount(CoverageCell, { props: { count: 2 } }).classes()).toContain('is-covered');
  });
});
