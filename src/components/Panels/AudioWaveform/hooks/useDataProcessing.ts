import { useCallback } from 'react';

export const useDataProcessing = () => {
  // 리샘플링 함수 (선형 보간)
  const resampleArray = useCallback(<T extends number | Uint8Array>(data: ArrayLike<T>, targetLength: number): T[] => {
    if (!data || data.length === 0 || targetLength <= 0) return [];
    if (targetLength === 1) return [data[0]];
    const result: T[] = [];
    const srcLength = data.length;
    for (let i = 0; i < targetLength; i++) {
      const srcIdx = (i / (targetLength - 1)) * (srcLength - 1);
      const left = Math.floor(srcIdx);
      const right = Math.ceil(srcIdx);
      if (left < 0 || right >= srcLength || data[left] === undefined || data[right] === undefined) {
        result.push(data[0]);
      } else if (left === right) {
        result.push(data[left]);
      } else {
        if (typeof data[left] === 'number') {
          const v = (data[left] as number) * (right - srcIdx) + (data[right] as number) * (srcIdx - left);
          result.push(v as T);
        } else {
          const lArr = data[left] as Uint8Array;
          const rArr = data[right] as Uint8Array;
          const arr = new Uint8Array(lArr.length);
          for (let j = 0; j < lArr.length; j++) {
            arr[j] = Math.round(lArr[j] * (right - srcIdx) + rArr[j] * (srcIdx - left));
          }
          result.push(arr as T);
        }
      }
    }
    return result;
  }, []);

  return { resampleArray };
};