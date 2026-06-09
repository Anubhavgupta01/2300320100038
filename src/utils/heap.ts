import type { Notification } from '../types/Notification';

/**
 * Assigns weight priorities to notification types.
 * Placement -> 3 (Highest)
 * Result -> 2 (Medium)
 * Event -> 1 (Lowest)
 */
export function getWeight(type: string): number {
  switch (type) {
    case 'Placement':
      return 3;
    case 'Result':
      return 2;
    case 'Event':
      return 1;
    default:
      return 0;
  }
}

/**
 * Comparator to evaluate notification priority.
 * Returns negative if a is lower priority than b.
 * Returns positive if a is higher priority than b.
 * Returns 0 if equal.
 *
 * Rules:
 * 1. Priority (Weight) Descending
 * 2. Recency (Timestamp) Descending (newer timestamp is higher priority)
 */
export function compareNotifications(a: Notification, b: Notification): number {
  const weightA = getWeight(a.Type);
  const weightB = getWeight(b.Type);

  if (weightA !== weightB) {
    return weightA - weightB; // e.g. 1 - 3 = -2 (a < b)
  }

  const timeA = new Date(a.Timestamp).getTime();
  const timeB = new Date(b.Timestamp).getTime();

  // If time is invalid, fallback to string comparison
  const valA = isNaN(timeA) ? 0 : timeA;
  const valB = isNaN(timeB) ? 0 : timeB;

  return valA - valB; // e.g. earlier time - later time = negative (a < b)
}

/**
 * A standard Min-Heap implementation to track the Top-K elements (K=10).
 * Since it is a Min-Heap, the root (index 0) will always represent the
 * MINIMUM priority element in our top-K set.
 */
export class MinHeap {
  private heap: Notification[] = [];
  private compare: (a: Notification, b: Notification) => number;

  constructor(compareFn: (a: Notification, b: Notification) => number = compareNotifications) {
    this.compare = compareFn;
  }

  public size(): number {
    return this.heap.length;
  }

  public peek(): Notification | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  public push(val: Notification): void {
    this.heap.push(val);
    this.heapifyUp(this.heap.length - 1);
  }

  public pop(): Notification | null {
    if (this.heap.length === 0) return null;
    const root = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.heapifyDown(0);
    }
    return root;
  }

  private heapifyUp(index: number): void {
    let curr = index;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (this.compare(this.heap[curr], this.heap[parent]) < 0) {
        this.swap(curr, parent);
        curr = parent;
      } else {
        break;
      }
    }
  }

  private heapifyDown(index: number): void {
    let curr = index;
    const length = this.heap.length;
    while (true) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      let smallest = curr;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== curr) {
        this.swap(curr, smallest);
        curr = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Returns a copy of the heap's elements sorted in descending order (highest priority first).
   * Time complexity: O(K log K) where K is the size of the heap (K <= 10).
   */
  public toSortedArray(): Notification[] {
    const result: Notification[] = [];
    // Copy current heap array to avoid destroying internal state
    const tempHeap = new MinHeap(this.compare);
    tempHeap.heap = [...this.heap];

    while (tempHeap.size() > 0) {
      const el = tempHeap.pop();
      if (el) result.push(el);
    }
    // Popping from Min-Heap gives ascending order (lowest priority first),
    // so we reverse to get descending order (highest priority first).
    return result.reverse();
  }
}
