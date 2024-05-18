import { useEffect, useRef, useState } from 'react';

/**
 * 使用钩子实现倒计时功能。
 * @param countdownNumber 倒计时的初始数字。
 * @param ms 每个计时周期的毫秒数，默认为1000毫秒。
 * @param onEnd 倒计时结束时的回调函数，默认为空函数。
 * @returns 一个数组，第一个元素为当前的倒计时数字，第二个元素为清除倒计时定时器的函数。
 */
const useCountdown = (countdownNumber: number, ms: number = 1000, onEnd: () => void = () => {}) => {
  const [count, setCount] = useState<number>(countdownNumber);
  // 使用 useRef 记录上一次执行的时间点
  const lastTime = useRef<number>();
  // 使用 useRef 记录下一次需要执行的时间点
  const nextTimeMs = useRef<number>(ms);

  const timer = useRef<number>();

  // 清除当前的定时器
  const clearTimer = () => {
    timer.current && clearInterval(timer.current);
  };

  // 开始倒计时
  const startCountdown = () => {
    const now = Date.now();
    // 计算实际执行时间
    const executionTime = now - lastTime.current;

    // 补上实际执行时间与预期时间的差值
    const diffTime = executionTime - nextTimeMs.current;

    // 更新下一次执行的时间点
    nextTimeMs.current = ms - diffTime;
    // 更新上一次执行时间点
    lastTime.current = now;

    // 更新倒计时数字
    setCount((prev) => {
      const nextCount = prev - 1;
      return nextCount > 0 ? nextCount : 0;
    });

    // 定时执行倒计时
    timer.current = setTimeout(startCountdown, nextTimeMs.current) as unknown as number;
  };

  // 在依赖改变时重置倒计时并启动
  useEffect(() => {
    clearTimer();
    setCount(countdownNumber);
    lastTime.current = Date.now();
    timer.current = setTimeout(startCountdown, ms) as unknown as number;

    return () => {
      clearTimer();
    };
  }, [countdownNumber]);

  // 当倒计时结束时，调用回调函数并清除定时器
  useEffect(() => {
    if (count <= 0) {
      clearTimer();
      onEnd();
    }
  }, [count]);

  return [count, clearTimer];
};

export default useCountdown;
