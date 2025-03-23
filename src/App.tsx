import { useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { mergeProps, useLongPress, usePress } from 'react-aria';
import Keyboard, { getNewKeyboardString, type Key } from './components/Keyboard';
import { cn } from './utils/cn';

type Item = {
  id: string;
  name: string;
  completed?: boolean;
  quantity?: number;
  priority?: number;
};

const defaultItems: Item[] = [
  { id: '1', name: 'Arroz' },
  { id: '3', name: 'Leche' },
  { id: '4', name: 'Pan' },
  { id: '6', name: 'Azúcar' },
  { id: '7', name: 'Sal' },
  { id: '8', name: 'Aceite' },
  { id: '2', name: 'Huevos', priority: 2 },
];

const DEFAULT_QUANTITY = 1;
const DEFAULT_PRIORITY = 0;

/**
 * saves new item at first position and returns the new Items
 */
function saveNewItem(items: Item[], newItem: Item) {
  const newItems = items.filter((i) => i.id !== newItem.id);
  newItems.unshift({ ...newItem });
  return newItems;
}

export default function App() {
  const [items, setItems] = useLocalStorage('checklist_items', defaultItems);
  const [search, setSearch] = useState<{
    id?: string;
    search?: string;
    quantity?: number;
    priority?: number;
  }>();

  // filter and sort items by completed and priority
  const filteredItems = items.filter(filterBySearchFn(search?.search ?? '')).toSorted((a, b) => {
    const aPriority = a.priority ?? 0;
    const bPriority = b.priority ?? 0;
    const aCompleted = a.completed ?? false;
    const bCompleted = b.completed ?? false;

    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    if (aPriority < bPriority) return 1;
    if (aPriority > bPriority) return -1;

    return 0;
  });

  // highligh first item if search is active
  const highlightedFirstItem = search?.search ? filteredItems.at(0) : undefined;

  const editingItem = items.find((item) => item.id === search?.id);

  function handleKeyClick(key: Key) {
    const newSearchStr = getNewKeyboardString(search?.search ?? '', key);
    const newSearchTrimmedStr = newSearchStr.trim();

    // saving an item
    if (key === '_save') {
      if (!newSearchTrimmedStr) return setSearch(undefined);

      if (editingItem) {
        setItems((items) => saveNewItem(items, { ...editingItem, name: newSearchStr }));
        return setSearch(undefined);
      }

      const newItem: Item = { id: generateId(), name: newSearchStr };
      setItems((items) => [...items, newItem]);
      return setSearch({ ...newItem, search: newItem.name });
    }

    if (key === '_longpress_backspace') {
      if (editingItem) setSearch({ ...search, search: undefined });
      else setSearch(undefined);

      return;
    }

    if (key === '_toggle') {
      const activeItem = editingItem || highlightedFirstItem;

      if (!activeItem) return;

      if (!editingItem) setSearch(undefined);

      return setItems((items) =>
        saveNewItem(items, { ...activeItem, completed: !activeItem.completed })
      );
    }

    if (key === '_select') {
      if (editingItem && newSearchTrimmedStr)
        return setSearch({ ...search, id: undefined, priority: undefined, quantity: undefined });

      if (editingItem) return setSearch(undefined);

      if (!highlightedFirstItem) return;
      return setSearch({ ...highlightedFirstItem, search: highlightedFirstItem.name });
    }

    if (key === '_delete') {
      if (!editingItem) return;

      if (!window.confirm(`Delete ${editingItem.name}?`)) return;

      setSearch(undefined);
      return setItems((items) => items.filter((item) => item.id !== editingItem.id));
    }

    if (
      key === '_increase' ||
      key === '_decrease' ||
      key === '_priorityminus' ||
      key === '_priorityplus'
    ) {
      if (!editingItem) return;
      const additioner = key === '_increase' || key === '_priorityplus' ? 1 : -1;
      const defaultVal =
        key === '_increase' || key === '_decrease' ? DEFAULT_QUANTITY : DEFAULT_PRIORITY;
      const currentVal =
        key === '_increase' || key === '_decrease' ? editingItem.quantity : editingItem.priority;
      const qtOrPrKey = key === '_increase' || key === '_decrease' ? 'quantity' : 'priority';

      return setItems((items) =>
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                [qtOrPrKey]: Math.max(defaultVal, (currentVal ?? defaultVal) + additioner),
              }
            : item
        )
      );
    }

    if (editingItem && !newSearchStr) return setSearch({ ...search, search: newSearchStr });

    if (!newSearchStr) return setSearch(undefined);

    setSearch({ ...search, search: newSearchStr });
  }

  function handleItemClick(id: string) {
    const selectedItem = items.find((item) => item.id === id);

    if (!selectedItem) {
      return;
    }

    setItems((items) =>
      saveNewItem(items, { ...selectedItem, completed: !selectedItem.completed })
    );
  }

  function handleItemLongPress(id: string) {
    const item = items.find((item) => item.id === id);

    if (editingItem) return setSearch(undefined);

    setSearch(item && { ...item, search: item.name });
  }

  return (
    <div className="flex flex-col w-full h-full">
      <span className="text-sm text-center my-2 opacity-45">Version: {GLOBAL_APP_VERSION}</span>
      <div className="grow overflow-auto">
        {editingItem ? (
          <ItemView
            key={editingItem.id}
            item={editingItem}
            onClick={handleItemClick}
            onLongPress={handleItemLongPress}
            highlighted
          />
        ) : (
          filteredItems.map((item) => (
            <ItemView
              key={item.id}
              item={item}
              onClick={handleItemClick}
              onLongPress={handleItemLongPress}
              highlighted={highlightedFirstItem?.id === item.id}
            />
          ))
        )}
      </div>

      {search ? (
        <div className="text-2xl pl-2">
          <span>{editingItem ? 'Editing: ' : 'Searching: '}</span>
          <span>{search?.search}</span>
        </div>
      ) : null}

      <Keyboard onKeyClick={handleKeyClick} mode={search?.id ? 'edit' : 'normal'} />
    </div>
  );
}

function ItemView(props: {
  item: Item;
  highlighted?: boolean;
  onClick: (id: string) => void;
  onLongPress: (id: string) => void;
}) {
  const { longPressProps } = useLongPress({
    onLongPress: () => props.onLongPress(props.item.id),
  });

  const { pressProps } = usePress({
    onPress: () => props.onClick(props.item.id),
  });

  return (
    <button
      key={props.item.id}
      className={cn(
        'group select-none flex items-center mb-2',
        props.highlighted && 'bg-amber-900'
      )}
      {...mergeProps(longPressProps, pressProps)}
      // onClick={() => {
      //   if (!stopClickEvent.current) props.onClick(props.item.id);
      // }}
      // {...attrs}
    >
      <span
        className={cn(
          'ml-2 mr-2 inline-block w-8 h-8 border border-gray-400 rounded-full',
          props.item.completed && 'bg-green-400 border-0'
        )}
      >
        <svg
          className={cn('text-white hidden', props.item.completed && 'block')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>checkbox</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </span>

      {props.item.name}
      {props.item.quantity && props.item.quantity !== DEFAULT_QUANTITY
        ? ` (${props.item.quantity})`
        : null}
      {props.item.priority && props.item.priority !== DEFAULT_PRIORITY ? (
        <sub className="ml-1 opacity-50">{props.item.priority}</sub>
      ) : null}
    </button>
  );
}

function generateId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(5)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function filterBySearchFn(search: string) {
  return (item: Item) => item.name.toLowerCase().includes(search.toLowerCase());
}
