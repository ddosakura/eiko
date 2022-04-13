// deno-lint-ignore-file no-explicit-any

interface TaskKey {
  name: string;
}

export interface Task<Result = any> {
  key: TaskKey;
  p: Promise<Result>;
}

export class Pool {
  private running: Task[] = [];
  private waiting: TaskKey[] = [];
  private size: number;
  constructor(size: number) {
    this.size = size;
  }
  private async runTask<T>(
    key: TaskKey,
    payload: () => Promise<T>,
  ): Promise<T> {
    if (this.running.length < this.size) {
      const p = payload();
      const task = { key, p };
      this.running.push(task);
      this.waiting = this.waiting.filter((k) => k !== task.key);
      const result = await p;
      this.running = this.running.filter((t) => t !== task);
      return result;
    }
    await Promise.race(this.running.map((item) => item.p));
    return await this.runTask(key, payload);
  }
  getRunning() {
    return this.running.map((task) => task.key.name);
  }
  getWaiting() {
    return this.waiting.map((key) => key.name);
  }
  async run<T>(name: string, payload: () => Promise<T>): Promise<T> {
    const key = { name };
    this.waiting.push(key);
    const result = await this.runTask(key, payload);
    return result;
  }
}
