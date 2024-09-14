import IState from "./Editor";

class Node<T> {
  data: T;
  next: Node<T> | null;
  pre: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.pre = null;
  }
}

class LinkedList<T> {
  head: Node<T> | null;
  current: Node<T> | null;

  constructor() {
    this.head = null;
    this.current = null;
  }

  insert(data: T): void {
    const newNode = new Node<T>(data);
    if (this.head === null) {
      this.head = newNode;
      this.current = newNode;
    } else {
      let temp = this.head;
      while (temp.next !== null) {
        temp = temp.next;
      }
      temp.next = newNode;
      newNode.pre = temp;
      this.current = newNode;
    }
  }

  undoEdit(): T | null {
    const preNode = this.current?.pre;
    if (preNode) {
      this.current = preNode;
      return preNode.data;
    } else {
      return null;
    }
  }

  redoEdit(): T | typeof IState | null {
    const nextNode = this.current?.next;
    if (nextNode) {
      this.current = nextNode;
      return nextNode.data;
    } else {
      return null;
    }
  }
}

const storeData = new LinkedList<typeof IState | object>();

export default storeData;
