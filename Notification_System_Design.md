# Notification System Design - Stage 1

This document outlines the architecture, algorithmic strategy, and design choices implemented in Stage 1 of the AffordMed Campus Notifications Hub.

---

## 1. System Goals & Constraints
- **Goal**: Maintain the Top 10 highest-priority notifications.
- **Constraints**: No database, no backend sorting, high-performance client-side prioritizing.
- **Security & Logging**: All operations (app loading, fetching, heap sorting, state updates) must trigger bearer-authorized REST log updates.

---

## 2. Priority & Recency Strategy

### Priority Hierarchy
Each notification type is mapped to a designated priority weight:
- **Placement**: Weight `3` (Highest Priority)
- **Result**: Weight `2` (Medium Priority)
- **Event**: Weight `1` (Lowest Priority)
- *Unknown types fallback to weight `0`.*

### Recency Handling
When two notifications have identical priority weights:
- The **newest notification** (latest ISO timestamp) is prioritized over older notifications.
- Dates are converted to Unix epoch millisecond values (`new Date(timestamp).getTime()`) for comparison.

---

## 3. Top-10 Maintenance: Min-Heap Strategy

To filter the Top 10 notifications out of an arbitrary number of notifications $N$, we utilize a **Min-Heap** data structure of maximum size $K = 10$ rather than sorting the entire list.

### How the Min-Heap Strategy Works:
1. **Initialize** an empty Min-Heap.
2. **Iterate** through each notification in the input collection:
   - **Case A: Size < 10**: Insert the notification directly into the heap ($O(\log K)$).
   - **Case B: Size = 10**: Compare the current notification's priority with the heap's root (which is the *minimum* priority element among the top 10).
     - If the current notification has a *higher* priority (larger weight, or same weight and newer timestamp) than the root:
       - Pop the root out of the heap ($O(\log K)$).
       - Insert the current notification into the heap ($O(\log K)$).
     - Otherwise, discard the current notification (since it is lower priority than all current Top 10 candidates).
3. **Sort to Descending**: After parsing all $N$ elements, the heap contains the exact Top 10 items. We pop the elements one by one to obtain them in ascending order and reverse the final array to present a sorted descending order list (highest priority first).

### Why use a Min-Heap instead of a Full Sort?
A naive sorting approach sorts the entire array of $N$ elements. When $N$ becomes large, sorting becomes inefficient. The Min-Heap maintains a bounding constraint of size $K=10$ throughout the iteration, which dramatically optimizes runtime when processing stream feeds.

---

## 4. Complexity Analysis

| Metric | Full Array Sort ($N \log N$) | Min-Heap Top-K ($N \log K$) |
| :--- | :--- | :--- |
| **Time Complexity** | $O(N \log N)$ | **$O(N \log K)$** |
| **Space Complexity** | $O(N)$ | **$O(K)$** auxiliary space |

### Time Complexity
- **Heap Operations**: Inserting/deleting in a heap of size $K$ takes $O(\log K)$ operations.
- **Filtering**: We do this for all $N$ elements, resulting in $O(N \log K)$ operations.
- **Final Sorting**: Sorting the $K$ elements at the end takes $O(K \log K)$ operations.
- **Total Time**: $O(N \log K + K \log K)$. Since $K$ is small ($10$), $\log K \approx 3.32$, making this effectively linear $O(N)$ with respect to data size.

### Space Complexity
- The auxiliary storage used by the heap is strictly bounded to $O(K)$ elements.
- This is highly memory-efficient, requiring only $O(1)$ extra memory relative to $N$.
