import React, {useState} from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  getBoundingClientRect,
  MeasuringConfiguration,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import classNames from 'classnames';

import {State} from './constants';
import {Thumb} from './Thumb';
import {Track} from './Track';
import styles from './Switch.module.css';

export interface Props {
  accessibilityLabel?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const modifiers = [restrictToParentElement, restrictToHorizontalAxis];
const measuring: MeasuringConfiguration = {
  draggable: {
    measure: getBoundingClientRect,
  },
};

export function Switch({
  accessibilityLabel = '',
  label = '',
  disabled = false,
  id,
  checked,
  onChange,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [overId, setOverId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );

  const markup = (
    <>
      {label ? (
        <label className={styles.Label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <button
        id={id}
        type="button"
        className={classNames(styles.Switch, {
          [styles.checked]: checked,
          [styles.dragging]: overId != null,
          [styles.on]: overId === State.On,
          [styles.off]: overId === State.Off,
          [styles.disabled]: disabled,
        })}
        onClick={disabled || isDragging ? undefined : handleClick}
        aria-pressed={checked}
        aria-label={accessibilityLabel}
        disabled={disabled}
      >
        <Track />
        <Thumb />
      </button>
    </>
  );

  return disabled ? (
    markup
  ) : (
    <DndContext
      autoScroll={false}
      measuring={measuring}
      modifiers={modifiers}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {markup}
    </DndContext>
  );

  function handleClick() {
    onChange(!checked);
  }

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragOver({over}: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({over}: DragEndEvent) {
    if (over) {
      const checked = over.id === State.On;
      onChange(checked);
    }

    setOverId(null);
    requestAnimationFrame(() => setIsDragging(false));
  }

  function handleDragCancel() {
    setOverId(null);
    requestAnimationFrame(() => setIsDragging(false));
  }
}
