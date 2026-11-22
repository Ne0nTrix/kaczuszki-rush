const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');

export const params = {
  level: q.has('level') ? Math.max(1, Math.min(6, parseInt(q.get('level') || '1', 10) || 1)) : 0,
  debug: q.get('debug') === '1',
  mute: q.get('mute') === '1',
};
