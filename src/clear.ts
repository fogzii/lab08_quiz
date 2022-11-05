import { setData } from './dataStore';

export function clear() {
  const data = {
    quiz: [],
    idCount: 0,
  };

  setData(data);
  return { };
}
