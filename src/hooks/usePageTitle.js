import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    const baseTitle = 'Maths Solver';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);
}
