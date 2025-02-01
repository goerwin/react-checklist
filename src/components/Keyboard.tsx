import { ComponentProps } from 'react';
import { mergeProps, useLongPress, usePress } from 'react-aria';
import DeleteIcon from './icons/DeleteIcon';
import SelectIcon from './icons/SelectIcon';
import AddIcon from './icons/AddIcon';
import PriorityDownIcon from './icons/PriorityDownIcon';
import PriorityUpIcon from './icons/PriorityUpIcon';
import MinusIcon from './icons/MinusIcon';
import CheckmarkIcon from './icons/CheckmarkIcon';
import SaveIcon from './icons/SaveIcon';
import { cn } from '../utils/cn';

const keys = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['_shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '_backspace'],
  ['_numtoggle', '_space', '_toggle'],
  ['_save'],
  ['_delete', '_save', '_decrease', '_increase', '_priorityminus', '_priorityplus'],
] as const;

export type Key = (typeof keys)[number][number] | '_longpress_backspace' | '_select';

type Mode = 'normal' | 'edit';

function getEventValueKey(e: Partial<Event>) {
  if (!e.target || !('value' in e.target) || typeof e.target.value !== 'string') return;

  return e.target.value as Key;
}

export default function Keyboard(props: { mode?: Mode; onKeyClick?: (key: Key) => void }) {
  const { longPressProps } = useLongPress({
    onLongPress: (e) => {
      const pressedKey = getEventValueKey(e);

      if (pressedKey === '_backspace') props.onKeyClick?.('_longpress_backspace');
      if (pressedKey === '_toggle') props.onKeyClick?.('_select');
    },

    // {
    //   onStart: () => (stopClickEvent.current = false),
    //   onFinish: () => (stopClickEvent.current = true),
    // }
  });

  // function handleClickWithLongPress(key: Key) {
  // if (stopClickEvent.current) return;

  // handleKeyClick(key);
  // }

  const { pressProps } = usePress({
    onPress: (e) => {
      const key = getEventValueKey(e);

      if (!key) return;
      if (key === '_shift') return;
      if (key === '_numtoggle') return;

      props.onKeyClick?.(key);
    },
  });

  function handleKeyClick(key: Key) {
    if (key === '_shift') return;
    if (key === '_numtoggle') return;

    props.onKeyClick?.(key);
  }

  return (
    <div className="shrink-0 bg-[#2e2e2e] select-none pt-2">
      {/* keyboard area */}
      <div className="h-[293px] max-w-[500px] mx-auto">
        <div className="grid grid-cols-[repeat(10,37px)] h-[45px] gap-[5.7px] justify-center">
          {keys[0].map((key) => (
            <KeyboardKey value={key} onClick={() => handleKeyClick(key)} key={key}>
              {getKeyLabel(key)}
            </KeyboardKey>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(10,37px)] h-[45px] gap-[5.7px] justify-center mt-[11px]">
          {keys[1].map((key) => (
            <KeyboardKey value={key} onClick={() => handleKeyClick(key)} key={key}>
              {getKeyLabel(key)}
            </KeyboardKey>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_repeat(7_,37px)_1fr] h-[45px] gap-[5.7px] mt-[11px]">
          {keys[2].map((key) => {
            return (
              <KeyboardKey
                value={key}
                key={key}
                className={cn((key === '_backspace' || key === '_shift') && 'bg-[#494949]')}
                {...mergeProps(longPressProps, pressProps)}
              >
                {getKeyLabel(key)}
              </KeyboardKey>
            );
          })}
        </div>

        <div className="grid grid-cols-[1fr_2fr_1fr] h-[45px] gap-[5.7px] mt-[11px]">
          {keys[3].map((key) => (
            <KeyboardKey
              value={key}
              key={key}
              className={cn(key === '_toggle' && 'bg-green-700')}
              {...mergeProps(longPressProps, pressProps)}
            >
              {getKeyLabel(key)}
            </KeyboardKey>
          ))}
        </div>

        <div className="grid grid-cols-6 h-[45px] gap-[5.7px] mt-[11px]">
          {(props.mode === 'edit' ? keys[5] : keys[4]).map((key) => (
            <KeyboardKey
              value={key}
              onClick={() => handleKeyClick(key)}
              key={key}
              className={cn(key === '_delete' && 'bg-red-400', key === '_save' && 'bg-green-600')}
            >
              {getKeyLabel(key)}
            </KeyboardKey>
          ))}
        </div>
      </div>
    </div>
  );
}

function KeyboardKey(
  props: Omit<ComponentProps<'button'>, 'value'> & {
    value: Key;
  }
) {
  const { value, className, ...rest } = props;

  return (
    <button
      value={value}
      className={cn(
        'bg-[#6d6d6d] text-white rounded-md shadow-black shadow-2xs text-[22px]',
        className
      )}
      {...rest}
    />
  );
}

function getKeyLabel(key: Key) {
  // pointer-events-none so that long press returns the button event
  const iconSvgClassName = 'stroke-white h-[30px] mx-auto pointer-events-none';

  if (key === '_shift') return '⇧';
  if (key === '_backspace') return '⌫';
  if (key === '_numtoggle') return '123';
  if (key === '_space') return '␣';
  if (key === '_save') return <SaveIcon className={iconSvgClassName} />;
  if (key === '_toggle') return <CheckmarkIcon className={iconSvgClassName} />;
  if (key === '_decrease') return <MinusIcon className={iconSvgClassName} />;
  if (key === '_increase') return <AddIcon className={iconSvgClassName} />;
  if (key === '_delete') return <DeleteIcon className={iconSvgClassName} />;
  if (key === '_select') return <SelectIcon className={iconSvgClassName} />;
  if (key === '_priorityplus') return <PriorityUpIcon className={iconSvgClassName} />;
  if (key === '_priorityminus') return <PriorityDownIcon className={iconSvgClassName} />;

  return key;
}

/**
 * This is meant to be used by the consumer of the Keyboard component.
 * So that it can update the string being edited easily.
 */
// eslint-disable-next-line
export function getNewKeyboardString(curStr: string, key: Key) {
  if (!key.startsWith('_')) curStr = curStr.concat(key);

  if (key === '_backspace') curStr = curStr.slice(0, -1);
  if (key === '_space') curStr = curStr.concat(' ');

  return curStr.trimStart();
}
