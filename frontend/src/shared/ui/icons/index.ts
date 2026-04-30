import courseBookSvg from './assets/course-book.svg?raw';
import widgetIconSvg from './assets/widgets-ico.svg?raw';
import { createSvgIcon, SvgIcon } from './SvgIcon';

export { SvgIcon, createSvgIcon };

export const CourseBookIcon = createSvgIcon(courseBookSvg);
export const WidgetIcon = createSvgIcon(widgetIconSvg);
