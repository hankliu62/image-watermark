import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

export default function useAudio(url: string): MutableRefObject<HTMLAudioElement> {
  const audioRef = useRef<HTMLAudioElement>();

  /**
   * 生成并配置一个循环播放但不自动播放的Audio对象。
   * 该函数不接受参数且无返回值。
   */
  function generateAudio() {
    // 创建一个新的Audio对象并存储到audioRef中
    audioRef.current = new Audio();
    // 设置Audio对象为不自动播放
    audioRef.current.autoplay = false;
    // 设置Audio对象为循环播放
    audioRef.current.loop = true;
  }

  useEffect(() => {
    generateAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      generateAudio();
    }

    audioRef.current.src = url;
  }, [url]);

  return audioRef;
}
