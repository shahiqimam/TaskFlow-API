export const safeUserExample = {
  id: '7b6ec4e4-5b5b-4a51-a605-16f18a2be2aa',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  role: 'USER',
  createdAt: '2026-09-10T12:00:00.000Z',
  updatedAt: '2026-09-10T12:00:00.000Z',
};

export const authResponseExample = {
  user: safeUserExample,
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-signature',
};

export const projectExample = {
  id: '2f51b447-f674-45ea-a645-d3dfbf253890',
  name: 'Website Redesign',
  description: 'Refresh the public website.',
  ownerId: safeUserExample.id,
  createdAt: '2026-09-10T12:10:00.000Z',
  updatedAt: '2026-09-10T12:10:00.000Z',
};

export const projectMemberExample = {
  id: '13fd9b38-48d2-4c54-aa9f-3112737a5e7e',
  projectId: projectExample.id,
  userId: safeUserExample.id,
  memberRole: 'OWNER',
  createdAt: '2026-09-10T12:10:00.000Z',
};

export const taskExample = {
  id: '937b7068-6001-4df0-8953-b45983b82756',
  title: 'Draft API documentation',
  description: 'Add examples for authenticated requests.',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  projectId: projectExample.id,
  assigneeId: safeUserExample.id,
  createdById: safeUserExample.id,
  dueDate: '2026-09-20T17:00:00.000Z',
  createdAt: '2026-09-10T12:20:00.000Z',
  updatedAt: '2026-09-10T12:20:00.000Z',
};

export const paginatedTasksExample = {
  data: [taskExample],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

export const commentExample = {
  id: '8d25a55d-71d2-4524-bd76-a84ea76c7865',
  content: 'Endpoint list is ready for review.',
  taskId: taskExample.id,
  authorId: safeUserExample.id,
  createdAt: '2026-09-10T12:30:00.000Z',
  updatedAt: '2026-09-10T12:30:00.000Z',
};

export const projectStatsExample = {
  totalTasks: 20,
  todo: 5,
  inProgress: 7,
  inReview: 3,
  done: 5,
  completionPercentage: 25,
};

export const healthExample = {
  status: 'ok',
};
