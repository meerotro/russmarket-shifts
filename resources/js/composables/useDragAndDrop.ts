import { computed, ref } from 'vue';

import { type CellRef, keyOf } from '@/lib/cellKey';

/** What is being dragged: a template from the side panel, or a shift from a cell. */
export type DragPayload =
  { kind: 'template'; templateId: number } | { kind: 'shift'; cell: CellRef };

// One drag at a time for the whole page, so the state is shared by every caller. The browser
// does not expose dataTransfer contents during dragover, hence the payload is kept here.
const payload = ref<DragPayload | null>(null);
const overKey = ref<string | null>(null);

function wantsCopy(event: DragEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

/**
 * Native HTML5 drag-and-drop between the template panel and grid cells.
 * Sources call `start`/`end`; drop targets call `over`, `leave` and `drop`.
 */
export function useDragAndDrop() {
  function start(event: DragEvent, dragged: DragPayload): void {
    payload.value = dragged;
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = dragged.kind === 'template' ? 'copy' : 'copyMove';
    // Firefox starts a drag only when some data is set.
    event.dataTransfer.setData('text/plain', dragged.kind);
  }

  function over(event: DragEvent, cell: CellRef): void {
    if (!payload.value) return;
    event.preventDefault();
    overKey.value = keyOf(cell);
    if (event.dataTransfer) {
      const copy = payload.value.kind === 'template' || wantsCopy(event);
      event.dataTransfer.dropEffect = copy ? 'copy' : 'move';
    }
  }

  function leave(cell: CellRef): void {
    if (overKey.value === keyOf(cell)) overKey.value = null;
  }

  /** Finishes the drag and returns what was dropped, or null for a foreign drag. */
  function drop(event: DragEvent): { payload: DragPayload; copy: boolean } | null {
    event.preventDefault();
    const dropped = payload.value;
    end();
    return dropped ? { payload: dropped, copy: wantsCopy(event) } : null;
  }

  function end(): void {
    payload.value = null;
    overKey.value = null;
  }

  return {
    isDragging: computed(() => payload.value !== null),
    overKey: computed(() => overKey.value),
    start,
    over,
    leave,
    drop,
    end,
  };
}
