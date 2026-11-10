<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

import CoverageCell from '@/components/schedule/CoverageCell.vue';
import CustomShiftForm from '@/components/schedule/CustomShiftForm.vue';
import EmployeeCell from '@/components/schedule/EmployeeCell.vue';
import QuickAssignMenu from '@/components/schedule/QuickAssignMenu.vue';
import SelectionBar from '@/components/schedule/SelectionBar.vue';
import ShiftCell from '@/components/schedule/ShiftCell.vue';
import TemplateCard from '@/components/schedule/TemplateCard.vue';
import type { TemplateItem } from '@/components/schedule/TemplatesPanel.vue';
import type { CalendarView } from '@/lib/dates';
import type { ShiftTone, ShiftView } from '@/lib/shiftView';
import { validateRange } from '@/lib/time';
import { ICONS, type IconName } from '@/ui/icons';
import UiAvatar from '@/ui/UiAvatar.vue';
import UiBadge from '@/ui/UiBadge.vue';
import UiButton, { type ButtonTheme, type ButtonVariant } from '@/ui/UiButton.vue';
import UiIcon from '@/ui/UiIcon.vue';
import UiPopover from '@/ui/UiPopover.vue';
import UiSearchInput from '@/ui/UiSearchInput.vue';
import UiSegmented from '@/ui/UiSegmented.vue';

const BUTTONS: { theme: ButtonTheme; variants: ButtonVariant[] }[] = [
  { theme: 'dark', variants: ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'] },
  { theme: 'blue', variants: ['primary', 'secondary', 'tertiary'] },
];
const STATES = [
  { label: 'Default', props: {} },
  { label: 'Active', props: { active: true } },
  { label: 'Disabled', props: { disabled: true } },
] as const;

const TONES: ShiftTone[] = ['blue', 'mint', 'purple', 'solid'];
const VIEWS: CalendarView[] = ['week', 'month'];
const shift = (tone: ShiftTone): ShiftView => ({ time: '08 - 18', hours: '10 ч', tone, title: '' });

const TEMPLATES: TemplateItem[] = [
  { id: 1, name: 'Утро', details: '07:00 - 15:00 · 8 ч', color: 'blue', count: 1 },
  { id: 2, name: 'День', details: '10:00 - 18:00 · 8 ч', color: 'purple', count: 4 },
  { id: 3, name: 'Вечер', details: '15:00 - 23:00 · 8 ч', color: 'mint', count: 2 },
];

const icons = Object.keys(ICONS) as IconName[];
const searchEmpty = ref('');
const searchFilled = ref('Пишем что-то');
const period = ref<CalendarView>('week');
const start = ref('09:00');
const end = ref('17:00');
const menuAnchor = ref<HTMLElement | null>(null);
const menuOpen = ref(false);
</script>

<template>
  <main class="kit">
    <header class="kit__header">
      <h1>UI-кит</h1>
      <RouterLink to="/">← К графику смен</RouterLink>
    </header>

    <section class="kit__section">
      <h2>Кнопки</h2>
      <p class="kit__note">Hover и Pressed — наведите и нажмите; Active показан принудительно.</p>
      <div v-for="group in BUTTONS" :key="group.theme" class="kit__table">
        <div class="kit__row kit__row--head">
          <span>{{ group.theme === 'dark' ? 'Тёмная тема' : 'Синяя тема' }}</span>
          <span v-for="variant in group.variants" :key="variant">{{ variant }}</span>
        </div>
        <div v-for="state in STATES" :key="state.label" class="kit__row">
          <span>{{ state.label }}</span>
          <span
            v-for="variant in group.variants"
            :key="variant"
            :class="{ 'kit__on-grey': variant === 'quinary' }"
          >
            <UiButton :variant="variant" :theme="group.theme" v-bind="state.props">Кнопка</UiButton>
          </span>
        </div>
      </div>
      <div class="kit__line">
        <UiButton>Только текст</UiButton>
        <UiButton>
          <template #icon-left><UiIcon name="close" :size="14" /></template>
          Иконка слева
        </UiButton>
        <UiButton variant="secondary" theme="blue" block style="max-width: 240px">
          <template #icon-left><UiIcon name="plus" :size="14" /></template>
          Поставить в выделенные
        </UiButton>
        <UiButton size="sm" variant="quaternary">Маленькая</UiButton>
        <UiButton size="sm" variant="quaternary" icon-only aria-label="Вперёд">
          <UiIcon name="chevron-right" :size="14" />
        </UiButton>
      </div>
    </section>

    <section class="kit__section">
      <h2>Поиск</h2>
      <div class="kit__grid kit__grid--2">
        <div class="kit__stack">
          <span class="kit__caption">Серый</span>
          <UiSearchInput v-model="searchEmpty" placeholder="Поиск по ФИО" />
          <UiSearchInput v-model="searchFilled" placeholder="Поиск по ФИО" />
        </div>
        <div class="kit__stack kit__on-grey">
          <span class="kit__caption">Белый</span>
          <UiSearchInput v-model="searchEmpty" variant="white" placeholder="Поиск по ФИО" />
          <UiSearchInput v-model="searchFilled" variant="white" placeholder="Поиск по ФИО" />
        </div>
      </div>
    </section>

    <section class="kit__section">
      <h2>Переключатель, бейджи, аватар, иконки</h2>
      <div class="kit__line">
        <UiSegmented
          v-model="period"
          label="Период"
          :options="[
            { value: 'month', label: 'Месяц' },
            { value: 'week', label: 'Неделя' },
          ]"
        />
        <UiBadge>Badge</UiBadge>
        <UiBadge tone="dark">Badge</UiBadge>
        <UiBadge tone="neutral">Черновик</UiBadge>
        <UiAvatar name="Сергеев Олег" />
        <UiAvatar name="Кузнецова Алина" :size="40" />
      </div>
      <div class="kit__line">
        <span v-for="icon in icons" :key="icon" class="kit__icon" :title="icon">
          <UiIcon :name="icon" />
        </span>
      </div>
    </section>

    <section class="kit__section">
      <h2>Ячейка графика</h2>
      <div class="kit__grid kit__grid--2">
        <div v-for="view in VIEWS" :key="view" class="kit__stack">
          <span class="kit__caption">{{ view === 'week' ? 'Неделя' : 'Месяц' }}</span>
          <div class="kit__cells" :class="`kit__cells--${view}`">
            <ShiftCell :view="view" />
            <ShiftCell :view="view" selected />
            <ShiftCell v-for="tone in TONES" :key="tone" :view="view" :shift="shift(tone)" />
            <ShiftCell :view="view" :shift="shift('purple')" selected />
            <ShiftCell :view="view" :shift="shift('blue')" pending />
            <ShiftCell :view="view" drop-target />
            <ShiftCell :view="view" :shift="shift('mint')" error="Ошибка проверки на сервере" />
          </div>
        </div>
      </div>
      <p class="kit__note">
        Слева направо: пустая, выделенная, смены четырёх цветов, выделенная со сменой, несохранённая
        (точка), цель перетаскивания, ошибка.
      </p>
    </section>

    <section class="kit__section">
      <h2>Сотрудник и покрытие</h2>
      <div class="kit__line">
        <EmployeeCell name="Сергеев Олег" position="агент" hours="24 ч" style="width: 172px" />
        <CoverageCell :count="0" style="width: 86px" />
        <CoverageCell :count="3" style="width: 86px" />
      </div>
    </section>

    <section class="kit__section">
      <h2>Шаблоны и своя смена</h2>
      <div class="kit__grid kit__grid--3">
        <div class="kit__stack">
          <TemplateCard
            v-for="template in TEMPLATES"
            :key="template.id"
            :name="template.name"
            :details="template.details"
            :color="template.color"
            :count="template.count"
          />
        </div>
        <CustomShiftForm
          v-model:start="start"
          v-model:end="end"
          :error="validateRange(start, end)"
          hint="Конец раньше начала — смена через полночь"
        />
        <div class="kit__stack">
          <span ref="menuAnchor">
            <UiButton variant="secondary" :active="menuOpen" @click="menuOpen = !menuOpen">
              Меню быстрого назначения
            </UiButton>
          </span>
          <UiPopover v-model:open="menuOpen" :anchor="menuAnchor">
            <QuickAssignMenu
              :templates="TEMPLATES"
              custom-details="09:00 - 17:00 · 8 ч"
              clear-label="Очистить"
              @template="menuOpen = false"
              @custom="menuOpen = false"
              @clear="menuOpen = false"
            />
          </UiPopover>
        </div>
      </div>
    </section>

    <section class="kit__section">
      <h2>Панель выделения</h2>
      <SelectionBar :cells="6" :employees="2" :days="4" has-shifts />
      <SelectionBar :cells="1" :employees="1" :days="1" :has-shifts="false" />
    </section>
  </main>
