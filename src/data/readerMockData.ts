/**
 * Kite ILS - Reader Academic Mock Content
 * Authentic non-copyrighted university educational monographs & sample chapter texts.
 */

export interface ChapterOutline {
  id: string;
  number: number;
  title: string;
  startPage: number;
  endPage: number;
  sections: { title: string; page: number }[];
}

export interface PageContent {
  pageNumber: number;
  chapterNumber: number;
  chapterTitle: string;
  sectionTitle: string;
  content: {
    type: 'paragraph' | 'heading' | 'code' | 'callout' | 'theorem' | 'exercise';
    text?: string;
    code?: string;
    language?: string;
    label?: string;
  }[];
}

export const DATA_STRUCTURES_CHAPTERS: ChapterOutline[] = [
  {
    id: 'ch-1',
    number: 1,
    title: 'Foundations of Algorithm Analysis & Memory',
    startPage: 1,
    endPage: 28,
    sections: [
      { title: '1.1 Memory Allocation & Pointers in C', page: 1 },
      { title: '1.2 Asymptotic Notations: Big-O, Omega, and Theta', page: 10 },
      { title: '1.3 Recursive Stack Frames and Space Invariants', page: 19 },
    ],
  },
  {
    id: 'ch-2',
    number: 2,
    title: 'Linear Abstract Data Types: Stacks & Queues',
    startPage: 29,
    endPage: 56,
    sections: [
      { title: '2.1 Stack Operations: Push, Pop and Peek', page: 29 },
      { title: '2.2 Circular Queues & Ring Buffer Architectures', page: 40 },
      { title: '2.3 Infix to Postfix Expression Evaluation', page: 48 },
    ],
  },
  {
    id: 'ch-3',
    number: 3,
    title: 'Linked Representations & Dynamic Lists',
    startPage: 57,
    endPage: 79,
    sections: [
      { title: '3.1 Singly and Doubly Linked Structures', page: 57 },
      { title: '3.2 Circular Linked Lists & Memory Locality', page: 68 },
      { title: '3.3 Pointer Manipulation & Boundary Case Safety', page: 74 },
    ],
  },
  {
    id: 'ch-4',
    number: 4,
    title: 'Trees & Binary Search Hierarchies',
    startPage: 80,
    endPage: 135,
    sections: [
      { title: '4.1 Binary Tree Axioms & Traversal Algorithms', page: 80 },
      { title: '4.2 Binary Search Trees (BST) Insertion and Deletion', page: 84 },
      { title: '4.3 Self-Balancing AVL Trees & Rotations', page: 87 },
      { title: '4.4 Red-Black Trees & Multi-Way B-Trees', page: 108 },
    ],
  },
  {
    id: 'ch-5',
    number: 5,
    title: 'Graph Models, Spanning Trees & Shortest Paths',
    startPage: 136,
    endPage: 210,
    sections: [
      { title: '5.1 Adjacency Matrices vs Adjacency Lists', page: 136 },
      { title: '5.2 Depth-First and Breadth-First Searches', page: 154 },
      { title: '5.3 Dijkstra’s and Bellman-Ford Shortest Paths', page: 178 },
      { title: '5.4 Minimum Spanning Trees: Kruskal and Prim', page: 195 },
    ],
  },
  {
    id: 'ch-6',
    number: 6,
    title: 'Hashing Techniques & Collision Strategies',
    startPage: 211,
    endPage: 268,
    sections: [
      { title: '6.1 Hash Functions and Uniform Distribution', page: 211 },
      { title: '6.2 Open Addressing: Linear Probing & Double Hashing', page: 230 },
      { title: '6.3 Separate Chaining and Cuckoo Hashing', page: 248 },
    ],
  },
  {
    id: 'ch-7',
    number: 7,
    title: 'Advanced Heaps, Tries & String Indexing',
    startPage: 269,
    endPage: 318,
    sections: [
      { title: '7.1 Priority Queues and Binary Heaps', page: 269 },
      { title: '7.2 Radix Trees and Prefix Tries', page: 290 },
      { title: '7.3 Suffix Arrays and Burrows-Wheeler Transform', page: 304 },
    ],
  },
];

/**
 * Generate rich, realistic academic textbook pages for the reader
 */
