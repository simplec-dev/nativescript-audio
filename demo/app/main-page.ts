import { AudioDemo } from './main-view-model';

export function onNavigatedTo(args) {
  const page = args.object;
  page.bindingContext = new AudioDemo(page);
}
