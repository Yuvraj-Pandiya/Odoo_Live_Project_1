import { useEffect, useRef, useState } from 'react';

interface TypewriterOptions {
  text: string;
  speed?: number;
  startDelay?: number;
}

interface TypewriterResult {
  displayed: string;
  done: boolean;
}

export function useTypewriter({ text, speed = 38, startDelay = 600 }: TypewriterOptions): TypewriterResult {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    setDone(false);

    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));

        if (indexRef.current >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(delayTimer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}
