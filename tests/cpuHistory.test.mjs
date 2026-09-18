import test from 'node:test';
import assert from 'node:assert/strict';
import { getCpuHistoryManager, getServerId } from '../lib/cpuHistory.ts';

const history = getCpuHistoryManager();
test('out-of-order and duplicate samples remain strictly chronological', () => {
  history.clearHistory();
  const now = Date.now();
  for (const [offset, cpu] of [[0, 10], [-2000, 20], [-1000, 30], [0, 40]]) {
    history.addDataPoint('server', cpu, now + offset);
  }
  assert.deepEqual(history.getHistory('server', 1), [
    { timestamp: now - 2000, cpu: 20 },
    { timestamp: now - 1000, cpu: 30 },
    { timestamp: now, cpu: 40 },
  ]);
});
test('invalid CPU and timestamps cannot corrupt the chart', () => {
  history.clearHistory();
  for (const cpu of [NaN, Infinity, -1, 101]) history.addDataPoint('server', cpu);
  for (const time of [NaN, Infinity, 0, -1]) history.addDataPoint('server', 20, time);
  assert.deepEqual(history.getHistory('server', 5), []);
});
test('history is bounded and expires old samples', () => {
  history.clearHistory();
  const now = Date.now();
  history.addDataPoint('server', 10, now - 301000);
  for (let i = 0; i < 400; i++) history.addDataPoint('server', 20, now - 400 + i);
  assert.equal(history.getHistory('server', 5).length, 300);
  assert.equal(history.getHistory('server', 1).length, 60);
  history.clearServerHistory('server');
  assert.deepEqual(history.getHistory('server', 5), []);
});
test('server keys cannot collide through hyphen concatenation', () => {
  assert.notEqual(getServerId({ name: 'a-b', alias: 'c' }), getServerId({ name: 'a', alias: 'b-c' }));
  assert.equal(getServerId({ name: 'a', host: 'b' }), getServerId({ name: 'a', alias: 'b' }));
});
