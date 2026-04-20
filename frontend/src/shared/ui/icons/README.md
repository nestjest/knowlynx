# SVG icons

Храни SVG-файлы в `assets/`.

Подключение новой иконки:

```ts
import myIconSvg from './assets/my-icon.svg?raw';
import { createSvgIcon } from './SvgIcon';

export const MyIcon = createSvgIcon(myIconSvg);
```

Использование:

```tsx
import { MyIcon } from '@/shared/ui/icons';

<MyIcon size={20} title="Моя иконка" />
```