</template>

<style scoped>
.kit {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.kit__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.kit__header h1 {
  font-size: var(--fs-title);
  font-weight: 500;
}

.kit__header a {
  color: var(--c-blue-text);
  font-size: var(--fs-sm);
}

.kit__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: var(--r-lg);
  background: var(--c-surface);
}

.kit__section h2 {
  font-size: 16px;
  font-weight: 600;
}

.kit__note,
.kit__caption {
  color: var(--c-text-2);
  font-size: var(--fs-xs);
}

.kit__table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kit__row {
  display: grid;
  grid-template-columns: 120px repeat(5, 130px);
  align-items: center;
  font-size: var(--fs-sm);
}

.kit__row--head {
  color: var(--c-text-2);
  font-size: var(--fs-xs);
}

.kit__row > span {
  padding: 6px 8px;
}

.kit__on-grey {
  border-radius: var(--r-md);
  background: var(--c-bg);
}

.kit__line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.kit__grid {
  display: grid;
  gap: 20px;
}

.kit__grid--2 {
  grid-template-columns: 1fr 1fr;
}

.kit__grid--3 {
  grid-template-columns: 239px 237px 1fr;
}

.kit__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.kit__cells {
  display: grid;
  grid-template-columns: repeat(5, 86px);
}

.kit__cells--month {
  grid-template-columns: repeat(5, 50px);
}

.kit__icon {
  display: inline-flex;
  padding: 8px;
  border-radius: var(--r-md);
  background: var(--c-bg);
}
</style>
