export interface deleteTask {
  id: string;
  expired: number;
}

const keyName = "1e55ee9367e20929b61c557638f23ad8";

function init() {
  const s = localStorage.getItem(keyName);
  let taskList: deleteTask[];
  if (s) {
    try {
      taskList = JSON.parse(s) as deleteTask[];
    } catch (_error) {
      taskList = [];
    }
  } else {
    taskList = [];
  }
  const taskMap = list2Map(taskList);
  return {
    taskList,
    taskMap,
  };
}

function list2Map(taskList: deleteTask[]): Map<string, deleteTask> {
  return new Map(
    taskList.map((task): [string, deleteTask] => [task.id, task]),
  );
}

function map2List(taskMap: Map<string, deleteTask>): deleteTask[] {
  return [...taskMap.values()];
}

function save(taskList: deleteTask[]) {
  localStorage.setItem(keyName, JSON.stringify(taskList));
}

export class deteleTaskList {
  static set(id: string, task: deleteTask) {
    const {
      taskMap,
    } = init();
    taskMap.set(id, task);
    const taskList = map2List(taskMap);
    save(taskList);
  }

  static delete(id: string) {
    const {
      taskMap,
    } = init();
    taskMap.delete(id);
    const taskList = map2List(taskMap);
    save(taskList);
  }

  static clear() {
    save([]);
  }

  static has(id: string): boolean {
    const { taskMap } = init();
    return taskMap.has(id);
  }

  static get(id: string): null | deleteTask {
    const { taskMap } = init();
    return taskMap.get(id) ?? null;
  }

  static getAll(): deleteTask[] {
    const { taskList } = init();
    return [...taskList];
  }
}