export function getPageContent(pageNumber: number): PageContent {
  // Page 87 (The default canonical page for Data Structures Using C)
  if (pageNumber === 87) {
    return {
      pageNumber: 87,
      chapterNumber: 4,
      chapterTitle: 'Chapter 4: Trees & Binary Search Hierarchies',
      sectionTitle: '4.3 Self-Balancing AVL Trees & Rotations',
      content: [
        {
          type: 'heading',
          text: '4.3 Self-Balancing AVL Trees & Rotations',
        },
        {
          type: 'paragraph',
          text: 'In standard binary search trees, worst-case insertion sequences can degenerate the tree topology into a skewed linked list of height O(N), yielding search and insertion operations that degrade from logarithmic performance to O(N). To guarantee strict O(log N) boundaries for search, insertion, and deletion across arbitrary inputs, Georgy Adelson-Velsky and Evgenii Landis introduced the AVL tree in 1962.',
        },
        {
          type: 'theorem',
          label: 'Definition 4.4 (AVL Balance Condition)',
          text: 'An AVL tree is a binary search tree in which the balance factor of every internal node v satisfies: BalanceFactor(v) = height(v.left) - height(v.right) ∈ {-1, 0, +1}. The height of an empty subtree is conventionally defined as -1.',
        },
        {
          type: 'paragraph',
          text: 'When a new element is inserted into an AVL tree, the balance factors along the ancestor path from the inserted leaf back to the root must be re-evaluated. If the balance factor of any ancestor node deviates from the set {-1, 0, +1}, a restructuring rotation is required to restore balance invariant.',
        },
        {
          type: 'code',
          language: 'c',
          code: `typedef struct AVLNode {
    int key;
    int height;
    struct AVLNode *left;
    struct AVLNode *right;
} AVLNode;

int max(int a, int b) {
    return (a > b) ? a : b;
}

int getHeight(AVLNode *n) {
    if (n == NULL) return -1;
    return n->height;
}

int getBalanceFactor(AVLNode *n) {
    if (n == NULL) return 0;
    return getHeight(n->left) - getHeight(n->right);
}`,
        },
        {
          type: 'callout',
          label: 'Key Invariant Note',
          text: 'Rotations are local topological transformations that preserve the in-order binary search tree sequence (left < root < right) while strictly reducing the height of the deeper subtree by exactly one unit.',
        },
      ],
    };
  }

  // Page 88 (Next page demonstrating rotation types)
  if (pageNumber === 88) {
    return {
      pageNumber: 88,
      chapterNumber: 4,
      chapterTitle: 'Chapter 4: Trees & Binary Search Hierarchies',
      sectionTitle: '4.3.1 Single Left and Right Rotations',
      content: [
        {
          type: 'heading',
          text: '4.3.1 Single Left and Right Rotations',
        },
        {
          type: 'paragraph',
          text: 'Four fundamental imbalance scenarios arise following a node insertion or deletion. The two symmetric primary cases are resolved using single rotations: Left-Left (LL) imbalance and Right-Right (RR) imbalance.',
        },
        {
          type: 'paragraph',
          text: 'Consider an node A whose balance factor becomes +2 due to an insertion into the left subtree of its left child B. To restore balance, we execute a single Right Rotation centered at A. Child node B ascends to become the new root of the local subtree, while A becomes B’s right child. The right subtree of B (labeled T2) is re-attached as the left child of A.',
        },
        {
          type: 'code',
          language: 'c',
          code: `AVLNode* rotateRight(AVLNode *y) {
    AVLNode *x = y->left;
    AVLNode *T2 = x->right;

    // Perform rotation
    x->right = y;
    y->left = T2;

    // Update subtree heights
    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;

    // Return new subtree root
    return x;
}`,
        },
        {
          type: 'exercise',
          label: 'Self-Check Problem 4.12',
          text: 'Trace the sequence of rotations required when inserting keys [14, 17, 11, 7, 53, 4, 13] into an initially empty AVL tree. Identify which operation triggers a double rotation.',
        },
      ],
    };
  }

  // Page 86
  if (pageNumber === 86) {
    return {
      pageNumber: 86,
      chapterNumber: 4,
      chapterTitle: 'Chapter 4: Trees & Binary Search Hierarchies',
      sectionTitle: '4.2.3 Binary Search Tree Deletion Cases',
      content: [
        {
          type: 'heading',
          text: '4.2.3 Binary Search Tree Deletion Invariants',
        },
        {
          type: 'paragraph',
          text: 'Deleting a node z from a binary search tree requires addressing three distinct topological cases depending on the number of children z possesses in the pointer graph:',
        },
        {
          type: 'paragraph',
          text: 'Case 1: Node z is a leaf with no children. We simply update the parent pointer to NULL and free the allocated memory allocated for z.',
        },
        {
          type: 'paragraph',
          text: 'Case 2: Node z has exactly one child. We splice z out of the tree by connecting z’s parent directly to z’s sole child.',
        },
        {
          type: 'paragraph',
          text: 'Case 3: Node z has two children. We locate z’s in-order successor y (the minimum node in z’s right subtree), copy y’s satellite key data into z, and recursively delete y from the right subtree.',
        },
      ],
    };
  }

  // Generic dynamic page generator for any other page 1 to 318
  const chapter = DATA_STRUCTURES_CHAPTERS.find(
    (c) => pageNumber >= c.startPage && pageNumber <= c.endPage
  ) || DATA_STRUCTURES_CHAPTERS[0];

  const currentSection =
    [...chapter.sections].reverse().find((s) => pageNumber >= s.page) || chapter.sections[0];

  return {
    pageNumber,
    chapterNumber: chapter.number,
    chapterTitle: `Chapter ${chapter.number}: ${chapter.title}`,
    sectionTitle: currentSection.title,
    content: [
      {
        type: 'heading',
        text: currentSection.title,
      },
      {
        type: 'paragraph',
        text: `In computing systems, rigorous data organization dictates the efficiency of memory usage and runtime complexity. In this section of ${chapter.title}, we examine the algorithmic invariants and implementation trade-offs necessary for scalable software architectures.`,
      },
      {
        type: 'callout',
        label: 'Mathematical Foundation',
        text: `For an input collection of size N, the operations discussed on page ${pageNumber} maintain logarithmic or amortized linear bounds under continuous campus system throughput.`,
      },
      {
        type: 'paragraph',
        text: `When evaluating algorithms in practical applications, memory hierarchy considerations such as CPU cache lines (L1/L2) and virtual memory paging must be factored alongside Big-O asymptotic limits. Compact spatial representations minimize memory fragmentation.`,
      },
      {
        type: 'code',
        language: 'c',
        code: `// Academic Sample Implementation - Page ${pageNumber}
void processDataElement(const void *buffer, size_t elementSize, int (*comparator)(const void *, const void *)) {
    // Pointer offset calculation respecting memory boundary alignment
    const unsigned char *ptr = (const unsigned char *)buffer;
    for (size_t i = 0; i < elementSize; ++i) {
        // Validate internal state consistency
    }
}`,
      },
      {
        type: 'paragraph',
        text: 'Consult your faculty syllabus reading list for additional analytical problem sets and lab assignment specifications.',
      },
    ],
  };
}
